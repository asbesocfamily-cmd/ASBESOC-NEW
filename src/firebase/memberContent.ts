import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type MemberPostType = "announcement" | "training" | "opportunity";

export type MemberPost = {
  id: string;
  type: MemberPostType;
  title: string;
  body: string;
  published: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

export function watchMemberPosts(
  onValue: (posts: MemberPost[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(db, "memberFeed"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    onValue(snapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        type:
          data.type === "training" || data.type === "opportunity"
            ? data.type
            : "announcement",
        title: typeof data.title === "string" ? data.title : "",
        body: typeof data.body === "string" ? data.body : "",
        published: data.published === true,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      };
    }));
  }, (error) => onError?.(error));
}

export async function createMemberPost(input: {
  type: MemberPostType;
  title: string;
  body: string;
  published: boolean;
}) {
  await addDoc(collection(db, "memberFeed"), {
    type: input.type,
    title: clean(input.title, 180),
    body: clean(input.body, 6000),
    published: input.published,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateMemberPost(
  id: string,
  input: Partial<Pick<MemberPost, "type" | "title" | "body" | "published">>,
) {
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.type) patch.type = input.type;
  if (typeof input.title === "string") patch.title = clean(input.title, 180);
  if (typeof input.body === "string") patch.body = clean(input.body, 6000);
  if (typeof input.published === "boolean") patch.published = input.published;
  await updateDoc(doc(db, "memberFeed", id), patch);
}

export async function deleteMemberPost(id: string) {
  await deleteDoc(doc(db, "memberFeed", id));
}
