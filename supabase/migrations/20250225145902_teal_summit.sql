-- Create functions for daily statistics

-- Count daily visitors
CREATE OR REPLACE FUNCTION count_daily_visitors(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM users
    WHERE created_at >= start_date::timestamp
    AND created_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily registrations
CREATE OR REPLACE FUNCTION count_daily_registrations(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM phone_registration_points
    WHERE created_at >= start_date::timestamp
    AND created_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily quiz completions
CREATE OR REPLACE FUNCTION count_daily_quiz_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM quiz_completions
    WHERE completed_at >= start_date::timestamp
    AND completed_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily telegram subscriptions
CREATE OR REPLACE FUNCTION count_daily_telegram_subs(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM telegram_subscriptions
    WHERE subscribed_at >= start_date::timestamp
    AND subscribed_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily keyword completions
CREATE OR REPLACE FUNCTION count_daily_keyword_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM users
    WHERE keyword_completed = true
    AND created_at >= start_date::timestamp
    AND created_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily prize exchanges
CREATE OR REPLACE FUNCTION count_daily_prize_exchanges(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM prize_exchanges
    WHERE created_at >= start_date::timestamp
    AND created_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily referrals
CREATE OR REPLACE FUNCTION count_daily_referrals(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM referrals
    WHERE created_at >= start_date::timestamp
    AND created_at < end_date::timestamp
  );
END;
$$ LANGUAGE plpgsql;

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