-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload their own resumes
CREATE POLICY "Users can upload own resume" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can view own resume
CREATE POLICY "Users can view own resume" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Company admins can view resumes of their employees
CREATE POLICY "Company admins can view employee resumes" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'resumes' 
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id::text = (storage.foldername(name))[1]
    AND p.company_id IN (
      SELECT company_id FROM company_admins WHERE user_id = auth.uid()
    )
  )
);

-- Policy: Company admins can upload resumes for employees
CREATE POLICY "Company admins can upload employee resumes" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id::text = (storage.foldername(name))[1]
    AND p.company_id IN (
      SELECT company_id FROM company_admins WHERE user_id = auth.uid()
    )
  )
);

-- Add github_url column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
