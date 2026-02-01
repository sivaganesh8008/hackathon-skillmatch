import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Grid, List, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmployeeCard } from "@/components/shared/EmployeeCard";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx"; // for Excel import/export

// Mock data
const mockEmployees = [
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
      { name: "GraphQL", level: "intermediate" as const },
    ],
    githubLink: "", // added GitHub link
    resumeFile: null as File | null,
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
    githubLink: "",
    resumeFile: null,
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    designation: "DevOps Engineer",
    department: "Infrastructure",
    location: "Austin",
    availability: "on_project" as const,
    yearsExperience: 5,
    readinessScore: 78,
    skills: [
      { name: "Kubernetes", level: "expert" as const },
      { name: "Terraform", level: "expert" as const },
      { name: "AWS", level: "expert" as const },
    ],
  },
  {
    id: "4",
    name: "James Park",
    designation: "Data Scientist",
    department: "Data",
    location: "Seattle",
    availability: "partially_available" as const,
    yearsExperience: 3,
    readinessScore: 88,
    skills: [
      { name: "Python", level: "expert" as const },
      { name: "TensorFlow", level: "intermediate" as const },
      { name: "SQL", level: "expert" as const },
    ],
  },
    {
    id: "5",
    name: "Lisa Wang",
    designation: "Mobile Developer",
    department: "Engineering",
    location: "Los Angeles",
    availability: "available" as const,
    yearsExperience: 4,
    readinessScore: 90,
    skills: [
      { name: "React Native", level: "expert" as const },
      { name: "Swift", level: "intermediate" as const },
      { name: "Kotlin", level: "beginner" as const },
    ],
  },
  {
    id: "6",
    name: "David Kim",
    designation: "Backend Engineer",
    department: "Engineering",
    location: "Chicago",
    availability: "on_leave" as const,
    yearsExperience: 7,
    readinessScore: 95,
    skills: [
      { name: "Java", level: "expert" as const },
      { name: "Spring Boot", level: "expert" as const },
      { name: "PostgreSQL", level: "expert" as const },
    ],
  },
  // ... rest of mockEmployees unchanged
];

export default function Employees() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [employees, setEmployees] = useState(mockEmployees);

  // For Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    designation: "",
    department: "",
    location: "",
    availability: "available",
    yearsExperience: 0,
    readinessScore: 0,
    skills: "",
    resumeFile: null as File | null,
    githubLink: "", // added GitHub link
  });

  // For Import Modal
  const [showImportModal, setShowImportModal] = useState(false);

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

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDepartment =
      departmentFilter === "all" || emp.department === departmentFilter;

    const matchesAvailability =
      availabilityFilter === "all" || emp.availability === availabilityFilter;

    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  const handleAddEmployee = async () => {
    const skillsArray = newEmployee.skills.split(",").map((skill) => ({
      name: skill.trim(),
      level: "beginner" as const,
    }));

    try {
      const { error } = await supabase
        .from("employees")
        .insert([{ ...newEmployee, skills: skillsArray }]);
      if (error) console.warn("Supabase insert skipped:", error.message);
    } catch (err) {
      console.warn("Supabase insert skipped:", err);
    }

    setEmployees([...employees, { ...newEmployee, id: Date.now().toString(), skills: skillsArray }]);
    setShowAddModal(false);
    setNewEmployee({
      name: "",
      designation: "",
      department: "",
      location: "",
      availability: "available",
      yearsExperience: 0,
      readinessScore: 0,
      skills: "",
      resumeFile: null,
      githubLink: "",
    });
  };

  // Export to Excel
  const handleExport = () => {
    const dataToExport = employees.map(emp => ({
      name: emp.name,
      designation: emp.designation,
      department: emp.department,
      location: emp.location,
      availability: emp.availability,
      yearsExperience: emp.yearsExperience,
      readinessScore: emp.readinessScore,
      skills: emp.skills.map(s => s.name).join(", "),
      githubLink: emp.githubLink || "",
      resumeFile: emp.resumeFile?.name || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees.xlsx");
  };

  // Import from Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      const importedEmployees = jsonData.map((row, index) => ({
        id: Date.now().toString() + index,
        name: row.name || "",
        designation: row.designation || "",
        department: row.department || "",
        location: row.location || "",
        availability: row.availability || "available",
        yearsExperience: Number(row.yearsExperience) || 0,
        readinessScore: Number(row.readinessScore) || 0,
        skills: row.skills
          ? row.skills.split(",").map((s: string) => ({ name: s.trim(), level: "beginner" }))
          : [],
        githubLink: row.githubLink || "",
        resumeFile: null,
      }));

      setEmployees([...employees, ...importedEmployees]);
      setShowImportModal(false);
    };
    reader.readAsArrayBuffer(file);
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Employees</h1>
            <p className="text-muted-foreground">Manage and search your talent pool</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, skill, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Data">Data</SelectItem>
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="partially_available">Partially Available</SelectItem>
              <SelectItem value="on_project">On Project</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredEmployees.length} of {employees.length} employees
        </p>

        {/* Employees Grid */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} {...employee} />
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No employees found matching your criteria.</p>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold">Add New Employee</h2>

              <Input
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <Input
                placeholder="Designation"
                value={newEmployee.designation}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, designation: e.target.value })
                }
              />
              <Input
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, department: e.target.value })
                }
              />
              <Input
                placeholder="Location"
                value={newEmployee.location}
                onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
              />
              <p>Years of Experience</p>
              <Input
                placeholder="Years of Experience"
                type="number"
                value={newEmployee.yearsExperience}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, yearsExperience: Number(e.target.value) })
                }
              />
              <p>Readiness Score</p>
              <Input
                placeholder="Readiness Score"
                type="number"
                value={newEmployee.readinessScore}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, readinessScore: Number(e.target.value) })
                }
              />
              <Input
                placeholder="Skills (comma separated)"
                value={newEmployee.skills}
                onChange={(e) => setNewEmployee({ ...newEmployee, skills: e.target.value })}
              />

              {/* Resume Upload */}
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, resumeFile: e.target.files?.[0] || null })
                }
              />
              {newEmployee.resumeFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {newEmployee.resumeFile.name}
                </p>
              )}

              {/* GitHub Link */}
              <Input
                placeholder="GitHub Link"
                value={newEmployee.githubLink}
                onChange={(e) => setNewEmployee({ ...newEmployee, githubLink: e.target.value })}
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee}>Save</Button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold">Import Employees</h2>
              <Input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
