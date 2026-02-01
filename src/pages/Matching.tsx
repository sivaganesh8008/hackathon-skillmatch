import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Search, ArrowRight, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { MatchScoreRing } from "@/components/dashboard/MatchScoreRing";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Mock data
const mockProjects = [
  { id: "1", name: "E-Commerce Platform Redesign", client: "RetailMax Inc." },
  { id: "2", name: "Mobile Banking App", client: "FinServe Bank" },
  { id: "3", name: "AI Customer Service Bot", client: "TechCorp Solutions" },
];

const mockMatches = [
  {
    id: "1",
    name: "Sarah Chen",
    designation: "Senior React Developer",
    matchScore: 94,
    availability: "available",
    skills: [
      { name: "React", level: "expert" as const, required: true, match: true },
      { name: "TypeScript", level: "expert" as const, required: true, match: true },
      { name: "Node.js", level: "intermediate" as const, required: true, match: true },
      { name: "GraphQL", level: "intermediate" as const, required: false, match: true },
    ],
    experience: 6,
    location: "San Francisco",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    designation: "Full Stack Developer",
    matchScore: 82,
    availability: "available",
    skills: [
      { name: "React", level: "intermediate" as const, required: true, match: true },
      { name: "Node.js", level: "expert" as const, required: true, match: true },
      { name: "PostgreSQL", level: "intermediate" as const, required: true, match: true },
      { name: "AWS", level: "beginner" as const, required: true, match: false },
    ],
    experience: 4,
    location: "New York",
  },
  {
    id: "3",
    name: "Lisa Wang",
    designation: "Frontend Developer",
    matchScore: 76,
    availability: "partially_available",
    skills: [
      { name: "React", level: "expert" as const, required: true, match: true },
      { name: "TypeScript", level: "intermediate" as const, required: true, match: true },
      { name: "Node.js", level: "beginner" as const, required: true, match: false },
      { name: "CSS", level: "expert" as const, required: false, match: true },
    ],
    experience: 3,
    location: "Los Angeles",
  },
  {
    id: "4",
    name: "David Kim",
    designation: "Backend Engineer",
    matchScore: 68,
    availability: "on_project",
    skills: [
      { name: "Node.js", level: "expert" as const, required: true, match: true },
      { name: "PostgreSQL", level: "expert" as const, required: true, match: true },
      { name: "React", level: "beginner" as const, required: true, match: false },
      { name: "AWS", level: "intermediate" as const, required: true, match: true },
    ],
    experience: 7,
    location: "Chicago",
  },
];

const availabilityLabels = {
  available: { label: "Available", class: "availability-available" },
  partially_available: { label: "Partial", class: "availability-partially_available" },
  on_project: { label: "On Project", class: "availability-on_project" },
};

export default function Matching() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<typeof mockMatches>([]);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

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

  const handleMatch = async () => {
    if (!selectedProject) return;
    
    setIsMatching(true);
    // Simulate AI matching delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setMatches(mockMatches);
    setIsMatching(false);
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
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Skill Matching
          </h1>
          <p className="text-muted-foreground">
            Find the best candidates for your project requirements using AI-powered matching
          </p>
        </div>

        {/* Project Selection */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Select a Project</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="flex-1 max-w-md">
                <SelectValue placeholder="Choose a project to find matches..." />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex flex-col">
                      <span>{project.name}</span>
                      <span className="text-xs text-muted-foreground">{project.client}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleMatch}
              disabled={!selectedProject || isMatching}
              className="gap-2"
            >
              {isMatching ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Analyzing Skills...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Find Matches
                </>
              )}
            </Button>
          </div>

          {selectedProject && (
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-2">
                <SkillBadge name="React" level="expert" showLevel />
                <SkillBadge name="TypeScript" level="intermediate" showLevel />
                <SkillBadge name="Node.js" level="intermediate" showLevel />
                <SkillBadge name="PostgreSQL" level="beginner" showLevel />
                <SkillBadge name="AWS" level="beginner" showLevel />
              </div>
            </div>
          )}
        </Card>

        {/* Matching Animation */}
        {isMatching && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary-foreground animate-bounce" />
              </div>
              <p className="text-lg font-medium">Analyzing skill profiles...</p>
              <p className="text-sm text-muted-foreground">
                Matching employee skills with project requirements
              </p>
            </div>
          </Card>
        )}

        {/* Results */}
        {matches.length > 0 && !isMatching && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Match Results ({matches.length} candidates)
              </h3>
              <Badge variant="outline" className="text-success border-success">
                AI-Powered
              </Badge>
            </div>

            <div className="space-y-3">
              {matches.map((match, index) => (
                <Card
                  key={match.id}
                  className={cn(
                    "p-4 transition-all duration-300 hover:shadow-lg cursor-pointer",
                    index === 0 && "ring-2 ring-success/30 shadow-match-glow"
                  )}
                  onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        index === 0
                          ? "bg-gradient-to-br from-success to-accent text-success-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {match.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{match.name}</h4>
                        <Badge className={availabilityLabels[match.availability as keyof typeof availabilityLabels].class}>
                          {availabilityLabels[match.availability as keyof typeof availabilityLabels].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {match.designation} • {match.experience} years • {match.location}
                      </p>
                    </div>

                    {/* Match Score */}
                    <MatchScoreRing score={match.matchScore} size="md" />

                    {/* Expand icon */}
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        expandedMatch === match.id && "rotate-180"
                      )}
                    />
                  </div>

                  {/* Expanded content */}
                  {expandedMatch === match.id && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                      <p className="text-sm font-medium mb-3">Skill Match Analysis:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {match.skills.map((skill) => (
                          <div
                            key={skill.name}
                            className={cn(
                              "p-3 rounded-lg flex items-center gap-2",
                              skill.match
                                ? "bg-success/10 border border-success/20"
                                : "bg-destructive/10 border border-destructive/20"
                            )}
                          >
                            {skill.match ? (
                              <Check className="w-4 h-4 text-success shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-destructive shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{skill.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {skill.level}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Allocate to Project
                        </Button>
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedProject && matches.length === 0 && !isMatching && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Select a Project</h3>
                <p className="text-muted-foreground max-w-sm">
                  Choose a project from the dropdown above to find the best matching candidates
                  based on required skills and experience.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}