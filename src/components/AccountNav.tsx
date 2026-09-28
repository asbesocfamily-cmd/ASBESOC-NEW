import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

type AccountNavProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

function AccountNav({
  mobile = false,
  onNavigate,
}: AccountNavProps) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const logoutLock = useRef(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function closeAccountMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }

    onNavigate?.();
  }

  async function handleLogout() {
    if (logoutLock.current) return;

    logoutLock.current = true;
    setIsLoggingOut(true);
    setError("");

    try {
      await logout();
      closeAccountMenu();
      navigate("/", { replace: true });
    } catch {
      setError("Could not log out. Please try again.");
    } finally {
      logoutLock.current = false;
      setIsLoggingOut(false);
    }
  }

  const containerClass = mobile
    ? "mt-4 flex flex-col gap-2 border-t border-emerald-900/10 pt-4"
    : "flex shrink-0 items-center gap-2";

  const linkClass = [
    "inline-flex min-h-11 items-center justify-center rounded-xl",
    "px-3.5 py-2 text-sm font-bold transition-colors",
    mobile ? "w-full" : "whitespace-nowrap",
    focusClass,
  ].join(" ");

  if (loading) {
    return (
      <div className={containerClass}>
        <span
          role="status"
          className="px-3 py-2 text-xs text-slate-500"
        >
          Checking account…
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={containerClass}>
        <NavLink
          to="/login"
          onClick={closeAccountMenu}
          className={`${linkClass} border border-emerald-900/15 text-[#1B4332] hover:bg-emerald-50`}
        >
          Login
        </NavLink>

        <NavLink
          to="/signup"
          onClick={closeAccountMenu}
          className={`${linkClass} bg-[#1B4332] text-white hover:bg-[#285c45]`}
        >
          Sign Up
        </NavLink>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <NavLink
        to="/dashboard"
        onClick={closeAccountMenu}
        className={`${linkClass} bg-[#1B4332] text-white hover:bg-[#285c45]`}
      >
        My Dashboard
      </NavLink>

      <details
        ref={detailsRef}
        className={mobile ? "w-full" : "relative"}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;

          event.preventDefault();

          if (detailsRef.current) {
            detailsRef.current.open = false;
            detailsRef.current
              .querySelector("summary")
              ?.focus();
          }
        }}
      >
        <summary
          className={`${linkClass} cursor-pointer list-none gap-2 bg-emerald-50 text-[#1B4332] hover:bg-emerald-100 [&::-webkit-details-marker]:hidden`}
        >
          Account

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div
          className={[
            "rounded-xl border border-emerald-900/10 bg-white p-3",
            mobile
              ? "mt-2"
              : "absolute right-0 top-[calc(100%+10px)] z-[90] w-64 shadow-xl",
          ].join(" ")}
        >
          <p className="break-words text-sm font-bold text-[#1B4332]">
            {user.displayName || "Your account"}
          </p>

          <p className="mt-1 break-all text-xs leading-5 text-slate-500">
            {user.email}
          </p>

          <NavLink to="/dashboard/profile" onClick={closeAccountMenu} className={`mt-3 flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#063b25] hover:bg-emerald-50 ${focusClass}`}>My profile</NavLink>
          <NavLink to="/dashboard/settings" onClick={closeAccountMenu} className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#063b25] hover:bg-emerald-50 ${focusClass}`}>Account settings</NavLink>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`mt-3 flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
          >
            {isLoggingOut ? "Logging out…" : "Logout"}
          </button>

          {error && (
            <p
              role="alert"
              className="mt-2 text-xs leading-5 text-rose-700"
            >
              {error}
            </p>
          )}
        </div>
      </details>
    </div>
  );
}

export default AccountNav;
