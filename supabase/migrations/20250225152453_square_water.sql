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
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM users
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_visitors: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_registrations(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM phone_registration_points
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_registrations: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_quiz_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM quiz_completions
    WHERE completed_at >= (start_date || ' 00:00:00')::timestamptz
    AND completed_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_quiz_completions: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_telegram_subs(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM telegram_subscriptions
    WHERE subscribed_at >= (start_date || ' 00:00:00')::timestamptz
    AND subscribed_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_telegram_subs: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_keyword_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM users
    WHERE keyword_completed = true
    AND created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_keyword_completions: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_prize_exchanges(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM prize_exchanges
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_prize_exchanges: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION count_daily_referrals(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  IF start_date IS NULL OR end_date IS NULL THEN
    RETURN 0;
  END IF;

  RETURN COALESCE((
    SELECT COUNT(*)::integer
    FROM referrals
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  ), 0);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in count_daily_referrals: %', SQLERRM;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;