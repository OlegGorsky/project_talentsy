/*
  # Fix referral points logic

  1. Changes
    - Add quiz completion requirement for referral points
    - Improve error handling
    - Add better tracking for referral status
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP FUNCTION IF EXISTS handle_referral_points();

-- Create a more robust function for handling referral points
CREATE OR REPLACE FUNCTION handle_referral_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add points if the referred user has completed the quiz
  IF EXISTS (
    SELECT 1 
    FROM quiz_completions 
    WHERE user_id = NEW.referred_id
  ) THEN
    -- Add points to referrer
    PERFORM add_points_safely(NEW.referrer_id, 100);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral creation
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_points();

-- Create trigger function for quiz completion
CREATE OR REPLACE FUNCTION handle_quiz_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this user was referred
  IF EXISTS (
    SELECT 1 
    FROM referrals 
    WHERE referred_id = NEW.user_id
  ) THEN
    -- Get the referral record
    WITH referral AS (
      SELECT referrer_id
      FROM referrals
      WHERE referred_id = NEW.user_id
    )
    -- Add points to the referrer
    SELECT add_points_safely(referrer_id, 100)
    FROM referral;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
CREATE TRIGGER on_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION handle_quiz_completion();