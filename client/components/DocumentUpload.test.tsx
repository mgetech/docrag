/**
 * @file DocumentUpload.test.tsx
 * @description Test suite for the DocumentUpload component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentUpload from './DocumentUpload';
import { Document } from '../types';

// Advanced mock: We mock the module, but restore the original ApiError class.
// This is crucial for `instanceof` checks and for the error message to be correct.
jest.mock('../lib/api', () => ({
  ...jest.requireActual('../lib/api'), // Import and retain all original exports
  uploadDocument: jest.fn(), // Specifically mock the uploadDocument function
}));

// We need to import the mocked api module *after* the mock is defined.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const api = require('../lib/api') as jest.Mocked<typeof import('../lib/api')>;

describe('DocumentUpload', () => {
  const mockOnUploadSuccess = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear mock history before each test
    mockOnUploadSuccess.mockClear();
    api.uploadDocument.mockClear();
  });

  it('renders the component correctly', () => {
    render(<DocumentUpload onUploadSuccess={mockOnUploadSuccess} />);
    expect(screen.getByText('Upload a New Document')).toBeInTheDocument();
    // The label now acts as our button, so we find it by its text.
    expect(screen.getByText(/choose file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeDisabled();
  });

  it('allows a user to select a file and enables the upload button', async () => {
    render(<DocumentUpload onUploadSuccess={mockOnUploadSuccess} />);
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });

    // userEvent.upload correctly handles finding and uploading to the hidden input via its label
    const fileInput = screen.getByLabelText(/choose file/i);
    await user.upload(fileInput, file);

    expect(await screen.findByText('Selected: hello.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeEnabled();
  });

  it('calls onUploadSuccess with the new document on successful upload', async () => {
    const mockDocument: Document = { id: '1', filename: 'test.pdf', uploaded_at: new Date().toISOString() };
    api.uploadDocument.mockResolvedValue(mockDocument);

    render(<DocumentUpload onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/choose file/i), file);

    await user.click(screen.getByRole('button', { name: /upload/i }));

    expect(await screen.findByText('Successfully uploaded "test.pdf"!')).toBeInTheDocument();
    expect(mockOnUploadSuccess).toHaveBeenCalledWith(mockDocument);
    expect(mockOnUploadSuccess).toHaveBeenCalledTimes(1);
  });

  it('displays an error message on failed upload', async () => {
    const errorMessage = 'Upload failed: Server error';
    // Spy on console.error to keep the test output clean from expected errors.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      // Now we can create a *real* ApiError instance
      api.uploadDocument.mockRejectedValue(new api.ApiError('Server error', 500));

      render(<DocumentUpload onUploadSuccess={mockOnUploadSuccess} />);

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      await user.upload(screen.getByLabelText(/choose file/i), file);

      await user.click(screen.getByRole('button', { name: /upload/i }));

      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    } finally {
      // Ensure the spy is restored even if the test fails.
      consoleErrorSpy.mockRestore();
    }
  });
});
