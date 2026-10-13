import { doc, runTransaction, type Firestore, type Timestamp } from "firebase/firestore";
import type { ChatMessage } from "./chat";

export async function saveMemberReadReceipt(db: Firestore, uid: string, message: ChatMessage) {
  if (message.senderRole !== "admin" || message.pending || !message.createdAt) return;
  const target = doc(db, "memberChats", uid);
  const readAt = message.createdAt;
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (!snapshot.exists()) throw new Error("Conversation unavailable.");
    const previous = snapshot.data().memberReadAt as Timestamp | undefined;
    // A delayed tab must never move an already saved read receipt backwards.
    if (previous && (previous.seconds > readAt.seconds ||
      (previous.seconds === readAt.seconds && previous.nanoseconds >= readAt.nanoseconds))) return;
    transaction.update(target, {
      memberReadAt: readAt,
      memberReadMessageId: message.id,
    });
  });
}
