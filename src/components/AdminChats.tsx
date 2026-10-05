import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, writeBatch, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import AdminIcon from './AdminIcon';
type Chat = { id: string; memberName: string; memberEmail: string };
type Message = { id: string; senderRole: 'member' | 'admin'; text: string; createdAt: Timestamp | null };
export default function AdminChats({ adminUser }: { adminUser: User }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => onSnapshot(query(collection(db, 'memberChats'), orderBy('updatedAt', 'desc')), snapshot => {
    const values = snapshot.docs.map(item => ({ id: item.id, memberName: String(item.data().memberName || 'ASBESOC member'), memberEmail: String(item.data().memberEmail || '') }));
    setChats(values); setLoading(false); setError('');
    setSelected(current => values.some(chat => chat.id === current) ? current : values[0]?.id || '');
  }, () => { setError('Could not load member conversations. Reload to retry.'); setLoading(false); }), []);
  const active = chats.find(chat => chat.id === selected);
  const visible = chats.filter(chat => `${chat.memberName} ${chat.memberEmail}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="v2-inbox"><aside className="v2-chat-list"><div className="v2-inbox-title"><h2>Conversations</h2><span>{loading ? '…' : error ? '—' : chats.length}</span></div><label className="v2-chat-search"><AdminIcon name="search" size={17}/><input aria-label="Search conversations" placeholder="Find a member…" value={search} onChange={event => setSearch(event.target.value)}/></label>{loading && <p role="status" className="v2-empty">Loading conversations…</p>}{error && <p role="alert" className="control-error">{error}</p>}{visible.map(chat => <button key={chat.id} className={`v2-inbox-person ${chat.id === selected ? 'active' : ''}`} aria-pressed={chat.id === selected} onClick={() => setSelected(chat.id)}><span className="v2-avatar soft">{chat.memberName.slice(0,2).toUpperCase()}</span><span><b>{chat.memberName}</b><small>{chat.memberEmail}</small></span><AdminIcon name="arrow" size={14}/></button>)}{!loading && !error && !visible.length && <p className="v2-empty">{chats.length ? 'No matching conversations.' : 'No conversations yet.'}</p>}</aside>{active ? <ChatThread key={active.id} chat={active} adminUser={adminUser}/> : <div className="v2-chat-placeholder"><AdminIcon name="chat" size={44}/><h3>Your member inbox</h3><p>Select a conversation to read and reply.</p></div>}</section>;
}
function ChatThread({ chat, adminUser }: { chat: Chat; adminUser: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => onSnapshot(query(collection(db, 'memberChats', chat.id, 'messages'), orderBy('createdAt', 'asc')), snapshot => {
    setMessages(snapshot.docs.map(item => ({ id: item.id, senderRole: item.data().senderRole === 'admin' ? 'admin' : 'member', text: String(item.data().text || ''), createdAt: item.data().createdAt || null })));
    setLoading(false); setLoadError('');
  }, () => { setLoading(false); setLoadError('This conversation could not load. Select it again to retry.'); }), [chat.id]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (lock.current || !reply.trim()) return;
    lock.current = true; setBusy(true); setSendError('');
    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, 'memberChats', chat.id, 'messages')), { senderId: adminUser.uid, senderRole: 'admin', text: reply.trim().slice(0,4000), createdAt: serverTimestamp() });
      batch.update(doc(db, 'memberChats', chat.id), { updatedAt: serverTimestamp() });
      await batch.commit(); setReply('');
    } catch { setSendError('Reply could not be sent. Your message is still here; please try again.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="v2-thread"><header><span className="v2-avatar soft">{chat.memberName.slice(0,2).toUpperCase()}</span><div><h3>{chat.memberName}</h3><p>{chat.memberEmail}</p></div><span className="control-badge">Private chat</span></header><div className="v2-message-list" role="log" aria-label={`Messages with ${chat.memberName}`} aria-live="polite">{loading && <p role="status" className="v2-empty">Loading messages…</p>}{loadError && <p role="alert" className="control-error">{loadError}</p>}{!loading && !loadError && !messages.length && <p className="v2-empty">No messages in this conversation yet.</p>}{messages.map(message => <div key={message.id} className={`v2-message ${message.senderRole}`}><p>{message.text}</p><small>{message.senderRole === 'admin' ? 'You' : chat.memberName} · {message.createdAt?.toDate().toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }) || 'Sending…'}</small></div>)}<div ref={end}/></div>{sendError && <p className="control-error" role="alert">{sendError}</p>}<form onSubmit={send} className="v2-reply"><textarea aria-label={`Reply to ${chat.memberName}`} placeholder="Write a thoughtful reply…" value={reply} disabled={busy || loading || !!loadError} maxLength={4000} rows={2} onChange={event => setReply(event.target.value)}/><button className="control-button primary" disabled={busy || loading || !!loadError || !reply.trim()}>{busy ? 'Sending…' : 'Send reply'}<AdminIcon name="arrow" size={16}/></button></form></div>;
}
