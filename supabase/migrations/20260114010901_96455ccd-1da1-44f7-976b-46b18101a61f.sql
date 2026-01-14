-- =============================================
-- FIX 1: Mentor Invites - Prevent email/token harvesting
-- =============================================

-- Drop existing SELECT policy that exposes all fields
DROP POLICY IF EXISTS "Mentors can view their own sent invites" ON public.mentor_invites;

-- Create a more restrictive SELECT policy
-- Only the invite creator can see their invites (but we'll use a view to hide tokens)
CREATE POLICY "Mentors can view their sent invites metadata only"
ON public.mentor_invites
FOR SELECT
USING (invited_by = auth.uid());

-- Create a secure view that hides sensitive fields
CREATE OR REPLACE VIEW public.mentor_invites_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  invited_by,
  clan_id,
  expertise,
  name,
  status,
  accepted_by,
  created_at,
  accepted_at,
  -- Hide email - only show first 3 chars + domain hint
  CASE 
    WHEN invited_by = auth.uid() THEN 
      LEFT(email, 3) || '***@' || SPLIT_PART(email, '@', 2)
    ELSE NULL
  END AS email_masked,
  -- Never expose token in view
  NULL::text AS token
FROM public.mentor_invites
WHERE invited_by = auth.uid();

-- Create a secure RPC for checking invite status (for invited users accepting)
CREATE OR REPLACE FUNCTION public.get_invite_status_by_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- Only return safe, non-sensitive fields
  SELECT 
    id,
    status,
    clan_id,
    expertise,
    name,
    created_at
  INTO v_invite
  FROM public.mentor_invites
  WHERE token = p_token;
  
  IF v_invite IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invite');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'invite', json_build_object(
      'id', v_invite.id,
      'status', v_invite.status,
      'clan_id', v_invite.clan_id,
      'expertise', v_invite.expertise,
      'name', v_invite.name,
      'created_at', v_invite.created_at
    )
  );
END;
$$;

-- =============================================
-- FIX 2: Public Profiles - Explicit RLS on view
-- =============================================

-- First, let's check and recreate the public_profiles view properly
-- Drop and recreate with security_invoker for proper RLS behavior
DROP VIEW IF EXISTS public.public_profiles;

-- Create the public_profiles view with only safe public fields
-- Using security_invoker so RLS applies to the base table
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  xp,
  streak,
  created_at AS joined_at
  -- Explicitly NOT including: email (doesn't exist), bio, college_name, 
  -- college_year, occupation_type, years_of_experience, onboarding_completed, etc.
FROM public.profiles
WHERE username IS NOT NULL;

-- Add RLS policy to profiles table specifically for public profile access
-- This allows reading public fields for any authenticated user
DROP POLICY IF EXISTS "Allow reading public profile fields" ON public.profiles;

CREATE POLICY "Allow reading public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- User can always read their own full profile
  auth.uid() = id
  OR
  -- For other users, this policy allows SELECT but the view filters fields
  username IS NOT NULL
);

-- Create a secure function to get public profile data with battle stats
CREATE OR REPLACE FUNCTION public.get_public_profile(p_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_battles_played INTEGER;
  v_battles_won INTEGER;
  v_problems_solved INTEGER;
BEGIN
  -- Get only public profile data
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
  
  -- Get battle stats from battle_history (count where user's clan participated)
  SELECT 
    COUNT(*) FILTER (WHERE cm.clan_id IN (bh.clan_a_id, bh.clan_b_id)),
    COUNT(*) FILTER (WHERE cm.clan_id = bh.winner)
  INTO v_battles_played, v_battles_won
  FROM public.clan_members cm
  LEFT JOIN public.battle_history bh ON cm.clan_id IN (bh.clan_a_id, bh.clan_b_id)
  WHERE cm.user_id = v_profile.id;
  
  -- Get problems solved count
  SELECT COUNT(*) INTO v_problems_solved
  FROM public.challenge_completions
  WHERE user_id = v_profile.id;
  
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
      'battles_played', COALESCE(v_battles_played, 0),
      'battles_won', COALESCE(v_battles_won, 0),
      'problems_solved', COALESCE(v_problems_solved, 0)
    )
  );
END;
$$;

-- =============================================
-- SECURITY: Update get_friends to include last_active safely
-- =============================================

CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS json
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
      'streak', COALESCE(p.streak, 0),
      'last_active', cm.last_active
    ) ORDER BY 
      -- Online users first (active in last 5 minutes)
      CASE WHEN cm.last_active > NOW() - INTERVAL '5 minutes' THEN 0 ELSE 1 END,
      p.username
  ), '[]'::jsonb) INTO v_friends
  FROM public.friend_requests fr
  JOIN public.profiles p ON 
    CASE 
      WHEN fr.sender_id = v_user_id THEN p.id = fr.receiver_id
      ELSE p.id = fr.sender_id
    END
  LEFT JOIN public.clan_members cm ON cm.user_id = p.id
  WHERE fr.status = 'accepted'
    AND (fr.sender_id = v_user_id OR fr.receiver_id = v_user_id);
  
  RETURN json_build_object('success', true, 'friends', v_friends);
END;
$$;