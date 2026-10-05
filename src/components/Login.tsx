import {
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, Navigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/useAuth";
import { ADMIN_UID } from "../firebase/membership";

const inputClass =
  "mt-2 block min-h-12 w-full rounded-xl border border-slate-200 " +
  "bg-[#fbfcfb] px-4 py-3 text-base text-slate-800 outline-none " +
  "transition placeholder:text-slate-400 hover:border-slate-300 " +
  "focus:border-emerald-700 focus:bg-white focus:ring-4 " +
  "focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60";

const buttonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 " +
  "rounded-xl bg-[#063b25] px-6 py-3 text-sm font-bold text-white " +
  "shadow-[0_12px_28px_rgba(6,59,37,0.16)] transition " +
  "hover:bg-[#075033] focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-emerald-700 " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60";

function loginError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "We could not sign you in. Check your email and password.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-disabled":
        return "This account is currently disabled. Please contact ASBESOC.";

      case "auth/too-many-requests":
        return "Too many login attempts. Please wait a little or reset your password.";

      case "auth/network-request-failed":
        return "Please check your internet connection and try again.";

      default:
        return "We could not sign you in. Please try again later.";
    }
  }

  return "Something went wrong. Please try again.";
}

function Login() {
  const { user, loading, emailVerified } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const requestLock = useRef(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (requestLock.current || auth.currentUser) {
      return;
    }

    requestLock.current = true;
    setBusy(true);
    setError("");

    try {
      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence,
      );

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      setPassword("");
    } catch (signInError) {
      setError(loginError(signInError));
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#f4f7f4] px-4">
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

  if (user && !busy) {
    const destination =
      user.uid === ADMIN_UID
        ? "/admin"
        : emailVerified
          ? "/dashboard"
          : "/verify-email";

    return <Navigate to={destination} replace />;
  }

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f4f7f4] text-slate-800">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[430px] w-[430px] rounded-full border-[70px] border-emerald-950/[0.025]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-44 h-[440px] w-[440px] rounded-full border-[70px] border-emerald-950/[0.025]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1600px]">
        {/* LEFT SIDE */}
        <aside className="relative hidden w-[42%] min-w-[390px] overflow-hidden bg-[#063b25] text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border-[70px] border-white/[0.035]"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-36 -left-36 h-[400px] w-[400px] rounded-full border-[65px] border-amber-300/[0.04]"
          />

          <div
            aria-hidden="true"
            className="absolute right-12 top-1/2 h-2 w-2 rounded-full bg-amber-300"
          />

          <div className="relative px-10 py-10 xl:px-14 xl:py-12">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                <ShieldIcon className="h-6 w-6 text-amber-300" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                  ASBESOC
                </p>

                <p className="mt-0.5 text-xs text-white/60">
                  Association for a Better Society
                </p>
              </div>
            </Link>

            <div className="mt-16 max-w-xl xl:mt-24">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">
                Member Access
              </p>

              <h1 className="mt-5 text-[42px] font-black leading-[1.08] tracking-[-0.035em] xl:text-[52px]">
                Welcome back to your ASBESOC journey.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/65 xl:text-[17px]">
                Sign in securely to manage your
                membership application, follow your
                progress and access your private member
                services.
              </p>
            </div>

            <div className="mt-12 max-w-lg space-y-3 xl:mt-16">
              <AccessItem
                icon={
                  <DashboardIcon className="h-5 w-5" />
                }
                title="Member Dashboard"
                description="Your membership progress and account in one secure place."
              />

              <AccessItem
                icon={
                  <MembershipIcon className="h-5 w-5" />
                }
                title="Membership Journey"
                description="Follow your application, approval and certification."
              />

              <AccessItem
                icon={<BellIcon className="h-5 w-5" />}
                title="Member Updates"
                description="Stay connected with important ASBESOC information."
              />
            </div>
          </div>

          <div className="relative border-t border-white/10 px-10 py-7 xl:px-14">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-emerald-200">
                <LockIcon className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-bold text-white/85">
                  Secure member access
                </p>

                <p className="mt-0.5 text-[11px] text-white/45">
                  Your account is protected through
                  Firebase Authentication.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <section className="flex min-w-0 flex-1 items-center px-4 py-7 sm:px-7 sm:py-10 md:px-10 lg:px-12 xl:px-20">
          <div className="mx-auto w-full max-w-2xl">
            {/* MOBILE HEADER */}
            <div className="mb-8 lg:hidden">
              <div className="rounded-[26px] bg-[#063b25] px-5 py-6 text-white sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <Link
                    to="/"
                    className="flex min-w-0 items-center gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                      <ShieldIcon className="h-5 w-5 text-amber-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
                        ASBESOC Nigeria
                      </p>

                      <p className="mt-1 truncate text-xs text-white/60">
                        Secure Member Access
                      </p>
                    </div>
                  </Link>

                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />

                    <span className="text-[10px] font-bold text-white/70">
                      Secure
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                    Member Portal
                  </p>

                  <p className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                    Welcome back to ASBESOC.
                  </p>
                </div>
              </div>
            </div>

            {/* HEADING */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 sm:text-[11px]">
                  ASBESOC Member Portal
                </p>

                <h2
                  id="login-heading"
                  className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#063b25] sm:text-4xl"
                >
                  Welcome back
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                  Enter your account details to
                  continue to your secure member
                  dashboard.
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-900/10 bg-white text-[#063b25] shadow-sm sm:flex">
                <LockIcon className="h-5 w-5" />
              </div>
            </div>

            {/* ERROR */}
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

            {/* LOGIN FORM */}
            <form
              onSubmit={handleSubmit}
              aria-busy={busy}
              className="mt-8"
            >
              <fieldset
                disabled={busy}
                className="min-w-0"
              >
                <legend className="sr-only">
                  Login to your ASBESOC account
                </legend>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="text-sm font-bold text-[#163d31]"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      maxLength={254}
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className={`${inputClass} pr-11`}
                    />

                    <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                      <MailIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-bold text-[#163d31]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-emerald-700 transition hover:text-[#063b25] hover:underline hover:underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      className={`${inputClass} pr-11`}
                    />

                    <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                      <LockIcon className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* LOGIN OPTIONS */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(
                          event.target.checked,
                        )
                      }
                      aria-describedby="login-remember-hint"
                      className="h-4 w-4 accent-emerald-800"
                    />

                    Keep me logged in
                  </label>

                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(event) =>
                        setShowPassword(
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4 accent-emerald-800"
                    />

                    Show password
                  </label>
                </div>

                {/* REMEMBER ME NOTICE */}
                {rememberMe && (
                  <div
                    id="login-remember-hint"
                    className="mt-2 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3"
                  >
                    <DeviceIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

                    <p className="text-xs leading-5 text-slate-600">
                      Your login will remain available
                      on this browser. Use this option
                      only on a personal device.
                    </p>
                  </div>
                )}

                {/* SECURITY INFO */}
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/50 px-4 py-4">
                  <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                  <p className="text-xs leading-6 text-slate-600">
                    Your member account gives you
                    secure access to your membership
                    application, status and private
                    member services.
                  </p>
                </div>

                {/* SUBMIT */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={busy}
                    className={buttonClass}
                  >
                    {busy ? (
                      <>
                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                        Signing you in…
                      </>
                    ) : (
                      <>
                        Login to Member Portal
                        <ArrowIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </fieldset>

              <div aria-live="polite">
                {busy && (
                  <p className="mt-3 text-center text-xs font-semibold text-emerald-800">
                    Securely signing you in. Please
                    wait.
                  </p>
                )}
              </div>

              {/* NEW ACCOUNT */}
              <div className="mt-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  New to ASBESOC
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-black text-[#063b25] underline decoration-emerald-700/30 underline-offset-4 transition hover:text-emerald-700"
                >
                  Create your account
                </Link>
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <LockIcon className="h-3.5 w-3.5" />

                <span>
                  Secure ASBESOC member access
                </span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function AccessItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-emerald-200">
        {icon}
      </div>

      <div>
        <p className="text-sm font-bold text-white/90">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/45">
          {description}
        </p>
      </div>
    </div>
  );
}

function ShieldIcon({
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
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function DashboardIcon({
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
      <rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1.5"
      />
    </svg>
  );
}

function MembershipIcon({
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
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 4a3 3 0 0 1 0 6" />
      <path d="M17 14a5 5 0 0 1 4 5" />
    </svg>
  );
}

function BellIcon({
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function DeviceIcon({
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
      <rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="2"
      />
      <path d="M10 18h4" />
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
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
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

export default Login;