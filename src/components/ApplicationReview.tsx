import { useRef, useState } from "react";
import { memberError, reviewApplication, type ApplicationStatus } from "../firebase/membership";

export default function ApplicationReview({ id, status, linked, onSaved }: { id: string; status: string; linked: boolean; onSaved: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  async function decide(next: ApplicationStatus) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try { await reviewApplication(id, status, next, note); onSaved(); }
    catch (caught) { setError(memberError(caught)); }
    finally { lock.current = false; setBusy(false); }
  }
  if (!["new", "pending", "under_review"].includes(status)) return <p className="mt-5 text-sm text-emerald-800">This application has a final review decision.</p>;
  return <div className="mt-6 rounded-xl border border-emerald-900/15 bg-emerald-50/40 p-4">
    <h3 className="font-bold text-[#063b25]">Review application</h3>
    {!linked && <p className="mt-2 text-sm text-amber-900">This is an older application without a linked account. A review here will not appear in a member dashboard until ownership is verified and the application is linked.</p>}
    <label className="mt-4 block text-sm font-semibold text-[#063b25]">Note for the applicant (required for rejection)<textarea className="mt-2 block min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700" value={note} onChange={event => setNote(event.target.value)} maxLength={2000} disabled={busy} /></label>
    <p className="mt-2 text-xs text-slate-600">Approval allows the applicant to move to the certificate stage. It does not grant certified membership.</p>
    <div className="mt-4 flex flex-wrap gap-3">{([["under_review", "Mark under review"], ["approved", "Approve application"], ["rejected", "Reject application"]] as const).map(([value, label]) => <button key={value} type="button" disabled={busy || value === status || (value === "rejected" && !note.trim())} onClick={() => void decide(value)} className="min-h-11 rounded-xl border border-emerald-900/20 bg-white px-4 py-2 text-sm font-bold text-[#063b25] hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-50">{label}</button>)}</div>
    {busy && <p role="status" className="mt-3 text-sm">Saving review…</p>}{error && <p role="alert" className="mt-3 text-sm text-rose-800">{error}</p>}
  </div>;
}
