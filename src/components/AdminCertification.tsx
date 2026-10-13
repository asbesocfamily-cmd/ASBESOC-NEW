import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { certificationError, membershipCall, membershipServiceEnabled } from '../firebase/certification';
export default function AdminCertification() {
  const [members, setMembers] = useState<DocumentData[]>([]);
  const [payments, setPayments] = useState<DocumentData[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 30000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!membershipServiceEnabled) return;
    const fail = () => setError('Records could not load. Check server activation and access permissions.');
    const a = onSnapshot(query(collection(db, 'memberships'), orderBy('updatedAt', 'desc'), limit(100)), snap => setMembers(snap.docs.map(d => ({...d.data(), uid:d.id}))), fail);
    const b = onSnapshot(query(collection(db, 'paymentOrders'), orderBy('createdAt', 'desc'), limit(100)), snap => setPayments(snap.docs.map(d => d.data())), fail);
    return () => { a(); b(); };
  }, []);
  async function revoke() {
    setBusy(true); setError('');
    try { await membershipCall('revokeMembership', { uid: selected, reason }); setSelected(''); setReason(''); }
    catch (e) { setError(certificationError(e)); } finally { setBusy(false); }
  }
  return <div className="control-stack"><section className="control-panel">
    <h2>Annual certification & payments</h2><p>Annual fees: ₦5,000 / US$5. Only server-verified live payments can issue certificates.</p>
    {!membershipServiceEnabled && <p role="status">Service not activated. Checkout is disabled. Deploy and verify the backend before enabling access.</p>}
    {error && <p role="alert">{error}</p>}
    <h3 className="mt-6 font-bold">Latest memberships (up to 100)</h3>
    <div className="control-table-wrap"><table className="control-table"><thead><tr><th>Name</th><th>Status</th><th>Expires</th><th>Certificate</th><th>Action</th></tr></thead><tbody>{members.map(member => <tr key={member.uid}><td>{member.fullName}</td><td>{member.status === 'revoked' ? 'Revoked' : member.expiresAt?.toMillis() > now ? 'Active' : 'Expired'}</td><td>{member.expiresAt?.toDate().toLocaleDateString()}</td><td><a href={`/verify-certificate/${member.certificateId}`} target="_blank" rel="noreferrer">Verify</a></td><td><button className="control-button danger" disabled={member.status === 'revoked'} onClick={() => setSelected(member.uid)}>Review revocation</button></td></tr>)}</tbody></table></div>
    {selected && <form className="control-form" onSubmit={e => {e.preventDefault(); void revoke();}}><p>Revoking this membership removes certified access and invalidates all its certificates. This action is recorded.</p><label>Reason<textarea required minLength={5} maxLength={2000} value={reason} onChange={e => setReason(e.target.value)}/></label><button disabled={busy} className="control-button danger">Confirm revocation</button><button type="button" className="control-button" onClick={() => setSelected('')}>Cancel</button></form>}
    <h3 className="mt-6 font-bold">Latest payment orders (up to 100)</h3>
    <div className="control-table-wrap"><table className="control-table"><thead><tr><th>Reference</th><th>Amount</th><th>Status</th></tr></thead><tbody>{payments.map(payment => <tr key={payment.reference}><td>{payment.reference}</td><td>{payment.currency} {(payment.amountMinor/100).toFixed(2)}</td><td>{payment.status}</td></tr>)}</tbody></table></div>
  </section></div>;
}
