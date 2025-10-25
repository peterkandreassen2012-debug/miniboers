-- Add approval status to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Create company_applications table for companies requesting approval
CREATE TABLE IF NOT EXISTS public.company_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  org_number TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  sector TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on company_applications
ALTER TABLE public.company_applications ENABLE ROW LEVEL SECURITY;

-- Company applicants can create their own applications
CREATE POLICY "Users can create company applications"
ON public.company_applications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Company applicants can view their own applications
CREATE POLICY "Users can view own applications"
ON public.company_applications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.company_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.company_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_company_applications_updated_at
  BEFORE UPDATE ON public.company_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing companies to be approved by default (backward compatibility)
UPDATE public.companies SET approved = true WHERE approved IS NULL;