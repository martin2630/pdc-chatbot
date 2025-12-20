export type StoredMessage = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
};
