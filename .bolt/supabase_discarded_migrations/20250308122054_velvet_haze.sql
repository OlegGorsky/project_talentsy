-- Drop existing functions
DROP FUNCTION IF EXISTS http_post(text, text, unknown);
DROP FUNCTION IF EXISTS handle_referral_points();
DROP FUNCTION IF EXISTS handle_quiz_completion();

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
DROP TRIGGER IF EXISTS on_referral_created ON referrals;
CREATE TRIGGER on_referral_created
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_points();

-- Create trigger function for quiz completion
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
DROP TRIGGER IF EXISTS on_quiz_completion ON quiz_completions;
CREATE TRIGGER on_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION handle_quiz_completion();

-- Update policies to be more permissive
DROP POLICY IF EXISTS "Enable full access for users" ON users;
CREATE POLICY "Enable full access for users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable full access for referrals" ON referrals;
CREATE POLICY "Enable full access for referrals"
  ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable full access for quiz_completions" ON quiz_completions;
CREATE POLICY "Enable full access for quiz_completions"
  ON quiz_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable full access for telegram_subscriptions" ON telegram_subscriptions;
CREATE POLICY "Enable full access for telegram_subscriptions"
  ON telegram_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable full access for prize_exchanges" ON prize_exchanges;
CREATE POLICY "Enable full access for prize_exchanges"
  ON prize_exchanges
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable full access for phone_registration_points" ON phone_registration_points;
CREATE POLICY "Enable full access for phone_registration_points"
  ON phone_registration_points
  FOR ALL
  USING (true)
  WITH CHECK (true);