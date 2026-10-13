import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebaseConfig';

export const membershipServiceEnabled = import.meta.env.VITE_MEMBERSHIP_SERVICE_ENABLED === 'true';
const functions = getFunctions(app, 'europe-west1');
export async function membershipCall<T>(name: string, data: unknown): Promise<T> {
  if (!membershipServiceEnabled) throw new Error('Membership payments and certificate services are awaiting activation.');
  return (await httpsCallable<unknown, T>(functions, name)(data)).data;
}
export function certificationError(error: unknown) {
  return error instanceof Error ? error.message.replace(/^Firebase: /, '') : 'This request could not be completed. Please retry.';
}
export async function downloadCertificate(id: string) {
  const result = await membershipCall<{ base64: string; filename: string }>('downloadMembershipCertificate', { id });
  const bytes = Uint8Array.from(atob(result.base64), char => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = result.filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
