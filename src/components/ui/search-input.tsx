import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "large";
  onSearch?: (value: string) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, variant = "default", onSearch, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch((e.target as HTMLInputElement).value);
      }
    };

    return (
      <div className="relative w-full">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            variant === "large" ? "w-6 h-6" : "w-5 h-5"
          )}
        />
        <input
          ref={ref}
          type="text"
          className={cn(
            "w-full rounded-2xl border border-border bg-background pl-12 pr-4 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-search/20 focus:border-search",
            "placeholder:text-muted-foreground",
            variant === "large"
              ? "h-16 text-lg pl-14"
              : "h-12 text-base",
            className
          )}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
