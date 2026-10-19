import { httpsCallable, getFunctions } from 'firebase/functions';
import app, { auth } from './firebaseConfig';

export const analyticsAvailable = import.meta.env.VITE_WEBSITE_ANALYTICS_ENABLED === 'true';
export const analyticsCall = <T,>(name: string, data: unknown) => httpsCallable<unknown, T>(getFunctions(app, 'europe-west1'), name)(data).then(r => r.data);
const consentKey = 'asbesoc-analytics-consent';
export function analyticsConsent() {
  try { return localStorage.getItem(consentKey); } catch { return 'declined'; }
}
export function setAnalyticsConsent(value: 'accepted' | 'declined') {
  try {
    localStorage.setItem(consentKey, value);
    if (value === 'declined') { localStorage.removeItem('asbesoc-visitor'); sessionStorage.removeItem('asbesoc-session'); }
  } catch { /* Tracking stays disabled if browser storage is unavailable. */ }
  window.dispatchEvent(new Event('asbesoc-consent'));
}
export async function trackWebsiteEvent(kind: 'page' | 'heartbeat' | 'signup', page = window.location.pathname, previous = '') {
  if (!analyticsAvailable || analyticsConsent() !== 'accepted' || navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl || page.startsWith('/admin')) return;
  try {
    const now = Date.now();
    let visitor = JSON.parse(localStorage.getItem('asbesoc-visitor') || 'null');
    if (!visitor || visitor.expires < now) visitor = { id: crypto.randomUUID(), expires: now + 90 * 86400000 };
    localStorage.setItem('asbesoc-visitor', JSON.stringify(visitor));
    let session = JSON.parse(sessionStorage.getItem('asbesoc-session') || 'null');
    if (!session || session.last < now - 30 * 60000) session = { id: crypto.randomUUID(), last: now };
    session.last = now; sessionStorage.setItem('asbesoc-session', JSON.stringify(session));
    const agent = navigator.userAgent;
    const browser = /Edg\//.test(agent) ? 'Edge' : /Firefox/.test(agent) ? 'Firefox' : /Chrome|CriOS/.test(agent) ? 'Chrome' : /Safari/.test(agent) ? 'Safari' : 'Other';
    const os = /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Windows/.test(agent) ? 'Windows' : /Mac/.test(agent) ? 'macOS' : /Linux/.test(agent) ? 'Linux' : 'Other';
    if (kind === 'signup' && !auth.currentUser) return;
    await analyticsCall('recordWebsiteVisit', { eventId: crypto.randomUUID(), visitorId: visitor.id, sessionId: session.id, kind,
      page, previous, referrer: document.referrer, browser, os,
      device: /iPad|Tablet/.test(agent) ? 'Tablet' : /Mobi/.test(agent) ? 'Mobile' : 'Desktop' });
  } catch { /* Analytics must never interrupt a visitor's task. */ }
}
