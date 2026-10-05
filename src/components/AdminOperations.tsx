import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { collection, doc, onSnapshot, orderBy, query, limit, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { activeBroadcast, deleteBroadcast, saveBroadcast, watchBroadcasts, type Broadcast, type BroadcastInput } from "../firebase/broadcasts";

import { useRecords, type RecordRow } from "./adminRecords";
function formatDate(value: unknown) { return value instanceof Timestamp ? value.toDate().toLocaleString() : "—"; }
export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="control-panel"><div className="control-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</section>;
}
function RecordState({ state }: { state: ReturnType<typeof useRecords> }) {
  return state.error ? <p role="alert" className="control-error">{state.error}</p> : state.loading ? <p role="status" className="control-empty">Loading records…</p> : !state.rows.length ? <p className="control-empty">No records yet.</p> : null;
}

function time(value: unknown) { return value instanceof Timestamp ? value.toMillis() : 0; }

export function MemberDirectory() {
  const state = useRecords("membershipApplications");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("approved");
  const rows = state.rows.filter(row => (status === "all" || row.status === status) && [row.fullName, row.email, row.phone, row.country, row.state].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <Panel title="Members" description="Membership records and contact information"><div className="control-toolbar"><label>Search members<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, phone or location" /></label><label>Membership status<select value={status} onChange={e => setStatus(e.target.value)}><option value="approved">Approved members</option><option value="all">All applicants</option><option value="pending">Pending</option><option value="under_review">Under review</option><option value="rejected">Rejected</option></select></label></div><RecordState state={state}/>
    <div className="control-table-wrap"><table className="control-table"><thead><tr><th>Member</th><th>Contact</th><th>Location</th><th>Status</th><th>Joined / applied</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><b>{String(row.fullName || "Member")}</b><details><summary>Profile details</summary><dl>{["occupation", "qualification", "skills", "membershipInterests"].map(key => <div key={key}><dt>{key.replace(/([A-Z])/g," $1")}</dt><dd>{Array.isArray(row[key]) ? row[key].join(", ") : String(row[key] || "—")}</dd></div>)}</dl></details></td><td>{String(row.email || "—")}<small>{String(row.phone || "")}</small></td><td>{[row.state || row.region, row.country].filter(Boolean).join(", ")}</td><td><span className="control-badge">{String(row.status).replaceAll("_", " ")}</span></td><td>{formatDate(row.createdAt)}</td></tr>)}</tbody></table></div>{!state.loading && !state.error && !rows.length && <p className="control-empty">No members match these filters.</p>}
  </Panel>;
}

export function BroadcastCentre() {
  const [items, setItems] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Broadcast | undefined>();
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  useEffect(() => watchBroadcasts(true, false, values => { setItems(values); setLoading(false); }, () => { setError("Broadcasts could not load. Reload to retry."); setLoading(false); }), []);
  async function action(item: Broadcast, remove: boolean) {
    if (busy || !window.confirm(remove ? `Delete “${item.title}”? This cannot be undone.` : `${item.published ? "Unpublish" : "Publish"} “${item.title}”?`)) return;
    setBusy(true); setError("");
    try { if (remove) await deleteBroadcast(item); else await saveBroadcast({ ...item, published: !item.published }, item); }
    catch (error) { setError(error instanceof Error ? error.message : "The broadcast could not be saved."); }
    finally { setBusy(false); }
  }
  const visible = items.filter(item => `${item.title} ${item.body}`.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || (filter === "draft" ? !item.published : filter === "active" ? activeBroadcast(item) : item.published && !activeBroadcast(item))));
  return <div className="control-stack"><BroadcastEditor key={version} existing={editing} onSaved={() => { setEditing(undefined); setVersion(value => value + 1); }}/><Panel title="Broadcast library" description="Manage dashboard notices, their audiences and publishing state"><div className="control-toolbar"><label>Search broadcasts<input value={search} onChange={e => setSearch(e.target.value)}/></label><label>State<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All broadcasts</option><option value="active">Active</option><option value="draft">Unpublished</option><option value="expired">Expired</option></select></label></div>{error && <p role="alert" className="control-error">{error}</p>}{loading && <p role="status">Loading broadcasts…</p>}
    {visible.map(item => <article key={item.id} className="control-post"><div className="control-post-meta"><span className={`control-badge ${item.priority === "urgent" ? "gold" : ""}`}>{item.priority}</span><span>{item.audience === "all_members" ? "All verified members" : "Approved members"}</span><span>{!item.published ? "Unpublished" : activeBroadcast(item) ? "Active" : "Expired"}</span></div><h3>{item.title}</h3><p className="control-body">{item.body}</p><small>Created {formatDate(item.createdAt)} · Updated {formatDate(item.updatedAt)} · {item.expiresAt ? `Expires ${formatDate(item.expiresAt)}` : "No expiry"}</small><div className="control-actions"><button className="control-button" disabled={busy} onClick={() => {setEditing(item); setVersion(value => value + 1); window.scrollTo({ top: 0, behavior: "smooth" });}}>Edit</button><button className="control-button" disabled={busy} onClick={() => void action(item, false)}>{item.published ? "Unpublish" : "Publish"}</button><button className="control-button danger" disabled={busy} onClick={() => void action(item, true)}>Delete</button></div></article>)}{!loading && !error && !visible.length && <p className="control-empty">No broadcasts match this view.</p>}</Panel></div>;
}
function localDate(value: Timestamp | null | undefined) {
  if (!value) return "";
  const date = value.toDate(); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
function BroadcastEditor({ existing, onSaved }: { existing?: Broadcast; onSaved: () => void }) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [priority, setPriority] = useState<BroadcastInput["priority"]>(existing?.priority ?? "normal");
  const [audience, setAudience] = useState<BroadcastInput["audience"]>(existing?.audience ?? "all_members");
  const [expiry, setExpiry] = useState(localDate(existing?.expiresAt));
  const [published, setPublished] = useState(existing?.published ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError("");
    try { await saveBroadcast({ title, body, priority, audience, published, expiresAt: expiry ? Timestamp.fromDate(new Date(expiry)) : null }, existing); onSaved(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not save broadcast."); }
    finally { setBusy(false); }
  }
  return <Panel title={existing ? "Edit broadcast" : "Broadcast Centre"} description="Publish a clear, timely notice to member dashboards."><form onSubmit={save} className="control-form"><label>Title<input required maxLength={180} value={title} onChange={e => setTitle(e.target.value)}/></label><label>Message<textarea required rows={5} maxLength={6000} value={body} onChange={e => setBody(e.target.value)}/><small>{body.length.toLocaleString()} / 6,000 characters</small></label><div className="control-toolbar"><label>Priority<select value={priority} onChange={e => setPriority(e.target.value as BroadcastInput["priority"])}><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label><label>Audience<select value={audience} onChange={e => setAudience(e.target.value as BroadcastInput["audience"])}><option value="all_members">All verified members</option><option value="approved_members">Approved members</option></select></label><label>Optional expiry (your local time)<input type="datetime-local" value={expiry} onChange={e => setExpiry(e.target.value)}/></label></div><label className="control-checkbox"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}/>Published on member dashboards</label>{error && <p className="control-error" role="alert">{error}</p>}<div className="control-actions"><button disabled={busy} className="control-button primary">{busy ? "Saving…" : published ? "Save & publish" : "Save unpublished"}</button>{existing && <button type="button" disabled={busy} className="control-button" onClick={onSaved}>Cancel editing</button>}</div></form></Panel>;
}

export function RequestWorkflow({ id, collectionName, current, onSaved }: { id: string; collectionName: string; current: string; onSaved: () => void }) {
  const [status, setStatus] = useState(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (busy) return; setBusy(true); setError("");
    try { await updateDoc(doc(db, collectionName, id), { status, updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid }); onSaved(); }
    catch { setError("Could not update this request. Please try again."); } finally { setBusy(false); }
  }
  return <div className="control-toolbar"><label>Request status<select value={status} onChange={e => setStatus(e.target.value)}><option value="new">New</option><option value="in_progress">In progress</option><option value="closed">Closed</option></select></label><button className="control-button" disabled={busy || status === current} onClick={() => void save()}>{busy ? "Saving…" : "Update status"}</button>{error && <p className="control-error" role="alert">{error}</p>}</div>;
}

export function ActivityPanel() {
  const [events, setEvents] = useState<RecordRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const members = useRecords("membershipApplications");
  const support = useRecords("supportRequests");
  const partnerships = useRecords("partnershipRequests");
  const posts = useRecords("memberFeed");
  const pages = useRecords("siteContent");
  useEffect(() => onSnapshot(query(collection(db,"adminActivity"), orderBy("createdAt","desc"),limit(100)), snapshot => {setEvents(snapshot.docs.map(item => ({ ...item.data(), id: item.id }))); setLoading(false);}, () => {setError("Broadcast activity could not load."); setLoading(false);}), []);
  const recent = [...events.map(row => ({ id: `event-${row.id}`, title: String(row.title), action: String(row.action), date: row.createdAt })),
    ...members.rows.map(row => ({ id: `member-${row.id}`, title: String(row.fullName || "Member application"), action: row.reviewedAt ? `Membership ${row.status}` : "Application received", date: row.reviewedAt || row.createdAt })),
    ...[...support.rows.map<RecordRow>(row => ({...row, id: `support-${row.id}`})), ...partnerships.rows.map<RecordRow>(row => ({...row, id: `partnership-${row.id}`}))].map(row => ({ id: `request-${row.id}`, title: String(row.organization || row.fullNameOrOrganization || "Submission"), action: `Request ${row.status}`, date: row.updatedAt || row.createdAt })),
    ...posts.rows.map(row => ({ id: `post-${row.id}`, title: String(row.title), action: `${row.type} ${row.published ? "published" : "unpublished"}`, date: row.updatedAt || row.createdAt })),
    ...pages.rows.map(row => ({ id: `page-${row.id}`, title: row.id, action: "Website content saved", date: row.updatedAt })),
  ].filter(item => time(item.date)).sort((a,b) => time(b.date) - time(a.date)).slice(0, 100);
  return <Panel title="Activity" description="Broadcast action history and latest recorded changes to membership, requests and content.">{(error || [members,support,partnerships,posts,pages].some(state => state.error)) && <p role="alert" className="control-error">Some activity records could not load. Reload to retry.</p>}{(loading || [members,support,partnerships,posts,pages].some(state => state.loading)) && <p role="status">Loading activity…</p>}{recent.map(item => <div className="control-list-row" key={item.id}><span><b>{item.action}</b><small>{item.title}</small></span><time>{formatDate(item.date)}</time></div>)}{!loading && !error && ![members,support,partnerships,posts,pages].some(state => state.loading || state.error) && !recent.length && <p className="control-empty">No recorded activity.</p>}</Panel>;
}

