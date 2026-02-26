/**
 * ConversationItem - Item de conversation dans la liste
 * Avec avatar, badge unread, et timestamp
 */

import { motion } from "framer-motion";
import { UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export interface ConversationItemProps {
  id: number;
  name: string;
  lastMessage?: string;
  timestamp: string;
  unread?: number | boolean;
  isSelected?: boolean;
  isOtherDeleted?: boolean;
  index?: number;
  onClick: () => void;
}

const formatTimestamp = (timestamp: string) => {
  try {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return format(date, "HH:mm", { locale: fr });
    } else if (isYesterday(date)) {
      return "Hier";
    } else {
      return format(date, "dd MMM", { locale: fr });
    }
  } catch {
    return "";
  }
};

export function ConversationItem({
  id,
  name,
  lastMessage,
  timestamp,
  unread,
  isSelected = false,
  isOtherDeleted = false,
  index = 0,
  onClick,
}: ConversationItemProps) {
  const hasUnread = typeof unread === 'number' ? unread > 0 : !!unread;
  const unreadCount = typeof unread === 'number' ? unread : (unread ? 1 : 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full p-3.5 flex items-center gap-3 transition-colors border-b border-border/30 text-left",
        "hover:bg-muted/50 active:bg-muted/70 touch-manipulation",
        isSelected && "bg-primary/5 border-l-2 border-l-primary"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg",
          isOtherDeleted
            ? "bg-muted text-muted-foreground"
            : "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary"
        )}>
          {isOtherDeleted ? (
            <UserX className="w-5 h-5" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        {hasUnread && !isOtherDeleted && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className={cn(
            "font-semibold text-sm truncate",
            isOtherDeleted && "text-muted-foreground",
            hasUnread && !isOtherDeleted && "text-primary"
          )}>
            {isOtherDeleted ? "Utilisateur supprimé" : name}
          </h3>
          <span className={cn(
            "text-xs shrink-0 ml-2",
            hasUnread ? "text-primary font-medium" : "text-muted-foreground"
          )}>
            {formatTimestamp(timestamp)}
          </span>
        </div>
        <p className={cn(
          "text-sm truncate",
          hasUnread ? "font-medium text-foreground" : "text-muted-foreground"
        )}>
          {lastMessage || "Aucun message"}
        </p>
      </div>
    </motion.button>
  );
}
