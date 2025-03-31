-- Remove any existing policies
DROP POLICY IF EXISTS "Enable full access for users" ON users;
DROP POLICY IF EXISTS "Enable full access for referrals" ON referrals;
DROP POLICY IF EXISTS "Enable full access for quiz_completions" ON quiz_completions;
DROP POLICY IF EXISTS "Enable full access for telegram_subscriptions" ON telegram_subscriptions;
DROP POLICY IF EXISTS "Enable full access for prize_exchanges" ON prize_exchanges;
DROP POLICY IF EXISTS "Enable full access for phone_registration_points" ON phone_registration_points;

-- Create more restrictive policies for users table
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (telegram_id = auth.uid()::text);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (telegram_id = auth.uid()::text)
  WITH CHECK (telegram_id = auth.uid()::text);

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  WITH CHECK (telegram_id = auth.uid()::text);

-- Create policies for referrals
CREATE POLICY "Users can read referrals they're involved in"
  ON referrals
  FOR SELECT
  USING (referrer_id = auth.uid()::text OR referred_id = auth.uid()::text);

CREATE POLICY "Users can create referrals"
  ON referrals
  FOR INSERT
  WITH CHECK (referrer_id = auth.uid()::text);

-- Create policies for quiz completions
CREATE POLICY "Users can read their own quiz completions"
  ON quiz_completions
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own quiz completions"
  ON quiz_completions
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Create policies for telegram subscriptions
CREATE POLICY "Users can read their own telegram subscriptions"
  ON telegram_subscriptions
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own telegram subscriptions"
  ON telegram_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Create policies for prize exchanges
CREATE POLICY "Users can read their own prize exchanges"
  ON prize_exchanges
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own prize exchanges"
  ON prize_exchanges
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Create policies for phone registration points
CREATE POLICY "Users can read their own phone registration points"
  ON phone_registration_points
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create their own phone registration points"
  ON phone_registration_points
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Create admin role and policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END $$;

-- Grant admin access to all tables
GRANT ALL ON users TO admin;
GRANT ALL ON referrals TO admin;
GRANT ALL ON quiz_completions TO admin;
GRANT ALL ON telegram_subscriptions TO admin;
GRANT ALL ON prize_exchanges TO admin;
GRANT ALL ON phone_registration_points TO admin;

-- Create admin policies for all tables
CREATE POLICY "Admin has full access to users"
  ON users
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin has full access to referrals"
  ON referrals
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin has full access to quiz_completions"
  ON quiz_completions
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin has full access to telegram_subscriptions"
  ON telegram_subscriptions
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin has full access to prize_exchanges"
  ON prize_exchanges
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin has full access to phone_registration_points"
  ON phone_registration_points
  FOR ALL
  TO admin
  USING (true)
  WITH CHECK (true);