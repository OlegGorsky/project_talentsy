-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_quiz_completion ON quiz_completions;
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP FUNCTION IF EXISTS handle_quiz_completion();
DROP FUNCTION IF EXISTS handle_referral_points();

-- Create a more robust function for handling quiz completion
CREATE OR REPLACE FUNCTION handle_quiz_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- First add points for completing the quiz
  PERFORM add_points_safely(NEW.user_id, 200);
  
  -- Then check if this user was referred and handle referral points
  IF EXISTS (
    SELECT 1 
    FROM referrals 
    WHERE referred_id = NEW.user_id
  ) THEN
    -- Get the referral record and add points to referrer
    UPDATE users
    SET points = points + 100
    WHERE telegram_id IN (
      SELECT referrer_id
      FROM referrals
      WHERE referred_id = NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
CREATE TRIGGER on_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION handle_quiz_completion();

-- Update the quiz completions table to handle points directly
ALTER TABLE quiz_completions DROP COLUMN IF EXISTS points_awarded;