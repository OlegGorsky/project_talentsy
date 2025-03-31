-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
DROP FUNCTION IF EXISTS process_referral();

-- Create updated trigger function with better error handling
CREATE OR REPLACE FUNCTION process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_quiz_completed boolean;
  referred_quiz_completed boolean;
BEGIN
  -- Check if both users have completed the quiz
  SELECT EXISTS (
    SELECT 1 
    FROM quiz_completions 
    WHERE user_id = NEW.referrer_id
  ) INTO referrer_quiz_completed;

  SELECT EXISTS (
    SELECT 1 
    FROM quiz_completions 
    WHERE user_id = NEW.referred_id
  ) INTO referred_quiz_completed;

  -- Add points to referrer if both users have completed the quiz
  IF referrer_quiz_completed AND referred_quiz_completed THEN
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

-- Create trigger for quiz completion to process pending referrals
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
      PERFORM add_referral_points(referral_record.referrer_id, 100);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quiz completion
CREATE TRIGGER on_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION process_pending_referrals();