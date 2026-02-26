/**
 * ChatMessageRenderer - Rendu intelligent des messages du chatbot
 * - Markdown pour le texte formaté
 * - Composants riches pour les contenus structurés (features, guides, FAQ)
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Heart,
  MessageSquare,
  Home,
  Users,
  Shield,
  Sparkles,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Building2,
  FileText,
  Star
} from 'lucide-react';

interface ChatMessageRendererProps {
  content: string;
  isUser?: boolean;
}

// Mapping des icônes par mot-clé
const ICON_MAP: Record<string, React.ElementType> = {
  'recherche': Search,
  'search': Search,
  'alerte': Bell,
  'alertes': Bell,
  'notification': Bell,
  'favori': Heart,
  'favoris': Heart,
  'message': MessageSquare,
  'messagerie': MessageSquare,
  'logement': Home,
  'appartement': Building2,
  'maison': Home,
  'proprietaire': Users,
  'bailleur': Users,
  'locataire': Users,
  'securite': Shield,
  'gratuit': Sparkles,
  'carte': MapPin,
  'map': MapPin,
  'prix': DollarSign,
  'budget': DollarSign,
  'annonce': FileText,
  'publier': FileText,
  'avis': Star,
  'evaluation': Star,
};

// Détecte si le contenu contient des sections structurées
function detectContentType(content: string): 'rich' | 'markdown' {
  // Patterns qui indiquent du contenu structuré (explication de features)
  const richPatterns = [
    /\*\*Pour les locataires/i,
    /\*\*Pour les proprietaires/i,
    /\*\*Comment [çca] fonctionne/i,
    /\*\*Fonctionnalites/i,
    /\*\*Etape \d/i,
    /^\d+\.\s+\*\*.+:\*\*/gm,  // "1. **Titre:**" pattern
  ];

  for (const pattern of richPatterns) {
    if (pattern.test(content)) {
      return 'rich';
    }
  }

  return 'markdown';
}

// Parse le contenu en sections pour l'affichage riche
function parseRichContent(content: string): { title: string; items: { title: string; description: string; icon: React.ElementType }[] }[] {
  const sections: { title: string; items: { title: string; description: string; icon: React.ElementType }[] }[] = [];

  // Split par sections principales (** ... **)
  const sectionRegex = /\*\*([^*]+)\*\*/g;
  const lines = content.split('\n');

  let currentSection: { title: string; items: { title: string; description: string; icon: React.ElementType }[] } | null = null;
  let currentItem: { title: string; description: string; icon: React.ElementType } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Détection d'une section principale (ex: "**Pour les locataires :**")
    const sectionMatch = trimmedLine.match(/^\*\*([^*:]+)\s*:?\*\*$/);
    if (sectionMatch) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: sectionMatch[1].trim(), items: [] };
      currentItem = null;
      continue;
    }

    // Détection d'un item numéroté (ex: "1. **Recherche facile :**")
    const itemMatch = trimmedLine.match(/^\d+\.\s+\*\*([^*:]+)\s*:?\*\*\s*(.*)$/);
    if (itemMatch && currentSection) {
      if (currentItem) {
        currentSection.items.push(currentItem);
      }
      const title = itemMatch[1].trim();
      const icon = findIconForText(title);
      currentItem = {
        title,
        description: itemMatch[2] || '',
        icon
      };
      continue;
    }

    // Continuation de la description
    if (currentItem && trimmedLine && !trimmedLine.startsWith('**')) {
      currentItem.description += (currentItem.description ? ' ' : '') + trimmedLine;
    }
  }

  // Ajouter le dernier item et section
  if (currentItem && currentSection) {
    currentSection.items.push(currentItem);
  }
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

// Trouve l'icône appropriée pour un texte
function findIconForText(text: string): React.ElementType {
  const lowerText = text.toLowerCase();

  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lowerText.includes(keyword)) {
      return icon;
    }
  }

  return CheckCircle2; // Icône par défaut
}

// Couleurs pour les cards
const CARD_COLORS = [
  'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
  'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800',
];

const ICON_COLORS = [
  'text-blue-600 dark:text-blue-400',
  'text-green-600 dark:text-green-400',
  'text-amber-600 dark:text-amber-400',
  'text-purple-600 dark:text-purple-400',
  'text-rose-600 dark:text-rose-400',
  'text-cyan-600 dark:text-cyan-400',
];

// Composant pour le rendu riche
function RichContent({ content }: { content: string }) {
  const sections = parseRichContent(content);

  // Si pas de sections détectées, fallback sur markdown
  if (sections.length === 0) {
    return <MarkdownContent content={content} />;
  }

  // Extraire l'intro (texte avant les sections)
  const introMatch = content.match(/^([^*]+?)(?=\*\*)/);
  const intro = introMatch ? introMatch[1].trim() : '';

  return (
    <div className="space-y-4">
      {/* Intro */}
      {intro && (
        <p className="text-sm">{intro}</p>
      )}

      {/* Sections */}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-2">
          {/* Section title */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              sectionIndex % 2 === 0 ? "bg-primary/10" : "bg-secondary"
            )}>
              {sectionIndex % 2 === 0 ? (
                <Users className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Building2 className="w-3.5 h-3.5 text-secondary-foreground" />
              )}
            </div>
            <h4 className="font-semibold text-sm">{section.title}</h4>
          </div>

          {/* Items as cards */}
          <div className="grid gap-2">
            {section.items.map((item, itemIndex) => {
              const colorIndex = itemIndex % CARD_COLORS.length;
              const IconComponent = item.icon;

              return (
                <div
                  key={itemIndex}
                  className={cn(
                    "p-3 rounded-xl border transition-all hover:shadow-sm",
                    CARD_COLORS[colorIndex]
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      "bg-white/60 dark:bg-black/20"
                    )}>
                      <IconComponent className={cn("w-4 h-4", ICON_COLORS[colorIndex])} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium text-sm mb-0.5">{item.title}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant pour le rendu Markdown
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Paragraphes
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        // Titres
        h1: ({ children }) => (
          <h1 className="text-base font-bold mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1">{children}</h3>
        ),
        // Listes
        ul: ({ children }) => (
          <ul className="text-sm space-y-1 mb-2 ml-4 list-disc">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="text-sm space-y-1 mb-2 ml-4 list-decimal">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed">{children}</li>
        ),
        // Bold et italic
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        // Liens
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        // Code
        code: ({ children }) => (
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/30 pl-3 italic text-muted-foreground">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function ChatMessageRenderer({ content, isUser = false }: ChatMessageRendererProps) {
  // Les messages utilisateur sont toujours en texte simple
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>;
  }

  // Détecter le type de contenu pour les messages assistant
  const contentType = detectContentType(content);

  if (contentType === 'rich') {
    return <RichContent content={content} />;
  }

  return <MarkdownContent content={content} />;
}

export default ChatMessageRenderer;
