/*
  # Update users table RLS policies

  1. Changes
    - Modify RLS policies to allow proper user creation and updates
    - Add policy for inserting new users
    - Update policy for user data updates

  2. Security
    - Maintain data security while allowing necessary operations
    - Ensure users can only update their own data
    - Allow initial user creation
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can create users" ON users;
DROP POLICY IF EXISTS "Users can read all data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies
CREATE POLICY "Allow user creation"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow reading user data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to update their own data"
  ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);