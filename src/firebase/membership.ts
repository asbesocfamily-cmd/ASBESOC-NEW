import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import type { MembershipSubmission } from "./submissions";

export const ADMIN_UID = "RJJhn4WSoBhUQ5vMF7G9vxLB98E2";

/* -------------------------------------------------------------------------- */
/*                              APPLICATION STATUS                            */
/* -------------------------------------------------------------------------- */

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

export type PaymentStatus =
  | "not_available"
  | "unpaid"
  | "pending"
  | "paid"
  | "failed";

export type CertificateStatus =
  | "not_available"
  | "payment_required"
  | "processing"
  | "issued";

export type Application = MembershipSubmission & {
  userId: string;

  status: ApplicationStatus;

  reviewNote?: string;

  reviewedBy?: string;
  reviewedAt?: unknown;

  /* Certificate payment */

  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paidAt?: unknown;

  /* Certificate */

  certificateStatus?: CertificateStatus;
  certificateNumber?: string;
  certificateUrl?: string;
  certificateIssuedAt?: unknown;
};

export const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending review",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  not_available: "Not available",
  unpaid: "Payment required",
  pending: "Payment processing",
  paid: "Payment confirmed",
  failed: "Payment unsuccessful",
};

export const certificateStatusLabels: Record<
  CertificateStatus,
  string
> = {
  not_available: "Not available",
  payment_required: "Payment required",
  processing: "Certificate processing",
  issued: "Certificate issued",
};

/* -------------------------------------------------------------------------- */
/*                                  LABELS                                    */
/* -------------------------------------------------------------------------- */

export function applicationLabel(status: string) {
  return (
    statusLabels[status as ApplicationStatus] ??
    "Status unavailable"
  );
}

export function paymentLabel(status?: PaymentStatus) {
  if (!status) {
    return "Not available";
  }

  return paymentStatusLabels[status];
}

export function certificateLabel(status?: CertificateStatus) {
  if (!status) {
    return "Not available";
  }

  return certificateStatusLabels[status];
}

/* -------------------------------------------------------------------------- */
/*                                MEMBER STATE                                */
/* -------------------------------------------------------------------------- */

export function getPaymentStatus(
  application: Application | null,
): PaymentStatus {
  if (!application || application.status !== "approved") {
    return "not_available";
  }

  return application.paymentStatus ?? "unpaid";
}

export function getCertificateStatus(
  application: Application | null,
): CertificateStatus {
  if (!application || application.status !== "approved") {
    return "not_available";
  }

  if (application.certificateStatus) {
    return application.certificateStatus;
  }

  const paymentStatus = getPaymentStatus(application);

  if (paymentStatus === "paid") {
    return "processing";
  }

  return "payment_required";
}

export function isCertifiedMember(
  application: Application | null,
) {
  return (
    application?.status === "approved" &&
    getPaymentStatus(application) === "paid" &&
    getCertificateStatus(application) === "issued"
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ERRORS                                    */
/* -------------------------------------------------------------------------- */

export function memberError(error: unknown) {
  const code = (error as { code?: string })?.code;

  if (code === "permission-denied") {
    return "We could not access your membership records. Please contact ASBESOC if this continues.";
  }

  if (code === "unavailable") {
    return "We could not connect. Check your internet connection and try again.";
  }

  if (
    error instanceof Error &&
    error.message.startsWith("ASBESOC:")
  ) {
    return error.message.slice(9).trim();
  }

  return "We could not save this change. Please try again.";
}

/* -------------------------------------------------------------------------- */
/*                            WATCH APPLICATION                               */
/* -------------------------------------------------------------------------- */

export function watchApplication(
  uid: string,
  next: (value: Application | null) => void,
  fail: (error: unknown) => void,
) {
  return onSnapshot(
    doc(db, "membershipApplications", uid),

    (snapshot) => {
      next(
        snapshot.exists()
          ? (snapshot.data() as Application)
          : null,
      );
    },

    fail,
  );
}

/* -------------------------------------------------------------------------- */
/*                           CREATE APPLICATION                               */
/* -------------------------------------------------------------------------- */

export async function createApplication(
  data: MembershipSubmission,
) {
  const user = auth.currentUser;

  if (!user?.emailVerified) {
    throw new Error(
      "ASBESOC: Sign in and verify your email before applying.",
    );
  }

  const ref = doc(
    db,
    "membershipApplications",
    user.uid,
  );

  await runTransaction(db, async (transaction) => {
    const previous = await transaction.get(ref);

    if (previous.exists()) {
      throw new Error(
        "ASBESOC: You already have an application. Open your dashboard to see its status.",
      );
    }

    transaction.set(ref, {
      ...data,

      email: user.email,
      userId: user.uid,

      status: "pending",

      /*
       * Certificate/payment is unavailable until
       * the application has been approved.
       */

      paymentStatus: "not_available",
      certificateStatus: "not_available",

      submissionType: "membership",
      createdAt: serverTimestamp(),
    });
  });

  return ref;
}

/* -------------------------------------------------------------------------- */
/*                            REVIEW APPLICATION                              */
/* -------------------------------------------------------------------------- */

export async function reviewApplication(
  id: string,
  expectedStatus: string,
  status: ApplicationStatus,
  note: string,
) {
  const user = auth.currentUser;

  if (
    !user?.emailVerified ||
    user.uid !== ADMIN_UID
  ) {
    throw new Error(
      "ASBESOC: Verified administrator access is required.",
    );
  }

  if (
    !["new", "pending", "under_review"].includes(
      expectedStatus,
    )
  ) {
    throw new Error(
      "ASBESOC: This application has already been decided.",
    );
  }

  if (
    !["under_review", "approved", "rejected"].includes(
      status,
    ) ||
    status === expectedStatus
  ) {
    throw new Error(
      "ASBESOC: Choose a new review status.",
    );
  }

  if (
    note.trim().length > 2000 ||
    (status === "rejected" && !note.trim())
  ) {
    throw new Error(
      "ASBESOC: Add a reason for rejection (up to 2,000 characters).",
    );
  }

  const ref = doc(
    db,
    "membershipApplications",
    id,
  );

  const eventRef = doc(
    ref,
    "reviews",
    status,
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);

    if (
      !snapshot.exists() ||
      snapshot.data().status !== expectedStatus
    ) {
      throw new Error(
        "ASBESOC: This application changed. Refresh the list before reviewing it again.",
      );
    }

    /*
     * Approval unlocks the certificate payment stage.
     * No payment is actually taken here.
     */

    const certificateUpdate =
      status === "approved"
        ? {
            paymentStatus: "unpaid" as PaymentStatus,
            certificateStatus:
              "payment_required" as CertificateStatus,
          }
        : status === "rejected"
          ? {
              paymentStatus:
                "not_available" as PaymentStatus,
              certificateStatus:
                "not_available" as CertificateStatus,
            }
          : {};

    transaction.update(ref, {
      status,
      reviewNote: note.trim(),
      reviewedBy: user.uid,
      reviewedAt: serverTimestamp(),

      ...certificateUpdate,
    });

    transaction.set(eventRef, {
      status,
      previousStatus: expectedStatus,
      note: note.trim(),
      reviewedBy: user.uid,
      createdAt: serverTimestamp(),
    });
  });
}

/* -------------------------------------------------------------------------- */
/*                              MEMBER PROFILE                                */
/* -------------------------------------------------------------------------- */

export async function saveMemberProfile(
  fullName: string,
  phone: string,
) {
  const user = auth.currentUser;

  if (!user?.emailVerified) {
    throw new Error(
      "ASBESOC: Sign in and verify your email first.",
    );
  }

  if (
    fullName.trim().length < 2 ||
    fullName.trim().length > 120
  ) {
    throw new Error(
      "ASBESOC: Enter a name between 2 and 120 characters.",
    );
  }

  if (
    phone.trim() &&
    !/^\+?[0-9 ()-]{7,25}$/.test(phone.trim())
  ) {
    throw new Error(
      "ASBESOC: Enter a valid phone number.",
    );
  }

  await setDoc(
    doc(db, "profiles", user.uid),
    {
      fullName: fullName.trim(),
      phone: phone.trim(),
      updatedAt: serverTimestamp(),
    },
  );
}