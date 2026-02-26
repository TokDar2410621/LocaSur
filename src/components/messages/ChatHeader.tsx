/**
 * ChatHeader - En-tête de conversation avec statut en ligne
 * Style WhatsApp avec couleur primary en mode fullscreen
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Circle, MoreVertical, UserX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  name: string;
  otherUserId?: number;  // ID pour ouvrir le profil public
  isOnline?: boolean;
  isTyping?: string | null;
  isOtherDeleted?: boolean;
  isFullscreen?: boolean;
  onBack?: () => void;
  onOptions?: () => void;
  onProfileClick?: (userId: number) => void;
}

export function ChatHeader({
  name,
  otherUserId,
  isOnline = false,
  isTyping = null,
  isOtherDeleted = false,
  isFullscreen = false,
  onBack,
  onOptions,
  onProfileClick: onProfileClickProp,
}: ChatHeaderProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (otherUserId && !isOtherDeleted) {
      if (onProfileClickProp) {
        onProfileClickProp(otherUserId);
      } else {
        navigate(`/user/${otherUserId}`);
      }
    }
  };

  const isClickable = !!otherUserId && !isOtherDeleted;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "p-3 border-b flex items-center gap-3 shrink-0",
        isFullscreen
          ? "bg-primary text-primary-foreground border-primary/20 pt-[calc(env(safe-area-inset-top)+12px)]"
          : "bg-background/95 backdrop-blur-sm border-border"
      )}
    >
      {/* Back button - mobile */}
      {onBack && (
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "md:hidden shrink-0 h-10 w-10 rounded-full touch-manipulation",
              isFullscreen && "hover:bg-primary-foreground/10 text-primary-foreground"
            )}
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </motion.div>
      )}

      {/* Avatar - Clickable to view profile */}
      <button
        onClick={handleProfileClick}
        disabled={!isClickable}
        className={cn(
          "relative",
          isClickable && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
        title={isClickable ? "Voir le profil" : undefined}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
          isOtherDeleted
            ? "bg-muted text-muted-foreground"
            : isFullscreen
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary"
        )}>
          {isOtherDeleted ? (
            <UserX className="w-5 h-5" />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        {!isOtherDeleted && (
          <Circle
            className={cn(
              "w-3 h-3 absolute -bottom-0.5 -right-0.5 rounded-full border-2",
              isFullscreen ? "border-primary" : "border-background",
              isOnline
                ? "fill-green-500 text-green-500"
                : isFullscreen
                  ? "fill-primary-foreground/50 text-primary-foreground/50"
                  : "fill-muted-foreground/50 text-muted-foreground/50"
            )}
          />
        )}
      </button>

      {/* Info - Name clickable to view profile */}
      <div className="flex-1 min-w-0">
        {isClickable ? (
          <button
            onClick={handleProfileClick}
            className={cn(
              "font-semibold truncate text-left hover:underline transition-all",
              isFullscreen ? "hover:text-primary-foreground/80" : "hover:text-primary"
            )}
          >
            {name}
          </button>
        ) : (
          <h3 className={cn(
            "font-semibold truncate",
            isOtherDeleted && !isFullscreen && "text-muted-foreground"
          )}>
            {isOtherDeleted ? "Utilisateur supprimé" : name}
          </h3>
        )}
        <p className={cn(
          "text-xs",
          isFullscreen ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {isOtherDeleted ? (
            <span className={cn(
              "flex items-center gap-1",
              isFullscreen ? "text-amber-200" : "text-amber-500"
            )}>
              <AlertTriangle className="w-3 h-3" />
              Ce compte n'existe plus
            </span>
          ) : isTyping ? (
            <motion.span 
              className={cn(
                "flex items-center gap-1",
                isFullscreen ? "text-primary-foreground" : "text-primary"
              )}
            >
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                écrit...
              </motion.span>
            </motion.span>
          ) : isOnline ? (
            <span className={isFullscreen ? "text-green-200" : "text-green-500"}>En ligne</span>
          ) : (
            "Hors ligne"
          )}
        </p>
      </div>

      {/* Actions */}
      {onOptions && (
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full touch-manipulation",
              isFullscreen && "hover:bg-primary-foreground/10 text-primary-foreground"
            )}
            onClick={onOptions}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
