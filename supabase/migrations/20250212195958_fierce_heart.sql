-- Function to add points to a user
CREATE OR REPLACE FUNCTION add_referral_points(user_id TEXT, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET points = points + points_to_add
  WHERE telegram_id = user_id;
END;
$$ LANGUAGE plpgsql;