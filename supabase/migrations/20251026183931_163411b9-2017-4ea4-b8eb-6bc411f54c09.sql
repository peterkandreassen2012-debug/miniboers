-- Update RLS policy to allow admins to assign any role, including 'company'
-- The previous policy was too restrictive

DROP POLICY IF EXISTS "Allow role assignment" ON public.user_roles;

-- Create comprehensive policy for role assignment:
-- 1. Admins can insert any role for any user
-- 2. Allow 'investor' role (used by signup trigger)
CREATE POLICY "Allow role assignment by admins and signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Admins can insert any role
    public.has_role(auth.uid(), 'admin')
    OR
    -- Allow inserting 'investor' role (used by signup trigger)
    -- This allows the handle_new_user trigger to work
    role = 'investor'
  );