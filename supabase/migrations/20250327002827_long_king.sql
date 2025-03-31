/*
  # Add daily taps tracking

  1. New Tables
    - `daily_taps`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.telegram_id)
      - `tap_count` (integer)
      - `tap_date` (date)

  2. Security
    - Enable RLS on daily_taps table
    - Add policy for full access
*/

CREATE TABLE IF NOT EXISTS daily_taps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  tap_count integer DEFAULT 0,
  tap_date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, tap_date)
);

ALTER TABLE daily_taps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for daily_taps"
  ON daily_taps
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to increment tap count and check limit
CREATE OR REPLACE FUNCTION increment_daily_taps(user_id_param text)
RETURNS boolean AS $$
DECLARE
  current_count integer;
BEGIN
  -- Insert or update tap count for today
  INSERT INTO daily_taps (user_id, tap_count, tap_date)
  VALUES (user_id_param, 1, CURRENT_DATE)
  ON CONFLICT (user_id, tap_date)
  DO UPDATE SET tap_count = daily_taps.tap_count + 1
  RETURNING tap_count INTO current_count;

  -- Return true if under limit (10 taps), false otherwise
  RETURN current_count <= 10;
END;
$$ LANGUAGE plpgsql;