// client/lib/api.test.ts

/**
 * This file contains tests for our API layer.
 * We use Jest to run the tests and mock the global `fetch` function.
 * Mocking `fetch` is a crucial technique for testing API layers.
 * It allows us to simulate network requests without actually sending them,
 * making our tests fast, reliable, and independent of the backend.
 */

import { getDocuments, uploadDocument, askQuestion, getTaskStatus } from './api';
import { Document, TaskStatus, RAGAnswer } from '../types';

// Before each test, we clear all previous mocks to ensure a clean state.
// This prevents tests from interfering with each other.
beforeEach(() => {
  // Clears any previous mock implementation of fetch.
  (global.fetch as jest.Mock).mockClear();
});

// We mock the global `fetch` function for all tests in this file.
// This gives us complete control over the simulated API responses.
global.fetch = jest.fn();

describe('API Layer Tests', () => {

  // Test suite for the getDocuments function
  describe('getDocuments', () => {
    it('should fetch documents successfully', async () => {
      // Arrange: Define the mock data we expect from the API.
      const mockDocuments: Document[] = [
        { id: '1', filename: 'doc1.pdf', uploaded_at: new Date().toISOString() },
        { id: '2', filename: 'doc2.txt', uploaded_at: new Date().toISOString() },
      ];
      // Arrange: Configure our mock `fetch` to return a successful response.
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockDocuments }), // The API returns data in a 'results' property
      });

      // Act: Call the function we are testing.
      const documents = await getDocuments();

      // Assert: Check if the function behaved as expected.
      expect(documents).toEqual(mockDocuments);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/documents'));
    });

    it('should throw an error if the fetch fails', async () => {
      // Arrange: Configure `fetch` to simulate a network error.
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

      // Act & Assert: We expect the function to throw an error.
      // The `rejects` matcher is used for testing asynchronous code that should fail.
      await expect(getDocuments()).rejects.toThrow('Failed to fetch documents');
    });
  });

  // Test suite for the uploadDocument function
  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse: Document = { id: '3', filename: 'test.pdf', uploaded_at: new Date().toISOString() };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await uploadDocument(mockFile);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/upload'), {
        method: 'POST',
        body: expect.any(FormData), // We check that the body is FormData, not the exact content.
      });
    });
  });

  // Test suite for the askQuestion function
  describe('askQuestion', () => {
    it('should submit a question and return a task status', async () => {
      const mockQuestion = 'What is RAG?';
      const mockTaskStatus: TaskStatus = { task_id: 'task-123', status: 'processing', message: 'Processing...' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTaskStatus,
      });

      const result = await askQuestion(mockQuestion);

      expect(result).toEqual(mockTaskStatus);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: mockQuestion }),
      });
    });
  });

  // Test suite for the getTaskStatus function
  describe('getTaskStatus', () => {
    it('should fetch the status of a task', async () => {
      const mockTaskId = 'task-123';
      const mockRAGAnswer: RAGAnswer = { 
        question: 'What is RAG?', 
        answer: 'It is a technique...', 
        retrieved_chunks: ['chunk1'] 
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRAGAnswer,
      });

      const result = await getTaskStatus(mockTaskId);

      expect(result).toEqual(mockRAGAnswer);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining(`/api/task_status/${mockTaskId}`));
    });
  });
});
