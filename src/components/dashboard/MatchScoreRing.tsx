import { cn } from "@/lib/utils";

interface MatchScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function MatchScoreRing({ score, size = "md", showLabel = true }: MatchScoreRingProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const strokeWidth = {
    sm: 3,
    md: 4,
    lg: 6,
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
  };

  const radius = size === "sm" ? 20 : size === "md" ? 28 : 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score >= 80) return "text-success stroke-success";
    if (score >= 60) return "text-accent stroke-accent";
    if (score >= 40) return "text-warning stroke-warning";
    return "text-destructive stroke-destructive";
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className="stroke-border"
          strokeWidth={strokeWidth[size]}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          className={cn("transition-all duration-700 ease-out", getScoreColor())}
          strokeWidth={strokeWidth[size]}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", textSize[size], getScoreColor().split(" ")[0])}>
            {score}%
          </span>
        </div>
      )}
    </div>
  );
}