/**
 * Page Messagerie - Communication entre locataires et propriétaires
 * Design moderne et stylé avec WebSocket pour la messagerie en temps réel
 * Refactorisé avec composants modulaires pour une meilleure maintenabilité
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  MessageSquare,
  Search,
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Home,
  Zap,
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMessages } from "@/contexts/MessagesContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { Conversation, Message, DemandeContext, AnnonceContext } from "@/lib/matchApi";
import { getWebSocketToken } from "@/lib/matchApi";
import AuthModal from "@/components/auth/AuthModal";
import { NotificationModal } from "@/components/notifications/NotificationModal";
import { useIsMobile } from "@/hooks/use-mobile";

// Import modular components
import {
  MessageBubble,
  ConversationItem,
  MessageInput,
  ChatHeader,
  TypingIndicator,
  type ReplyingTo,
} from "@/components/messages";

// Compression d'image côté client pour un upload plus rapide
const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    // Si le fichier est déjà petit, ne pas compresser
    if (file.size < 200 * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); // Nettoyer l'URL
      let { width, height } = img;

      // Redimensionner si trop large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
};

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthContext();
  const { refreshUnreadCount, markConversationRead } = useMessages();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConversationList, setShowConversationList] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // WebSocket state
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<ReplyingTo | null>(null);

  // WhatsApp-style fullscreen chat mode (mobile only)
  const isFullscreenChat = !showConversationList && selectedConversation !== null;

  // Contexte de la demande (quand on contacte depuis une demande publique)
  const [demandeContext, setDemandeContext] = useState<DemandeContext | null>(null);
  // Contexte de l'annonce (quand on contacte depuis une annonce)
  const [annonceContext, setAnnonceContext] = useState<AnnonceContext | null>(null);
  const [initialMessage, setInitialMessage] = useState("");

  // Gérer le paramètre ?lead= ou ?demande= ou ?user= ou state.conversationId pour ouvrir une conversation
  useEffect(() => {
    const leadId = searchParams.get('lead');
    const demandeId = searchParams.get('demande');
    const userId = searchParams.get('user');
    const state = location.state as {
      conversationId?: number;
      annonceContext?: AnnonceContext;
      suggestedMessage?: string;
    } | null;

    if (isAuthenticated && leadId) {
      startConversationFromLead(parseInt(leadId));
    } else if (isAuthenticated && demandeId) {
      startConversationFromDemande(parseInt(demandeId));
    } else if (isAuthenticated && userId) {
      startConversationFromUser(parseInt(userId));
    } else if (isAuthenticated && state?.conversationId) {
      // Ouvrir directement la conversation passée via state
      fetchConversations().then(() => {
        setSelectedConversation(state.conversationId!);
        setShowConversationList(false);

        // Appliquer le contexte d'annonce si disponible
        if (state.annonceContext) {
          setAnnonceContext(state.annonceContext);
        }
        // Appliquer le message suggéré si disponible
        if (state.suggestedMessage) {
          setInitialMessage(state.suggestedMessage);
        }
      });
      // Nettoyer le state pour éviter de rouvrir à chaque refresh
      navigate('/messages', { replace: true, state: {} });
    } else if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, searchParams, location.state]);

  const startConversationFromLead = async (leadId: number) => {
    try {
      setLoading(true);
      const { startConversationWithLead } = await import('@/lib/matchApi');
      const response = await startConversationWithLead(leadId);

      if (response.success) {
        await fetchConversations();
        setSelectedConversation(response.conversation.id);
        setShowConversationList(false);
        toast.success(`Conversation avec ${response.conversation.name} ouverte`);
        navigate('/messages', { replace: true });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la création de la conversation");
      fetchConversations();
    } finally {
      setLoading(false);
    }
  };

  const startConversationFromDemande = async (demandeId: number) => {
    try {
      setLoading(true);
      const { startConversationWithDemande } = await import('@/lib/matchApi');
      const response = await startConversationWithDemande(demandeId);

      if (response.success) {
        await fetchConversations();
        setSelectedConversation(response.conversation.id);
        setShowConversationList(false);

        if (response.demande_context) {
          setDemandeContext(response.demande_context);
        }
        if (response.suggested_message) {
          setInitialMessage(response.suggested_message);
        }

        toast.success(`Conversation avec ${response.conversation.name} ouverte`);
        navigate('/messages', { replace: true });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la création de la conversation");
      fetchConversations();
    } finally {
      setLoading(false);
    }
  };

  const startConversationFromUser = async (userId: number) => {
    try {
      setLoading(true);
      const { startConversationWithUser } = await import('@/lib/matchApi');
      const response = await startConversationWithUser(userId);

      if (response.success) {
        await fetchConversations();
        setSelectedConversation(response.conversation.id);
        setShowConversationList(false);

        if (response.annonce_context) {
          setAnnonceContext(response.annonce_context);
        }
        if (response.suggested_message) {
          setInitialMessage(response.suggested_message);
        }

        toast.success(`Conversation avec ${response.conversation.name} ouverte`);
        navigate('/messages', { replace: true });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la création de la conversation");
      fetchConversations();
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll vers le dernier message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-scroll quand le clavier mobile s'ouvre
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleViewportResize = () => {
      // Scroll vers le bas avec un petit délai pour laisser le layout se stabiliser
      setTimeout(scrollToBottom, 100);
    };

    window.visualViewport.addEventListener('resize', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, [scrollToBottom]);

  // Connexion WebSocket quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      connectWebSocket(selectedConversation);

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [selectedConversation]);

  // Polling: rafraîchir la liste des conversations toutes les 10 secondes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const { getMessages } = await import('@/lib/matchApi');
        const response = await getMessages();
        if (response.success) {
          setConversations(response.conversations);
        }
      } catch (error) {
        // Silently fail for background refresh
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const connectWebSocket = async (convId: number) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    let wsToken = '';
    try {
      const tokenResponse = await getWebSocketToken();
      if (tokenResponse.success && tokenResponse.token) {
        wsToken = tokenResponse.token;
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer le token WebSocket');
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`;
    const wsUrl = `${wsHost}/ws/chat/${convId}/${wsToken ? `?token=${wsToken}` : ''}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'mark_read' }));
      markConversationRead(convId);
      refreshUnreadCount();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'chat_message':
          const newMessage: Message = {
            id: data.message.id,
            content: data.message.contenu,
            sender_id: data.message.expediteur.id,
            sender_name: data.message.expediteur.full_name || data.message.expediteur.username,
            is_mine: data.message.expediteur.id === user?.id,
            timestamp: data.message.envoye_le,
            read: data.message.lu,
            reply_to: data.message.reply_to ? {
              id: data.message.reply_to.id,
              content: data.message.reply_to.contenu,
              sender_name: data.message.reply_to.expediteur?.full_name || data.message.reply_to.expediteur?.username
            } : undefined,
          };
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
          if (!newMessage.is_mine) {
            ws.send(JSON.stringify({ type: 'mark_read' }));
            refreshUnreadCount();
          }
          break;

        case 'typing_indicator':
          if (data.is_typing) {
            setOtherUserTyping(data.username);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setOtherUserTyping(null);
            }, 3000);
          } else {
            setOtherUserTyping(null);
          }
          break;

        case 'user_status':
          // Verifier que c'est le statut de l'AUTRE utilisateur, pas le notre
          if (data.user_id && user?.id && data.user_id !== user.id) {
            setOtherUserOnline(data.status === 'online');
          }
          break;

        case 'messages_read':
          setMessages(prev => prev.map(m => ({ ...m, read: true })));
          break;
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setOtherUserOnline(false);
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket erreur:', error);
    };

    wsRef.current = ws;
  };

  const sendTypingIndicator = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
    }
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { getMessages } = await import('@/lib/matchApi');
      const response = await getMessages();

      if (response.success) {
        setConversations(response.conversations);
        if (response.conversations.length > 0 && !selectedConversation) {
          if (window.innerWidth >= 768) {
            setSelectedConversation(response.conversations[0].id);
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const { getConversationMessages } = await import('@/lib/matchApi');
      const response = await getConversationMessages(convId);

      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors du chargement des messages");
    }
  };

  const handleSendMessage = async (messageText: string, images: File[], replyToId?: number) => {
    if (!selectedConversation) return;

    // Si on a des images, on doit les uploader d'abord
    if (images.length > 0) {
      const { uploadImage } = await import('@/lib/matchApi');

      // Compresser les images en parallèle avant upload
      const compressedImages = await Promise.all(
        images.map(img => compressImage(img))
      );

      // Upload en parallèle pour plus de rapidité
      const uploadPromises = compressedImages.map(image => uploadImage(image));
      const results = await Promise.all(uploadPromises);

      const imageUrls: string[] = [];
      for (const result of results) {
        if (result.success && result.url) {
          imageUrls.push(result.url);
        } else {
          throw new Error(result.error || 'Erreur upload image');
        }
      }

      let fullContent = messageText;
      if (imageUrls.length > 0) {
        const imagesMarkup = imageUrls.map(url => `[image:${url}]`).join('\n');
        fullContent = fullContent ? `${fullContent}\n\n${imagesMarkup}` : imagesMarkup;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          message: fullContent,
          reply_to: replyToId
        }));
        wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
        setReplyingTo(null);
        return;
      }
    }

    // Message texte simple (sans images)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        message: messageText,
        reply_to: replyToId
      }));
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: false }));
      setReplyingTo(null);
      return;
    }

    // Fallback HTTP
    const { sendMessage } = await import('@/lib/matchApi');
    const response = await sendMessage(selectedConversation, { content: messageText });

    if (response.success) {
      setMessages([...messages, response.message]);
      fetchConversations();
      setReplyingTo(null);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      const { deleteMessage } = await import('@/lib/matchApi');
      const response = await deleteMessage(messageId);

      if (response.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, is_deleted: true, content: 'Message supprimé' }
            : msg
        ));
        toast.success("Message supprimé");
      } else {
        toast.error(response.error || "Erreur lors de la suppression");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erreur lors de la suppression du message");
    }
  };

  const handleReaction = async (messageId: number, emoji: string | null) => {
    try {
      const { addReaction } = await import('@/lib/matchApi');
      const response = await addReaction(messageId, emoji);

      if (response.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, reaction: response.action === 'added' ? emoji : null }
            : msg
        ));
      }
    } catch (error: any) {
      console.error('Erreur réaction:', error);
    }
  };

  const handleSelectConversation = (convId: number) => {
    setSelectedConversation(convId);
    setShowConversationList(false);
    setDemandeContext(null);
    setInitialMessage("");
  };

  const handleBackToList = () => {
    setShowConversationList(true);
    setDemandeContext(null);
    setInitialMessage("");
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  // Group messages by sender for bubble styling
  const getMessageGroupInfo = (index: number) => {
    const msg = messages[index];
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

    const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id;
    const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;

    return { isFirstInGroup, isLastInGroup };
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Accédez à vos messages</h2>
            <p className="text-muted-foreground mb-6">Connectez-vous pour voir vos conversations et échanger avec les propriétaires</p>
            <Button onClick={() => setAuthModalOpen(true)} className="rounded-xl gradient-search text-search-foreground">
              Se connecter
            </Button>
          </motion.div>
        </div>
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          trigger="login"
        />
      </>
    );
  }

  return (
    <div className={cn(
      "bg-background",
      isFullscreenChat ? "h-[100svh] overflow-hidden" : "min-h-screen"
    )}>
      {/* Modal pour activer les notifications push */}
      <NotificationModal />

      {/* Hide Navbar on mobile when in fullscreen chat mode */}
      <div className={cn(
        "transition-all duration-300",
        isFullscreenChat && "hidden md:block"
      )}>
        <Navbar />
      </div>

      {/* Mobile: pt-navbar (96px) accounts for 2-row navbar with tabs */}
      <div className={cn(
        "flex flex-col h-full",
        isFullscreenChat ? "pt-0 md:pt-20" : "pt-navbar h-screen"
      )}>
        <div className="flex-1 flex overflow-hidden relative">
          {/* Conversations List */}
          <motion.div
            initial={false}
            animate={isMobile ? {
              x: showConversationList ? 0 : "-100%",
            } : {
              x: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.8
            }}
            className={cn(
              "w-full md:w-80 lg:w-96 border-r border-border bg-card/50 flex flex-col",
              "absolute md:relative inset-0 md:inset-auto z-30 md:z-auto",
              isMobile && !showConversationList && "pointer-events-none"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-background/95 backdrop-blur-sm safe-area-top">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="shrink-0 h-10 w-10 rounded-full touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Messages
                </h1>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl h-11 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Aucune conversation</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredConversations.map((conv, index) => (
                    <ConversationItem
                      key={conv.id}
                      id={conv.id}
                      name={conv.name}
                      lastMessage={conv.lastMessage}
                      timestamp={conv.timestamp}
                      unread={conv.unread}
                      isSelected={selectedConversation === conv.id}
                      isOtherDeleted={conv.is_other_deleted}
                      index={index}
                      onClick={() => handleSelectConversation(conv.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
            
            {/* Safe area bottom padding for conversation list */}
            <div className="h-20 md:h-0 shrink-0" />
          </motion.div>

          {/* Chat Area */}
          <motion.div
            initial={false}
            animate={isMobile ? {
              x: showConversationList ? "100%" : 0,
              opacity: showConversationList ? 0 : 1,
            } : {
              x: 0,
              opacity: 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
              mass: 0.8
            }}
            className={cn(
              "flex-1 flex flex-col bg-gradient-to-b from-background to-muted/10",
              "absolute md:relative inset-0 md:inset-auto z-20 md:z-auto",
              isMobile && showConversationList && "pointer-events-none"
            )}
          >
            {selectedConversation && selectedConv ? (
              <>
                {/* Chat Header */}
                <ChatHeader
                  name={selectedConv.name}
                  otherUserId={selectedConv.other_user_id}
                  isOnline={otherUserOnline}
                  isTyping={otherUserTyping}
                  isOtherDeleted={selectedConv.is_other_deleted}
                  isFullscreen={isFullscreenChat}
                  onBack={handleBackToList}
                />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 overscroll-contain [-webkit-overflow-scrolling:touch]">
                  {/* Encart contextuel de la demande */}
                  {demandeContext && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-2xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-2">
                            Vous contactez {selectedConv.name} à propos de sa demande
                          </h4>
                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            {demandeContext.villes && demandeContext.villes.length > 0 && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{demandeContext.villes.join(', ')}</span>
                              </div>
                            )}
                            {demandeContext.budget_max && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Max {demandeContext.budget_max}$/mois</span>
                              </div>
                            )}
                            {demandeContext.date_recherche && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(demandeContext.date_recherche).toLocaleDateString('fr-CA')}</span>
                              </div>
                            )}
                            {demandeContext.nb_pieces_min && (
                              <div className="flex items-center gap-2">
                                <Home className="w-3.5 h-3.5" />
                                <span>{demandeContext.nb_pieces_min}+ pièces</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Encart contextuel de l'annonce */}
                  {annonceContext && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20 rounded-2xl"
                    >
                      <div className="flex items-start gap-3">
                        {annonceContext.image_url ? (
                          <img
                            src={annonceContext.image_url}
                            alt={annonceContext.titre}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                            <Home className="w-6 h-6 text-violet-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 truncate">
                            {annonceContext.titre}
                          </h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3.5 h-3.5 text-violet-500" />
                              <span className="font-medium text-violet-600">{annonceContext.prix}$/mois</span>
                            </div>
                            {annonceContext.ville && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {annonceContext.quartier ? `${annonceContext.quartier}, ` : ''}{annonceContext.ville}
                                </span>
                              </div>
                            )}
                            {annonceContext.type_logement && (
                              <div className="flex items-center gap-2">
                                <Home className="w-3.5 h-3.5" />
                                <span>{annonceContext.type_logement}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Empty state */}
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex items-center justify-center py-12"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground">Aucun message</p>
                        <p className="text-sm text-muted-foreground/70">
                          {(demandeContext || annonceContext) ? "Envoyez votre premier message!" : "Commencez la conversation!"}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                      {messages.map((msg, index) => {
                        const { isFirstInGroup, isLastInGroup } = getMessageGroupInfo(index);
                        return (
                          <MessageBubble
                            key={msg.id}
                            id={msg.id}
                            content={msg.content}
                            isMine={msg.is_mine}
                            timestamp={msg.timestamp}
                            read={msg.read}
                            isDeleted={msg.is_deleted}
                            senderName={selectedConv.name}
                            senderInitial={selectedConv.name.charAt(0)}
                            replyTo={msg.reply_to}
                            reaction={msg.reaction}
                            isFirstInGroup={isFirstInGroup}
                            isLastInGroup={isLastInGroup}
                            onReply={() => setReplyingTo({
                              id: msg.id,
                              content: msg.content,
                              sender_name: msg.is_mine ? 'Vous' : selectedConv.name
                            })}
                            onDelete={msg.is_mine ? () => handleDeleteMessage(msg.id) : undefined}
                            onReaction={(emoji) => handleReaction(msg.id, emoji)}
                          />
                        );
                      })}
                    </AnimatePresence>
                  )}
                  
                  {/* Typing indicator */}
                  <AnimatePresence>
                    {otherUserTyping && (
                      <TypingIndicator
                        senderName={selectedConv.name}
                        senderInitial={selectedConv.name.charAt(0)}
                      />
                    )}
                  </AnimatePresence>
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <MessageInput
                  onSend={handleSendMessage}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  onTyping={sendTypingIndicator}
                  isFullscreen={isFullscreenChat}
                  disabled={selectedConv.is_other_deleted}
                  initialMessage={initialMessage}
                  onInitialMessageUsed={() => setInitialMessage("")}
                />
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center p-4"
              >
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Vos messages</h3>
                  <p className="text-muted-foreground text-sm">
                    Sélectionnez une conversation pour commencer à discuter
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Hide MobileNav on mobile when in fullscreen chat mode */}
      <div className={cn(
        "transition-all duration-300",
        isFullscreenChat && "hidden md:block"
      )}>
        <MobileNav />
      </div>
    </div>
  );
}
