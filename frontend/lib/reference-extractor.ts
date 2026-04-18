import { Reference } from '@/lib/references-context';

const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;
const FILE_REGEX = /\b[\w\-_]+\.(pdf|doc|docx|txt|py|js|ts|jsx|tsx|java|cpp|c|cs|rb|go|rs|json|xml|md|html|css)\b/gi;
const DOCUMENT_REGEX = /(?:document|file|paper|report|article|study|book|chapter|section)\s*["']([^"']+)["']/gi;

export interface ReferenceExtractionResult {
  references: Omit<Reference, 'id' | 'timestamp'>[];
  processedContent: string;
}

export function extractReferences(
  content: string, 
  messageId: string, 
  contextWindow: number = 50
): ReferenceExtractionResult {
  const references: Omit<Reference, 'id' | 'timestamp'>[] = [];
  let processedContent = content;

  // Extract URLs
  const urlMatches = content.match(URL_REGEX);
  if (urlMatches) {
    // Deduplicate raw regex matches first
    const uniqueUrls = [...new Set(urlMatches)];
    uniqueUrls.forEach(url => {
      // 1. Strip basic trailing punctuation, quotes, and asterisks
      let cleanUrl = url.replace(/[.,;:!?*'"]+$/, '');
      
      // 2. Handle Markdown links by checking for unbalanced parentheses
      const openParens = (cleanUrl.match(/\(/g) || []).length;
      const closeParens = (cleanUrl.match(/\)/g) || []).length;
      
      // If it ends with ')' but we have more closing than opening parens
      if (cleanUrl.endsWith(')') && closeParens > openParens) {
        cleanUrl = cleanUrl.slice(0, -1);
        cleanUrl = cleanUrl.replace(/[.,;:!?*'"]+$/, ''); // Clean newly exposed punctuation
      }

      const index = content.indexOf(url);
      const context = getContext(content, index, url.length, contextWindow);
      
      references.push({
        text: cleanUrl,
        type: 'url',
        messageId,
        context: context,
      });
    });
  }

  // Extract file references
  const fileNames = new Set<string>();
  let fileMatch;
  while ((fileMatch = FILE_REGEX.exec(content)) !== null) {
    const filename = fileMatch[0];
    
    // Avoid duplicate file names (case-insensitive)
    const lowerFilename = filename.toLowerCase();
    if (fileNames.has(lowerFilename)) continue;
    fileNames.add(lowerFilename);
    
    const index = fileMatch.index;
    const context = getContext(content, index, filename.length, contextWindow);
    
    references.push({
      text: filename,
      type: 'file',
      messageId,
      context: context,
    });
  }

  // Extract document references
  const documentNames = new Set<string>();
  let documentMatch;
  while ((documentMatch = DOCUMENT_REGEX.exec(content)) !== null) {
    const fullMatch = documentMatch[0];
    const documentName = documentMatch[1];
    
    // Avoid duplicate document names (case-insensitive)
    const lowerDocName = documentName.toLowerCase();
    if (documentNames.has(lowerDocName)) continue;
    documentNames.add(lowerDocName);
    
    const index = documentMatch.index;
    const context = getContext(content, index, fullMatch.length, contextWindow);
    
    references.push({
      text: documentName,
      type: 'document',
      messageId,
      context: context,
    });
  }

  // Deduplicate references within this message content
  const deduplicatedReferences = references.filter((ref, index, arr) => {
    return arr.findIndex(r => {
      // For URLs, compare case-insensitive, decoded, and stripped of protocols
      if (ref.type === 'url' && r.type === 'url') {
        const normalizeUrl = (urlStr: string) => {
          let normalized = urlStr.toLowerCase();
          try { 
            normalized = decodeURIComponent(normalized); 
          } catch (e) { 
            // Ignore malformed URI errors 
          }
          return normalized
            .replace(/^https?:\/\//, '') // Strip http:// or https://
            .replace(/^www\./, '')       // Strip www.
            .replace(/\/$/, '');         // Strip trailing slash
        };
        return normalizeUrl(r.text) === normalizeUrl(ref.text);
      }
      
      // For other types, exact match
      return r.type === ref.type && r.text.toLowerCase() === ref.text.toLowerCase();
    }) === index;
  });

  return {
    references: deduplicatedReferences,
    processedContent: content, // Could be enhanced to add reference markers
  };
}

function getContext(content: string, index: number, length: number, contextWindow: number): string {
  const start = Math.max(0, index - contextWindow);
  const end = Math.min(content.length, index + length + contextWindow);
  
  let context = content.substring(start, end);
  
  // Add ellipsis if we're not at the beginning/end
  if (start > 0) context = '...' + context;
  if (end < content.length) context = context + '...';
  
  return context.trim();
}