import { useEffect, useState } from "react";

import bookImage from "../assets/book.jpeg";

type Project = {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  summary: string;
  fullDescription: string;
  highlights: string[];
};

function Projects() {
  /*
   * Root-level gallery images.
   *
   * These are the same image names currently working in your Gallery.
   * During development Vite serves them from the project root.
   * During GitHub Pages production the Vite base path is added automatically.
   */
  const imageBaseUrl = import.meta.env.DEV
    ? "/"
    : import.meta.env.BASE_URL;

  const projects: Project[] = [
    {
      id: 1,
      title: "Peace Building & Behavioural Change Programme",
      category: "Peace & Social Transformation",
      year: "2026",
      image: bookImage,
      summary:
        "A major ASBESOC initiative focused on peace building, positive behavioural change, responsible citizenship and sustainable community development.",
      fullDescription:
        "ASBESOC officially published and launched the Peace Building and Behavioural Change Programme Training Material as a practical resource for communities, individuals and stakeholders. The publication was launched on 15 May 2026 at Abor, Udi Local Government Area, Enugu State, Nigeria. It forms part of ASBESOC's commitment to promoting peaceful coexistence, responsible citizenship, positive behavioural change and sustainable community development.",
      highlights: [
        "Human Rights Protection and Awareness",
        "Conflict Management and Resolution",
        "Human Capital Development",
        "Security Surveillance and Community Policing",
        "Integrity and responsible citizenship",
        "Creativity, development and economic growth",
        "Entrepreneurship and economic wellbeing",
        "Effective and quality communication",
        "Peace Building and meaningful development",
        "People and Government: effective roles and responsibilities",
      ],
    },

    {
      id: 2,
      title: "Community Peace & Behavioural Change Outreach",
      category: "Community Development",
      year: "2026",
      image: `${imageBaseUrl}IMGL1014.jpg`,
      summary:
        "Community-focused engagement bringing people together to promote peace, awareness, dialogue and positive behavioural change.",
      fullDescription:
        "This initiative represents ASBESOC's community engagement approach — creating spaces where people can come together, communicate, learn and participate in conversations that contribute to a peaceful and better society. Through outreach activities, ASBESOC works to strengthen community participation and encourage positive behavioural change.",
      highlights: [
        "Community participation",
        "Peace awareness",
        "Positive behavioural change",
        "Community dialogue",
        "Social responsibility",
        "Stakeholder engagement",
      ],
    },

    {
      id: 3,
      title: "Community Empowerment & Human Capital Development",
      category: "Empowerment",
      year: "2026",
      image: `${imageBaseUrl}IMGL1035.jpg`,
      summary:
        "Supporting people through knowledge, participation and initiatives designed to strengthen human capacity and community resilience.",
      fullDescription:
        "ASBESOC's empowerment work is centred on people. By encouraging participation, education, capacity building and practical community initiatives, the organization seeks to help individuals and communities become active contributors to social and economic development.",
      highlights: [
        "Human empowerment",
        "Capacity building",
        "Community participation",
        "Knowledge sharing",
        "Personal development",
        "Community resilience",
      ],
    },

    {
      id: 4,
      title: "Peace Building Community Engagement",
      category: "Peace Building",
      year: "2026",
      image: `${imageBaseUrl}IMGL1070.jpg`,
      summary:
        "Creating opportunities for community members, leaders and stakeholders to connect around peace and social development.",
      fullDescription:
        "Peace building requires participation from across society. This ASBESOC initiative brings together community members and stakeholders to encourage dialogue, understanding, cooperation and shared responsibility for building safer and more peaceful communities.",
      highlights: [
        "Peace building",
        "Community dialogue",
        "Leadership participation",
        "Stakeholder collaboration",
        "Social cohesion",
        "Safer communities",
      ],
    },

    {
      id: 5,
      title: "Community Awareness & Social Participation",
      category: "Advocacy",
      year: "2026",
      image: `${imageBaseUrl}IMGL1085.jpg`,
      summary:
        "Promoting awareness and encouraging individuals to become active participants in addressing challenges affecting their communities.",
      fullDescription:
        "ASBESOC believes that building a better society is a collective responsibility. Community awareness and participation therefore remain important parts of its work, helping people understand societal challenges and encouraging them to take part in developing practical solutions.",
      highlights: [
        "Public awareness",
        "Advocacy",
        "Community participation",
        "Social responsibility",
        "Collective action",
        "Practical community solutions",
      ],
    },

    {
      id: 6,
      title: "Stakeholder & Community Partnership",
      category: "Partnerships",
      year: "2026",
      image: `${imageBaseUrl}IMGL1102.jpg`,
      summary:
        "Building relationships between communities, leaders, organizations and other stakeholders to support sustainable social impact.",
      fullDescription:
        "ASBESOC works with individuals, communities, government institutions, development organizations, stakeholders and other partners. These partnerships help create practical responses to social and economic challenges while supporting long-term community development.",
      highlights: [
        "Stakeholder collaboration",
        "Community partnerships",
        "Government engagement",
        "Development partnerships",
        "Shared responsibility",
        "Sustainable impact",
      ],
    },

    {
      id: 7,
      title: "Community Inclusion & Participation",
      category: "Social Development",
      year: "2026",
      image: `${imageBaseUrl}IMGL1140.jpg`,
      summary:
        "Creating inclusive spaces where community members can participate, connect and contribute to positive social transformation.",
      fullDescription:
        "Strong communities are built when people are given opportunities to participate. ASBESOC's community-oriented activities encourage inclusion, communication and participation while creating stronger connections between individuals and the wider community.",
      highlights: [
        "Inclusive participation",
        "Community connection",
        "Social development",
        "Positive relationships",
        "Community engagement",
        "Collective responsibility",
      ],
    },
  ];

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  /*
   * Lock the background page while the full-screen project page is open.
   */
  useEffect(() => {
    if (!selectedProject) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <>
      <main className="min-h-screen bg-white text-slate-800">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden bg-[#063b25] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#063b25] via-[#0b5d3b] to-[#1B4332]" />

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">

              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />

                  <span className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
                    ASBESOC Nigeria
                  </span>
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Projects That Turn
                  <span className="block text-amber-300">
                    Purpose Into Action.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-8 text-emerald-50/90 sm:text-base">
                  Discover initiatives through which ASBESOC promotes peace,
                  behavioural change, empowerment, community participation,
                  advocacy and sustainable development.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-full bg-white px-5 py-3 text-sm font-bold text-[#1B4332] shadow-lg">
                    {projects.length} Featured Projects
                  </div>

                  <div className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md">
                    Community • Peace • Empowerment
                  </div>
                </div>
              </div>

              {/* Decorative project visual */}
              <div className="relative hidden lg:block">
                <div className="relative mx-auto h-[360px] max-w-[330px] rotate-3 overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
                  <img
                    src={bookImage}
                    alt="ASBESOC Peace Building and Behavioural Change Programme"
                    className="h-full w-full rounded-[1.5rem] object-cover"
                  />

                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-[#063b25]/85 p-4 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                      Featured Initiative
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-white">
                      Peace Building & Behavioural Change
                    </p>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-8 h-20 w-20 rounded-2xl border border-amber-300/20 bg-amber-400/10 blur-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            INTRO
        ====================================================== */}
        <section className="px-4 pb-8 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">

              <div className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                  What We Are Doing
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1B4332] sm:text-4xl">
                  From Ideas to Community Impact
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                  Our projects reflect a practical approach to addressing
                  social challenges while empowering people and strengthening
                  communities.
                </p>
              </div>

              <div className="hidden h-20 w-20 rounded-full border-[10px] border-emerald-100 sm:block">
                <div className="h-full w-full rounded-full border-[10px] border-amber-400 border-l-transparent border-b-transparent" />
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            PROJECT CARDS
        ====================================================== */}
        <section className="px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {projects.map((project, index) => (
                <article
                  key={project.id}
                  className={`group overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    index === 0
                      ? "md:col-span-2 xl:col-span-2"
                      : ""
                  }`}
                >
                  {/* IMAGE */}
                  <div
                    className={`relative overflow-hidden bg-[#eef6f1] ${
                      index === 0
                        ? "h-[300px] sm:h-[380px]"
                        : "h-[250px]"
                    }`}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#063b25]/80 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-2 text-[11px] font-black text-[#1B4332] shadow-lg">
                        {String(project.id).padStart(2, "0")}
                      </span>

                      <span className="rounded-full border border-white/20 bg-[#063b25]/70 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                        {project.category}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black text-[#163d31] shadow-lg">
                        {project.year}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">

                    <h3 className="text-xl font-black leading-tight text-[#1B4332]">
                      {project.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                      {project.summary}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">

                      <div className="h-1 flex-1 rounded-full bg-emerald-50">
                        <div className="h-1 w-12 rounded-full bg-amber-400 transition-all duration-500 group-hover:w-24" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1B4332] px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-[#063b25] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                      >
                        Learn More

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </button>

                    </div>
                  </div>
                </article>
              ))}

            </div>
          </div>
        </section>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="relative overflow-hidden rounded-[2rem] bg-[#063b25] px-6 py-12 text-center sm:px-12">

              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-emerald-300/10 blur-2xl" />

              <div className="relative">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  Building A Better Society
                </span>

                <h3 className="mx-auto mt-3 max-w-2xl text-2xl font-black text-white sm:text-3xl">
                  Every project begins with people and ends with impact.
                </h3>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-emerald-50/80">
                  Through participation, empowerment, partnership and
                  sustainable action, ASBESOC continues to work towards a
                  peaceful and better society.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* =======================================================
          FULL-SCREEN PROJECT DETAILS
      ======================================================== */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-[99999] h-screen w-screen overflow-y-auto bg-[#f5f8f5]"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} project details`}
        >
          {/* TOP BAR */}
          <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="mx-auto flex max-w-7xl items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4332] text-xs font-black text-white">
                  {String(selectedProject.id).padStart(2, "0")}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500">
                    ASBESOC Project
                  </p>

                  <p className="hidden max-w-[220px] truncate text-xs font-bold text-[#1B4332] sm:block">
                    {selectedProject.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B4332] text-2xl text-white transition hover:bg-amber-400 hover:text-[#163d31] focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Close project details"
              >
                ×
              </button>

            </div>
          </div>

          {/* FULL PAGE CONTENT */}
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

            {/* FEATURE IMAGE + TITLE */}
            <div className="grid overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-xl lg:grid-cols-[0.9fr_1.1fr]">

              <div className="relative min-h-[320px] bg-[#063b25] sm:min-h-[460px]">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#063b25]/80 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6">
                  <span className="rounded-full bg-amber-400 px-4 py-2 text-xs font-black text-[#163d31] shadow-lg">
                    {selectedProject.year}
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">

                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                  {selectedProject.category}
                </span>

                <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#1B4332] sm:text-4xl lg:text-5xl">
                  {selectedProject.title}
                </h1>

                <div className="mt-6 h-1 w-16 rounded-full bg-amber-400" />

                <p className="mt-6 text-sm leading-8 text-slate-600 sm:text-base">
                  {selectedProject.fullDescription}
                </p>

              </div>
            </div>

            {/* DETAILS */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">

              {/* LEFT */}
              <section className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-10">

                <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                  What This Project Covers
                </span>

                <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
                  Key Areas of Focus
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  The project reflects ASBESOC's wider commitment to
                  developing people, strengthening communities and promoting
                  positive social transformation.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">

                  {selectedProject.highlights.map((highlight, index) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3 rounded-2xl border border-emerald-900/10 bg-[#f5f8f5] p-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-[10px] font-black text-white">
                        {index + 1}
                      </div>

                      <p className="text-xs font-bold leading-5 text-slate-700">
                        {highlight}
                      </p>
                    </div>
                  ))}

                </div>
              </section>

              {/* RIGHT */}
              <aside className="space-y-5">

                <div className="rounded-[2rem] bg-[#1B4332] p-7 text-white shadow-lg sm:p-8">

                  <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                    Why It Matters
                  </span>

                  <h3 className="mt-3 text-2xl font-black">
                    Knowledge can create change.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-emerald-50/80">
                    ASBESOC's approach combines education, empowerment,
                    community participation and partnership to help people
                    become active contributors to a better society.
                  </p>

                </div>

                <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-sm sm:p-8">

                  <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                    Project Information
                  </span>

                  <div className="mt-5 space-y-4">

                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-xs font-medium text-slate-500">
                        Category
                      </span>

                      <span className="text-xs font-black text-[#1B4332]">
                        {selectedProject.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-xs font-medium text-slate-500">
                        Year
                      </span>

                      <span className="text-xs font-black text-[#1B4332]">
                        {selectedProject.year}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Organization
                      </span>

                      <span className="text-xs font-black text-[#1B4332]">
                        ASBESOC Nigeria
                      </span>
                    </div>

                  </div>

                </div>

              </aside>

            </div>

            {/* CLOSE BUTTON */}
            <div className="flex justify-center py-12">

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B4332] px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
              >
                Back to Projects

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Projects;