import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { PlusCircle } from 'lucide-react';

export const NotesPanel: React.FC = () => {
  const [newNote, setNewNote] = useState('');
  const { notes, addNote } = useStore();

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({
        id: crypto.randomUUID(),
        pageNumber: 1,
        content: newNote,
        timestamp: new Date(),
      });
      setNewNote('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-4">
      <h2 className="text-xl font-bold mb-4">Notes</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Add a new note..."
        />
        <button
          onClick={handleAddNote}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-3 mb-2 bg-gray-50 rounded shadow-sm"
          >
            <p className="text-sm text-gray-600">Page {note.pageNumber}</p>
            <p className="mt-1">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(note.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};