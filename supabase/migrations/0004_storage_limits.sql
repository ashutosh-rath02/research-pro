-- Add file_size column to saved_pdfs
ALTER TABLE saved_pdfs
ADD COLUMN file_size BIGINT NOT NULL DEFAULT 0;

-- Function to check project size limit
CREATE OR REPLACE FUNCTION check_project_size_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_size BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0) INTO total_size
  FROM saved_pdfs
  WHERE project_id = NEW.project_id;
  
  total_size := total_size + NEW.file_size;
  
  IF total_size > 10485760 THEN -- 10MB in bytes
    RAISE EXCEPTION 'Project size limit of 10MB exceeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for checking project size
CREATE TRIGGER check_project_size
BEFORE INSERT ON saved_pdfs
FOR EACH ROW
EXECUTE FUNCTION check_project_size_limit();

-- Update project limit trigger
CREATE OR REPLACE FUNCTION check_max_projects()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM projects WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum limit of 3 projects per user reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;