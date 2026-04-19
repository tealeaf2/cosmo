"use client";

import * as React from "react";
import { useState } from "react";
import { FileText, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,  
  DialogTitle,
} from "@/components/ui/dialog";
import { Material } from "@/lib/materials-context";


interface PDFPreviewModalProps {
  pdf: Material | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PDFPreviewModal({ pdf, isOpen, onOpenChange }: PDFPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setIsMaximized(false);
    }
  }, [isOpen, pdf]);

  if (!pdf || pdf.type !== "pdf" || !pdf.file) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`p-0 flex flex-col overflow-hidden transition-all duration-300 ${
          isMaximized 
            ? "max-w-[98vw] w-[98vw] h-[90vh]" 
            : "max-w-5xl w-[85vw] h-[75vh] resize" 
        }`}
        style={{
          resize: isMaximized ? 'none' : 'both',
          minWidth: '600px',
          minHeight: '400px'
        }}
      >
        <DialogHeader className="px-10 py-4 border-b flex-shrink-0 bg-white z-10">
          <DialogDescription className="sr-only">
            PDF document preview with zoom and resize controls
          </DialogDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <DialogTitle className="text-lg font-medium truncate">{pdf.name}</DialogTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.25, zoom * 0.8))}
                disabled={zoom <= 0.25}
                title="Zoom Out"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground px-2 min-w-16 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom * 1.25))}
                disabled={zoom >= 3}
                title="Zoom In"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restore Size" : "Maximize"}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 w-full bg-gray-50 relative overflow-auto">
          <iframe
            src={pdf.file}
            className="w-full h-full border-0 block absolute top-0 left-0"
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top left',
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`
            }}
            title={`Preview of ${pdf.name}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}