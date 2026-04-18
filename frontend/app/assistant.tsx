"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { Thread } from "@/components/assistant-ui/thread";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import { Separator } from "@/components/ui/separator";
import { MaterialsProvider, useMaterials } from "@/lib/materials-context";
import { HighlightToggle } from "@/components/ui/highlight";
import { useHighlights } from "@/components/assistant-ui/use-highlights";
import { NotesToggle, NotesToggleWithPopup } from "@/components/ui/notes";
import { ReferencesProvider } from "@/lib/references-context";
import { useState } from "react";

function AssistantContent() {
  const { getEnabledMaterials } = useMaterials();
  const highlights = useHighlights();
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState<string>("");
  
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: () => ({
        materials: getEnabledMaterials(),
      }),
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SidebarProvider>
        <div className="flex h-dvh w-full pr-0.5">
          <ThreadListSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="ml-auto flex items-center gap-2">
                <NotesToggleWithPopup on={isNotesOpen}/>
                <HighlightToggle 
                  className="ml-auto"
                  on={highlights.isHighlightMode}
                  onChange={(isOn) => isOn ? highlights.enableHighlightMode() : highlights.disableHighlightMode()}
                  tooltipOn="Exit Deep Dive Mode"
                  tooltipOff="Deep Dive Mode"
                />
              </div>
            </header>
            <div className="flex-1 overflow-hidden">
              <Thread highlights={highlights} />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
}

export const Assistant = () => {
  return (
    <MaterialsProvider>
      <ReferencesProvider>
        <AssistantContent />
      </ReferencesProvider>
    </MaterialsProvider>
  );
};
