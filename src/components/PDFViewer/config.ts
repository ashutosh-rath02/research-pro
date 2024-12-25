import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
export const configurePDFWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
};