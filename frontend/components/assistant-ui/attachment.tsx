"use client";

import { PropsWithChildren, useEffect, useState, type FC } from "react";
import { XIcon, PlusIcon, FileText, NotepadText, Code } from "lucide-react";
import {
  AttachmentPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAuiState,
  useAui,
} from "@assistant-ui/react";
import { useShallow } from "zustand/shallow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { useNotes } from "@/lib/notes-context";

// Helper function to detect code files and return appropriate MIME type
const getCodeFileMimeType = (fileName: string): string | null => {
  const ext = fileName.toLowerCase().split('.').pop();
  
  // FIXED: Mapped all code files to 'text/plain' to prevent backend rejections 
  // from strict AI SDKs that don't recognize 'text/x-c' or 'text/x-java-source'
  const mimeTypeMap: Record<string, string> = {
    'js': 'text/plain', 'jsx': 'text/plain', 'ts': 'text/plain', 'tsx': 'text/plain',
    'mjs': 'text/plain', 'cjs': 'text/plain', 'py': 'text/plain', 'pyw': 'text/plain',
    'pyi': 'text/plain', 'java': 'text/plain', 'kt': 'text/plain', 'scala': 'text/plain',
    'clj': 'text/plain', 'c': 'text/plain', 'cpp': 'text/plain', 'cc': 'text/plain',
    'cxx': 'text/plain', 'h': 'text/plain', 'hpp': 'text/plain', 'hh': 'text/plain',
    'hxx': 'text/plain', 'cs': 'text/plain', 'html': 'text/html', 'htm': 'text/html',
    'css': 'text/css', 'scss': 'text/plain', 'sass': 'text/plain', 'less': 'text/plain',
    'json': 'application/json', 'xml': 'text/xml', 'yaml': 'text/plain', 'yml': 'text/plain',
    'toml': 'text/plain', 'ini': 'text/plain', 'cfg': 'text/plain', 'conf': 'text/plain',
    'sh': 'text/plain', 'bash': 'text/plain', 'zsh': 'text/plain', 'fish': 'text/plain',
    'ps1': 'text/plain', 'php': 'text/plain', 'rb': 'text/plain', 'go': 'text/plain',
    'rs': 'text/plain', 'swift': 'text/plain', 'r': 'text/plain', 'sql': 'text/plain',
    'lua': 'text/plain', 'pl': 'text/plain', 'pm': 'text/plain', 'asm': 'text/plain',
    's': 'text/plain', 'f90': 'text/plain', 'f95': 'text/plain', 'pas': 'text/plain',
    'vb': 'text/plain', 'hs': 'text/plain', 'ml': 'text/plain', 'elm': 'text/plain',
    'dart': 'text/plain', 'jl': 'text/plain', 'md': 'text/markdown', 'markdown': 'text/markdown',
    'tex': 'text/plain', 'latex': 'text/plain', 'dockerfile': 'text/plain',
    'makefile': 'text/plain', 'cmake': 'text/plain', 'gradle': 'text/plain',
  };
  
  return ext ? mimeTypeMap[ext] || null : null;
};

const isCodeFile = (fileName: string): boolean => {
  return getCodeFileMimeType(fileName) !== null;
};

export { getCodeFileMimeType, isCodeFile };

const useFileSrc = (file: File | undefined) => {
  const [src, setSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!file) {
      setSrc(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return src;
};

const useAttachmentSrc = () => {
  const { file, src } = useAuiState(
    useShallow((s): { file?: File; src?: string } => {
      if (s.attachment.type !== "image") return {};
      if (s.attachment.file) return { file: s.attachment.file };
      const src = s.attachment.content?.filter((c) => c.type === "image")[0]
        ?.image;
      if (!src) return {};
      return { src };
    }),
  );

  return useFileSrc(file) ?? src;
};

type AttachmentPreviewProps = {
  src: string;
};

const AttachmentPreview: FC<AttachmentPreviewProps> = ({ src }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <img
      src={src}
      alt="Image Preview"
      className={cn(
        "block h-auto max-h-[80vh] w-auto max-w-full object-contain",
        isLoaded
          ? "aui-attachment-preview-image-loaded"
          : "aui-attachment-preview-image-loading invisible",
      )}
      onLoad={() => setIsLoaded(true)}
    />
  );
};

const AttachmentPreviewDialog: FC<PropsWithChildren> = ({ children }) => {
  const src = useAttachmentSrc();

  if (!src) return children;

  return (
    <Dialog>
      <DialogTrigger
        className="aui-attachment-preview-trigger cursor-pointer transition-colors hover:bg-accent/50"
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="aui-attachment-preview-dialog-content p-2 sm:max-w-3xl [&>button]:rounded-full [&>button]:bg-foreground/60 [&>button]:p-1 [&>button]:opacity-100 [&>button]:ring-0! [&_svg]:text-background [&>button]:hover:[&_svg]:text-destructive">
        <DialogTitle className="aui-sr-only sr-only">
          Image Attachment Preview
        </DialogTitle>
        <div className="aui-attachment-preview relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden bg-background">
          <AttachmentPreview src={src} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttachmentThumb: FC = () => {
  const src = useAttachmentSrc();
  const isCode = useAuiState((s) => {
    if (s.attachment.type === "code") return true;
    const fileName = s.attachment.name || "";
    return isCodeFile(fileName);
  });

  return (
    <Avatar className="aui-attachment-tile-avatar h-full w-full rounded-none">
      <AvatarImage
        src={src}
        alt="Attachment preview"
        className="aui-attachment-tile-image object-cover"
      />
      <AvatarFallback>
        {isCode ? (
          <Code className="aui-attachment-tile-fallback-icon size-8 text-muted-foreground" />
        ) : (
          <FileText className="aui-attachment-tile-fallback-icon size-8 text-muted-foreground" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

const AttachmentUI: FC = () => {
  const aui = useAui();
  const isComposer = aui.attachment.source !== "message";

  const isImage = useAuiState((s) => s.attachment.type === "image");
  const typeLabel = useAuiState((s) => {
    const type = s.attachment.type;
    const fileName = s.attachment.name || "";
    
    const isCode = isCodeFile(fileName);
    
    switch (type) {
      case "image": return "Image";
      case "document": return "Document";
      case "code": return "Code";
      case "file": return isCode ? "Code" : "File";
      default: return isCode ? "Code" : type;
    }
  });

  return (
    <Tooltip>
      <AttachmentPrimitive.Root
        className={cn(
          "aui-attachment-root relative",
          isImage && "aui-attachment-root-composer only:*:first:size-24",
        )}
      >
        <AttachmentPreviewDialog>
          <TooltipTrigger asChild>
            <div
              className="aui-attachment-tile size-14 cursor-pointer overflow-hidden rounded-[calc(var(--composer-radius)-var(--composer-padding))] border bg-muted transition-opacity hover:opacity-75"
              role="button"
              aria-label={`${typeLabel} attachment`}
            >
              <AttachmentThumb />
            </div>
          </TooltipTrigger>
        </AttachmentPreviewDialog>
        {isComposer && <AttachmentRemove />}
      </AttachmentPrimitive.Root>
      <TooltipContent side="top">
        <AttachmentPrimitive.Name />
      </TooltipContent>
    </Tooltip>
  );
};

const AttachmentRemove: FC = () => {
  return (
    <AttachmentPrimitive.Remove asChild>
      <TooltipIconButton
        tooltip="Remove file"
        className="aui-attachment-tile-remove absolute top-1.5 right-1.5 size-3.5 rounded-full bg-white text-muted-foreground opacity-100 shadow-sm hover:bg-white! [&_svg]:text-black hover:[&_svg]:text-destructive"
        side="top"
      >
        <XIcon className="aui-attachment-remove-icon size-3 dark:stroke-[2.5px]" />
      </TooltipIconButton>
    </AttachmentPrimitive.Remove>
  );
};

export const UserMessageAttachments: FC = () => {
  return (
    <div className="aui-user-message-attachments-end col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2">
      <MessagePrimitive.Attachments>
        {() => <AttachmentUI />}
      </MessagePrimitive.Attachments>
    </div>
  );
};

export const ComposerAttachments: FC = () => {
  return (
    <div className="aui-composer-attachments flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
      <ComposerPrimitive.Attachments>
        {() => <AttachmentUI />}
      </ComposerPrimitive.Attachments>
    </div>
  );
};

export const ComposerAddAttachment: FC = () => {
  // Use useAui() to get access to actions, instead of useAuiState()
  const aui = useAui();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    for (const file of files) {
      let fileToProcess = file;
      
      // If it's a code file, or the browser defaults to binary octet-stream, force it to text/plain
      if (isCodeFile(file.name) || file.type === "application/octet-stream" || !file.type) {
        fileToProcess = new File([file], file.name, { type: "text/plain" });
      }
      
      // Call addAttachment as a method on the composer context
      aui.composer().addAttachment(fileToProcess);
    }
    
    // Reset the input so users can upload the same file again if they deleted it
    e.target.value = '';
  };

  return (
    <>
      <input 
        type="file" 
        id="aui-custom-hidden-file-input" 
        className="hidden" 
        multiple 
        onChange={handleFileChange} 
      />
      <TooltipIconButton
        tooltip="Add Attachment"
        side="bottom"
        variant="ghost"
        size="icon"
        className="aui-composer-add-attachment size-8 rounded-full p-1 font-semibold text-xs hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
        aria-label="Add Attachment"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("aui-custom-hidden-file-input")?.click();
        }}
      >
        <PlusIcon className="aui-attachment-add-icon size-5 stroke-[1.5px]" />
      </TooltipIconButton>
    </>
  );
};

export const ComposerAddNotes: FC = () => {
  const { notes, addNotesToComposer } = useNotes();

  const handleAddNotes = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (notes.trim().length === 0) {
      return;
    }
    addNotesToComposer();
  };

  return (
    <TooltipIconButton
      tooltip={notes.trim().length > 0 ? "Add Notes to Message" : "No notes to add"}
      side="bottom"
      variant="ghost"
      size="icon"
      onClick={handleAddNotes} 
      disabled={notes.trim().length === 0}
      className="aui-composer-add-notes size-8 rounded-full p-1 font-semibold text-xs hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Add Notes to Message"
    >
      <NotepadText className="aui-notes-add-icon size-5 stroke-[1.5px]" />
    </TooltipIconButton>
  );
};