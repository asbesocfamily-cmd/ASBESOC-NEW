import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/useAuth";

const buttonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 " +
  "rounded-xl bg-[#063b25] px-6 py-3 text-sm font-bold text-white " +
  "shadow-[0_10px_25px_rgba(6,59,37,0.14)] transition " +
  "hover:bg-emerald-800 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-emerald-700 " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 " +
  "rounded-xl border border-emerald-900/15 bg-white px-5 py-3 " +
  "text-sm font-bold text-[#063b25] transition " +
  "hover:border-emerald-700/30 hover:bg-emerald-50/70 " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-emerald-700 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

function VerifyEmail() {
  const {
    user,
    loading,
    emailVerified,
    refreshUser,
    logout,
  } = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestLock = useRef(false);
  const lastEmailSentAt = useRef(0);

  async function checkVerification() {
    if (requestLock.current || !auth.currentUser) return;

    requestLock.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await refreshUser();

      if (
        auth.currentUser &&
        !auth.currentUser.emailVerified
      ) {
        setNotice(
          "Your email is not verified yet. Open the verification link in your email, then return here and check again.",
        );
      }
    } catch {
      setError(
        "We could not check your verification status. Please check your connection and try again.",
      );
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  async function resendVerification() {
    const currentUser = auth.currentUser;

    if (!currentUser || requestLock.current) return;

    setError("");
    setNotice("");

    if (
      Date.now() - lastEmailSentAt.current <
      60_000
    ) {
      setNotice(
        "Please wait one minute before requesting another verification email.",
      );
      return;
    }

    requestLock.current = true;
    setBusy(true);

    try {
      await sendEmailVerification(currentUser);

      lastEmailSentAt.current = Date.now();

      setNotice(
        "Verification email sent. Please check your inbox and spam folder.",
      );
    } catch {
      setError(
        "We could not send the verification email. Please wait a little and try again.",
      );
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  async function handleLogout() {
    if (requestLock.current) return;

    requestLock.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await logout();
    } catch {
      setError(
        "We could not log you out. Please try again.",
      );
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#f3f7f3] px-4">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-900/15 border-t-[#063b25]" />

          <p
            role="status"
            className="mt-4 text-sm font-semibold text-[#063b25]"
          >
            Checking your account…
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f3f7f3] text-slate-800">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full border-[70px] border-emerald-900/[0.025]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-44 -left-44 h-[420px] w-[420px] rounded-full border-[70px] border-emerald-900/[0.025]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section
          aria-labelledby="verification-heading"
          className="grid w-full overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-[0_28px_80px_rgba(6,59,37,0.10)] lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[34px]"
        >
          {/* Left brand panel */}
          <aside className="relative overflow-hidden bg-[#063b25] px-6 py-8 text-white sm:px-9 sm:py-10 lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-white/[0.04]"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full border-[42px] border-amber-300/[0.05]"
            />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                  <ShieldCheckIcon className="h-5 w-5 text-amber-300" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                    ASBESOC Nigeria
                  </p>

                  <p className="mt-1 text-xs font-medium text-white/65">
                    Secure Member Access
                  </p>
                </div>
              </div>

              <div className="mt-8 max-w-md lg:mt-16">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
                  Account Verification
                </p>

                <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                  One secure step before you continue.
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/70 sm:text-base">
                  Email verification helps us protect your
                  account and ensures important membership
                  information reaches the right person.
                </p>
              </div>
            </div>

            {/* Desktop trust points */}
            <div className="relative mt-8 hidden space-y-4 lg:block">
              <TrustPoint
                icon={<LockIcon className="h-4 w-4" />}
                title="Protected account"
                description="Verification adds an important layer of confidence to your member account."
              />

              <TrustPoint
                icon={<MailIcon className="h-4 w-4" />}
                title="Reliable communication"
                description="Your verified address will be used for important membership communication."
              />

              <TrustPoint
                icon={<ArrowIcon className="h-4 w-4" />}
                title="Continue your journey"
                description="Once verified, you can proceed with your ASBESOC membership application."
              />
            </div>

            {/* Mobile progress */}
            <div className="relative mt-7 flex items-center gap-3 border-t border-white/10 pt-5 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-300 text-xs font-black text-[#063b25]">
                1
              </span>

              <div>
                <p className="text-xs font-bold text-white">
                  Verify your email
                </p>

                <p className="mt-0.5 text-[11px] text-white/60">
                  Then continue to membership
                </p>
              </div>
            </div>
          </aside>

          {/* Main verification panel */}
          <div
            className="flex items-center px-5 py-8 sm:px-9 sm:py-10 lg:px-14 lg:py-14"
            aria-busy={busy}
          >
            <div className="mx-auto w-full max-w-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 sm:text-[11px]">
                    Member Account
                  </p>

                  <h1
                    id="verification-heading"
                    className="mt-3 text-2xl font-black tracking-tight text-[#063b25] sm:text-3xl lg:text-[34px]"
                  >
                    {!user
                      ? "Login to continue"
                      : emailVerified
                        ? "Email verified"
                        : "Verify your email"}
                  </h1>
                </div>

                <StatusIcon
                  verified={Boolean(
                    user && emailVerified,
                  )}
                />
              </div>

              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
                {!user
                  ? "Sign in to your ASBESOC account to check your email verification status."
                  : emailVerified
                    ? "Your email address has been confirmed. You can now continue with your membership application."
                    : "We need to confirm your email address before you continue with your membership application."}
              </p>

              {/* Feedback */}
              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                    <AlertIcon className="h-4 w-4" />
                  </div>

                  <p className="text-sm leading-6 text-rose-800">
                    {error}
                  </p>
                </div>
              )}

              {notice && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <InfoIcon className="h-4 w-4" />
                  </div>

                  <p className="text-sm leading-6 text-emerald-900">
                    {notice}
                  </p>
                </div>
              )}

              {!user ? (
                <div className="mt-8">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#063b25]">
                        <UserIcon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#063b25]">
                          Sign in required
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Your verification status is connected
                          to your ASBESOC account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/login"
                      className={buttonClass}
                    >
                      Login to Your Account
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <p className="mt-5 text-center text-sm text-slate-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-bold text-[#063b25] underline decoration-emerald-700/30 underline-offset-4 hover:text-emerald-700"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              ) : emailVerified ? (
                <div className="mt-8">
                  <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70">
                    <div className="flex items-start gap-4 p-5 sm:p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#063b25] text-amber-300">
                        <CheckIcon className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#063b25]">
                          Verification complete
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold text-emerald-900">
                          {user.email}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          This email address is now confirmed
                          for your ASBESOC account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex gap-3">
                      <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                      <p className="text-sm leading-7 text-slate-600">
                        Email verification confirms your
                        account&apos;s email address. Your
                        membership application is a separate
                        process and remains subject to ASBESOC
                        review and approval.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7">
                    <Link
                      to="/membership"
                      className={buttonClass}
                    >
                      Continue to Membership
                      <ArrowIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  {/* Email identity */}
                  <div className="rounded-2xl border border-emerald-900/10 bg-[#f7faf7] p-4 sm:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#063b25] shadow-sm ring-1 ring-emerald-900/10">
                        <MailIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                          Verification email sent to
                        </p>

                        <p className="mt-1.5 break-all text-sm font-black text-[#063b25] sm:text-base">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mt-7">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      What to do next
                    </p>

                    <div className="mt-4 space-y-3">
                      <VerificationStep
                        number="1"
                        title="Check your inbox"
                        description="Open the verification email sent to your account. Check spam or junk if you do not see it."
                      />

                      <VerificationStep
                        number="2"
                        title="Verify your address"
                        description="Open the email and click the verification link provided."
                      />

                      <VerificationStep
                        number="3"
                        title="Return and confirm"
                        description="Come back to this page and select “I Have Verified My Email”."
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-7 space-y-3">
                    <button
                      type="button"
                      onClick={checkVerification}
                      disabled={busy}
                      className={buttonClass}
                    >
                      {busy ? (
                        <>
                          <SpinnerIcon className="h-4 w-4 animate-spin" />
                          Please wait…
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          I Have Verified My Email
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={busy}
                      className={secondaryButtonClass}
                    >
                      <MailIcon className="h-4 w-4" />
                      Resend Verification Email
                    </button>
                  </div>

                  <div className="mt-7 border-t border-slate-200 pt-5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={busy}
                      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#063b25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-60"
                    >
                      <LogoutIcon className="h-4 w-4" />
                      Log out and use another account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function VerificationStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-emerald-900/15">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-black text-[#063b25]">
        {number}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-[#163d31]">
          {title}
        </p>

        <p className="mt-1 text-xs leading-6 text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

function TrustPoint({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-amber-300">
        {icon}
      </div>

      <div>
        <p className="text-xs font-bold text-white">
          {title}
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-white/55">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusIcon({
  verified,
}: {
  verified: boolean;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      {verified ? (
        <CheckIcon className="h-5 w-5" />
      ) : (
        <MailIcon className="h-5 w-5" />
      )}
    </div>
  );
}

function ShieldCheckIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MailIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ArrowIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function InfoIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function UserIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function LogoutIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 5H5v14h5" />
      <path d="M13 8l4 4-4 4M17 12H9" />
    </svg>
  );
}

function SpinnerIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default VerifyEmail;