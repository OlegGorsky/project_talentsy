-- Drop existing functions
DROP FUNCTION IF EXISTS count_daily_visitors(text, text);
DROP FUNCTION IF EXISTS count_daily_registrations(text, text);
DROP FUNCTION IF EXISTS count_daily_quiz_completions(text, text);
DROP FUNCTION IF EXISTS count_daily_telegram_subs(text, text);
DROP FUNCTION IF EXISTS count_daily_keyword_completions(text, text);
DROP FUNCTION IF EXISTS count_daily_prize_exchanges(text, text);
DROP FUNCTION IF EXISTS count_daily_referrals(text, text);

-- Create improved functions with better error handling and validation

CREATE OR REPLACE FUNCTION count_daily_visitors(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_visitors: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM users
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_visitors: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_visitors: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_registrations(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_registrations: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM phone_registration_points
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_registrations: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_registrations: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_quiz_completions(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_quiz_completions: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM quiz_completions
  WHERE completed_at >= (start_date || ' 00:00:00')::timestamptz
  AND completed_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_quiz_completions: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_quiz_completions: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_telegram_subs(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_telegram_subs: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM telegram_subscriptions
  WHERE subscribed_at >= (start_date || ' 00:00:00')::timestamptz
  AND subscribed_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_telegram_subs: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_telegram_subs: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_keyword_completions(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_keyword_completions: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM users
  WHERE keyword_completed = true
  AND created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_keyword_completions: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_keyword_completions: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_prize_exchanges(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_prize_exchanges: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM prize_exchanges
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_prize_exchanges: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_prize_exchanges: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_referrals(start_date text, end_date text)
RETURNS integer AS $$
DECLARE
  result integer;
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RAISE WARNING 'count_daily_referrals: Invalid dates - start: %, end: %', start_date, end_date;
    RETURN 0;
  END IF;

  SELECT COUNT(*)::integer INTO result
  FROM referrals
  WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
  AND created_at < (end_date || ' 00:00:00')::timestamptz;

  RAISE NOTICE 'count_daily_referrals: start=%, end=%, count=%', start_date, end_date, result;
  RETURN COALESCE(result, 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_referrals: % %', SQLERRM, SQLSTATE;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Add a function to verify the functions are working
CREATE OR REPLACE FUNCTION verify_daily_stats_functions()
RETURNS text AS $$
DECLARE
  test_start text := current_date::text;
  test_end text := (current_date + interval '1 day')::text;
  result text;
BEGIN
  result := 'Daily stats functions test results:' || E'\n';
  
  -- Test each function
  result := result || 'Visitors: ' || count_daily_visitors(test_start, test_end)::text || E'\n';
  result := result || 'Registrations: ' || count_daily_registrations(test_start, test_end)::text || E'\n';
  result := result || 'Quiz completions: ' || count_daily_quiz_completions(test_start, test_end)::text || E'\n';
  result := result || 'Telegram subs: ' || count_daily_telegram_subs(test_start, test_end)::text || E'\n';
  result := result || 'Keyword completions: ' || count_daily_keyword_completions(test_start, test_end)::text || E'\n';
  result := result || 'Prize exchanges: ' || count_daily_prize_exchanges(test_start, test_end)::text || E'\n';
  result := result || 'Referrals: ' || count_daily_referrals(test_start, test_end)::text;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT verify_daily_stats_functions();