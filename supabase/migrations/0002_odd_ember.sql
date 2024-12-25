/*
  # Create saved PDFs table and storage

  1. New Tables
    - `saved_pdfs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `storage_path` (text)
      - `created_at` (timestamptz)

  2. Storage
    - Create bucket for PDF storage
    - Enable RLS policies for bucket access
*/

-- Create saved_pdfs table
CREATE TABLE IF NOT EXISTS saved_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own saved PDFs"
  ON saved_pdfs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('pdfs', 'pdfs')
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can read their own PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);