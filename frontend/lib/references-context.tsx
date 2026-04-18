import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Reference {
  id: string;
  text: string;
  type: 'url' | 'file' | 'document' | 'other'; // Removed citation and mention
  messageId: string;
  timestamp: Date;
  context?: string;
}

interface ReferencesContextType {
  references: Reference[];
  addReference: (reference: Omit<Reference, 'id' | 'timestamp'>) => void;
  removeReference: (id: string) => void;
  clearReferences: () => void;
  getReferencesByType: (type: Reference['type']) => Reference[];
  scrollToReference: (messageId: string) => void;
}

const ReferencesContext = createContext<ReferencesContextType | undefined>(undefined);

// Helper function to unify URL matching across the app
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

export function ReferencesProvider({ children }: { children: ReactNode }) {
  const [references, setReferences] = useState<Reference[]>([]);

  const addReference = useCallback((reference: Omit<Reference, 'id' | 'timestamp'>) => {
    // Skip 'other' type references (key terms)
    if (reference.type === 'other') {
      return;
    }

    setReferences(prev => {
      const isDuplicate = prev.some(ref => {
        if (reference.type === 'url' && ref.type === 'url') {
          return normalizeUrl(ref.text) === normalizeUrl(reference.text);
        }
        
        if (ref.type === reference.type) {
          return ref.text.toLowerCase() === reference.text.toLowerCase();
        }
        
        return false;
      });
      
      if (isDuplicate) {
        // Update the existing reference with newer context if available
        return prev.map(ref => {
          const shouldUpdate = (reference.type === 'url' && ref.type === 'url' && 
            normalizeUrl(ref.text) === normalizeUrl(reference.text)) ||
            (ref.type === reference.type && ref.text.toLowerCase() === reference.text.toLowerCase());
            
          if (shouldUpdate && reference.context && reference.context !== ref.context) {
            return {
              ...ref,
              // Update with newer context and timestamp
              context: reference.context,
              timestamp: new Date(),
              messageId: reference.messageId
            };
          }
          return ref;
        });
      }
      
      const newReference: Reference = {
        ...reference,
        id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };
      
      return [...prev, newReference];
    });
  }, []);

  const removeReference = useCallback((id: string) => {
    setReferences(prev => prev.filter(ref => ref.id !== id));
  }, []);

  const clearReferences = useCallback(() => {
    setReferences([]);
  }, []);

  const getReferencesByType = useCallback((type: Reference['type']) => {
    return references.filter(ref => ref.type === type);
  }, [references]);

  const scrollToReference = useCallback((messageId: string) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      messageElement.classList.add('bg-blue-100', 'transition-colors', 'duration-1000');
      setTimeout(() => {
        messageElement.classList.remove('bg-blue-100');
      }, 2000);
    }
  }, []);

  return (
    <ReferencesContext.Provider value={{
      references,
      addReference,
      removeReference,
      clearReferences,
      getReferencesByType,
      scrollToReference,
    }}>
      {children}
    </ReferencesContext.Provider>
  );
}

export function useReferences() {
  const context = useContext(ReferencesContext);
  if (context === undefined) {
    throw new Error('useReferences must be used within a ReferencesProvider');
  }
  return context;
}