/**
 * @file DocumentList.tsx
 * @description A React component that displays a list of documents.
 *
 * @component
 * @param {object} props - The props for the component.
 * @param {Document[]} props.documents - An array of document objects to display.
 * @returns {JSX.Element} The rendered list of documents.
 */
import React from 'react';
import { Document } from '../types';
import styles from './DocumentList.module.css';

import ClientSideDateFormatter from './ClientSideDateFormatter';

interface DocumentListProps {
  documents: Document[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents = [] }) => {
  if (documents.length === 0) {
    return <p className={styles.emptyMessage}>No documents uploaded yet.</p>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Uploaded Documents</h2>
      <ul className={styles.list}>
        {documents.map((doc) => (
          <li key={doc.id} className={styles.listItem}>
            <span className={styles.filename}>{doc.filename}</span>
            <span className={styles.date}>
              <ClientSideDateFormatter dateString={doc.uploaded_at} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
