import { Link } from "react-router-dom";
import { MapPin, Briefcase, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "./SkillBadge";
import { MatchScoreRing } from "@/components/dashboard/MatchScoreRing";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  id: string;
  name: string;
  designation?: string;
  department?: string;
  location?: string;
  avatarUrl?: string;
  yearsExperience?: number;
  availability?: "available" | "partially_available" | "on_project" | "on_leave";
  skills?: Array<{ name: string; level: "beginner" | "intermediate" | "expert" }>;
  matchScore?: number;
  readinessScore?: number;
}

const availabilityLabels = {
  available: "Available",
  partially_available: "Partially Available",
  on_project: "On Project",
  on_leave: "On Leave",
};

export function EmployeeCard({
  id,
  name,
  designation,
  department,
  location,
  avatarUrl,
  yearsExperience,
  availability = "available",
  skills = [],
  matchScore,
  readinessScore,
}: EmployeeCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link to={`/employees/${id}`}>
      <Card className="p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/50 hover:border-primary/30">
        <div className="flex gap-4">
          {/* Avatar section */}
          <div className="flex-shrink-0">
            <Avatar className="w-14 h-14 ring-2 ring-border group-hover:ring-primary/30 transition-all">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors truncate">
                  {name}
                </h3>
                {designation && (
                  <p className="text-sm text-muted-foreground truncate">{designation}</p>
                )}
              </div>
              
              {matchScore !== undefined && (
                <MatchScoreRing score={matchScore} size="sm" />
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {department && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {department}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                </span>
              )}
              {yearsExperience !== undefined && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {yearsExperience} years
                </span>
              )}
            </div>

            {/* Availability & Readiness */}
            <div className="flex items-center gap-2 mt-3">
              <Badge className={cn("availability-" + availability, "text-xs")}>
                {availabilityLabels[availability]}
              </Badge>
              {readinessScore !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Readiness: {readinessScore}%
                </Badge>
              )}
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skills.slice(0, 4).map((skill, idx) => (
                  <SkillBadge key={idx} name={skill.name} level={skill.level} showLevel={false} size="sm" />
                ))}
                {skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{skills.length - 4} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}