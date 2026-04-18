"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

export interface Highlight {
  id: string;
  text: string;
  messageId: string;
  startOffset: number;
  endOffset: number;
  timestamp: number;
}

export interface UseHighlightsReturn {
  isHighlightMode: boolean;
  highlights: Highlight[];
  pendingHighlight: string | null;
  enableHighlightMode: () => void;
  disableHighlightMode: () => void;
  addHighlight: (text: string, messageId: string, startOffset: number, endOffset: number) => void;
  removeHighlight: (id: string) => void;
  clearHighlights: () => void;
  canDeepDive: boolean;
}

export const useHighlights = (): UseHighlightsReturn => {
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [pendingHighlight, setPendingHighlight] = useState<string | null>(null);

  const enableHighlightMode = useCallback(() => {
    setIsHighlightMode(true);
  }, []);

  const disableHighlightMode = useCallback(() => {
    if (highlights.length > 0) {
      const composerInput = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
      if (composerInput) {
        const currentText = composerInput.value;
        const explanatoryText = "These are the topics I want to deep dive into.";
        
        const finalText = currentText.endsWith('\n\n') 
          ? `${currentText}${explanatoryText}` 
          : `${currentText}\n\n${explanatoryText}`;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set;
        
        nativeInputValueSetter?.call(composerInput, finalText);
        composerInput.dispatchEvent(new Event("input", { bubbles: true }));
        
        composerInput.scrollTop = composerInput.scrollHeight;
      }
    }
    
    setIsHighlightMode(false);
    setPendingHighlight(null);
    setHighlights([]);
    
    setTimeout(() => {
      const composerInput = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
      if (composerInput) {
        composerInput.focus();
      }
    }, 100);
  }, [highlights]);

  const addHighlight = useCallback((text: string, messageId: string, startOffset: number, endOffset: number) => {
    const highlight: Highlight = {
      id: `highlight-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      messageId,
      startOffset,
      endOffset,
      timestamp: Date.now(),
    };

    setHighlights(prev => [...prev, highlight]);
    setPendingHighlight(text.trim());

    const composerInput = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
    if (!composerInput) return;

    const currentText = composerInput.value;
    const formattedHighlight = `> "${text.trim()}"\n\n`;
    
    const nextText = currentText.length > 0 && !currentText.endsWith('\n\n')
      ? `${currentText}\n${formattedHighlight}` 
      : `${currentText}${formattedHighlight}`;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    
    nativeInputValueSetter?.call(composerInput, nextText);
    composerInput.dispatchEvent(new Event("input", { bubbles: true }));
    
    composerInput.scrollTop = composerInput.scrollHeight;
    composerInput.focus();
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlights([]);
    setPendingHighlight(null);
  }, []);


  const canDeepDive = highlights.length > 0;

  useEffect(() => {
    if (!isHighlightMode) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const selectedText = range.toString().trim();
      
      if (selectedText.length === 0) return;

      let messageElement: Node | Element | null = range.commonAncestorContainer;
      while (messageElement && messageElement.nodeType !== Node.ELEMENT_NODE) {
        messageElement = messageElement.parentNode;
      }
      
      let currentElement = messageElement as Element | null;
      while (currentElement && !currentElement.hasAttribute('data-message-id')) {
        currentElement = currentElement.parentElement;
      }

      if (currentElement) {
        const messageId = currentElement.getAttribute('data-message-id') || '';
        addHighlight(selectedText, messageId, range.startOffset, range.endOffset);
      }
      
      selection.removeAllRanges();
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [isHighlightMode, addHighlight]);

  return {
    isHighlightMode,
    highlights,
    pendingHighlight,
    enableHighlightMode,
    disableHighlightMode,
    addHighlight,
    removeHighlight,
    clearHighlights,
    canDeepDive,
  };
};