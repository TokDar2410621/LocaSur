import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const rating = i + 1;
          const isFilled = rating <= displayValue;
          const isHalf = rating - 0.5 <= displayValue && displayValue < rating;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                "p-0.5 transition-transform",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalf
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "fill-transparent text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarRatingDisplayProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showCount?: number;
  className?: string;
}

export function StarRatingDisplay({
  value,
  max = 5,
  size = "md",
  showCount,
  className,
}: StarRatingDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating value={value} max={max} size={size} readonly />
      <span className="text-sm font-medium">{value.toFixed(1)}</span>
      {showCount !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({showCount} avis)
        </span>
      )}
    </div>
  );
}

export { StarRating as default };
