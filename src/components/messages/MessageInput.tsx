/**
 * MessageInput - Zone de saisie de message optimisée mobile
 * Avec emoji picker, image upload, et expansion automatique
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, ImageIcon, X, Reply, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export interface ReplyingTo {
  id: number;
  content: string;
  sender_name: string;
}

interface MessageInputProps {
  onSend: (message: string, images: File[], replyToId?: number) => Promise<void>;
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
  onTyping?: () => void;
  disabled?: boolean;
  isFullscreen?: boolean;
  placeholder?: string;
  initialMessage?: string;
  onInitialMessageUsed?: () => void;
}

export function MessageInput({
  onSend,
  replyingTo,
  onCancelReply,
  onTyping,
  disabled = false,
  isFullscreen = false,
  placeholder = "Écrivez votre message...",
  initialMessage = "",
  onInitialMessageUsed,
}: MessageInputProps) {
  const [messageText, setMessageText] = useState(initialMessage);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pré-remplir avec le message initial
  useEffect(() => {
    if (initialMessage && !messageText) {
      setMessageText(initialMessage);
      onInitialMessageUsed?.();
    }
  }, [initialMessage]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [messageText]);

  const handleEmojiSelect = (emoji: any) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newText = messageText.slice(0, start) + emoji.native + messageText.slice(end);
      setMessageText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.native.length, start + emoji.native.length);
      }, 0);
    } else {
      setMessageText(prev => prev + emoji.native);
    }
    setShowEmojiPicker(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} est trop lourd (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    const hasText = messageText.trim().length > 0;
    const hasImages = selectedImages.length > 0;

    if ((!hasText && !hasImages) || sending) return;

    try {
      setSending(true);
      if (hasImages) setUploadingImage(true);
      
      await onSend(messageText.trim(), selectedImages, replyingTo?.id);
      
      setMessageText("");
      setSelectedImages([]);
      setImagePreviewUrls([]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn(
      "p-3 border-t border-border bg-background/95 backdrop-blur-sm shrink-0",
      isFullscreen
        ? "pb-[max(env(safe-area-inset-bottom),8px)]"
        : "pb-[calc(env(safe-area-inset-bottom)+80px)] md:pb-4"
    )}>
      {/* Image Preview */}
      <AnimatePresence>
        {imagePreviewUrls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {imagePreviewUrls.map((url, index) => (
              <motion.div 
                key={index} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative shrink-0"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-xl border border-border"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeImage(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-sm"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            className="mb-2 p-2.5 bg-muted/50 rounded-xl border-l-3 border-primary flex items-start gap-2"
          >
            <Reply className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">
                Réponse à {replyingTo.sender_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {replyingTo.content}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onCancelReply}
              className="p-1.5 hover:bg-muted rounded-full shrink-0 touch-manipulation"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />

      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-10 w-10 rounded-full touch-manipulation"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || disabled}
          >
            {uploadingImage ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>
        </motion.div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              onTyping?.();
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl py-2.5 px-4 pr-11",
              "bg-muted/50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "text-sm min-h-[42px] max-h-[120px] leading-relaxed",
              "placeholder:text-muted-foreground/70"
            )}
          />

          {/* Emoji picker button */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="absolute right-2.5 bottom-2 p-1.5 rounded-full hover:bg-muted/80 transition-colors touch-manipulation"
              >
                <Smile className="w-5 h-5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-0 shadow-xl"
              side="top"
              align="end"
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
                locale="fr"
                previewPosition="none"
                skinTonePosition="none"
                maxFrequentRows={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <motion.div 
          whileTap={{ scale: 0.9 }}
          animate={{ 
            scale: messageText.trim() || selectedImages.length > 0 ? 1 : 0.9,
            opacity: messageText.trim() || selectedImages.length > 0 ? 1 : 0.5 
          }}
        >
          <Button
            onClick={handleSend}
            disabled={sending || disabled || (!messageText.trim() && selectedImages.length === 0)}
            size="icon"
            className="rounded-full w-10 h-10 gradient-search text-search-foreground shrink-0 touch-manipulation shadow-md"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
