-- Create invite_codes table for closed beta access control
CREATE TABLE public.invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can check if a code exists (for validation)
CREATE POLICY "Anyone can check invite codes"
ON public.invite_codes
FOR SELECT
USING (true);

-- Policy: No direct inserts (admin only via dashboard/migration)
-- Policy: No direct updates (handled by function)
-- Policy: No direct deletes

-- Function to validate and claim an invite code atomically
CREATE OR REPLACE FUNCTION public.claim_invite_code(p_code TEXT, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_record invite_codes%ROWTYPE;
  v_result JSON;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO v_invite_record
  FROM invite_codes
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  -- Check if code exists
  IF v_invite_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'invalid_code',
      'message', 'Closed Beta — this invite code is invalid or already used.'
    );
  END IF;

  -- Check if code is active
  IF NOT v_invite_record.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'inactive_code',
      'message', 'Closed Beta — this invite code is invalid or already used.'
    );
  END IF;

  -- Check if code is already used
  IF v_invite_record.used_by IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'already_used',
      'message', 'Closed Beta — this invite code is invalid or already used.'
    );
  END IF;

  -- Claim the code
  UPDATE invite_codes
  SET 
    used_by = p_user_id,
    used_at = now(),
    is_active = false
  WHERE id = v_invite_record.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Invite code claimed successfully'
  );
END;
$$;

-- Function to validate an invite code without claiming (for pre-signup check)
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_record invite_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_invite_record
  FROM invite_codes
  WHERE code = UPPER(TRIM(p_code));

  -- Check if code exists and is valid
  IF v_invite_record.id IS NULL 
     OR NOT v_invite_record.is_active 
     OR v_invite_record.used_by IS NOT NULL THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Closed Beta — this invite code is invalid or already used.'
    );
  END IF;

  RETURN json_build_object(
    'valid', true,
    'message', 'Valid invite code'
  );
END;
$$;

-- Insert some initial invite codes for testing
INSERT INTO public.invite_codes (code) VALUES
  ('BETA2024'),
  ('EARLYBIRD'),
  ('CODELOCK1'),
  ('CODELOCK2'),
  ('CODELOCK3'),
  ('FOUNDER01'),
  ('FOUNDER02'),
  ('FOUNDER03'),
  ('WARRIOR01'),
  ('WARRIOR02');