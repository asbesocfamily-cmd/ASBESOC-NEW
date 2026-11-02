import { httpsCallable, getFunctions } from 'firebase/functions';
import app, { auth } from './firebaseConfig';
import { analyticsAvailable, analyticsConsent } from './analyticsConsent';
import { getAnalyticsIdentifiers } from './analyticsIdentifiers';

export {
  analyticsAvailable,
  analyticsConsent,
  setAnalyticsConsent,
} from './analyticsConsent';
export const analyticsCall = <T,>(name: string, data: unknown) => httpsCallable<unknown, T>(getFunctions(app, 'europe-west1'), name)(data).then(r => r.data);

export async function trackWebsiteEvent(kind: 'page' | 'heartbeat' | 'signup' | 'application', page = window.location.pathname, previous = '') {
  if (!analyticsAvailable || analyticsConsent() !== 'accepted' || navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl || page.startsWith('/admin')) return;
  try {
    const { visitorId, sessionId } = getAnalyticsIdentifiers();
    const agent = navigator.userAgent;
    const browser = /Edg\//.test(agent) ? 'Edge' : /Firefox/.test(agent) ? 'Firefox' : /Chrome|CriOS/.test(agent) ? 'Chrome' : /Safari/.test(agent) ? 'Safari' : 'Other';
    const os = /Android/.test(agent) ? 'Android' : /iPhone|iPad/.test(agent) ? 'iOS' : /Windows/.test(agent) ? 'Windows' : /Mac/.test(agent) ? 'macOS' : /Linux/.test(agent) ? 'Linux' : 'Other';
    if (['signup', 'application'].includes(kind) && !auth.currentUser) return;
    await analyticsCall('recordWebsiteVisit', { eventId: crypto.randomUUID(), visitorId, sessionId, kind,
      page, previous, referrer: document.referrer, browser, os,
      device: /iPad|Tablet/.test(agent) ? 'Tablet' : /Mobi/.test(agent) ? 'Mobile' : 'Desktop' });
  } catch { /* Analytics must never interrupt a visitor's task. */ }
}
