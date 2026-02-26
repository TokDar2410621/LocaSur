/**
 * ChatWidget - Widget de chat IA flottant
 * Desktop: Modal flottant
 * Mobile: Redirige vers /chat (page plein écran)
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Home, MapPin, DollarSign, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sendChatMessage, executeChatAction, CHAT_SUGGESTIONS, loadChatHistoryFromServer, saveChatHistoryToServer, type ChatMessage, type ChatAction, type ChatMessageContent } from '@/lib/chatApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthModal from '@/components/auth/AuthModal';
import ChatMessageRenderer from '@/components/chat/ChatMessageRenderer';
import ChatSearchResults from '@/components/chat/ChatSearchResults';
import ChatExternalResults from '@/components/chat/ChatExternalResults';
import ChatComparisonWidget from '@/components/chat/ChatComparisonWidget';
import ChatFeedback from '@/components/chat/ChatFeedback';

const CHAT_STORAGE_KEY = 'housing_chat_history';

// Charger l'historique depuis sessionStorage
function loadChatHistory(): ChatMessage[] {
  try {
    const stored = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((msg: ChatMessage & { timestamp?: string }) => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
    }
  } catch (e) {
    console.error('Error loading chat history:', e);
  }
  return [];
}

// Sauvegarder l'historique dans sessionStorage
function saveChatHistory(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving chat history:', e);
  }
}

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState<ChatAction[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Hide widget on chat page
  const isOnChatPage = location.pathname === '/chat';

  // Charger l'historique depuis le serveur si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistoryFromServer()
        .then(response => {
          if (response.success && response.has_history && response.messages.length > 0) {
            const serverMessages = response.messages.map(msg => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp as unknown as string) : new Date()
            }));
            setMessages(serverMessages);
            saveChatHistory(serverMessages);
          }
        });
    }
  }, [isAuthenticated]);

  // Auto-scroll to bottom when new messages arrive or loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sauvegarder l'historique quand les messages changent
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);

      // Sauvegarder sur le serveur si authentifié (debounced)
      if (isAuthenticated) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveChatHistoryToServer(messages);
        }, 2000);
      }
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, isAuthenticated]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when input is focused
  const handleInputFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle button click - redirect on mobile, open modal on desktop
  const handleButtonClick = () => {
    if (isMobile) {
      navigate('/chat');
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setActions([]);
    setSuggestions([]);

    try {
      // Get last 10 messages for context
      const history = [...messages, userMessage].slice(-10);
      const response = await sendChatMessage(text, history);

      if (response.success) {
        // Add assistant message with content if available
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          response_type: response.response_type,
          messageContent: response.content as ChatMessageContent
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Set actions if available
        if (response.actions && response.actions.length > 0) {
          setActions(response.actions);
        }

        // Set suggestions if available
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        }
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: "Desolee, j'ai rencontre un probleme. Pouvez-vous reformuler?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Une erreur est survenue. Veuillez reessayer.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: ChatAction) => {
    // Navigation actions
    if (action.action === 'navigate' && action.data?.url) {
      navigate(action.data.url as string);
      setIsOpen(false);
      return;
    }

    // Login action
    if (action.action === 'login') {
      setAuthModalOpen(true);
      return;
    }

    // Show results action
    if (action.action === 'show_results' && action.data?.criteria) {
      const params = new URLSearchParams();
      Object.entries(action.data.criteria as Record<string, string>).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      navigate(`/search?${params.toString()}`);
      setIsOpen(false);
      return;
    }

    // Execute search action (from conversation mode - "Lancer cette recherche")
    if (action.action === 'execute_search' && action.data) {
      const params = new URLSearchParams();
      Object.entries(action.data as Record<string, string | number>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      navigate(`/search?${params.toString()}`);
      setIsOpen(false);
      return;
    }

    // Show map action
    if (action.action === 'show_map' && action.data?.criteria) {
      const params = new URLSearchParams();
      Object.entries(action.data.criteria as Record<string, string>).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      navigate(`/search/map?${params.toString()}`);
      setIsOpen(false);
      return;
    }

    // External search action (Serper API)
    if (action.action === 'external_search') {
      try {
        setIsLoading(true);
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
        const searchQuery = lastAssistantMessage?.content || 'logement Quebec';

        const response = await executeChatAction('external_search', { query: searchQuery });
        if (response.success) {
          const confirmMessage: ChatMessage = {
            role: 'assistant',
            content: "J'ai lance une recherche sur d'autres sites immobiliers. Les resultats s'afficheront dans une nouvelle fenetre.",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
          setActions([]);
        } else {
          toast({
            title: "Erreur",
            description: response.error || "Impossible d'effectuer la recherche externe.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('External search error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la recherche externe.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Create alert action
    if (action.action === 'create_alert' && action.data) {
      try {
        setIsLoading(true);
        const response = await executeChatAction('create_alert', action.data);
        if (response.success) {
          toast({
            title: "Alerte creee!",
            description: response.message || "Vous serez notifie des nouvelles annonces.",
          });
          // Add confirmation message
          const confirmMessage: ChatMessage = {
            role: 'assistant',
            content: `Alerte "${action.data.name}" creee avec succes! Vous recevrez des notifications pour les nouvelles annonces correspondantes.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
          setActions([]);
        } else {
          toast({
            title: "Erreur",
            description: response.error || "Impossible de creer l'alerte.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Create alert error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Compare top results action
    if (action.action === 'compare_top') {
      try {
        setIsLoading(true);
        const response = await executeChatAction('compare_top', action.data || { limit: 3 });
        if (response.success && response.widget_html) {
          const comparisonMessage: ChatMessage = {
            role: 'assistant',
            content: "Voici une comparaison des meilleurs logements:",
            timestamp: new Date(),
            response_type: 'comparison_widget',
            messageContent: { comparison: action.data }
          };
          setMessages(prev => [...prev, comparisonMessage]);
          setActions([]);
        } else {
          toast({
            title: "Erreur",
            description: response.error || "Impossible de comparer les logements.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Compare error:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Search internal (after external search)
    if (action.action === 'search_internal') {
      handleSendMessage("Montre-moi les logements disponibles sur LocaSur");
      return;
    }

    // Search action (generic)
    if (action.action === 'search') {
      navigate('/search');
      setIsOpen(false);
      return;
    }
  };

  // Don't render on chat page
  if (isOnChatPage) {
    return null;
  }

  return (
    <div className={cn("fixed bottom-20 md:bottom-4 right-4 z-50", className)}>
      {/* Chat Window - Desktop only */}
      {isOpen && !isMobile && (
        <div className="absolute bottom-16 right-0 w-[360px] sm:w-[400px] h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistant LocaSur</h3>
                <p className="text-xs opacity-80">Je vous aide a trouver un logement</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Welcome Message */}
                <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                  <p className="text-sm">
                    Bonjour! Je suis votre assistant pour trouver un logement au Quebec.
                    Comment puis-je vous aider?
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {CHAT_SUGGESTIONS.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
                    <Home className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
                    <span className="text-[9px] text-center text-muted-foreground">Recherche</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mb-1" />
                    <span className="text-[9px] text-center text-muted-foreground">Quartiers</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1" />
                    <span className="text-[9px] text-center text-muted-foreground">Prix</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                    <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <span className="text-[9px] text-center text-muted-foreground">Alertes</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[85%] rounded-2xl p-3",
                      message.role === 'user'
                        ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <ChatMessageRenderer
                      content={message.content}
                      isUser={message.role === 'user'}
                    />

                    {/* Afficher les résultats de recherche inline */}
                    {message.role === 'assistant' &&
                     message.response_type === 'search_results' &&
                     message.messageContent?.results &&
                     message.messageContent.results.length > 0 && (
                      <ChatSearchResults
                        results={message.messageContent.results}
                        count={message.messageContent.count}
                        maxDisplay={2}
                        onViewAll={() => {
                          const criteria = message.messageContent?.criteria || {};
                          const params = new URLSearchParams();
                          Object.entries(criteria).forEach(([key, value]) => {
                            if (value) params.set(key, String(value));
                          });
                          navigate(`/search?${params.toString()}`);
                          setIsOpen(false);
                        }}
                      />
                    )}

                    {/* Afficher les résultats externes (Serper) */}
                    {message.role === 'assistant' &&
                     message.response_type === 'external_results' &&
                     message.messageContent?.external_results &&
                     message.messageContent.external_results.length > 0 && (
                      <ChatExternalResults
                        results={message.messageContent.external_results}
                        query={message.messageContent.query}
                        maxDisplay={2}
                      />
                    )}

                    {/* Afficher le widget de comparaison */}
                    {message.role === 'assistant' &&
                     message.response_type === 'comparison_widget' &&
                     message.messageContent?.comparison && (
                      <ChatComparisonWidget
                        comparison={message.messageContent.comparison}
                      />
                    )}

                    {/* Feedback pour les messages assistant */}
                    {message.role === 'assistant' && index > 0 && (
                      <ChatFeedback messageIndex={index} />
                    )}
                  </div>
                ))}

                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(action)}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Dynamic Suggestions */}
                {suggestions.length > 0 && !isLoading && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground">Suggestions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-[10px] bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="bg-muted rounded-2xl rounded-bl-sm p-3 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Reflexion en cours...</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                onFocus={handleInputFocus}
                placeholder="Decrivez votre recherche..."
                disabled={isLoading}
                className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-1"
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="rounded-full h-10 w-10 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <Button
        size="icon"
        onClick={handleButtonClick}
        className={cn(
          "h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen && !isMobile && "rotate-90 bg-muted text-muted-foreground hover:bg-muted/80"
        )}
      >
        {isOpen && !isMobile ? (
          <X className="h-5 w-5 md:h-6 md:w-6" />
        ) : (
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        )}
      </Button>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        trigger="login"
        defaultMode="login"
      />
    </div>
  );
}

export default ChatWidget;
