import { create } from "zustand";
import { Note, MindMapNode, MindMapEdge, SavedPDF } from "../types";
import { supabase } from "../lib/supabase";

interface Store {
  pdfFile: File | null;
  notes: Note[];
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  savedPDFs: SavedPDF[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  setPdfFile: (file: File | null) => void;
  setCurrentPage: (page: number) => void;
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  addNode: (node: Omit<MindMapNode, "id">) => void;
  updateNode: (id: string, data: Partial<MindMapNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Omit<MindMapEdge, "id">) => void;
  deleteEdge: (id: string) => void;
  saveToProject: (projectId: string) => Promise<void>;
  loadFromProject: (projectId: string) => Promise<void>;
  resetWorkspace: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const useStore = create<Store>((set, get) => ({
  pdfFile: null,
  notes: [],
  nodes: [],
  edges: [],
  savedPDFs: [],
  loading: false,
  error: null,
  currentPage: 1,

  setPdfFile: (file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }
    set({ pdfFile: file });
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  addNote: (content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      pageNumber: get().currentPage,
      timestamp: new Date(),
    };
    set((state) => ({ notes: [...state.notes, newNote] }));
  },

  updateNote: (id, content) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, content } : note
      ),
    }));
  },

  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
    }));
  },

  addNode: (node) => {
    const newNode = {
      ...node,
      id: crypto.randomUUID(),
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...data } : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));
  },

  addEdge: (edge) => {
    const newEdge = {
      ...edge,
      id: `${edge.source}-${edge.target}`,
    };
    set((state) => ({ edges: [...state.edges, newEdge] }));
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  saveToProject: async (projectId: string) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      // Save PDF file
      if (state.pdfFile) {
        const fileSize = state.pdfFile.size;
        if (fileSize > MAX_FILE_SIZE) {
          throw new Error("File size exceeds 10MB limit");
        }

        const timestamp = Date.now();
        const filePath = `${projectId}/${timestamp}-${state.pdfFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("pdfs")
          .upload(filePath, state.pdfFile);

        if (uploadError) throw uploadError;

        const { error: pdfError } = await supabase.from("saved_pdfs").insert({
          project_id: projectId,
          name: state.pdfFile.name,
          storage_path: filePath,
          file_size: fileSize,
        });

        if (pdfError) throw pdfError;
      }

      // Save notes
      if (state.notes.length > 0) {
        const notesData = state.notes.map((note) => ({
          content: note.content,
          page_number: note.pageNumber,
          user_id: user.id,
          project_id: projectId,
        }));

        const { error: notesError } = await supabase
          .from("notes")
          .insert(notesData);

        if (notesError) throw notesError;
      }

      // Save nodes
      if (state.nodes.length > 0) {
        const { error: nodesError } = await supabase
          .from("mindmap_nodes")
          .insert(
            state.nodes.map((node) => ({
              id: node.id,
              project_id: projectId,
              user_id: user.id,
              type: node.type,
              position: node.position,
              data: node.data,
            }))
          );
        if (nodesError) throw nodesError;
      }

      // Save edges
      if (state.edges.length > 0) {
        const { error: edgesError } = await supabase
          .from("mindmap_edges")
          .insert(
            state.edges.map((edge) => ({
              id: edge.id,
              project_id: projectId,
              user_id: user.id,
              source_id: edge.source,
              target_id: edge.target,
              type: edge.type,
              animated: edge.animated,
              style: edge.style,
            }))
          );
        if (edgesError) throw edgesError;
      }
    } catch (error) {
      console.error("Save error:", error);
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadFromProject: async (projectId: string) => {
    set({ loading: true, error: null });

    try {
      // Load PDF
      const { data: pdfData } = await supabase
        .from("saved_pdfs")
        .select()
        .eq("project_id", projectId)
        .single();

      if (pdfData) {
        const { data: pdfFile } = await supabase.storage
          .from("pdfs")
          .download(pdfData.storage_path);

        if (pdfFile) {
          set({
            pdfFile: new File([pdfFile], pdfData.name, {
              type: "application/pdf",
            }),
          });
        }
      }

      // Load notes
      const { data: dbNotes } = await supabase
        .from("notes")
        .select()
        .eq("project_id", projectId);

      if (dbNotes) {
        const notes: Note[] = dbNotes.map((note) => ({
          id: note.id,
          content: note.content,
          pageNumber: note.page_number,
          timestamp: new Date(note.created_at),
        }));
        set({ notes });
      }

      // Load nodes
      const { data: nodes } = await supabase
        .from("mindmap_nodes")
        .select()
        .eq("project_id", projectId);

      if (nodes) set({ nodes });

      // Load edges
      const { data: edges } = await supabase
        .from("mindmap_edges")
        .select()
        .eq("project_id", projectId);

      if (edges) set({ edges });
    } catch (error) {
      console.error("Load error:", error);
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetWorkspace: () => {
    set({
      pdfFile: null,
      notes: [],
      nodes: [],
      edges: [],
      currentPage: 1,
      loading: false,
      error: null,
    });
  },
}));
