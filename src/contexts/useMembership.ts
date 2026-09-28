import { useEffect, useState } from "react";
import { watchApplication, memberError, type Application } from "../firebase/membership";

export function useMembership(uid: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ uid: string; revision: number; application: Application | null; error: string }>({ uid: "", revision: -1, application: null, error: "" });
  useEffect(() => watchApplication(uid,
    application => setState({ uid, revision, application, error: "" }),
    error => setState({ uid, revision, application: null, error: memberError(error) }),
  ), [uid, revision]);
  const current = state.uid === uid && state.revision === revision;
  return { application: current ? state.application : null, error: current ? state.error : "", loading: !current, retry: () => setRevision(value => value + 1) };
}
