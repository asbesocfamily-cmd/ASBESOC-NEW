
const MAX_MESSAGE_LENGTH = 4000;

const TOPICS = [
  {
    keywords: ["hello", "hi", "good morning", "good evening"],
    answer:
      "Hello! I'm the ASBESOC virtual assistant. I can help with membership, certificates, training and general information. How can I assist you?",
  },
  {
    keywords: ["what is asbesoc", "about asbesoc", "organization"],
    answer:
      "ASBESOC means Association for a Better Society. The organization focuses on peace building, human rights, empowerment and community development.",
  },
  {
    keywords: ["join", "membership application", "become a member"],
    answer:
      "To apply for ASBESOC membership, create an account, verify your email and complete the membership application. Your application must be reviewed before approval.",
  },
  {
    keywords: ["certificate", "membership payment", "pay membership"],
    answer:
      "After membership approval, eligible applicants can obtain their membership certificate through the official payment process when it becomes available. Never send payments to unofficial accounts.",
  },
  {
    keywords: ["training", "courses", "workshop"],
    answer:
      "Training opportunities are announced through the member dashboard. Access depends on eligibility and active membership certification.",
  },
  {
    keywords: ["application status", "pending", "approved", "rejected"],
    answer:
      "You can check your application status from your member dashboard. For a specific decision or review issue, please contact an ASBESOC administrator.",
  },
  {
    keywords: ["support", "human agent", "administrator", "admin"],
    answer:
      "You are already in ASBESOC Member Chat. An administrator can take over this conversation when available.",
  },
];

export function generateChatReply(message) {
  if (typeof message !== "string") {
    throw new TypeError("Message must be text.");
  }

  const question = message.trim();

  if (
    question.length === 0 ||
    question.length > MAX_MESSAGE_LENGTH
  ) {
    throw new RangeError(
      "Message must contain between 1 and 4,000 characters."
    );
  }

  const normalized = question.toLowerCase();

  const topic = TOPICS.find(({ keywords }) =>
    keywords.some((keyword) =>
      normalized.includes(keyword)
    )
  );

  return {
    senderId: "asbesoc-ai",
    senderRole: "system",
    text: topic
      ? `ASBESOC Virtual Assistant:\n\n${topic.answer}`
      : "ASBESOC Virtual Assistant:\n\nI don't have a verified answer to that question yet. An ASBESOC administrator can assist you when available.",
  };
}

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const memberChatAutoReply = onDocumentCreated(
  {
    document: "memberChats/{uid}/messages/{messageId}",
    region: "europe-west1",
    retry: false,
  },
  async (event) => {
    const message = event.data?.data();

    // Only respond to member messages.
    if (!message || message.senderRole !== "member") return;

    const { uid, messageId } = event.params;
    const db = getFirestore();

    const chatRef = db.doc(`memberChats/${uid}`);
    const replyRef = chatRef.collection("messages").doc(`ai-${messageId}`);

    const reply = generateChatReply(message.text);

    await db.runTransaction(async (transaction) => {
      const chatSnapshot = await transaction.get(chatRef);
      const replySnapshot = await transaction.get(replyRef);

      if (!chatSnapshot.exists || replySnapshot.exists) return;

      const chat = chatSnapshot.data();

      // Stop responding while an admin is handling the chat.
      if (chat.status !== "waiting") return;

      // Skip older messages if a newer member message exists.
      const latestMessage = chat.lastMemberMessageAt;

      if (
        latestMessage &&
        message.createdAt &&
        !latestMessage.isEqual(message.createdAt)
      ) {
        return;
      }

      transaction.create(replyRef, {
        senderId: reply.senderId,
        senderRole: reply.senderRole,
        text: reply.text,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  }
);
