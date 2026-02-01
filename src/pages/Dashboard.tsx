import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderKanban, Sparkles, Clock, TrendingUp, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmployeeCard } from "@/components/shared/EmployeeCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { SkillDistributionChart } from "@/components/charts/SkillDistributionChart";
import { BenchUtilizationChart } from "@/components/charts/BenchUtilizationChart";
import { supabase } from "@/integrations/supabase/client";

// Mock data for demonstration
const mockSkillDistribution = [
  { name: "Frontend", value: 45, color: "" },
  { name: "Backend", value: 38, color: "" },
  { name: "DevOps", value: 22, color: "" },
  { name: "Data Science", value: 18, color: "" },
  { name: "Mobile", value: 15, color: "" },
];

const mockUtilizationData = [
  { month: "Jan", onProject: 85, bench: 15 },
  { month: "Feb", onProject: 78, bench: 22 },
  { month: "Mar", onProject: 82, bench: 18 },
  { month: "Apr", onProject: 90, bench: 10 },
  { month: "May", onProject: 88, bench: 12 },
  { month: "Jun", onProject: 92, bench: 8 },
];

const mockBenchEmployees = [
  {
    id: "1",
    name: "Sarah Chen",
    designation: "Senior React Developer",
    department: "Engineering",
    location: "San Francisco",
    availability: "available" as const,
    yearsExperience: 6,
    readinessScore: 92,
    skills: [
      { name: "React", level: "expert" as const },
      { name: "TypeScript", level: "expert" as const },
      { name: "Node.js", level: "intermediate" as const },
    ],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    designation: "Full Stack Developer",
    department: "Engineering",
    location: "New York",
    availability: "available" as const,
    yearsExperience: 4,
    readinessScore: 85,
    skills: [
      { name: "Python", level: "expert" as const },
      { name: "React", level: "intermediate" as const },
      { name: "AWS", level: "intermediate" as const },
    ],
  },
];

const mockActiveProjects = [
  {
    id: "1",
    name: "E-Commerce Platform Redesign",
    clientName: "RetailMax Inc.",
    status: "active" as const,
    priority: "high" as const,
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    teamSize: 8,
    requiredSkills: ["React", "Node.js", "PostgreSQL"],
    matchedCandidates: 5,
    progress: 45,
  },
  {
    id: "2",
    name: "Mobile Banking App",
    clientName: "FinServe Bank",
    status: "active" as const,
    priority: "critical" as const,
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    teamSize: 12,
    requiredSkills: ["React Native", "TypeScript", "Firebase"],
    matchedCandidates: 3,
    progress: 28,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your talent pool and project allocations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value="248"
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 12, label: "vs last month" }}
            variant="primary"
          />
          <StatCard
            title="Active Projects"
            value="18"
            icon={<FolderKanban className="w-6 h-6" />}
            trend={{ value: 8, label: "vs last month" }}
            variant="accent"
          />
          <StatCard
            title="On Bench"
            value="24"
            subtitle="Ready for allocation"
            icon={<Clock className="w-6 h-6" />}
            variant="default"
          />
          <StatCard
            title="AI Matches Today"
            value="47"
            icon={<Sparkles className="w-6 h-6" />}
            trend={{ value: 23, label: "vs yesterday" }}
            variant="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Skill Distribution</h3>
                <p className="text-sm text-muted-foreground">By category</p>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
            <SkillDistributionChart data={mockSkillDistribution} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Bench Utilization</h3>
                <p className="text-sm text-muted-foreground">Last 6 months</p>
              </div>
              <UserCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <BenchUtilizationChart data={mockUtilizationData} />
          </Card>
        </div>

        {/* Bench Employees & Active Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bench Employees */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Available Talent</h3>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {mockBenchEmployees.map((employee) => (
                <EmployeeCard key={employee.id} {...employee} />
              ))}
            </div>
          </div>

          {/* Active Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Active Projects</h3>
              <button className="text-sm text-primary hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {mockActiveProjects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}