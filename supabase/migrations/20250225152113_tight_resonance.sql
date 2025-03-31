-- First check current data
SELECT check_table_data();

-- Add some test data if tables are empty
DO $$ 
DECLARE
  test_user_id text := '123456789';
  test_date timestamptz := '2024-02-24 10:00:00'::timestamptz;
BEGIN
  -- Only insert test data if tables are empty
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    -- Insert test user
    INSERT INTO users (telegram_id, first_name, points, created_at)
    VALUES (test_user_id, 'Test User', 0, test_date);

    -- Insert phone registration
    INSERT INTO phone_registration_points (user_id, created_at)
    VALUES (test_user_id, test_date);

    -- Insert quiz completion
    INSERT INTO quiz_completions (user_id, completed_at)
    VALUES (test_user_id, test_date);

    -- Insert telegram subscription
    INSERT INTO telegram_subscriptions (user_id, subscribed_at)
    VALUES (test_user_id, test_date);

    -- Update keyword completion
    UPDATE users 
    SET keyword_completed = true 
    WHERE telegram_id = test_user_id;

    -- Insert prize exchange
    INSERT INTO prize_exchanges (user_id, prize_id, prize_name, points_spent, bot_url, created_at)
    VALUES (test_user_id, 1, 'Test Prize', 100, 'https://t.me/test', test_date);

    -- Insert referral
    INSERT INTO referrals (referrer_id, referred_id, created_at)
    VALUES (test_user_id, 'referred_user_123', test_date);

    -- Check data after insertion
    RAISE NOTICE 'Test data inserted, checking counts...';
    PERFORM check_table_data();
  END IF;
END $$;

-- Test each daily stats function with the test date
DO $$
DECLARE
  test_date text := '2024-02-24';
  next_date text := '2024-02-25';
  visitors integer;
  registrations integer;
  quiz integer;
  telegram integer;
  keyword integer;
  prizes integer;
  refs integer;
BEGIN
  -- Test each function
  SELECT count_daily_visitors(test_date, next_date) INTO visitors;
  SELECT count_daily_registrations(test_date, next_date) INTO registrations;
  SELECT count_daily_quiz_completions(test_date, next_date) INTO quiz;
  SELECT count_daily_telegram_subs(test_date, next_date) INTO telegram;
  SELECT count_daily_keyword_completions(test_date, next_date) INTO keyword;
  SELECT count_daily_prize_exchanges(test_date, next_date) INTO prizes;
  SELECT count_daily_referrals(test_date, next_date) INTO refs;

  -- Log results
  RAISE NOTICE 'Daily stats test results for %:', test_date;
  RAISE NOTICE 'Visitors: %', visitors;
  RAISE NOTICE 'Registrations: %', registrations;
  RAISE NOTICE 'Quiz completions: %', quiz;
  RAISE NOTICE 'Telegram subscriptions: %', telegram;
  RAISE NOTICE 'Keyword completions: %', keyword;
  RAISE NOTICE 'Prize exchanges: %', prizes;
  RAISE NOTICE 'Referrals: %', refs;
END $$;