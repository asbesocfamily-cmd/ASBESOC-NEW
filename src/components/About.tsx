import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.PNG";

type SectionKey = "whoWeAre" | "history" | "commitment" | null;

const coreValues = [
  {
    title: "Integrity & Transparency",
    description:
      "We uphold honesty, accountability, openness, and ethical conduct in all our activities and relationships.",
  },
  {
    title: "Human Dignity & Respect",
    description:
      "We respect the dignity, rights, freedoms, and worth of every individual and community.",
  },
  {
    title: "Peace & Non-Violence",
    description:
      "We promote peaceful coexistence, dialogue, tolerance, conflict prevention, and non-violent approaches to resolving disputes.",
  },
  {
    title: "Justice & Human Rights",
    description:
      "We advocate for equality, fairness, access to justice, and the protection of fundamental human rights.",
  },
  {
    title: "Gender Sensitivity & Inclusion",
    description:
      "We promote equal opportunities and meaningful participation of women, men, girls, boys, persons with disabilities, and other vulnerable groups.",
  },
  {
    title: "Community Participation & Ownership",
    description:
      "We believe sustainable development is achieved when communities actively participate in identifying problems, developing solutions, and taking ownership of interventions.",
  },
  {
    title: "Empowerment & Human Capital Development",
    description:
      "We equip individuals and communities with knowledge, skills, opportunities, and resources that enable them to improve their lives and contribute positively to society.",
  },
  {
    title: "Accountability & Responsibility",
    description:
      "We take responsibility for our decisions, commitments, resources, and impact on the communities we serve.",
  },
  {
    title: "Professionalism & Excellence",
    description:
      "We maintain high standards of competence, quality, efficiency, teamwork, and continuous improvement.",
  },
  {
    title: "Innovation & Creativity",
    description:
      "We encourage creative thinking, learning, technology, and innovative approaches to addressing social and community challenges.",
  },
  {
    title: "Security & Community Resilience",
    description:
      "We support responsible security awareness, community vigilance, early warning, prevention, and resilience while respecting human rights and the rule of law.",
  },
  {
    title: "Partnership & Collaboration",
    description:
      "We work with government institutions, security agencies, civil society organizations, traditional and religious institutions, communities, and other stakeholders to achieve sustainable impact.",
  },
];

const focusAreas = [
  {
    number: "01",
    title: "Peace",
    text: "Promoting peaceful communities and positive social relationships.",
  },
  {
    number: "02",
    title: "Human Empowerment",
    text: "Supporting people to develop their capacity and improve their lives.",
  },
  {
    number: "03",
    title: "Capacity Building",
    text: "Strengthening individuals and communities through knowledge and practical development.",
  },
  {
    number: "04",
    title: "Sustainable Development",
    text: "Creating community-based solutions designed for meaningful and lasting impact.",
  },
];

const commitmentPoints = [
  "Community Participation",
  "Empowerment",
  "Partnership",
  "Sustainable Impact",
];

function About() {
  const [openSection, setOpenSection] = useState<SectionKey>(null);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenSection(null);
      }
    };

    if (openSection) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", closeWithEscape);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [openSection]);

  const sectionContent = {
    whoWeAre: {
      eyebrow: "WHO WE ARE",
      title: "Building a Better Society Together",
      text: `Association for a Better Society (ASBESOC) – Nigeria is a non-governmental, non-political and non-profit charitable organization focused mainly on economic empowerment for crime reduction and committed to building a peaceful, just and better society.

ASBESOC works with individuals, communities, government institutions, development organizations, stakeholders and partners to identify social and economic challenges and develop practical community-based solutions.

The organization is designed to touch lives, particularly those of the downtrodden, while promoting peace, positive behavioural change, human empowerment, capacity building, advocacy and sustainable community development.`,
    },

    history: {
      eyebrow: "OUR HISTORY",
      title: "A Journey That Began in 1999",
      text: `ASBESOC was founded in the third quarter of 1999 by Chief Hon. Dr. Engr. Igwe Chibuike Elias Elijah after observing increasing social challenges within society.

The organization was established from the conviction that individuals and communities can identify the challenges affecting them, develop practical solutions and work collectively towards building a better society.

The name Association for a Better Society reflects the vision of bringing people together to address societal challenges and promote positive social transformation.

In the third quarter of 2001, the organization's head office was established at Plot 359, Mmirinaezora-ora Avenue, New G.R.A, Trans Ekulu, Enugu, Enugu State, Nigeria.

Since its establishment, ASBESOC has remained committed to peace, social development, human empowerment, positive behavioural change and sustainable community development.`,
    },

    commitment: {
      eyebrow: "OUR COMMITMENT",
      title: "Change Is a Collective Responsibility",
      text: `Building a better society is a collective responsibility. ASBESOC works with communities, government institutions, development organizations, stakeholders and partners to create sustainable solutions to social and economic challenges.

Our approach is centred on community participation, empowerment, partnership and sustainable impact.

Through this approach, ASBESOC seeks to create meaningful and lasting change in the lives of individuals and communities while contributing to a peaceful, empowered and better society.`,
    },
  };

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#f5f8f5] text-slate-800">
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#064e3b]">
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-28">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <span
                  className="h-2 w-2 rounded-full bg-amber-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold tracking-[0.2em] text-white/80">
                  ABOUT ASBESOC
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Together, we can build a{" "}
                <span className="text-amber-400">better society.</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-emerald-50/85 sm:text-lg">
                ASBESOC is committed to peace, empowerment, positive behavioural
                change and sustainable community development.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setOpenSection("whoWeAre")}
                  className="rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-[#163d31] shadow-lg shadow-amber-950/20 transition duration-300 hover:-translate-y-1 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Learn More
                </button>

                <Link
                  to="/programs"
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-[#064e3b] focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Explore Our Programs
                </Link>
              </div>
            </div>

            <div className="relative flex min-h-[350px] items-center justify-center lg:min-h-[500px]">
              <div className="absolute h-[310px] w-[310px] rounded-full border border-white/10 sm:h-[400px] sm:w-[400px]" />

              <div className="absolute h-[250px] w-[250px] rounded-full bg-white/5 blur-sm sm:h-[340px] sm:w-[340px]" />

              <div className="relative flex h-[270px] w-[270px] items-center justify-center rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/20 sm:h-[370px] sm:w-[370px] sm:p-12">
                <img
                  src={logo}
                  alt="Association for a Better Society Nigeria"
                  width="730"
                  height="615"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="absolute bottom-4 right-8 hidden rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-md sm:block">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-100/70">
                  Since
                </p>
                <p className="mt-1 text-2xl font-bold text-white">1999</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHO WE ARE */}
        <section className="bg-white px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                WHO WE ARE
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#064e3b] sm:text-4xl">
                An organization focused on people, communities and lasting
                change.
              </h2>

              <div className="mt-6 h-1 w-16 rounded-full bg-amber-400" />
            </div>

            <div>
              <p className="text-base leading-8 text-slate-600 sm:text-lg">
                Association for a Better Society (ASBESOC) – Nigeria is a
                non-governmental, non-political and non-profit charitable
                organization focused mainly on economic empowerment for crime
                reduction and committed to a peaceful, just and better society.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                We work with individuals, communities, government institutions,
                development organizations, stakeholders and partners to
                identify social and economic challenges and develop practical,
                community-based solutions.
              </p>

              <button
                type="button"
                onClick={() => setOpenSection("whoWeAre")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-[#163d31] transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
              >
                Read Our Story
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* HISTORY */}
        <section className="bg-[#eef6f1] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                OUR HISTORY
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[#064e3b] sm:text-5xl">
                A journey that started with a belief in people.
              </h2>

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                Founded in the third quarter of 1999, ASBESOC was created from
                the conviction that people and communities can identify their
                challenges, develop practical solutions and work together to
                create a better society.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-4xl font-black text-[#064e3b]">1999</p>
                <div className="mt-5 h-px w-full bg-slate-200" />

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  The Beginning
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  ASBESOC was founded in response to increasing social
                  challenges and the need for practical community solutions.
                </p>
              </article>

              <article className="rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-4xl font-black text-[#064e3b]">2001</p>
                <div className="mt-5 h-px w-full bg-slate-200" />

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Head Office
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The organization&apos;s head office was established in Enugu,
                  Enugu State, Nigeria.
                </p>
              </article>

              <article className="rounded-3xl bg-[#064e3b] p-7 text-white shadow-xl shadow-emerald-950/10 transition duration-300 hover:-translate-y-1">
                <p className="text-4xl font-black text-amber-400">Today</p>
                <div className="mt-5 h-px w-full bg-white/15" />

                <h3 className="mt-5 text-lg font-bold">
                  Continuing the Mission
                </h3>

                <p className="mt-3 text-sm leading-7 text-emerald-50/75">
                  ASBESOC continues to work towards peace, empowerment,
                  positive behavioural change and sustainable development.
                </p>
              </article>
            </div>

            <button
              type="button"
              onClick={() => setOpenSection("history")}
              className="mt-9 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-[#163d31] transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
            >
              Explore Our Full History →
            </button>
          </div>
        </section>

        {/* VISION AND MISSION */}
        <section className="bg-white px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                WHAT GUIDES US
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[#064e3b] sm:text-5xl">
                Our Vision & Mission
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Two commitments that guide the work we do and the change we seek
                to create.
              </p>
            </div>

            <div className="mt-14 grid gap-7 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[#f5f8f5] p-8 sm:p-10">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-100/70 transition duration-500 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#064e3b] shadow-lg shadow-emerald-950/15">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-400">
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="absolute h-[2px] w-11 rotate-45 bg-amber-400/70" />
                    </div>
                  </div>

                  <p className="mt-8 text-xs font-bold tracking-[0.2em] text-amber-500">
                    OUR VISION
                  </p>

                  <h3 className="mt-3 text-2xl font-bold text-[#064e3b] sm:text-3xl">
                    A peaceful, empowered and better society.
                  </h3>

                  <p className="mt-5 max-w-xl leading-8 text-slate-600">
                    To contribute to a peaceful, empowered and better society
                    where individuals and communities can thrive, while
                    building a crime and corrupt-free society with a safe and
                    secure environment.
                  </p>

                  <div className="mt-8 h-1 w-14 rounded-full bg-amber-400" />
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-[2rem] bg-[#064e3b] p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-10">
                <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-emerald-400/10 transition duration-500 group-hover:scale-125" />

                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                    <div className="relative h-8 w-8">
                      <div className="absolute left-1 top-1 h-6 w-6 rounded-full border-2 border-amber-400" />
                      <div className="absolute left-3 top-3 h-3 w-3 rounded-full bg-amber-400" />
                      <div className="absolute bottom-0 right-0 h-[2px] w-5 rotate-45 bg-amber-400" />
                    </div>
                  </div>

                  <p className="mt-8 text-xs font-bold tracking-[0.2em] text-amber-400">
                    OUR MISSION
                  </p>

                  <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Turning challenges into practical solutions.
                  </h3>

                  <p className="mt-5 max-w-xl leading-8 text-emerald-50/75">
                    To identify and address societal challenges through
                    community initiatives, empowerment, capacity building,
                    advocacy and partnerships that promote peace, positive
                    behavioural change and sustainable development.
                  </p>

                  <div className="mt-8 h-1 w-14 rounded-full bg-amber-400" />
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="relative overflow-hidden bg-[#eef6f1] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-40 -left-32 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                OUR CORE VALUES
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#064e3b] sm:text-5xl">
                The principles that guide our service and impact.
              </h2>

              <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-amber-400" />

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                These values shape our decisions, relationships, partnerships
                and commitment to the individuals and communities we serve.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {coreValues.map((value, index) => (
                <article
                  key={value.title}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-emerald-900/10 bg-white p-7 shadow-[0_10px_35px_rgba(6,78,59,0.06)] transition duration-300 hover:-translate-y-1 hover:border-emerald-700/20 hover:shadow-[0_18px_45px_rgba(6,78,59,0.12)] sm:p-8"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#064e3b] text-sm font-black text-amber-400 shadow-lg shadow-emerald-950/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-400 transition duration-300 group-hover:scale-125"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-6 text-xl font-bold leading-snug text-[#064e3b]">
                    {value.title}
                  </h3>

                  <div className="mt-4 h-[2px] w-10 rounded-full bg-amber-400" />

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 rounded-[1.75rem] bg-[#064e3b] px-6 py-7 text-center shadow-xl shadow-emerald-950/10 sm:px-10">
              <p className="text-sm font-semibold leading-7 text-emerald-50/85 sm:text-base">
                Integrity • Human Dignity • Peace • Justice • Inclusion •
                Community Participation • Empowerment • Accountability •
                Professionalism • Innovation • Security • Partnership
              </p>
            </div>
          </div>
        </section>

        {/* OUR COMMITMENT */}
        <section className="bg-[#f5f8f5] px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                OUR COMMITMENT
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#064e3b] sm:text-5xl">
                Building a better society is everyone&apos;s responsibility.
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Our approach is centred on community participation,
                empowerment, partnership and sustainable impact. We work
                together with communities, institutions and partners to create
                solutions that can produce meaningful and lasting change.
              </p>

              <button
                type="button"
                onClick={() => setOpenSection("commitment")}
                className="mt-8 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-[#163d31] transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
              >
                Read Our Commitment →
              </button>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] bg-[#064e3b] p-8 shadow-2xl shadow-emerald-950/15 sm:p-10">
                <div className="grid gap-6">
                  {commitmentPoints.map((point, index) => (
                    <div
                      key={point}
                      className={
                        index !== commitmentPoints.length - 1
                          ? "border-b border-white/10 pb-6"
                          : ""
                      }
                    >
                      <p className="text-xs font-bold tracking-[0.18em] text-amber-400">
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-white">
                        {point}
                      </h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR FOCUS */}
        <section className="bg-white px-6 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold tracking-[0.2em] text-amber-500">
                OUR FOCUS
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[#064e3b] sm:text-5xl">
                Areas where we seek to make an impact.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {focusAreas.map((item) => (
                <article
                  key={item.number}
                  className="rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
                >
                  <p className="text-sm font-black text-amber-500">
                    {item.number}
                  </p>

                  <h3 className="mt-6 text-xl font-bold text-[#064e3b]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#064e3b] px-6 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold tracking-[0.2em] text-amber-400">
                BE PART OF THE CHANGE
              </p>

              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                Together, we can contribute to a better society.
              </h2>

              <p className="mt-4 leading-7 text-emerald-50/70">
                Join ASBESOC in supporting communities, empowering people and
                creating sustainable solutions.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/membership"
                className="rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-[#163d31] transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
              >
                Join ASBESOC
              </Link>

              <Link
                to="/contact"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-[#064e3b]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FULL-SCREEN INFORMATION EXPERIENCE */}
      {openSection && (
        <div
          className="fixed inset-0 z-[999] overflow-y-auto bg-[#064e3b]"
          role="dialog"
          aria-modal="true"
          aria-label={sectionContent[openSection].title}
        >
          <div
            className="pointer-events-none fixed -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-300/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none fixed -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative min-h-screen">
            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#064e3b]/90 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full bg-amber-400"
                    aria-hidden="true"
                  />

                  <span className="text-xs font-bold tracking-[0.2em] text-white/70">
                    ASBESOC
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenSection(null)}
                  aria-label="Close information"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xl text-white transition hover:bg-amber-400 hover:text-[#163d31]"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="mx-auto flex min-h-[calc(100vh-81px)] max-w-5xl items-center px-6 py-16 sm:px-8 lg:py-24">
              <article className="w-full">
                <div className="max-w-3xl">
                  <p className="text-xs font-bold tracking-[0.25em] text-amber-400">
                    {sectionContent[openSection].eyebrow}
                  </p>

                  <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {sectionContent[openSection].title}
                  </h1>

                  <div className="mt-7 h-1 w-20 rounded-full bg-amber-400" />
                </div>

                <div className="mt-12 max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 backdrop-blur-sm sm:p-10 lg:p-12">
                  {sectionContent[openSection].text
                    .split("\n\n")
                    .map((paragraph, index) => (
                      <p
                        key={`${openSection}-${index}`}
                        className="mb-7 text-base leading-8 text-emerald-50/80 last:mb-0 sm:text-lg sm:leading-9"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => setOpenSection(null)}
                  className="mt-10 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-[#163d31] transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
                >
                  Back to About →
                </button>
              </article>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default About;