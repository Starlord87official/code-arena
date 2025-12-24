
-- Create a trigger function to enforce one-clan-per-student rule
CREATE OR REPLACE FUNCTION public.enforce_one_clan_per_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mentor boolean;
  existing_clan_count integer;
BEGIN
  -- Skip check if user_id is null
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if user is a mentor (mentors can be in multiple clans)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = NEW.user_id AND role = 'mentor'
  ) INTO is_mentor;

  -- If mentor, allow the insert
  IF is_mentor THEN
    RETURN NEW;
  END IF;

  -- For students, check if they're already in a clan
  SELECT COUNT(*) INTO existing_clan_count
  FROM public.clan_members
  WHERE user_id = NEW.user_id;

  IF existing_clan_count > 0 THEN
    RAISE EXCEPTION 'Students can only join one clan at a time';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to run before insert on clan_members
DROP TRIGGER IF EXISTS enforce_one_clan_per_student_trigger ON public.clan_members;
CREATE TRIGGER enforce_one_clan_per_student_trigger
  BEFORE INSERT ON public.clan_members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_one_clan_per_student();

-- Add a comment explaining the rule
COMMENT ON FUNCTION public.enforce_one_clan_per_student() IS 'Enforces that students can only be members of one clan at a time. Mentors are exempt from this rule.';
