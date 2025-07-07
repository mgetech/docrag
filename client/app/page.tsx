'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DocumentList from '../components/DocumentList';
import DocumentUpload from '../components/DocumentUpload';
import QnA from '../components/QnA';
import { getDocuments } from '../lib/api';
import { Document } from '../types';
import styles from './page.module.css';

/**
 * @file page.tsx
 * @description The main page of the DocRAG application.
 * This component assembles the main UI and manages the primary state.
 */

/**
 * The main application page.
 * @returns {JSX.Element} The rendered main page.
 */
export default function Home(): JSX.Element {
  // State to hold the list of documents
  const [documents, setDocuments] = useState<Document[]>([]);
  // State to handle loading indicators
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to handle errors during document fetching
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the list of documents from the API and updates the state.
   * useCallback is used to memoize the function, preventing unnecessary re-renders.
   */
  const fetchDocuments = useCallback(async () => {
    try {
      console.log('Fetching documents...');
      setIsLoading(true);
      const fetchedDocuments = await getDocuments();
      setDocuments(fetchedDocuments);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch documents when the component mounts
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>DocRAG</h1>
          <p className={styles.description}>
            Upload your documents and ask questions.
          </p>
        </header>

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <DocumentUpload onUploadSuccess={fetchDocuments} />
            {isLoading ? (
              <p>Loading documents...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <DocumentList documents={documents} />
            )}
          </div>
          <div className={styles.rightColumn}>
            <QnA />
          </div>
        </div>
      </div>
    </main>
  );
}