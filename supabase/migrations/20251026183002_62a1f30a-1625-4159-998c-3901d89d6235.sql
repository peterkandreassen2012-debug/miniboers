-- Fix RLS policy for user_roles to allow initial role assignment during signup
-- The handle_new_user trigger needs to insert roles, but the current policy blocks it

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a new policy that allows:
-- 1. Admins to insert any role for any user
-- 2. The system to insert the default 'investor' role during signup
CREATE POLICY "Allow role assignment during signup and by admins"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admins can insert any role
    public.has_role(auth.uid(), 'admin')
    OR
    -- During signup, allow inserting investor role for the new user
    (role = 'investor' AND user_id = auth.uid())
  );