import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { supabase } from "@/integrations/supabase/client";

/* ================= FULL MOCK DATA ================= */
const mockProjects = [
  {
    id: "1",
    name: "E-Commerce Platform Redesign",
    description:
      "Complete overhaul of the RetailMax e-commerce platform with modern tech stack and improved UX.",
    clientName: "RetailMax Inc.",
    status: "active" as const,
    priority: "high" as const,
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    teamSize: 8,
    requiredSkills: ["React", "Node.js", "PostgreSQL", "AWS"],
    matchedCandidates: 5,
    progress: 45,
  },
  {
    id: "2",
    name: "Mobile Banking App",
    description:
      "Develop a secure, user-friendly mobile banking application for iOS and Android platforms.",
    clientName: "FinServe Bank",
    status: "active" as const,
    priority: "critical" as const,
    startDate: "2024-02-01",
    endDate: "2024-08-15",
    teamSize: 12,
    requiredSkills: ["React Native", "TypeScript", "Firebase", "Node.js"],
    matchedCandidates: 3,
    progress: 28,
  },
  {
    id: "3",
    name: "AI Customer Service Bot",
    description:
      "Implement an AI-powered customer service chatbot for enterprise clients.",
    clientName: "TechCorp Solutions",
    status: "draft" as const,
    priority: "medium" as const,
    startDate: "2024-04-01",
    endDate: "2024-09-30",
    teamSize: 5,
    requiredSkills: ["Python", "TensorFlow", "NLP", "FastAPI"],
    matchedCandidates: 8,
    progress: 0,
  },
  {
    id: "4",
    name: "Cloud Migration Project",
    description:
      "Migrate legacy on-premise infrastructure to AWS cloud with zero downtime.",
    clientName: "Global Logistics Co.",
    status: "active" as const,
    priority: "high" as const,
    startDate: "2024-01-01",
    endDate: "2024-05-15",
    teamSize: 6,
    requiredSkills: ["AWS", "Terraform", "Kubernetes", "Docker"],
    matchedCandidates: 4,
    progress: 72,
  },
  {
    id: "5",
    name: "Data Analytics Platform",
    description:
      "Build a comprehensive data analytics and reporting platform for business intelligence.",
    clientName: "DataDriven Inc.",
    status: "on_hold" as const,
    priority: "low" as const,
    startDate: "2024-03-01",
    endDate: "2024-10-31",
    teamSize: 7,
    requiredSkills: ["Python", "Spark", "Tableau", "PostgreSQL"],
    matchedCandidates: 6,
    progress: 15,
  },
  {
    id: "6",
    name: "Healthcare Portal",
    description:
      "Patient management and telehealth portal for healthcare providers.",
    clientName: "MediCare Health",
    status: "completed" as const,
    priority: "medium" as const,
    startDate: "2023-08-01",
    endDate: "2024-01-31",
    teamSize: 10,
    requiredSkills: ["React", "Node.js", "MongoDB", "WebRTC"],
    matchedCandidates: 0,
    progress: 100,
  },
];

/* ================= SAFE INSERT HELPER ================= */
const safeInsertProject = async (payload: Record<string, any>) => {
  let currentPayload = { ...payload };

  while (true) {
    const { data, error } = await supabase
      .from("projects")
      .insert(currentPayload)
      .select()
      .single();

    if (!error) return data;

    // detect missing column
    const match = error.message.match(/'(.+?)'/);
    if (!match) throw error;

    const missingColumn = match[1];
    console.warn(`Column "${missingColumn}" missing, removing and retrying`);
    delete currentPayload[missingColumn];

    if (Object.keys(currentPayload).length === 0) {
      throw new Error("No valid columns left to insert");
    }
  }
};

/* ================= COMPONENT ================= */
export default function Projects() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  /* ---- Form State ---- */
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    clientName: "",
    priority: "medium",
    startDate: "",
    endDate: "",
    teamSize: "",
    requiredSkills: "",
  });
  const setValue = (k: string, v: string) =>
    setForm({ ...form, [k]: v });

  /* ================= AUTH + FETCH DB ================= */
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.from("projects").select("*");
      setDbProjects(data || []);
      setLoading(false);
    };

    init();
  }, [navigate]);

  /* ================= SAVE PROJECT ================= */
  const saveProject = async () => {
    if (!form.name) {
      alert("Project name required");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name,
      description: form.description,
      client_name: form.clientName,
      priority: form.priority,
      status: "draft",
      start_date: form.startDate || null,
      end_date: form.endDate || null,
      team_size: Number(form.teamSize) || null,
      required_skills: form.requiredSkills
        ? form.requiredSkills.split(",").map((s) => s.trim())
        : [],
    };

    try {
      const saved = await safeInsertProject(payload);
      setDbProjects((prev) => [...prev, saved]);
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        clientName: "",
        priority: "medium",
        startDate: "",
        endDate: "",
        teamSize: "",
        requiredSkills: "",
      });
    } catch (err: any) {
      alert(err.message);
    }

    setSaving(false);
  };

  /* ================= COMBINE MOCK + DB ================= */
  const allProjects = [
    ...mockProjects,
    ...dbProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      clientName: p.client_name,
      status: p.status,
      priority: p.priority,
      startDate: p.start_date,
      endDate: p.end_date,
      teamSize: p.team_size,
      requiredSkills: p.required_skills || [],
      matchedCandidates: 0,
      progress: p.progress ?? 0,
    })),
  ];

  /* ================= FILTER PROJECTS ================= */
  const filteredProjects = allProjects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requiredSkills.some((s: string) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesPriority =
      priorityFilter === "all" || p.priority === priorityFilter;

    const matchesTab = activeTab === "all" || p.status === activeTab;

    return matchesSearch && matchesPriority && matchesTab;
  });

  const getTabCount = (status: string) =>
    status === "all"
      ? allProjects.length
      : allProjects.filter((p) => p.status === status).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <AppLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage project requirements and team allocations
            </p>
          </div>

          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* CREATE PROJECT FORM */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3 bg-background">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Project</h2>
              <X
                className="cursor-pointer"
                onClick={() => setShowForm(false)}
              />
            </div>

            <Input
              placeholder="Project Name"
              value={form.name}
              onChange={(e) => setValue("name", e.target.value)}
            />
            <Input
              placeholder="Client Name"
              value={form.clientName}
              onChange={(e) => setValue("clientName", e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setValue("description", e.target.value)}
            />
            <Input
              placeholder="Skills (comma separated)"
              value={form.requiredSkills}
              onChange={(e) => setValue("requiredSkills", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Team Size"
              value={form.teamSize}
              onChange={(e) => setValue("teamSize", e.target.value)}
            />

            <div className="flex gap-2">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setValue("startDate", e.target.value)}
              />
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setValue("endDate", e.target.value)}
              />
            </div>

            <Select
              value={form.priority}
              onValueChange={(v) => setValue("priority", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={saveProject} disabled={saving}>
              {saving ? "Saving..." : "Save Project"}
            </Button>
          </div>
        )}

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({getTabCount("all")})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* FILTERS */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, client, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PROJECTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-muted-foreground">
            No projects found
          </p>
        )}
      </div>
    </AppLayout>
  );
}
