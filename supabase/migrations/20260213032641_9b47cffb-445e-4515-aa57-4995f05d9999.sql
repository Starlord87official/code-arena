-- Trigger: auto-create notification when a Lock-In partner request is sent
CREATE OR REPLACE FUNCTION public.notify_lockin_partner_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_username text;
BEGIN
  SELECT username INTO sender_username FROM profiles WHERE id = NEW.sender_id;
  
  INSERT INTO notifications (user_id, type, title, message, severity)
  VALUES (
    NEW.receiver_id,
    'lockin_request',
    'New Lock-In Partner Request',
    COALESCE(sender_username, 'Someone') || ' wants to lock in with you for 7 days.',
    'info'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_lockin_partner_request ON lockin_partner_requests;
CREATE TRIGGER trg_notify_lockin_partner_request
  AFTER INSERT ON lockin_partner_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_lockin_partner_request();

-- Trigger: notify when partner request is accepted/declined
CREATE OR REPLACE FUNCTION public.notify_lockin_partner_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  responder_username text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined') THEN
    SELECT username INTO responder_username FROM profiles WHERE id = NEW.receiver_id;
    
    INSERT INTO notifications (user_id, type, title, message, severity)
    VALUES (
      NEW.sender_id,
      'lockin_request',
      CASE WHEN NEW.status = 'accepted' THEN 'Partner Request Accepted!' ELSE 'Partner Request Declined' END,
      COALESCE(responder_username, 'Your partner') || CASE WHEN NEW.status = 'accepted' THEN ' accepted your lock-in request. Time to grind!' ELSE ' declined your lock-in request.' END,
      CASE WHEN NEW.status = 'accepted' THEN 'info' ELSE 'warning' END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_lockin_partner_response ON lockin_partner_requests;
CREATE TRIGGER trg_notify_lockin_partner_response
  AFTER UPDATE ON lockin_partner_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_lockin_partner_response();

-- Trigger: notify on friend request
CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_username text;
BEGIN
  SELECT username INTO sender_username FROM profiles WHERE id = NEW.sender_id;
  
  INSERT INTO notifications (user_id, type, title, message, severity)
  VALUES (
    NEW.receiver_id,
    'friend',
    'New Friend Request',
    COALESCE(sender_username, 'Someone') || ' wants to be your friend.',
    'info'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_friend_request ON friend_requests;
CREATE TRIGGER trg_notify_friend_request
  AFTER INSERT ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();
