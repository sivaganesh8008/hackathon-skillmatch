import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ProficiencyLevel = "beginner" | "intermediate" | "expert";

interface SkillBadgeProps {
  name: string;
  level?: ProficiencyLevel;
  showLevel?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  size?: "sm" | "md";
}

export function SkillBadge({
  name,
  level = "intermediate",
  showLevel = true,
  removable = false,
  onRemove,
  size = "md",
}: SkillBadgeProps) {
  const levelStyles = {
    beginner: "skill-badge-beginner",
    intermediate: "skill-badge-intermediate",
    expert: "skill-badge-expert",
  };

  const levelLabels = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    expert: "Expert",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium gap-1.5 transition-all hover:scale-105",
        levelStyles[level],
        sizeStyles[size]
      )}
    >
      <span>{name}</span>
      {showLevel && (
        <span className="opacity-70 text-[0.65em] uppercase tracking-wider">
          • {levelLabels[level]}
        </span>
      )}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 hover:bg-foreground/10 rounded-full p-0.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </Badge>
  );
}