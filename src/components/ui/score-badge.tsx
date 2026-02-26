/**
 * ScoreBadge - Affiche le score de fiabilité (comme une cote de crédit)
 * Utilisable pour locataires ET propriétaires
 */

import { Shield, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  grade: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  verified?: boolean;
  className?: string;
}

const colorVariants = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-500",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    text: "text-green-700 dark:text-green-400",
    badge: "bg-green-500",
  },
  lime: {
    bg: "bg-lime-50 dark:bg-lime-950/30",
    border: "border-lime-200 dark:border-lime-800",
    text: "text-lime-700 dark:text-lime-400",
    badge: "bg-lime-500",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-400",
    badge: "bg-yellow-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-500",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-500",
  },
};

export function ScoreBadge({
  score,
  grade,
  color,
  size = "md",
  showDetails = false,
  verified = false,
  className,
}: ScoreBadgeProps) {
  const colors = colorVariants[color as keyof typeof colorVariants] || colorVariants.yellow;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (!showDetails) {
    // Compact badge mode
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold",
          colors.bg,
          colors.border,
          colors.text,
          sizeClasses[size],
          className
        )}
      >
        {verified && <Shield className={cn(iconSizes[size], "fill-current")} />}
        <Award className={iconSizes[size]} />
        <span>Score {grade}</span>
      </div>
    );
  }

  // Detailed card mode
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        colors.bg,
        colors.border,
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.badge)}>
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={cn("text-xs font-medium", colors.text)}>
              Score de fiabilité
            </p>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-2xl font-bold", colors.text)}>
                {grade}
              </span>
              {verified && (
                <Shield className={cn("w-4 h-4", colors.text, "fill-current")} />
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-3xl font-bold", colors.text)}>
            {score}
          </p>
          <p className="text-xs text-muted-foreground">/100</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors.badge)}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        {score >= 80 && "Excellent profil de confiance"}
        {score >= 60 && score < 80 && "Bon profil, fiable"}
        {score >= 40 && score < 60 && "Profil acceptable"}
        {score < 40 && "Complétez votre profil pour améliorer ce score"}
      </p>
    </div>
  );
}
