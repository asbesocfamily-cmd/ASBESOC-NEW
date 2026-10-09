import { useEffect, useState } from "react";
import {
  emptySiteMedia,
  saveSiteMedia,
  watchSiteMedia,
  type MediaPage,
  type SiteMedia,
} from "../firebase/siteMedia";
import { mediaError, type MediaAttachment } from "../firebase/media";
import { MediaAttachmentField } from "./AdminMedia";
import MediaPreview from "./MediaPreview";
export default function PublicGalleryPublisher() {
  return (
    <section className="control-panel">
      <div className="control-heading">
        <h2>Public gallery publishing</h2>
        <p>
          Select photos and videos, edit their captions, save a draft, then
          publish to the Gallery page.
        </p>
      </div>
      <Editor page="gallery" />
    </section>
  );
}
function Editor({ page }: { page: MediaPage }) {
  const [value, setValue] = useState<SiteMedia>(emptySiteMedia),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selection, setSelection] = useState<MediaAttachment | null>(null);
  useEffect(() => {
    let chosen = false;
    let live: SiteMedia | null = null;
    let draft: SiteMedia | null | undefined;
    let liveLoaded = false;
    function receive() {
      if (chosen || !liveLoaded || draft === undefined) return;
      chosen = true;
      setValue(draft || live || emptySiteMedia);
      setLoaded(true);
    }
    const fail = (caught: Error) => {
      setError(mediaError(caught));
      setLoaded(false);
    };
    const a = watchSiteMedia(
      page,
      (data) => {
        live = data;
        liveLoaded = true;
        receive();
      },
      fail,
    );
    const b = watchSiteMedia(
      page,
      (data) => {
        draft = data;
        receive();
      },
      fail,
      true,
    );
    return () => {
      a();
      b();
    };
  }, [page]);
  async function save(draft: boolean) {
    if (busy || !loaded) return;
    if (
      !draft &&
      !window.confirm("Publish these media changes to the public website?")
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!draft) await saveSiteMedia(page, value, true);
      await saveSiteMedia(page, value, draft);
      setNotice(
        draft
          ? "Draft saved. The public page is unchanged."
          : "Published to the website.",
      );
    } catch (caught) {
      setError(mediaError(caught));
    } finally {
      setBusy(false);
    }
  }
  function move(index: number, direction: number) {
    const items = [...value.items];
    [items[index], items[index + direction]] = [
      items[index + direction],
      items[index],
    ];
    setValue({ ...value, items });
  }
  return (
    <div className="control-form">
      {error && (
        <p role="alert" className="control-error">
          {error}
        </p>
      )}
      {!loaded && !error && (
        <p role="status" className="control-empty">
          Loading saved media…
        </p>
      )}
      <button
        type="button"
        className="control-button mb-4"
        disabled={!loaded || busy}
        onClick={async () => {
          if (
            !window.confirm(
              "Unpublish uploaded gallery media? Your draft and files will be kept.",
            )
          )
            return;
          setBusy(true);
          setError("");
          try {
            await saveSiteMedia(
              "gallery",
              {
                ...emptySiteMedia,
                includeBundled: value.includeBundled,
                hiddenBundled: value.hiddenBundled,
              },
              false,
            );
            setNotice(
              "Uploaded gallery media unpublished. Your draft is retained.",
            );
          } catch (caught) {
            setError(mediaError(caught));
          } finally {
            setBusy(false);
          }
        }}
      >
        Unpublish uploaded gallery media
      </button>
      <fieldset disabled={!loaded || busy} className="control-form">
        <>
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={value.includeBundled}
              onChange={(event) =>
                setValue({ ...value, includeBundled: event.target.checked })
              }
            />
            Include the existing bundled photo collection
          </label>
          <p className="text-xs text-slate-500">
            Uncheck to replace the bundled collection with your selected
            uploads. Static photos remain the fallback if the media service is
            unavailable.
          </p>
          <MediaAttachmentField
            value={selection}
            onChange={setSelection}
            scope="public"
            imageOnly={false}
          />
          <button
            type="button"
            disabled={
              !selection || value.items.some((item) => item.id === selection.id)
            }
            className="control-button"
            onClick={() => {
              if (selection) {
                setValue({ ...value, items: [...value.items, selection] });
                setSelection(null);
              }
            }}
          >
            Add selected media to gallery
          </button>
          {value.items.map((item, index) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <MediaPreview
                item={item}
                className="max-h-52 max-w-full rounded-lg object-contain"
              />
              <label>
                Title
                <input
                  maxLength={180}
                  value={item.title}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      items: value.items.map((entry, i) =>
                        i === index
                          ? { ...entry, title: event.target.value }
                          : entry,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Alt text
                <input
                  maxLength={500}
                  value={item.alt}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      items: value.items.map((entry, i) =>
                        i === index
                          ? { ...entry, alt: event.target.value }
                          : entry,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Caption
                <input
                  maxLength={1000}
                  value={item.caption}
                  onChange={(event) =>
                    setValue({
                      ...value,
                      items: value.items.map((entry, i) =>
                        i === index
                          ? { ...entry, caption: event.target.value }
                          : entry,
                      ),
                    })
                  }
                />
              </label>
              <div className="control-actions">
                <button
                  type="button"
                  className="control-button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="control-button"
                  disabled={index === value.items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="control-button danger"
                  onClick={() =>
                    setValue({
                      ...value,
                      items: value.items.filter((_, i) => i !== index),
                    })
                  }
                >
                  Remove from gallery
                </button>
              </div>
            </article>
          ))}
        </>

        <div className="control-actions">
          <button
            type="button"
            className="control-button"
            onClick={() => void save(true)}
          >
            Save draft
          </button>
          <button
            type="button"
            className="control-button primary"
            onClick={() => void save(false)}
          >
            Publish media changes
          </button>
          <a
            className="control-button"
            target="_blank"
            rel="noopener noreferrer"
            href={page === "home" ? "/" : `/${page}`}
          >
            View public page
          </a>
        </div>
      </fieldset>
      {notice && (
        <p role="status" className="text-sm text-emerald-800">
          {notice}
        </p>
      )}
    </div>
  );
}
