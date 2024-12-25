export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectDetails extends Project {
  pdf_count: number;
  note_count: number;
  node_count: number;
}
