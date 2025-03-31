/*
  # Add prize exchanges table

  1. New Tables
    - `prize_exchanges`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.telegram_id)
      - `prize_id` (integer)
      - `prize_name` (text)
      - `points_spent` (integer)
      - `created_at` (timestamptz)
      - `bot_url` (text)

  2. Security
    - Enable RLS on `prize_exchanges` table
    - Add policy for full access
*/

CREATE TABLE IF NOT EXISTS prize_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  prize_id integer NOT NULL,
  prize_name text NOT NULL,
  points_spent integer NOT NULL,
  bot_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prize_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for prize_exchanges"
  ON prize_exchanges
  FOR ALL
  USING (true)
  WITH CHECK (true);