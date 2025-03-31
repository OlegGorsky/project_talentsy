/*
  # Update permissions for full access

  1. Changes
    - Drop existing policies
    - Create new policies with full access
    - Add CASCADE delete for referrals
  
  2. Security
    - Enable full access for all operations
    - Ensure proper cleanup of related data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Allow reading user data" ON users;
DROP POLICY IF EXISTS "Allow users to update their own data" ON users;
DROP POLICY IF EXISTS "Anyone can read referrals" ON referrals;
DROP POLICY IF EXISTS "Allow referral creation" ON referrals;

-- Create new policies for users table
CREATE POLICY "Enable full access for users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new policies for referrals table
CREATE POLICY "Enable full access for referrals"
  ON referrals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update referrals foreign keys to cascade
ALTER TABLE referrals
  DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey,
  DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;

ALTER TABLE referrals
  ADD CONSTRAINT referrals_referrer_id_fkey
    FOREIGN KEY (referrer_id)
    REFERENCES users(telegram_id)
    ON DELETE CASCADE,
  ADD CONSTRAINT referrals_referred_id_fkey
    FOREIGN KEY (referred_id)
    REFERENCES users(telegram_id)
    ON DELETE CASCADE;