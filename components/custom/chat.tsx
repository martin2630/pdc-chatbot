"use client";

import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, UIMessage } from "ai";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { BotIcon, LoaderIcon } from "./icons";
import { MultimodalInput } from "./multimodal-input";

interface Props {
  id: string;
  initialMessages: Array<UIMessage>;
}

export function Chat({ id, initialMessages }: Props) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat<UIMessage>({
    id,
    messages: initialMessages,
    onFinish: () => {
      window.history.replaceState({}, "", `/chat/${id}`);
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  // Derive isLoading from status
  // status can be: "submitted" (waiting for response), "streaming" (receiving response), "ready" (idle)
  const isActive = status === "streaming" || status === "submitted";

  // Show loading when streaming, but hide it if the last assistant message has visible content
  const lastMessage = messages[messages.length - 1];

  // Check if last assistant message has visible content (text or tool results with output)
  const hasVisibleContent =
    lastMessage?.role === "assistant" &&
    lastMessage.parts &&
    lastMessage.parts.length > 0 &&
    lastMessage.parts.some((part) => {
      // Check if there's text content with actual text
      if (part.type === "text" && part.text && part.text.trim().length > 0) {
        return true;
      }
      // Check if there's a tool result with valid output
      if (
        (part.type === "tool-getReferenceCode" ||
          part.type === "tool-getPaseDeCaja" ||
          part.type === "tool-pagoEnLinea") &&
        "output" in part &&
        part.output !== undefined &&
        part.output !== null &&
        typeof part.output === "object" &&
        Object.keys(part.output).length > 0
      ) {
        return true;
      }
      return false;
    });

  // Show loading if active (streaming or submitted), unless last assistant message has visible content
  const isLoading = isActive && !hasVisibleContent;

  const handleSubmit = useCallback(
    (
      event?: { preventDefault?: () => void },
      chatRequestOptions?: ChatRequestOptions
    ) => {
      event?.preventDefault?.();

      sendMessage({
        role: "user",
        text: input,
        body: { id },
        ...chatRequestOptions,
      } as any);

      setInput("");
    },
    [input, sendMessage, id]
  );

  const append = useCallback(
    async (message: UIMessage, chatRequestOptions?: ChatRequestOptions) => {
      // sendMessage accepts the message format directly
      await sendMessage({
        ...message,
        ...chatRequestOptions,
      } as any);
      return null;
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages?.length > 0 &&
            messages?.map((message: UIMessage, index: number) => (
              <PreviewMessage
                key={`${message.id}-${message.role}-${index}`}
                chatId={id}
                role={message.role}
                parts={(message as any).parts || []}
                sendMessage={sendMessage}
              />
            ))}

          {isLoading && (
            <motion.div
              className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
                <BotIcon />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span>Sofia IA: </span>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <LoaderIcon size={16} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px) px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
}
