import { convertToModelMessages, CoreMessage, UIMessage } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";

export default async function Page({ params }: { params: any }) {
  const { id } = await params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chatFromDb.userId) {
    return notFound();
  }

  return (
    <Chat
      id={chatFromDb.id}
      initialMessages={chatFromDb.messages as UIMessage[]}
    />
  );
}
