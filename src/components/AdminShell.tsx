import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { useRecords } from './adminRecords';
import { adminViews, type AdminView } from './adminNavigation';
import AdminIcon from './AdminIcon';
import AdminDashboard from './AdminDashboard';
import './admin-v2.css';

export default function AdminShell({ user, activeView, onOpen, logout, signingOut, children }: {
  user: User; activeView: AdminView; onOpen: (view: AdminView) => void;
  logout: () => void; signingOut: boolean; children: ReactNode;
}) {
  const members = useRecords('membershipApplications');
  const chats = useRecords('memberChats');
  const activity = useRecords('adminActivity');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [compact, setCompact] = useState(() => window.innerWidth <= 900);
  const [notifications, setNotifications] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const bellArea = useRef<HTMLDivElement>(null);
  const current = adminViews.find(item => item.id === activeView)!;
  const pending = members.rows.filter(row => ['new', 'pending', 'under_review'].includes(String(row.status))).length;
  const results = adminViews.filter(item => `${item.label} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  const name = user.displayName?.split(' ')[0] || 'Admin';
  function open(view: AdminView) { onOpen(view); setDrawer(false); setSearch(''); setNotifications(false); }
  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    function resize(event: MediaQueryListEvent) { setCompact(event.matches); if (!event.matches) setDrawer(false); }
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!drawer) return;
    const toggle = menuButton.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setDrawer(false); menuButton.current?.focus(); }
      if (event.key !== 'Tab') return;
      const items = sidebar.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]');
      if (!items?.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', keydown); toggle?.focus(); };
  }, [drawer]);
  useEffect(() => {
    if (!notifications) return;
    function dismiss(event: PointerEvent) { if (!bellArea.current?.contains(event.target as Node)) setNotifications(false); }
    function escape(event: KeyboardEvent) { if (event.key === 'Escape') setNotifications(false); }
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [notifications]);
  return <div className="asbesoc-control">
    <a className="v2-skip" href="#admin-workspace">Skip to workspace</a>
    {drawer && <div className="v2-backdrop" onClick={() => setDrawer(false)} />}
    <aside ref={sidebar} id="admin-navigation" inert={compact && !drawer || undefined} className={`v2-sidebar ${drawer ? 'is-open' : ''}`} aria-label="Admin navigation" role={drawer ? 'dialog' : undefined} aria-modal={drawer || undefined}>
      <div className="v2-brand"><span className="v2-emblem"><AdminIcon name="support" size={25}/></span><div>ASBESOC<small>BUILDING A BETTER SOCIETY</small></div><button className="v2-icon-button v2-mobile-close" aria-label="Close navigation" onClick={() => setDrawer(false)}><AdminIcon name="close"/></button></div>
      <div className="v2-admin-label">ADMIN WORKSPACE</div>
      <nav>{adminViews.map(item => <div key={item.id}>{'group' in item && <p className="v2-nav-group">{item.group}</p>}<button onClick={() => open(item.id)} aria-current={activeView === item.id ? 'page' : undefined} className={`v2-nav-item ${activeView === item.id ? 'selected' : ''}`}><AdminIcon name={item.icon}/><span>{item.label}</span>{item.id === 'membershipApplications' && !members.loading && !members.error && pending > 0 && <small>{pending}</small>}</button></div>)}</nav>
      <div className="v2-sidebar-bottom"><NavLink to="/"><AdminIcon name="website"/>View public website<AdminIcon name="arrow" size={15}/></NavLink><button onClick={logout} disabled={signingOut}><AdminIcon name="logout"/>{signingOut ? 'Signing out…' : 'Sign out'}</button><p>Purpose. People. Positive change.</p></div>
    </aside>
    <div className="v2-body" inert={drawer || undefined}>
      <header className="v2-topbar"><button ref={menuButton} className="v2-icon-button v2-mobile-toggle" aria-label="Open navigation" aria-expanded={drawer} aria-controls="admin-navigation" onClick={() => setDrawer(true)}><AdminIcon name="menu"/></button>
        <div className="v2-search"><AdminIcon name="search" size={19}/><input aria-label="Search admin sections" placeholder="Search your workspace…" value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') setSearch(''); if (event.key === 'Enter' && results[0]) open(results[0].id); }}/>{search && <div className="v2-search-results"><p>Workspace sections</p>{results.map(item => <button key={item.id} onClick={() => open(item.id)}><AdminIcon name={item.icon}/>{item.label}<AdminIcon name="arrow" size={16}/></button>)}{!results.length && <p>No matching sections.</p>}</div>}</div>
        <div className="v2-topbar-right"><span className="v2-date">{new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span><div ref={bellArea} className="v2-notifications"><button className="v2-icon-button" aria-label="Review notifications" aria-expanded={notifications} onClick={() => setNotifications(!notifications)}><AdminIcon name="bell"/>{pending > 0 && !members.error && <i/>}</button>{notifications && <section className="v2-popover"><h2>Needs your attention</h2>{members.loading ? <p role="status">Checking applications…</p> : members.error ? <p role="alert">Application notifications are unavailable.</p> : <button onClick={() => open('membershipApplications')}><span className="v2-mini-icon"><AdminIcon name="applications"/></span><span><b>{pending ? `${pending} application${pending === 1 ? '' : 's'} awaiting review` : 'Your review queue is clear'}</b><small>Open membership applications</small></span><AdminIcon name="arrow" size={16}/></button>}<p>Based on the current membership review queue.</p></section>}</div><button className="v2-profile" onClick={() => open('settings')} aria-label="Open administrator settings"><span className="v2-avatar">{name.slice(0, 2).toUpperCase()}</span><span><b>{name}</b><small>Administrator</small></span></button></div>
      </header>
      <main id="admin-workspace" className="v2-workspace"><div className="v2-page-title"><div><p>Workspace <span>/</span> {current.label}</p><h1>{current.label === 'Overview' ? 'Dashboard Overview' : current.label}</h1><small>{current.description}</small></div><span className="v2-secure"><AdminIcon name="check" size={14}/>Admin access</span></div>
      {activeView === 'overview' && <AdminDashboard name={name} members={members} chats={chats} activity={activity} onOpen={open}/>}
      {children}
      <footer className="v2-footer">ASBESOC Nigeria <span>Building a better society, together.</span></footer></main>
    </div>
  </div>;
}
