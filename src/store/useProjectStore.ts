/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { Project, ProjectDetails } from "../types/project";
import { supabase } from "../lib/supabase";

interface ProjectStore {
  projects: ProjectDetails[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data: projects, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          pdf_count:saved_pdfs(count),
          note_count:notes(count),
          node_count:mindmap_nodes(count)
        `
        )
        .order("updated_at", { ascending: false });

      if (error) throw error;

      set({
        projects: projects.map((project) => ({
          ...project,
          created_at: new Date(project.created_at),
          updated_at: new Date(project.updated_at),
          pdf_count: project.pdf_count || 0,
          note_count: project.note_count || 0,
          node_count: project.node_count || 0,
        })),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (name: string, description?: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name, description })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      const newProject = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        pdf_count: 0,
        note_count: 0,
        node_count: 0,
      };

      set((state) => ({
        projects: [newProject, ...state.projects],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from("projects")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? { ...project, ...data, updated_at: new Date() }
            : project
        ),
        currentProject:
          state.currentProject?.id === id
            ? { ...state.currentProject, ...data, updated_at: new Date() }
            : state.currentProject,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        currentProject:
          state.currentProject?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },
}));
