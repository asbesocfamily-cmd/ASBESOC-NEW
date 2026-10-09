import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  runTransaction,
  updateDoc,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebaseConfig";
import { ADMIN_UID } from "./membership";

export type ChatSenderRole = "member" | "admin" | "system";
export type ChatStatus = "waiting" | "active" | "resolved";

export type ChatConversation = {
  id: string;
  memberId: string;
  memberEmail: string;
  memberName: string;
  status: ChatStatus;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  lastMemberMessageAt?: Timestamp | null;
  lastAdminMessageAt?: Timestamp | null;
  adminReadAt?: Timestamp | null;
  memberReadAt?: Timestamp | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderRole: ChatSenderRole;
  text: string;
  createdAt?: Timestamp | null;
  pending?: boolean;
};

export function compareChatMessages(
  a: { createdAt?: Timestamp | null; senderRole: ChatSenderRole },
  b: { createdAt?: Timestamp | null; senderRole: ChatSenderRole },
) {
  return (
    (a.createdAt?.toMillis() || Number.MAX_SAFE_INTEGER) -
      (b.createdAt?.toMillis() || Number.MAX_SAFE_INTEGER) ||
    Number(a.senderRole === "system") - Number(b.senderRole === "system")
  );
}

export const SUPPORT_ACK =
  "Thank you for contacting ASBESOC. Your message has been received. An agent will be with you as soon as one is available.";

function verified(user: User | null) {
  if (!user?.emailVerified || !user.email) {
    throw new Error("Please sign in and verify your email to use member chat.");
  }

  return user;
}

function messageText(message: string) {
  if (typeof navigator !== "undefined" && navigator.onLine === false)
    throw new Error(
      "You are offline. Your message has not been sent; reconnect and try again.",
    );
  const text = message.trim();

  if (!text || text.length > 4000) {
    throw new Error("Enter a message between 1 and 4,000 characters.");
  }

  return text;
}

export async function ensureMemberChat(currentUser: User | null) {
  const user = verified(currentUser);
  const target = doc(db, "memberChats", user.uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (!snapshot.exists())
      transaction.set(target, {
        memberId: user.uid,
        memberEmail: user.email,
        memberName: (
          user.displayName ||
          user.email!.split("@")[0] ||
          "ASBESOC Member"
        ).slice(0, 150),
        status: "waiting",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
  });

  return target;
}

export async function sendMemberMessage(
  currentUser: User | null,
  message: string,
) {
  const user = verified(currentUser);
  const text = messageText(message);

  const target = await ensureMemberChat(user);
  // Read status and first-message acknowledgement in the same transaction as
  // the message. Firestore retries when another tab or an admin changes it.
  const messageRef = doc(collection(target, "messages"));
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(target);
    const data = snapshot.data();
    if (!data) throw new Error("Conversation unavailable.");
    const acknowledgement =
      data.status === "waiting" &&
      !data.lastMemberMessageAt &&
      !data.acknowledgedAt;
    transaction.set(messageRef, {
      senderId: user.uid,
      senderRole: "member",
      text,
      createdAt: serverTimestamp(),
    });
    transaction.update(target, {
      updatedAt: serverTimestamp(),
      lastMemberMessageAt: serverTimestamp(),
      status: data.status === "resolved" ? "waiting" : data.status || "active",
      ...(acknowledgement ? { acknowledgedAt: serverTimestamp() } : {}),
    });
    if (acknowledgement)
      transaction.set(doc(target, "messages", "support-ack"), {
        senderId: "system",
        senderRole: "system",
        text: SUPPORT_ACK,
        createdAt: serverTimestamp(),
      });
  });
}

export async function sendAdminMessage(
  user: User,
  uid: string,
  message: string,
) {
  verified(user);

  if (user.uid !== ADMIN_UID) {
    throw new Error("Administrator access required.");
  }

  const text = messageText(message);
  const target = doc(db, "memberChats", uid);
  const messageRef = doc(collection(target, "messages"));
  await runTransaction(db, async (transaction) => {
    if (!(await transaction.get(target)).exists())
      throw new Error("Conversation unavailable.");
    transaction.set(messageRef, {
      senderId: user.uid,
      senderRole: "admin",
      text,
      createdAt: serverTimestamp(),
    });
    transaction.update(target, {
      status: "active",
      updatedAt: serverTimestamp(),
      lastAdminMessageAt: serverTimestamp(),
      adminReadAt: serverTimestamp(),
    });
  });
}

export async function setChatStatus(
  user: User,
  uid: string,
  status: ChatStatus,
) {
  verified(user);

  if (user.uid !== ADMIN_UID) {
    throw new Error("Administrator access required.");
  }

  await updateDoc(doc(db, "memberChats", uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function markChatRead(user: User, uid: string) {
  verified(user);

  if (user.uid !== ADMIN_UID && user.uid !== uid) {
    throw new Error("This conversation belongs to another member.");
  }

  await updateDoc(doc(db, "memberChats", uid), {
    [user.uid === ADMIN_UID ? "adminReadAt" : "memberReadAt"]:
      serverTimestamp(),
  });
}

export function chatStatus(value: unknown): ChatStatus {
  return value === "waiting" || value === "resolved" ? value : "active";
}

export function watchMemberMessages(
  currentUser: User | null,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const user = verified(currentUser);

  return onSnapshot(
    query(
      collection(db, "memberChats", user.uid, "messages"),
      orderBy("createdAt", "asc"),
    ),
    { includeMetadataChanges: true },
    (snapshot) =>
      onMessages(
        snapshot.docs
          .map((item) => {
            const d = item.data({ serverTimestamps: "estimate" });

            return {
              id: item.id,
              pending: item.metadata.hasPendingWrites,
              senderId: String(d.senderId || ""),
              senderRole:
                d.senderRole === "admin"
                  ? "admin"
                  : d.senderRole === "system"
                    ? "system"
                    : "member",
              text: String(d.text || ""),
              createdAt: d.createdAt || null,
            } as ChatMessage;
          })
          .sort(compareChatMessages),
      ),
    onError,
  );
}

export function watchMemberChat(
  currentUser: User | null,
  onChat: (chat: ChatConversation | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const user = verified(currentUser);

  return onSnapshot(
    doc(db, "memberChats", user.uid),
    (snapshot) =>
      onChat(
        snapshot.exists()
          ? ({
              ...snapshot.data({ serverTimestamps: "estimate" }),
              id: snapshot.id,
              status: chatStatus(snapshot.data().status),
            } as ChatConversation)
          : null,
      ),
    onError,
  );
}

export function chatError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("permission")) {
      return "This conversation could not be accessed. Check your sign-in or ask the administrator to check chat permissions.";
    }

    if (
      message.includes("stored version") ||
      message.includes("base version") ||
      message.includes("aborted")
    ) {
      return "The conversation changed while your message was being sent. Please send the message again.";
    }

    return error.message;
  }

  return "The chat action failed. Please try again.";
}
// Missing timestamps on older records are not evidence of an outstanding write.
export function chatMessageTime(message: ChatMessage) {
  if (message.pending) return "Sending…";
  return (
    message.createdAt
      ?.toDate()
      .toLocaleString("en-NG", { dateStyle: "short", timeStyle: "short" }) ||
    "Sent"
  );
}
