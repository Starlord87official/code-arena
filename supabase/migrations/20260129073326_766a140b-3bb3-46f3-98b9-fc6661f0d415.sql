-- Add challenge_type column to challenges table
ALTER TABLE public.challenges 
ADD COLUMN challenge_type TEXT NOT NULL DEFAULT 'dsa';

-- Create index for efficient filtering
CREATE INDEX idx_challenges_type ON public.challenges(challenge_type);

-- Update existing challenges to have proper challenge_type based on their tags/content
-- All existing challenges default to 'dsa' as per the migration
-- System design and coding challenges can be added later or updated manually

-- Add a check constraint for valid types
ALTER TABLE public.challenges 
ADD CONSTRAINT challenges_type_check 
CHECK (challenge_type IN ('dsa', 'system_design', 'coding'));