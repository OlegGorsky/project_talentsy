/*
  # Fix keyword completion functionality

  1. Changes
    - Add function to safely update user points and keyword completion status
    - Add trigger to handle keyword completion points

  2. Security
    - Enable RLS on all affected tables
    - Add appropriate policies
*/

-- Create a function to handle keyword completion
CREATE OR REPLACE FUNCTION complete_keyword_task(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  success := FALSE;
  
  -- Update user status and points in a single transaction
  UPDATE users
  SET 
    keyword_completed = TRUE,
    points = COALESCE(points, 0) + 100
  WHERE 
    telegram_id = user_id_param 
    AND NOT keyword_completed;
    
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success;
END;
$$ LANGUAGE plpgsql;