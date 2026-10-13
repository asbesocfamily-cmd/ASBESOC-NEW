import { useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { certificationError, downloadCertificate, membershipCall, membershipServiceEnabled } from '../firebase/certification';
import { isCertifiedMember, type Application } from '../firebase/membership';

export default function AnnualMembership({ application }: { application: Application }) {
  const [currency, setCurrency] = useState('NGN');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now);
  const expiry = application.membershipExpiresAt?.toMillis() || 0;
  const active = isCertifiedMember(application) && expiry > now;
  const renewable = application.status === 'approved' && application.certificateStatus !== 'revoked' && expiry - now <= 30 * 86400000;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!membershipServiceEnabled) return;
    return onSnapshot(query(collection(db, 'membershipReminders', application.userId, 'items'), orderBy('createdAt', 'desc'), limit(3)),
      snapshot => setReminders(snapshot.docs.filter(item => item.id.startsWith(`${application.certificateNumber}-`)).map(item => String(item.data().message))),
      () => setMessage('Renewal reminders could not load. Your expiry date is shown below.'));
  }, [application.userId, application.certificateNumber]);
  async function act(action: () => Promise<void>) {
    setBusy(true); setMessage('');
    try { await action(); } catch (error) { setMessage(certificationError(error)); }
    finally { setBusy(false); }
  }
  const button = 'rounded-xl bg-[#063b25] px-5 py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed';
  return <section className="mt-6 rounded-2xl border border-emerald-900/15 bg-white p-6">
    <h3 className="text-xl font-black text-[#063b25]">Annual membership & certificate</h3>
    <p className="mt-3">₦5,000 or US$5 per year. Membership lasts one year from its start date.</p>
    <p className="mt-3 font-bold">{application.certificateStatus === 'revoked' ? 'Membership revoked — contact ASBESOC' : active ? 'Certified membership active' : expiry && expiry <= now ? 'Membership expired — renewal required' : application.status === 'approved' ? 'Approved — certification requires verified payment' : 'Awaiting membership approval'}</p>
    {expiry > 0 && <p>Valid until {new Date(expiry).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}.</p>}
    <p className="mt-2 text-sm text-slate-600">Renewals open 30 days before expiry. Early renewal adds one year after your current term; late renewal starts a new term.</p>
    {!membershipServiceEnabled && <p className="mt-3 rounded-xl bg-amber-50 p-3" role="status">Payments are not available yet. No charge can be made and no certificate can be issued until secure payment verification is activated.</p>}
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <label>Payment currency <select className="ml-2 rounded-lg border p-2" value={currency} onChange={event => setCurrency(event.target.value)}><option value="NGN">₦5,000 NGN</option><option value="USD">US$5 USD</option></select></label>
      <button className={button} disabled={busy || !renewable || !membershipServiceEnabled} onClick={() => void act(async () => {
        const result = await membershipCall<{ url: string }>('membershipCheckout', { currency });
        const url = new URL(result.url);
        if (url.protocol !== 'https:' || url.hostname !== 'checkout.paystack.com') throw new Error('Invalid checkout destination.');
        window.location.assign(url.href);
      })}>{busy ? 'Please wait…' : expiry ? 'Renew membership' : 'Pay annual membership'}</button>
      {membershipServiceEnabled && new URLSearchParams(window.location.search).has('reference') && <button className={button} disabled={busy} onClick={() => void act(async () => {
        await membershipCall('confirmMembershipPayment', { reference: new URLSearchParams(window.location.search).get('reference') });
        setMessage('Payment verified by the server. Your membership record will update automatically.');
      })}>Check payment with provider</button>}
      {active && application.certificateNumber && <>
        <button className={button} disabled={busy || !membershipServiceEnabled} onClick={() => void act(() => downloadCertificate(application.certificateNumber!))}>Download certificate PDF</button>
        <Link className="font-bold underline" to={`/verify-certificate/${application.certificateNumber}`}>Verify certificate</Link>
      </>}
    </div>
    <p className="mt-3 text-sm text-slate-600">Certified training access requires current, unrevoked membership. Currency availability depends on the payment provider setup.</p>
    {message && <p role="status" className="mt-3">{message}</p>}
    {reminders.map((reminder, index) => <p key={index} className="mt-3 rounded-xl bg-amber-50 p-3">{reminder}</p>)}
  </section>;
}
