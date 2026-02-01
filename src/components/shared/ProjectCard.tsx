import { Link } from "react-router-dom";
import { Calendar, Users, DollarSign, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  status?: "draft" | "active" | "on_hold" | "completed";
  priority?: "low" | "medium" | "high" | "critical";
  startDate?: string;
  endDate?: string;
  teamSize?: number;
  requiredSkills?: string[];
  matchedCandidates?: number;
  progress?: number;
}

const statusLabels = {
  draft: "Draft",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function ProjectCard({
  id,
  name,
  description,
  clientName,
  status = "draft",
  priority = "medium",
  startDate,
  endDate,
  teamSize = 0,
  requiredSkills = [],
  matchedCandidates = 0,
  progress = 0,
}: ProjectCardProps) {
  return (
    <Link to={`/projects/${id}`}>
      <Card className="p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/30">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            {clientName && (
              <p className="text-sm text-muted-foreground truncate">
                {clientName}
              </p>
            )}
          </div>
          <Badge className={cn("priority-" + priority, "shrink-0")}>
            {priorityLabels[priority]}
          </Badge>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Status and dates */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
          <Badge className={cn("status-" + status)}>{statusLabels[status]}</Badge>
          {startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(startDate), "MMM d")}
              {endDate && ` - ${format(new Date(endDate), "MMM d, yyyy")}`}
            </span>
          )}
        </div>

        {/* Team info */}
        <div className="flex items-center gap-4 text-sm mb-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{teamSize} team members</span>
          </span>
          {matchedCandidates > 0 && (
            <span className="flex items-center gap-1.5 text-success">
              <AlertCircle className="w-4 h-4" />
              <span>{matchedCandidates} matches found</span>
            </span>
          )}
        </div>

        {/* Progress */}
        {status === "active" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Required skills */}
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
            {requiredSkills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {requiredSkills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{requiredSkills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </Card>
    </Link>
  );
}