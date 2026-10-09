import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  attachmentOf,
  updateMediaDetails,
  mediaError,
  removeMedia,
  uploadMedia,
  watchMedia,
  type MediaAttachment,
  type MediaRecord,
  type MediaScope,
  validateMediaFile,
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
  const uploadConfigured = Boolean(import.meta.env.VITE_MEDIA_API_URL?.trim());
  const [scope, setScope] = useState<MediaScope>(fixedScope || "public");
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<MediaRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [album, setAlbum] = useState("");
  const [publish, setPublish] = useState(!onSelect);
  const [selected, setSelected] = useState<string[]>([]);
  const [kindFilter, setKindFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [albumFilter, setAlbumFilter] = useState("");
  const [uploadLabel, setUploadLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const file = files[0];
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
    if (!files.length || busy) return;
    if (
      scope === "public" &&
      publish &&
      !window.confirm(
        `Upload and publish ${files.length} file(s) to the public Gallery?`,
      )
    )
      return;
    try {
      files.forEach((item) => validateMediaFile(item, scope));
    } catch (caught) {
      setError(mediaError(caught));
      return;
    }
    setBusy(true);
    setUploading(true);
    setError("");
    setNotice("");
    setProgress(0);
    abort.current = new AbortController();
    const failed: File[] = [];
    const errors: string[] = [];
    let completed = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const next = files[i];
        if (abort.current.signal.aborted) {
          failed.push(...files.slice(i));
          break;
        }
        setUploadLabel(`${i + 1}/${files.length}: ${next.name}`);
        setProgress(0);
        try {
          const result = await uploadMedia(
            next,
            scope,
            {
              title: title || next.name,
              alt,
              caption,
              description,
              category,
              album,
              published: publish,
            },
            setProgress,
            abort.current.signal,
          );
          completed++;
          if (files.length === 1) onSelect?.(attachmentOf(result));
        } catch (caught) {
          failed.push(next);
          errors.push(`${next.name}: ${mediaError(caught)}`);
        }
      }
      setFiles(failed);
      if (!failed.length && input.current) input.current.value = "";
      setNotice(
        `${completed} file(s) uploaded${scope === "public" && publish ? " and published to the Gallery" : " as library drafts"}. ${failed.length ? `${failed.length} not completed; successful files will not be uploaded again.` : ""}`,
      );
      setError(errors.join(" "));
    } finally {
      setBusy(false);
      setUploading(false);
      abort.current = null;
    }
  }
  async function removeSelected() {
    const chosen = items.filter((item) => selected.includes(item.id));
    if (
      busy ||
      !chosen.length ||
      !window.confirm(
        `Permanently delete ${chosen.length} selected files? Published Gallery items disappear immediately. Files referenced by other content are protected.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    let removed = 0;
    const errors: string[] = [];
    const remaining: string[] = [];
    for (const item of chosen) {
      try {
        await removeMedia(item);
        removed++;
      } catch (caught) {
        errors.push(`${item.title}: ${mediaError(caught)}`);
        remaining.push(item.id);
      }
    }
    setSelected(remaining);
    setNotice(`${removed} file(s) deleted.`);
    setError(errors.join(" "));
    setBusy(false);
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
      (!kindFilter || item.kind === kindFilter) &&
      (!categoryFilter || item.category === categoryFilter) &&
      (!albumFilter || item.album === albumFilter) &&
      `${item.title} ${item.fileName} ${item.caption} ${item.description || ""} ${item.category || ""} ${item.album || ""}`
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
      {!uploadConfigured && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
        >
          Uploads are unavailable until the media account is connected. You can
          still manage previously saved content.
        </p>
      )}
      <div className="control-toolbar">
        {!fixedScope && (
          <label>
            Visibility
            <select
              disabled={busy}
              value={scope}
              onChange={(event) => {
                setScope(event.target.value as MediaScope);
                setSelected([]);
                setFiles([]);
                if (input.current) input.current.value = "";
              }}
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
        <label>
          Type
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All types</option>
            <option value="image">Images</option>
            {!imageOnly && <option value="video">Videos</option>}
          </select>
        </label>
        <label>
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {[
              ...new Set(
                items
                  .filter((i) => i.scope === scope)
                  .map((i) => i.category)
                  .filter(Boolean),
              ),
            ]
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </select>
        </label>
        <label>
          Album
          <select
            value={albumFilter}
            onChange={(e) => setAlbumFilter(e.target.value)}
          >
            <option value="">All albums</option>
            {[
              ...new Set(
                items
                  .filter((i) => i.scope === scope)
                  .map((i) => i.album)
                  .filter(Boolean),
              ),
            ]
              .sort()
              .map((value) => (
                <option key={value}>{value}</option>
              ))}
          </select>
        </label>
      </div>
      {!onSelect && (
        <div className="control-actions mb-4">
          <button
            type="button"
            className="control-button"
            disabled={busy}
            onClick={() => setSelected(visible.map((i) => i.id))}
          >
            Select visible files
          </button>
          <button
            type="button"
            className="control-button"
            onClick={() => setSelected([])}
          >
            Clear selection
          </button>
          <button
            type="button"
            disabled={busy || !selected.length}
            className="control-button danger"
            onClick={() => void removeSelected()}
          >
            Delete selected ({selected.length})
          </button>
        </div>
      )}
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
                multiple={!onSelect}
                required
                accept={
                  scope === "public" && !imageOnly
                    ? "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm"
                    : "image/jpeg,image/png,image/webp,image/gif,image/avif"
                }
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []))
                }
              />
              <small>
                Images up to 10 MB. Public gallery videos up to 100 MB
                (MP4/WebM).
              </small>
            </label>
            {files.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {files.map((entry, index) => (
                  <UploadPreview key={`${entry.name}-${index}`} file={entry} />
                ))}
              </div>
            )}
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
                required={files.some((entry) =>
                  entry.type.startsWith("image/"),
                )}
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
            <label>
              Description
              <textarea
                value={description}
                maxLength={3000}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              Category
              <input
                value={category}
                maxLength={80}
                placeholder="e.g. Community outreach"
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
            <label>
              Album
              <input
                value={album}
                maxLength={120}
                placeholder="e.g. October outreach"
                onChange={(e) => setAlbum(e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">
              For multiple files, these details apply to the batch. Leave title
              blank to use filenames; edit each file after uploading.
            </p>
            {scope === "public" && (
              <label className="control-checkbox">
                <input
                  type="checkbox"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                Publish uploads immediately to the public Gallery
              </label>
            )}
            <p className="text-xs text-slate-500">
              {scope === "public"
                ? "Public files can be viewed by anyone with their link. Do not upload private member information here."
                : "These files are loaded through authenticated access. No public download links are saved for member attachments."}
            </p>
            <button
              className="control-button primary"
              disabled={!file || busy || !uploadConfigured}
            >
              {uploading
                ? `Uploading ${progress}%`
                : `Upload ${files.length || ""} file(s)`}
            </button>
          </fieldset>
          {uploading && (
            <>
              <p role="status">{uploadLabel}</p>
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
      {editing && (
        <MediaDetails
          key={editing.id}
          item={editing}
          done={() => setEditing(null)}
        />
      )}
      <div className="v2-media-library">
        {visible.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-slate-200 p-3"
          >
            {!onSelect && (
              <label className="control-checkbox">
                <input
                  type="checkbox"
                  disabled={busy}
                  aria-label={`Select ${item.title}`}
                  checked={selected.includes(item.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, item.id]
                        : selected.filter((id) => id !== item.id),
                    )
                  }
                />
                Select
              </label>
            )}
            {item.state === "ready" ? (
              <MediaPreview
                item={item}
                className="h-40 w-full rounded-lg object-contain bg-slate-50"
                controls={true}
              />
            ) : (
              <p className="control-empty">
                {item.state === "deleting"
                  ? "Deletion unfinished — retry delete"
                  : `${item.state} — remove an unfinished upload if no longer needed`}
              </p>
            )}
            {item.state === "ready" && (
              <button
                type="button"
                className="control-button mt-3"
                disabled={busy}
                onClick={() => setEditing(item)}
              >
                Edit details
              </button>
            )}
            <p className="mt-2 text-xs text-emerald-800">
              {item.published ? "Published in Gallery" : "Library draft"}
              {item.category ? ` · ${item.category}` : ""}
              {item.album ? ` · ${item.album}` : ""}
            </p>
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

function MediaDetails({ item, done }: { item: MediaRecord; done: () => void }) {
  const [title, setTitle] = useState(item.title),
    [alt, setAlt] = useState(item.alt),
    [caption, setCaption] = useState(item.caption);
  const [description, setDescription] = useState(item.description || ""),
    [category, setCategory] = useState(item.category || ""),
    [album, setAlbum] = useState(item.album || ""),
    [published, setPublished] = useState(item.published || false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="control-form mb-5 rounded-xl border border-slate-200 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
          await updateMediaDetails(item.id, {
            title,
            alt,
            caption,
            description,
            category,
            album,
            published,
          });
          done();
        } catch (caught) {
          setError(mediaError(caught));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="font-bold">Edit media details</h3>
      <p className="text-xs text-slate-500">
        Published Gallery details update immediately. Existing attachments in
        posts retain their saved captions.
      </p>
      <fieldset disabled={busy} className="control-form">
        <label>
          Title
          <input
            required
            maxLength={180}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label>
          Alt text
          <input
            required={item.kind === "image"}
            maxLength={500}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
          />
        </label>
        <label>
          Caption
          <textarea
            maxLength={1000}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            maxLength={3000}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Category
          <input
            value={category}
            maxLength={80}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <label>
          Album
          <input
            value={album}
            maxLength={120}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </label>
        {item.scope === "public" && (
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published in public Gallery
          </label>
        )}
        {error && (
          <p role="alert" className="control-error">
            {error}
          </p>
        )}
        <div className="control-actions">
          <button className="control-button primary">
            {busy ? "Saving…" : "Save details"}
          </button>
          <button type="button" className="control-button" onClick={done}>
            Cancel editing
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function UploadPreview({ file }: { file: File }) {
  const preview = useRef<HTMLImageElement & HTMLVideoElement>(null);
  useEffect(() => {
    const value = URL.createObjectURL(file);
    if (preview.current) preview.current.src = value;
    return () => URL.revokeObjectURL(value);
  }, [file]);
  return (
    <figure className="rounded-lg border p-2">
      {file.type.startsWith("video/") ? (
        <video
          ref={preview}
          controls
          preload="metadata"
          className="h-28 w-full object-contain"
        />
      ) : (
        <img
          ref={preview}
          alt="Upload preview"
          className="h-28 w-full object-contain"
        />
      )}
      <figcaption className="break-all text-xs">{file.name}</figcaption>
    </figure>
  );
}
