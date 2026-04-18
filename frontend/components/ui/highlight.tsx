"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type HighlightToggleProps = {
  on?: boolean;
  defaultOn?: boolean;
  onChange?: (next: boolean) => void;
  tooltipOn?: string;
  tooltipOff?: string;
  className?: string;
  disabled?: boolean;
};

export const HighlightToggle: React.FC<HighlightToggleProps> = ({
  on: controlledOn,
  defaultOn = false,
  onChange,
  tooltipOn = "",
  tooltipOff = "Deep Dive",
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
      variant={onState ? "default" : "outline"}
      onClick={toggle}
      disabled={disabled}
      title={onState ? tooltipOn : tooltipOff}
      className={cn(
        "gap-2 transition-colors",
        onState ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300" : "", 
        className
      )}
    >
      <Star 
        className={cn(
          "size-4 transition-all", 
          onState ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
        )} 
      />
      <span>Deep Dive</span>
    </Button>
  );
};

export default HighlightToggle;