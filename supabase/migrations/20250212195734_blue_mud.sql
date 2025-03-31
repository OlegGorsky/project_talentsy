/*
  # Create referrals table and update users table

  1. New Tables
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (text, foreign key to users.telegram_id)
      - `referred_id` (text, foreign key to users.telegram_id)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `referrals` table
    - Add policy for reading referral data
*/

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id text NOT NULL REFERENCES users(telegram_id),
  referred_id text NOT NULL REFERENCES users(telegram_id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read referrals"
  ON referrals
  FOR SELECT
  USING (true);