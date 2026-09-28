import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const confirmationMessage =
  "If an account exists for this email address, you will receive a password reset link. Please check your inbox and spam folder.";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const requestLock = useRef(false);
  const lastRequestAt = useRef(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requestLock.current) return;

    setError("");

    if (Date.now() - lastRequestAt.current < 60_000) {
      setError(
        "Please wait one minute before requesting another reset email.",
      );
      return;
    }

    requestLock.current = true;
    setBusy(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());

      lastRequestAt.current = Date.now();
      setSubmitted(true);
    } catch (resetError) {
      if (resetError instanceof FirebaseError) {
        switch (resetError.code) {
          case "auth/user-not-found":
            // Give the same response without revealing account existence.
            lastRequestAt.current = Date.now();
            setSubmitted(true);
            break;

          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;

          case "auth/network-request-failed":
            setError(
              "Please check your internet connection and try again.",
            );
            break;

          case "auth/too-many-requests":
            setError(
              "Too many requests. Please wait a little before trying again.",
            );
            break;

          default:
            setError(
              "We could not process your request. Please try again later.",
            );
        }
      } else {
        setError(
          "We could not process your request. Please try again later.",
        );
      }
    } finally {
      requestLock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[75vh] bg-[#f3f7f3] px-4 py-8 sm:py-12">
      <section
        aria-labelledby="reset-password-heading"
        className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-xl"
      >
        <header className="bg-[#063b25] px-6 py-7 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
            ASBESOC Nigeria
          </p>

          <h1
            id="reset-password-heading"
            className="mt-3 text-3xl font-black tracking-tight text-white"
          >
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/80">
            Enter your account email to request a password reset link.
          </p>
        </header>

        <div className="px-6 py-7 sm:px-8">
          <div aria-live="polite" aria-atomic="true">
            {submitted && (
              <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-900">
                {confirmationMessage}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} aria-busy={busy}>
            <fieldset disabled={busy} className="min-w-0 space-y-5">
              <legend className="sr-only">
                Request a password reset email
              </legend>

              <div>
                <label
                  htmlFor="reset-email"
                  className="text-sm font-semibold text-[#063b25]"
                >
                  Email Address
                </label>

                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  maxLength={254}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSubmitted(false);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#063b25] px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy
                  ? "Sending request…"
                  : submitted
                    ? "Resend Reset Email"
                    : "Send Reset Link"}
              </button>
            </fieldset>

            <div aria-live="polite">
              {busy && (
                <p className="mt-3 text-center text-sm text-emerald-800">
                  Processing your request. Please wait.
                </p>
              )}
            </div>
          </form>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            Open the link in your email to choose a new password.
            Then return here to log in.
          </p>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center">
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-[#063b25] underline underline-offset-4 hover:bg-emerald-50"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;