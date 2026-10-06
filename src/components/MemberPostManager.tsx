import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createMemberPost,
  deleteMemberPost,
  updateMemberPost,
  watchMemberPosts,
  type MemberPost,
  type MemberPostType,
} from "../firebase/memberContent";
import { mediaError, type MediaAttachment } from "../firebase/media";
import { MediaAttachmentField } from "./AdminMedia";
import MediaPreview from "./MediaPreview";
export default function MemberPostManager({
  defaultType,
}: {
  defaultType: MemberPostType;
}) {
  const [posts, setPosts] = useState<MemberPost[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<MemberPost>(),
    [revision, setRevision] = useState(0);
  useEffect(
    () =>
      watchMemberPosts(
        (values) => {
          setPosts(values);
          setLoading(false);
        },
        (caught) => {
          setError(mediaError(caught));
          setLoading(false);
        },
      ),
    [],
  );
  const visible = posts.filter((item) =>
    defaultType === "announcement"
      ? item.type === "announcement"
      : item.type !== "announcement",
  );
  async function action(item: MemberPost, remove: boolean) {
    if (
      busy ||
      (remove &&
        !window.confirm(`Delete “${item.title}”? This cannot be undone.`))
    )
      return;
    setBusy(true);
    setError("");
    try {
      if (remove) await deleteMemberPost(item.id);
      else await updateMemberPost(item.id, { published: !item.published });
    } catch (caught) {
      setError(mediaError(caught));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="control-stack">
      <PostEditor
        key={`${editing?.id || "new"}-${revision}`}
        existing={editing}
        defaultType={defaultType}
        saved={() => {
          setEditing(undefined);
          setRevision((value) => value + 1);
        }}
      />
      <section className="control-panel">
        <div className="control-heading">
          <h2>Published items & drafts</h2>
          <p>
            Private member content. Drafts remain visible only to the
            administrator.
          </p>
        </div>
        {error && (
          <p role="alert" className="control-error">
            {error}
          </p>
        )}
        {loading && (
          <p role="status" className="control-empty">
            Loading posts…
          </p>
        )}
        {visible.map((item) => (
          <article key={item.id} className="control-post">
            <span className="control-badge">
              {item.type} · {item.published ? "Published" : "Draft"}
            </span>
            <h3>{item.title}</h3>
            {item.poster && (
              <MediaPreview
                item={item.poster}
                className="my-3 max-h-80 max-w-full rounded-xl object-contain"
              />
            )}
            <p className="control-body">{item.body}</p>
            {item.eventDate && (
              <p className="text-xs text-slate-500">Date: {item.eventDate}</p>
            )}
            <div className="control-actions">
              <button
                type="button"
                disabled={busy}
                className="control-button"
                onClick={() => {
                  setEditing(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                disabled={busy}
                className="control-button"
                onClick={() => void action(item, false)}
              >
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                disabled={busy}
                className="control-button danger"
                onClick={() => void action(item, true)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
        {!loading && !error && !visible.length && (
          <p className="control-empty">No items yet.</p>
        )}
      </section>
    </div>
  );
}
function PostEditor({
  existing,
  defaultType,
  saved,
}: {
  existing?: MemberPost;
  defaultType: MemberPostType;
  saved: () => void;
}) {
  const [type, setType] = useState(existing?.type || defaultType),
    [title, setTitle] = useState(existing?.title || ""),
    [body, setBody] = useState(existing?.body || ""),
    [published, setPublished] = useState(existing?.published ?? false),
    [poster, setPoster] = useState<MediaAttachment | null>(
      existing?.poster || null,
    ),
    [eventDate, setEventDate] = useState(existing?.eventDate || ""),
    [actionUrl, setActionUrl] = useState(existing?.actionUrl || ""),
    [actionLabel, setActionLabel] = useState(existing?.actionLabel || ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const lock = useRef(false);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const value = {
        type,
        title,
        body,
        published,
        poster,
        eventDate,
        actionUrl,
        actionLabel,
      };
      if (existing) await updateMemberPost(existing.id, value);
      else await createMemberPost(value);
      saved();
    } catch (caught) {
      setError(mediaError(caught));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="control-panel">
      <div className="control-heading">
        <h2>
          {existing
            ? "Edit item"
            : defaultType === "announcement"
              ? "Announcements"
              : "Trainings & Opportunities"}
        </h2>
        <p>Share a message, poster and useful details with verified members.</p>
      </div>
      <form onSubmit={save} className="control-form">
        <fieldset disabled={busy} className="control-form">
          <label>
            Post type
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as MemberPostType)
              }
            >
              {defaultType === "announcement" ? (
                <option value="announcement">Announcement</option>
              ) : (
                <>
                  <option value="training">Training</option>
                  <option value="opportunity">Opportunity</option>
                </>
              )}
            </select>
          </label>
          <label>
            Post title
            <input
              required
              value={title}
              maxLength={180}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Post message
            <textarea
              required
              value={body}
              maxLength={6000}
              rows={5}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <MediaAttachmentField
            value={poster}
            onChange={setPoster}
            scope="members"
          />
          {type !== "announcement" && (
            <div className="control-toolbar">
              <label>
                Optional date
                <input
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                />
              </label>
              <label>
                Optional HTTPS action link
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(event) => setActionUrl(event.target.value)}
                />
              </label>
              <label>
                Link label
                <input
                  value={actionLabel}
                  maxLength={80}
                  onChange={(event) => setActionLabel(event.target.value)}
                />
              </label>
            </div>
          )}
          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />
            Publish to member dashboards
          </label>
          {error && (
            <p role="alert" className="control-error">
              {error}
            </p>
          )}
          <div className="control-actions">
            <button className="control-button primary">
              {busy ? "Saving…" : published ? "Save & publish" : "Save draft"}
            </button>
            {existing && (
              <button className="control-button" type="button" onClick={saved}>
                Cancel editing
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </section>
  );
}
