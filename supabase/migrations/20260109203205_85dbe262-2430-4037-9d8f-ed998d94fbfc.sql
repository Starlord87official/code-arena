-- Create friend request status enum
CREATE TYPE public.friend_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.friend_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id),
  CONSTRAINT no_self_friend CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view friend requests they sent or received
CREATE POLICY "Users can view their friend requests"
ON public.friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
ON public.friend_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id AND status = 'pending');

-- Only receiver can update (accept/reject) friend requests
CREATE POLICY "Receiver can update friend requests"
ON public.friend_requests FOR UPDATE
USING (auth.uid() = receiver_id AND status = 'pending');

-- Users can delete their own sent requests or rejected requests
CREATE POLICY "Users can delete friend requests"
ON public.friend_requests FOR DELETE
USING (
  (auth.uid() = sender_id) OR 
  (auth.uid() = receiver_id AND status != 'accepted')
);

-- Create indexes for efficient querying
CREATE INDEX idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests(status);

-- Add trigger for updated_at
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to get user's public profile by username
CREATE OR REPLACE FUNCTION public.get_public_profile(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_battles_played INTEGER;
  v_battles_won INTEGER;
BEGIN
  -- Get profile data
  SELECT 
    id,
    username,
    avatar_url,
    division,
    xp,
    streak,
    college_name,
    college_year,
    occupation_type,
    years_of_experience,
    created_at
  INTO v_profile
  FROM public.profiles
  WHERE LOWER(username) = LOWER(p_username);
  
  IF v_profile IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get battles played (mock for now - can be updated with real battle tracking)
  v_battles_played := 0;
  v_battles_won := 0;
  
  RETURN json_build_object(
    'success', true,
    'profile', json_build_object(
      'id', v_profile.id,
      'username', v_profile.username,
      'avatar_url', v_profile.avatar_url,
      'division', v_profile.division,
      'xp', COALESCE(v_profile.xp, 0),
      'streak', COALESCE(v_profile.streak, 0),
      'college_name', v_profile.college_name,
      'college_year', v_profile.college_year,
      'occupation_type', v_profile.occupation_type,
      'years_of_experience', v_profile.years_of_experience,
      'joined_at', v_profile.created_at,
      'battles_played', v_battles_played,
      'battles_won', v_battles_won
    )
  );
END;
$$;

-- Function to send friend request
CREATE OR REPLACE FUNCTION public.send_friend_request(p_receiver_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id UUID;
  v_existing RECORD;
BEGIN
  v_sender_id := auth.uid();
  
  IF v_sender_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  IF v_sender_id = p_receiver_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot send friend request to yourself');
  END IF;
  
  -- Check if request already exists
  SELECT * INTO v_existing
  FROM public.friend_requests
  WHERE (sender_id = v_sender_id AND receiver_id = p_receiver_id)
     OR (sender_id = p_receiver_id AND receiver_id = v_sender_id);
  
  IF v_existing IS NOT NULL THEN
    IF v_existing.status = 'accepted' THEN
      RETURN json_build_object('success', false, 'error', 'Already friends');
    ELSIF v_existing.status = 'pending' THEN
      RETURN json_build_object('success', false, 'error', 'Friend request already pending');
    END IF;
  END IF;
  
  -- Insert new friend request
  INSERT INTO public.friend_requests (sender_id, receiver_id, status)
  VALUES (v_sender_id, p_receiver_id, 'pending')
  ON CONFLICT (sender_id, receiver_id) DO UPDATE SET status = 'pending', updated_at = now();
  
  RETURN json_build_object('success', true, 'message', 'Friend request sent');
END;
$$;

-- Function to respond to friend request
CREATE OR REPLACE FUNCTION public.respond_friend_request(p_request_id UUID, p_accept BOOLEAN)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_request RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get the request
  SELECT * INTO v_request
  FROM public.friend_requests
  WHERE id = p_request_id AND receiver_id = v_user_id AND status = 'pending';
  
  IF v_request IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Request not found or already processed');
  END IF;
  
  -- Update the request
  UPDATE public.friend_requests
  SET status = CASE WHEN p_accept THEN 'accepted'::friend_status ELSE 'rejected'::friend_status END,
      updated_at = now()
  WHERE id = p_request_id;
  
  RETURN json_build_object(
    'success', true, 
    'message', CASE WHEN p_accept THEN 'Friend request accepted' ELSE 'Friend request rejected' END
  );
END;
$$;

-- Function to get friend requests for current user
CREATE OR REPLACE FUNCTION public.get_friend_requests()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_incoming JSONB;
  v_outgoing JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get incoming requests
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', fr.id,
      'sender_id', fr.sender_id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'division', p.division,
      'created_at', fr.created_at
    ) ORDER BY fr.created_at DESC
  ), '[]'::jsonb) INTO v_incoming
  FROM public.friend_requests fr
  JOIN public.profiles p ON p.id = fr.sender_id
  WHERE fr.receiver_id = v_user_id AND fr.status = 'pending';
  
  -- Get outgoing requests
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', fr.id,
      'receiver_id', fr.receiver_id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'division', p.division,
      'created_at', fr.created_at
    ) ORDER BY fr.created_at DESC
  ), '[]'::jsonb) INTO v_outgoing
  FROM public.friend_requests fr
  JOIN public.profiles p ON p.id = fr.receiver_id
  WHERE fr.sender_id = v_user_id AND fr.status = 'pending';
  
  RETURN json_build_object(
    'success', true,
    'incoming', v_incoming,
    'outgoing', v_outgoing
  );
END;
$$;

-- Function to get friendship status between current user and another user
CREATE OR REPLACE FUNCTION public.get_friendship_status(p_other_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_request RECORD;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('status', 'not_logged_in');
  END IF;
  
  IF v_user_id = p_other_user_id THEN
    RETURN json_build_object('status', 'self');
  END IF;
  
  -- Check for any friend request between the two users
  SELECT * INTO v_request
  FROM public.friend_requests
  WHERE (sender_id = v_user_id AND receiver_id = p_other_user_id)
     OR (sender_id = p_other_user_id AND receiver_id = v_user_id);
  
  IF v_request IS NULL THEN
    RETURN json_build_object('status', 'none');
  END IF;
  
  IF v_request.status = 'accepted' THEN
    RETURN json_build_object('status', 'friends');
  ELSIF v_request.status = 'pending' THEN
    IF v_request.sender_id = v_user_id THEN
      RETURN json_build_object('status', 'pending_sent', 'request_id', v_request.id);
    ELSE
      RETURN json_build_object('status', 'pending_received', 'request_id', v_request.id);
    END IF;
  ELSE
    RETURN json_build_object('status', 'none');
  END IF;
END;
$$;

-- Function to get friends list
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_friends JSONB;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'division', p.division,
      'xp', COALESCE(p.xp, 0),
      'streak', COALESCE(p.streak, 0)
    ) ORDER BY p.username
  ), '[]'::jsonb) INTO v_friends
  FROM public.friend_requests fr
  JOIN public.profiles p ON 
    CASE 
      WHEN fr.sender_id = v_user_id THEN p.id = fr.receiver_id
      ELSE p.id = fr.sender_id
    END
  WHERE fr.status = 'accepted'
    AND (fr.sender_id = v_user_id OR fr.receiver_id = v_user_id);
  
  RETURN json_build_object('success', true, 'friends', v_friends);
END;
$$;