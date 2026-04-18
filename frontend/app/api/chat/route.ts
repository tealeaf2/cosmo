import { google } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  JSONSchema7,
  streamText,
  convertToModelMessages,  
  type UIMessage,
} from "ai";

import { system_prompt } from "./prompt";

interface Material {
  id: string;
  type: "pdf" | "website" | "video";
  name: string;
  url?: string;
  file?: File;
  enabled: boolean;
}

export async function POST(req: Request) {
  const {
    messages,
    tools,
    materials,
  }: {
    messages: UIMessage[];
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
    materials?: Material[];
  } = await req.json();

  const coreMessages = await convertToModelMessages(messages);
  const activeMaterials = materials?.filter((m) => m.enabled) || [];

  const contentArray = activeMaterials.map((material) => {
    if (material.type === "pdf") {
      return {
        type: "file",
        data: material.file,
        mediaType: 'application/pdf',
      }
    } else if (material.type === "video") {
      return {
        type: "file",
        data: material.url,
        mediaType: 'video/mp4',
      }
    }
    else if (material.type === "website") {
      return {
        type: "text",
        text: "URL: " + material.url,
      }
    }
  });

  coreMessages.push({
    role: "user",
    content: contentArray,
  })

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    messages: coreMessages,
    system: system_prompt,
    tools: {
      ...frontendTools(tools ?? {}),
      google_search: google.tools.googleSearch({}),
    },
    providerOptions: {
      google: {
        reasoningEffort: "low",
        reasoningSummary: "auto",
      },
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
