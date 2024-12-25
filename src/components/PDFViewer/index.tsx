import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { PDFUploader } from './PDFUploader';
import { PDFControls } from './PDFControls';
import { PDFDocument } from './PDFDocument';
import { configurePDFWorker } from './config';

export const PDFViewer: React.FC = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { pdfFile, setPdfFile } = useStore();

  useEffect(() => {
    configurePDFWorker();
  }, []);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setPageNumber(1); // Reset to first page when new file is loaded
    }
  };

  const onPrevPage = () => setPageNumber(Math.max(1, pageNumber - 1));
  const onNextPage = () => setPageNumber(Math.min(numPages, pageNumber + 1));

  return (
    <div className="w-full h-full overflow-auto">
      {!pdfFile ? (
        <PDFUploader onFileChange={onFileChange} />
      ) : (
        <div className="flex flex-col items-center">
          <PDFDocument
            file={pdfFile}
            pageNumber={pageNumber}
            onLoadSuccess={setNumPages}
          />
          <PDFControls
            pageNumber={pageNumber}
            numPages={numPages}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
          />
        </div>
      )}
    </div>
  );
};