-- Fix foreign key references to use profiles instead of auth.users

-- Update companies table foreign key
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_approved_by_fkey;
ALTER TABLE public.companies 
ADD CONSTRAINT companies_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update company_applications foreign keys
ALTER TABLE public.company_applications DROP CONSTRAINT IF EXISTS company_applications_user_id_fkey;
ALTER TABLE public.company_applications 
ADD CONSTRAINT company_applications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.company_applications DROP CONSTRAINT IF EXISTS company_applications_reviewed_by_fkey;
ALTER TABLE public.company_applications 
ADD CONSTRAINT company_applications_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update stock_requests foreign key
ALTER TABLE public.stock_requests DROP CONSTRAINT IF EXISTS stock_requests_reviewed_by_fkey;
ALTER TABLE public.stock_requests 
ADD CONSTRAINT stock_requests_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;