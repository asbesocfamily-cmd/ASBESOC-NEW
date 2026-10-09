import { useEffect, useState } from "react";
import { Navigate, NavLink } from "react-router-dom";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
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

import { ADMIN_UID } from "../firebase/membership";
import AdminMemberChats from "./AdminChats";
import AdminShell from "./AdminShell";
import { type AdminView } from "./adminNavigation";
import {
  MemberDirectory,
  BroadcastCentre,
  ActivityPanel,
  RequestWorkflow,
} from "./AdminOperations";
import AdminMedia from "./AdminMedia";
import PublicGalleryPublisher from "./PublicGalleryPublisher";
import ApplicationReview from "./ApplicationReview";
import MemberContentManager from "./MemberPostManager";
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
    return value.length ? value.map(displayValue).join(", ") : "Not provided";
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
  if (data.submissionType === "support" && data.anonymous === true) {
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
    return sessionError ? (
      <main className="p-8">
        <p role="alert">{sessionError}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </main>
    ) : (
      <Navigate to="/login" replace />
    );
  }

  if (user.uid !== ADMIN_UID) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user.emailVerified) {
    return (
      <main className="min-h-[70vh] bg-[#f3f7f3] px-4 py-12">
        <section className="mx-auto max-w-lg space-y-5 rounded-3xl bg-white p-8 text-[#063b25]">
          <h1 className="text-2xl font-bold">
            Verify your administrator email
          </h1>
          <p>
            Verify your account email before accessing membership records or
            making review decisions.
          </p>
          <NavLink to="/verify-email" className={buttonStyle}>
            Verify email
          </NavLink>
          <p className="text-sm">
            After verification, return to the admin page. If needed, sign out
            and sign in again.
          </p>
          <button
            className={buttonStyle}
            disabled={signingOut}
            onClick={logout}
          >
            Sign out
          </button>
          {sessionError && <p role="alert">{sessionError}</p>}
        </section>
      </main>
    );
  }

  const submissionSection = sections.find(
    (section) => section.id === activeView,
  );

  return (
    <AdminShell
      user={user}
      activeView={activeView}
      onOpen={setActiveView}
      logout={() => void logout()}
      signingOut={signingOut}
    >
      {sessionError && (
        <p role="alert" className="control-error">
          {sessionError}
        </p>
      )}
      {activeView === "members" && <MemberDirectory />}
      {activeView === "broadcasts" && <BroadcastCentre />}
      {activeView === "activity" && <ActivityPanel />}
      {activeView === "memberChats" && <AdminMemberChats adminUser={user} />}
      {submissionSection && (
        <SubmissionList
          key={submissionSection.id}
          section={submissionSection}
        />
      )}
      {activeView === "memberFeed" && (
        <MemberContentManager key="announcements" defaultType="announcement" />
      )}
      {activeView === "trainings" && (
        <MemberContentManager key="trainings" defaultType="training" />
      )}
      {activeView === "gallery" && (
        <div className="control-stack">
          <AdminMedia />
          <PublicGalleryPublisher />
        </div>
      )}
      {activeView === "settings" && (
        <div className="control-stack">
          <section className="control-panel">
            <h2 className="font-bold">Administrator account</h2>
            <p className="mt-3 break-all text-sm">{user.email}</p>
            <p className="mt-2 text-sm text-slate-500">
              Verified administrator access. Use your shared login to manage
              your account.
            </p>
            <button
              className="control-button mt-4"
              disabled={signingOut}
              onClick={() => void logout()}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </section>
        </div>
      )}
    </AdminShell>
  );
}

function SubmissionList({ section }: { section: Section }) {
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
          : query(source, orderBy("createdAt", "desc"), limit(PAGE_SIZE + 1));

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

  const visibleRows = rows.filter(
    (row) =>
      (statusFilter === "all" || row.data.status === statusFilter) &&
      `${submissionName(row.data)} ${String(row.data.email || "")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <section
      aria-labelledby="admin-inbox-heading"
      aria-busy={loading}
      className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm"
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
        <div className="control-toolbar">
          <label>
            Search this page
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
            />
          </label>
          <label>
            Filter this page by status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              {(section.id === "membershipApplications"
                ? ["new", "pending", "under_review", "approved", "rejected"]
                : ["new", "in_progress", "closed"]
              ).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </label>
        </div>
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
        ) : visibleRows.length === 0 ? (
          <p role="status" className="py-10 text-center text-sm text-slate-500">
            {rows.length
              ? "No submissions match these page filters."
              : "No submissions on this page."}
          </p>
        ) : (
          <div className="v2-submission-list">
            {visibleRows.map((row) => (
              <details
                key={row.id}
                className="group overflow-hidden rounded-2xl border border-slate-200"
              >
                <summary
                  className={`v2-submission-summary cursor-pointer ${focusStyle}`}
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

                  {section.id === "membershipApplications" ? (
                    <ApplicationReview
                      id={row.id}
                      status={String(row.data.status)}
                      linked={typeof row.data.userId === "string"}
                      onSaved={refresh}
                    />
                  ) : (
                    <RequestWorkflow
                      key={`${row.id}-${row.data.status}`}
                      id={row.id}
                      collectionName={section.id}
                      current={String(row.data.status || "new")}
                      onSaved={refresh}
                    />
                  )}

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

          <p className="text-xs text-slate-500">Page {cursors.length}</p>

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
