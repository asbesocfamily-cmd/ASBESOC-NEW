import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/useAuth";

const buttonClass =
  "inline-flex min-h-12 w-full items-center justify-center " +
  "rounded-xl bg-[#063b25] px-6 py-3 text-sm font-bold text-white " +
  "transition hover:bg-emerald-800 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-emerald-700 " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60";

function VerifyEmail() {
  const { user, loading, emailVerified, refreshUser, logout } = useAuth();

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

      if (auth.currentUser && !auth.currentUser.emailVerified) {
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

    if (Date.now() - lastEmailSentAt.current < 60_000) {
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
      setError("We could not log you out. Please try again.");
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f3f7f3] px-4">
        <p role="status" className="text-sm font-semibold text-[#063b25]">
          Checking your account…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#f3f7f3] px-4 py-8 sm:py-12">
      <section
        aria-labelledby="verification-heading"
        className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-xl"
      >
        <header className="bg-[#063b25] px-6 py-7 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
            ASBESOC Nigeria
          </p>

          <h1
            id="verification-heading"
            className="mt-3 text-3xl font-black tracking-tight text-white"
          >
            {!user
              ? "Login to continue"
              : emailVerified
                ? "Email verified"
                : "Verify your email"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/80">
            {!user
              ? "Sign in to check your account’s email verification."
              : emailVerified
                ? "You can now continue your membership application."
                : "Confirm your email address before continuing your membership application."}
          </p>
        </header>

        <div className="space-y-5 px-6 py-7 sm:px-8" aria-busy={busy}>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
            >
              {notice}
            </p>
          )}

          {!user ? (
            <>
              <Link to="/login" className={buttonClass}>
                Login
              </Link>

              <p className="text-center text-sm text-slate-600">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-[#063b25] underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </>
          ) : emailVerified ? (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-sm font-bold text-[#063b25]">
                  Your email address is verified.
                </p>

                <p className="mt-2 break-all text-sm text-emerald-900">
                  {user.email}
                </p>
              </div>

              <p className="text-sm leading-7 text-slate-600">
                Email verification confirms your account’s email address.
                Your membership application still needs to be reviewed
                and approved by ASBESOC.
              </p>

              <Link to="/membership" className={buttonClass}>
                Continue to Membership
              </Link>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-xs font-semibold text-slate-500">
                  Account email
                </p>

                <p className="mt-1 break-all text-sm font-bold text-[#063b25]">
                  {user.email}
                </p>
              </div>

              <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-600">
                <li>
                  Open the verification email from ASBESOC. Check your
                  spam folder if you cannot find it.
                </li>
                <li>Click the verification link in that email.</li>
                <li>
                  Return to this page and press the button below.
                </li>
              </ol>

              <button
                type="button"
                onClick={checkVerification}
                disabled={busy}
                className={buttonClass}
              >
                {busy ? "Please wait…" : "I Have Verified My Email"}
              </button>

              <button
                type="button"
                onClick={resendVerification}
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-900/20 px-5 py-3 text-sm font-bold text-[#063b25] transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend Verification Email
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={busy}
                className="min-h-11 w-full rounded-lg px-3 text-sm font-semibold text-slate-600 underline underline-offset-4 hover:bg-slate-50 disabled:opacity-60"
              >
                Log out and use another account
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default VerifyEmail;