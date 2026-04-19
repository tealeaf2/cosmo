"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface NotesContextType {
  notes: string;
  setNotes: (notes: string) => void;
  addNotesToComposer: () => void;
  isNotesOpen: boolean;
  setIsNotesOpen: (open: boolean) => void;
}

const NotesContext = createContext<NotesContextType | null>(null);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<string>("");
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const addNotesToComposer = useCallback(() => {
    if (notes.trim().length === 0) return;

    const composerInput = document.querySelector('.aui-composer-input') as HTMLTextAreaElement;
    if (!composerInput) return;

    const currentText = composerInput.value;
    const notesSection = `Personal Notes: \n${notes.trim()}\n\n`;
    
    const nextText = currentText.length > 0 && !currentText.endsWith('\n')
      ? `${currentText}\n\n${notesSection}` 
      : `${currentText}${notesSection}`;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    
    nativeInputValueSetter?.call(composerInput, nextText);

    const inputEvent = new InputEvent('input', {
      bubbles: false,
      cancelable: false,
      inputType: 'insertText'
    });
    composerInput.dispatchEvent(inputEvent);
    
    composerInput.scrollTop = composerInput.scrollHeight;
    composerInput.focus();
    composerInput.setSelectionRange(nextText.length, nextText.length);
  }, [notes]);

  const value: NotesContextType = {
    notes,
    setNotes,
    addNotesToComposer,
    isNotesOpen,
    setIsNotesOpen,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};