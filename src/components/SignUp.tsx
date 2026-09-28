import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../contexts/useAuth";

const inputClass =
  "mt-2 block w-full rounded-xl border border-slate-300 bg-white " +
  "px-4 py-3 text-base text-slate-800 outline-none transition " +
  "placeholder:text-slate-400 focus:border-emerald-700 " +
  "focus:ring-4 focus:ring-emerald-100 disabled:opacity-60";

const buttonClass =
  "inline-flex min-h-12 w-full items-center justify-center " +
  "rounded-xl bg-[#063b25] px-6 py-3 text-sm font-bold text-white " +
  "transition hover:bg-emerald-800 focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-emerald-700 " +
  "focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60";

function signupError(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Unable to create an account with this email. Try logging in or resetting your password.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
      case "auth/password-does-not-meet-requirements":
        return "Please choose a stronger password that meets the account requirements.";

      case "auth/network-request-failed":
        return "Please check your internet connection and try again.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a little before trying again.";

      default:
        return "We could not create your account. Please try again later.";
    }
  }

  return "Something went wrong. Please try again.";
}

function SignUp() {
  const { user, loading, emailVerified } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestLock = useRef(false);
  const lastEmailSentAt = useRef(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requestLock.current || auth.currentUser) return;

    setError("");
    setNotice("");

    const name = fullName.trim();
    const address = email.trim();

    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    requestLock.current = true;
    setBusy(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const credential = await createUserWithEmailAndPassword(
        auth,
        address,
        password,
      );

      // The account now exists, even if a later step fails.
      setPassword("");
      setConfirmPassword("");

      let profileSaved = true;

      try {
        await updateProfile(credential.user, {
          displayName: name,
        });
      } catch {
        profileSaved = false;
      }

      try {
        await sendEmailVerification(credential.user);
        lastEmailSentAt.current = Date.now();

        setNotice(
          "Your account has been created. We sent a verification link to your email. Check your inbox and spam folder.",
        );
      } catch {
        setNotice("Your account has been created.");
        setError(
          "We could not send the verification email. Use the button below to try again. You do not need to sign up again.",
        );
      }

      if (!profileSaved) {
        setNotice((current) =>
          `${current} Your name could not be saved yet; you can update it in your profile later.`,
        );
      }
    } catch (submissionError) {
      setError(signupError(submissionError));
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
      setError(
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
        "We could not send the email. Please check your connection and try again later.",
      );
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
        aria-labelledby="signup-heading"
        className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-xl"
      >
        <header className="bg-[#063b25] px-6 py-7 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
            ASBESOC Nigeria
          </p>

          <h1
            id="signup-heading"
            className="mt-3 text-3xl font-black tracking-tight text-white"
          >
            {user ? "Your ASBESOC account" : "Create your account"}
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/80">
            {user
              ? "Manage your account and continue your membership journey."
              : "Create an account to begin your membership application."}
          </p>
        </header>

        <div className="px-6 py-7 sm:px-8">
          {notice && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900"
            >
              {notice}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
            >
              {error}
            </p>
          )}

          {user ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 px-4 py-4">
                <p className="text-xs font-semibold text-slate-500">
                  Signed in as
                </p>

                <p className="mt-1 break-all text-sm font-bold text-[#063b25]">
                  {user.email}
                </p>

                <p className="mt-3 text-sm text-slate-600">
                  {emailVerified
                    ? "Your email is verified."
                    : "Please verify your email to continue your membership application."}
                </p>
              </div>

              {busy ? (
                <p role="status" className="text-sm text-emerald-800">
                  Please wait…
                </p>
              ) : (
                <>
                  <Link
                    to={emailVerified ? "/membership" : "/verify-email"}
                    className={buttonClass}
                  >
                    {emailVerified
                      ? "Continue to Membership"
                      : "Continue to Email Verification"}
                  </Link>

                  {!emailVerified && (
                    <button
                      type="button"
                      onClick={resendVerification}
                      className="min-h-11 w-full rounded-lg px-3 text-sm font-semibold text-[#063b25] underline underline-offset-4 hover:bg-emerald-50"
                    >
                      Resend verification email
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-busy={busy}>
              <fieldset disabled={busy} className="min-w-0 space-y-5">
                <legend className="sr-only">
                  Create an ASBESOC account
                </legend>

                <div>
                  <label
                    htmlFor="signup-name"
                    className="text-sm font-semibold text-[#063b25]"
                  >
                    Full Name
                  </label>

                  <input
                    id="signup-name"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={150}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="text-sm font-semibold text-[#063b25]"
                  >
                    Email Address
                  </label>

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="text-sm font-semibold text-[#063b25]"
                  >
                    Password
                  </label>

                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-describedby="signup-password-hint"
                    className={inputClass}
                  />

                  <p
                    id="signup-password-hint"
                    className="mt-2 text-xs leading-5 text-slate-500"
                  >
                    Use at least 8 characters. A longer, unique password
                    is better.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-semibold text-[#063b25]"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(event.target.checked)
                    }
                    className="h-4 w-4 accent-emerald-800"
                  />
                  Show passwords
                </label>

                <p className="text-xs leading-6 text-slate-500">
                  Creating an account starts your membership journey.
                  Certified membership requires application approval
                  and completion of the certificate process.
                </p>

                <button
                  type="submit"
                  disabled={busy}
                  className={buttonClass}
                >
                  {busy ? "Creating your account…" : "Create Account"}
                </button>
              </fieldset>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#063b25] underline underline-offset-4"
                >
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default SignUp;