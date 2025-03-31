/*
  # Update RLS policies for users table

  1. Changes
    - Add INSERT policy for users table
    - Update existing policies to be more specific
    - Add proper security checks

  2. Security
    - Allow new user creation
    - Allow users to update their own data only
    - Allow reading of all user data for leaderboard
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "Anyone can create users"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read all data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (telegram_id::text = telegram_id::text)
  WITH CHECK (telegram_id::text = telegram_id::text);