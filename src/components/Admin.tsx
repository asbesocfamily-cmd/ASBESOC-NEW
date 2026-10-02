import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { NavLink } from "react-router-dom";
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocsFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

import { ADMIN_UID } from "../firebase/membership";
import ApplicationReview from "./ApplicationReview";
import {
  saveSitePage,
  siteContentDefaults,
  watchSitePage,
  type SitePageContent,
  type SitePageId,
} from "../firebase/siteContent";
import {
  createMemberPost,
  deleteMemberPost,
  updateMemberPost,
  watchMemberPosts,
  type MemberPost,
  type MemberPostType,
} from "../firebase/memberContent";
const PAGE_SIZE = 20;

const sections = [
  {
    id: "membershipApplications",
    label: "Membership",
    description: "Membership applications",
  },
  {
    id: "supportRequests",
    label: "Support",
    description: "Offers of support",
  },
  {
    id: "partnershipRequests",
    label: "Partnership",
    description: "Partnership enquiries",
  },
] as const;

type Section = (typeof sections)[number];
type Cursor = QueryDocumentSnapshot<DocumentData>;

type Submission = {
  id: string;
  data: Record<string, unknown>;
};

type AdminView =
  | "overview"
  | "website"
  | "membershipApplications"
  | "memberChats"
  | "memberFeed"
  | "trainings"
  | "supportRequests"
  | "partnershipRequests"
  | "gallery"
  | "settings";

const adminViews: { id: AdminView; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Admin control centre" },
  { id: "website", label: "Website Content", description: "Public website content" },
  { id: "membershipApplications", label: "Membership", description: "Applications and reviews" },
  { id: "memberChats", label: "Member Chats", description: "Private member conversations" },
  { id: "memberFeed", label: "Member Feed", description: "Announcements and updates" },
  { id: "trainings", label: "Trainings & Opportunities", description: "Private member opportunities" },
  { id: "supportRequests", label: "Support", description: "Offers of support" },
  { id: "partnershipRequests", label: "Partnerships", description: "Partnership enquiries" },
  { id: "gallery", label: "Gallery / Media", description: "Website media management" },
  { id: "settings", label: "Site Settings", description: "Website configuration" },
];

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

const buttonStyle =
  "inline-flex min-h-11 items-center justify-center rounded-xl " +
  "border border-emerald-900/15 bg-white px-4 py-2 text-sm " +
  "font-semibold text-[#063b25] transition hover:bg-emerald-50 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  focusStyle;

const inputStyle =
  "block min-h-12 w-full rounded-xl border border-slate-300 " +
  "bg-white px-4 py-3 text-base text-slate-800 outline-none " +
  "focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

const fieldLabels: Record<string, string> = {
  fullName: "Full name",
  dateOfBirth: "Date of birth",
  gender: "Gender",
  phone: "Phone number",
  email: "Email address",
  nationality: "Nationality",
  residentialAddress: "Residential address",
  country: "Country",
  state: "State",
  lga: "Local Government Area",
  region: "State / Province / Region",
  city: "City / District",
  occupation: "Occupation / Profession",
  qualification: "Educational qualification",
  reasonForJoining: "Reason for joining",
  membershipInterests: "Membership interests",
  skills: "Skills / Experience",
  referralSource: "How they heard about ASBESOC",
  fullNameOrOrganization: "Name / Organization",
  supportType: "Type of support",
  anonymous: "Anonymous support",
  supportDescription: "Support description",
  message: "Additional information",
  organization: "Organization",
  organizationType: "Organization type",
  contactPerson: "Contact person",
  jobTitle: "Position / Job title",
  website: "Website / Social media",
  areasOfInterest: "Areas of interest",
  partnershipMethods: "Partnership methods",
  status: "Status",
  createdAt: "Submitted",
  submissionType: "Submission type",
};

function errorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return "";
}

function displayValue(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.map(displayValue).join(", ")
      : "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string") {
    return value.trim() || "Not provided";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value === null || value === undefined) {
    return "Not provided";
  }

  return JSON.stringify(value) || "Not provided";
}

function submissionName(data: Record<string, unknown>) {
  if (
    data.submissionType === "support" &&
    data.anonymous === true
  ) {
    return "Anonymous supporter";
  }

  for (const key of [
    "fullName",
    "organization",
    "fullNameOrOrganization",
    "contactPerson",
  ]) {
    const value = data[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "Unnamed submission";
}

function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("overview");

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setCheckingSession(false);
      },
      () => {
        setUser(null);
        setCheckingSession(false);
        setSessionError(
          "We could not check your session. Please reload this page.",
        );
      },
    );
  }, []);

  async function logout() {
    if (signingOut) return;

    setSigningOut(true);
    setSessionError("");

    try {
      await signOut(auth);
    } catch {
      setSessionError(
        "Sign out failed. Please check your connection and try again.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f7f3] px-4">
        <p role="status" className="text-sm font-semibold text-[#063b25]">
          Checking your session…
        </p>
      </main>
    );
  }

  if (!user) {
    return <AdminLogin sessionError={sessionError} />;
  }

  if (user.uid !== ADMIN_UID) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f7f3] px-4 py-10">
        <section className="w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-lg">
          <h1 className="text-2xl font-black text-[#063b25]">
            Admin access required
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            This account does not have permission to access
            ASBESOC submissions. Sign out and use the authorized
            admin account.
          </p>

          {sessionError && (
            <p role="alert" className="mt-4 text-sm text-rose-700">
              {sessionError}
            </p>
          )}

          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            className={`${buttonStyle} mt-6 w-full`}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </section>
      </main>
    );
  }

  if (!user.emailVerified) {
    return <main className="min-h-[70vh] bg-[#f3f7f3] px-4 py-12"><section className="mx-auto max-w-lg space-y-5 rounded-3xl bg-white p-8 text-[#063b25]"><h1 className="text-2xl font-bold">Verify your administrator email</h1><p>Verify your account email before accessing membership records or making review decisions.</p><NavLink to="/verify-email" className={buttonStyle}>Verify email</NavLink><p className="text-sm">After verification, return to the admin page. If needed, sign out and sign in again.</p><button className={buttonStyle} disabled={signingOut} onClick={logout}>Sign out</button>{sessionError && <p role="alert">{sessionError}</p>}</section></main>;
  }

  const submissionSection = sections.find((section) => section.id === activeView);

  return (
    <main className="min-h-screen bg-[#f3f7f3] text-slate-800">
      <header className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">ASBESOC Nigeria</p>
            <h1 className="mt-1 text-xl font-black text-[#063b25] sm:text-2xl">Admin Control Centre</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NavLink to="/" className={buttonStyle}>View website</NavLink>
            <button type="button" onClick={logout} disabled={signingOut} className={buttonStyle}>
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <aside className="h-fit rounded-3xl border border-emerald-900/10 bg-white p-3 shadow-sm lg:sticky lg:top-6">
          <div className="rounded-2xl bg-[#063b25] p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Administration</p>
            <p className="mt-2 text-lg font-black">Website Control Centre</p>
            <p className="mt-2 break-all text-xs leading-5 text-white/65">{user.email || "ASBESOC administrator"}</p>
          </div>
          <nav aria-label="Admin control centre" className="mt-3 space-y-1">
            {adminViews.map((item) => {
              const selected = activeView === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveView(item.id)} aria-pressed={selected}
                  className={`w-full rounded-xl px-4 py-3 text-left transition ${focusStyle} ${selected ? "bg-emerald-50 text-[#063b25]" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{item.description}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {sessionError && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{sessionError}</p>}

          {activeView === "overview" && <AdminOverview onOpen={setActiveView} />}
          {activeView === "memberChats" && <AdminMemberChats adminUser={user} />}
          {submissionSection && (
            <SubmissionList key={`${user.uid}-${submissionSection.id}`} section={submissionSection} />
          )}
          {activeView === "website" && <WebsiteContentManager />}
          {activeView === "memberFeed" && <MemberContentManager defaultType="announcement" />}
          {activeView === "trainings" && <MemberContentManager defaultType="training" />}
          {activeView === "gallery" && <WebsiteContentManager initialPage="gallery" />}
          {activeView === "settings" && <WebsiteContentManager initialPage="footer" />}
        </div>
      </div>
    </main>
  );
}

function AdminOverview({ onOpen }: { onOpen: (view: AdminView) => void }) {
  const cards: { id: AdminView; title: string; text: string; ready: boolean }[] = [
    { id: "membershipApplications", title: "Membership", text: "Review membership applications and decisions.", ready: true },
    { id: "memberChats", title: "Member Chats", text: "Reply privately to members in real time.", ready: true },
    { id: "supportRequests", title: "Support", text: "Review support offers submitted from the website.", ready: true },
    { id: "partnershipRequests", title: "Partnerships", text: "Review partnership enquiries.", ready: true },
    { id: "website", title: "Website Content", text: "Public website content controls are the next stage.", ready: false },
    { id: "memberFeed", title: "Member Feed", text: "Private announcements will be connected next.", ready: false },
  ];
  return (
    <section>
      <div className="rounded-3xl bg-[#063b25] px-6 py-7 text-white sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Admin overview</p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Welcome back.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">Manage ASBESOC membership, member communication and website operations from one control centre.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <button key={card.id} type="button" onClick={() => onOpen(card.id)} className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${focusStyle}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-black text-[#063b25]">{card.title}</h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${card.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{card.ready ? "Active" : "Next stage"}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function AdminLogin({
  sessionError,
}: {
  sessionError: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const loginLock = useRef(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loginLock.current) return;

    loginLock.current = true;
    setBusy(true);
    setError("");

    try {
      await setPersistence(auth, browserSessionPersistence);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
    } catch (caughtError) {
      const code = errorCode(caughtError);

      if (code === "auth/too-many-requests") {
        setError(
          "Too many attempts. Please wait before trying again.",
        );
      } else if (code === "auth/network-request-failed") {
        setError(
          "Please check your internet connection and try again.",
        );
      } else {
        setError(
          "Unable to sign in. Check your admin email and password.",
        );
      }
    } finally {
      loginLock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f7f3] px-4 py-10 text-slate-800">
      <section className="w-full max-w-md overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white shadow-[0_24px_70px_rgba(6,59,37,0.10)]">
        <div className="bg-[#063b25] px-7 py-8 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
            ASBESOC Nigeria
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Admin sign in
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/80">
            Access your membership, support and partnership
            submissions.
          </p>
        </div>

        <form onSubmit={login} className="p-7">
          <fieldset disabled={busy} className="space-y-5">
            <legend className="sr-only">Admin credentials</legend>

            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold text-[#063b25]"
              >
                Email address
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-[#063b25]"
              >
                Password
              </label>

              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputStyle}
              />
            </div>

            {(error || sessionError) && (
              <p
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"
              >
                {error || sessionError}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className={`min-h-12 w-full rounded-xl bg-[#063b25] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 ${focusStyle}`}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </fieldset>

          <div className="mt-6 text-center">
            <NavLink
              to="/"
              className={`rounded px-2 py-1 text-sm font-semibold text-emerald-800 underline underline-offset-4 ${focusStyle}`}
            >
              Back to website
            </NavLink>
          </div>
        </form>
      </section>
    </main>
  );
}

function SubmissionList({ section }: { section: Section }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const [cursors, setCursors] = useState<(Cursor | null)[]>([null]);
  const [lastDocument, setLastDocument] = useState<Cursor | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const currentCursor = cursors[cursors.length - 1];

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError("");
      setRows([]);
      setHasMore(false);
      setLastDocument(null);

      try {
        const source = collection(db, section.id);

        const pageQuery = currentCursor
          ? query(
              source,
              orderBy("createdAt", "desc"),
              startAfter(currentCursor),
              limit(PAGE_SIZE + 1),
            )
          : query(
              source,
              orderBy("createdAt", "desc"),
              limit(PAGE_SIZE + 1),
            );

        const snapshot = await getDocsFromServer(pageQuery);

        if (cancelled) return;

        const documents = snapshot.docs.slice(0, PAGE_SIZE);

        setRows(
          documents.map((document) => ({
            id: document.id,
            data: document.data(),
          })),
        );

        setLastDocument(documents[documents.length - 1] ?? null);
        setHasMore(snapshot.docs.length > PAGE_SIZE);
      } catch (caughtError) {
        if (cancelled) return;

        setError(
          errorCode(caughtError) === "permission-denied"
            ? "Access was denied. Check that the published Firestore rules contain your admin UID."
            : "Could not load submissions. Check your connection and press Refresh.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPage();

    return () => {
      cancelled = true;
    };
  }, [section.id, currentCursor, revision]);

  function refresh() {
    setCursors([null]);
    setRevision((current) => current + 1);
  }

  return (
    <section
      aria-labelledby="admin-inbox-heading"
      aria-busy={loading}
      className="mt-6 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-7">
        <div>
          <h2
            id="admin-inbox-heading"
            className="text-lg font-bold text-[#063b25]"
          >
            {section.description}
          </h2>

          <p className="mt-1 text-xs leading-6 text-slate-500">
            Newest first · Up to {PAGE_SIZE} submissions per page
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className={buttonStyle}
        >
          Refresh
        </button>
      </div>

      <div className="p-5 sm:p-7">
        {loading ? (
          <p role="status" className="py-10 text-center text-sm text-slate-500">
            Loading submissions…
          </p>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-7 text-rose-800"
          >
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p role="status" className="py-10 text-center text-sm text-slate-500">
            No submissions on this page.
          </p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <details
                key={row.id}
                className="group overflow-hidden rounded-2xl border border-slate-200"
              >
                <summary
                  className={`cursor-pointer bg-[#f8faf7] px-5 py-4 ${focusStyle}`}
                >
                  <span className="ml-1 font-bold text-[#063b25]">
                    {submissionName(row.data)}
                  </span>

                  <span className="mt-2 block break-words text-xs leading-6 text-slate-500">
                    {displayValue(row.data.email)}
                    {" · "}
                    {displayValue(row.data.createdAt)}
                  </span>

                  <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-900">
                    {displayValue(row.data.status)}
                  </span>

                  <span className="ml-3 text-xs text-emerald-800 group-open:hidden">
                    Open details
                  </span>
                </summary>

                <div className="border-t border-slate-200 p-5">
                  <dl className="grid min-w-0 gap-5 sm:grid-cols-2">
                    {Object.entries(row.data).map(([field, value]) => (
                      <div key={field} className="min-w-0">
                        <dt className="text-xs font-bold text-emerald-800">
                          {fieldLabels[field] || field}
                        </dt>

                        <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                          {displayValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {section.id === "membershipApplications" && <ApplicationReview id={row.id} status={String(row.data.status)} linked={typeof row.data.userId === "string"} onSaved={refresh} />}

                  <p className="mt-6 break-all border-t border-slate-100 pt-4 text-xs text-slate-400">
                    Reference: {row.id}
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={loading || cursors.length === 1}
            onClick={() => {
              setCursors((current) => current.slice(0, -1));
            }}
            className={buttonStyle}
          >
            ← Previous
          </button>

          <p className="text-xs text-slate-500">
            Page {cursors.length}
          </p>

          <button
            type="button"
            disabled={loading || !hasMore || !lastDocument}
            onClick={() => {
              if (lastDocument) {
                setCursors((current) => [...current, lastDocument]);
              }
            }}
            className={buttonStyle}
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}


function AdminMemberChats({ adminUser }: { adminUser: User }) {
  type ChatRow = {
    id: string;
    memberName: string;
    memberEmail: string;
    updatedAt?: Timestamp | null;
  };
  type MessageRow = {
    id: string;
    senderRole: "member" | "admin";
    text: string;
    createdAt?: Timestamp | null;
  };

  const [chats, setChats] = useState<ChatRow[]>([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const chatsQuery = query(collection(db, "memberChats"), orderBy("updatedAt", "desc"));
    return onSnapshot(chatsQuery, (snapshot) => {
      const next = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          memberName: typeof data.memberName === "string" ? data.memberName : "ASBESOC Member",
          memberEmail: typeof data.memberEmail === "string" ? data.memberEmail : "",
          updatedAt: data.updatedAt ?? null,
        };
      });
      setChats(next);
      setSelectedUid((current) => current || next[0]?.id || "");
    }, () => setError("Could not load member conversations."));
  }, []);

  useEffect(() => {
    if (!selectedUid) {
      setMessages([]);
      return;
    }
    const messagesQuery = query(
      collection(db, "memberChats", selectedUid, "messages"),
      orderBy("createdAt", "asc"),
    );
    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          senderRole: data.senderRole === "admin" ? "admin" : "member",
          text: typeof data.text === "string" ? data.text : "",
          createdAt: data.createdAt ?? null,
        };
      }));
    }, () => setError("Could not load this conversation."));
  }, [selectedUid]);

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reply.trim();
    if (!selectedUid || !text || busy) return;
    setBusy(true);
    setError("");
    try {
      await addDoc(collection(db, "memberChats", selectedUid, "messages"), {
        senderId: adminUser.uid,
        senderRole: "admin",
        text: text.slice(0, 4000),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "memberChats", selectedUid), {
        updatedAt: serverTimestamp(),
      });
      setReply("");
    } catch {
      setError("Reply could not be sent. Check Firestore rules and your connection.");
    } finally {
      setBusy(false);
    }
  }

  const selected = chats.find((chat) => chat.id === selectedUid);

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Private support</p>
        <h2 className="mt-2 text-2xl font-black text-[#063b25]">Member Chats</h2>
      </div>
      <div className="grid min-h-[560px] lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-slate-200 p-3 lg:border-b-0 lg:border-r">
          {chats.length ? chats.map((chat) => (
            <button key={chat.id} type="button" onClick={() => setSelectedUid(chat.id)}
              className={`mb-2 w-full rounded-xl p-3 text-left ${selectedUid === chat.id ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
              <span className="block text-sm font-bold text-[#063b25]">{chat.memberName}</span>
              <span className="mt-1 block break-all text-xs text-slate-500">{chat.memberEmail}</span>
            </button>
          )) : <p className="p-4 text-sm text-slate-500">No member conversations yet.</p>}
        </aside>
        <div className="flex min-h-[500px] flex-col">
          <div className="border-b border-slate-100 p-5">
            <h3 className="font-black text-[#063b25]">{selected?.memberName || "Select a conversation"}</h3>
            {selected?.memberEmail && <p className="mt-1 text-xs text-slate-500">{selected.memberEmail}</p>}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderRole === "admin" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.senderRole === "admin" ? "bg-[#063b25] text-white" : "bg-slate-100 text-slate-700"}`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>
          {error && <p role="alert" className="mx-5 mb-3 text-sm text-rose-700">{error}</p>}
          <form onSubmit={sendReply} className="flex gap-3 border-t border-slate-100 p-4">
            <input value={reply} onChange={(e) => setReply(e.target.value)} disabled={!selectedUid || busy}
              placeholder={selectedUid ? "Reply to member…" : "Select a conversation"}
              maxLength={4000} className={inputStyle} />
            <button type="submit" disabled={!selectedUid || !reply.trim() || busy}
              className="rounded-xl bg-[#063b25] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {busy ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function WebsiteContentManager({ initialPage = "home" }: { initialPage?: SitePageId }) {
  const pages: { id: SitePageId; label: string }[] = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "programs", label: "Programs" },
    { id: "projects", label: "Projects" },
    { id: "gallery", label: "Gallery" },
    { id: "contact", label: "Contact" },
    { id: "footer", label: "Footer & Contact" },
  ];
  const [page, setPage] = useState<SitePageId>(initialPage);
  const [content, setContent] = useState<SitePageContent>(siteContentDefaults[initialPage]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setNotice("");
    setLoadError("");
    return watchSitePage(page, setContent, () => setLoadError("Could not load saved content. The website fallback content is still safe."));
  }, [page]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await saveSitePage(page, content);
      setNotice("Saved. The public website will update automatically.");
    } catch {
      setNotice("Could not save. Check your Firestore rules and internet connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Website CMS</p>
        <h2 className="mt-2 text-2xl font-black text-[#063b25]">Website Content</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">Edit the main public website copy. Existing website content remains the fallback if Firestore is unavailable.</p>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap gap-2">
          {pages.map((item) => (
            <button key={item.id} type="button" onClick={() => setPage(item.id)}
              className={`rounded-xl px-4 py-2 text-sm font-bold ${page === item.id ? "bg-[#063b25] text-white" : "border border-slate-200 bg-white text-[#063b25]"}`}>
              {item.label}
            </button>
          ))}
        </div>
        {loadError && <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{loadError}</p>}
        <form onSubmit={save} className="mt-6 space-y-5">
          {(Object.entries(content) as [string, string][]).map(([key, value]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-bold capitalize text-[#063b25]">{key.replace(/([A-Z])/g, " $1")}</span>
              <textarea value={value} rows={value.length > 100 ? 4 : 2}
                onChange={(e) => setContent((current) => ({ ...current, [key]: e.target.value }))}
                className={`${inputStyle} min-h-[80px] resize-y`} />
            </label>
          ))}
          {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</p>}
          <button type="submit" disabled={busy} className="rounded-xl bg-[#063b25] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Saving…" : "Save website changes"}
          </button>
        </form>
      </div>
    </section>
  );
}

function MemberContentManager({ defaultType }: { defaultType: MemberPostType }) {
  const [posts, setPosts] = useState<MemberPost[]>([]);
  const [type, setType] = useState<MemberPostType>(defaultType);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => watchMemberPosts(setPosts, () => setError("Could not load member posts.")), []);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await createMemberPost({ type, title, body, published });
      setTitle("");
      setBody("");
    } catch {
      setError("Could not publish this item. Check Firestore rules and try again.");
    } finally {
      setBusy(false);
    }
  }

  const visible = defaultType === "training"
    ? posts.filter((post) => post.type === "training" || post.type === "opportunity")
    : posts;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Private member publishing</p>
        <h2 className="mt-2 text-2xl font-black text-[#063b25]">{defaultType === "training" ? "Trainings & Opportunities" : "Member Feed"}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">Only verified signed-in members can read published items. These are not public website posts.</p>
        <form onSubmit={publish} className="mt-6 grid gap-4">
          <select value={type} onChange={(e) => setType(e.target.value as MemberPostType)} className={inputStyle}>
            <option value="announcement">Announcement</option>
            <option value="training">Training</option>
            <option value="opportunity">Opportunity</option>
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" maxLength={180} className={inputStyle} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" maxLength={6000} rows={5} className={`${inputStyle} resize-y`} />
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Publish immediately
          </label>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <button disabled={busy} className="w-fit rounded-xl bg-[#063b25] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
            {busy ? "Publishing…" : "Publish"}
          </button>
        </form>
      </div>
      <div className="space-y-3">
        {visible.map((post) => (
          <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase text-emerald-800">{post.type}</span>
                <h3 className="mt-3 text-lg font-black text-[#063b25]">{post.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{post.body}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void updateMemberPost(post.id, { published: !post.published })}
                  className={buttonStyle}>{post.published ? "Unpublish" : "Publish"}</button>
                <button type="button" onClick={() => void deleteMemberPost(post.id)}
                  className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">Delete</button>
              </div>
            </div>
          </article>
        ))}
        {!visible.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No items yet.</p>}
      </div>
    </section>
  );
}

export default Admin;
