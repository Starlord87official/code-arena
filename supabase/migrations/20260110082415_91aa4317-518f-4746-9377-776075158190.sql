-- Remove the email column from profiles table
-- Emails should only be accessed via auth.users (Supabase Auth)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Verify public_profiles view only exposes safe fields (recreate to be sure)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  avatar_url,
  division,
  xp,
  streak,
  created_at as joined_at
FROM public.profiles
WHERE username IS NOT NULL;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Update get_public_profile function to ensure it doesn't return email
CREATE OR REPLACE FUNCTION public.get_public_profile(p_username text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile RECORD;
  v_battles_played INTEGER;
  v_battles_won INTEGER;
BEGIN
  -- Get profile data (no email field)
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
$function$;

-- Update handle_new_user trigger function to not store email in profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;