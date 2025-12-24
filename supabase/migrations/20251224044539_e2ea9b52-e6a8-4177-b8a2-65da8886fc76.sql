-- Create a trigger to assign default student role on profile creation
CREATE OR REPLACE FUNCTION public.assign_default_student_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a default student role for the new user
  INSERT INTO public.user_roles (user_id, clan_id, role)
  VALUES (NEW.id, 'global', 'student')
  ON CONFLICT (user_id, clan_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after profile is created
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_student_role();

-- Add unique constraint on user_id, clan_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_clan_id_key'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_clan_id_key UNIQUE (user_id, clan_id);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;