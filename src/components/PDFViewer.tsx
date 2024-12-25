import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '../store/useStore';
import { FileUp } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export const PDFViewer: React.FC = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const { pdfFile, setPdfFile } = useStore();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      {!pdfFile ? (
        <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileUp className="w-12 h-12 mb-4 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
          <input type="file" className="hidden" accept=".pdf" onChange={onFileChange} />
        </label>
      ) : (
        <div className="flex flex-col items-center">
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            className="max-w-full"
          >
            <Page pageNumber={pageNumber} />
          </Document>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={pageNumber <= 1}
            >
              Previous
            </button>
            <span className="py-2">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};