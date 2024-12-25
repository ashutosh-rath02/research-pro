import React from 'react';
import { FileUp } from 'lucide-react';

interface PDFUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileChange }) => {
  return (
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
  );
};