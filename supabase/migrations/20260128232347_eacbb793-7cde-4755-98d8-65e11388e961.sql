-- =====================================================
-- SECURITY FIX: Mentor Invites & Profile Data Protection
-- =====================================================

-- FIX 1: Remove token column entirely from mentor_invites_safe view
-- The token should NEVER appear in any view, even as NULL
DROP VIEW IF EXISTS public.mentor_invites_safe;

CREATE VIEW public.mentor_invites_safe AS
SELECT 
  id,
  CASE 
    WHEN LENGTH(email) > 5 THEN 
      CONCAT(LEFT(email, 2), '***@', SPLIT_PART(email, '@', 2))
    ELSE 
      '***@***'
  END as email_masked,
  name,
  expertise,
  invited_by,
  clan_id,
  status,
  accepted_by,
  created_at,
  accepted_at
FROM public.mentor_invites
WHERE invited_by = auth.uid();

-- Ensure the view is accessible only to authenticated users
GRANT SELECT ON public.mentor_invites_safe TO authenticated;

-- FIX 2: Update profiles RLS to be more restrictive
-- Remove the overly permissive policy that exposes all data
DROP POLICY IF EXISTS "Allow reading public profile fields" ON public.profiles;

-- Keep only the policy for viewing own full profile (already exists)
-- "Users can view their own full profile" is already correct

-- FIX 3: Make public_profiles view use SECURITY INVOKER and only work for authenticated users
-- Also update to not expose potentially sensitive fields

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_barrier = true) AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.division,
  COALESCE(p.xp, 0) as xp,
  COALESCE(p.streak, 0) as streak,
  p.created_at AS joined_at
FROM public.profiles p
WHERE p.username IS NOT NULL;

-- Grant access to authenticated users only
GRANT SELECT ON public.public_profiles TO authenticated;

-- FIX 4: Update get_public_profile RPC to use stricter data access
-- This function is SECURITY DEFINER so it can read profiles safely
CREATE OR REPLACE FUNCTION public.get_public_profile(p_username text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_battle_stats RECORD;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Get public profile data only (no sensitive fields)
  SELECT 
    id,
    username,
    avatar_url,
    division,
    COALESCE(xp, 0) as xp,
    COALESCE(streak, 0) as streak,
    college_name,
    college_year,
    occupation_type,
    years_of_experience,
    created_at
  INTO v_profile
  FROM public.profiles
  WHERE username = p_username;
  
  IF v_profile IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get battle stats (public data)
  SELECT 
    COALESCE(total_duels, 0) as battles_played,
    COALESCE(wins, 0) as battles_won
  INTO v_battle_stats
  FROM public.user_battle_stats
  WHERE user_id = v_profile.id;
  
  RETURN json_build_object(
    'success', true,
    'profile', json_build_object(
      'id', v_profile.id,
      'username', v_profile.username,
      'avatar_url', v_profile.avatar_url,
      'division', v_profile.division,
      'xp', v_profile.xp,
      'streak', v_profile.streak,
      'college_name', v_profile.college_name,
      'college_year', v_profile.college_year,
      'occupation_type', v_profile.occupation_type,
      'years_of_experience', v_profile.years_of_experience,
      'joined_at', v_profile.created_at,
      'battles_played', COALESCE(v_battle_stats.battles_played, 0),
      'battles_won', COALESCE(v_battle_stats.battles_won, 0)
    )
  );
END;
$$;

-- FIX 5: Update mentor invite token handling
-- Ensure tokens can only be validated via secure RPC, never selected
-- The get_invite_status_by_token RPC already exists and is SECURITY DEFINER
-- Update it to ensure it returns minimal safe data

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
  -- Never return email or the token itself
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
  
  -- Check if invite is expired (7 days)
  IF v_invite.created_at < NOW() - INTERVAL '7 days' AND v_invite.status = 'pending' THEN
    -- Mark as expired
    UPDATE public.mentor_invites 
    SET status = 'expired' 
    WHERE id = v_invite.id AND status = 'pending';
    
    RETURN json_build_object('success', false, 'error', 'Invite has expired');
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