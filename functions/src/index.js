import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import {
  getFirestore,
  Timestamp,
  FieldValue,
} from 'firebase-admin/firestore';
import {
  onCall,
  onRequest,
  HttpsError,
} from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { setGlobalOptions } from 'firebase-functions/v2';

import {
  activeMembership,
  annualPeriod,
  assertVerifiedPayment,
  reminderStage,
  priceFor,
  requirePaymentConfiguration,
  verifySignature,
} from './policy.js';

import { certificatePdf } from './pdf.js';

initializeApp();

setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 5,
  timeoutSeconds: 30,
});

const db = getFirestore();
const secret = defineSecret('PAYSTACK_SECRET_KEY');

const ADMIN_UID = 'RJJhn4WSoBhUQ5vMF7G9vxLB98E2';

const callable = {
  enforceAppCheck: true,
};

const CHECKOUT_LOCK_MINUTES = 20;

function verified(request, admin = false) {
  if (
    !request.auth ||
    request.auth.token.email_verified !== true
  ) {
    throw new HttpsError(
      'unauthenticated',
      'Sign in with a verified email.'
    );
  }

  if (admin && request.auth.uid !== ADMIN_UID) {
    throw new HttpsError(
      'permission-denied',
      'Administrator access required.'
    );
  }

  return request.auth.uid;
}

function validId(value) {
  if (
    typeof value !== 'string' ||
    !/^[a-zA-Z0-9-]{10,100}$/.test(value)
  ) {
    throw new HttpsError(
      'invalid-argument',
      'Invalid reference.'
    );
  }

  return value;
}

async function paymentConfig() {
  const snapshot = await db.doc('systemConfig/payments').get();
  const config = snapshot.data();

  try {
    requirePaymentConfiguration(config, secret.value());
  } catch {
    throw new HttpsError(
      'failed-precondition',
      'Payments are not available yet.'
    );
  }

  return config;
}

async function paystack(path, body) {
  let response;
  let result;

  try {
    response = await fetch(
      `https://api.paystack.co${path}`,
      {
        method: body ? 'POST' : 'GET',
        headers: {
          Authorization: `Bearer ${secret.value()}`,
          'Content-Type': 'application/json',
        },
        ...(body
          ? { body: JSON.stringify(body) }
          : {}),
        signal: AbortSignal.timeout(10000),
      }
    );

    result = await response.json();
  } catch {
    throw new HttpsError(
      'unavailable',
      'Could not connect to the payment provider. Please retry.'
    );
  }

  if (!response.ok || result?.status !== true) {
    throw new HttpsError(
      'unavailable',
      'The payment provider could not complete this request.'
    );
  }

  return result.data;
}

function validateCheckoutUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new HttpsError(
      'internal',
      'Invalid checkout destination.'
    );
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'checkout.paystack.com'
  ) {
    throw new HttpsError(
      'internal',
      'Invalid checkout destination.'
    );
  }

  return url.href;
}

// ======================================================
// MEMBERSHIP CHECKOUT
// ======================================================

export const membershipCheckout = onCall(
  {
    ...callable,
    secrets: [secret],
  },
  async request => {
    const uid = verified(request);
    const config = await paymentConfig();

    const currency = request.data?.currency;

    let amountMinor;

    try {
      amountMinor = priceFor(currency, config);
    } catch {
      throw new HttpsError(
        'failed-precondition',
        'This payment currency is not available.'
      );
    }

    const newReference = `ASB-${randomUUID()}`;

    const order = await db.runTransaction(async tx => {
      const appRef = db.doc(
        `membershipApplications/${uid}`
      );

      const memberRef = db.doc(
        `memberships/${uid}`
      );

      const lockRef = db.doc(
        `checkoutLocks/${uid}`
      );

      // Read membership and checkout state first.
      const [appSnapshot, memberSnapshot, lockSnapshot] =
        await Promise.all([
          tx.get(appRef),
          tx.get(memberRef),
          tx.get(lockRef),
        ]);

      const application = appSnapshot.data();
      const member = memberSnapshot.data();
      const lock = lockSnapshot.data();

      if (
        application?.status !== 'approved' ||
        application?.userId !== uid
      ) {
        throw new HttpsError(
          'failed-precondition',
          'Membership approval is required.'
        );
      }

      if (member?.status === 'revoked') {
        throw new HttpsError(
          'failed-precondition',
          'Contact ASBESOC about this membership.'
        );
      }

      const now = Date.now();

      if (
        activeMembership(member) &&
        member.expiresAt.toMillis() - now >
          30 * 86400000
      ) {
        throw new HttpsError(
          'failed-precondition',
          'Renewals open 30 days before expiry.'
        );
      }

      // Look up an existing checkout before making writes.
      let previousOrder = null;

      if (
        lock?.reference &&
        lock?.expiresAt?.toMillis() > now
      ) {
        const previousRef = db.doc(
          `paymentOrders/${validId(lock.reference)}`
        );

        const previousSnapshot = await tx.get(
          previousRef
        );

        if (previousSnapshot.exists) {
          previousOrder = previousSnapshot.data();
        }
      }

      if (
        previousOrder?.status === 'pending' &&
        previousOrder.uid === uid
      ) {
        if (previousOrder.currency !== currency) {
          throw new HttpsError(
            'failed-precondition',
            'An existing checkout uses another currency. Please wait for it to expire.'
          );
        }

        if (previousOrder.amountMinor !== amountMinor) {
          throw new HttpsError(
            'failed-precondition',
            'The payment amount has changed. Please contact ASBESOC.'
          );
        }

        return previousOrder;
      }

      // No usable pending order: create a fresh one.
      const reference = newReference;

      const value = {
        reference,
        uid,
        email: request.auth.token.email,
        fullName: application.fullName,
        amountMinor,
        currency,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      tx.create(
        db.doc(`paymentOrders/${reference}`),
        value
      );

      tx.set(lockRef, {
        reference,
        expiresAt: Timestamp.fromMillis(
          now + CHECKOUT_LOCK_MINUTES * 60000
        ),
      });

      return value;
    });

    // Reuse a checkout URL when already initialized.
    if (order.authorizationUrl) {
      return {
        url: validateCheckoutUrl(
          order.authorizationUrl
        ),
        reference: order.reference,
      };
    }

    // Paystack initialization uses the same reference.
    // Retrying initialization must not create another order.
    const result = await paystack(
      '/transaction/initialize',
      {
        email: order.email,
        amount: order.amountMinor,
        currency: order.currency,
        reference: order.reference,
        metadata: {
          uid: order.uid,
        },
        callback_url:
          'https://asbesoc.org/dashboard/membership',
      }
    );

    const checkoutUrl = validateCheckoutUrl(
      result.authorization_url
    );

    await db.runTransaction(async tx => {
      const orderRef = db.doc(
        `paymentOrders/${order.reference}`
      );

      const snapshot = await tx.get(orderRef);

      if (!snapshot.exists) {
        throw new HttpsError(
          'not-found',
          'Payment order not found.'
        );
      }

      if (snapshot.data().status !== 'pending') {
        return;
      }

      if (!snapshot.data().authorizationUrl) {
        tx.update(orderRef, {
          authorizationUrl: checkoutUrl,
        });
      }
    });

    return {
      url: checkoutUrl,
      reference: order.reference,
    };
  }
);

// ======================================================
// PAYMENT VERIFICATION AND CERTIFICATE ISSUANCE
// ======================================================

async function settle(reference, owner) {
  await paymentConfig();

  const orderRef = db.doc(
    `paymentOrders/${validId(reference)}`
  );

  const snapshot = await orderRef.get();

  if (
    !snapshot.exists ||
    (owner && snapshot.data().uid !== owner)
  ) {
    throw new HttpsError(
      'not-found',
      'Payment order not found.'
    );
  }

  if (snapshot.data().status === 'paid') {
    return { confirmed: true };
  }

  const data = await paystack(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  try {
    assertVerifiedPayment(data, snapshot.data());
  } catch {
    throw new HttpsError(
      'failed-precondition',
      'Payment is not confirmed. No membership was granted.'
    );
  }

  const certificateId = `ASBESOC-${randomUUID()}`;

  await db.runTransaction(async tx => {
    const orderSnapshot = await tx.get(orderRef);

    if (!orderSnapshot.exists) {
      throw new HttpsError(
        'not-found',
        'Payment order not found.'
      );
    }

    const order = orderSnapshot.data();

    if (order.status === 'paid') {
      return;
    }

    const memberRef = db.doc(
      `memberships/${order.uid}`
    );

    const appRef = db.doc(
      `membershipApplications/${order.uid}`
    );

    const receiptRef = db.doc(
      `providerReceipts/paystack-${data.id}`
    );

    const [appSnapshot, memberSnapshot, receiptSnapshot] =
      await Promise.all([
        tx.get(appRef),
        tx.get(memberRef),
        tx.get(receiptRef),
      ]);

    const application = appSnapshot.data();
    const member = memberSnapshot.data();

    if (receiptSnapshot.exists) {
      throw new HttpsError(
        'already-exists',
        'Transaction already processed.'
      );
    }

    if (
      application?.status !== 'approved' ||
      application?.userId !== order.uid ||
      member?.status === 'revoked'
    ) {
      throw new HttpsError(
        'failed-precondition',
        'Payment needs administrator review.'
      );
    }

    const now = new Date();

    const period = annualPeriod(
      now,
      member?.expiresAt?.toDate()
    );

    // The new certificate covers the renewed period.
    const certificate = {
      id: certificateId,
      uid: order.uid,
      fullName: application.fullName,
      issuedAt: Timestamp.fromDate(now),
      startsAt: Timestamp.fromDate(
        period.startsAt
      ),
      expiresAt: Timestamp.fromDate(
        period.expiresAt
      ),
      status: 'active',
      paymentReference: reference,
    };

    tx.create(
      db.doc(`certificates/${certificateId}`),
      certificate
    );

    // Preserve the original membership start date.
    // Renewal extends the expiry date.
    tx.set(memberRef, {
      uid: order.uid,
      fullName: application.fullName,
      status: 'active',
      certificateId,
      startsAt:
        member?.startsAt ||
        Timestamp.fromDate(now),
      expiresAt: certificate.expiresAt,
      updatedAt: Timestamp.fromDate(now),
    });

    tx.update(appRef, {
      paymentStatus: 'paid',
      paidAt: Timestamp.fromDate(now),
      paymentReference: reference,
      certificateStatus: 'issued',
      certificateNumber: certificateId,
      certificateIssuedAt: certificate.issuedAt,
      membershipExpiresAt: certificate.expiresAt,
    });

    tx.update(orderRef, {
      status: 'paid',
      providerId: data.id,
      confirmedAt: Timestamp.fromDate(now),
      certificateId,
    });

    tx.create(receiptRef, {
      reference,
      uid: order.uid,
      createdAt: Timestamp.fromDate(now),
    });

    tx.create(
      db.doc(`membershipAudit/${certificateId}`),
      {
        type:
          'payment_verified_certificate_issued',
        uid: order.uid,
        reference,
        certificateId,
        createdAt: Timestamp.fromDate(now),
        actor: 'paystack-verification',
      }
    );
  });

  return { confirmed: true };
}

export const confirmMembershipPayment = onCall(
  {
    ...callable,
    secrets: [secret],
  },
  request =>
    settle(
      request.data?.reference,
      verified(request)
    )
);

// ======================================================
// PAYSTACK WEBHOOK
// ======================================================

export const paystackWebhook = onRequest(
  {
    secrets: [secret],
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    if (
      !verifySignature(
        req.rawBody,
        req.get('x-paystack-signature'),
        secret.value()
      )
    ) {
      res.status(401).send('Invalid signature');
      return;
    }

    if (req.body?.event !== 'charge.success') {
      res.status(200).send('Ignored');
      return;
    }

    try {
      await settle(req.body.data?.reference);
      res.status(200).send('Received');
    } catch {
      res.status(503).send(
        'Not processed; retry required'
      );
    }
  }
);

// ======================================================
// CERTIFICATE DOWNLOAD
// ======================================================

export const downloadMembershipCertificate = onCall(
  callable,
  async request => {
    const uid = verified(request);
    const id = validId(request.data?.id);

    const certificate = (
      await db.doc(`certificates/${id}`).get()
    ).data();

    if (
      !certificate ||
      (certificate.uid !== uid &&
        uid !== ADMIN_UID)
    ) {
      throw new HttpsError(
        'not-found',
        'Certificate not found.'
      );
    }

    const member = (
      await db.doc(
        `memberships/${certificate.uid}`
      ).get()
    ).data();

    if (
      certificate.status !== 'active' ||
      !activeMembership(member) ||
      certificate.expiresAt.toMillis() <=
        Date.now()
    ) {
      throw new HttpsError(
        'failed-precondition',
        'Certificate is no longer valid.'
      );
    }

    return {
      base64: (
        await certificatePdf(certificate)
      ).toString('base64'),
      filename: `${id}.pdf`,
    };
  }
);

// ======================================================
// PUBLIC CERTIFICATE VERIFICATION
// ======================================================

export const verifyMembershipCertificate = onCall(
  {
    enforceAppCheck: false,
  },
  async request => {
    const id = validId(request.data?.id);

    const certificate = (
      await db.doc(`certificates/${id}`).get()
    ).data();

    if (!certificate) {
      return { status: 'not_found' };
    }

    const member = (
      await db.doc(
        `memberships/${certificate.uid}`
      ).get()
    ).data();

    if (
      !member ||
      !['active', 'revoked'].includes(
        member.status
      ) ||
      !['active', 'revoked'].includes(
        certificate.status
      )
    ) {
      return { status: 'not_found' };
    }

    const now = Date.now();

    const status =
      certificate.status === 'revoked' ||
      member.status === 'revoked'
        ? 'revoked'
        : certificate.expiresAt.toMillis() <= now ||
            member.expiresAt?.toMillis() <= now
          ? 'expired'
          : certificate.startsAt.toMillis() > now ||
              member.startsAt?.toMillis() > now
            ? 'not_yet_valid'
            : activeMembership(member)
              ? 'valid'
              : 'not_found';

    return {
      id,
      fullName: certificate.fullName,
      status,
      issuedAt:
        certificate.issuedAt
          .toDate()
          .toISOString(),
      startsAt:
        certificate.startsAt
          .toDate()
          .toISOString(),
      expiresAt:
        certificate.expiresAt
          .toDate()
          .toISOString(),
    };
  }
);

// ======================================================
// ADMIN MEMBERSHIP REVOCATION
// ======================================================

export const revokeMembership = onCall(
  callable,
  async request => {
    const actor = verified(request, true);

    const uid = validId(request.data?.uid);

    const reason =
      typeof request.data?.reason === 'string'
        ? request.data.reason.trim()
        : '';

    if (
      reason.length < 5 ||
      reason.length > 2000
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Provide a reason (5–2,000 characters).'
      );
    }

    await db.runTransaction(async tx => {
      const memberRef = db.doc(
        `memberships/${uid}`
      );

      const member = await tx.get(memberRef);

      if (!member.exists) {
        throw new HttpsError(
          'not-found',
          'Membership not found.'
        );
      }

      if (member.data().status === 'revoked') {
        return;
      }

      tx.update(memberRef, {
        status: 'revoked',
        updatedAt:
          FieldValue.serverTimestamp(),
      });

      tx.update(
        db.doc(
          `membershipApplications/${uid}`
        ),
        {
          certificateStatus: 'revoked',
        }
      );

      tx.create(
        db.collection('membershipAudit').doc(),
        {
          type: 'revoked',
          uid,
          reason,
          actor,
          createdAt:
            FieldValue.serverTimestamp(),
        }
      );
    });

    return { revoked: true };
  }
);

// ======================================================
// AUTOMATIC RENEWAL REMINDERS
// ======================================================

export const membershipRenewalReminders =
  onSchedule(
    {
      schedule: 'every day 08:00',
      timeZone: 'Africa/Lagos',
      timeoutSeconds: 120,
    },
    async () => {
      const now = new Date();
      let cursor;

      for (;;) {
        let membershipQuery = db
          .collection('memberships')
          .orderBy('__name__')
          .limit(100);

        if (cursor) {
          membershipQuery =
            membershipQuery.startAfter(cursor);
        }

        const page =
          await membershipQuery.get();

        if (page.empty) {
          break;
        }

        for (const document of page.docs) {
          const member = document.data();

          if (member.status !== 'active') {
            continue;
          }

          const stage = reminderStage(
            member.expiresAt.toDate(),
            now
          );

          if (!stage) {
            continue;
          }

          const id =
            `${member.certificateId}-${stage}`;

          const ref = db.doc(
            `membershipReminders/${document.id}/items/${id}`
          );

          await db.runTransaction(
            async tx => {
              const existing =
                await tx.get(ref);

              if (existing.exists) {
                return;
              }

              tx.create(ref, {
                stage,
                expiresAt: member.expiresAt,
                createdAt:
                  Timestamp.fromDate(now),
                message:
                  stage === 'expired'
                    ? 'Your annual membership has expired. Renew to restore certified access.'
                    : 'Your annual membership is due for renewal. Open Membership to review your expiry date.',
              });
            }
          );
        }

        cursor = page.docs.at(-1);
      }
    }
  );