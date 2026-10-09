import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  type DocumentReference,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { deleteObject, getBlob, ref } from "firebase/storage";
import { auth, db, storage } from "./firebaseConfig";
import {
  uploadCloudinary,
  deleteCloudinary,
  cloudinaryBlobUrl,
  mediaServiceUrl,
} from "./cloudinary";
import { ADMIN_UID } from "./membership";

export type MediaScope = "public" | "members" | "approved_members";
export type MediaAttachment = {
  provider?: "firebase" | "cloudinary";
  id: string;
  path: string;
  scope: MediaScope;
  kind: "image" | "video";
  url: string;
  title: string;
  alt: string;
  caption: string;
};
export type MediaDetails = {
  title: string;
  alt: string;
  caption: string;
  description?: string;
  category?: string;
  album?: string;
  published?: boolean;
};
export type MediaRecord = MediaAttachment & {
  description?: string;
  category?: string;
  album?: string;
  published?: boolean;
  fileName: string;
  contentType: string;
  size: number;
  state: "uploading" | "ready" | "deleting" | "failed";
  uses: string[];
  createdAt: Timestamp | null;
};
export function requireMediaAdmin() {
  if (auth.currentUser?.uid !== ADMIN_UID || !auth.currentUser.emailVerified)
    throw new Error("Verified administrator access is required.");
}
export function mediaError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "storage/unauthorized" || code === "permission-denied")
    return "Access denied. Check your account permissions and the media service setup.";
  if (
    code === "storage/bucket-not-found" ||
    code === "storage/project-not-found"
  )
    return "Firebase Storage has not been enabled for this project.";
  if (code === "storage/canceled") return "Upload cancelled.";
  return error instanceof Error
    ? error.message
    : "The media action failed. Please try again.";
}
export function attachmentOf(item: MediaRecord): MediaAttachment {
  return {
    provider: item.provider || "firebase",
    id: item.id,
    path: item.path,
    scope: item.scope,
    kind: item.kind,
    url: item.scope === "public" ? item.url : "",
    title: item.title,
    alt: item.alt,
    caption: item.caption,
  };
}
export function parseAttachment(value: unknown): MediaAttachment | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<MediaAttachment>;
  if (
    typeof item.id !== "string" ||
    typeof item.path !== "string" ||
    !["public", "members", "approved_members"].includes(String(item.scope)) ||
    !item.path.startsWith(`media/${item.scope}/${item.id}/`)
  )
    return null;
  return {
    id: item.id,
    provider: item.provider === "cloudinary" ? "cloudinary" : "firebase",
    path: item.path,
    scope: item.scope!,
    kind: item.kind === "video" ? "video" : "image",
    url:
      item.scope === "public" &&
      typeof item.url === "string" &&
      (item.url.startsWith("https://firebasestorage.googleapis.com/") ||
        item.url.startsWith("https://res.cloudinary.com/"))
        ? item.url
        : "",
    title: String(item.title || ""),
    alt: String(item.alt || ""),
    caption: String(item.caption || ""),
  };
}
export function watchMedia(
  next: (items: MediaRecord[]) => void,
  error: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, "media"), orderBy("createdAt", "desc")),
    (snapshot) =>
      next(
        snapshot.docs.map(
          (item) => ({ ...item.data(), id: item.id }) as MediaRecord,
        ),
      ),
    error,
  );
}
export function validateMediaFile(
  file: Pick<File, "type" | "size">,
  scope: MediaScope,
) {
  const image = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ].includes(file.type);
  const video = ["video/mp4", "video/webm"].includes(file.type);
  if (!image && !video)
    throw new Error("Choose a JPG, PNG, WebP, GIF, AVIF, MP4 or WebM file.");
  if (video && scope !== "public")
    throw new Error(
      "Member posters support images. Video uploads are available for the public gallery.",
    );
  if (file.size <= 0 || file.size > (video ? 100 : 10) * 1024 * 1024)
    throw new Error(
      video ? "Videos must be under 100 MB." : "Images must be under 10 MB.",
    );
  return image ? ("image" as const) : ("video" as const);
}
export async function uploadMedia(
  file: File,
  scope: MediaScope,
  info: MediaDetails,
  progress: (value: number) => void,
  signal?: AbortSignal,
): Promise<MediaRecord> {
  requireMediaAdmin();
  mediaServiceUrl();
  if (signal?.aborted) throw new Error("Upload cancelled.");
  const kind = validateMediaFile(file, scope);
  if (kind === "image" && !info.alt.trim())
    throw new Error("Add alt text describing this image.");
  const mediaRef = doc(collection(db, "media"));
  const fileName =
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "asset";
  const path = `media/${scope}/${mediaRef.id}/${fileName}`;
  const data = {
    provider: "cloudinary" as const,
    path,
    scope,
    kind,
    url: "",
    fileName,
    contentType: file.type,
    size: file.size,
    title: info.title.trim().slice(0, 180) || fileName,
    alt: info.alt.trim().slice(0, 500),
    caption: info.caption.trim().slice(0, 1000),
    description: (info.description || "").trim().slice(0, 3000),
    category: (info.category || "").trim().slice(0, 80),
    album: (info.album || "").trim().slice(0, 120),
    published: false,
    state: "uploading",
    uses: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    uploadedBy: auth.currentUser!.uid,
  };
  await setDoc(mediaRef, data);
  try {
    const uploadedUrl = await uploadCloudinary(file, path, progress, signal);
    const url = scope === "public" ? uploadedUrl : "";
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(mediaRef);
      if (
        !current.exists() ||
        (current.data().state !== "uploading" &&
          !(current.data().state === "ready" && current.data().url === url))
      )
        throw new Error(
          "Upload was cancelled or removed. Refresh the library.",
        );
      const published = scope === "public" && info.published === true;
      transaction.update(mediaRef, {
        url,
        state: "ready",
        published,
        updatedAt: serverTimestamp(),
      });
      if (published)
        transaction.set(
          doc(db, "galleryItems", mediaRef.id),
          galleryProjection({ ...data, url, id: mediaRef.id }),
        );
    });
    return {
      ...data,
      id: mediaRef.id,
      url,
      state: "ready",
      published: scope === "public" && info.published === true,
      createdAt: null,
    } as MediaRecord;
  } catch (error) {
    // Keep the record for explicit cleanup if object removal or metadata writes fail.
    try {
      await runTransaction(db, async (transaction) => {
        const current = await transaction.get(mediaRef);
        if (current.exists() && current.data().state === "uploading")
          transaction.update(mediaRef, {
            state: "failed",
            updatedAt: serverTimestamp(),
          });
      });
    } catch {
      /* The library exposes unfinished uploads. */
    }
    throw error;
  }
}
export async function mediaBlobUrl(
  item: Pick<MediaAttachment, "path" | "scope" | "url" | "provider">,
) {
  if (item.scope === "public" && item.url) return item.url;
  if (item.provider === "cloudinary") return cloudinaryBlobUrl(item.path);
  const blob = await getBlob(ref(storage, item.path), 10 * 1024 * 1024);
  return URL.createObjectURL(blob);
}

// References and content change together. Deletion locks the media document first,
// preventing a concurrent publisher from attaching a file being removed.
export async function saveWithMedia(
  target: DocumentReference<DocumentData>,
  patch: DocumentData | null,
  attachments: MediaAttachment[],
  scope: MediaScope,
) {
  requireMediaAdmin();
  await runTransaction(db, async (transaction) => {
    const previous = await transaction.get(target);
    const oldIds: string[] = previous.data()?.mediaIds || [];
    const nextIds = [...new Set(attachments.map((item) => item.id))];
    const ids = [...new Set([...oldIds, ...nextIds])];
    const snapshots = await Promise.all(
      ids.map((id) => transaction.get(doc(db, "media", id))),
    );
    for (const id of nextIds) {
      const snapshot = snapshots.find((item) => item.id === id)!;
      const media = snapshot.data() as MediaRecord | undefined;
      const attachment = attachments.find((item) => item.id === id)!;
      if (
        !media ||
        media.state !== "ready" ||
        media.path !== attachment.path ||
        media.scope !== scope
      )
        throw new Error(
          "Select ready media with the same audience as this content.",
        );
    }
    for (const snapshot of snapshots) {
      if (!snapshot.exists()) {
        if (nextIds.includes(snapshot.id))
          throw new Error("The selected media is no longer available.");
        continue;
      }
      const uses = ((snapshot.data().uses || []) as string[]).filter(
        (value) => value !== target.path,
      );
      if (nextIds.includes(snapshot.id)) uses.push(target.path);
      transaction.update(snapshot.ref, { uses, updatedAt: serverTimestamp() });
    }
    if (patch === null) transaction.delete(target);
    else
      transaction.set(
        target,
        { ...patch, mediaIds: nextIds, updatedAt: serverTimestamp() },
        { merge: true },
      );
  });
}
export async function removeMedia(item: MediaRecord) {
  requireMediaAdmin();
  const mediaRef = doc(db, "media", item.id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(mediaRef);
    if (!snapshot.exists())
      throw new Error("This media record no longer exists.");
    if ((snapshot.data().uses || []).length)
      throw new Error(
        "This file is used by saved content. Remove those references before deleting it.",
      );
    if (snapshot.data().path !== item.path)
      throw new Error("Media changed. Reload the library.");
    transaction.delete(doc(db, "galleryItems", item.id));
    transaction.update(mediaRef, {
      published: false,
      state: "deleting",
      updatedAt: serverTimestamp(),
    });
  });
  try {
    if (item.provider === "cloudinary") await deleteCloudinary(item.path);
    else await deleteObject(ref(storage, item.path));
  } catch (error) {
    if ((error as { code?: string }).code !== "storage/object-not-found")
      throw error;
  }
  await deleteDoc(mediaRef);
}
export async function refreshAttachment(id: string) {
  const snapshot = await getDoc(doc(db, "media", id));
  if (!snapshot.exists()) throw new Error("Media not found.");
  return attachmentOf({ ...snapshot.data(), id } as MediaRecord);
}

export async function updateMediaDetails(id: string, info: MediaDetails) {
  requireMediaAdmin();
  const target = doc(db, "media", id);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(target);
    if (!snapshot.exists() || snapshot.data().state !== "ready")
      throw new Error("Only ready media can be edited.");
    if (
      !info.title.trim() ||
      (snapshot.data().kind === "image" && !info.alt.trim())
    )
      throw new Error("Add a title and image alt text.");
    const details = {
      title: info.title.trim().slice(0, 180),
      alt: info.alt.trim().slice(0, 500),
      caption: info.caption.trim().slice(0, 1000),
      description: (info.description ?? snapshot.data().description ?? "")
        .trim()
        .slice(0, 3000),
      category: (info.category ?? snapshot.data().category ?? "")
        .trim()
        .slice(0, 80),
      album: (info.album ?? snapshot.data().album ?? "").trim().slice(0, 120),
      published:
        snapshot.data().scope === "public" &&
        (info.published ?? snapshot.data().published ?? false),
    };
    transaction.update(target, { ...details, updatedAt: serverTimestamp() });
    const galleryRef = doc(db, "galleryItems", id);
    if (details.published)
      transaction.set(
        galleryRef,
        galleryProjection({ ...snapshot.data(), ...details, id }),
      );
    else transaction.delete(galleryRef);
  });
}
// A public projection excludes upload ownership, private paths and saved references.
function galleryProjection(item: DocumentData) {
  return {
    id: item.id,
    kind: item.kind,
    url: item.url,
    title: item.title,
    alt: item.alt,
    caption: item.caption || "",
    description: item.description || "",
    category: item.category || "",
    album: item.album || "",
    createdAt: item.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}
export type GalleryRecord = {
  id: string;
  kind: "image" | "video";
  url: string;
  title: string;
  alt: string;
  caption: string;
  description: string;
  category: string;
  album: string;
};
export function watchPublicGallery(
  next: (items: GalleryRecord[]) => void,
  error: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, "galleryItems"), orderBy("createdAt", "desc")),
    (snapshot) =>
      next(
        snapshot.docs.map(
          (item) => ({ ...item.data(), id: item.id }) as GalleryRecord,
        ),
      ),
    error,
  );
}
