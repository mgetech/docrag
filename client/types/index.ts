// client/types/index.ts

/**
 * This file defines the TypeScript types for our application.
 * These types are crafted to be precise and expressive, which is a hallmark of enterprise-grade code.
 * Using features like enums and discriminated unions prevents common bugs and improves code clarity.
 */

/**
 * Defines the possible states of an asynchronous task.
 * Using an enum instead of raw strings prevents typos and centralizes the state definitions.
 */
export enum TaskState {
  Pending = 'pending',
  Processing = 'processing',
  Success = 'SUCCESS', // Matches the backend status for a completed task
  Failure = 'FAILURE', // Assuming the backend might return this on error
}

/**
 * Represents a single document as returned by the GET /api/documents endpoint.
 */
export interface Document {
  id: string;
  filename: string;
  uploaded_at: string;
}

/**
 * Represents the status of an asynchronous task that is still in progress.
 */
export interface TaskStatus {
  task_id: string;
  status: TaskState.Pending | TaskState.Processing;
  message: string;
}

/**
 * Represents the final, successful result from the RAG system.
 */
export interface RAGAnswer {
  task_id: string;
  status: TaskState.Success;
  question: string;
  answer: string;
  retrieved_chunks: string[];
}

/**
 * Represents a paginated response for documents from the API.
 */
export interface PaginatedDocuments {
  items: Document[];
  count: number;
}

/**
 * A discriminated union for the result of a task.
 * The 'status' property acts as the discriminant.
 * This allows TypeScript to intelligently narrow down the type,
 * so if `result.status === TaskState.Success`, TypeScript knows it's a `RAGAnswer`.
 */
export type TaskResult = TaskStatus | RAGAnswer;
