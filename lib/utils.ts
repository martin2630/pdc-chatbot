import { CoreMessage, CoreToolMessage, generateId, UIMessage } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Chat } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>
): Array<UIMessage> {
  return messages.reduce((chatMessages: Array<UIMessage>, message) => {
    // Skip tool messages - they are handled separately in v5
    if (message.role === "tool") {
      return chatMessages;
    }

    const parts: UIMessage["parts"] = [];

    if (typeof message.content === "string") {
      if (message.content.trim()) {
        parts.push({
          type: "text",
          text: message.content,
        });
      }
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          parts.push({
            type: "text",
            text: content.text,
          });
        } else if (content.type === "tool-call") {
          // In v5, tool calls are represented as tool parts with dynamic type
          parts.push({
            type: `tool-${content.toolName}` as any,
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            state: "result",
            input: (content as any).args,
            output: undefined,
          } as any);
        }
      }
    }

    // In v5, tool results are merged into the assistant message parts
    // We need to check if there's a tool message that corresponds to this message
    const toolMessages = messages.filter(
      (m) => m.role === "tool"
    ) as CoreToolMessage[];
    if (toolMessages.length > 0 && message.role === "assistant") {
      // Find tool results that match tool calls in this message
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if ("toolCallId" in part) {
          const toolMessage = toolMessages.find((tm) =>
            Array.isArray(tm.content)
              ? tm.content.some(
                  (tc: any) => tc.toolCallId === (part as any).toolCallId
                )
              : false
          );

          if (toolMessage && Array.isArray(toolMessage.content)) {
            const toolResult = toolMessage.content.find(
              (tc: any) => tc.toolCallId === (part as any).toolCallId
            );

            if (toolResult) {
              // Update the part with the result
              parts[i] = {
                ...(part as any),
                state: "result",
                output: (toolResult as any).result,
              } as any;
            }
          }
        }
      }
    }

    if (parts.length > 0) {
      chatMessages.push({
        id: generateId(),
        role: message.role as "user" | "assistant" | "system",
        parts,
      });
    }

    return chatMessages;
  }, []);
}

export function getTitleFromChat(chat: Chat) {
  // In v5, messages are already UIMessages
  const messages = Array.isArray(chat.messages)
    ? chat.messages
    : convertToUIMessages(chat.messages as Array<CoreMessage>);

  const firstMessage = messages[0];

  if (!firstMessage) {
    return "Untitled";
  }

  // Extract text from parts
  const textPart = firstMessage.parts?.find((part) => part.type === "text");
  if (textPart && "text" in textPart) {
    return textPart.text.slice(0, 100) || "Untitled";
  }

  return "Untitled";
}
