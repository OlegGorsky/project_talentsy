-- Remove restrictive policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read referrals they're involved in" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Users can read their own quiz completions" ON quiz_completions;
DROP POLICY IF EXISTS "Users can create their own quiz completions" ON quiz_completions;
DROP POLICY IF EXISTS "Users can read their own telegram subscriptions" ON telegram_subscriptions;
DROP POLICY IF EXISTS "Users can create their own telegram subscriptions" ON telegram_subscriptions;
DROP POLICY IF EXISTS "Users can read their own prize exchanges" ON prize_exchanges;
DROP POLICY IF EXISTS "Users can create their own prize exchanges" ON prize_exchanges;
DROP POLICY IF EXISTS "Users can read their own phone registration points" ON phone_registration_points;
DROP POLICY IF EXISTS "Users can create their own phone registration points" ON phone_registration_points;

-- Remove admin policies
DROP POLICY IF EXISTS "Admin has full access to users" ON users;
DROP POLICY IF EXISTS "Admin has full access to referrals" ON referrals;
DROP POLICY IF EXISTS "Admin has full access to quiz_completions" ON quiz_completions;
DROP POLICY IF EXISTS "Admin has full access to telegram_subscriptions" ON telegram_subscriptions;
DROP POLICY IF EXISTS "Admin has full access to prize_exchanges" ON prize_exchanges;
DROP POLICY IF EXISTS "Admin has full access to phone_registration_points" ON phone_registration_points;

-- Create new permissive policies for all tables
CREATE POLICY "Enable full access for users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for referrals"
  ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for quiz_completions"
  ON quiz_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for telegram_subscriptions"
  ON telegram_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for prize_exchanges"
  ON prize_exchanges
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable full access for phone_registration_points"
  ON phone_registration_points
  FOR ALL
  USING (true)
  WITH CHECK (true);