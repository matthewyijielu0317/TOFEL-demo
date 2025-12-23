-- Migration: Add title, difficulty, and tags columns to questions table
-- Date: 2024-12-24

-- Add title column for display name
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS title VARCHAR(100);

-- Add difficulty column (EASY, MEDIUM, HARD)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20);

-- Add tags column (JSON array for categorization)
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS tags JSONB;

-- Update existing questions with metadata
UPDATE questions SET 
    title = 'Gap Year',
    difficulty = 'MEDIUM',
    tags = '["Education", "Life Choice"]'::jsonb
WHERE question_id = 'question_01KCH9WP8W6TZXA5QXS1BFF6AS';

UPDATE questions SET 
    title = 'Urban vs Rural',
    difficulty = 'EASY',
    tags = '["Lifestyle", "Society"]'::jsonb
WHERE question_id = 'question_01KCH9WP8W6TZXA5QXS1BFF6AT';

UPDATE questions SET 
    title = 'Technology Impact',
    difficulty = 'MEDIUM',
    tags = '["Technology", "Modern Life"]'::jsonb
WHERE question_id = 'question_01KCH9WP8W6TZXA5QXS1BFF6AV';

-- Add comment for documentation
COMMENT ON COLUMN questions.title IS 'Display title for the question';
COMMENT ON COLUMN questions.difficulty IS 'Question difficulty: EASY, MEDIUM, or HARD';
COMMENT ON COLUMN questions.tags IS 'JSON array of tags for categorization';

