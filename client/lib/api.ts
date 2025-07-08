// client/lib/api.ts

/**
 * This file serves as the API layer for our application.
 * It uses a configured Axios instance for robust, enterprise-grade HTTP requests.
 * Key features:
 *  - Centralized Configuration: Base URL and headers are set in one place.
 *  - Automatic Error Handling: Axios rejects promises on non-2xx status codes.
 *  - Custom Error Type: A custom ApiError class provides detailed error information to the UI.
 *  - Strict Environment Validation: The app fails fast if the API URL is not configured.
 */

import axios, { AxiosInstance, isAxiosError } from 'axios';
import { Document, TaskStatus, RAGAnswer, TaskResult, PaginatedDocuments } from '../types';

// --- Custom Error Class ---

/**
 * A custom error class for API-related errors.
 * This allows us to capture the status code and backend message for better UI feedback.
 */
export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Axios Instance Configuration ---

const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    // Fail-fast: In a real application, we want to know immediately if config is missing.
    throw new Error('NEXT_PUBLIC_API_URL is not defined. Please check your .env.local file.');
  }
  return url;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`API client configured with base URL: ${getApiBaseUrl()}`);

// --- API Functions ---

/**
 * A generic error handler for our API calls.
 * It checks for Axios-specific errors and wraps them in our custom ApiError.
 * @param error - The error object caught in the try-catch block.
 * @param context - A string describing the context of the API call (e.g., 'fetching documents').
 */
const handleError = (error: unknown, context: string): never => {
  console.error(`Error ${context}:`, error);
  if (isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || `Failed to ${context}`;
    throw new ApiError(message, status, error.response?.data);
  }
  throw new ApiError(`An unexpected error occurred while ${context}`, 500, error);
};

/**
 * Fetches a paginated list of uploaded documents from the backend.
 * @param page - The page number to fetch.
 * @param pageSize - The number of documents per page.
 */
export const getDocuments = async (page: number, pageSize: number): Promise<PaginatedDocuments> => {
  try {
    const response = await apiClient.get<PaginatedDocuments>('/api/documents', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  } catch (error) {
    handleError(error, 'fetching documents');
  }
};

/**
 * Uploads a new document to the backend by reading its content as a string.
 * @param file The file to be uploaded.
 * @returns A promise that resolves to the newly created Document object.
 * @throws {ApiError} If the upload fails.
 */
export const uploadDocument = (file: File): Promise<Document> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const content = event.target.result;
        const payload = {
          filename: file.name,
          content: content,
        };

        try {
          const response = await apiClient.post<Document>('/api/upload', payload);
          resolve(response.data);
        } catch (error) {
          // Use a type assertion to satisfy TypeScript's `unknown` type
          const apiError = error as ApiError;
          handleError(apiError, 'uploading document');
          reject(apiError);
        }
      } else {
        const error = new Error('Failed to read file content.');
        handleError(error, 'reading file');
        reject(error);
      }
    };

    reader.onerror = (error) => {
      handleError(error, 'reading file');
      reject(error);
    };

    reader.readAsText(file);
  });
};

/**
 * Submits a question to the RAG system.
 * @param question The user's question.
 * @returns A promise that resolves to a TaskStatus object, which includes the task ID.
 * @throws {ApiError} If the request fails.
 */
export const askQuestion = async (question: string): Promise<TaskStatus> => {
  try {
    const response = await apiClient.post<TaskStatus>('/api/ask', { question });
    return response.data;
  } catch (error) {
    handleError(error, 'asking question');
  }
};

/**
 * Fetches the status of a specific task from the backend.
 * This is used for polling the result of the 'ask' operation.
 * @param taskId The ID of the task to check.
 * @returns A promise that resolves to a TaskResult, which can be either a TaskStatus or a RAGAnswer.
 * @throws {ApiError} If the request fails.
 */
export const getTaskStatus = async (taskId: string): Promise<TaskResult> => {
  try {
    const response = await apiClient.get<TaskResult>(`/api/task_status/${taskId}`);
    return response.data;
  } catch (error) {
    handleError(error, `getting task status for ${taskId}`);
  }
};