import React from 'react';
import { useStore } from '../../store/useStore';
import { Download, Upload, Trash2 } from 'lucide-react';

export const ProfilePanel: React.FC = () => {
  const { savedPDFs, exportData, importData, deletePDF } = useStore();

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pdf-notes-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const data = JSON.parse(content);
          await importData(data);
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold mb-4">Saved PDFs</h2>
        <div className="space-y-3">
          {savedPDFs.map((pdf) => (
            <div key={pdf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="truncate flex-1">{pdf.name}</span>
              <button
                onClick={() => deletePDF(pdf.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {savedPDFs.length === 0 && (
            <p className="text-gray-500">No PDFs saved yet</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Data Management</h2>
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};