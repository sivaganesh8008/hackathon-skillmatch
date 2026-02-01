-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Add company_id to profiles table to link employees to companies
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Create company_admins table to track which users are company admins
CREATE TABLE public.company_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS on company_admins
ALTER TABLE public.company_admins ENABLE ROW LEVEL SECURITY;

-- Function to check if user is a company admin
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_admins
    WHERE user_id = _user_id AND company_id = _company_id
  )
$$;

-- Function to get user's company_id (if they are an admin)
CREATE OR REPLACE FUNCTION public.get_admin_company_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_admins WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for companies
CREATE POLICY "Company admins can view their company"
ON public.companies
FOR SELECT
USING (is_company_admin(auth.uid(), id));

CREATE POLICY "Company admins can update their company"
ON public.companies
FOR UPDATE
USING (is_company_admin(auth.uid(), id));

-- RLS Policies for company_admins
CREATE POLICY "Admins can view company_admins in their company"
ON public.company_admins
FOR SELECT
USING (is_company_admin(auth.uid(), company_id) OR user_id = auth.uid());

-- Update profiles RLS to allow company admins to manage employees
CREATE POLICY "Company admins can view their company employees"
ON public.profiles
FOR SELECT
USING (
  company_id IS NOT NULL AND 
  is_company_admin(auth.uid(), company_id)
);

CREATE POLICY "Company admins can update their company employees"
ON public.profiles
FOR UPDATE
USING (
  company_id IS NOT NULL AND 
  is_company_admin(auth.uid(), company_id)
);

-- Trigger for updated_at on companies
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();