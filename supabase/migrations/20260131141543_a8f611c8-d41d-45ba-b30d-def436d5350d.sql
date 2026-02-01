-- Allow authenticated users to create companies (for signup)
CREATE POLICY "Authenticated users can create companies"
ON public.companies
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to create company_admins (for linking themselves)
CREATE POLICY "Authenticated users can create company_admins"
ON public.company_admins
FOR INSERT
WITH CHECK (auth.uid() = user_id);