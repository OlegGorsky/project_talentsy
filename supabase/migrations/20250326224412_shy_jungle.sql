/*
  # Add phone registration task tracking

  1. New Tables
    - `phone_registration_points`
      - `id` (uuid, primary key)
      - `user_id` (text, references users.telegram_id)
      - `created_at` (timestamptz)

  2. Changes
    - Add `phone_number` column to users table
    - Add unique constraint on phone_number
    - Enable RLS on phone_registration_points table
    - Add policy for full access

  3. Security
    - Enable RLS
    - Add policy for full access
*/

-- Add phone_number column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_number text UNIQUE;
  END IF;
END $$;

-- Create phone_registration_points table if it doesn't exist
CREATE TABLE IF NOT EXISTS phone_registration_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE phone_registration_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DO $$
BEGIN
  DROP POLICY IF EXISTS "Enable full access for phone_registration_points" ON phone_registration_points;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policy for full access
CREATE POLICY "Enable full access for phone_registration_points"
  ON phone_registration_points
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create or replace trigger function for automatic point addition
CREATE OR REPLACE FUNCTION process_phone_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Add points to user
  PERFORM add_points_safely(NEW.user_id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_phone_registration ON phone_registration_points;

-- Create trigger
CREATE TRIGGER on_phone_registration
  AFTER INSERT ON phone_registration_points
  FOR EACH ROW
  EXECUTE FUNCTION process_phone_registration();