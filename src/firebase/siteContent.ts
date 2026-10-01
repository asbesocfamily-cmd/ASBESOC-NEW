import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export type SitePageId =
  | "home"
  | "about"
  | "programs"
  | "projects"
  | "gallery"
  | "contact"
  | "footer";

export type SitePageContent = Record<string, string>;

export const siteContentDefaults: Record<SitePageId, SitePageContent> = {
  home: {
    eyebrow: "Empowering Communities Since 1999",
    title: "Building A Better Society",
    intro: "Together, we create positive change through community development, empowerment, trust, and sustainable solutions that transform lives and build a better tomorrow.",
    secondary: "However, our areas of intervention also include human rights protection, awareness and education; conflict management, resolution and mediation; security surveillance; and human capital development.",
    membershipTitle: "Become Part Of ASBESOC",
    membershipText: "Join a thriving community focused on leadership, innovation, transformation, and building a better society."
  },
  about: {
    pageLabel: "ABOUT ASBESOC",
    vision: "A peaceful, empowered and better society.",
    mission: "Turning challenges into practical solutions.",
    commitment: "Building a better society is everyone's responsibility."
  },
  programs: {
    title: "Our Programs",
    intro: "Turning our commitment to a peaceful, empowered and better society into practical initiatives that respond to real community needs.",
    housingTagline: "Creating pathways towards affordable and sustainable home & land ownership."
  },
  projects: {
    title: "Projects That Turn Purpose Into Action.",
    intro: "Discover initiatives through which ASBESOC promotes peace, behavioural change, empowerment, community participation, advocacy and sustainable development."
  },
  gallery: {
    title: "Our Gallery",
    intro: "A glimpse into the people, projects, activities, partnerships, and moments that represent the work and impact of ASBESOC Nigeria.",
    sectionTitle: "See ASBESOC in Action",
    sectionText: "Explore moments that reflect our commitment to community development, leadership, collaboration and positive social impact."
  },
  contact: {
    title: "Contact ASBESOC",
    intro: "Get in touch with ASBESOC and connect with us as we work together towards positive community development."
  },
  footer: {
    organization: "Association for a Better Society",
    summary: "Promoting peace, empowerment and sustainable community development in Nigeria.",
    email1: "asbesocng@gmail.com",
    phone1: "09023916067",
    email2: "infoasbesoc@gmail.com",
    phone2: "07081486898",
    headOffice: "Plot 359, Mmiri N'ezere Ora Avenue, New G.R.A, Trans Ekulu, Enugu State.",
    branchOffice: "1st Floor, Kessington Plaza, Ugbowa Junction, Phase Six, Trans Ekulu, Enugu State."
  }
};

export function watchSitePage(
  pageId: SitePageId,
  onValue: (value: SitePageContent) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const fallback = siteContentDefaults[pageId];
  return onSnapshot(
    doc(db, "siteContent", pageId),
    (snapshot) => {
      const remote = snapshot.exists() ? snapshot.data() : {};
      const content =
        remote && typeof remote.content === "object" && remote.content
          ? (remote.content as SitePageContent)
          : {};
      onValue({ ...fallback, ...content });
    },
    (error) => {
      onValue(fallback);
      onError?.(error);
    },
  );
}

export async function saveSitePage(
  pageId: SitePageId,
  content: SitePageContent,
) {
  await setDoc(
    doc(db, "siteContent", pageId),
    { content, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
