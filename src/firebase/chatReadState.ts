import type { ChatConversation, ChatMessage } from "./chat";

export function hasUnreadReply(chat: ChatConversation | null | undefined) {
  const latest = chat?.lastAdminMessageAt;
  const read = chat?.memberReadAt;
  return !!latest && (!read || latest.seconds > read.seconds ||
    (latest.seconds === read.seconds && latest.nanoseconds > read.nanoseconds));
}

// Only acknowledge a committed reply that is actually in the loaded thread.
export function latestReadReply(messages: ChatMessage[]) {
  return messages.reduce<ChatMessage | undefined>((latest, message) => {
    if (message.senderRole !== "admin" || message.pending || !message.createdAt) return latest;
    if (!latest?.createdAt || message.createdAt.seconds > latest.createdAt.seconds ||
      (message.createdAt.seconds === latest.createdAt.seconds &&
        message.createdAt.nanoseconds > latest.createdAt.nanoseconds)) return message;
    return latest;
  }, undefined);
}
