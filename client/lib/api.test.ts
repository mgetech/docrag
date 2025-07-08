// client/lib/api.test.ts

/**
 * This file contains tests for our enhanced API layer.
 * It uses a manual mock for the 'axios' library to gain full control over the testing environment.
 * This is a robust pattern for handling complex dependencies and module loading order issues.
 */

import axios, { isAxiosError } from 'axios';
import { getDocuments, uploadDocument, askQuestion, getTaskStatus, ApiError } from './api';
import { Document, TaskState, RAGAnswer, TaskStatus } from '../types';

// --- Manual Axios Mock ---
// This is the definitive solution to the module loading order problem.
// We mock the module by providing a factory function that returns a custom object.
// This object mimics the structure of the actual axios library.
jest.mock('axios', () => {
  // The mock object that will be treated as the `axios` module.
  const mockAxios = {
    // We define the methods we use (get, post) as mock functions.
    get: jest.fn(),
    post: jest.fn(),
    // `create` is a function that returns the mock object itself.
    // This allows `axios.create()` to return a usable mock instance.
    create: jest.fn(function () { return this; }),
  };
  return {
    __esModule: true, // Important for ES Module compatibility
    isAxiosError: jest.fn((payload): payload is any => !!payload.isAxiosError),
    // The default export is our main mock object.
    default: mockAxios,
  };
});

// Get a typed reference to the mocked axios object for type-safe testing.
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Layer (Manual Mock Implementation)', () => {

  // Before each test, clear the history of mock calls to ensure test isolation.
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    (isAxiosError as jest.Mock).mockClear();
  });

  describe('getDocuments', () => {
    it('should return documents on a successful request', async () => {
      const mockDocuments: Document[] = [{ id: '1', filename: 'test.pdf', uploaded_at: '2024-01-01T00:00:00Z' }];
      mockedAxios.get.mockResolvedValue({ data: { results: mockDocuments } });

      const documents = await getDocuments();

      expect(documents).toEqual(mockDocuments);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/documents');
    });

    it('should throw an ApiError on a failed request', async () => {
      // Arrange: Silence the expected console.error log for this specific test.
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const mockError = {
        isAxiosError: true,
        response: { status: 404, data: { detail: 'Not found' } },
      };
      (isAxiosError as jest.Mock).mockReturnValue(true);
      (mockedAxios.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(getDocuments()).rejects.toThrow(ApiError);
      await expect(getDocuments()).rejects.toMatchObject({ status: 404, message: 'Not found' });

      // Clean up the spy to restore the original console.error function.
      consoleErrorSpy.mockRestore();
    });
  });

  describe('uploadDocument', () => {
    it('should return the new document on successful upload', async () => {
      const mockFile = new File(['content'], 'new.pdf');
      const mockDocument: Document = { id: '2', filename: 'new.pdf', uploaded_at: '2024-01-01T00:00:00Z' };
      mockedAxios.post.mockResolvedValue({ data: mockDocument });

      const result = await uploadDocument(mockFile);

      expect(result).toEqual(mockDocument);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/upload', { filename: 'new.pdf', content: 'content' });
    });
  });

  describe('askQuestion', () => {
    it('should return a task status on a successful request', async () => {
      const mockQuestion = 'Test question';
      const mockTask: TaskStatus = { task_id: 'task-1', status: TaskState.Processing, message: 'In progress' };
      mockedAxios.post.mockResolvedValue({ data: mockTask });

      const result = await askQuestion(mockQuestion);

      expect(result).toEqual(mockTask);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/ask', { question: mockQuestion });
    });
  });

  describe('getTaskStatus', () => {
    it('should return a RAGAnswer when the task is complete', async () => {
      const mockTaskId = 'task-1';
      const mockAnswer: RAGAnswer = {
        task_id: mockTaskId,
        status: TaskState.Success,
        question: 'Is it working?',
        answer: 'Yes!',
        retrieved_chunks: [],
      };
      mockedAxios.get.mockResolvedValue({ data: mockAnswer });

      const result = await getTaskStatus(mockTaskId);

      expect(result).toEqual(mockAnswer);
      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/task_status/${mockTaskId}`);
    });
  });
});