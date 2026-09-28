import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

type RequireAuthProps = {
  requireVerifiedEmail?: boolean;
};

function RequireAuth({
  requireVerifiedEmail = true,
}: RequireAuthProps) {
  const { user, loading, emailVerified } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireVerifiedEmail && !emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}

export default RequireAuth;