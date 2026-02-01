import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, Building2, Mail, Key, Eye, EyeOff, Search, Loader2, Trash2, Upload, Download, FileText, Github } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const employeeSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().optional(),
  department: z.string().optional(),
  githubUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  designation: string | null;
  department: string | null;
  availability_status: string | null;
  created_at: string;
  resume_url: string | null;
  github_url: string | null;
}

interface Company {
  id: string;
  name: string;
  email: string;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    designation: "",
    department: "",
    githubUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is a company admin
    const { data: adminData, error: adminError } = await supabase
      .from("company_admins")
      .select("company_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      navigate("/dashboard");
      return;
    }

    // Load company details
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", adminData.company_id)
      .single();

    if (companyData) {
      setCompany(companyData);
      loadEmployees(companyData.id);
    }

    setLoading(false);
  };

  const loadEmployees = async (companyId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, email, designation, department, availability_status, created_at, resume_url, github_url")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEmployees(data);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const validateForm = () => {
    try {
      employeeSchema.parse(formData);
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

  const handleCreateEmployee = async () => {
    if (!validateForm() || !company) return;

    setCreating(true);
    try {
      // Create auth user using admin API endpoint via edge function would be ideal
      // For now, we'll use signUp but immediately sign back in as admin
      const currentSession = await supabase.auth.getSession();
      
      // Create the new employee user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.fullName,
            company_id: company.id,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Sign back in as admin immediately
        if (currentSession.data.session) {
          await supabase.auth.setSession({
            access_token: currentSession.data.session.access_token,
            refresh_token: currentSession.data.session.refresh_token,
          });
        }

        // Wait a moment for the profile trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update the profile with company info
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            company_id: company.id,
            designation: formData.designation || null,
            department: formData.department || null,
            github_url: formData.githubUrl || null,
          })
          .eq("user_id", authData.user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
        }

        // Upload resume if provided
        if (resumeFile && authData.user) {
          const fileExt = resumeFile.name.split('.').pop();
          const filePath = `${authData.user.id}/resume.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, resumeFile, { upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('resumes')
              .getPublicUrl(filePath);
            
            await supabase
              .from("profiles")
              .update({ resume_url: urlData.publicUrl })
              .eq("user_id", authData.user.id);
          }
        }
      }

      toast.success(
        `Employee created successfully!\n\nCredentials:\nEmail: ${formData.email}\nPassword: ${formData.password}`,
        { duration: 15000 }
      );

      setDialogOpen(false);
      setFormData({ email: "", password: "", fullName: "", designation: "", department: "", githubUrl: "" });
      setResumeFile(null);
      
      // Refresh employee list
      loadEmployees(company.id);
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleExportEmployees = () => {
    if (employees.length === 0) {
      toast.error("No employees to export");
      return;
    }

    const headers = ["Name", "Email", "Designation", "Department", "Status", "GitHub"];
    const csvContent = [
      headers.join(","),
      ...employees.map(emp => [
        `"${emp.full_name}"`,
        emp.email,
        emp.designation || "",
        emp.department || "",
        emp.availability_status || "available",
        emp.github_url || "",
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${company?.name || "export"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Employees exported successfully");
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").slice(1); // Skip header
        let imported = 0;
        let failed = 0;

        for (const line of lines) {
          if (!line.trim()) continue;
          
          const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!parts || parts.length < 2) continue;

          const name = parts[0]?.replace(/"/g, "").trim();
          const email = parts[1]?.trim();
          const designation = parts[2]?.trim() || "";
          const department = parts[3]?.trim() || "";

          if (!name || !email) continue;

          // Generate password
          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
          let password = "";
          for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
          }

          try {
            const currentSession = await supabase.auth.getSession();
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { full_name: name, company_id: company.id },
              },
            });

            if (authError) throw authError;

            if (authData.user && currentSession.data.session) {
              await supabase.auth.setSession({
                access_token: currentSession.data.session.access_token,
                refresh_token: currentSession.data.session.refresh_token,
              });

              await new Promise(resolve => setTimeout(resolve, 300));

              await supabase
                .from("profiles")
                .update({
                  company_id: company.id,
                  designation: designation || null,
                  department: department || null,
                })
                .eq("user_id", authData.user.id);
            }

            imported++;
            console.log(`Imported: ${email} - Password: ${password}`);
          } catch (err) {
            console.error(`Failed to import ${email}:`, err);
            failed++;
          }
        }

        toast.success(`Import complete: ${imported} added, ${failed} failed`);
        loadEmployees(company.id);
      } catch (err) {
        toast.error("Failed to parse CSV file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{company?.name}</h1>
            <p className="text-xs text-muted-foreground">Company Admin</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {employees.filter((e) => e.availability_status === "available").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Project</p>
                <p className="text-2xl font-bold">
                  {employees.filter((e) => e.availability_status === "on_project").length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Employee Management */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Employee Management</h2>
              <p className="text-sm text-muted-foreground">Create and manage employee accounts</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImportCSV}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportEmployees}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Employee Account</DialogTitle>
                    <DialogDescription>
                      Create login credentials for a new employee. They will use these to access their dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="empEmail"
                          type="email"
                          placeholder="employee@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="empPassword">Password</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="empPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                          id="designation"
                          placeholder="Software Engineer"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          placeholder="Engineering"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">GitHub Profile (Optional)</Label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="githubUrl"
                          type="url"
                          placeholder="https://github.com/username"
                          value={formData.githubUrl}
                          onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                      {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Resume (Optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                          className="flex-1"
                        />
                        {resumeFile && (
                          <Badge variant="secondary" className="gap-1">
                            <FileText className="w-3 h-3" />
                            {resumeFile.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateEmployee} disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Employee"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>

          {/* Employee List */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No employees found</p>
              <p className="text-sm">Create your first employee account to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium">
                    {employee.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{employee.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{employee.email}</p>
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {employee.designation || "—"}
                  </div>
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {employee.department || "—"}
                  </div>
                  {employee.github_url && (
                    <a href={employee.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {employee.resume_url && (
                    <a href={employee.resume_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                  <Badge
                    variant={employee.availability_status === "available" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {employee.availability_status?.replace("_", " ") || "available"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
