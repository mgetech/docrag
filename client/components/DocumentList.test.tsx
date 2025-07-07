/**
 * @file DocumentList.test.tsx
 * @description Test suite for the DocumentList component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentList from './DocumentList';
import { Document } from '../types';

describe('DocumentList', () => {
  it('should render a message when there are no documents', () => {
    render(<DocumentList documents={[]} />);
    expect(screen.getByText('No documents uploaded yet.')).toBeInTheDocument();
  });

  it('should render a list of documents', () => {
    const mockDocuments: Document[] = [
      {
        id: '1',
        filename: 'document1.pdf',
        uploaded_at: '2025-07-04T10:00:00Z',
      },
      {
        id: '2',
        filename: 'document2.txt',
        uploaded_at: '2025-07-04T11:00:00Z',
      },
    ];

    render(<DocumentList documents={mockDocuments} />);

    expect(screen.getByText('document1.pdf')).toBeInTheDocument();
    expect(screen.getByText('document2.txt')).toBeInTheDocument();
  });
});
