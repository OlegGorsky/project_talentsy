-- Create table for keyword completions
CREATE TABLE IF NOT EXISTS keyword_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 100,
  UNIQUE(user_id)
);

ALTER TABLE keyword_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for keyword_completions"
  ON keyword_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);