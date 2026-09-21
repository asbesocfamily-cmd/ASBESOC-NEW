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
  collection,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const ADMIN_UID = "RJJhn4WSoBhUQ5vMF7G9vxLB98E2";
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
  const [activeSection, setActiveSection] =
    useState<Section>(sections[0]);

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

  return (
    <main className="min-h-screen bg-[#f3f7f3] text-slate-800">
      <header className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              ASBESOC Nigeria
            </p>

            <h1 className="mt-1 text-xl font-black text-[#063b25] sm:text-2xl">
              Admin dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <NavLink to="/" className={buttonStyle}>
              View website
            </NavLink>

            <button
              type="button"
              onClick={logout}
              disabled={signingOut}
              className={buttonStyle}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-3xl bg-[#063b25] px-6 py-7 text-white sm:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
            Submission inbox
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            Welcome back.
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/80">
            Review membership applications, support offers and
            partnership enquiries.
          </p>

          <p className="mt-4 break-all text-xs text-white/65">
            Signed in as {user.email || "ASBESOC administrator"}
          </p>
        </section>

        {sessionError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            {sessionError}
          </p>
        )}

        <nav
          aria-label="Submission categories"
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {sections.map((section) => {
            const selected = activeSection.id === section.id;

            return (
              <button
                key={section.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveSection(section)}
                className={`rounded-2xl border px-5 py-4 text-left transition ${focusStyle} ${
                  selected
                    ? "border-emerald-800 bg-emerald-50"
                    : "border-emerald-900/10 bg-white hover:border-emerald-400"
                }`}
              >
                <span className="block text-sm font-bold text-[#063b25]">
                  {section.label}
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  {section.description}
                </span>
              </button>
            );
          })}
        </nav>

        <SubmissionList
          key={`${user.uid}-${activeSection.id}`}
          section={activeSection}
        />
      </div>
    </main>
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

export default Admin;