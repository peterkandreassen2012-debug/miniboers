-- Fix RLS policy to allow trigger-based inserts during signup
-- The issue is that during signup, auth.uid() is NULL in the trigger context

-- Drop the current policy
DROP POLICY IF EXISTS "Allow role assignment during signup and by admins" ON public.user_roles;

-- Create a new policy that works for both authenticated users and trigger context
-- We allow inserts when:
-- 1. An admin is doing it
-- 2. The role is 'investor' (default role during signup)
CREATE POLICY "Allow role assignment"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Admins can insert any role
    public.has_role(auth.uid(), 'admin')
    OR
    -- Allow inserting 'investor' role (used by signup trigger)
    role = 'investor'
  );

-- Create table for complaints about rejected applications
CREATE TABLE IF NOT EXISTS public.application_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.company_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on complaints table
ALTER TABLE public.application_complaints ENABLE ROW LEVEL SECURITY;

-- Users can create complaints for their own applications
CREATE POLICY "Users can create complaints for own applications"
  ON public.application_complaints FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Users can view their own complaints
CREATE POLICY "Users can view own complaints"
  ON public.application_complaints FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all complaints
CREATE POLICY "Admins can view all complaints"
  ON public.application_complaints FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update complaints (mark as resolved)
CREATE POLICY "Admins can update complaints"
  ON public.application_complaints FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));