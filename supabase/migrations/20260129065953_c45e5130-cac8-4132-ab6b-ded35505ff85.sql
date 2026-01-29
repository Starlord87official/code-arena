-- Add explicit deny-all SELECT policy on mentor_invites
-- This satisfies security scanners while keeping all reads through masked RPCs
CREATE POLICY "mentor_invites_no_select"
ON public.mentor_invites
FOR SELECT
USING (false);