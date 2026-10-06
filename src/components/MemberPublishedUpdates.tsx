import MediaPreview from "./MediaPreview";
import { useEffect, useState } from 'react';
import { activeBroadcast, watchBroadcasts, type Broadcast } from '../firebase/broadcasts';
import { watchMemberPosts, type MemberPost } from '../firebase/memberContent';

export default function MemberPublishedUpdates({ approved }: { approved: boolean }) {
  // The parent keys this component by eligibility, so old audience data is never retained.
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [posts, setPosts] = useState<MemberPost[]>([]);
  const [pending, setPending] = useState({ broadcasts: true, posts: true });
  const [errors, setErrors] = useState({ broadcasts: '', posts: '' });
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    const stopBroadcasts = watchBroadcasts(false, false, values => { setBroadcasts(values); setPending(value => ({ ...value, broadcasts: false })); setErrors(value => ({ ...value, broadcasts: '' })); }, () => { setBroadcasts([]); setPending(value => ({ ...value, broadcasts: false })); setErrors(value => ({ ...value, broadcasts: 'Broadcasts could not load.' })); }, approved);
    const stopPosts = watchMemberPosts(values => { setPosts(values); setPending(value => ({ ...value, posts: false })); setErrors(value => ({ ...value, posts: '' })); }, () => { setPosts([]); setPending(value => ({ ...value, posts: false })); setErrors(value => ({ ...value, posts: 'Member posts could not load.' })); }, true);
    return () => { clearInterval(timer); stopBroadcasts(); stopPosts(); };
  }, [approved]);
  const items = [
    ...broadcasts.filter(item => activeBroadcast(item) && (!item.expiresAt || item.expiresAt.toMillis() > now)).map(item => ({ ...item, key: `broadcast-${item.id}`, eventDate: "", actionUrl: "", actionLabel: "", label: item.priority === 'normal' ? 'Broadcast' : `${item.priority} broadcast` })),
    ...posts.filter(item => item.published).map(item => ({ ...item, key: `post-${item.id}`, label: item.type })),
  ].sort((a,b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  return <section className="mt-7 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-sm"><header className="border-b border-slate-100 px-5 py-5 sm:px-7"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600">Member feed</p><h2 className="mt-2 text-xl font-black text-[#063b25]">ASBESOC updates</h2><p className="mt-1 text-sm text-slate-500">Announcements, trainings, opportunities and notices from ASBESOC.</p></header><div className="space-y-4 p-5 sm:p-7">{(pending.broadcasts || pending.posts) && <p role="status" className="text-sm text-slate-500">Loading member updates…</p>}{(errors.broadcasts || errors.posts) && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{errors.broadcasts} {errors.posts} Please reload to retry.</p>}{items.map(item => <article key={item.key} className="rounded-2xl border border-slate-100 bg-[#f7faf8] p-5"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{item.label}</span><h3 className="mt-2 text-lg font-bold text-[#063b25]">{item.title}</h3>{item.poster && <MediaPreview item={item.poster} className="mt-4 max-h-[520px] max-w-full rounded-xl object-contain"/>}{item.eventDate && <p className="mt-2 text-xs text-emerald-800">Date: {item.eventDate}</p>}<p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{item.body}</p>{item.actionUrl && <a href={item.actionUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-emerald-800 underline">{item.actionLabel || "View details"}</a>}<time className="mt-3 block text-xs text-slate-400">{item.createdAt?.toDate().toLocaleDateString('en-NG', { dateStyle: 'medium' })}</time></article>)}{!pending.broadcasts && !pending.posts && !errors.broadcasts && !errors.posts && !items.length && <p className="py-6 text-sm text-slate-500">No published updates yet. New messages from ASBESOC will appear here.</p>}</div></section>;
}
