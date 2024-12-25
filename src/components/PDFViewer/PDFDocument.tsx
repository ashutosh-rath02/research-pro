import React from 'react';
import { Document, Page } from 'react-pdf';

interface PDFDocumentProps {
  file: File;
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({
  file,
  pageNumber,
  onLoadSuccess,
}) => {
  return (
    <Document
      file={file}
      onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
      className="max-w-full"
    >
      <Page 
        pageNumber={pageNumber}
        className="shadow-lg"
        renderTextLayer={true}
        renderAnnotationLayer={true}
      />
    </Document>
  );
};