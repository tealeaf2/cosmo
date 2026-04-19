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
  
  const mimeTypeMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'ts': 'text/typescript',
    'tsx': 'text/typescript',
    'mjs': 'text/javascript',
    'cjs': 'text/javascript',
    
    // Python
    'py': 'text/x-python',
    'pyw': 'text/x-python',
    'pyi': 'text/x-python',
    
    // Java/JVM
    'java': 'text/x-java-source',
    'kt': 'text/x-kotlin',
    'scala': 'text/x-scala',
    'clj': 'text/x-clojure',
    
    // C/C++
    'c': 'text/x-c',
    'cpp': 'text/x-c++src',
    'cc': 'text/x-c++src',
    'cxx': 'text/x-c++src',
    'h': 'text/x-c',
    'hpp': 'text/x-c++hdr',
    'hh': 'text/x-c++hdr',
    'hxx': 'text/x-c++hdr',
    
    // C#
    'cs': 'text/x-csharp',
    
    // Web
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'scss': 'text/x-scss',
    'sass': 'text/x-sass',
    'less': 'text/x-less',
    
    // Data formats
    'json': 'application/json',
    'xml': 'text/xml',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'toml': 'text/x-toml',
    'ini': 'text/plain',
    'cfg': 'text/plain',
    'conf': 'text/plain',
    
    // Shell scripts
    'sh': 'text/x-shellscript',
    'bash': 'text/x-shellscript',
    'zsh': 'text/x-shellscript',
    'fish': 'text/x-shellscript',
    'ps1': 'text/x-powershell',
    
    // Other languages
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'swift': 'text/x-swift',
    'r': 'text/x-r',
    'sql': 'text/x-sql',
    'lua': 'text/x-lua',
    'pl': 'text/x-perl',
    'pm': 'text/x-perl',
    'asm': 'text/x-asm',
    's': 'text/x-asm',
    'f90': 'text/x-fortran',
    'f95': 'text/x-fortran',
    'pas': 'text/x-pascal',
    'vb': 'text/x-vb',
    'hs': 'text/x-haskell',
    'ml': 'text/x-ocaml',
    'elm': 'text/x-elm',
    'dart': 'text/x-dart',
    'jl': 'text/x-julia',
    
    // Markup/Documentation
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'tex': 'text/x-tex',
    'latex': 'text/x-tex',
    
    // Dockerfile and config
    'dockerfile': 'text/x-dockerfile',
    'makefile': 'text/x-makefile',
    'cmake': 'text/x-cmake',
    'gradle': 'text/x-gradle',
  };
  
  return ext ? mimeTypeMap[ext] || null : null;
};

// Helper function to check if a file is a code file
const isCodeFile = (fileName: string): boolean => {
  return getCodeFileMimeType(fileName) !== null;
};

// Export helper functions for use in other parts of the system
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
    // Check file name for code extensions if type isn't already set
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
    
    // Check if it's a code file by extension
    const isCode = isCodeFile(fileName);
    
    switch (type) {
      case "image":
        return "Image";
      case "document":
        return "Document";
      case "code":
        return "Code";
      case "file":
        return isCode ? "Code" : "File";
      default:
        return isCode ? "Code" : type;
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
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <TooltipIconButton
        tooltip="Add Attachment"
        side="bottom"
        variant="ghost"
        size="icon"
        className="aui-composer-add-attachment size-8 rounded-full p-1 font-semibold text-xs hover:bg-muted-foreground/15 dark:border-muted-foreground/15 dark:hover:bg-muted-foreground/30"
        aria-label="Add Attachment"
      >
        <PlusIcon className="aui-attachment-add-icon size-5 stroke-[1.5px]" />
      </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
  );
};

export const ComposerAddNotes: FC = () => {
  const { notes, addNotesToComposer } = useNotes();

  const handleAddNotes = (event: React.MouseEvent) => {
    // Prevent the click from bubbling up and triggering form submission
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
