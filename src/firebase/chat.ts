import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  addDoc,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "./firebaseConfig";

export type ChatSenderRole = "member" | "admin";

export type ChatConversation = {
  id: string;
  memberId: string;
  memberEmail: string;
  memberName: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderRole: ChatSenderRole;
  text: string;
  createdAt?: Timestamp | null;
};

function cleanText(value: string) {
  return value.trim();
}

function memberName(user: User) {
  const name = cleanText(user.displayName || "");

  if (name) {
    return name.slice(0, 150);
  }

  const emailName = cleanText(
    user.email?.split("@")[0] || ""
  );

  if (emailName) {
    return emailName.slice(0, 150);
  }

  return "ASBESOC Member";
}

function requireVerifiedUser(user: User | null) {
  if (!user) {
    throw new Error(
      "You must be signed in to use member chat."
    );
  }

  if (!user.emailVerified) {
    throw new Error(
      "Please verify your email before using member chat."
    );
  }

  if (!user.email) {
    throw new Error(
      "Your account does not have an email address."
    );
  }

  return user;
}

/* -------------------------------------------------------------------------- */
/*                         ENSURE MEMBER CONVERSATION                          */
/* -------------------------------------------------------------------------- */

export async function ensureMemberChat(
  currentUser: User | null
) {
  const user = requireVerifiedUser(currentUser);

  const chatRef = doc(
    db,
    "memberChats",
    user.uid
  );

  const existing = await getDoc(chatRef);

  if (existing.exists()) {
    return chatRef;
  }

  await setDoc(chatRef, {
    memberId: user.uid,
    memberEmail: user.email,
    memberName: memberName(user),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return chatRef;
}

/* -------------------------------------------------------------------------- */
/*                              SEND MEMBER MESSAGE                            */
/* -------------------------------------------------------------------------- */

export async function sendMemberMessage(
  currentUser: User | null,
  message: string
) {
  const user = requireVerifiedUser(currentUser);

  const text = cleanText(message);

  if (!text) {
    throw new Error(
      "Enter a message before sending."
    );
  }

  if (text.length > 4000) {
    throw new Error(
      "Your message is too long. Please keep it under 4,000 characters."
    );
  }

  await ensureMemberChat(user);

  const messagesRef = collection(
    db,
    "memberChats",
    user.uid,
    "messages"
  );

  await addDoc(messagesRef, {
    senderId: user.uid,
    senderRole: "member",
    text,
    createdAt: serverTimestamp(),
  });
}

/* -------------------------------------------------------------------------- */
/*                         LISTEN TO MEMBER MESSAGES                           */
/* -------------------------------------------------------------------------- */

export function watchMemberMessages(
  currentUser: User | null,
  onMessages: (messages: ChatMessage[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const user = requireVerifiedUser(currentUser);

  const messagesRef = collection(
    db,
    "memberChats",
    user.uid,
    "messages"
  );

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    messagesQuery,

    (snapshot) => {
      const messages: ChatMessage[] =
        snapshot.docs.map((messageDoc) => {
          const data = messageDoc.data();

          return {
            id: messageDoc.id,

            senderId:
              typeof data.senderId === "string"
                ? data.senderId
                : "",

            senderRole:
              data.senderRole === "admin"
                ? "admin"
                : "member",

            text:
              typeof data.text === "string"
                ? data.text
                : "",

            createdAt:
              data.createdAt ?? null,
          };
        });

      onMessages(messages);
    },

    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                         LISTEN TO CHAT INFORMATION                          */
/* -------------------------------------------------------------------------- */

export function watchMemberChat(
  currentUser: User | null,
  onChat: (
    chat: ChatConversation | null
  ) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const user = requireVerifiedUser(currentUser);

  const chatRef = doc(
    db,
    "memberChats",
    user.uid
  );

  return onSnapshot(
    chatRef,

    (snapshot) => {
      if (!snapshot.exists()) {
        onChat(null);
        return;
      }

      const data = snapshot.data();

      onChat({
        id: snapshot.id,

        memberId:
          typeof data.memberId === "string"
            ? data.memberId
            : "",

        memberEmail:
          typeof data.memberEmail === "string"
            ? data.memberEmail
            : "",

        memberName:
          typeof data.memberName === "string"
            ? data.memberName
            : "ASBESOC Member",

        createdAt:
          data.createdAt ?? null,

        updatedAt:
          data.updatedAt ?? null,
      });
    },

    (error) => {
      if (onError) {
        onError(error);
      }
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                              CHAT ERROR TEXT                                */
/* -------------------------------------------------------------------------- */

export function chatError(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("permission") ||
      message.includes("permission-denied")
    ) {
      return "You do not have permission to access this conversation.";
    }

    if (
      message.includes("network") ||
      message.includes("unavailable")
    ) {
      return "The chat service is temporarily unavailable. Check your internet connection and try again.";
    }

    return error.message;
  }

  return "Something went wrong with the chat. Please try again.";
}