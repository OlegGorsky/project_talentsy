/*
  # Track phone registration points

  1. New Tables
    - `phone_registration_points`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.telegram_id)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `phone_registration_points` table
    - Add policy for full access
*/

CREATE TABLE IF NOT EXISTS phone_registration_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE phone_registration_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for phone_registration_points"
  ON phone_registration_points
  FOR ALL
  USING (true)
  WITH CHECK (true);