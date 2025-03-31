/*
  # Fix referral system policies and functions

  1. Changes
    - Drop and recreate add_referral_points function with boolean return type
    - Add INSERT policy for referrals table
    - Add trigger for automatic point addition

  2. Security
    - Maintain existing RLS policies
    - Add specific INSERT policy for referrals
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS add_referral_points(text, integer);

-- Recreate function with boolean return type
CREATE OR REPLACE FUNCTION add_referral_points(user_id TEXT, points_to_add INTEGER)
RETURNS boolean AS $$
DECLARE
  success boolean;
BEGIN
  success := false;
  
  UPDATE users
  SET points = points + points_to_add
  WHERE telegram_id = user_id;
  
  IF FOUND THEN
    success := true;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Add INSERT policy for referrals if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy 
    WHERE polrelid = 'referrals'::regclass 
    AND polname = 'Allow referral creation'
  ) THEN
    CREATE POLICY "Allow referral creation"
      ON referrals
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Create trigger function for automatic point addition
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Add points to referrer
  PERFORM add_referral_points(NEW.referrer_id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_referral_created ON referrals;

-- Create trigger
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION process_referral();