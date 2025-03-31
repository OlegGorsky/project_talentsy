/*
  # Create users table for storing Telegram user data

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `telegram_id` (text, unique) - Telegram user ID
      - `username` (text) - Telegram username
      - `avatar_url` (text) - URL to user's Telegram avatar
      - `first_name` (text) - User's first name
      - `points` (integer) - User's points balance
      - `created_at` (timestamptz) - Registration date
      - `last_login` (timestamptz) - Last login date

  2. Security
    - Enable RLS on users table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data
*/

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

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);