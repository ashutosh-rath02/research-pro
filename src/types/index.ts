export interface Note {
  id: string;
  content: string;
  pageNumber: number;
  timestamp: Date;
  color?: string;
  tags?: string[];
}

export interface MindMapNode {
  id: string;
  type: "default" | "input" | "output";
  position: { x: number; y: number };
  data: {
    label: string;
    color?: string;
    notes?: string[];
  };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type?: "default" | "straight" | "step" | "smoothstep";
  animated?: boolean;
  style?: {
    stroke?: string;
  };
}

export interface SavedPDF {
  id: string;
  project_id: string;
  name: string;
  storage_path: string;
  file_size: number;
  created_at: Date;
}
