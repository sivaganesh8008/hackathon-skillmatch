import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const employeeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const companySchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
});

export default function Auth() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"employee" | "company">("employee");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(() => {
          checkUserTypeAndRedirect(session.user.id);
        }, 100);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserTypeAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserTypeAndRedirect = async (userId: string) => {
    // Check if user is a company admin
    const { data: companyAdmin } = await supabase
      .from("company_admins")
      .select("company_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (companyAdmin) {
      navigate("/company-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const validateForm = () => {
    try {
      if (userType === "employee") {
        employeeSchema.parse({ email, password });
      } else {
        if (isLogin) {
          companySchema.pick({ email: true, password: true }).parse({ email, password });
        } else {
          companySchema.parse({ email, password, companyName });
        }
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleEmployeeLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success("Welcome back!");
  };

  const handleCompanyLogin = async () => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (authError) throw authError;

    // Verify this user is a company admin
    const { data: adminData } = await supabase
      .from("company_admins")
      .select("company_id")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (!adminData) {
      await supabase.auth.signOut();
      throw new Error("This account is not registered as a company admin. Please use Company Login.");
    }

    toast.success("Welcome back!");
  };

  const handleCompanySignup = async () => {
    // First create the auth user with auto-confirm enabled
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: companyName, user_type: "company_admin" },
      },
    });
    
    if (authError) throw authError;
    
    if (!authData.user) {
      throw new Error("Failed to create account. Please try again.");
    }

    // Now sign in immediately to get a valid session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) throw signInError;

    // Create company record with authenticated session
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName, email })
      .select()
      .single();
    
    if (companyError) {
      console.error("Company creation error:", companyError);
      throw new Error("Failed to create company. Please try again.");
    }

    // Link user as company admin
    const { error: adminError } = await supabase
      .from("company_admins")
      .insert({ user_id: authData.user.id, company_id: companyData.id });

    if (adminError) {
      console.error("Admin link error:", adminError);
      throw new Error("Failed to set up admin access. Please contact support.");
    }

    // Update the profile with company_id
    await supabase
      .from("profiles")
      .update({ company_id: companyData.id })
      .eq("user_id", authData.user.id);
    
    toast.success("Company account created successfully!");
    navigate("/company-dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (userType === "employee") {
        await handleEmployeeLogin();
      } else {
        if (isLogin) {
          await handleCompanyLogin();
        } else {
          await handleCompanySignup();
        }
      }
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Try logging in instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed") || error.code === "email_not_confirmed") {
        toast.error("Please confirm your email address first. Check your inbox for the confirmation link.");
      } else if (error.message.includes("rate limit") || error.code === "over_email_send_rate_limit") {
        toast.error("Too many attempts. Please wait a few minutes and try again.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setCompanyName("");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-primary/90 to-accent/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-white">SkillMatch AI</h1>
              <p className="text-white/70 text-sm">AI-Powered Talent Matching</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            {userType === "company" 
              ? "Manage your talent pool\nwith precision"
              : "Find the perfect match\nfor every project"}
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            {userType === "company"
              ? "Create and manage employee accounts, track skills, and allocate talent to projects efficiently."
              : "Access your profile, showcase your skills, and get matched with exciting projects."}
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-white/70 text-sm">Match Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">40%</div>
              <div className="text-white/70 text-sm">Faster Allocation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">60%</div>
              <div className="text-white/70 text-sm">Less Bench Time</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2024 SkillMatch AI. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 border-border/50">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">SkillMatch AI</h1>
            </div>
          </div>

          {/* User Type Tabs */}
          <Tabs 
            value={userType} 
            onValueChange={(v) => {
              setUserType(v as "employee" | "company");
              setIsLogin(true);
              resetForm();
            }}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employee" className="gap-2">
                <User className="w-4 h-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="w-4 h-4" />
                Employee
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {userType === "employee" 
                ? "Company Login"
                : isLogin 
                  ? "Employee Login" 
                  : "Register Your Company"}
            </h2>
            <p className="text-muted-foreground">
              {userType === "employee"
                ? "Access your company admin dashboard"
                : isLogin
                  ? "You Need Credientials from Your Company Admin"
                  : "Create an account to manage your employees"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {userType === "company" && !isLogin && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {userType === "employee" 
                    ? "Sign In" 
                    : isLogin 
                      ? "Sign In" 
                      : "Create Company Account"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {userType === "employee" && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? (
                  <>New company? <span className="font-medium text-primary">Register here</span></>
                ) : (
                  <>Already registered? <span className="font-medium text-primary">Sign in</span></>
                )}
              </button>
            </div>
          )}

          {userType === "company" && (
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium">Don't have credentials?</span><br />
                Contact your company administrator to get your login details.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
