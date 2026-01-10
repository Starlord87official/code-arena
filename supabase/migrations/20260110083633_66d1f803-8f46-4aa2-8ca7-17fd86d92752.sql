-- =============================================
-- SECURE user_roles TABLE
-- =============================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view roles in their clans" ON public.user_roles;

-- Create scoped SELECT policy: user can see their own role OR roles in clans they belong to
CREATE POLICY "Users can view their own or same-clan roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.clan_members cm
    WHERE cm.user_id = auth.uid()
    AND cm.clan_id = user_roles.clan_id
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.clan_id = user_roles.clan_id
  )
);

-- =============================================
-- SECURE invite_codes TABLE (RPC-only access)
-- =============================================

-- Ensure NO client-side SELECT access - all validation via RPC
-- The table already has RLS enabled with no policies, which blocks all access
-- We keep it that way - only SECURITY DEFINER functions can access it

-- Verify existing RPCs are SECURITY DEFINER (they already are from previous migrations)
-- validate_invite_code and claim_invite_code both use SECURITY DEFINER

-- Add explicit restrictive policy to document intent (blocks everything)
DROP POLICY IF EXISTS "No direct access to invite codes" ON public.invite_codes;
CREATE POLICY "No direct access to invite codes"
ON public.invite_codes
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);