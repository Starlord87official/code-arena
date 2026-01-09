-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS primary_roadmap text DEFAULT 'dsa',
ADD COLUMN IF NOT EXISTS college_name text,
ADD COLUMN IF NOT EXISTS college_year text,
ADD COLUMN IF NOT EXISTS occupation_type text, -- 'student' or 'professional'
ADD COLUMN IF NOT EXISTS years_of_experience integer;

-- Create index for faster onboarding checks
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(id, onboarding_completed);