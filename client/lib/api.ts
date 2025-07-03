// client/lib/api.ts

/**
 * This file serves as the API layer for our application.
 * It centralizes all the logic for making requests to the backend API.
 * This is a best practice because it separates data-fetching concerns
 * from our UI components, making the code cleaner and easier to maintain.
 */

import { Document, TaskStatus, RAGAnswer } from '../types';

// The base URL of our Django backend.
// We use an environment variable for this to make it configurable.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log(`API Base URL is set to: ${API_BASE_URL}`);

/**
 * Fetches the list of all uploaded documents from the backend.
 * @returns A promise that resolves to an array of Document objects.
 */
export const getDocuments = async (): Promise<Document[]> => {
  console.log('Fetching documents...');
  const response = await fetch(`${API_BASE_URL}/api/documents`);
  if (!response.ok) {
    console.error('Failed to fetch documents', response);
    throw new Error('Failed to fetch documents');
  }
  const data = await response.json();
  console.log('Successfully fetched documents:', data.results);
  // The backend uses pagination, so the documents are in the 'results' field.
  return data.results;
};

/**
 * Uploads a new document to the backend.
 * @param file - The file object to be uploaded.
 * @returns A promise that resolves to the newly created Document object.
 */
export const uploadDocument = async (file: File): Promise<Document> => {
  console.log(`Uploading document: ${file.name}`);
  
  // We use FormData to send the file content in the request body.
  const formData = new FormData();
  formData.append('file', file); // The backend expects the file under the 'file' key.

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    console.error('Failed to upload document', response);
    throw new Error('Failed to upload document');
  }
  
  const newDocument = await response.json();
  console.log('Successfully uploaded document:', newDocument);
  return newDocument;
};

/**
 * Submits a question to the RAG system.
 * @param question - The user's question as a string.
 * @returns A promise that resolves to a TaskStatus object, containing the task_id.
 */
export const askQuestion = async (question: string): Promise<TaskStatus> => {
  console.log(`Asking question: "${question}"`);
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    console.error('Failed to ask question', response);
    throw new Error('Failed to ask question');
  }

  const taskStatus = await response.json();
  console.log('Successfully started question task:', taskStatus);
  return taskStatus;
};

/**
 * Fetches the status of a specific task from the backend.
 * This is used for polling the result of the 'ask' operation.
 * @param taskId - The ID of the task to check.
 * @returns A promise that resolves to either a TaskStatus or a RAGAnswer object.
 */
export const getTaskStatus = async (taskId: string): Promise<TaskStatus | RAGAnswer> => {
  console.log(`Checking task status for task_id: ${taskId}`);
  const response = await fetch(`${API_BASE_URL}/api/task_status/${taskId}`);
  
  if (!response.ok) {
    console.error(`Failed to get task status for ${taskId}`, response);
    throw new Error('Failed to get task status');
  }

  const result = await response.json();
  console.log('Successfully fetched task status:', result);
  return result;
};
