import { useState } from "react";
import MediaPreview from "./MediaPreview";
import type { MemberUpdates } from "../contexts/useMemberUpdates";
export default function MemberPublishedUpdates({
  updates,
  compact = false,
}: {
  updates: MemberUpdates;
  compact?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const filtered = updates.items.filter(
    (item) => filter === "all" || item.type === filter,
  );
  const items = compact ? filtered.slice(0, 3) : filtered;
  return (
    <section className="member-feed member-panel">
      <header className="member-panel-heading">
        <div>
          <p className="member-eyebrow">From your community</p>
          <h2>Updates & opportunities</h2>
        </div>
      </header>
      <div className="member-feed-filters" aria-label="Filter member updates">
        {["all", "broadcast", "announcement", "training", "opportunity"].map(
          (type) => (
            <button
              key={type}
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
            >
              {type === "all"
                ? "All updates"
                : type === "opportunity"
                  ? "Opportunities"
                  : type + "s"}
            </button>
          ),
        )}
      </div>
      {updates.loading && (
        <p role="status" className="member-empty">
          Loading member updates…
        </p>
      )}
      {updates.error && (
        <p role="alert" className="member-empty">
          {updates.error} Refresh to retry.
        </p>
      )}
      <div className="member-feed-grid">
        {items.map((item) => (
          <article key={item.key} className="member-update">
            {item.poster && (
              <MediaPreview item={item.poster} className="member-poster" />
            )}
            <div className="member-update-body">
              <span className="member-tag">{item.label}</span>
              <h3>{item.title}</h3>
              <p className="member-update-text">{item.body}</p>
              {item.eventDate && (
                <p className="member-event">Event date · {item.eventDate}</p>
              )}
              {item.actionUrl && (
                <a
                  href={item.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.actionLabel || "View details"} ↗
                </a>
              )}
              <time>
                {item.createdAt
                  ?.toDate()
                  .toLocaleDateString("en-NG", { dateStyle: "medium" }) ||
                  "Published update"}
              </time>
            </div>
          </article>
        ))}
      </div>
      {!updates.loading && !updates.error && !items.length && (
        <p className="member-empty">
          No published {filter === "all" ? "updates" : filter + "s"} yet. New
          items will appear here.
        </p>
      )}
    </section>
  );
}
