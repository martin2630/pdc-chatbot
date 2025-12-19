"use client";

import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, UIMessage } from "ai";
import { useState, useCallback } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
}) {
  const { messages, sendMessage, status, stop } = useChat<UIMessage>({
    id,
    onFinish: () => {
      window.history.replaceState({}, "", `/chat/${id}`);
    },
  });

  console.log("messages", messages);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [input, setInput] = useState("");

  // Derive isLoading from status
  const isLoading = status === "streaming";

  const handleSubmit = useCallback(
    (
      event?: { preventDefault?: () => void },
      chatRequestOptions?: ChatRequestOptions
    ) => {
      event?.preventDefault?.();

      sendMessage({
        role: "user",
        text: input,
        ...chatRequestOptions,
        body: { id },
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
            messages?.map((message: UIMessage) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                parts={(message as any).parts || []}
                sendMessage={sendMessage}
              />
            ))}

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
