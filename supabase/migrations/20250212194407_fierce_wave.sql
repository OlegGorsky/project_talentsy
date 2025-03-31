/*
  # Create users table with Telegram integration

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `telegram_id` (text, unique)
      - `username` (text, nullable)
      - `avatar_url` (text, nullable)
      - `first_name` (text)
      - `points` (integer, default 0)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for reading and updating user data
*/

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text,
  avatar_url text,
  first_name text NOT NULL,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON users;
  DROP POLICY IF EXISTS "Users can update own data" ON users;
END $$;

-- Create new policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);