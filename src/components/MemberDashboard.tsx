import "./member-v2.css";
import {
  useMemberUpdates,
  type MemberUpdates,
} from "../contexts/useMemberUpdates";
import MemberPublishedUpdates from "./MemberPublishedUpdates";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { doc, getDocFromServer } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";

import { useAuth } from "../contexts/useAuth";
import { useMembership } from "../contexts/useMembership";
import { db } from "../firebase/firebaseConfig";
import {
  chatError,
  chatMessageTime,
  watchMemberChat,
  markChatRead,
  type ChatConversation,
  ensureMemberChat,
  sendMemberMessage,
  watchMemberMessages,
  type ChatMessage,
} from "../firebase/chat";
import {
  applicationLabel,
  certificateLabel,
  getCertificateStatus,
  getPaymentStatus,
  isCertifiedMember,
  memberError,
  paymentLabel,
  saveMemberProfile,
  type Application,
} from "../firebase/membership";

/* -------------------------------------------------------------------------- */
/*                                  STYLES                                    */
/* -------------------------------------------------------------------------- */

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#063b25] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a5133] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6b43] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#063b25]/10 bg-white px-5 py-3 text-sm font-bold text-[#063b25] shadow-sm transition hover:border-[#063b25]/20 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6b43] focus-visible:ring-offset-2";

const input =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10";

type IconName =
  | "home"
  | "membership"
  | "inbox"
  | "bell"
  | "user"
  | "settings"
  | "logout"
  | "arrow"
  | "check"
  | "clock"
  | "shield"
  | "menu"
  | "close"
  | "document"
  | "community";

const navigation: {
  path: string;
  label: string;
  icon: IconName;
  end?: boolean;
}[] = [
  {
    path: "/dashboard",
    label: "Overview",
    icon: "home",
    end: true,
  },
  {
    path: "/dashboard/membership",
    label: "Membership",
    icon: "membership",
  },
  {
    path: "/dashboard/inbox",
    label: "Chat with ASBESOC",
    icon: "inbox",
  },
  {
    path: "/dashboard/updates",
    label: "Updates & Opportunities",
    icon: "community",
  },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: "bell",
  },
  {
    path: "/dashboard/profile",
    label: "My Profile",
    icon: "user",
  },
  {
    path: "/dashboard/settings",
    label: "Account Settings",
    icon: "settings",
  },
];

/* -------------------------------------------------------------------------- */
/*                                   ICON                                     */
/* -------------------------------------------------------------------------- */

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.8 12 3l9 7.8" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );

    case "membership":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <circle cx="8" cy="11" r="2" />
          <path d="M5.8 16c.6-1.5 1.5-2.2 2.2-2.2s1.6.7 2.2 2.2" />
          <path d="M13 10h5" />
          <path d="M13 14h4" />
        </svg>
      );

    case "inbox":
      return (
        <svg {...common}>
          <path d="M4 5h16l1 10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4L4 5Z" />
          <path d="M3.5 14h5l1.5 2h4l1.5-2h5" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 5 3 8.5 7 10 4-1.5 7-5 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "document":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v5h5" />
          <path d="M10 13h5M10 17h5" />
        </svg>
      );

    case "community":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2" />
          <path d="M3 20c0-4 2.5-6 6-6s6 2 6 6" />
          <path d="M15 15c3 0 5 1.5 5 4" />
        </svg>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                              REUSABLE UI                                   */
/* -------------------------------------------------------------------------- */

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </section>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#d97706]">
          {eyebrow}
        </p>
      )}

      <h1 className="text-2xl font-black tracking-tight text-[#063b25] sm:text-3xl">
        {title}
      </h1>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function initials(name: string, email: string | null) {
  const source = name.trim() || email?.split("@")[0] || "AS";

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function firstName(user: User) {
  const name = user.displayName?.trim();

  if (!name) {
    return "Member";
  }

  return name.split(/\s+/)[0];
}

function greeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function MemberDashboard() {
  const { user } = useAuth();

  return user ? <Dashboard key={user.uid} user={user} /> : null;
}

function Dashboard({ user }: { user: User }) {
  const membership = useMembership(user.uid);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const updates = useMemberUpdates(
    membership.application?.status === "approved",
  );
  const [chat, setChat] = useState<ChatConversation | null>();
  const [chatLoadError, setChatLoadError] = useState("");
  useEffect(
    () =>
      watchMemberChat(user, setChat, (caught) =>
        setChatLoadError(chatError(caught)),
      ),
    [user],
  );
  const unreadChat =
    (chat?.lastAdminMessageAt?.toMillis() || 0) >
    (chat?.memberReadAt?.toMillis() || 0);
  const [seen, setSeen] = useState(() => {
    try {
      return (
        Number(localStorage.getItem(`asbesoc-updates-seen-${user.uid}`)) || 0
      );
    } catch {
      return 0;
    }
  });
  const unreadUpdates = updates.items.filter((item) => item.time > seen).length;
  function markUpdatesRead() {
    const time = Math.max(
      Date.now(),
      ...updates.items.map((item) => item.time),
    );
    setSeen(time);
    try {
      localStorage.setItem(`asbesoc-updates-seen-${user.uid}`, String(time));
    } catch {
      /* Read state still works for this session. */
    }
  }
  const [search, setSearch] = useState("");
  const drawer = useRef<HTMLElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lock = useRef(false);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("button, a")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
      if (event.key !== "Tab") return;
      const elements = Array.from(
        drawer.current?.querySelectorAll<HTMLElement>(
          "a,button:not(:disabled)",
        ) || [],
      );
      const first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [mobileMenuOpen]);

  async function leave() {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");

    try {
      await logout();
      navigate("/", { replace: true });
    } catch {
      setError("We could not log you out. Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const applicationPanel = membership.loading ? (
    <MembershipLoading />
  ) : membership.error ? (
    <MembershipError message={membership.error} retry={membership.retry} />
  ) : (
    <MembershipPanel application={membership.application} />
  );

  return (
    <div className="member-v2 min-h-screen text-slate-700">
      {/* Mobile top bar */}

      <div className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b25] text-sm font-black text-white">
            A
          </div>

          <div>
            <p className="text-sm font-black tracking-wide text-[#063b25]">
              ASBESOC
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Member Portal
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Open member dashboard menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
          className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 text-left text-[#063b25] shadow-sm transition hover:border-emerald-900/15 hover:bg-emerald-50/50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-[#063b25]">
            {initials(user.displayName || "", user.email)}
          </span>
          <span className="hidden min-[390px]:block">
            <span className="block max-w-[90px] truncate text-[11px] font-black leading-4 text-[#063b25]">
              {firstName(user)}
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Menu
            </span>
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 text-slate-400 transition group-hover:text-[#063b25]"
            aria-hidden="true"
          >
            <path
              d="m6 8 4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar desktop */}

        <aside className="member-sidebar sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col bg-[#052f1e] text-white lg:flex">
          <SidebarContent
            user={user}
            busy={busy}
            error={error}
            onLogout={leave}
          />
        </aside>

        {/* Mobile drawer backdrop */}

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close dashboard menu"
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside
              ref={drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Member navigation"
              className="member-sidebar relative flex h-full w-[86%] max-w-[320px] flex-col bg-[#052f1e] text-white shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close dashboard menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
              >
                <Icon name="close" />
              </button>

              <SidebarContent
                user={user}
                busy={busy}
                error={error}
                onLogout={leave}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* Main dashboard */}

        <main className="min-w-0 flex-1" key={location.pathname.split("/")[1]}>
          {/* Desktop top bar */}

          <header className="member-topbar hidden h-[82px] items-center justify-between border-b border-slate-200/80 bg-white px-8 xl:px-10 lg:flex">
            <div className="member-search">
              <label>
                <Icon name="home" />
                <input
                  aria-label="Find a dashboard section"
                  placeholder="Find a dashboard section…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              {search && (
                <div className="member-search-results">
                  {navigation
                    .filter((item) =>
                      item.label.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSearch("")}
                      >
                        {item.label}
                      </Link>
                    ))}
                  {!navigation.some((item) =>
                    item.label.toLowerCase().includes(search.toLowerCase()),
                  ) && <p>No matching sections.</p>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <NavLink
                to="/dashboard/notifications"
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#063b25]"
              >
                <Icon name="bell" />
                {unreadUpdates + Number(unreadChat) > 0 && (
                  <span className="member-count">
                    {unreadUpdates + Number(unreadChat)}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/dashboard/profile"
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-[#063b25]">
                  {initials(user.displayName || "", user.email)}
                </div>

                <div className="max-w-[190px]">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user.displayName?.trim() || "ASBESOC Member"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {user.email}
                  </p>
                </div>
              </NavLink>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 xl:py-10">
            <Routes>
              <Route
                index
                element={
                  <Overview
                    user={user}
                    application={membership.application}
                    membershipLoading={membership.loading}
                    membershipError={membership.error}
                    updates={updates}
                    unreadChat={unreadChat}
                    chatErrorMessage={chatLoadError}
                    chatLoading={chat === undefined}
                  />
                }
              />

              <Route
                path="membership"
                element={
                  <div className="mx-auto max-w-5xl">
                    <PageHeading
                      eyebrow="Membership"
                      title="Your membership journey"
                      description="Follow your application, review and certification progress with ASBESOC."
                    />

                    <div className="mt-7 space-y-6">
                      <MembershipJourney
                        application={membership.application}
                        loading={membership.loading}
                      />
                      {applicationPanel}
                    </div>
                  </div>
                }
              />

              <Route
                path="profile"
                element={
                  <div className="mx-auto max-w-5xl">
                    <PageHeading
                      eyebrow="Profile"
                      title="Personal information"
                      description="Keep your basic member profile information up to date."
                    />

                    <div className="mt-7">
                      <Profile user={user} />
                    </div>
                  </div>
                }
              />

              <Route
                path="settings"
                element={
                  <div className="mx-auto max-w-5xl">
                    <PageHeading
                      eyebrow="Security"
                      title="Account settings"
                      description="Manage your sign-in information and account security."
                    />

                    <div className="mt-7">
                      <AccountSettings user={user} />
                    </div>
                  </div>
                }
              />

              <Route path="inbox" element={<MemberChat user={user} />} />

              <Route
                path="notifications"
                element={
                  <section className="member-notifications">
                    <PageHeading
                      eyebrow="Your inbox"
                      title="Notifications"
                      description="Your membership status, private replies and community updates."
                    />
                    <div className="member-panel member-notification-summary">
                      <h2>Stay in the loop</h2>
                      <p>
                        {updates.loading
                          ? "Checking updates…"
                          : `${unreadUpdates} unread updates on this device`}
                      </p>
                      <button
                        className={secondaryButton}
                        onClick={markUpdatesRead}
                        disabled={
                          updates.loading || !!updates.error || !unreadUpdates
                        }
                      >
                        Mark updates as read
                      </button>
                      <Link className={secondaryButton} to="/dashboard/inbox">
                        {unreadChat
                          ? "Unread reply from ASBESOC"
                          : "Open private messages"}
                      </Link>
                      {chatLoadError && <p role="alert">{chatLoadError}</p>}
                      <Link
                        to="/dashboard/membership"
                        className="member-notification-status"
                      >
                        Membership ·{" "}
                        {membership.loading
                          ? "Loading…"
                          : membership.error
                            ? "Unavailable"
                            : membership.application
                              ? applicationLabel(membership.application.status)
                              : "No application submitted"}
                      </Link>
                    </div>
                    <MemberPublishedUpdates updates={updates} />
                  </section>
                }
              />

              <Route
                path="updates"
                element={<MemberPublishedUpdates updates={updates} />}
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  SIDEBAR                                   */
/* -------------------------------------------------------------------------- */

function SidebarContent({
  user,
  busy,
  error,
  onLogout,
  onNavigate,
}: {
  user: User;
  busy: boolean;
  error: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="px-6 pb-5 pt-7">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-black text-[#063b25] shadow-sm">
            A
          </div>

          <div>
            <p className="text-base font-black tracking-wide">ASBESOC</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.17em] text-emerald-200/70">
              Member Portal
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-6 h-px bg-white/10" />

      <nav
        aria-label="Member dashboard"
        className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6"
      >
        <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
          Workspace
        </p>

        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-[#063b25] shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon name={item.icon} className="h-[19px] w-[19px]" />

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#063b25]">
              {initials(user.displayName || "", user.email)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user.displayName?.trim() || "ASBESOC Member"}
              </p>
              <p className="truncate text-xs text-white/45">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onLogout}
            className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-xs font-bold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="logout" className="h-4 w-4" />
            {busy ? "Logging out…" : "Logout"}
          </button>

          {error && (
            <p role="alert" className="mt-3 text-xs leading-5 text-rose-200">
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  OVERVIEW                                  */
/* -------------------------------------------------------------------------- */

function Overview({
  user,
  application,
  membershipLoading,
  membershipError,
  updates,
  unreadChat,
  chatErrorMessage,
  chatLoading,
}: {
  user: User;
  application: Application | null;
  membershipLoading: boolean;
  membershipError: string;
  updates: MemberUpdates;
  unreadChat: boolean;
  chatErrorMessage: string;
  chatLoading: boolean;
}) {
  const status = membershipLoading
    ? "Loading…"
    : membershipError
      ? "Unavailable"
      : application
        ? applicationLabel(application.status)
        : "Not submitted";
  const steps = [
    {
      label: "Email verified",
      done: user.emailVerified,
      to: "/dashboard/settings",
    },
    {
      label: "Name added",
      done: !!user.displayName?.trim(),
      to: "/dashboard/profile",
    },
    {
      label: "Application submitted",
      done: !!application,
      to: "/dashboard/membership",
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  const percent = Math.round((completed / steps.length) * 100);
  const groups = [
    { type: "broadcast", label: "Broadcasts" },
    { type: "announcement", label: "Announcements" },
    { type: "training", label: "Trainings" },
    { type: "opportunity", label: "Opportunities" },
  ];
  return (
    <div className="member-overview">
      <div className="member-page-intro">
        <div>
          <p className="member-eyebrow">Your member workspace</p>
          <h1>
            {greeting()}, {firstName(user)}.
          </h1>
          <p>A place to connect, contribute and grow.</p>
        </div>
        <span className="member-date">
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <section className="member-welcome">
        <div>
          <span className="member-tag">
            Building a better society, together
          </span>
          <h2>
            Your next chapter
            <br />
            starts with community.
          </h2>
          <p>
            Stay close to your membership journey and discover what’s happening
            at ASBESOC.
          </p>
          <Link to="/dashboard/membership" className={primaryButton}>
            View my membership <Icon name="arrow" />
          </Link>
        </div>
        <div className="member-welcome-art" aria-hidden="true">
          <Icon name="community" className="h-24 w-24" />
          <span>Purpose. People. Progress.</span>
        </div>
      </section>
      <div className="member-stats">
        <StatusCard
          icon="membership"
          label="Membership"
          value={status}
          description="Your current application status"
        />
        <StatusCard
          icon="document"
          label="Certificate"
          value={
            membershipLoading
              ? "Loading…"
              : membershipError
                ? "Unavailable"
                : certificateLabel(getCertificateStatus(application))
          }
          description="Based on your membership record"
        />
        <StatusCard
          icon="bell"
          label="Community updates"
          value={
            updates.loading
              ? "…"
              : updates.error
                ? "—"
                : String(updates.items.length)
          }
          description="Published updates available to you"
        />
        <StatusCard
          icon="inbox"
          label="Private messages"
          value={
            chatLoading && !chatErrorMessage
              ? "Loading…"
              : chatErrorMessage
                ? "Unavailable"
                : unreadChat
                  ? "New reply"
                  : "Up to date"
          }
          description="Messages from the ASBESOC team"
        />
      </div>
      {membershipError && (
        <p role="alert" className="member-empty">
          {membershipError} Open Membership to retry.
        </p>
      )}
      <div className="member-insights">
        <section className="member-panel">
          <header className="member-panel-heading">
            <div>
              <p className="member-eyebrow">A strong foundation</p>
              <h2>Your account checklist</h2>
            </div>
            <Icon name="shield" />
          </header>
          <div className="member-readiness">
            {membershipLoading || membershipError ? (
              <p>Checklist {membershipError ? "unavailable" : "loading…"}</p>
            ) : (
              <div className="member-ring">
                <svg
                  viewBox="0 0 120 120"
                  role="img"
                  aria-label={`${completed} of 3 account steps completed`}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#edf0e5"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="#158060"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${percent * 3.016} 301.6`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <span>
                  <b>{completed}/3</b>
                  <small>steps complete</small>
                </span>
              </div>
            )}
            <ul>
              {steps.map((step) => (
                <li key={step.label}>
                  <Link to={step.to}>
                    <span className={step.done ? "done" : ""}>
                      <Icon
                        name={step.done ? "check" : "clock"}
                        className="h-4 w-4"
                      />
                    </span>
                    {step.label}
                    <Icon name="arrow" className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="member-panel">
          <header className="member-panel-heading">
            <div>
              <p className="member-eyebrow">Explore what’s available</p>
              <h2>Community bulletin</h2>
            </div>
            <Icon name="community" />
          </header>
          {updates.loading || updates.error ? (
            <p className="member-empty">
              {updates.error || "Loading updates…"}
            </p>
          ) : (
            <div className="member-bars">
              {groups.map((group) => {
                const count = updates.items.filter(
                  (item) => item.type === group.type,
                ).length;
                return (
                  <div key={group.type}>
                    <span>
                      {group.label}
                      <b>{count}</b>
                    </span>
                    <div className="member-bar-track">
                      <i
                        style={{
                          width: `${updates.items.length ? (count / updates.items.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <p>
                {updates.items.length
                  ? "Current published items for your membership audience."
                  : "No published updates yet."}
              </p>
            </div>
          )}
        </section>
      </div>
      <div className="member-next-actions">
        <NextAction
          application={application}
          loading={membershipLoading || !!membershipError}
        />
        <section className="member-panel">
          <header className="member-panel-heading">
            <h2>Make your next move</h2>
          </header>
          <div className="member-action-links">
            <Link to="/dashboard/profile">
              <Icon name="user" />
              <span>
                Keep your profile current
                <small>Update your name and contact details</small>
              </span>
              <Icon name="arrow" />
            </Link>
            <Link to="/dashboard/inbox">
              <Icon name="inbox" />
              <span>
                Talk to ASBESOC
                <small>Private support, directly from your workspace</small>
              </span>
              <Icon name="arrow" />
            </Link>
            <Link to="/dashboard/updates">
              <Icon name="community" />
              <span>
                Find an opportunity
                <small>Trainings, announcements and member updates</small>
              </span>
              <Icon name="arrow" />
            </Link>
          </div>
        </section>
      </div>
      <MemberPublishedUpdates updates={updates} compact />
      <Link to="/dashboard/updates" className={`${secondaryButton} mt-4`}>
        View all community updates <Icon name="arrow" />
      </Link>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  description,
}: {
  icon: IconName;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-lg font-black text-[#063b25]">{value}</p>

          <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#087247]">
          <Icon name={icon} />
        </div>
      </div>
    </Card>
  );
}

function MembershipJourney({
  application,
  loading,
}: {
  application: Application | null;
  loading: boolean;
}) {
  const payment = getPaymentStatus(application);
  const certificate = getCertificateStatus(application);
  const certified = isCertifiedMember(application);

  let activeStep = 0;
  if (application) activeStep = 1;
  if (application?.status === "under_review") activeStep = 1;
  if (application?.status === "approved") activeStep = 2;
  if (
    application?.status === "approved" &&
    ["unpaid", "pending", "failed"].includes(payment)
  )
    activeStep = 3;
  if (payment === "paid") activeStep = 4;
  if (certificate === "issued") activeStep = 5;
  if (certified) activeStep = 6;

  const steps = [
    "Application",
    "Review",
    "Approved",
    "Payment",
    "Certificate",
    "Certified",
  ];

  return (
    <Card className="p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d97706]">
            Membership journey
          </p>
          <h2 className="mt-1 text-xl font-black text-[#063b25]">
            Your progress
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-400">
          {loading ? "Checking progress…" : "Live status"}
        </p>
      </div>
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-[760px] items-start">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;
            return (
              <div
                key={step}
                className={`relative flex flex-1 flex-col items-center ${index === 0 ? "" : "before:absolute before:right-1/2 before:top-[17px] before:h-[2px] before:w-full"} ${index <= activeStep ? "before:bg-[#0b7046]" : "before:bg-slate-200"}`}
              >
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-xs font-black shadow-sm ${completed ? "bg-[#0b7046] text-white" : current ? "bg-[#f59e0b] text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {completed ? (
                    <Icon name="check" className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <p
                  className={`mt-3 text-center text-xs font-bold ${current || completed ? "text-[#063b25]" : "text-slate-400"}`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MEMBERSHIP PANEL                              */
/* -------------------------------------------------------------------------- */

function MembershipLoading() {
  return (
    <Card className="p-6 sm:p-7">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="mt-4 h-7 w-48 rounded bg-slate-100" />
        <div className="mt-6 h-20 rounded-2xl bg-slate-100" />
      </div>

      <p role="status" className="sr-only">
        Loading your application…
      </p>
    </Card>
  );
}

function MembershipError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <Card className="p-6 sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-600">
        Membership
      </p>

      <h2 className="mt-2 text-xl font-black text-[#063b25]">
        We couldn't load your membership
      </h2>

      <p role="alert" className="mt-3 text-sm leading-7 text-slate-500">
        {message}
      </p>

      <button className={`${primaryButton} mt-5`} onClick={retry}>
        Try again
      </button>
    </Card>
  );
}

function MembershipPanel({ application }: { application: Application | null }) {
  const statusText = application
    ? applicationLabel(application.status)
    : "Application required";

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d97706]">
              Membership
            </p>

            <h2 className="mt-1 text-xl font-black text-[#063b25]">
              Your membership
            </h2>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-black text-[#087247]">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            {statusText}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {!application ? (
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#087247]">
              <Icon name="document" />
            </div>

            <h3 className="mt-5 text-lg font-black text-[#063b25]">
              Start your membership application
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Complete your membership application so ASBESOC can review your
              request and begin your membership journey.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link className={primaryButton} to="/membership">
                Start application
                <Icon name="arrow" className="h-4 w-4" />
              </Link>

              <Link className={secondaryButton} to="/contact">
                Contact ASBESOC
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <ApplicationMessage application={application} />

            <CertificatePaymentCard application={application} />

            {application.reviewNote && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#087247] shadow-sm">
                    <Icon name="document" className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black text-[#063b25]">
                      ASBESOC review note
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                      {application.reviewNote}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <details className="group mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-[#fafcfb]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-black text-[#063b25]">
                View submitted application
                <span className="text-slate-400 transition group-open:rotate-90">
                  →
                </span>
              </summary>

              <div className="border-t border-slate-200 bg-white p-5">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  {Object.entries(application)
                    .filter(
                      ([key]) =>
                        ![
                          "userId",
                          "status",
                          "createdAt",
                          "submissionType",
                          "reviewedAt",
                          "reviewedBy",
                          "reviewNote",
                          "paymentStatus",
                          "paymentReference",
                          "paidAt",
                          "certificateStatus",
                          "certificateNumber",
                          "certificateUrl",
                          "certificateIssuedAt",
                        ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-xs font-black capitalize tracking-wide text-[#063b25]">
                          {key.replace(/([A-Z])/g, " $1")}
                        </dt>

                        <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                          {Array.isArray(value)
                            ? value.join(", ")
                            : String(value || "Not provided")}
                        </dd>
                      </div>
                    ))}
                </dl>
              </div>
            </details>
          </div>
        )}
      </div>
    </Card>
  );
}

function CertificatePaymentCard({ application }: { application: Application }) {
  const payment = getPaymentStatus(application);
  const certificate = getCertificateStatus(application);
  const approved = application.status === "approved";
  const certified = isCertifiedMember(application);

  return (
    <div className="mt-6 overflow-hidden rounded-[22px] border border-[#063b25]/10 bg-[#f8fbf9]">
      <div className="flex flex-col gap-4 border-b border-[#063b25]/10 bg-[#063b25] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/70">
            Certificate & payment
          </p>
          <h3 className="mt-1 text-lg font-black">Membership certificate</h3>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
          Fee: To be configured
        </div>
      </div>

      <div className="grid gap-px bg-slate-200/70 sm:grid-cols-2">
        <div className="bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Payment status
          </p>
          <p className="mt-2 font-black text-[#063b25]">
            {paymentLabel(payment)}
          </p>
        </div>
        <div className="bg-white p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Certificate status
          </p>
          <p className="mt-2 font-black text-[#063b25]">
            {certificateLabel(certificate)}
          </p>
        </div>
      </div>

      <div className="p-5">
        {certified ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-black text-[#063b25]">
                Certified membership active
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your payment and certificate stages are complete.
              </p>
            </div>
            {application.certificateUrl && (
              <a
                className={primaryButton}
                href={application.certificateUrl}
                target="_blank"
                rel="noreferrer"
              >
                View certificate
              </a>
            )}
          </div>
        ) : payment === "paid" ? (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
            Payment confirmed. ASBESOC is processing your membership
            certificate.
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="font-black text-[#063b25]">
                {approved ? "Certificate payment" : "Available after approval"}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {approved
                  ? "Your certificate payment stage is ready. The secure checkout will activate when the payment provider and certificate fee are configured."
                  : "Certificate payment unlocks after ASBESOC approves your membership application."}
              </p>
            </div>
            <button
              type="button"
              disabled
              className={`${primaryButton} shrink-0`}
              title={
                approved
                  ? "Payment gateway setup is pending"
                  : "Available after application approval"
              }
            >
              <Icon name="shield" className="h-4 w-4" />
              Pay for certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationMessage({ application }: { application: Application }) {
  if (application.status === "approved") {
    return (
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#087247]">
          <Icon name="check" />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#063b25]">
          Your application has been approved
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your application has passed review. Your certificate and payment stage
          is shown below. Certified membership is completed after payment
          confirmation and certificate issuance.
        </p>
      </div>
    );
  }

  if (application.status === "rejected") {
    return (
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
          <Icon name="document" />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#063b25]">
          Your application has been reviewed
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your application was not approved. Please review the note provided by
          ASBESOC below and contact the organization if you need clarification.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
        <Icon name="clock" />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#063b25]">
        Your application is under review
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-500">
        ASBESOC has received your membership application. You do not need to
        submit another application while your current application is being
        reviewed.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                NEXT STEPS                                  */
/* -------------------------------------------------------------------------- */

function NextAction({
  application,
  loading,
}: {
  application: Application | null;
  loading: boolean;
}) {
  let title = "Complete your membership application";
  let description =
    "Submit your application to begin the ASBESOC membership process.";
  let action: ReactNode = (
    <Link className={primaryButton} to="/membership">
      Start application
    </Link>
  );

  if (loading) {
    title = "Checking your account";
    description = "We are loading your latest membership information.";
    action = null;
  } else if (
    application?.status === "pending" ||
    application?.status === "under_review"
  ) {
    title = "Review in progress";
    description =
      "Your application is with ASBESOC for review. No further action is required right now.";
    action = (
      <Link className={secondaryButton} to="/dashboard/membership">
        View status
      </Link>
    );
  } else if (
    application?.status === "approved" &&
    getPaymentStatus(application) !== "paid"
  ) {
    title = "Certificate payment is next";
    description =
      "Your application is approved. Open Membership to continue to the certificate payment stage.";
    action = (
      <Link className={primaryButton} to="/dashboard/membership">
        Continue to payment <Icon name="arrow" className="h-4 w-4" />
      </Link>
    );
  } else if (
    application &&
    getPaymentStatus(application) === "paid" &&
    getCertificateStatus(application) !== "issued"
  ) {
    title = "Certificate processing";
    description =
      "Your payment is confirmed. Your membership certificate is awaiting issuance.";
    action = (
      <Link className={secondaryButton} to="/dashboard/membership">
        View certificate status
      </Link>
    );
  } else if (isCertifiedMember(application)) {
    title = "Membership complete";
    description =
      "Your certificate has been issued and your certified membership is active.";
    action = (
      <Link className={secondaryButton} to="/dashboard/membership">
        View membership
      </Link>
    );
  } else if (application?.status === "rejected") {
    title = "Review the decision";
    description =
      "Open Membership to read the ASBESOC review note and available next steps.";
    action = (
      <Link className={secondaryButton} to="/dashboard/membership">
        Review decision
      </Link>
    );
  }

  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-emerald-50/70" />
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff7e6] text-[#d97706]">
          <Icon name="arrow" />
        </div>
        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Next action
        </p>
        <h2 className="mt-2 text-xl font-black text-[#063b25]">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
          {description}
        </p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PROFILE                                   */
/* -------------------------------------------------------------------------- */

function Profile({ user }: { user: User }) {
  const { refreshUser } = useAuth();

  const [name, setName] = useState(user.displayName || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const lock = useRef(false);

  useEffect(() => {
    let active = true;

    getDocFromServer(doc(db, "profiles", user.uid))
      .then((snapshot) => {
        if (!active) return;

        if (snapshot.exists()) {
          setName(snapshot.data().fullName || "");
          setPhone(snapshot.data().phone || "");
        }

        setLoadError("");
        setLoading(false);
      })
      .catch((caught) => {
        if (active) {
          setLoadError(memberError(caught));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user.uid, revision]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lock.current || loading || loadError) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await saveMemberProfile(name, phone);

      try {
        await updateProfile(user, {
          displayName: name.trim(),
        });

        await refreshUser();

        setNotice("Your profile has been saved.");
      } catch {
        setNotice(
          "Your profile was saved, but your account display name could not be updated. Save again to retry.",
        );
      }
    } catch (caught) {
      setError(memberError(caught));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#063b25] text-base font-black text-white">
            {initials(user.displayName || "", user.email)}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-[#063b25]">
              {user.displayName?.trim() || "ASBESOC Member"}
            </h2>

            <p className="truncate text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {loading ? (
          <p role="status" className="text-sm text-slate-500">
            Loading your profile…
          </p>
        ) : loadError ? (
          <>
            <p role="alert" className="text-sm text-rose-700">
              {loadError}
            </p>

            <button
              className={`${primaryButton} mt-5`}
              onClick={() => {
                setLoading(true);
                setRevision((value) => value + 1);
              }}
            >
              Try again
            </button>
          </>
        ) : (
          <form onSubmit={save} aria-busy={busy}>
            <fieldset disabled={busy} className="max-w-2xl space-y-6">
              <legend className="sr-only">Edit your profile</legend>

              <label className="block text-sm font-bold text-[#063b25]">
                Full name
                <input
                  className={input}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                />
              </label>

              <label className="block text-sm font-bold text-[#063b25]">
                Phone number
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>
                <input
                  className={input}
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={25}
                  placeholder="+234..."
                />
              </label>

              <div className="rounded-2xl bg-[#f7faf8] p-4 text-xs leading-6 text-slate-500">
                Changing your profile information does not change a membership
                application that has already been submitted for review.
              </div>

              <button className={primaryButton} type="submit">
                {busy ? "Saving…" : "Save changes"}
              </button>
            </fieldset>
          </form>
        )}

        {error && (
          <p role="alert" className="mt-5 text-sm text-rose-700">
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            {notice}
          </p>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                             ACCOUNT SETTINGS                               */
/* -------------------------------------------------------------------------- */

function AccountSettings({ user }: { user: User }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <h2 className="text-lg font-black text-[#063b25]">
          Sign-in & security
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review your account access information.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Sign-in email
            </p>

            <p className="mt-1 break-all text-sm font-bold text-slate-700">
              {user.email}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            Primary
          </span>
        </div>

        <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Email verification
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {user.emailVerified
                ? "Your email address is verified."
                : "Email verification is required."}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
              user.emailVerified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {user.emailVerified ? "Verified" : "Action required"}
          </span>
        </div>

        <div className="px-6 py-5 sm:px-7">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
            Password
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Request a secure password-reset email if you need to change your
            password.
          </p>

          <Link className={`${secondaryButton} mt-4`} to="/forgot-password">
            Reset password
          </Link>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CHAT WITH ASBESOC                               */
/* -------------------------------------------------------------------------- */

function MemberChat({ user }: { user: User }) {
  const [conversation, setConversation] = useState<ChatConversation | null>(
    null,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(
    () =>
      watchMemberChat(user, setConversation, (caught) =>
        setError(chatError(caught)),
      ),
    [user],
  );
  const sendLock = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function connect() {
      setLoading(true);
      setError("");

      try {
        await ensureMemberChat(user);
        if (!active) return;

        unsubscribe = watchMemberMessages(
          user,
          (nextMessages) => {
            if (!active) return;
            setMessages(nextMessages);
            setLoading(false);
          },
          (caught) => {
            if (!active) return;
            setError(chatError(caught));
            setLoading(false);
          },
        );
      } catch (caught) {
        if (!active) return;
        setError(chatError(caught));
        setLoading(false);
      }
    }

    void connect();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
      block: "end",
    });
  }, [messages]);

  useEffect(() => {
    const unread =
      (conversation?.lastAdminMessageAt?.toMillis() || 0) >
      (conversation?.memberReadAt?.toMillis() || 0);
    const mark = () => {
      if (
        !loading &&
        unread &&
        messages.some(
          (item) =>
            item.senderRole === "admin" &&
            !item.pending &&
            (!item.createdAt ||
              item.createdAt.toMillis() >=
                (conversation?.lastAdminMessageAt?.toMillis() || 0)),
        ) &&
        document.visibilityState === "visible"
      )
        void markChatRead(user, user.uid).catch((caught) =>
          setError(chatError(caught)),
        );
    };
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [conversation, messages, loading, user]);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendLock.current) return;

    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    sendLock.current = true;
    setSending(true);
    setError("");

    try {
      await sendMemberMessage(user, cleanMessage);
      setMessage("");
    } catch (caught) {
      setError(chatError(caught));
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        eyebrow="Private communication"
        title="Chat with ASBESOC"
        description="Send a private message directly to the ASBESOC admin team. This conversation is visible only to your account and authorized administrators."
      />

      <Card className="mt-7 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#063b25] text-sm font-black text-white">
              A
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-400" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-[#063b25] sm:text-base">
                ASBESOC Admin
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {conversation?.status === "waiting"
                  ? "Waiting for an agent"
                  : conversation?.status === "resolved"
                    ? "Resolved · Send a message to reopen"
                    : "Private member support"}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700 sm:inline-flex">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Secure conversation
          </div>
        </div>

        <div className="bg-[#f5f8f6]">
          <div className="h-[52vh] min-h-[420px] max-h-[650px] overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p
                  role="status"
                  className="text-sm font-semibold text-slate-500"
                >
                  Opening your private conversation…
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#087247] shadow-sm">
                    <Icon name="inbox" className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-[#063b25]">
                    Start a conversation
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Send a message about your membership, application,
                    certificate or another member-related question.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => {
                  const mine = item.senderRole === "member";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[86%] flex-col sm:max-w-[72%] ${mine ? "items-end" : "items-start"}`}
                      >
                        {!mine && (
                          <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#087247]">
                            {item.senderRole === "system"
                              ? "Automatic acknowledgement"
                              : "ASBESOC Admin"}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            mine
                              ? "rounded-br-md bg-[#063b25] text-white"
                              : "rounded-bl-md border border-slate-200/80 bg-white text-slate-700"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {item.text}
                          </p>
                        </div>
                        <p className="mt-1.5 px-1 text-[10px] font-semibold text-slate-400">
                          {chatMessageTime(item)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {error && (
            <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 sm:px-6">
              <p
                role="alert"
                className="text-xs font-semibold leading-5 text-rose-700"
              >
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={send}
            className="border-t border-slate-200 bg-white p-3 sm:p-4"
          >
            <div className="flex items-end gap-2 sm:gap-3">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Message ASBESOC</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  disabled={sending || loading}
                  maxLength={4000}
                  rows={1}
                  placeholder="Write a message…"
                  className="max-h-36 min-h-12 w-full resize-none rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <button
                type="submit"
                disabled={sending || loading || !message.trim()}
                aria-label="Send message"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#063b25] text-white shadow-sm transition hover:bg-[#0a5133] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6b43] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Icon name="arrow" className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <p className="text-[10px] leading-4 text-slate-400">
                Enter to send · Shift + Enter for a new line
              </p>
              <p className="shrink-0 text-[10px] font-semibold text-slate-400">
                {message.length}/4000
              </p>
            </div>
          </form>
        </div>
      </Card>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/50 px-4 py-3.5">
        <Icon
          name="shield"
          className="mt-0.5 h-4 w-4 shrink-0 text-[#087247]"
        />
        <p className="text-xs leading-5 text-slate-500">
          Your messages are private between your member account and authorized
          ASBESOC administrators. Other members cannot access this conversation.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COMING SOON                                  */
/* -------------------------------------------------------------------------- */
