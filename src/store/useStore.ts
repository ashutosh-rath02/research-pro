import { create } from 'zustand';
import { Note, MindMapNode, MindMapEdge, SavedPDF } from '../types';
import { supabase } from '../lib/supabase';

interface Store {
  pdfFile: File | null;
  notes: Note[];
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  savedPDFs: SavedPDF[];
  setPdfFile: (file: File | null) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  addNode: (node: MindMapNode) => void;
  updateNode: (id: string, data: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: MindMapEdge) => void;
  deleteEdge: (id: string) => void;
  savePDF: (file: File) => Promise<void>;
  deletePDF: (id: string) => Promise<void>;
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  pdfFile: null,
  notes: [],
  nodes: [],
  edges: [],
  savedPDFs: [],
  setPdfFile: (file) => set({ pdfFile: file }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (id, content) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, content } : note
    ),
  })),
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id),
  })),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...data } : node
    ),
  })),
  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    ),
  })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id),
  })),
  savePDF: async (file) => {
    const { data: existingPDFs } = await supabase
      .from('saved_pdfs')
      .select('*');

    if (existingPDFs && existingPDFs.length >= 5) {
      throw new Error('Maximum limit of 5 PDFs reached');
    }

    const { data, error } = await supabase.storage
      .from('pdfs')
      .upload(`${crypto.randomUUID()}-${file.name}`, file);

    if (error) throw error;

    await supabase.from('saved_pdfs').insert({
      name: file.name,
      storage_path: data.path,
    });
  },
  deletePDF: async (id) => {
    const { data: pdf } = await supabase
      .from('saved_pdfs')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (pdf) {
      await supabase.storage.from('pdfs').remove([pdf.storage_path]);
    }
  },
  exportData: async () => {
    const state = get();
    return {
      notes: state.notes,
      nodes: state.nodes,
      edges: state.edges,
    };
  },
  importData: async (data) => {
    set({
      notes: data.notes || [],
      nodes: data.nodes || [],
      edges: data.edges || [],
    });
  },
}));