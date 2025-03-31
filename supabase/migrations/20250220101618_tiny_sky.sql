-- Create table for telegram subscriptions
CREATE TABLE IF NOT EXISTS telegram_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  subscribed_at timestamptz DEFAULT now(),
  points_awarded integer DEFAULT 150,
  UNIQUE(user_id)
);

ALTER TABLE telegram_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable full access for telegram_subscriptions"
  ON telegram_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);