/*
  # Add phone number to users table

  1. Changes
    - Add phone_number column to users table
      - text type
      - unique constraint
      - nullable
*/

-- Add phone_number column if it doesn't exist
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