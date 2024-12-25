import { create } from "zustand";
import { Project, ProjectDetails } from "../types/project";
import { supabase } from "../lib/supabase";

interface ProjectStore {
  projects: ProjectDetails[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<string>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  getTotalSize: (projectId: string) => Promise<number>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      // First fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Then fetch counts and sizes for each project
      const projectsWithDetails = await Promise.all(
        projectsData.map(async (project) => {
          const [
            { count: pdfCount },
            { count: noteCount },
            { count: nodeCount },
            { data: sizeData },
          ] = await Promise.all([
            supabase
              .from("saved_pdfs")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
            supabase
              .from("notes")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
            supabase
              .from("mindmap_nodes")
              .select("*", { count: "exact", head: true })
              .eq("project_id", project.id),
            supabase
              .from("saved_pdfs")
              .select("file_size")
              .eq("project_id", project.id),
          ]);

          const totalSize =
            sizeData?.reduce((sum, item) => sum + (item.file_size || 0), 0) ||
            0;

          return {
            ...project,
            created_at: new Date(project.created_at),
            updated_at: new Date(project.updated_at),
            pdf_count: pdfCount || 0,
            note_count: noteCount || 0,
            node_count: nodeCount || 0,
            total_size: totalSize,
          };
        })
      );

      set({ projects: projectsWithDetails });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (
    name: string,
    description?: string
  ): Promise<string> => {
    set({ loading: true, error: null });
    try {
      // Check project limit
      const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (projectCount && projectCount >= 3) {
        throw new Error("Maximum limit of 3 projects reached");
      }

      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name,
          description,
        })
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
        total_size: 0,
      };

      set((state) => ({
        projects: [newProject, ...state.projects],
      }));

      return data.id;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // First, delete all associated files from storage
      const { data: pdfs } = await supabase
        .from("saved_pdfs")
        .select("storage_path")
        .eq("project_id", id);

      if (pdfs && pdfs.length > 0) {
        await supabase.storage
          .from("pdfs")
          .remove(pdfs.map((pdf) => pdf.storage_path));
      }

      // Then delete the project (cascading will handle related records)
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
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  getTotalSize: async (projectId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from("saved_pdfs")
        .select("file_size")
        .eq("project_id", projectId);

      if (error) throw error;

      return data?.reduce((sum, item) => sum + (item.file_size || 0), 0) || 0;
    } catch (error) {
      console.error("Error getting project size:", error);
      return 0;
    }
  },
}));
