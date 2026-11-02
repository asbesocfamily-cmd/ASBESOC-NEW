const identifierPattern = /^[a-f0-9-]{36}$/i;
const SESSION_LENGTH = 30 * 60 * 1000;
const VISITOR_LENGTH = 90 * 86400000;

function visitorIdentifier(now: number) {
  try {
    const value = JSON.parse(localStorage.getItem('asbesoc-visitor') || 'null');
    if (value && identifierPattern.test(value.id) && Number.isFinite(value.expires) &&
        value.expires > now && value.expires <= now + VISITOR_LENGTH) return value;
  } catch { /* Replace malformed persisted identifiers with a fresh, anonymous ID. */ }
  const value = { id: crypto.randomUUID(), expires: now + VISITOR_LENGTH };
  localStorage.setItem('asbesoc-visitor', JSON.stringify(value));
  return value;
}

function sessionIdentifier(now: number) {
  try {
    const value = JSON.parse(sessionStorage.getItem('asbesoc-session') || 'null');
    if (value && identifierPattern.test(value.id) && Number.isFinite(value.last) &&
        value.last >= now - SESSION_LENGTH && value.last <= now + 60000) {
      value.last = now;
      sessionStorage.setItem('asbesoc-session', JSON.stringify(value));
      return value;
    }
  } catch { /* Replace malformed persisted identifiers with a fresh, anonymous ID. */ }
  const value = { id: crypto.randomUUID(), last: now };
  sessionStorage.setItem('asbesoc-session', JSON.stringify(value));
  return value;
}

export function getAnalyticsIdentifiers(now = Date.now()) {
  const visitor = visitorIdentifier(now);
  const session = sessionIdentifier(now);
  return { visitorId: visitor.id, sessionId: session.id };
}
