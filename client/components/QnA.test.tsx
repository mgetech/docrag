/**
 * @file QnA.test.tsx
 * @description Test suite for the QnA component.
 */
import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QnA from './QnA';
import { TaskState, RAGAnswer, TaskStatus } from '../types';

// Mock the API module
jest.mock('../lib/api', () => ({
  ...jest.requireActual('../lib/api'),
  askQuestion: jest.fn(),
  getTaskStatus: jest.fn(),
}));

// Import the mocked API after the mock is defined
// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require('../lib/api') as jest.Mocked<typeof import('../lib/api')>;

describe('QnA Component', () => {
  let setIntervalSpy: jest.SpyInstance;
  let clearIntervalSpy: jest.SpyInstance;
  let intervalCallback: () => void;

  beforeEach(() => {
    api.askQuestion.mockClear();
    api.getTaskStatus.mockClear();

    // Manually mock timers
    intervalCallback = () => {}; // Default to no-op
    setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation((callback) => {
      intervalCallback = callback as () => void;
      return 12345 as any; // Return a dummy timer ID
    });
    clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original timer functions
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('renders the initial state correctly', () => {
    render(<QnA />);
    expect(screen.getByText('Ask a Question')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask/i })).toBeDisabled();
  });

  it('enables the submit button when the user types a question', async () => {
    const user = userEvent.setup();
    render(<QnA />);
    const textarea = screen.getByPlaceholderText(/ask a question/i);
    await user.type(textarea, 'What is the meaning of life?');
    expect(screen.getByRole('button', { name: /ask/i })).toBeEnabled();
  });

  it('submits a question, polls for status, and displays the final answer', async () => {
    const user = userEvent.setup();
    const initialTask: TaskStatus = { task_id: 'task-123', status: TaskState.Pending, message: 'Processing' };
    const pendingTask: TaskStatus = { task_id: 'task-123', status: TaskState.Processing, message: 'Still processing' };
    const finalAnswer: RAGAnswer = {
      task_id: 'task-123',
      status: TaskState.Success,
      question: 'What is RAG?',
      answer: 'Retrieval-Augmented Generation.',
      retrieved_chunks: ['Source chunk 1'],
    };

    api.askQuestion.mockResolvedValue(initialTask);
    api.getTaskStatus.mockResolvedValueOnce(pendingTask).mockResolvedValueOnce(finalAnswer);

    render(<QnA />);

    await user.type(screen.getByPlaceholderText(/ask a question/i), 'What is RAG?');
    await user.click(screen.getByRole('button', { name: /ask/i }));

    // Wait for the loading state, which confirms the submit logic has started
    await screen.findByText(/processing your question/i);

    // Manually trigger the first poll
    await act(async () => {
      await intervalCallback();
    });
    expect(api.getTaskStatus).toHaveBeenCalledWith('task-123');

    // Manually trigger the second poll
    await act(async () => {
      await intervalCallback();
    });

    // Now wait for the final result to appear in the DOM
    expect(await screen.findByText('Retrieval-Augmented Generation.')).toBeInTheDocument();
    expect(screen.getByText('Source chunk 1')).toBeInTheDocument();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('displays an error message if asking a question fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    api.askQuestion.mockRejectedValue(new api.ApiError('Backend is down', 503));

    render(<QnA />);

    await user.type(screen.getByPlaceholderText(/ask a question/i), 'Will this fail?');
    await user.click(screen.getByRole('button', { name: /ask/i }));

    expect(await screen.findByText(/error submitting question: backend is down/i)).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('displays an error message if polling fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const initialTask: TaskStatus = { task_id: 'task-456', status: TaskState.Pending, message: 'Processing' };
    api.askQuestion.mockResolvedValue(initialTask);
    api.getTaskStatus.mockRejectedValue(new api.ApiError('Polling failed', 500));

    render(<QnA />);

    await user.type(screen.getByPlaceholderText(/ask a question/i), 'Will polling fail?');
    await user.click(screen.getByRole('button', { name: /ask/i }));

    // Wait for the loading state, which confirms the submit logic has started
    await screen.findByText(/processing your question/i);

    // Manually trigger the poll that will fail
    await act(async () => {
      await intervalCallback();
    });

    expect(await screen.findByText(/failed to get the status of the task/i)).toBeInTheDocument();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});
