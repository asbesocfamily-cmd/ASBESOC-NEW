import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type SubmissionStatus = "new";

export type MembershipSubmission = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  nationality: string;
  residentialAddress: string;
  country: string;
  state?: string;
  lga?: string;
  region?: string;
  city?: string;
  occupation: string;
  qualification: string;
  reasonForJoining: string;
  membershipInterests: string[];
  skills?: string;
  referralSource: string;
};

export type SupportSubmission = {
  fullNameOrOrganization?: string;
  email: string;
  phone: string;
  supportType: string;
  anonymous: boolean;
  country: string;
  state?: string;
  lga?: string;
  region?: string;
  city?: string;
  supportDescription: string;
  message?: string;
};

export type PartnershipSubmission = {
  organization: string;
  organizationType: string;
  contactPerson: string;
  jobTitle: string;
  email: string;
  phone: string;
  website?: string;
  nationality?: string;
  country: string;
  state?: string;
  lga?: string;
  region?: string;
  city?: string;
  areasOfInterest: string[];
  partnershipMethods: string[];
  message?: string;
};

export async function submitMembership(
  data: MembershipSubmission
) {
  return addDoc(collection(db, "membershipApplications"), {
    ...data,
    status: "new" as SubmissionStatus,
    createdAt: serverTimestamp(),
    submissionType: "membership",
  });
}

export async function submitSupport(
  data: SupportSubmission
) {
  return addDoc(collection(db, "supportRequests"), {
    ...data,
    status: "new" as SubmissionStatus,
    createdAt: serverTimestamp(),
    submissionType: "support",
  });
}

export async function submitPartnership(
  data: PartnershipSubmission
) {
  return addDoc(collection(db, "partnershipRequests"), {
    ...data,
    status: "new" as SubmissionStatus,
    createdAt: serverTimestamp(),
    submissionType: "partnership",
  });
}