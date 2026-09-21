export type HomeStatistic = {
  number: string;
  label: string;
  description: string;
};

export type HomeBenefit = {
  title: string;
  description: string;
};

export type HomeExecutive = {
  name: string;
  role: string;
  badge: string;
  description: string;
  highlight: string;
  highlightText: string;
  imageKey: "executive1" | "executive2" | "executive3";
};

export type HomeContent = {
  hero: {
    registrationNumber: string;
    eyebrow: string;
    headingBeforeHighlight: string;
    headingHighlight: string;
    headingAfterHighlight: string;
    description: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };

  statistics: HomeStatistic[];

  membership: {
    eyebrow: string;
    headingBeforeHighlight: string;
    headingHighlight: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    benefits: HomeBenefit[];
  };

  leadership: {
    eyebrow: string;
    heading: string;
    description: string;
    executives: HomeExecutive[];
  };
};

export const defaultHomeContent: HomeContent = {
  hero: {
    registrationNumber: "RC 22526",
    eyebrow: "Empowering Communities Since 1999",

    headingBeforeHighlight: "Building A",
    headingHighlight: "Better",
    headingAfterHighlight: "Society",

    description:
      "Together, we create positive change through community development, empowerment, trust, and sustainable solutions that transform lives and build a better tomorrow.",

    primaryButtonText: "Join ASBESOC",
    primaryButtonLink: "/membership",

    secondaryButtonText: "Learn More",
    secondaryButtonLink: "/about",
  },

  statistics: [
    {
      number: "20+",
      label: "Years",
      description:
        "Of dedicated service to communities across Nigeria.",
    },
    {
      number: "50+",
      label: "Communities",
      description:
        "Empowered through sustainable programs and partnerships.",
    },
    {
      number: "1000+",
      label: "Lives",
      description:
        "Touched and transformed through our initiatives.",
    },
  ],

  membership: {
    eyebrow: "JOIN ASBESOC",

    headingBeforeHighlight: "Become Part Of",
    headingHighlight: "ASBESOC",

    description:
      "Join a thriving community focused on leadership, innovation, transformation, and building a better society.",

    buttonText: "Membership Application Form",
    buttonLink: "/membership",

    benefits: [
      {
        title: "Connect",
        description:
          "Meet people working towards positive change.",
      },
      {
        title: "Contribute",
        description:
          "Support meaningful community initiatives.",
      },
      {
        title: "Create Impact",
        description:
          "Help build stronger communities.",
      },
    ],
  },

  leadership: {
    eyebrow: "OUR LEADERSHIP",

    heading: "Meet Our Executives",

    description:
      "Guided by dedicated leadership committed to empowering communities and building a better society.",

    executives: [
      {
        name: "Chief Honourable Engr. Dr. Igwe Chibuike Elias Elijah",
        role: "FOUNDER & CHIEF EXECUTIVE OFFICER",
        badge: "FOUNDER / CEO",

        description:
          "Founder and Chief Executive Officer of ASBESOC, leading sustainable community development and positive social impact.",

        highlight: "Leadership With Purpose",
        highlightText: "Building a better society",

        imageKey: "executive1",
      },
      {
        name: "Anekwe Benedict Ikechukwu, Esq.",
        role: "SECRETARY",
        badge: "SECRETARY",

        description:
          "Secretary of ASBESOC, supporting effective administration, coordination, and organizational development.",

        highlight: "Service & Commitment",
        highlightText: "Supporting organizational impact",

        imageKey: "executive2",
      },
      {
        name: "Dr. Isaiah Onyeka",
        role: "MANAGING DIRECTOR",
        badge: "MANAGING DIRECTOR",

        description:
          "Managing Director of ASBESOC, providing strategic leadership and overseeing organizational operations and development.",

        highlight: "Strategic Leadership",
        highlightText: "Advancing the mission of ASBESOC",

        imageKey: "executive3",
      },
    ],
  },
};