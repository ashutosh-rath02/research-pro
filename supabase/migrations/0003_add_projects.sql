/*
  # Add projects table and modify existing tables
  
  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Modify existing tables to reference projects
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add project_id to saved_pdfs
ALTER TABLE saved_pdfs
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Add project_id to notes
ALTER TABLE notes
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Add project_id to mindmap_nodes
ALTER TABLE mindmap_nodes
ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraint for maximum 5 projects per user
CREATE OR REPLACE FUNCTION check_max_projects()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM projects WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum limit of 5 projects per user reached';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER enforce_max_projects
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION check_max_projects();