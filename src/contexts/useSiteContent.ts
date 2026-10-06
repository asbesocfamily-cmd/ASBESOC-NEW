import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import type { SitePageId } from "../firebase/siteContent";
import {
  watchSiteMedia,
  type MediaPage,
  type SiteMedia,
} from "../firebase/siteMedia";
export function useSiteContent(page: SitePageId) {
  const [content, setContent] = useState<Record<string, string>>({});
  useEffect(
    () =>
      onSnapshot(
        doc(db, "siteContent", page),
        (snapshot) => {
          const source = snapshot.data()?.content;
          setContent(
            source && typeof source === "object"
              ? Object.fromEntries(
                  Object.entries(source).filter(
                    (entry): entry is [string, string] =>
                      typeof entry[1] === "string",
                  ),
                )
              : {},
          );
        },
        () => setContent({}),
      ),
    [page],
  );
  return content;
}
export function useSiteMedia(page: MediaPage) {
  const [media, setMedia] = useState<SiteMedia | null>(null);
  useEffect(() => watchSiteMedia(page, setMedia, () => setMedia(null)), [page]);
  return media;
}
