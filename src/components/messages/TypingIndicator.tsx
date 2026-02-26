/**
 * TypingIndicator - Animation de frappe style iMessage
 * Avec bulles animées
 */

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  senderName?: string;
  senderInitial?: string;
}

export function TypingIndicator({ senderName, senderInitial }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
        {senderInitial || senderName?.charAt(0).toUpperCase()}
      </div>
      <div className="bg-card border border-border/80 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <motion.span
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: 0,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
          />
          <motion.span
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: 0.15,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
          />
          <motion.span
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: 0.3,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}
