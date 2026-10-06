import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
  parseAttachment,
  requireMediaAdmin,
  saveWithMedia,
  type MediaAttachment,
} from "./media";
export type MemberPostType = "announcement" | "training" | "opportunity";
export type MemberPostInput = {
  type: MemberPostType;
  title: string;
  body: string;
  published: boolean;
  poster?: MediaAttachment | null;
  eventDate?: string;
  actionUrl?: string;
  actionLabel?: string;
};
export type MemberPost = MemberPostInput & {
  id: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};
export function safeContentUrl(value: string) {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") throw new Error();
    return url.href;
  } catch {
    throw new Error("Use a complete HTTPS link.");
  }
}
export function watchMemberPosts(
  onValue: (items: MemberPost[]) => void,
  onError?: (error: Error) => void,
  publishedOnly = false,
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, "memberFeed"),
      ...(publishedOnly
        ? [where("published", "==", true)]
        : [orderBy("createdAt", "desc")]),
    ),
    (snapshot) =>
      onValue(
        snapshot.docs
          .map((item) => {
            const d = item.data();
            return {
              id: item.id,
              type:
                d.type === "training" || d.type === "opportunity"
                  ? d.type
                  : "announcement",
              title: String(d.title || ""),
              body: String(d.body || ""),
              published: d.published === true,
              poster: parseAttachment(d.poster),
              eventDate: typeof d.eventDate === "string" ? d.eventDate : "",
              actionUrl:
                typeof d.actionUrl === "string" &&
                d.actionUrl.startsWith("https://")
                  ? d.actionUrl
                  : "",
              actionLabel: String(d.actionLabel || ""),
              createdAt: d.createdAt || null,
              updatedAt: d.updatedAt || null,
            } as MemberPost;
          })
          .sort(
            (a, b) =>
              (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0),
          ),
      ),
    onError,
  );
}
function clean(input: MemberPostInput) {
  const title = input.title.trim().slice(0, 180),
    body = input.body.trim().slice(0, 6000);
  if (
    !title ||
    !body ||
    !["announcement", "training", "opportunity"].includes(input.type)
  )
    throw new Error("Add a valid title, message and post type.");
  if (input.poster && input.poster.kind !== "image")
    throw new Error("Select an image poster.");
  if (input.eventDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate))
    throw new Error("Choose a valid date.");
  return {
    type: input.type,
    title,
    body,
    published: input.published,
    poster: input.poster || null,
    eventDate: input.eventDate || "",
    actionUrl: safeContentUrl(input.actionUrl || ""),
    actionLabel: (input.actionLabel || "").trim().slice(0, 80),
  };
}
export async function createMemberPost(input: MemberPostInput) {
  const value = clean(input);
  await saveWithMedia(
    doc(collection(db, "memberFeed")),
    { ...value, createdAt: serverTimestamp() },
    value.poster ? [value.poster] : [],
    "members",
  );
}
export async function updateMemberPost(
  id: string,
  input: Partial<MemberPostInput>,
) {
  requireMediaAdmin();
  const target = doc(db, "memberFeed", id),
    snapshot = await getDoc(target);
  if (!snapshot.exists()) throw new Error("This post no longer exists.");
  const value = clean({ ...snapshot.data(), ...input } as MemberPostInput);
  await saveWithMedia(
    target,
    value,
    value.poster ? [value.poster] : [],
    "members",
  );
}
export async function deleteMemberPost(id: string) {
  await saveWithMedia(doc(db, "memberFeed", id), null, [], "members");
}
