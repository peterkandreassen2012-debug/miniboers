-- Fix RLS policies for companies table to allow admins to create company profiles

-- Drop existing insert policy
DROP POLICY IF EXISTS "Company owners can create companies" ON public.companies;

-- Create new policy that allows both company owners and admins to insert
CREATE POLICY "Company owners and admins can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (
    -- Company owners can create their own companies
    (auth.uid() = owner_id AND has_role(auth.uid(), 'company'))
    OR
    -- Admins can create companies for any user
    has_role(auth.uid(), 'admin')
  );

-- Update profiles table to allow admins to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Ensure admins can update profiles if needed
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));