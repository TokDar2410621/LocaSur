/**
 * ChatFeedback - Boutons de feedback pour les messages du chatbot
 */

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatFeedbackProps {
  messageIndex: number;
  onFeedback?: (isPositive: boolean) => void;
}

// Stockage local des feedbacks
const FEEDBACK_KEY = 'housing_chat_feedback';

function getFeedback(messageIndex: number): boolean | null {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    if (stored) {
      const feedbacks = JSON.parse(stored);
      return feedbacks[messageIndex] ?? null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

function saveFeedback(messageIndex: number, isPositive: boolean) {
  try {
    const stored = localStorage.getItem(FEEDBACK_KEY);
    const feedbacks = stored ? JSON.parse(stored) : {};
    feedbacks[messageIndex] = isPositive;
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  } catch {
    // Ignore errors
  }
}

export function ChatFeedback({ messageIndex, onFeedback }: ChatFeedbackProps) {
  const [feedback, setFeedback] = useState<boolean | null>(() => getFeedback(messageIndex));

  const handleFeedback = (isPositive: boolean) => {
    // Si on clique sur le même bouton, on annule
    if (feedback === isPositive) {
      setFeedback(null);
      return;
    }

    setFeedback(isPositive);
    saveFeedback(messageIndex, isPositive);
    onFeedback?.(isPositive);
  };

  return (
    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
      <span className="text-[10px] text-muted-foreground mr-1">Cette réponse était-elle utile?</span>
      <button
        onClick={() => handleFeedback(true)}
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === true
            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
        title="Utile"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback(false)}
        className={cn(
          "p-1 rounded-md transition-colors",
          feedback === false
            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
        title="Pas utile"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default ChatFeedback;
