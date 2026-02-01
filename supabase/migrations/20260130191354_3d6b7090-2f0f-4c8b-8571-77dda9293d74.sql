-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'project_manager', 'employee');
CREATE TYPE public.proficiency_level AS ENUM ('beginner', 'intermediate', 'expert');
CREATE TYPE public.project_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.project_status AS ENUM ('draft', 'active', 'on_hold', 'completed');
CREATE TYPE public.availability_status AS ENUM ('available', 'partially_available', 'on_project', 'on_leave');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  designation TEXT,
  years_of_experience INTEGER DEFAULT 0,
  availability_status availability_status DEFAULT 'available',
  phone TEXT,
  location TEXT,
  bio TEXT,
  resume_url TEXT,
  readiness_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create skills master table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create employee_skills table (junction table)
CREATE TABLE public.employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  proficiency_level proficiency_level NOT NULL DEFAULT 'beginner',
  years_experience INTEGER DEFAULT 0,
  last_used_date DATE,
  is_primary BOOLEAN DEFAULT false,
  endorsements INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (profile_id, skill_id)
);

-- Create certifications table
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  start_date DATE,
  end_date DATE,
  status project_status DEFAULT 'draft',
  priority project_priority DEFAULT 'medium',
  budget DECIMAL(12,2),
  created_by UUID REFERENCES auth.users(id),
  project_manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create project_required_skills table
CREATE TABLE public.project_required_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  required_proficiency proficiency_level NOT NULL DEFAULT 'intermediate',
  min_experience_years INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (project_id, skill_id)
);

-- Create project_allocations table
CREATE TABLE public.project_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role_in_project TEXT NOT NULL,
  allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  start_date DATE NOT NULL,
  end_date DATE,
  match_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create skill_gap_analysis table
CREATE TABLE public.skill_gap_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE NOT NULL,
  current_level proficiency_level,
  required_level proficiency_level NOT NULL,
  gap_score INTEGER DEFAULT 0,
  recommended_action TEXT,
  learning_resource_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create feedback table for skill score updates
CREATE TABLE public.skill_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_skill_id UUID REFERENCES public.employee_skills(id) ON DELETE CASCADE NOT NULL,
  given_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_feedback ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for skills (public read, admin write)
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_skills
CREATE POLICY "Users can view all employee skills" ON public.employee_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own skills" ON public.employee_skills FOR ALL TO authenticated 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for certifications
CREATE POLICY "Users can view all certifications" ON public.certifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own certifications" ON public.certifications FOR ALL TO authenticated 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for projects
CREATE POLICY "Users can view all projects" ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM and Admin can create projects" ON public.projects FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));
CREATE POLICY "PM and Admin can update projects" ON public.projects FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for project_required_skills
CREATE POLICY "Users can view project requirements" ON public.project_required_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM and Admin can manage requirements" ON public.project_required_skills FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for project_allocations
CREATE POLICY "Users can view allocations" ON public.project_allocations FOR SELECT TO authenticated USING (true);
CREATE POLICY "PM and Admin can manage allocations" ON public.project_allocations FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for skill_gap_analysis
CREATE POLICY "Users can view own gap analysis" ON public.skill_gap_analysis FOR SELECT TO authenticated 
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "PM and Admin can view all gap analysis" ON public.skill_gap_analysis FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));

-- RLS Policies for skill_feedback
CREATE POLICY "Users can view own feedback" ON public.skill_feedback FOR SELECT TO authenticated 
  USING (employee_skill_id IN (
    SELECT es.id FROM public.employee_skills es 
    JOIN public.profiles p ON es.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  ));
CREATE POLICY "PM and Admin can manage feedback" ON public.skill_feedback FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'project_manager'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON public.employee_skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_allocations_updated_at BEFORE UPDATE ON public.project_allocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();