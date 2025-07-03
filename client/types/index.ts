// client/types/index.ts

/**
 * This file defines the TypeScript types for our application.
 * These types match the data structures returned by the backend API,
 * ensuring that our frontend code knows what kind of data to expect.
 * This practice, known as type safety, helps catch bugs early.
 */

// Represents a single document as returned by the GET /api/documents endpoint.
export interface Document {
  id: string; // The unique identifier for the document.
  filename: string; // The name of the uploaded file.
  uploaded_at: string; // The timestamp when the document was uploaded (ISO 8601 format).
}

// Represents the status of an asynchronous task, like asking a question.
// This is returned by POST /api/ask and GET /api/task_status/{task_id} while processing.
export interface TaskStatus {
  task_id: string; // The ID for the background task.
  status: 'pending' | 'processing' | 'SUCCESS'; // The current status of the task.
  message: string; // A user-friendly message about the status.
}

// Represents the final answer from the RAG system once the task is complete.
// This is returned by GET /api/task_status/{task_id} when the result is ready.
export interface RAGAnswer {
  question: string; // The original question that was asked.
  answer: string; // The AI-generated answer.
  retrieved_chunks: string[]; // The pieces of text from documents used to generate the answer.
}
