-- Add left_clan_at column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS left_clan_at timestamp with time zone DEFAULT NULL;

-- Allow students to delete their own clan membership
CREATE POLICY "Students can leave their own clan"
ON public.clan_members
FOR DELETE
USING (user_id = auth.uid());

-- Function to update left_clan_at when a student leaves a clan
CREATE OR REPLACE FUNCTION public.handle_clan_leave()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the left_clan_at timestamp for the user who left
  UPDATE public.profiles
  SET left_clan_at = now()
  WHERE id = OLD.user_id;
  
  RETURN OLD;
END;
$$;

-- Trigger to call handle_clan_leave when a clan member is deleted
CREATE TRIGGER on_clan_member_delete
  BEFORE DELETE ON public.clan_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_clan_leave();

-- Replace the one-clan-per-student function to also enforce 7-day cooldown
CREATE OR REPLACE FUNCTION public.enforce_one_clan_per_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mentor boolean;
  existing_clan_count integer;
  cooldown_end timestamp with time zone;
BEGIN
  -- Skip check if user_id is null
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if user is a mentor (mentors can be in multiple clans and have no cooldown)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'mentor'
  ) INTO is_mentor;

  -- If mentor, allow the insert
  IF is_mentor THEN
    RETURN NEW;
  END IF;

  -- For students, check cooldown period (7 days)
  SELECT left_clan_at + interval '7 days' INTO cooldown_end
  FROM public.profiles
  WHERE id = NEW.user_id AND left_clan_at IS NOT NULL;

  IF cooldown_end IS NOT NULL AND cooldown_end > now() THEN
    RAISE EXCEPTION 'You must wait until % before joining a new clan', cooldown_end;
  END IF;

  -- Check if they're already in a clan
  SELECT COUNT(*) INTO existing_clan_count
  FROM public.clan_members
  WHERE user_id = NEW.user_id;

  IF existing_clan_count > 0 THEN
    RAISE EXCEPTION 'Students can only join one clan at a time';
  END IF;

  RETURN NEW;
END;
$$;