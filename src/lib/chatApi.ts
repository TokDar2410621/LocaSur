/**
 * API Client pour le Chatbot IA LocaSur
 * Endpoints pour la conversation avec l'assistant IA
 */

import api from './api';

// ============================================
// TYPES
// ============================================

export interface ChatSearchResult {
  id: number;
  titre?: string;
  prix?: number;
  ville?: string;
  quartier?: string;
  nombre_pieces?: string;
  superficie?: number;
  image_url?: string;
  url?: string;
  seo_url?: string;
}

export interface ChatExternalResult {
  title?: string;
  link?: string;
  snippet?: string;
  imageUrl?: string;
  source?: string;
}

export interface ChatComparisonItem {
  id: number;
  titre?: string;
  prix?: number;
  ville?: string;
  quartier?: string;
  nombre_pieces?: string;
  superficie?: number;
  image_url?: string;
  score?: number;
  is_recommended?: boolean;
}

export interface ChatComparisonData {
  items?: ChatComparisonItem[];
  winner?: ChatComparisonItem;
  summary?: string;
}

export interface ChatMessageContent {
  results?: ChatSearchResult[];
  count?: number;
  criteria?: Record<string, unknown>;
  query?: string;
  comparison?: ChatComparisonData;
  external_results?: ChatExternalResult[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  response_type?: 'text' | 'search_results' | 'comparison_widget' | 'external_results';
  messageContent?: ChatMessageContent;
}

export interface ChatAction {
  type: 'button';
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface ChatResponse {
  success: boolean;
  response_type: 'text' | 'search_results' | 'comparison_widget' | 'external_results';
  message: string;
  widget_html?: string;
  actions?: ChatAction[];
  suggestions?: string[];
  content?: {
    results?: unknown[];
    criteria?: Record<string, unknown>;
    query?: string;
  };
}

export interface ActionResponse {
  success: boolean;
  redirect_url?: string;
  widget_html?: string;
  error?: string;
  message?: string;
  alert_id?: number;
}

// ============================================
// CHAT API
// ============================================

/**
 * Envoyer un message au chatbot IA
 */
export async function sendChatMessage(
  message: string,
  history?: ChatMessage[]
): Promise<ChatResponse> {
  return api.post<ChatResponse>('/api/chat/message/', {
    message,
    history: history?.map(msg => ({
      role: msg.role,
      content: msg.content,
      messageContent: msg.messageContent
    }))
  });
}

/**
 * Executer une action suggérée par le chatbot
 */
export async function executeChatAction(
  action: string,
  data?: Record<string, unknown>
): Promise<ActionResponse> {
  return api.post<ActionResponse>('/api/chat/action/', {
    action,
    data
  });
}

// ============================================
// CHAT HISTORY API (persistance pour utilisateurs connectés)
// ============================================

export interface ChatHistoryResponse {
  success: boolean;
  messages: ChatMessage[];
  has_history: boolean;
  error?: string;
}

/**
 * Charger l'historique de chat depuis le serveur (utilisateurs connectés)
 */
export async function loadChatHistoryFromServer(): Promise<ChatHistoryResponse> {
  try {
    return await api.get<ChatHistoryResponse>('/api/chat/history/');
  } catch {
    return { success: false, messages: [], has_history: false };
  }
}

/**
 * Sauvegarder l'historique de chat sur le serveur (utilisateurs connectés)
 */
export async function saveChatHistoryToServer(messages: ChatMessage[]): Promise<{ success: boolean }> {
  try {
    // Préparer les messages pour l'envoi (convertir Date en string)
    const preparedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      response_type: msg.response_type,
      messageContent: msg.messageContent
    }));

    return await api.post<{ success: boolean }>('/api/chat/history/save/', {
      messages: preparedMessages
    });
  } catch {
    return { success: false };
  }
}

/**
 * Effacer l'historique de chat sur le serveur
 */
export async function clearChatHistoryOnServer(): Promise<{ success: boolean }> {
  try {
    return await api.delete<{ success: boolean }>('/api/chat/history/clear/');
  } catch {
    return { success: false };
  }
}

// ============================================
// SUGGESTIONS
// ============================================

export const CHAT_SUGGESTIONS = [
  "Cherche un 4½ a Saguenay moins de 1000$",
  "Cree une alerte pour un 3½ a Quebec",
  "Quels sont les quartiers populaires?",
  "Trouve-moi un logement acceptant les animaux",
  "Comment publier mon annonce?"
];
