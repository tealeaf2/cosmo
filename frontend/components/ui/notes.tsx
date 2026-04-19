"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotebookPen } from 'lucide-react';
import { useNotes } from "@/lib/notes-context";

export type NoteToggleProps = {
    on?: boolean;
  defaultOn?: boolean;
  onChange?: (next: boolean) => void;
  tooltipOn?: string;
  tooltipOff?: string;
  className?: string;
  disabled?: boolean;
};

export const NotesToggle: React.FC<NoteToggleProps> = ({
  on: controlledOn,
  defaultOn = false,
  onChange,
  tooltipOn = "Close Notes",
  tooltipOff = "Open Notes",
  className,
  disabled,
}) => {
  const [internalOn, setInternalOn] = React.useState<boolean>(defaultOn);
  const isControlled = controlledOn !== undefined;
  const onState = isControlled ? controlledOn : internalOn;


  React.useEffect(() => {
    if (!isControlled) {
      setInternalOn(defaultOn);
    }
  }, [defaultOn, isControlled]);

  const toggle = React.useCallback(() => {
    if (disabled) return;
    const next = !onState;
    if (!isControlled) setInternalOn(next);
    onChange?.(next);
  }, [onState, isControlled, onChange, disabled]);

  return (
    <Button
      variant={onState ? "default" : "outline"} // Switches variant when active
      onClick={toggle}
      disabled={disabled}
      title={onState ? tooltipOn : tooltipOff}
      className={cn(
        "gap-2 transition-colors",
        onState ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300" : "", 
        className
      )}
    >
      <NotebookPen 
        className={cn(
          "size-4 transition-all", 
          onState ? "text-orange-500" : "text-muted-foreground"
        )} 
      />
      <span>Notepad</span>
    </Button>
  );
};



export const NotesToggleWithPopup: React.FC<NoteToggleProps> = (props) => {
  const { notes, setNotes, isNotesOpen, setIsNotesOpen } = useNotes();

  const handleToggle = () => {
    const newState = !isNotesOpen;
    setIsNotesOpen(newState);
    props.onChange?.(newState);
  };

  return (
    <div>
      <NotesToggle {...props} on={isNotesOpen} onChange={handleToggle} />
      <aside 
  className={cn(
    "fixed right-0 top-16 bottom-0 w-80 border-l bg-white p-4 transition-transform duration-300 ease-in-out shadow-xl",
    "z-[100]",
    isNotesOpen ? "translate-x-0" : "translate-x-full"
  )}
>
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-black-400 flex items-center gap-2">
      <NotebookPen className="size-4" /> My Notes
    </h2>
  </div>
  
  <textarea
    className={cn(
      "w-full h-[calc(100%-60px)] p-3 border rounded-md outline-none resize-none text-sm",
      "bg-white text-slate-900 border-slate-200", // Force visible colors
      "focus:ring-2 focus:ring-gray-200 focus:border-gray-200",
      "relative z-[101]"
    )}
    placeholder="Type in your thoughts..."
    value={notes}
    onChange={(e) => {
      setNotes(e.target.value);
    }}
    autoFocus={isNotesOpen}
  />
</aside>
    </div>
  );
}