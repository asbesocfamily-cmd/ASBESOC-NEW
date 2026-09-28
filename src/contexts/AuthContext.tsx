import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  reload,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

import { AuthContext, type AuthContextValue } from "./auth-context";

async function logout() {
  await signOut(auth);
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setEmailVerified(currentUser?.emailVerified ?? false);
      setDisplayName(currentUser?.displayName || "");
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    async function refreshUser() {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUser(null);
        setEmailVerified(false);
        setDisplayName("");
        return;
      }

      await reload(currentUser);
      await currentUser.getIdToken(true);

      if (auth.currentUser !== currentUser) {
        return;
      }

      setUser(currentUser);
      setEmailVerified(currentUser.emailVerified);
      setDisplayName(currentUser.displayName || "");
    }

    return {
      user,
      loading,
      emailVerified,
      displayName,
      refreshUser,
      logout,
    };
  }, [user, loading, emailVerified, displayName]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

