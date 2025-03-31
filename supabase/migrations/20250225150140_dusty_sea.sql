-- Create functions for daily statistics with better date handling

-- Count daily visitors with timezone handling
CREATE OR REPLACE FUNCTION count_daily_visitors(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM users
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily registrations with timezone handling
CREATE OR REPLACE FUNCTION count_daily_registrations(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM phone_registration_points
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily quiz completions with timezone handling
CREATE OR REPLACE FUNCTION count_daily_quiz_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM quiz_completions
    WHERE completed_at >= (start_date || ' 00:00:00')::timestamptz
    AND completed_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily telegram subscriptions with timezone handling
CREATE OR REPLACE FUNCTION count_daily_telegram_subs(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM telegram_subscriptions
    WHERE subscribed_at >= (start_date || ' 00:00:00')::timestamptz
    AND subscribed_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily keyword completions with timezone handling
CREATE OR REPLACE FUNCTION count_daily_keyword_completions(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM users
    WHERE keyword_completed = true
    AND created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily prize exchanges with timezone handling
CREATE OR REPLACE FUNCTION count_daily_prize_exchanges(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM prize_exchanges
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;

-- Count daily referrals with timezone handling
CREATE OR REPLACE FUNCTION count_daily_referrals(start_date text, end_date text)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM referrals
    WHERE created_at >= (start_date || ' 00:00:00')::timestamptz
    AND created_at < (end_date || ' 00:00:00')::timestamptz
  );
END;
$$ LANGUAGE plpgsql;