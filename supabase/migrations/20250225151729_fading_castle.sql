-- Create functions for daily statistics with debug logging

-- Count daily visitors with debug logging
CREATE OR REPLACE FUNCTION count_daily_visitors(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM users
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_visitors: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily registrations with debug logging
CREATE OR REPLACE FUNCTION count_daily_registrations(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM phone_registration_points
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_registrations: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily quiz completions with debug logging
CREATE OR REPLACE FUNCTION count_daily_quiz_completions(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM quiz_completions
  WHERE completed_at >= (start_date || ' 00:00:00')::timestamptz
  AND completed_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_quiz_completions: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily telegram subscriptions with debug logging
CREATE OR REPLACE FUNCTION count_daily_telegram_subs(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM telegram_subscriptions
  WHERE subscribed_at >= (start_date || ' 00:00:00')::timestamptz
  AND subscribed_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_telegram_subs: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily keyword completions with debug logging
CREATE OR REPLACE FUNCTION count_daily_keyword_completions(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM users
  WHERE keyword_completed = true
  AND created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_keyword_completions: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily prize exchanges with debug logging
CREATE OR REPLACE FUNCTION count_daily_prize_exchanges(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM prize_exchanges
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_prize_exchanges: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Count daily referrals with debug logging
CREATE OR REPLACE FUNCTION count_daily_referrals(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  SELECT COUNT(*)::integer INTO result
  FROM referrals
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_referrals: start_date=%, end_date=%, count=%', start_date, end_date, result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add function to check table data
CREATE OR REPLACE FUNCTION check_table_data()
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  result := 'Table counts:' || E'\n';
  
  -- Check users
  SELECT result || 'users: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM users;
  
  -- Check phone_registration_points
  SELECT result || 'phone_registration_points: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM phone_registration_points;
  
  -- Check quiz_completions
  SELECT result || 'quiz_completions: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM quiz_completions;
  
  -- Check telegram_subscriptions
  SELECT result || 'telegram_subscriptions: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM telegram_subscriptions;
  
  -- Check prize_exchanges
  SELECT result || 'prize_exchanges: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM prize_exchanges;
  
  -- Check referrals
  SELECT result || 'referrals: ' || COUNT(*)::text || E'\n'
  INTO result
  FROM referrals;
  
  RAISE NOTICE '%', result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;