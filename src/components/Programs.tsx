import { useEffect, useRef, useState, type ReactNode } from "react";

import housingImage from "../assets/programs/housing-programme.webp";
import programsHero from "../assets/programs/programs-hero.webp";
import introImageOne from "../assets/programs/programs-intro.webp";
import vpadMainImage from "../assets/programs/vpad-main.webp";
import vpadImageTwo from "../assets/programs/vpad-community.webp";
import vpadImageThree from "../assets/programs/vpad-participants.webp";

type ProgramId = "housing" | "vpad" | "peace";

const peaceRoads = [
  {
    number: "01",
    title: "Think Peace",
    text: "Before taking an action, consider whether the action will promote or undermine peace.",
  },
  {
    number: "02",
    title: "Talk Peace",
    text: "Before speaking, consider whether your words will create understanding or unnecessary conflict.",
  },
  {
    number: "03",
    title: "Make Peace",
    text: "When disagreements arise, encourage peaceful dialogue and appropriate mediation rather than allowing conflict to escalate.",
  },
  {
    number: "04",
    title: "Build Peace",
    text: "Individuals and communities should deliberately plan and behave in ways that sustain peace over time.",
  },
];

const approach = [
  {
    number: "01",
    title: "Identify",
    text: "Understand the social and economic challenges affecting people and communities.",
  },
  {
    number: "02",
    title: "Engage",
    text: "Work with communities, stakeholders and institutions to develop practical responses.",
  },
  {
    number: "03",
    title: "Empower",
    text: "Strengthen people with opportunities, knowledge and the capacity to participate.",
  },
  {
    number: "04",
    title: "Sustain",
    text: "Promote solutions designed to create lasting social and community impact.",
  },
];

const volunteerQualities = [
  "Good character",
  "Commitment to peace",
  "Integrity",
  "Respect for others",
  "Willingness to learn",
  "Team spirit",
  "Commitment to community service",
  "Responsible communication",
  "Respect for laws and institutions",
];

const volunteerResponsibilities = [
  "Promote peace and peaceful coexistence.",
  "Educate others on peacebuilding and responsible behaviour.",
  "Help identify causes and warning signs of conflict.",
  "Encourage dialogue and peaceful problem-solving.",
  "Participate in sensitization and awareness activities.",
  "Promote respect for human rights.",
  "Share credible information through appropriate channels.",
  "Participate in relevant training and meetings.",
  "Support community-development activities.",
  "Encourage livelihood and self-help initiatives.",
  "Maintain constructive relationships with stakeholders.",
  "Respect confidentiality where required.",
  "Provide accurate reports when necessary.",
  "Work effectively as part of a team.",
  "Serve as a responsible role model within the community.",
];

const peaceOverview = [
  "The Peace Building and Behavioural Change Programme is a core programme of the Association for a Better Society (ASBESOC) Nigeria, designed to promote peaceful coexistence, positive behavioural transformation, social responsibility and sustainable community development.",
  "The programme is based on the understanding that sustainable peace is not achieved merely by preventing violence. It requires positive changes in the way individuals, families, communities and institutions think, communicate, relate, respond to conflict and participate in society.",
  "ASBESOC combines peacebuilding with behavioural change approaches to address attitudes, beliefs, social norms and behaviours that can contribute to conflict, discrimination, intolerance, human-rights violations and social exclusion.",
  "Through training, community engagement, dialogue, advocacy, sensitization, mentorship, stakeholder partnerships and community-based initiatives, ASBESOC seeks to build communities where people can resolve disagreements peacefully, respect human rights, embrace diversity, communicate responsibly and work together for sustainable development.",
];

const peaceVision =
  "To build peaceful, inclusive and resilient communities where individuals and institutions demonstrate positive behaviours, respect human dignity, prevent conflict and actively contribute to sustainable peace and development.";

const peaceMission =
  "To strengthen the capacity of individuals, communities and institutions to prevent conflict, transform harmful behaviours, promote peaceful relationships, protect human rights and work collectively towards sustainable peace and community development.";

const peaceActivities = [
  "Conflict prevention",
  "Dialogue and communication",
  "Conflict management and resolution",
  "Reconciliation",
  "Human-rights education",
  "Social cohesion",
  "Community participation",
  "Youth and women engagement",
  "Community development",
  "Strengthening responsible institutions",
  "Promotion of tolerance and inclusion",
];

const peaceObjectives = [
  "Promote peaceful coexistence among individuals and communities.",
  "Strengthen community capacity for conflict prevention and resolution.",
  "Promote positive behavioural change among children, young people, adults and community leaders.",
  "Increase knowledge of human rights and civic responsibilities.",
  "Promote constructive communication and dialogue.",
  "Reduce attitudes and behaviours that contribute to conflict, discrimination and violence.",
  "Strengthen social cohesion and community resilience.",
  "Encourage youth and women to participate meaningfully in peacebuilding.",
  "Promote responsible citizenship and community ownership.",
  "Strengthen collaboration among communities, government institutions, security agencies, civil society organizations and other stakeholders.",
  "Support community-led initiatives that contribute to peace and development.",
  "Promote integrity, accountability and positive leadership.",
  "Develop a network of trained community peace and behavioural-change advocates.",
  "Generate evidence and learning to improve peacebuilding interventions.",
];

const changeSteps = [
  "Knowledge",
  "Awareness",
  "Attitude",
  "Skills",
  "Behaviour",
  "Relationships",
  "Community Change",
  "Sustainable Peace",
];

const engagementSteps = [
  "Community Assessment",
  "Stakeholder Consultation",
  "Programme Design",
  "Community Mobilization",
  "Implementation",
  "Feedback",
  "Follow-up",
  "Evaluation",
];

const reflectionQuestions = [
  "What can I do to promote peace?",
  "How do my words affect others?",
  "How can I manage disagreement positively?",
  "How can I respect the rights and dignity of others?",
  "How can I become a positive role model?",
  "What can I do to improve my community?",
];

const learnMoreClass =
  "group mt-9 inline-flex items-center gap-3 border-b-2 border-amber-400 pb-1 text-left text-sm font-black text-[#123C2D] transition hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700";

function Programs() {
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramId | null>(null);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#F8FAF7] text-slate-900">
        {/* PROGRAMS HERO */}
        <section
          id="our-programmes"
          className="relative isolate flex min-h-[500px] items-center overflow-hidden bg-[#082E22] sm:min-h-[570px] lg:min-h-[620px]"
        >
          <img
            src={programsHero}
            alt="ASBESOC programmes and community activities"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-30 h-full w-full object-cover"
          />

          <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#082E22]/95 via-[#0B3A2B]/80 to-[#0B3A2B]/35" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#082E22]/70 via-transparent to-[#082E22]/15" />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[45px] border-white/10 sm:h-96 sm:w-96"
          />

          <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[2px] w-9 bg-amber-400"
                />
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                  ASBESOC Nigeria
                </p>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Our<span className="text-amber-300"> Programs</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
                Turning our commitment to a peaceful, empowered and better
                society into practical initiatives that respond to real
                community needs.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-bold text-white/75">
                <span>Community</span>
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-amber-400"
                />
                <span>Empowerment</span>
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-amber-400"
                />
                <span>Peace</span>
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-amber-400"
                />
                <span>Development</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAMS INTRO */}
        <section className="relative bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-10 lg:py-28">
            <div className="relative mx-auto w-full max-w-[560px] pb-10 pr-5 sm:pb-16 sm:pr-14">
              <div className="overflow-hidden rounded-[1.8rem] shadow-[0_25px_70px_rgba(18,60,45,0.16)]">
                <img
                  src={introImageOne}
                  alt="ASBESOC community programme"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="absolute bottom-0 right-0 w-[45%] overflow-hidden rounded-[1.3rem] border-[6px] border-white shadow-xl sm:w-[42%]">
                <img
                  src={vpadMainImage}
                  alt="ASBESOC programme activity"
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              </div>

              <div
                aria-hidden="true"
                className="absolute -left-3 top-8 h-24 w-2 rounded-full bg-amber-400 sm:-left-5 sm:h-32"
              />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">
                Programmes With Purpose
              </p>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-5xl">
                From social challenges
                <span className="block text-emerald-700">
                  to practical action.
                </span>
              </h2>

              <p className="mt-7 text-base leading-8 text-slate-600 sm:text-lg">
                ASBESOC develops practical programmes around the realities
                affecting individuals, families and communities.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600">
                Our work brings together community participation, empowerment,
                peacebuilding and sustainable development to create solutions
                that can improve lives and strengthen society.
              </p>

              <div className="mt-9 rounded-r-2xl border-l-4 border-amber-400 bg-[#F6F8F4] px-5 py-5">
                <p className="text-sm font-bold leading-7 text-[#123C2D]">
                  Building solutions with people, for people and for stronger
                  communities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOUSING PROGRAMME */}
        <section className="relative overflow-hidden bg-[#F5F8F3]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-36 top-20 h-80 w-80 rounded-full border-[55px] border-emerald-900/[0.035]"
          />

          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-4 -top-4 h-28 w-28 rounded-tl-[2rem] border-l-4 border-t-4 border-amber-400 sm:-left-6 sm:-top-6"
                />

                <div className="relative overflow-hidden rounded-[1.7rem] bg-white shadow-[0_25px_65px_rgba(18,60,45,0.12)]">
                  <img
                    src={housingImage}
                    alt="The End of Housing Deficit Programme"
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-5 right-5 max-w-[calc(100%-2.5rem)] rounded-xl bg-[#123C2D] px-5 py-4 shadow-xl sm:right-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                    ASBESOC Programme
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    Housing & Community Development
                  </p>
                </div>
              </div>

              <div className="pt-5 lg:pt-0">
                <ProgramLabel
                  number="01"
                  label="Housing & Community Development"
                />

                <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-[2.8rem]">
                  The End of Housing
                  <span className="block text-emerald-700">
                    Deficit Programme
                  </span>
                </h2>

                <p className="mt-5 text-lg font-bold leading-8 text-[#476458]">
                  Creating pathways towards affordable and sustainable home
                  ownership.
                </p>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  An ASBESOC initiative aimed at promoting access to decent,
                  secure and affordable housing for individuals and families.
                </p>

                <p className="mt-4 text-base leading-8 text-slate-600">
                  The programme provides a structured pathway towards home
                  ownership through accessible contribution arrangements while
                  encouraging savings, financial discipline and long-term
                  planning.
                </p>

                <NumberedItems
                  items={[
                    "Affordable Home Ownership",
                    "Community Development",
                    "Improved Living Conditions",
                    "Sustainable Housing",
                  ]}
                />

                <button
                  type="button"
                  onClick={() => setSelectedProgram("housing")}
                  className={learnMoreClass}
                >
                  Learn More About The Programme
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT STATEMENT */}
        <section className="relative overflow-hidden bg-[#123C2D]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full border-[50px] border-white/[0.035]"
          />

          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
            <div className="grid items-center gap-7 md:grid-cols-[auto_1fr] md:gap-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 bg-white/5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7 text-amber-300"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s7-4.35 7-11a4 4 0 0 0-7-2.65A4 4 0 0 0 5 10c0 6.65 7 11 7 11Z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  People At The Centre
                </p>
                <p className="mt-3 max-w-4xl text-xl font-bold leading-8 text-white sm:text-2xl">
                  Sustainable change begins when people and communities are
                  equipped to participate in building a better society.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* V-PAD PROGRAMME */}
        <section className="relative bg-white">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
              <div>
                <ProgramLabel
                  number="02"
                  label="Peacebuilding & Community Development"
                />

                <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-[2.8rem]">
                  Volunteer Peace
                  <span className="block text-emerald-700">
                    Advocates Project
                  </span>
                  <span className="mt-2 block text-2xl text-amber-500 sm:text-3xl">
                    V-PAD
                  </span>
                </h2>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  V-PAD is a flagship peacebuilding and community-development
                  initiative of ASBESOC Nigeria.
                </p>

                <p className="mt-4 text-base leading-8 text-slate-600">
                  Introduced in 2015, the project creates a structured network
                  of volunteers committed to promoting peaceful coexistence,
                  preventing and managing conflicts, protecting human rights,
                  supporting community security and strengthening integrity.
                </p>

                {/* Completed four peace cards */}
                <PeaceCards />

                <button
                  type="button"
                  onClick={() => setSelectedProgram("vpad")}
                  className={learnMoreClass}
                >
                  Learn More About V-PAD
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </div>

              <div className="relative mx-auto w-full max-w-[620px] pb-12">
                <div className="overflow-hidden rounded-[1.7rem] shadow-[0_25px_70px_rgba(18,60,45,0.15)]">
                  <img
                    src={vpadMainImage}
                    alt="ASBESOC V-PAD community activity"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[5/4] w-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-2 left-3 w-[37%] overflow-hidden rounded-[1.2rem] border-[5px] border-white shadow-xl sm:-left-7 sm:w-[40%]">
                  <img
                    src={vpadImageTwo}
                    alt="ASBESOC peace and community programme"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className="absolute -bottom-2 right-3 w-[37%] overflow-hidden rounded-[1.2rem] border-[5px] border-white shadow-xl sm:-right-5 sm:w-[38%]">
                  <img
                    src={vpadImageThree}
                    alt="ASBESOC programme participants"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className="absolute -right-3 top-7 hidden rounded-l-xl bg-amber-400 px-4 py-3 shadow-lg sm:block">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#123C2D]">
                    Works For Peace
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PEACE BUILDING AND BEHAVIOURAL CHANGE */}
        <section className="relative overflow-hidden bg-[#F5F8F3]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <ProgramLabel
                  number="03"
                  label="Peace Building & Behavioural Change"
                />

                <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-[2.8rem]">
                  Peace Building and
                  <span className="block text-emerald-700">
                    Behavioural Change Programme
                  </span>
                </h2>

                <p className="mt-5 text-lg font-bold leading-8 text-[#476458]">
                  Building Peaceful Communities Through Positive Behaviour,
                  Dialogue, Human Rights and Community Action
                </p>

                <p className="mt-6 text-base leading-8 text-slate-600">
                  {peaceOverview[0]}
                </p>

                <p className="mt-4 text-base leading-8 text-slate-600">
                  {peaceOverview[2]}
                </p>

                <button
                  type="button"
                  onClick={() => setSelectedProgram("peace")}
                  className={learnMoreClass}
                >
                  Learn More About The Programme
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>
              </div>

              <aside className="relative overflow-hidden rounded-[1.8rem] bg-[#123C2D] p-7 text-white shadow-xl sm:p-9">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border-[30px] border-white/5"
                />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                    ASBESOC&apos;s Peace and Behavioural Change Message
                  </p>

                  <h3 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                    Peace begins with me.
                  </h3>

                  <div className="mt-6 h-1 w-12 rounded-full bg-amber-400" />

                  <p className="mt-6 text-sm leading-7 text-white/80">
                    Every individual is encouraged to ask:
                  </p>

                  <ul className="mt-5 space-y-4">
                    {reflectionQuestions.map((question) => (
                      <li key={question} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300"
                        />
                        <span className="text-sm leading-7 text-white/85">
                          {question}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* OUR APPROACH */}
        <section className="relative overflow-hidden bg-[#F3F7F2]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full border-[60px] border-emerald-900/[0.025]"
          />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">
                Our Approach
              </p>

              <h2 className="mt-4 text-3xl font-black leading-tight text-[#123C2D] sm:text-4xl">
                Community-centred.
                <span className="text-emerald-700">
                  {" "}Sustainable by design.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                Our programmes are developed around participation, practical
                action and solutions designed to create lasting impact.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {approach.map((item) => (
                <article
                  key={item.number}
                  className="group relative h-full overflow-hidden rounded-[1.4rem] border border-emerald-900/10 bg-white p-6 shadow-[0_10px_30px_rgba(18,60,45,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,60,45,0.11)] motion-reduce:transform-none"
                >
                  <div
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-50"
                  />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123C2D] text-xs font-black text-amber-300">
                      {item.number}
                    </div>

                    <h3 className="mt-5 text-xl font-black text-[#123C2D]">
                      {item.title}
                    </h3>

                    <div className="mt-3 h-[3px] w-8 rounded-full bg-amber-400" />

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* HOUSING READING VIEW */}
      {selectedProgram === "housing" && (
        <ReadingPage
          eyebrow="Housing & Community Development"
          title="The End of Housing Deficit Programme"
          onClose={() => setSelectedProgram(null)}
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xl font-bold leading-9 text-emerald-800">
                Creating pathways towards affordable and sustainable home
                ownership.
              </p>

              <Paragraphs
                paragraphs={[
                  "The End of Housing Deficit Programme is an ASBESOC initiative aimed at promoting access to decent, secure and affordable housing for individuals and families.",
                  "The programme provides a structured pathway towards home ownership through accessible contribution arrangements, encouraging savings, financial discipline and long-term planning.",
                  "It is designed to contribute to improved living conditions, community development and greater social and economic stability.",
                ]}
              />
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-xl">
              <img
                src={housingImage}
                alt="The End of Housing Deficit Programme"
                decoding="async"
                className="h-auto w-full"
              />
            </div>
          </div>

          <section className="mt-16 rounded-[1.7rem] bg-[#F4F8F3] p-6 sm:p-9">
            <SectionHeading
              eyebrow="Key Focus Areas"
              title="Building pathways towards secure homes."
            />

            <NumberedItems
              items={[
                "Affordable home ownership",
                "Community Development",
                "Financial planning and savings",
                "Improved living conditions",
                "Sustainable housing opportunities",
                "Reduction of housing challenges",
              ]}
            />
          </section>

          <ClosingStatement eyebrow="Our Goal">
            To contribute to reducing housing deficit and creating opportunities
            for individuals and families to access decent and secure homes.
          </ClosingStatement>
        </ReadingPage>
      )}

      {/* V-PAD READING VIEW */}
      {selectedProgram === "vpad" && (
        <ReadingPage
          eyebrow="Peacebuilding & Community Development"
          title="Volunteer Peace Advocates Project (V-PAD)"
          onClose={() => setSelectedProgram(null)}
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="text-xl font-black leading-9 text-emerald-800">
                V-PAD! Works for PEACE!! Works for PEACE as a Team!!!
              </p>

              <Paragraphs
                paragraphs={[
                  "The Volunteer Peace Advocates Project (V-PAD) is a flagship peacebuilding and community-development initiative of the Association for a Better Society (ASBESOC) Nigeria.",
                  "Introduced by ASBESOC in 2015, V-PAD creates a structured network of volunteers committed to promoting peaceful coexistence, preventing and managing conflicts, protecting human rights, supporting community security, promoting empowerment and strengthening integrity.",
                  "V-PAD recognizes that sustainable peace depends not only on governments and formal institutions, but also on responsible individuals and communities.",
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <img
                src={vpadMainImage}
                alt="V-PAD programme"
                decoding="async"
                className="col-span-2 aspect-[16/10] w-full rounded-2xl object-cover"
              />
              <img
                src={vpadImageTwo}
                alt="ASBESOC programme activity"
                decoding="async"
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <img
                src={vpadImageThree}
                alt="ASBESOC community activity"
                decoding="async"
                className="aspect-square w-full rounded-2xl object-cover"
              />
            </div>
          </div>

          <section className="mt-16 grid gap-5 lg:grid-cols-2">
            <VisionMissionCard
              label="Vision"
              title="One billion peace volunteers."
              text="To reach ONE BILLION peace volunteers who can think peace, talk peace, make and build sustainable peace beyond Nigeria for mutual human co-existence, peaceful socio-cultural growth and economic development across Africa and the entire world."
            />

            <VisionMissionCard
              dark
              label="Mission"
              title="Mobilize. Train. Organize."
              text="To mobilize, train and organize credible volunteers for peacebuilding, conflict management, human-rights promotion, community safety, empowerment and integrity development."
            />
          </section>

          <section className="mt-16 border-t border-slate-200 pt-10">
            <SectionHeading
              eyebrow="Peacebuilding Philosophy"
              title="The Four Roads To Achieving Peace"
            />
            <PeaceCards />
          </section>

          <section className="mt-16 rounded-[1.8rem] bg-[#F3F7F2] p-6 sm:p-9">
            <SectionHeading eyebrow="Our Core Values" title="V-PAD SMILE" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["S", "Sacrifice"],
                ["M", "Morality"],
                ["I", "Integrity"],
                ["L", "Love"],
                ["E", "Role Models"],
              ].map(([letter, value]) => (
                <div
                  key={letter}
                  className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-5 text-7xl font-black text-emerald-900/[0.035]"
                  >
                    {letter}
                  </span>
                  <div className="relative">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#123C2D] text-xl font-black text-amber-300">
                      {letter}
                    </span>
                    <p className="mt-4 text-sm font-black text-slate-700">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 border-t border-slate-200 pt-10">
            <SectionHeading
              eyebrow="Volunteer Network"
              title="Who is a V-PAD Volunteer?"
            />

            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-600">
              A V-PAD volunteer is a credible person willing to promote peace,
              support the objectives of V-PAD and contribute to its mission.
              Membership is open to credible adults subject to application,
              assessment and screening.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {volunteerQualities.map((item) => (
                <li
                  key={item}
                  className="flex min-h-[82px] items-center gap-4 rounded-xl border border-emerald-900/10 bg-white p-4 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-800"
                  >
                    ✓
                  </span>
                  <span className="text-sm font-bold leading-6 text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-16 rounded-[1.8rem] bg-[#F5F8F3] p-6 sm:p-9">
            <SectionHeading
              eyebrow="Community Service"
              title="Responsibilities of V-PAD Volunteers"
            />
            <NumberedItems items={volunteerResponsibilities} />
          </section>

          <ClosingStatement eyebrow="V-PAD">
            Think Peace. Talk Peace. Make Peace. Build Peace.
            <span className="mt-5 block text-sm font-bold text-white/70">
              V-PAD — Making Peace-Legends for God.
            </span>
          </ClosingStatement>
        </ReadingPage>
      )}

      {/* PEACE BUILDING READING VIEW */}
      {selectedProgram === "peace" && (
        <ReadingPage
          eyebrow="Peace Building & Behavioural Change"
          title="Peace Building and Behavioural Change Programme"
          onClose={() => setSelectedProgram(null)}
        >
          <p className="max-w-4xl text-xl font-bold leading-9 text-emerald-800">
            Building Peaceful Communities Through Positive Behaviour, Dialogue,
            Human Rights and Community Action
          </p>

          <ReadingSection title="Programme Overview">
            <Paragraphs paragraphs={peaceOverview} />
          </ReadingSection>

          <section className="mt-12 grid gap-5 lg:grid-cols-2">
            <VisionMissionCard
              label="Programme Vision"
              text={peaceVision}
            />
            <VisionMissionCard
              dark
              label="Programme Mission"
              text={peaceMission}
            />
          </section>

          <ReadingSection title="Background and Rationale">
            <Paragraphs
              paragraphs={[
                "Conflicts and social tensions often begin with attitudes, perceptions, behaviours and relationships long before they develop into open confrontation.",
                "Negative stereotypes, intolerance, poor communication, misinformation, discrimination, exclusion, lack of understanding, abuse of rights and inability to manage disagreements constructively can create conditions in which conflict becomes more likely.",
                "ASBESOC seeks to strengthen positive community resources while addressing behaviours and social practices that undermine peaceful coexistence. The programme therefore emphasizes prevention, early engagement, behavioural transformation, dialogue, community participation and long-term peacebuilding.",
              ]}
            />
          </ReadingSection>

          <ReadingSection title="What Is Peacebuilding?">
            <Paragraphs
              paragraphs={[
                "For ASBESOC, peacebuilding is the process of supporting individuals, communities and institutions to prevent conflict, address the causes and effects of conflict, strengthen relationships and create conditions for peaceful and sustainable coexistence.",
                "Peacebuilding includes:",
              ]}
            />
            <NumberedItems items={peaceActivities} />
          </ReadingSection>

          <ReadingSection title="What Is Behavioural Change?">
            <Paragraphs
              paragraphs={[
                "Behavioural change refers to positive and sustainable changes in the way individuals and groups think, communicate, make decisions and interact with others.",
                "ASBESOC promotes behaviours that demonstrate respect, empathy, tolerance, integrity, responsible communication, non-violent problem-solving, accountability, cooperation, inclusion and responsible citizenship.",
                "The programme recognizes that information alone does not always produce behavioural change. Sustainable change requires knowledge, reflection, skills, supportive relationships, positive role models, community participation and an enabling environment.",
              ]}
            />
          </ReadingSection>

          <ReadingSection title="The Link Between Peacebuilding and Behavioural Change">
            <Paragraphs
              paragraphs={[
                "Peacebuilding and behavioural change are closely connected. Sustainable peace becomes stronger when people develop the personal and social behaviours required to manage disagreements constructively.",
                "ASBESOC's approach can be summarized as:",
              ]}
            />

            <ProcessSteps items={changeSteps} />

            <p className="mt-6 text-base leading-8 text-slate-600">
              Change is promoted at individual, family, community, institutional
              and societal levels.
            </p>
          </ReadingSection>

          <ReadingSection title="Programme Objectives">
            <p className="mt-6 text-base leading-8 text-slate-600">
              The programme aims to:
            </p>
            <NumberedItems items={peaceObjectives} />
          </ReadingSection>

          <ReadingSection title="Target Beneficiaries">
            <Paragraphs
              paragraphs={[
                "Children and adolescents; young people; women; parents and caregivers; community leaders; traditional rulers; religious leaders; teachers and school administrators; community-based organizations; persons with disabilities; vulnerable and marginalized groups; civil society organizations; government institutions; and security.",
              ]}
            />
          </ReadingSection>

          <ReadingSection title="Community Entry and Engagement Approach">
            <p className="mt-6 text-base leading-8 text-slate-600">
              The programme follows:
            </p>

            <ProcessSteps items={engagementSteps} />

            <Paragraphs
              paragraphs={[
                "ASBESOC seeks to understand the local context, existing structures, community priorities and potential risks before intervention, while engaging community leaders and relevant stakeholders to promote ownership.",
              ]}
            />
          </ReadingSection>

          <section className="mt-16 rounded-[1.8rem] bg-[#F3F7F2] p-6 sm:p-9">
            <SectionHeading
              eyebrow="ASBESOC's Peace and Behavioural Change Message"
              title="Peace begins with me."
            />

            <p className="mt-6 text-base leading-8 text-slate-600">
              Every individual is encouraged to ask:
            </p>

            <NumberedItems items={reflectionQuestions} />
          </section>

          <ReadingSection title="ASBESOC's Commitment">
            <Paragraphs
              paragraphs={[
                "ASBESOC is committed to supporting individuals, communities to move from conflict and division towards dialogue, understanding, cooperation and sustainable development.",
                "Through this programme, ASBESOC works to ensure that peace is translated into knowledge, skills, attitudes, behaviours, relationships and community action. The programme recognizes that lasting change takes time and requires continuous engagement.",
              ]}
            />
          </ReadingSection>

          <ReadingSection title="Conclusion">
            <Paragraphs
              paragraphs={[
                "The Peace Building and Behavioural Change Programme represents ASBESOC Nigeria's commitment to addressing the root causes and consequences of conflict while promoting positive behavioural transformation.",
                "By combining peace education, conflict prevention, human-rights awareness, behavioural-change communication, community dialogue, youth and women's participation, empowerment and stakeholder partnerships, the programme provides an integrated approach to building peaceful and resilient communities.",
                "ASBESOC believes that sustainable peace begins with individuals, grows through families and communities, and becomes stronger when institutions and stakeholders work together.",
                "The ultimate goal is to build a society where people do not merely avoid conflict but actively practice respect, empathy, tolerance, integrity, dialogue, inclusion, cooperation and responsible citizenship.",
              ]}
            />
          </ReadingSection>

          <ClosingStatement eyebrow="ASBESOC Peacebuilding Principle">
            Think Peace. Talk Peace. Make Peace. Build Peace.
            <span className="mt-5 block text-sm font-bold leading-7 text-white/75">
              ASBESOC NIGERIA: Working with individuals, Communities for Peace,
              Positive Behavioural Change and Sustainable Development.
            </span>
          </ClosingStatement>
        </ReadingPage>
      )}
    </>
  );
}

/* SHARED COMPONENTS */

function PeaceCards() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {peaceRoads.map((item) => (
        <article
          key={item.number}
          className="group flex h-full flex-col rounded-2xl border border-emerald-900/10 bg-[#F7F9F5] p-5 shadow-[0_7px_22px_rgba(18,60,45,0.05)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg motion-reduce:transform-none"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#123C2D] text-xs font-black text-amber-300">
              {item.number}
            </span>
            <span
              aria-hidden="true"
              className="h-1 w-8 rounded-full bg-amber-400"
            />
          </div>

          <h3 className="mt-5 text-base font-black text-[#123C2D]">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {item.text}
          </p>
        </article>
      ))}
    </div>
  );
}

function NumberedItems({ items }: { items: string[] }) {
  return (
    <ol className="mt-8 grid list-none gap-4 sm:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex items-start gap-4 rounded-xl border border-emerald-900/10 bg-white p-5 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#123C2D] text-[10px] font-black text-amber-300"
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          <p className="text-sm font-medium leading-7 text-slate-700">
            {item}
          </p>
        </li>
      ))}
    </ol>
  );
}

function ProcessSteps({ items }: { items: string[] }) {
  return (
    <ol className="mt-7 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <li
          key={item}
          className="rounded-xl border border-emerald-900/10 bg-[#F5F8F3] p-4"
        >
          <p
            aria-hidden="true"
            className="text-xs font-black text-amber-700"
          >
            {String(index + 1).padStart(2, "0")}
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#123C2D]">
            {item}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="mt-6 space-y-5">
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="text-base leading-8 text-slate-600"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function VisionMissionCard({
  label,
  title,
  text,
  dark = false,
}: {
  label: string;
  title?: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[1.5rem] p-7 sm:p-8 ${
        dark
          ? "bg-[#123C2D]"
          : "border border-emerald-900/10 bg-[#F5F8F3]"
      }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${
          dark ? "border-[24px] border-white/5" : "bg-emerald-100/50"
        }`}
      />

      <div className="relative">
        <p
          className={`text-xs font-black uppercase tracking-[0.2em] ${
            dark ? "text-amber-300" : "text-amber-600"
          }`}
        >
          {label}
        </p>

        {title && (
          <h3
            className={`mt-4 text-2xl font-black ${
              dark ? "text-white" : "text-[#123C2D]"
            }`}
          >
            {title}
          </h3>
        )}

        <p
          className={`mt-5 text-base leading-8 ${
            dark ? "text-white/80" : "text-slate-600"
          }`}
        >
          {text}
        </p>
      </div>
    </article>
  );
}

function ReadingSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 border-t border-slate-200 pt-9">
      <h3 className="text-2xl font-black leading-tight text-[#123C2D] sm:text-3xl">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ClosingStatement({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="relative mt-12 overflow-hidden rounded-[1.7rem] bg-[#123C2D] px-6 py-10 sm:px-10 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border-[35px] border-white/5"
      />

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
          {eyebrow}
        </p>
        <p className="mt-4 max-w-4xl text-xl font-bold leading-9 text-white sm:text-2xl">
          {children}
        </p>
      </div>
    </section>
  );
}

function ProgramLabel({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-black tracking-[0.18em] text-amber-600">
        {number}
      </span>

      <span
        aria-hidden="true"
        className="h-px w-10 shrink-0 bg-amber-300"
      />

      <span className="text-[10px] font-black uppercase leading-5 tracking-[0.16em] text-emerald-800 sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
        {eyebrow}
      </p>

      <h3 className="mt-4 text-2xl font-black leading-tight text-[#123C2D] sm:text-3xl">
        {title}
      </h3>
    </div>
  );
}

function ReadingPage({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    dialog?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || active === dialog || !dialog.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || active === dialog || !dialog.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="programme-reading-title"
      tabIndex={-1}
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-white text-slate-900 outline-none"
    >
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-600 sm:text-[10px]">
              {eyebrow}
            </p>
            <p className="mt-1 truncate text-sm font-black text-[#123C2D]">
              {title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close programme"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      </header>

      <article className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">
            ASBESOC Nigeria
          </p>

          <h2
            id="programme-reading-title"
            className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-5xl"
          >
            {title}
          </h2>

          <div className="mt-6 h-1 w-14 rounded-full bg-amber-400" />
        </div>

        <div className="mt-11">{children}</div>

        <div className="mt-14 border-t border-slate-200 pt-8">
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex min-h-11 items-center gap-3 text-sm font-black text-[#123C2D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            <span
              aria-hidden="true"
              className="text-lg text-amber-500 transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to Programs
          </button>
        </div>
      </article>
    </div>
  );
}

export default Programs;