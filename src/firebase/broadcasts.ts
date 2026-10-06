import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import {
  parseAttachment,
  requireMediaAdmin,
  saveWithMedia,
  type MediaAttachment,
} from "./media";
export type BroadcastPriority = "normal" | "important" | "urgent";
export type BroadcastAudience = "all_members" | "approved_members";
export type BroadcastInput = {
  title: string;
  body: string;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  published: boolean;
  expiresAt: Timestamp | null;
  poster?: MediaAttachment | null;
};
export type Broadcast = BroadcastInput & {
  id: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  publishedAt: Timestamp | null;
};
export function activeBroadcast(value: Broadcast, now = Date.now()) {
  return (
    value.published && (!value.expiresAt || value.expiresAt.toMillis() > now)
  );
}
export function watchBroadcasts(
  includeUnpublished: boolean,
  activeOnly: boolean,
  onValue: (items: Broadcast[]) => void,
  onError?: (error: Error) => void,
  approvedMember = false,
): Unsubscribe {
  const source = query(
    collection(db, "broadcasts"),
    ...(includeUnpublished
      ? [orderBy("createdAt", "desc")]
      : [
          where("published", "==", true),
          where(
            "audience",
            "in",
            approvedMember
              ? ["all_members", "approved_members"]
              : ["all_members"],
          ),
        ]),
  );
  return onSnapshot(
    source,
    (snapshot) => {
      let values = snapshot.docs.map((item) => {
        const d = item.data();
        return {
          id: item.id,
          title: String(d.title || ""),
          body: String(d.body || ""),
          priority: ["important", "urgent"].includes(d.priority)
            ? (d.priority as BroadcastPriority)
            : "normal",
          audience:
            d.audience === "approved_members"
              ? ("approved_members" as const)
              : ("all_members" as const),
          published: d.published === true,
          expiresAt: d.expiresAt instanceof Timestamp ? d.expiresAt : null,
          createdAt: d.createdAt instanceof Timestamp ? d.createdAt : null,
          updatedAt: d.updatedAt instanceof Timestamp ? d.updatedAt : null,
          publishedAt:
            d.publishedAt instanceof Timestamp ? d.publishedAt : null,
          poster: parseAttachment(d.poster),
        };
      });
      if (!includeUnpublished) values = values.filter((item) => item.published);
      if (activeOnly) values = values.filter((item) => activeBroadcast(item));
      onValue(
        values.sort(
          (a, b) =>
            (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
        ),
      );
    },
    onError,
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
      adminId: auth.currentUser!.uid,
      createdAt: serverTimestamp(),
    });
  } catch {
    /* Broadcast documents themselves remain an activity source if audit logging fails. */
  }
}
export async function saveBroadcast(
  input: BroadcastInput,
  existing?: Broadcast,
) {
  requireMediaAdmin();
  const title = input.title.trim().slice(0, 180),
    body = input.body.trim().slice(0, 6000);
  if (!title || !body) throw new Error("Add a title and message.");
  if (
    !["normal", "important", "urgent"].includes(input.priority) ||
    !["all_members", "approved_members"].includes(input.audience)
  )
    throw new Error("Invalid broadcast audience or priority.");
  if (
    input.published &&
    input.expiresAt &&
    input.expiresAt.toMillis() <= Date.now()
  )
    throw new Error("Choose a future expiry before publishing.");
  const poster = input.poster || null;
  if (poster && poster.kind !== "image")
    throw new Error("Choose an image for the poster.");
  const target = existing
    ? doc(db, "broadcasts", existing.id)
    : doc(collection(db, "broadcasts"));
  await saveWithMedia(
    target,
    {
      title,
      body,
      priority: input.priority,
      audience: input.audience,
      published: input.published,
      expiresAt: input.expiresAt || null,
      poster,
      publishedAt:
        input.published && !existing?.published
          ? serverTimestamp()
          : existing?.publishedAt || null,
      ...(!existing ? { createdAt: serverTimestamp() } : {}),
    },
    poster ? [poster] : [],
    input.audience === "approved_members" ? "approved_members" : "members",
  );
  await recordActivity(
    input.published
      ? "Broadcast published"
      : existing?.published
        ? "Broadcast unpublished"
        : existing
          ? "Broadcast updated"
          : "Broadcast created",
    title,
    target.id,
  );
  return target.id;
}
export async function deleteBroadcast(item: Broadcast) {
  requireMediaAdmin();
  await saveWithMedia(doc(db, "broadcasts", item.id), null, [], "members");
  await recordActivity("Broadcast deleted", item.title, item.id);
}
