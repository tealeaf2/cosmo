"use client";

import * as React from "react";
import { useState } from "react";
import { FileCode, ZoomIn, ZoomOut, Maximize2, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,  
  DialogTitle,
} from "@/components/ui/dialog";
import { Material } from "@/lib/materials-context";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePreviewModalProps {
  code: Material | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodePreviewModal({ code, isOpen, onOpenChange }: CodePreviewModalProps) {
  const [zoom, setZoom] = useState(0.875);
  const [isMaximized, setIsMaximized] = useState(false);
  const [codeContent, setCodeContent] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setZoom(0.875);
      setIsMaximized(false);
      setIsCopied(false);
    }
  }, [isOpen, code]);

  React.useEffect(() => {
    if (code?.file) {
      try {
        const base64Data = code.file.split(',')[1];
        const decodedContent = atob(base64Data);
        setCodeContent(decodedContent);
      } catch (error) {
        setCodeContent("Error loading file content");
      }
    }
  }, [code]);

  const handleCopyCode = async () => {
    if (codeContent) {
      try {
        await navigator.clipboard.writeText(codeContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'jsx', 'ts': 'typescript', 'tsx': 'tsx',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'php': 'php', 'html': 'html',
      'css': 'css', 'scss': 'scss', 'json': 'json', 'xml': 'xml',
      'md': 'markdown', 'txt': 'text'
    };
    return langMap[extension || ''] || 'text';
  };

  if (!code || code.type !== "code" || !code.file) {
    return null;
  }

  const language = getLanguageFromFileName(code.name);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`p-0 flex flex-col overflow-hidden transition-all duration-300 ${
          isMaximized 
            ? "max-w-[98vw] w-[98vw] h-[98vh]" 
            : "max-w-5xl w-[85vw] h-[75vh] resize" 
        } border-0 shadow-2xl`}
        style={{
          resize: isMaximized ? 'none' : 'both',
          minWidth: '600px',
          minHeight: '400px'
        }}
      >
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0 bg-background z-10">
          <DialogDescription className="sr-only">
            Code file preview with syntax highlighting and zoom controls
          </DialogDescription>
          
          <div className="flex items-center justify-between">
            {/* Left Side: File Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 bg-muted rounded-md">
                <FileCode className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start">
                <DialogTitle className="text-sm font-semibold truncate max-w-[300px]">
                  {code.name}
                </DialogTitle>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                  {language}
                </span>
              </div>
            </div>
            
            {/* Right Side: Toolbar */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setZoom(Math.max(0.5, zoom * 0.9))}
                disabled={zoom <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <span className="text-xs font-mono text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setZoom(Math.min(2, zoom * 1.1))}
                disabled={zoom >= 2}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              <div className="w-px h-5 bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopyCode}
                title="Copy Code"
              >
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? "Restore Size" : "Maximize"}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              <div className="w-px h-5 bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onOpenChange(false)}
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        {/* Code Editor Body */}
        <div className="flex-1 overflow-auto bg-[#1E1E1E]">
          <SyntaxHighlighter
            language={language === 'text' ? 'javascript' : language}
            style={vscDarkPlus}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: `${zoom}rem`,
              minHeight: '100%',
              backgroundColor: 'transparent',
              lineHeight: '1.5',
            }}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      </DialogContent>
    </Dialog>
  );
}