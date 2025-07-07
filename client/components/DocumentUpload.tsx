/**
 * @file DocumentUpload.tsx
 * @description A component for uploading documents to the server.
 */
import React, { useState, useRef } from 'react';
import { uploadDocument } from '../lib/api';
import { ApiError } from '../lib/api';
import styles from './DocumentUpload.module.css';

/**
 * Props for the DocumentUpload component.
 */
interface DocumentUploadProps {
  /**
   * A callback function that is invoked when a document is successfully uploaded.
   * It receives the newly uploaded document as an argument.
   */
  onUploadSuccess: (newDocument: Document) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // A ref to the hidden file input element.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newDocument = await uploadDocument(selectedFile);
      setSuccessMessage(`Successfully uploaded "${newDocument.filename}"!`);
      onUploadSuccess(newDocument);
      setSelectedFile(null); // Clear the selection after successful upload
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upload a New Document</h2>

      {/* 
        This is an accessible pattern for custom file upload buttons.
        The input is visually hidden but still accessible to screen readers.
        The label is styled to look like a button.
      */}
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {/* This label is linked to the input and acts as the custom button */}
      <label htmlFor="file-upload" className={styles.selectButton}>
        Choose File
      </label>

      {selectedFile && (
        <p className={styles.fileName}>Selected: {selectedFile.name}</p>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={styles.uploadButton}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
    </div>
  );
};

export default DocumentUpload;
