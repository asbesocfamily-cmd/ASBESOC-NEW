import { useRef, useState, type FormEvent } from "react";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requestLock.current || auth.currentUser) return;

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
      <main className="flex min-h-[60vh] items-center justify-center bg-[#f3f7f3] px-4">
        <p
          role="status"
          className="text-sm font-semibold text-[#063b25]"
        >
          Checking your account…
        </p>
      </main>
    );
  }

  if (user && !busy) {
    return (
      <Navigate
        to={emailVerified ? "/dashboard" : "/verify-email"}
        replace
      />
    );
  }

  return (
    <main className="min-h-[75vh] bg-[#f3f7f3] px-4 py-8 sm:py-12">
      <section
        aria-labelledby="login-heading"
        className="mx-auto max-w-lg overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-xl"
      >
        <header className="bg-[#063b25] px-6 py-7 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
            ASBESOC Nigeria
          </p>

          <h1
            id="login-heading"
            className="mt-3 text-3xl font-black tracking-tight text-white"
          >
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-7 text-white/80">
            Login to access your account and continue your
            membership journey.
          </p>
        </header>

        <div className="px-6 py-7 sm:px-8">
          {error && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} aria-busy={busy}>
            <fieldset
              disabled={busy}
              className="min-w-0 space-y-5"
            >
              <legend className="sr-only">
                Login to your ASBESOC account
              </legend>

              <div>
                <label
                  htmlFor="login-email"
                  className="text-sm font-semibold text-[#063b25]"
                >
                  Email Address
                </label>

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
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-[#063b25]"
                >
                  Password
                </label>

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
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
                Show password
              </label>

              <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/50 px-4 py-3">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-[#063b25]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                    aria-describedby="login-remember-hint"
                    className="h-4 w-4 accent-emerald-800"
                  />
                  Keep me logged in on this device
                </label>

                <p
                  id="login-remember-hint"
                  className="mt-1 text-xs leading-6 text-slate-500"
                >
                  Choose this on your personal device. Leave it
                  unchecked on a shared computer.
                </p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                {busy ? "Logging in…" : "Login"}
              </button>
            </fieldset>

            <div aria-live="polite">
              {busy && (
                <p className="mt-3 text-center text-sm text-emerald-800">
                  Signing you in. Please wait.
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#063b25] underline underline-offset-4 hover:bg-emerald-50"
              >
                Forgot your password?
              </Link>
            </div>

            <p className="mt-5 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#063b25] underline underline-offset-4"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;