import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  attachmentOf,
  mediaError,
  removeMedia,
  uploadMedia,
  watchMedia,
  type MediaAttachment,
  type MediaRecord,
  type MediaScope,
} from "../firebase/media";
import MediaPreview from "./MediaPreview";
const scopeLabels = {
  public: "Public website",
  members: "Verified members",
  approved_members: "Approved members",
};
export default function AdminMedia({
  scope: fixedScope,
  onSelect,
  imageOnly = false,
}: {
  scope?: MediaScope;
  onSelect?: (value: MediaAttachment) => void;
  imageOnly?: boolean;
}) {
  const [scope, setScope] = useState<MediaScope>(fixedScope || "public");
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () =>
      watchMedia(
        (values) => {
          setItems(values);
          setLoading(false);
        },
        (caught) => {
          setError(mediaError(caught));
          setLoading(false);
        },
      ),
    [],
  );
  useEffect(() => () => abort.current?.abort(), []);
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setProgress(0);
    abort.current = new AbortController();
    try {
      const result = await uploadMedia(
        file,
        scope,
        { title, alt, caption },
        setProgress,
        abort.current.signal,
      );
      setFile(null);
      setTitle("");
      setAlt("");
      setCaption("");
      if (input.current) input.current.value = "";
      setNotice("Upload complete. Select this file to use it in content.");
      onSelect?.(attachmentOf(result));
    } catch (caught) {
      setError(mediaError(caught));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }
  async function remove(item: MediaRecord) {
    if (
      busy ||
      !window.confirm(
        `Permanently delete “${item.title}”? This removes the stored file. Files used by saved content cannot be deleted.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await removeMedia(item);
      setNotice("Media deleted.");
    } catch (caught) {
      setError(mediaError(caught));
    } finally {
      setBusy(false);
    }
  }
  const visible = items.filter(
    (item) =>
      item.scope === scope &&
      (!imageOnly || item.kind === "image") &&
      `${item.title} ${item.fileName} ${item.caption}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <section className="control-panel">
      <div className="control-heading">
        <h2>{onSelect ? "Choose reusable media" : "Media library"}</h2>
        <p>
          Upload once, then reuse in website content or member publishing.
          Public and member files are kept separate.
        </p>
      </div>
      <div className="control-toolbar">
        {!fixedScope && (
          <label>
            Visibility
            <select
              disabled={busy}
              value={scope}
              onChange={(event) => setScope(event.target.value as MediaScope)}
            >
              {Object.entries(scopeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Search media
          <input
            value={search}
            placeholder="Title, filename or caption"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <details className="mb-5 rounded-xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          Upload to {scopeLabels[scope]}
        </summary>
        <form
          onSubmit={(event) => {
            event.stopPropagation();
            void upload(event);
          }}
          className="control-form mt-4"
        >
          <fieldset disabled={busy} className="control-form">
            <label>
              File
              <input
                ref={input}
                type="file"
                required
                accept={
                  scope === "public" && !imageOnly
                    ? "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"
                    : "image/jpeg,image/png,image/webp,image/gif,image/avif"
                }
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
              <small>
                Images up to 10 MB. Public gallery videos up to 100 MB
                (MP4/WebM).
              </small>
            </label>
            <label>
              Title
              <input
                value={title}
                maxLength={180}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Image alt text
              <input
                required={!!file?.type.startsWith("image/")}
                value={alt}
                maxLength={500}
                onChange={(event) => setAlt(event.target.value)}
                placeholder="Describe what the image shows"
              />
            </label>
            <label>
              Caption
              <textarea
                value={caption}
                maxLength={1000}
                rows={2}
                onChange={(event) => setCaption(event.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              {scope === "public"
                ? "Public files can be viewed by anyone with their link. Do not upload private member information here."
                : "These files are loaded through authenticated access. No public download links are saved for member attachments."}
            </p>
            <button className="control-button primary" disabled={!file || busy}>
              {busy ? `Uploading ${progress}%` : "Upload file"}
            </button>
          </fieldset>
          {busy && (
            <>
              <progress
                value={progress}
                max={100}
                aria-label="Upload progress"
              />
              <button
                type="button"
                className="control-button"
                onClick={() => abort.current?.abort()}
              >
                Cancel upload
              </button>
            </>
          )}
        </form>
      </details>
      {error && (
        <p role="alert" className="control-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-sm text-emerald-800">
          {notice}
        </p>
      )}
      {loading && (
        <p role="status" className="control-empty">
          Loading library…
        </p>
      )}
      <div className="v2-media-library">
        {visible.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 p-3"
          >
            {item.state === "ready" ? (
              <MediaPreview
                item={item}
                className="h-40 w-full rounded-lg object-contain bg-slate-50"
                controls={false}
              />
            ) : (
              <p className="control-empty">
                {item.state === "deleting"
                  ? "Deletion unfinished — retry delete"
                  : `${item.state} — remove an unfinished upload if no longer needed`}
              </p>
            )}
            <h3 className="mt-3 break-words text-sm font-bold">{item.title}</h3>
            <p className="mt-1 break-all text-xs text-slate-500">
              {item.fileName} · {(item.size / 1024 / 1024).toFixed(1)} MB
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {item.createdAt?.toDate().toLocaleDateString()} ·{" "}
              {item.uses?.length || 0} saved references
            </p>
            {!!item.uses?.length && (
              <details className="mt-2 text-xs">
                <summary>Used by</summary>
                <ul>
                  {item.uses.map((use) => (
                    <li className="break-all" key={use}>
                      {use}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="control-actions">
              {onSelect && (
                <button
                  type="button"
                  disabled={busy || item.state !== "ready"}
                  className="control-button primary"
                  onClick={() => onSelect(attachmentOf(item))}
                >
                  Select
                </button>
              )}
              {item.scope === "public" && item.url && (
                <button
                  type="button"
                  className="control-button"
                  onClick={() =>
                    navigator.clipboard.writeText(item.url).then(
                      () => setNotice("Public media link copied."),
                      () => setError("Clipboard access failed."),
                    )
                  }
                >
                  Copy public link
                </button>
              )}
              <button
                type="button"
                className="control-button danger"
                disabled={busy || !!item.uses?.length}
                onClick={() => void remove(item)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && !visible.length && (
        <p className="control-empty">No media matches this view.</p>
      )}
    </section>
  );
}
export function MediaAttachmentField({
  value,
  onChange,
  scope,
  imageOnly = true,
}: {
  value: MediaAttachment | null;
  onChange: (value: MediaAttachment | null) => void;
  scope: MediaScope;
  imageOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-3 text-sm font-semibold">
        {imageOnly ? "Optional poster / flier / cover image" : "Website media"}
      </p>
      {value && (
        <div className="mb-3">
          <MediaPreview
            item={value}
            className="max-h-64 max-w-full rounded-lg object-contain"
          />
          <p className="mt-2 text-xs text-slate-500">{value.title}</p>
          <button
            type="button"
            className="control-button mt-2"
            onClick={() => onChange(null)}
          >
            Remove attachment
          </button>
        </div>
      )}
      <button
        type="button"
        className="control-button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "Close media chooser" : "Upload or select media"}
      </button>
      {open &&
        createPortal(
          <MediaPicker
            scope={scope}
            imageOnly={imageOnly}
            onSelect={(item) => {
              onChange(item);
              setOpen(false);
            }}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </div>
  );
}

function MediaPicker({
  scope,
  imageOnly,
  onSelect,
  onClose,
}: {
  scope: MediaScope;
  imageOnly: boolean;
  onSelect: (item: MediaAttachment) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const all = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary",
        ) || [],
      ).filter((element) => element.getClientRects().length);
      const first = all[0],
        last = all[all.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, []);
  return (
    <div
      className="asbesoc-control"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        overflowY: "auto",
        background: "rgba(6,40,25,.65)",
        padding: "24px",
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Select media"
        className="mx-auto max-w-5xl rounded-2xl bg-white p-4"
      >
        <button type="button" className="control-button mb-4" onClick={onClose}>
          Close media chooser
        </button>
        <AdminMedia scope={scope} imageOnly={imageOnly} onSelect={onSelect} />
      </div>
    </div>
  );
}
