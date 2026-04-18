import { google } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  JSONSchema7,
  streamText,
  convertToModelMessages,
  type UIMessage,
} from "ai";

import { system_prompt } from "./prompt";

export async function POST(req: Request) {
  const {
    messages,
    system,
    tools,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  } = await req.json();

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    messages: await convertToModelMessages(messages),
    system: system_prompt,
    tools: {
      ...frontendTools(tools ?? {}),
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
