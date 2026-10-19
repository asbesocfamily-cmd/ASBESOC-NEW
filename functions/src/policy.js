import { createHmac, timingSafeEqual } from 'node:crypto';

export function requirePaymentConfiguration(config, secret) {
  if (config?.enabled !== true || config?.verificationConfigured !== true ||
      config?.annualPolicy !== 'anniversary' || !Array.isArray(config?.enabledCurrencies) ||
      config.enabledCurrencies.length === 0 ||
      config.enabledCurrencies.some(currency => !['NGN', 'USD'].includes(currency)) ||
      !secret?.startsWith('sk_live_')) {
    throw new Error('Payments are not available yet.');
  }
}

export function priceFor(currency, config) {
  if (!['NGN', 'USD'].includes(currency) || !config.enabledCurrencies.includes(currency))
    throw new Error('This payment currency is not available.');
  return currency === 'NGN' ? 500000 : 500;
}

export function verifySignature(raw, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{128}$/i.test(signature)) return false;
  const expected = createHmac('sha512', secret).update(raw).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function assertVerifiedPayment(data, order) {
  if (data?.status !== 'success' || data?.domain !== 'live' ||
      data.reference !== order.reference || data.amount !== order.amountMinor ||
      data.currency !== order.currency || !Number.isSafeInteger(data.id) || data.id <= 0 ||
      data.customer?.email?.toLowerCase() !== order.email.toLowerCase() ||
      data.metadata?.uid !== order.uid || !Number.isFinite(Date.parse(data.paid_at))) {
    throw new Error('Payment verification did not match the server order.');
  }
}

export function paymentOutcome(data, order) {
  // A provider response must belong to this exact stored order even when unpaid.
  if (data?.domain !== 'live' || data.reference !== order.reference || data.amount !== order.amountMinor ||
      data.currency !== order.currency || data.customer?.email?.toLowerCase() !== order.email.toLowerCase() ||
      data.metadata?.uid !== order.uid) throw new Error('Payment does not match this order.');
  if (data.status === 'success') { assertVerifiedPayment(data, order); return 'paid'; }
  if (['failed', 'abandoned', 'reversed'].includes(data.status)) return 'failed';
  if (['pending', 'ongoing', 'processing', 'queued'].includes(data.status)) return 'pending';
  throw new Error('Unknown provider payment state.');
}

export function annualPeriod(now, existingExpiry) {
  const start = new Date(Math.max(now.getTime(), existingExpiry?.getTime() || 0));
  const end = new Date(start);
  const month = start.getUTCMonth();
  end.setUTCFullYear(end.getUTCFullYear() + 1);
  if (end.getUTCMonth() !== month) end.setUTCDate(0);
  return { startsAt: start, expiresAt: end };
}

export function activeMembership(member, now = new Date()) {
  return member?.status === 'active' && member.startsAt?.toMillis() <= now.getTime() &&
    member.expiresAt?.toMillis() > now.getTime();
}

export function reminderStage(expiresAt, now) {
  const days = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000);
  return days <= 0 ? 'expired' : days <= 7 ? '7-days' : days <= 30 ? '30-days' : null;
}
