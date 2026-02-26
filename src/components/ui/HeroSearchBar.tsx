import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  typingExamples?: string[];
}

// Default search examples for typing animation
const DEFAULT_TYPING_EXAMPLES = [
  "3½ Chicoutimi",
  "Appartement près de l'UQAC",
  "Logement Jonquière 800$",
  "Studio meublé Saguenay",
  "Chambre à louer Alma",
  "4½ La Baie",
];

export function HeroSearchBar({
  onSearch,
  placeholder = "Où cherchez-vous ?",
  className,
  typingExamples = DEFAULT_TYPING_EXAMPLES
}: HeroSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing animation effect
  useEffect(() => {
    // Don't animate if user is typing or input is focused
    if (query || isFocused) {
      setDisplayedPlaceholder(placeholder);
      return;
    }

    const currentExample = typingExamples[exampleIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing phase
      if (charIndex < currentExample.length) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentExample.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 80 + Math.random() * 40); // Variable typing speed for realism
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause for 2 seconds
      }
    } else {
      // Deleting phase
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayedPlaceholder(currentExample.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 40); // Faster deletion
      } else {
        // Finished deleting, move to next example
        timeout = setTimeout(() => {
          setExampleIndex((exampleIndex + 1) % typingExamples.length);
          setIsTyping(true);
        }, 500); // Brief pause before next example
      }
    }

    return () => clearTimeout(timeout);
  }, [query, isFocused, isTyping, charIndex, exampleIndex, typingExamples, placeholder]);

  // Reset animation when focus changes
  useEffect(() => {
    if (!isFocused && !query) {
      // Reset to current example position when unfocusing
      const currentExample = typingExamples[exampleIndex];
      setDisplayedPlaceholder(currentExample.slice(0, charIndex));
    }
  }, [isFocused, query, exampleIndex, charIndex, typingExamples]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  // Show cursor blink effect when typing animation is active
  const showCursor = !query && !isFocused && isTyping;

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        "search-bar-hero max-w-2xl mx-auto",
        isFocused && "shadow-soft-xl ring-2 ring-primary/20",
        className
      )}
    >
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          className="w-full bg-transparent border-none outline-none text-base px-4 py-3"
        />
        {/* Custom animated placeholder */}
        {!query && (
          <div
            className="absolute inset-0 flex items-center px-4 pointer-events-none text-muted-foreground"
            onClick={() => inputRef.current?.focus()}
          >
            <span>{isFocused ? placeholder : displayedPlaceholder}</span>
            {showCursor && (
              <motion.span
                className="inline-block w-0.5 h-5 bg-primary ml-0.5"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
              />
            )}
          </div>
        )}
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full gradient-search flex items-center justify-center shrink-0"
      >
        <Search className="w-5 h-5 text-search-foreground" />
      </motion.button>
    </motion.form>
  );
}
