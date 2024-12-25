export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectDetails extends Project {
  id: string;

  name: string;

  description: string | null;

  note_count: number;

  updated_at: Date;

  total_size?: number;
}
