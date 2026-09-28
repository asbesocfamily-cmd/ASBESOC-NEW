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
} from "react-router-dom";
import { doc, getDocFromServer } from "firebase/firestore";
import { updateProfile, type User } from "firebase/auth";

import { useAuth } from "../contexts/useAuth";
import { useMembership } from "../contexts/useMembership";
import { db } from "../firebase/firebaseConfig";
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
/*                                   STYLES                                   */
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
  | "community"
  | "wallet"
  | "certificate"
  | "spark"
  | "lock";

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
    label: "Inbox",
    icon: "inbox",
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
/*                                    ICON                                    */
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

    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H18a2 2 0 0 1 2 2v13H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3" />
          <path d="M15 10h6v5h-6a2.5 2.5 0 0 1 0-5Z" />
          <circle cx="16" cy="12.5" r=".5" fill="currentColor" />
        </svg>
      );

    case "certificate":
      return (
        <svg {...common}>
          <path d="M6 3h12v13H6z" />
          <path d="M9 7h6M9 10h6" />
          <circle cx="12" cy="16" r="3" />
          <path d="m10.5 18.5-.5 3 2-1 2 1-.5-3" />
        </svg>
      );

    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3Z" />
          <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
        </svg>
      );

    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                               REUSABLE UI                                  */
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
      className={`rounded-[24px] border border-slate-200/70 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.045)] ${className}`}
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
        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#d97706]">
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

  if (!name) return "Member";

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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lock = useRef(false);

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

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-slate-700">
      {/* MOBILE HEADER */}

      <div className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b25] text-sm font-black text-white">
            A
          </div>

          <div>
            <p className="text-sm font-black tracking-wide text-[#063b25]">
              ASBESOC
            </p>

            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
              Member Portal
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Open dashboard menu"
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#063b25]"
        >
          <Icon name="menu" />
        </button>
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1700px]">
        {/* DESKTOP SIDEBAR */}

        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[#052f1e] text-white lg:flex">
          <SidebarContent
            user={user}
            busy={busy}
            error={error}
            onLogout={leave}
          />
        </aside>

        {/* MOBILE SIDEBAR */}

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close dashboard menu"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <aside className="relative flex h-full w-[86%] max-w-[320px] flex-col bg-[#052f1e] text-white shadow-2xl">
              <button
                type="button"
                aria-label="Close dashboard menu"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"
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

        {/* DASHBOARD */}

        <main className="min-w-0 flex-1">
          <header className="hidden h-[78px] items-center justify-between border-b border-slate-200/70 bg-white px-8 lg:flex xl:px-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">
                Association for a Better Society
              </p>

              <p className="mt-1 text-sm font-bold text-[#063b25]">
                Member Dashboard
              </p>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/dashboard/notifications"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-[#063b25]"
              >
                <Icon name="bell" className="h-[18px] w-[18px]" />
              </NavLink>

              <NavLink
                to="/dashboard/profile"
                className="ml-2 flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f1] text-sm font-black text-[#063b25]">
                  {initials(user.displayName || "", user.email)}
                </div>

                <div className="max-w-[180px]">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {user.displayName?.trim() || "ASBESOC Member"}
                  </p>

                  <p className="truncate text-[11px] text-slate-400">
                    {user.email}
                  </p>
                </div>
              </NavLink>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-9">
            <Routes>
              <Route
                index
                element={
                  <Overview
                    user={user}
                    application={membership.application}
                    loading={membership.loading}
                  />
                }
              />

              <Route
                path="membership"
                element={
                  <MembershipPage
                    application={membership.application}
                    loading={membership.loading}
                    error={membership.error}
                    retry={membership.retry}
                  />
                }
              />

              <Route
                path="profile"
                element={
                  <div className="mx-auto max-w-5xl">
                    <PageHeading
                      eyebrow="Profile"
                      title="Personal information"
                      description="Keep your contact and account information up to date."
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

              <Route
                path="inbox"
                element={
                  <ComingSoon
                    icon="inbox"
                    eyebrow="Communication"
                    title="Inbox"
                    heading="Your member inbox"
                    description="Official ASBESOC messages, opportunities and private member communication will appear here."
                  />
                }
              />

              <Route
                path="notifications"
                element={
                  <ComingSoon
                    icon="bell"
                    eyebrow="Updates"
                    title="Notifications"
                    heading="Nothing new right now"
                    description="Important account, membership and ASBESOC updates will appear here."
                  />
                }
              />

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
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
      <div className="px-5 pb-5 pt-6">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-[#063b25] shadow-sm">
            A
          </div>

          <div>
            <p className="text-[15px] font-black tracking-wide">ASBESOC</p>

            <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-emerald-100/50">
              Member Portal
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-5 h-px bg-white/10" />

      <nav
        aria-label="Member dashboard"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
      >
        <p className="mb-3 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
          Workspace
        </p>

        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                isActive
                  ? "bg-white text-[#063b25] shadow-sm"
                  : "text-white/65 hover:bg-white/[0.08] hover:text-white"
              }`
            }
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-[#063b25]">
              {initials(user.displayName || "", user.email)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">
                {user.displayName?.trim() || "ASBESOC Member"}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-white/40">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onLogout}
            className="mt-4 flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[11px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <Icon name="logout" className="h-4 w-4" />
            {busy ? "Logging out…" : "Sign out"}
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
  loading,
}: {
  user: User;
  application: Application | null;
  loading: boolean;
}) {
  const certified = isCertifiedMember(application);

  const membershipStatus = loading
    ? "Checking"
    : certified
      ? "Certified member"
      : application
        ? applicationLabel(application.status)
        : "Not started";

  const certificateStatus = loading
    ? "Checking"
    : certificateLabel(getCertificateStatus(application));

  return (
    <div className="mx-auto max-w-[1180px]">
      {/* HERO */}

      <section className="relative overflow-hidden rounded-[28px] bg-[#063b25] px-6 py-7 text-white shadow-[0_18px_50px_rgba(6,59,37,0.12)] sm:px-8 sm:py-9">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[42px] border-white/[0.035]" />
        <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-emerald-400/[0.04]" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
              Member workspace
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-4xl">
              {greeting()}, {firstName(user)}.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
              Manage your ASBESOC account, membership progress and member
              services from one secure place.
            </p>
          </div>

          <Link
            to="/dashboard/profile"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-xs font-bold text-white transition hover:bg-white/[0.13]"
          >
            Manage profile
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FINTECH STATUS CARDS */}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <DashboardStatusCard
          icon="shield"
          label="Account status"
          value={user.emailVerified ? "Verified" : "Action required"}
          detail={
            user.emailVerified
              ? "Your account is secure and verified."
              : "Email verification is required."
          }
        />

        <DashboardStatusCard
          icon="membership"
          label="Membership status"
          value={membershipStatus}
          detail="Current ASBESOC membership stage."
        />

        <DashboardStatusCard
          icon="certificate"
          label="Certificate status"
          value={certificateStatus}
          detail="Your membership certificate progress."
        />
      </div>

      {/* NEXT ACTION + QUICK ACCESS */}

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <NextAction application={application} loading={loading} />

        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#d97706]">
                Quick access
              </p>

              <h2 className="mt-2 text-xl font-black text-[#063b25]">
                Your workspace
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
              <Icon name="spark" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MiniAction
              icon="membership"
              title="Membership"
              to="/dashboard/membership"
            />

            <MiniAction
              icon="user"
              title="My profile"
              to="/dashboard/profile"
            />

            <MiniAction
              icon="inbox"
              title="Inbox"
              to="/dashboard/inbox"
            />

            <MiniAction
              icon="settings"
              title="Security"
              to="/dashboard/settings"
            />
          </div>
        </Card>
      </div>

      {/* MEMBER COMMUNICATION */}

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
              <Icon name="inbox" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Inbox
              </p>

              <h3 className="mt-2 font-black text-[#063b25]">
                Member communication
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Official messages and eligible member opportunities will be
                delivered through your private inbox.
              </p>

              <Link
                to="/dashboard/inbox"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#087247]"
              >
                Open inbox
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#d97706]">
              <Icon name="bell" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Updates
              </p>

              <h3 className="mt-2 font-black text-[#063b25]">
                Stay informed
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Account and membership updates will appear in your notification
                centre.
              </p>

              <Link
                to="/dashboard/notifications"
                className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#087247]"
              >
                View notifications
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function DashboardStatusCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 truncate text-lg font-black text-[#063b25]">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
          <Icon name={icon} />
        </div>
      </div>
    </Card>
  );
}

function MiniAction({
  icon,
  title,
  to,
}: {
  icon: IconName;
  title: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[#fafcfb] p-4 transition hover:border-[#063b25]/15 hover:bg-[#f4f9f6]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#087247] shadow-sm">
          <Icon name={icon} className="h-[17px] w-[17px]" />
        </div>

        <span className="text-xs font-black text-[#063b25]">{title}</span>
      </div>

      <Icon
        name="arrow"
        className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#063b25]"
      />
    </Link>
  );
}

function NextAction({
  application,
  loading,
}: {
  application: Application | null;
  loading: boolean;
}) {
  let title = "Complete your membership application";
  let description =
    "Start your application to begin your ASBESOC membership journey.";
  let action: ReactNode = (
    <Link to="/membership" className={primaryButton}>
      Start application
      <Icon name="arrow" className="h-4 w-4" />
    </Link>
  );

  if (loading) {
    title = "Checking your account";
    description = "We're loading your latest membership information.";
    action = null;
  } else if (application?.status === "pending") {
    title = "Your application has been received";
    description =
      "No action is required right now. ASBESOC will update your status after review.";
    action = (
      <Link to="/dashboard/membership" className={secondaryButton}>
        View status
      </Link>
    );
  } else if (application?.status === "under_review") {
    title = "Review in progress";
    description =
      "Your application is currently being reviewed by ASBESOC.";
    action = (
      <Link to="/dashboard/membership" className={secondaryButton}>
        View progress
      </Link>
    );
  } else if (application?.status === "approved") {
    const paymentStatus = getPaymentStatus(application);
    const certificateStatus = getCertificateStatus(application);

    if (certificateStatus === "issued") {
      title = "Membership certificate issued";
      description =
        "Your certificate has been issued. Open Membership to view your certification information.";
    } else if (paymentStatus === "paid") {
      title = "Certificate is being prepared";
      description =
        "Your payment has been confirmed. ASBESOC will complete certificate issuance.";
    } else if (paymentStatus === "pending") {
      title = "Payment confirmation in progress";
      description =
        "Your certificate payment is being processed. Check Membership for the latest status.";
    } else {
      title = "You're approved";
      description =
        "The next stage is payment for your ASBESOC membership certificate.";
    }

    action = (
      <Link to="/dashboard/membership" className={primaryButton}>
        Continue
        <Icon name="arrow" className="h-4 w-4" />
      </Link>
    );
  } else if (application?.status === "rejected") {
    title = "Review your decision";
    description =
      "Open your Membership section to read the review information provided by ASBESOC.";
    action = (
      <Link to="/dashboard/membership" className={secondaryButton}>
        Review decision
      </Link>
    );
  }

  return (
    <Card className="relative overflow-hidden p-6 sm:p-7">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[100px] bg-[#f4f9f6]" />

      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#063b25] text-white shadow-sm">
          <Icon name="arrow" />
        </div>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.17em] text-[#d97706]">
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
/*                              MEMBERSHIP PAGE                               */
/* -------------------------------------------------------------------------- */

function MembershipPage({
  application,
  loading,
  error,
  retry,
}: {
  application: Application | null;
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeading
        eyebrow="Membership"
        title="Your membership"
        description="Track your application, approval, certificate payment and certification from one place."
      />

      <div className="mt-7">
        <MembershipJourney application={application} loading={loading} />
      </div>

      {loading ? (
        <div className="mt-6">
          <MembershipLoading />
        </div>
      ) : error ? (
        <div className="mt-6">
          <MembershipError message={error} retry={retry} />
        </div>
      ) : !application ? (
        <div className="mt-6">
          <MembershipPanel application={null} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <MembershipPanel application={application} />
            <CertificatePaymentCard application={application} />
          </div>

          <div className="mt-6">
            <ApplicationDetails application={application} />
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           MEMBERSHIP JOURNEY                               */
/* -------------------------------------------------------------------------- */

function MembershipJourney({
  application,
  loading,
}: {
  application: Application | null;
  loading: boolean;
}) {
  const paymentStatus = getPaymentStatus(application);
  const certificateStatus = getCertificateStatus(application);

  let activeStep = 0;

  if (application) {
    if (
      application.status === "pending" ||
      application.status === "under_review"
    ) {
      activeStep = 1;
    }

    if (application.status === "approved") {
      activeStep = 3;
    }

    if (application.status === "rejected") {
      activeStep = 1;
    }

    if (paymentStatus === "paid") {
      activeStep = 4;
    }

    if (certificateStatus === "issued") {
      activeStep = 5;
    }
  }

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
          <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#d97706]">
            Progress
          </p>

          <h2 className="mt-2 text-xl font-black text-[#063b25]">
            Membership journey
          </h2>
        </div>

        <span className="w-fit rounded-full bg-[#f4f9f6] px-3 py-2 text-[11px] font-bold text-[#087247]">
          {loading ? "Checking progress…" : "Current status"}
        </span>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="flex min-w-[720px] items-start">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;

            return (
              <div
                key={step}
                className={`relative flex flex-1 flex-col items-center ${
                  index === 0
                    ? ""
                    : "before:absolute before:right-1/2 before:top-[17px] before:h-[2px] before:w-full"
                } ${
                  index <= activeStep
                    ? "before:bg-[#0b7046]"
                    : "before:bg-slate-200"
                }`}
              >
                <div
                  className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-xs font-black shadow-sm ${
                    completed
                      ? "bg-[#0b7046] text-white"
                      : current
                        ? "bg-[#f59e0b] text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? (
                    <Icon name="check" className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                <p
                  className={`mt-3 text-center text-[11px] font-bold ${
                    current || completed
                      ? "text-[#063b25]"
                      : "text-slate-400"
                  }`}
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
/*                             MEMBERSHIP PANEL                               */
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
        Loading membership…
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
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
        Membership
      </p>

      <h2 className="mt-2 text-xl font-black text-[#063b25]">
        We couldn't load your membership
      </h2>

      <p role="alert" className="mt-3 text-sm leading-7 text-slate-500">
        {message}
      </p>

      <button type="button" className={`${primaryButton} mt-5`} onClick={retry}>
        Try again
      </button>
    </Card>
  );
}

function MembershipPanel({
  application,
}: {
  application: Application | null;
}) {
  if (!application) {
    return (
      <Card className="p-6 sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
          <Icon name="document" />
        </div>

        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.17em] text-[#d97706]">
          Get started
        </p>

        <h2 className="mt-2 text-xl font-black text-[#063b25]">
          Apply for membership
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Complete the ASBESOC membership application to begin the review
          process.
        </p>

        <Link className={`${primaryButton} mt-6`} to="/membership">
          Start application
          <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#d97706]">
              Application
            </p>

            <h2 className="mt-2 text-xl font-black text-[#063b25]">
              Review status
            </h2>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf7f1] px-3.5 py-2 text-[11px] font-black text-[#087247]">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            {applicationLabel(application.status)}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <ApplicationMessage application={application} />

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
      </div>
    </Card>
  );
}

function ApplicationMessage({
  application,
}: {
  application: Application;
}) {
  if (application.status === "approved") {
    return (
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#087247]">
          <Icon name="check" />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#063b25]">
          Application approved
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your membership application has been approved. Continue with the
          certificate stage shown beside this section.
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
          Application reviewed
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your application was not approved. Review the information provided
          by ASBESOC and contact the organization if you need clarification.
        </p>
      </div>
    );
  }

  if (application.status === "under_review") {
    return (
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <Icon name="clock" />
        </div>

        <h3 className="mt-5 text-lg font-black text-[#063b25]">
          Review in progress
        </h3>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          ASBESOC is currently reviewing your application. Your status will
          update here when a decision is made.
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
        Application received
      </h3>

      <p className="mt-2 text-sm leading-7 text-slate-500">
        Your application has been received and is waiting for review.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        CERTIFICATE + PAYMENT                               */
/* -------------------------------------------------------------------------- */

function CertificatePaymentCard({
  application,
}: {
  application: Application;
}) {
  const paymentStatus = getPaymentStatus(application);
  const certificateStatus = getCertificateStatus(application);
  const approved = application.status === "approved";
  const certified = isCertifiedMember(application);

  const [notice, setNotice] = useState("");

  function beginPayment() {
    /*
     * IMPORTANT:
     * This is intentionally not marking the user as paid.
     *
     * The real payment provider will be connected here.
     * Payment confirmation must be verified securely before
     * Firestore is updated to "paid".
     */

    setNotice(
      "The secure certificate payment checkout is being configured. Your approval is saved and you will not need to reapply.",
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-[#063b25] px-6 py-6 text-white sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-emerald-100/60">
              Certificate & payment
            </p>

            <h2 className="mt-2 text-xl font-black">
              Membership certificate
            </h2>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
            <Icon name="certificate" />
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f7faf8] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Certificate fee
            </p>

            <p className="mt-2 text-base font-black text-[#063b25]">
              To be configured
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7faf8] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Payment
            </p>

            <p className="mt-2 text-sm font-black text-[#063b25]">
              {paymentLabel(paymentStatus)}
            </p>
          </div>

          <div className="rounded-2xl bg-[#f7faf8] p-4 sm:col-span-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Certificate status
            </p>

            <p className="mt-2 text-sm font-black text-[#063b25]">
              {certificateLabel(certificateStatus)}
            </p>
          </div>
        </div>

        {!approved && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Icon name="lock" className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />

            <div>
              <p className="text-sm font-black text-slate-700">
                Payment locked
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-500">
                Certificate payment becomes available after your application
                is approved.
              </p>
            </div>
          </div>
        )}

        {approved &&
          paymentStatus !== "paid" &&
          paymentStatus !== "pending" && (
            <button
              type="button"
              onClick={beginPayment}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#063b25] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0a5133]"
            >
              <Icon name="wallet" className="h-5 w-5" />
              Pay for Membership Certificate
            </button>
          )}

        {paymentStatus === "pending" && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-900">
              Payment confirmation pending
            </p>

            <p className="mt-1 text-xs leading-6 text-amber-800">
              Your payment is being processed. Please wait for confirmation.
            </p>
          </div>
        )}

        {paymentStatus === "paid" && certificateStatus !== "issued" && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-900">
              Payment confirmed
            </p>

            <p className="mt-1 text-xs leading-6 text-emerald-800">
              Your certificate is now awaiting issuance.
            </p>
          </div>
        )}

        {certified && (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#087247]">
                <Icon name="check" />
              </div>

              <div>
                <p className="font-black text-[#063b25]">
                  Certified member
                </p>

                <p className="mt-1 text-xs text-emerald-800">
                  Your membership certificate has been issued.
                </p>
              </div>
            </div>

            {application.certificateNumber && (
              <div className="mt-4 border-t border-emerald-100 pt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                  Certificate number
                </p>

                <p className="mt-1 text-sm font-black text-[#063b25]">
                  {application.certificateNumber}
                </p>
              </div>
            )}

            {application.certificateUrl && (
              <a
                href={application.certificateUrl}
                target="_blank"
                rel="noreferrer"
                className={`${primaryButton} mt-5 w-full`}
              >
                View certificate
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-[#fff7e8] px-4 py-3 text-xs font-semibold leading-6 text-amber-900"
          >
            {notice}
          </p>
        )}

        <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-5">
          <Icon
            name="shield"
            className="mt-0.5 h-4 w-4 shrink-0 text-[#087247]"
          />

          <p className="text-[11px] leading-5 text-slate-400">
            Payment will only be marked as confirmed after secure verification.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                           APPLICATION DETAILS                              */
/* -------------------------------------------------------------------------- */

function ApplicationDetails({
  application,
}: {
  application: Application;
}) {
  const hiddenFields = [
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
  ];

  return (
    <Card className="overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Records
            </p>

            <p className="mt-1 text-sm font-black text-[#063b25]">
              View submitted application
            </p>
          </div>

          <span className="text-slate-400 transition group-open:rotate-90">
            →
          </span>
        </summary>

        <div className="border-t border-slate-100 bg-[#fafcfb] p-6 sm:p-7">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {Object.entries(application)
              .filter(([key]) => !hiddenFields.includes(key))
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
              type="button"
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
            <fieldset
              disabled={busy}
              className="max-w-2xl space-y-6"
            >
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
    <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
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
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Sign-in email
              </p>

              <p className="mt-2 break-all text-sm font-bold text-slate-700">
                {user.email}
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
              Primary
            </span>
          </div>

          <div className="flex flex-col justify-between gap-3 px-6 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                Verification
              </p>

              <p className="mt-2 text-sm font-bold text-slate-700">
                {user.emailVerified
                  ? "Your email address is verified."
                  : "Email verification is required."}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-[11px] font-bold ${
                user.emailVerified
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {user.emailVerified ? "Verified" : "Action required"}
            </span>
          </div>

          <div className="px-6 py-5 sm:px-7">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Password
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Request a secure password-reset email if you need to change your
              password.
            </p>

            <Link
              className={`${secondaryButton} mt-4`}
              to="/forgot-password"
            >
              Reset password
            </Link>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
          <Icon name="shield" />
        </div>

        <h2 className="mt-5 text-lg font-black text-[#063b25]">
          Secure account
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Your account uses Firebase Authentication to protect access to your
          private ASBESOC member area.
        </p>

        <div className="mt-6 rounded-2xl bg-[#f7faf8] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Account status
          </p>

          <p className="mt-2 text-sm font-black text-[#063b25]">
            {user.emailVerified ? "Verified account" : "Verification required"}
          </p>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                COMING SOON                                 */
/* -------------------------------------------------------------------------- */

function ComingSoon({
  icon,
  eyebrow,
  title,
  heading,
  description,
  action,
}: {
  icon: IconName;
  eyebrow: string;
  title: string;
  heading: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        description="Your private ASBESOC member space."
      />

      <Card className="mt-7 overflow-hidden">
        <div className="p-7 sm:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf7f1] text-[#087247]">
            <Icon name={icon} className="h-6 w-6" />
          </div>

          <h2 className="mt-6 text-xl font-black text-[#063b25] sm:text-2xl">
            {heading}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            {description}
          </p>

          {action && <div className="mt-6">{action}</div>}
        </div>

        <div className="border-t border-slate-100 bg-[#fafcfb] px-7 py-4 sm:px-10">
          <p className="text-[11px] font-semibold text-slate-400">
            This area is ready for the next stage of the member portal.
          </p>
        </div>
      </Card>
    </div>
  );
}