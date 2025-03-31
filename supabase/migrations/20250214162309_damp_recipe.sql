/*
  # Quiz completions table and policies

  1. New Tables
    - `quiz_completions`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.telegram_id)
      - `completed_at` (timestamptz)
      - `points_awarded` (integer)

  2. Security
    - Enable RLS
    - Add policy for full access
*/

-- Create quiz_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 200,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable full access for quiz_completions" ON quiz_completions;
END $$;

-- Create new policy
CREATE POLICY "Enable full access for quiz_completions"
  ON quiz_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);