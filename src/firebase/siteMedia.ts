import { doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { parseAttachment, saveWithMedia, type MediaAttachment } from "./media";
export type MediaPage = "home" | "programs" | "gallery";
export type SiteMedia = {
  hero: MediaAttachment | null;
  secondary: MediaAttachment | null;
  items: MediaAttachment[];
  includeBundled: boolean;
  hiddenBundled: string[];
};
export const emptySiteMedia: SiteMedia = {
  hero: null,
  secondary: null,
  items: [],
  includeBundled: true,
  hiddenBundled: [],
};
export function watchSiteMedia(
  page: MediaPage,
  next: (value: SiteMedia | null) => void,
  error: (error: Error) => void,
  draft = false,
) {
  return onSnapshot(
    doc(db, draft ? "siteDrafts" : "siteMedia", page),
    (snapshot) => {
      if (!snapshot.exists()) {
        next(null);
        return;
      }
      const d = snapshot.data();
      const items: unknown[] = Array.isArray(d.items) ? d.items : [];
      next({
        hero: parseAttachment(d.hero),
        secondary: parseAttachment(d.secondary),
        items: items
          .map(parseAttachment)
          .filter(
            (value): value is MediaAttachment =>
              !!value && value.scope === "public",
          ),
        includeBundled: d.includeBundled !== false,
        hiddenBundled: Array.isArray(d.hiddenBundled)
          ? d.hiddenBundled.filter(
              (value: unknown) => typeof value === "string",
            )
          : [],
      });
    },
    error,
  );
}
export async function saveSiteMedia(
  page: MediaPage,
  value: SiteMedia,
  draft: boolean,
) {
  if (value.items.length > 100)
    throw new Error("Keep each gallery collection to 100 uploaded items.");
  const attachments = [value.hero, value.secondary, ...value.items].filter(
    (item): item is MediaAttachment => !!item,
  );
  if (value.hero?.kind === "video" || value.secondary?.kind === "video")
    throw new Error(
      "Page image slots require an image. Videos belong in the gallery.",
    );
  await saveWithMedia(
    doc(db, draft ? "siteDrafts" : "siteMedia", page),
    { ...value, savedAt: serverTimestamp() },
    attachments,
    "public",
  );
}
