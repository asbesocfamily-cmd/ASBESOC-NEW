import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsAvailable, analyticsConsent, setAnalyticsConsent, trackWebsiteEvent } from '../firebase/analytics';

export default function WebsiteAnalytics() {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState(analyticsConsent);
  const previous = useRef('');
  useEffect(() => {
    const changed = () => setConsent(analyticsConsent());
    window.addEventListener('asbesoc-consent', changed);
    window.addEventListener('storage', changed);
    return () => { window.removeEventListener('asbesoc-consent', changed); window.removeEventListener('storage', changed); };
  }, []);
  useEffect(() => {
    if (consent !== 'accepted') return;
    void trackWebsiteEvent('page', pathname, previous.current);
    previous.current = pathname;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void trackWebsiteEvent('heartbeat', pathname);
    }, 60000);
    return () => window.clearInterval(timer);
  }, [pathname, consent]);
  if (!analyticsAvailable || consent || pathname.startsWith('/admin')) return null;
  return <aside aria-label="Optional visitor analytics" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-xl border border-emerald-200 bg-white p-5 text-sm text-slate-800 shadow-xl">
    <p>May we collect optional visit statistics to improve ASBESOC? We use random identifiers, page names and broad device information. We do not collect form contents or precise location. Records are kept for up to 90 days. <Link className="underline" to="/privacy">Privacy and choices</Link></p>
    <div className="mt-3 flex gap-3"><button className="rounded-lg bg-emerald-900 px-4 py-2 text-white" onClick={() => setAnalyticsConsent('accepted')}>Allow analytics</button><button className="rounded-lg border px-4 py-2" onClick={() => setAnalyticsConsent('declined')}>Decline</button></div>
  </aside>;
}
