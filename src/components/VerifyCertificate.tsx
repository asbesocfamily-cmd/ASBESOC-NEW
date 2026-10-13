import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { certificationError, membershipCall, membershipServiceEnabled } from '../firebase/certification';
type Verification = { status: string; id?: string; fullName?: string; startsAt?: string; expiresAt?: string };
export default function VerifyCertificate() {
  const { id = '' } = useParams();
  const [state, setState] = useState<{ id: string; result?: Verification; error?: string }>();
  useEffect(() => {
    if (!membershipServiceEnabled) return;
    let current = true;
    membershipCall<Verification>('verifyMembershipCertificate', { id }).then(
      result => { if (current) setState({ id, result }); },
      error => { if (current) setState({ id, error: certificationError(error) }); });
    return () => { current = false; };
  }, [id]);
  const result = state?.id === id ? state.result : undefined;
  return <main className="mx-auto min-h-[65vh] max-w-3xl px-6 py-28">
    <h1 className="text-3xl font-black text-[#063b25]">Verify ASBESOC membership</h1>
    <p className="mt-4">This page checks the current certificate record. A PDF alone is not proof of current membership.</p>
    {!membershipServiceEnabled ? <p role="status" className="mt-6">Public certificate verification is awaiting activation. Contact ASBESOC to confirm a certificate.</p> : state?.id === id && state.error ? <p role="alert">Verification unavailable: {state.error}</p> : !result ? <p role="status">Checking certificate…</p> : <section className="mt-6 rounded-2xl border p-6">
      <h2 className="text-xl font-bold">{({valid:'Valid membership certificate',expired:'Certificate expired',revoked:'Membership revoked',not_found:'Certificate not found',not_yet_valid:'Certificate term has not started'} as Record<string,string>)[result.status] || 'Verification unavailable'}</h2>
      {result.id && <><p className="mt-4">{result.fullName}</p><p className="break-all">{result.id}</p><p>Valid from {new Date(result.startsAt!).toLocaleDateString()} until {new Date(result.expiresAt!).toLocaleDateString()}.</p></>}
    </section>}
  </main>;
}
