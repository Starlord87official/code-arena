-- Add SELECT policy to mentor_invites table
-- Only the invite creator OR the invited mentor (by email) can read rows
CREATE POLICY "mentor_invites_sender_or_recipient_only"
ON public.mentor_invites
FOR SELECT
USING (
  invited_by = auth.uid()
  OR email = auth.email()
);