/*
  # Update referral logic

  1. Changes
    - Remove trigger on referrals table
    - Remove process_referral function
    - Keep process_pending_referrals function but modify to handle all referral point awards
    
  2. Security
    - No changes to RLS policies
    - Maintains existing security model
    
  3. Notes
    - Referrals are now stored immediately
    - Points are only awarded after quiz completion
    - Handles both referrer and referred quiz completion cases
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP FUNCTION IF EXISTS process_referral();

-- Update the process_pending_referrals function to handle all point awards
CREATE OR REPLACE FUNCTION process_pending_referrals()
RETURNS TRIGGER AS $$
DECLARE
  referral_record RECORD;
BEGIN
  -- Find any referral where this user is either the referrer or referred
  FOR referral_record IN
    SELECT r.* 
    FROM referrals r
    WHERE (r.referrer_id = NEW.user_id OR r.referred_id = NEW.user_id)
  LOOP
    -- Check if both users have completed the quiz
    IF EXISTS (
      SELECT 1 
      FROM quiz_completions 
      WHERE user_id = referral_record.referrer_id
    ) AND EXISTS (
      SELECT 1 
      FROM quiz_completions 
      WHERE user_id = referral_record.referred_id
    ) THEN
      -- Add points to referrer if not already awarded
      -- The add_referral_points function will handle the actual point addition
      PERFORM add_referral_points(referral_record.referrer_id, 100);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;