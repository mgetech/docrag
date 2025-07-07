/**
 * @file QnA.tsx
 * @description A component for asking questions to the RAG system and displaying answers.
 */
import React, { useState, useEffect } from 'react';
import {
  askQuestion,
  getTaskStatus,
  ApiError
} from '../lib/api';
import {
  TaskState,
  TaskResult,
  RAGAnswer
} from '../types';
import styles from './QnA.module.css';

const QnA: React.FC = () => {
  // State for the user's input
  const [question, setQuestion] = useState('');
  // State to track the background task ID for polling
  const [taskId, setTaskId] = useState<string | null>(null);
  // State for the final result from the backend
  const [result, setResult] = useState<RAGAnswer | null>(null);
  // Loading state to provide user feedback
  const [isLoading, setIsLoading] = useState(false);
  // Error state to display issues to the user
  const [error, setError] = useState<string | null>(null);

  // This effect handles the polling logic.
  useEffect(() => {
    // We only start polling if we have a taskId and are in a loading state.
    if (!taskId || !isLoading) {
      return;
    }

    console.log(`Starting to poll for taskId: ${taskId}`);

    const intervalId = setInterval(async () => {
      try {
        const taskResult: TaskResult = await getTaskStatus(taskId);

        // Check if the task is complete
        if (taskResult.status === TaskState.Success) {
          console.log('Polling successful, task complete:', taskResult);
          setIsLoading(false);
          setTaskId(null); // Stop polling
          setResult(taskResult as RAGAnswer);
          clearInterval(intervalId);
        } else {
          // The task is still pending or processing, so we continue polling.
          console.log('Task still in progress...', taskResult);
        }
      } catch (err) {
        console.error('Error during polling:', err);
        setError('Failed to get the status of the task.');
        setIsLoading(false);
        setTaskId(null); // Stop polling
        clearInterval(intervalId);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup function: This is crucial to prevent memory leaks.
    // It runs when the component unmounts or when the dependencies (taskId, isLoading) change.
    return () => {
      console.log('Cleaning up polling interval.');
      clearInterval(intervalId);
    };
  }, [taskId, isLoading]); // Dependencies for the effect

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;

    console.log(`Submitting question: "${question}"`);

    // Reset previous state
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTaskId(null);

    try {
      const initialTask = await askQuestion(question);
      setTaskId(initialTask.task_id);
    } catch (err) {
      console.error('Failed to ask question:', err);
      if (err instanceof ApiError) {
        setError(`Error submitting question: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ask a Question</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className={styles.textarea}
          placeholder="Ask a question based on the uploaded documents..."
          rows={4}
          disabled={isLoading}
        />
        <button type="submit" className={styles.submitButton} disabled={isLoading || !question.trim()}>
          {isLoading ? 'Getting Answer...' : 'Ask'}
        </button>
      </form>

      {isLoading && <p className={styles.loading}>Processing your question, please wait...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.resultContainer}>
          <h3 className={styles.resultHeader}>Answer</h3>
          <div className={styles.qaSection}>
            <strong>Q:</strong>
            <p className={styles.resultQuestion}>{result.question}</p>
          </div>
          <div className={styles.qaSection}>
            <strong>A:</strong>
            <p className={styles.resultAnswer}>{result.answer}</p>
          </div>

          {result.retrieved_chunks && result.retrieved_chunks.length > 0 && (
            <div className={styles.chunksContainer}>
              <h4 className={styles.chunksHeader}>Sources</h4>
              <ul className={styles.chunksList}>
                {result.retrieved_chunks.map((chunk, index) => (
                  <li key={index} className={styles.chunk}>
                    {chunk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QnA;
