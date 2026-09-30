import {
  useRef,
  useState,
  type FormEvent,
} from "react";
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
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const requestLock = useRef(false);
  const lastEmailSentAt = useRef(0);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (requestLock.current || auth.currentUser) {
      return;
    }

    setError("");
    setNotice("");

    const name = fullName.trim();
    const address = email.trim();

    if (name.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    requestLock.current = true;
    setBusy(true);

    try {
      await setPersistence(
        auth,
        browserLocalPersistence,
      );

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          address,
          password,
        );

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
        await sendEmailVerification(
          credential.user,
        );

        lastEmailSentAt.current = Date.now();

        setNotice(
          "Your account has been created. We sent a verification link to your email. Check your inbox and spam folder.",
        );
      } catch {
        setNotice(
          "Your account has been created.",
        );

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

    if (
      !currentUser ||
      requestLock.current
    ) {
      return;
    }

    setError("");
    setNotice("");

    if (
      Date.now() -
        lastEmailSentAt.current <
      60_000
    ) {
      setError(
        "Please wait one minute before requesting another verification email.",
      );
      return;
    }

    requestLock.current = true;
    setBusy(true);

    try {
      await sendEmailVerification(
        currentUser,
      );

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

  return (
    <main className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f4f7f4] text-slate-800">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[430px] w-[430px] rounded-full border-[70px] border-emerald-950/[0.025]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-44 h-[440px] w-[440px] rounded-full border-[70px] border-emerald-950/[0.025]"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1600px]">
        {/* LEFT BRAND PANEL */}
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
                Your journey toward a better society
                starts here.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-white/65 xl:text-[17px]">
                Create your secure ASBESOC account
                to begin your membership journey,
                manage your application and stay
                connected with the organisation.
              </p>
            </div>

            <div className="mt-12 max-w-lg xl:mt-16">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                Membership Journey
              </p>

              <div className="mt-5 space-y-1">
                <JourneyItem
                  number="01"
                  title="Create Account"
                  description="Set up your secure member identity."
                  active
                />

                <JourneyItem
                  number="02"
                  title="Verify Email"
                  description="Confirm your email address."
                />

                <JourneyItem
                  number="03"
                  title="Apply for Membership"
                  description="Submit your membership application."
                />

                <JourneyItem
                  number="04"
                  title="Become Certified"
                  description="Complete approval and certificate requirements."
                  last
                />
              </div>
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

        {/* RIGHT WORKSPACE */}
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
                    <span className="h-2 w-2 rounded-full bg-amber-300" />

                    <span className="text-[10px] font-bold text-white/70">
                      Step 1
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                    Member onboarding
                  </p>

                  <p className="mt-2 text-xl font-black leading-tight sm:text-2xl">
                    Begin your ASBESOC membership
                    journey.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 sm:text-[11px]">
                  ASBESOC Member Portal
                </p>

                <h2
                  id="signup-heading"
                  className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#063b25] sm:text-4xl"
                >
                  {user
                    ? "Your account"
                    : "Create your account"}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                  {user
                    ? "Your ASBESOC account is ready. Continue to the next stage of your membership journey."
                    : "Create a secure account to access your membership application and member services."}
                </p>
              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-900/10 bg-white text-[#063b25] shadow-sm sm:flex">
                {user ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
            </div>

            {notice && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <CheckIcon className="h-4 w-4" />
                </div>

                <p className="text-sm leading-6 text-emerald-900">
                  {notice}
                </p>
              </div>
            )}

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

            {user ? (
              <div className="mt-8">
                <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-[0_12px_35px_rgba(6,59,37,0.06)]">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#063b25]">
                        <UserIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Signed in as
                        </p>

                        <p className="mt-2 break-all text-base font-black text-[#063b25]">
                          {user.email}
                        </p>

                        <div className="mt-3">
                          <StatusBadge
                            verified={emailVerified}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-[#fbfcfb] p-5 sm:p-6">
                    {busy ? (
                      <div
                        role="status"
                        className="flex min-h-12 items-center justify-center gap-3 text-sm font-semibold text-emerald-800"
                      >
                        <SpinnerIcon className="h-4 w-4 animate-spin" />
                        Please wait…
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          to={
                            emailVerified
                              ? "/membership"
                              : "/verify-email"
                          }
                          className={buttonClass}
                        >
                          {emailVerified ? (
                            <>
                              Continue to Membership
                              <ArrowIcon className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Continue to Email Verification
                              <ArrowIcon className="h-4 w-4" />
                            </>
                          )}
                        </Link>

                        {!emailVerified && (
                          <button
                            type="button"
                            onClick={resendVerification}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-900/15 bg-white px-5 py-3 text-sm font-bold text-[#063b25] transition hover:border-emerald-900/25 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                          >
                            <MailIcon className="h-4 w-4" />
                            Resend Verification Email
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-center text-xs leading-6 text-slate-500">
                  Already signed in? You do not need to
                  create another account.
                </p>
              </div>
            ) : (
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
                    Create an ASBESOC account
                  </legend>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-name"
                        className="text-sm font-bold text-[#163d31]"
                      >
                        Full Name
                      </label>

                      <div className="relative">
                        <input
                          id="signup-name"
                          name="fullName"
                          type="text"
                          autoComplete="name"
                          required
                          minLength={2}
                          maxLength={150}
                          value={fullName}
                          onChange={(event) =>
                            setFullName(
                              event.target.value,
                            )
                          }
                          placeholder="Enter your full name"
                          className={`${inputClass} pr-11`}
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                          <UserIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-email"
                        className="text-sm font-bold text-[#163d31]"
                      >
                        Email Address
                      </label>

                      <div className="relative">
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
                          onChange={(event) =>
                            setEmail(
                              event.target.value,
                            )
                          }
                          placeholder="you@example.com"
                          className={`${inputClass} pr-11`}
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                          <MailIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-password"
                        className="text-sm font-bold text-[#163d31]"
                      >
                        Password
                      </label>

                      <div className="relative">
                        <input
                          id="signup-password"
                          name="password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value,
                            )
                          }
                          aria-describedby="signup-password-hint"
                          placeholder="Minimum 8 characters"
                          className={`${inputClass} pr-11`}
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                          <LockIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-confirm-password"
                        className="text-sm font-bold text-[#163d31]"
                      >
                        Confirm Password
                      </label>

                      <div className="relative">
                        <input
                          id="signup-confirm-password"
                          name="confirmPassword"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                          }
                          placeholder="Repeat your password"
                          className={`${inputClass} pr-11`}
                        />

                        <div className="pointer-events-none absolute right-4 top-1/2 mt-1 flex -translate-y-1/2 text-slate-400">
                          <LockIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p
                      id="signup-password-hint"
                      className="text-xs leading-5 text-slate-500"
                    >
                      Use at least 8 characters. A longer,
                      unique password is better.
                    </p>

                    <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
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

                      Show passwords
                    </label>
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-900/10 bg-emerald-50/50 px-4 py-4">
                    <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                    <p className="text-xs leading-6 text-slate-600">
                      Creating an account starts your
                      membership journey. Certified
                      membership requires application
                      approval and completion of the
                      certificate process.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={busy}
                      className={buttonClass}
                    >
                      {busy ? (
                        <>
                          <SpinnerIcon className="h-4 w-4 animate-spin" />
                          Creating your account…
                        </>
                      ) : (
                        <>
                          Create Secure Account
                          <ArrowIcon className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </fieldset>

                <div className="mt-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Existing Member
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <p className="mt-6 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-black text-[#063b25] underline decoration-emerald-700/30 underline-offset-4 transition hover:text-emerald-700"
                  >
                    Login to your account
                  </Link>
                </p>

                <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <LockIcon className="h-3.5 w-3.5" />
                  <span>
                    Secure ASBESOC member access
                  </span>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function JourneyItem({
  number,
  title,
  description,
  active = false,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-4 pb-6">
      {!last && (
        <div className="absolute left-[17px] top-9 h-[calc(100%-20px)] w-px bg-white/10" />
      )}

      <div
        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${
          active
            ? "border-amber-300/40 bg-amber-300 text-[#063b25]"
            : "border-white/10 bg-white/[0.05] text-white/55"
        }`}
      >
        {number}
      </div>

      <div className="pt-0.5">
        <p
          className={`text-sm font-bold ${
            active
              ? "text-white"
              : "text-white/70"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({
  verified,
}: {
  verified: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
        verified
          ? "bg-emerald-50 text-emerald-800"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          verified
            ? "bg-emerald-600"
            : "bg-amber-500"
        }`}
      />

      {verified
        ? "Email verified"
        : "Email verification required"}
    </span>
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
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
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

export default SignUp;