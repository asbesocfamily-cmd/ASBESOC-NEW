
import { useEffect, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

import { db } from '../firebase/firebaseConfig';
import {
  certificationError,
  downloadCertificate,
  membershipCall,
  membershipServiceEnabled,
} from '../firebase/certification';
import {
  isCertifiedMember,
  type Application,
} from '../firebase/membership';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function AnnualMembership({
  application,
}: {
  application: Application;
}) {
  const [currency, setCurrency] = useState('NGN');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [reminders, setReminders] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now);

  const expiry =
    application.membershipExpiresAt?.toMillis() || 0;

  const approved = application.status === 'approved';
  const revoked = application.certificateStatus === 'revoked';

  const active =
    isCertifiedMember(application) && expiry > now;

  const firstPayment = approved && !revoked && expiry === 0;

  const renewalDue =
    approved &&
    !revoked &&
    expiry > 0 &&
    expiry - now <= THIRTY_DAYS;

  const paymentPending =
    application.paymentStatus === 'pending' ||
    application.certificateStatus === 'processing';

  const canPay =
    membershipServiceEnabled &&
    !busy &&
    !paymentPending &&
    (firstPayment || renewalDue);

  const paymentReference = new URLSearchParams(
    window.location.search
  ).get('reference');

  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Date.now()),
      30000
    );

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!membershipServiceEnabled || !application.userId) {
      return;
    }

    const remindersQuery = query(
      collection(
        db,
        'membershipReminders',
        application.userId,
        'items'
      ),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    return onSnapshot(
      remindersQuery,
      snapshot => {
        const items = snapshot.docs
          .filter(item =>
            application.certificateNumber
              ? item.id.startsWith(
                  `${application.certificateNumber}-`
                )
              : false
          )
          .map(item => String(item.data().message || ''))
          .filter(Boolean);

        setReminders(items);
      },
      () => {
        setReminders([]);
      }
    );
  }, [
    application.userId,
    application.certificateNumber,
  ]);

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setMessage('');

    try {
      await action();
    } catch (error) {
      setMessage(certificationError(error));
    } finally {
      setBusy(false);
    }
  }

  async function startPayment() {
    await act(async () => {
      const result = await membershipCall<{ url: string }>(
        'membershipCheckout',
        { currency }
      );

      const checkoutUrl = new URL(result.url);

      if (
        checkoutUrl.protocol !== 'https:' ||
        checkoutUrl.hostname !== 'checkout.paystack.com'
      ) {
        throw new Error(
          'The payment provider returned an invalid checkout link.'
        );
      }

      window.location.assign(checkoutUrl.href);
    });
  }

  async function confirmPayment() {
    if (!paymentReference) return;

    await act(async () => {
      await membershipCall(
        'confirmMembershipPayment',
        { reference: paymentReference }
      );

      setMessage(
        'Payment verified by the server. Your membership record will update automatically.'
      );
    });
  }

  function membershipStatus() {
    if (revoked) {
      return 'Membership revoked — contact ASBESOC';
    }

    if (!approved) {
      return 'Awaiting membership approval';
    }

    if (active) {
      return 'Certified membership active';
    }

    if (paymentPending) {
      return 'Payment or certificate processing';
    }

    if (expiry > 0 && expiry <= now) {
      return 'Membership expired — renewal required';
    }

    if (firstPayment) {
      return 'Approved — annual membership payment required';
    }

    return 'Membership status awaiting verification';
  }

  const button =
    'rounded-xl bg-[#063b25] px-5 py-3 font-bold text-white transition hover:bg-[#075b38] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <section className="mt-6 rounded-2xl border border-emerald-900/15 bg-white p-6">
      <h3 className="text-xl font-black text-[#063b25]">
        Annual membership & certificate
      </h3>

      <p className="mt-3 text-slate-700">
        ₦5,000 or US$5 per year. Membership lasts one year
        from its start date.
      </p>

      <p className="mt-3 font-bold text-[#063b25]">
        {membershipStatus()}
      </p>

      {expiry > 0 && (
        <p className="mt-2 text-slate-700">
          Valid until{' '}
          {new Date(expiry).toLocaleString('en-NG', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
          .
        </p>
      )}

      <p className="mt-3 text-sm text-slate-600">
        Renewals open 30 days before expiry. Early renewal
        adds one year after the current membership term.
        Late renewal starts a new term.
      </p>

      {!membershipServiceEnabled && (
        <p
          className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          Secure membership payments are not yet activated.
          No payment can be collected and no certificate
          can be issued until the backend is deployed and
          verified.
        </p>
      )}

      {revoked && (
        <p
          className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          This membership has been revoked. Please contact
          ASBESOC administration before making another payment.
        </p>
      )}

      {paymentPending && (
        <p
          className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
          role="status"
        >
          A payment or certificate request is being processed.
          Please verify its status before starting another payment.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="font-medium text-slate-700">
          Payment currency

          <select
            className="ml-2 rounded-lg border border-slate-300 bg-white p-2"
            value={currency}
            onChange={event =>
              setCurrency(event.target.value)
            }
            disabled={busy}
          >
            <option value="NGN">₦5,000 NGN</option>
            <option value="USD">US$5 USD</option>
          </select>
        </label>

        <button
          type="button"
          className={button}
          disabled={!canPay}
          onClick={() => void startPayment()}
        >
          {busy
            ? 'Please wait…'
            : firstPayment
              ? 'Pay annual membership'
              : 'Renew membership'}
        </button>

        {membershipServiceEnabled &&
          paymentReference && (
            <button
              type="button"
              className={button}
              disabled={busy}
              onClick={() => void confirmPayment()}
            >
              Check payment with provider
            </button>
          )}

        {active && application.certificateNumber && (
          <>
            <button
              type="button"
              className={button}
              disabled={
                busy || !membershipServiceEnabled
              }
              onClick={() =>
                void act(() =>
                  downloadCertificate(
                    application.certificateNumber!
                  )
                )
              }
            >
              Download certificate PDF
            </button>

            <Link
              className="font-bold text-[#063b25] underline"
              to={`/verify-certificate/${encodeURIComponent(
                application.certificateNumber
              )}`}
            >
              Verify certificate
            </Link>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Certified training access requires an active,
        unrevoked membership. Available payment currencies
        depend on the provider configuration.
      </p>

      {message && (
        <p
          role="status"
          className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-[#063b25]"
        >
          {message}
        </p>
      )}

      {reminders.map((reminder, index) => (
        <p
          key={`${index}-${reminder}`}
          className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
        >
          {reminder}
        </p>
      ))}
    </section>
  );
}
