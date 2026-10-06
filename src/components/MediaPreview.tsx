import { useEffect, useState } from "react";
import { mediaBlobUrl, type MediaAttachment } from "../firebase/media";
export default function MediaPreview({
  item,
  className = "",
  controls = true,
}: {
  item: MediaAttachment;
  className?: string;
  controls?: boolean;
}) {
  const [state, setState] = useState({ path: "", url: "", failed: false });
  const { path, scope, url, provider } = item;
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    mediaBlobUrl({ path, scope, url, provider })
      .then((value) => {
        objectUrl = value.startsWith("blob:") ? value : "";
        if (active) setState({ path, url: value, failed: false });
        else if (objectUrl) URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (active) setState({ path, url: "", failed: true });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path, scope, url, provider]);
  if (state.path !== item.path || !state.url)
    return (
      <p role="status" className={`p-4 text-xs text-slate-500 ${className}`}>
        {state.path === item.path && state.failed
          ? "Media unavailable. Check access and media setup."
          : "Loading media…"}
      </p>
    );
  return item.kind === "video" ? (
    <video
      className={className}
      src={state.url}
      controls={controls}
      muted={!controls}
      playsInline
      preload="metadata"
      aria-label={item.title}
    />
  ) : (
    <img
      className={className}
      src={state.url}
      alt={item.alt || item.title}
      loading="lazy"
      onError={() => setState({ path: item.path, url: "", failed: true })}
    />
  );
}
