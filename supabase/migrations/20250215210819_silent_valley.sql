/*
  # Update referral points logic

  1. Changes
    - Modify process_referral function to check quiz completion before awarding points
    - Add quiz_completion check to ensure points are only awarded after quiz is completed

  2. Security
    - Maintains existing RLS policies
    - No changes to table permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP FUNCTION IF EXISTS process_referral();

-- Create updated trigger function
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if referrer has completed the quiz
  IF EXISTS (
    SELECT 1 
    FROM quiz_completions 
    WHERE user_id = NEW.referrer_id
  ) THEN
    -- Add points to referrer only if quiz is completed
    PERFORM add_referral_points(NEW.referrer_id, 100);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION process_referral();