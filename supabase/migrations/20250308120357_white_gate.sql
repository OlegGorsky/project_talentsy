-- Create function to send webhook notification
CREATE OR REPLACE FUNCTION send_webhook_notification()
RETURNS trigger AS $$
DECLARE
  webhook_url text := 'https://gorskybase.store/webhook/97e3b188-77e1-48ec-bdf4-823312e9f3b0';
  event_name text;
  user_id text;
BEGIN
  -- Determine event name and user ID based on the table and operation
  CASE TG_TABLE_NAME
    WHEN 'users' THEN
      event_name := 'user_registration';
      user_id := NEW.telegram_id;
    WHEN 'phone_registration_points' THEN
      event_name := 'phone_registration';
      user_id := NEW.user_id;
    WHEN 'quiz_completions' THEN
      event_name := 'quiz_completion';
      user_id := NEW.user_id;
    WHEN 'telegram_subscriptions' THEN
      event_name := 'telegram_subscription';
      user_id := NEW.user_id;
  END CASE;

  -- Send webhook notification
  PERFORM http_post(
    webhook_url,
    json_build_object(
      'event', event_name,
      'user_id', user_id,
      'timestamp', CURRENT_TIMESTAMP
    )::text,
    'application/json'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each event
DROP TRIGGER IF EXISTS notify_user_registration ON users;
CREATE TRIGGER notify_user_registration
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION send_webhook_notification();

DROP TRIGGER IF EXISTS notify_phone_registration ON phone_registration_points;
CREATE TRIGGER notify_phone_registration
  AFTER INSERT ON phone_registration_points
  FOR EACH ROW
  EXECUTE FUNCTION send_webhook_notification();

DROP TRIGGER IF EXISTS notify_quiz_completion ON quiz_completions;
CREATE TRIGGER notify_quiz_completion
  AFTER INSERT ON quiz_completions
  FOR EACH ROW
  EXECUTE FUNCTION send_webhook_notification();

DROP TRIGGER IF EXISTS notify_telegram_subscription ON telegram_subscriptions;
CREATE TRIGGER notify_telegram_subscription
  AFTER INSERT ON telegram_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION send_webhook_notification();

-- Create function and trigger for keyword completion
CREATE OR REPLACE FUNCTION notify_keyword_completion()
RETURNS trigger AS $$
DECLARE
  webhook_url text := 'https://gorskybase.store/webhook/97e3b188-77e1-48ec-bdf4-823312e9f3b0';
BEGIN
  -- Only send notification when keyword_completed changes from false to true
  IF NEW.keyword_completed = true AND (OLD.keyword_completed = false OR OLD.keyword_completed IS NULL) THEN
    PERFORM http_post(
      webhook_url,
      json_build_object(
        'event', 'keyword_completion',
        'user_id', NEW.telegram_id,
        'timestamp', CURRENT_TIMESTAMP
      )::text,
      'application/json'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_keyword_completion ON users;
CREATE TRIGGER notify_keyword_completion
  AFTER UPDATE OF keyword_completed ON users
  FOR EACH ROW
  EXECUTE FUNCTION notify_keyword_completion();