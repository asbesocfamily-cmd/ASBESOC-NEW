import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";
import { ADMIN_UID } from "./membership";

export type BroadcastPriority = "normal" | "important" | "urgent";
export type BroadcastAudience = "all_members" | "approved_members";

export type Broadcast = {
  id: string;
  title: string;
  body: string;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  published: boolean;
  expiresAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  publishedAt: Timestamp | null;
};

export type BroadcastInput = {
  title: string;
  body: string;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  published: boolean;
  expiresAt: Timestamp | null;
};

function clean(value: string, maximum: number) {
  return value.trim().slice(0, maximum);
}

function validate(input: BroadcastInput) {
  const title = clean(input.title, 180);
  const body = clean(input.body, 6000);

  if (!title) {
    throw new Error("Broadcast title is required.");
  }

  if (!body) {
    throw new Error("Broadcast message is required.");
  }

  if (!["normal", "important", "urgent"].includes(input.priority)) {
    throw new Error("Invalid broadcast priority.");
  }

  if (!["all_members", "approved_members"].includes(input.audience)) {
    throw new Error("Invalid broadcast audience.");
  }

  return {
    title,
    body,
    priority: input.priority,
    audience: input.audience,
    published: input.published,
    expiresAt: input.expiresAt ?? null,
  };
}

export function activeBroadcast(value: Broadcast) {
  if (!value.published) {
    return false;
  }

  if (!value.expiresAt) {
    return true;
  }

  return value.expiresAt.toMillis() > Date.now();
}

export function watchBroadcasts(
  includeUnpublished: boolean,
  activeOnly: boolean,
  onValue: (broadcasts: Broadcast[]) => void,
  onError?: (error: Error) => void,
  approvedMember = false,
): Unsubscribe {
  const broadcastsQuery = query(
    collection(db, "broadcasts"),
    ...(includeUnpublished ? [orderBy("createdAt", "desc")] : [where("published", "==", true), where("audience", "in", approvedMember ? ["all_members", "approved_members"] : ["all_members"])]),
  );

  return onSnapshot(
    broadcastsQuery,
    (snapshot) => {
      let values = snapshot.docs.map((item) => {
        const data = item.data();

        return {
          id: item.id,
          title: String(data.title ?? ""),
          body: String(data.body ?? ""),
          priority:
            data.priority === "important" || data.priority === "urgent"
              ? data.priority
              : "normal",
          audience:
            data.audience === "approved_members"
              ? "approved_members"
              : "all_members",
          published: data.published === true,
          expiresAt:
            data.expiresAt instanceof Timestamp ? data.expiresAt : null,
          createdAt:
            data.createdAt instanceof Timestamp ? data.createdAt : null,
          updatedAt:
            data.updatedAt instanceof Timestamp ? data.updatedAt : null,
          publishedAt:
            data.publishedAt instanceof Timestamp ? data.publishedAt : null,
        } satisfies Broadcast;
      });

      if (!includeUnpublished) {
        values = values.filter((item) => item.published);
      }

      if (activeOnly) {
        values = values.filter(activeBroadcast);
      }

      values.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      onValue(values);
    },
    (error) => {
      onError?.(error);
    },
  );
}

async function recordActivity(
  action: string,
  title: string,
  broadcastId: string,
) {
  try {
    await addDoc(collection(db, "adminActivity"), {
      action,
      title,
      broadcastId,
      adminId: auth.currentUser?.uid ?? null,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Activity logging must never prevent the main broadcast action.
  }
}

export async function saveBroadcast(
  input: BroadcastInput,
  existing?: Broadcast,
) {
  requireAdmin();
  const value = validate(input);
  if (value.published && value.expiresAt && value.expiresAt.toMillis() <= Date.now()) {
    throw new Error("Choose a future expiry before publishing this broadcast.");
  }

  if (existing) {
    await setDoc(
      doc(db, "broadcasts", existing.id),
      {
        ...value,
        updatedAt: serverTimestamp(),
        publishedAt:
          value.published && !existing.published
            ? serverTimestamp()
            : existing.publishedAt ?? null,
      },
      { merge: true },
    );

    await recordActivity(
      value.published
        ? existing.published
          ? "Broadcast updated"
          : "Broadcast published"
        : existing.published
          ? "Broadcast unpublished"
          : "Broadcast updated",
      value.title,
      existing.id,
    );

    return existing.id;
  }

  const reference = doc(collection(db, "broadcasts"));

  await setDoc(reference, {
    ...value,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: value.published ? serverTimestamp() : null,
  });

  await recordActivity(
    value.published ? "Broadcast published" : "Broadcast created",
    value.title,
    reference.id,
  );

  return reference.id;
}

export async function deleteBroadcast(broadcast: Broadcast) {
  requireAdmin();
  await deleteDoc(doc(db, "broadcasts", broadcast.id));

  await recordActivity(
    "Broadcast deleted",
    broadcast.title,
    broadcast.id,
  );
}

function requireAdmin() {
  if (auth.currentUser?.uid !== ADMIN_UID || !auth.currentUser.emailVerified) {
    throw new Error("Verified administrator access is required.");
  }
}
