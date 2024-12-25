/*
  # Initial schema for PDF Notes application

  1. New Tables
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pdf_name` (text)
      - `page_number` (integer)
      - `content` (text)
      - `created_at` (timestamp)
    - `mindmap_nodes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `pdf_name` (text)
      - `label` (text)
      - `position_x` (float)
      - `position_y` (float)
      - `created_at` (timestamp)
    - `mindmap_edges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `source_id` (uuid, references mindmap_nodes)
      - `target_id` (uuid, references mindmap_nodes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  pdf_name text NOT NULL,
  page_number integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mindmap nodes table
CREATE TABLE IF NOT EXISTS mindmap_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  pdf_name text NOT NULL,
  label text NOT NULL,
  position_x float NOT NULL,
  position_y float NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mindmap_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mindmap nodes"
  ON mindmap_nodes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mindmap edges table
CREATE TABLE IF NOT EXISTS mindmap_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  source_id uuid REFERENCES mindmap_nodes NOT NULL,
  target_id uuid REFERENCES mindmap_nodes NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_source FOREIGN KEY (source_id) REFERENCES mindmap_nodes (id) ON DELETE CASCADE,
  CONSTRAINT fk_target FOREIGN KEY (target_id) REFERENCES mindmap_nodes (id) ON DELETE CASCADE
);

ALTER TABLE mindmap_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mindmap edges"
  ON mindmap_edges
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);