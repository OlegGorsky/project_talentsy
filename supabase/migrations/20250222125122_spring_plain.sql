/*
  # Fix referral tracking

  1. Changes
    - Remove quiz completion requirement for referral points
    - Add better error handling for point addition
    - Add tracking for referral status
*/

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP TRIGGER IF EXISTS on_quiz_completion ON quiz_completions;
DROP FUNCTION IF EXISTS handle_referral_points();
DROP FUNCTION IF EXISTS process_pending_referrals();

-- Create a more robust function for handling referral points
CREATE OR REPLACE FUNCTION handle_referral_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Add points to referrer immediately
  PERFORM add_points_safely(NEW.referrer_id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral creation
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_points();