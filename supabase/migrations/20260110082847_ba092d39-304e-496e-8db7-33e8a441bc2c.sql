-- Remove ALL SELECT policies from invite_codes - no one can read the table
DROP POLICY IF EXISTS "Anyone can check invite codes" ON public.invite_codes;

-- Add a column for hashed codes (we'll store hashed versions)
ALTER TABLE public.invite_codes ADD COLUMN IF NOT EXISTS code_hash text;

-- Create a function to hash codes using SHA256
CREATE OR REPLACE FUNCTION public.hash_invite_code(p_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT encode(sha256(convert_to(UPPER(TRIM(p_code)), 'UTF8')), 'hex')
$$;

-- Update existing codes to store their hashed versions
UPDATE public.invite_codes 
SET code_hash = public.hash_invite_code(code)
WHERE code_hash IS NULL;

-- Update validate_invite_code to use hashed comparison (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code_hash text;
  v_invite_record invite_codes%ROWTYPE;
BEGIN
  -- Hash the input code
  v_code_hash := public.hash_invite_code(p_code);
  
  -- Find by hash instead of plaintext
  SELECT * INTO v_invite_record
  FROM invite_codes
  WHERE code_hash = v_code_hash;

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
$function$;

-- Update claim_invite_code to use hashed comparison (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.claim_invite_code(p_code text, p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code_hash text;
  v_invite_record invite_codes%ROWTYPE;
BEGIN
  -- Hash the input code
  v_code_hash := public.hash_invite_code(p_code);
  
  -- Lock the row for update to prevent race conditions (use hash lookup)
  SELECT * INTO v_invite_record
  FROM invite_codes
  WHERE code_hash = v_code_hash
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

  -- Claim the code - also clear the plaintext code for extra security
  UPDATE invite_codes
  SET 
    used_by = p_user_id,
    used_at = now(),
    is_active = false,
    code = 'CLAIMED_' || LEFT(v_code_hash, 8) -- Obfuscate the original code
  WHERE id = v_invite_record.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Invite code claimed successfully'
  );
END;
$function$;

-- Create index on code_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_invite_codes_hash ON public.invite_codes(code_hash);