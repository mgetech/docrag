'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DocumentList from '../components/DocumentList';
import DocumentUpload from '../components/DocumentUpload';
import QnA from '../components/QnA';
import { getDocuments } from '../lib/api';
import { Document } from '../types';
import styles from './page.module.css';

const PAGE_SIZE = 5;

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async (page: number) => {
    try {
      console.log(`Fetching documents for page ${page}...`);
      setIsLoading(true);
      const { items, count } = await getDocuments(page, PAGE_SIZE);
      setDocuments(items);
      setTotalDocuments(count);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage, fetchDocuments]);

  const handleUploadSuccess = () => {
    // After a successful upload, go back to the first page to see the new doc.
    setCurrentPage(1);
    fetchDocuments(1);
  };

  const totalPages = Math.ceil(totalDocuments / PAGE_SIZE);

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
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
            {isLoading ? (
              <p>Loading documents...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <DocumentList
                documents={documents}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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