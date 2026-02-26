/**
 * MessageBubble - Bulle de message style iMessage/WhatsApp
 * Avec support images, replies, swipe gestures, double-tap reactions et actions tactiles
 */

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { CheckCheck, Reply, Trash2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  id: number;
  content: string;
  isMine: boolean;
  timestamp: string;
  read?: boolean;
  isDeleted?: boolean;
  senderName?: string;
  senderInitial?: string;
  replyTo?: {
    id: number;
    content: string;
    sender_name: string;
  };
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  reaction?: string | null;
  onReply?: () => void;
  onDelete?: () => void;
  onReaction?: (reaction: string | null) => void;
}

// Parse message content to extract images and text
const parseMessageContent = (content: string): { text: string; images: string[] } => {
  const imagePattern = /\[image:(https?:\/\/[^\]]+)\]/g;
  const images: string[] = [];
  let match;

  while ((match = imagePattern.exec(content)) !== null) {
    images.push(match[1]);
  }

  const text = content.replace(imagePattern, '').trim();
  return { text, images };
};

// Swipe threshold to trigger reply
const SWIPE_THRESHOLD = 60;

// Double tap detection
const DOUBLE_TAP_DELAY = 300;

export function MessageBubble({
  id,
  content,
  isMine,
  timestamp,
  read = false,
  isDeleted = false,
  senderName,
  senderInitial,
  replyTo,
  isFirstInGroup = true,
  isLastInGroup = true,
  reaction,
  onReply,
  onDelete,
  onReaction,
}: MessageBubbleProps) {
  const { text, images } = parseMessageContent(content);
  const [isSwipingReply, setIsSwipingReply] = useState(false);
  const [localReaction, setLocalReaction] = useState<string | null>(reaction || null);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const constraintsRef = useRef(null);
  const lastTapRef = useRef<number>(0);
  
  // Motion values for swipe gesture
  const x = useMotionValue(0);
  
  // Transform x position to opacity and scale for reply icon
  const replyIconOpacity = useTransform(x, [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const replyIconScale = useTransform(x, [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD], [0.5, 0.8, 1]);
  const replyIconX = useTransform(x, [0, SWIPE_THRESHOLD], [-20, 0]);

  // Handle double tap for reaction
  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < DOUBLE_TAP_DELAY && timeSinceLastTap > 0) {
      // Double tap detected
      handleDoubleTap();
    }
    
    lastTapRef.current = now;
  };

  const handleDoubleTap = () => {
    if (isDeleted) return;
    
    // Toggle reaction
    const newReaction = localReaction === '❤️' ? null : '❤️';
    setLocalReaction(newReaction);
    
    // Show heart animation
    if (newReaction) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
    
    // Notify parent
    onReaction?.(newReaction);
  };

  // Handle drag end
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x >= SWIPE_THRESHOLD && onReply && !isDeleted) {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      onReply();
    }
    setIsSwipingReply(false);
  };

  // Handle drag
  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x >= SWIPE_THRESHOLD * 0.8) {
      if (!isSwipingReply) {
        setIsSwipingReply(true);
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      }
    } else {
      setIsSwipingReply(false);
    }
  };

  // Dynamic border radius based on position in group
  const getBorderRadius = () => {
    if (isMine) {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-br-md";
      if (isFirstInGroup) return "rounded-2xl rounded-br-lg";
      if (isLastInGroup) return "rounded-2xl rounded-tr-lg rounded-br-md";
      return "rounded-2xl rounded-r-lg";
    } else {
      if (isFirstInGroup && isLastInGroup) return "rounded-2xl rounded-bl-md";
      if (isFirstInGroup) return "rounded-2xl rounded-bl-lg";
      if (isLastInGroup) return "rounded-2xl rounded-tl-lg rounded-bl-md";
      return "rounded-2xl rounded-l-lg";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      layout
      className={cn(
        "flex items-end gap-2 relative",
        isMine ? "justify-end" : "justify-start",
        !isLastInGroup && "mb-0.5"
      )}
      ref={constraintsRef}
    >
      {/* Reply icon that appears on swipe */}
      {onReply && !isDeleted && !isMine && (
        <motion.div
          style={{ 
            opacity: replyIconOpacity, 
            scale: replyIconScale,
            x: replyIconX
          }}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10",
            "w-8 h-8 rounded-full flex items-center justify-center",
            isSwipingReply ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Reply className="w-4 h-4" />
        </motion.div>
      )}

      {/* Avatar - only show for first message in group from others */}
      {!isMine && (
        <div className={cn(
          "w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 text-xs font-semibold text-primary",
          !isLastInGroup && "invisible"
        )}>
          {senderInitial || senderName?.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className="group flex items-center gap-1 max-w-[85%] sm:max-w-[70%]">
        {/* Action buttons - left side for own messages */}
        {isMine && !isDeleted && (
          <div className="flex items-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
            {onDelete && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-2 rounded-full hover:bg-destructive/10 active:bg-destructive/20 touch-manipulation"
                aria-label="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </motion.button>
            )}
            {onReply && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onReply}
                className="p-2 rounded-full hover:bg-muted active:bg-muted/80 touch-manipulation"
                aria-label="Répondre"
              >
                <Reply className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </div>
        )}

        {/* Swipeable message bubble with double-tap */}
        <motion.div
          drag={!isMine && onReply && !isDeleted ? "x" : false}
          dragConstraints={{ left: 0, right: SWIPE_THRESHOLD + 10 }}
          dragElastic={{ left: 0, right: 0.5 }}
          dragMomentum={false}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
          style={{ x }}
          whileDrag={{ cursor: "grabbing" }}
          className={cn(
            "px-3.5 py-2.5 shadow-sm touch-manipulation relative select-none",
            getBorderRadius(),
            isDeleted
              ? "bg-muted/50 border border-border/50"
              : isMine
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                : "bg-card border border-border/80"
          )}
        >
          {/* Heart animation overlay */}
          <AnimatePresence>
            {showHeartAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <Heart className="w-12 h-12 text-red-500 fill-red-500 drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deleted message */}
          {isDeleted ? (
            <p className="text-sm italic text-muted-foreground">
              Message supprimé
            </p>
          ) : (
            <>
              {/* Reply context */}
              {replyTo && (
                <div
                  className={cn(
                    "mb-2 p-2 rounded-lg text-xs border-l-2",
                    isMine
                      ? "bg-white/10 border-white/30"
                      : "bg-muted/50 border-primary/50"
                  )}
                >
                  <p className={cn(
                    "font-medium",
                    isMine ? "text-white/80" : "text-primary"
                  )}>
                    {replyTo.sender_name}
                  </p>
                  <p className={cn(
                    "truncate",
                    isMine ? "text-white/60" : "text-muted-foreground"
                  )}>
                    {replyTo.content}
                  </p>
                </div>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div className={cn(
                  "flex flex-wrap gap-1 mb-2",
                  images.length === 1 ? "max-w-[220px]" : "max-w-[260px]"
                )}>
                  {images.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "block overflow-hidden rounded-lg",
                        images.length === 1 ? "w-full" : "w-[calc(50%-2px)]"
                      )}
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-auto max-h-[180px] object-cover hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Text */}
              {text && (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{text}</p>
              )}
            </>
          )}

          {/* Timestamp, reaction and read status */}
          <div className={cn(
            "flex items-center justify-end gap-1.5 mt-1",
            isDeleted
              ? "text-muted-foreground/50"
              : isMine ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {/* Reaction badge */}
            {localReaction && !isDeleted && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setLocalReaction(null);
                  onReaction?.(null);
                }}
                className="text-sm -ml-1 hover:scale-110 transition-transform"
                title="Retirer la réaction"
              >
                {localReaction}
              </motion.button>
            )}
            <span className="text-[10px]">
              {new Date(timestamp).toLocaleTimeString('fr-CA', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isMine && !isDeleted && (
              <CheckCheck className={cn(
                "w-3.5 h-3.5",
                read ? "text-blue-300" : ""
              )} />
            )}
          </div>
        </motion.div>

        {/* Reaction badge outside bubble */}
        {localReaction && !isDeleted && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className={cn(
              "absolute -bottom-2 bg-background border border-border rounded-full px-1.5 py-0.5 shadow-sm",
              isMine ? "right-2" : "left-10"
            )}
          >
            <span className="text-xs">{localReaction}</span>
          </motion.div>
        )}

        {/* Reply button - right side for other's messages (desktop) */}
        {!isMine && !isDeleted && onReply && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onReply}
            className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-muted active:bg-muted/80 touch-manipulation"
            aria-label="Répondre"
          >
            <Reply className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
