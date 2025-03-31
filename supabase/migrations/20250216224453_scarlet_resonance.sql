/*
  # Fix referral points logic

  1. Changes
    - Add new function for safe point addition
    - Add trigger for referral creation
    - Improve error handling and point awarding logic

  2. Security
    - Maintain existing RLS policies
    - Ensure data consistency
*/

-- Create a more robust function for adding points
CREATE OR REPLACE FUNCTION add_points_safely(
  user_id_param TEXT,
  points_to_add INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  success := FALSE;
  
  -- Update points with better error handling
  UPDATE users
  SET points = COALESCE(points, 0) + points_to_add
  WHERE telegram_id = user_id_param;
  
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function for handling referral points
CREATE OR REPLACE FUNCTION handle_referral_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if both users have completed the quiz
  IF EXISTS (
    SELECT 1 
    FROM quiz_completions 
    WHERE user_id = NEW.referrer_id
  ) AND EXISTS (
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
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_points();

-- Create trigger for quiz completion
DROP TRIGGER IF EXISTS on_quiz_completion ON quiz_completions;
CREATE TRIGGER on_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION process_pending_referrals();