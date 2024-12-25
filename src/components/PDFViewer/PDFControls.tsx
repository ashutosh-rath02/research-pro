import React from 'react';

interface PDFControlsProps {
  pageNumber: number;
  numPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const PDFControls: React.FC<PDFControlsProps> = ({
  pageNumber,
  numPages,
  onPrevPage,
  onNextPage,
}) => {
  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={onPrevPage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={pageNumber <= 1}
      >
        Previous
      </button>
      <span className="py-2">
        Page {pageNumber} of {numPages}
      </span>
      <button
        onClick={onNextPage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={pageNumber >= numPages}
      >
        Next
      </button>
    </div>
  );
};