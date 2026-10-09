import { useEffect, useState } from "react";
import {
  activeBroadcast,
  watchBroadcasts,
  type Broadcast,
} from "../firebase/broadcasts";
import { watchMemberPosts, type MemberPost } from "../firebase/memberContent";
export function useMemberUpdates(approved: boolean) {
  const [state, setState] = useState<{
    audience: boolean;
    broadcasts: Broadcast[];
    posts: MemberPost[];
    pending: boolean[];
    errors: string[];
  }>();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let broadcasts: Broadcast[] = [],
      posts: MemberPost[] = [];
    const pending = [true, true],
      errors = ["", ""];
    const emit = () =>
      setState({
        audience: approved,
        broadcasts,
        posts,
        pending: [...pending],
        errors: [...errors],
      });
    const a = watchBroadcasts(
      false,
      false,
      (items) => {
        broadcasts = items;
        pending[0] = false;
        errors[0] = "";
        emit();
      },
      () => {
        broadcasts = [];
        pending[0] = false;
        errors[0] = "Broadcasts could not load.";
        emit();
      },
      approved,
    );
    const b = watchMemberPosts(
      (items) => {
        posts = items;
        pending[1] = false;
        errors[1] = "";
        emit();
      },
      () => {
        posts = [];
        pending[1] = false;
        errors[1] = "Member posts could not load.";
        emit();
      },
      true,
    );
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => {
      a();
      b();
      clearInterval(timer);
    };
  }, [approved]);
  const current = state?.audience === approved ? state : undefined;
  const items = [
    ...(current?.broadcasts || [])
      .filter((item) => activeBroadcast(item, now))
      .map((item) => ({
        ...item,
        key: `broadcast-${item.id}`,
        type: "broadcast",
        label:
          item.priority === "normal"
            ? "Broadcast"
            : `${item.priority} broadcast`,
        eventDate: "",
        actionUrl: "",
        actionLabel: "",
        time:
          (item.updatedAt || item.publishedAt || item.createdAt)?.toMillis() ||
          0,
      })),
    ...(current?.posts || [])
      .filter((item) => item.published)
      .map((item) => ({
        ...item,
        key: `post-${item.id}`,
        label: item.type,
        time: (item.updatedAt || item.createdAt)?.toMillis() || 0,
      })),
  ].sort((a, b) => b.time - a.time);
  return {
    items,
    loading: !current || current.pending.some(Boolean),
    error: current?.errors.filter(Boolean).join(" ") || "",
  };
}
export type MemberUpdates = ReturnType<typeof useMemberUpdates>;
