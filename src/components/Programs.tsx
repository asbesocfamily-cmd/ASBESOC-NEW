import { useEffect, useState, type ReactNode } from "react";
import housingImage from "../assets/executives/vpad.png";

type ProgramId = "housing" | "vpad";

const imageBaseUrl = import.meta.env.DEV ? "/" : import.meta.env.BASE_URL;

const programsHero = `${imageBaseUrl}IMGL1078.jpg`;
const introImageOne = `${imageBaseUrl}IMGL1085.jpg`;
const introImageTwo = `${imageBaseUrl}IMGL1102.jpg`;
const vpadMainImage = `${imageBaseUrl}IMGL1102.jpg`;
const vpadImageTwo = `${imageBaseUrl}IMGL1070.jpg`;
const vpadImageThree = `${imageBaseUrl}IMGL1140.jpg`;

function Programs() {
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramId | null>(null);

  useEffect(() => {
    if (!selectedProgram) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProgram(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProgram]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAF7] text-slate-900">
      {/* ======================================================
          PROGRAMS HERO
      ====================================================== */}
      <section
        id="our-programmes"
        className="relative isolate flex min-h-[500px] items-center overflow-hidden sm:min-h-[570px] lg:min-h-[620px]"
      >
        <img
          src={programsHero}
          alt="ASBESOC programmes and community activities"
          className="absolute inset-0 -z-30 h-full w-full object-cover"
        />

        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#082E22]/95 via-[#0B3A2B]/78 to-[#0B3A2B]/35" />

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#082E22]/70 via-transparent to-[#082E22]/15" />

        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[45px] border-white/10 sm:h-96 sm:w-96" />

        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-9 bg-amber-400" />

              <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
                ASBESOC Nigeria
              </p>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Our
              <span className="text-amber-300"> Programs</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">
              Turning our commitment to a peaceful, empowered and better
              society into practical initiatives that respond to real
              community needs.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-bold text-white/75">
              <span>Community</span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span>Empowerment</span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span>Peace</span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span>Development</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PROGRAMS INTRO
      ====================================================== */}
      <section className="relative bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-10 lg:py-28">
          <div className="relative mx-auto w-full max-w-[560px] pb-10 pr-5 sm:pb-16 sm:pr-14">
            <div className="overflow-hidden rounded-[1.8rem] shadow-[0_25px_70px_rgba(18,60,45,0.16)]">
              <img
                src={introImageOne}
                alt="ASBESOC community programme"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-0 w-[45%] overflow-hidden rounded-[1.3rem] border-[6px] border-white shadow-xl sm:w-[42%]">
              <img
                src={introImageTwo}
                alt="ASBESOC programme activity"
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="absolute -left-3 top-8 h-24 w-2 rounded-full bg-amber-400 sm:-left-5 sm:h-32" />
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

      {/* ======================================================
          HOUSING PROGRAMME
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#F5F8F3]">
        <div className="absolute -right-36 top-20 h-80 w-80 rounded-full border-[55px] border-emerald-900/[0.035]" />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-28 w-28 rounded-tl-[2rem] border-l-4 border-t-4 border-amber-400 sm:-left-6 sm:-top-6" />

              <div className="relative overflow-hidden rounded-[1.7rem] bg-white shadow-[0_25px_65px_rgba(18,60,45,0.12)]">
                <img
                  src={housingImage}
                  alt="The End of Housing Deficit Programme"
                  className="h-auto w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-5 right-5 rounded-xl bg-[#123C2D] px-5 py-4 shadow-xl sm:right-8">
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

              {/* Housing focus cards */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Affordable Home Ownership",
                  "Community Development",
                  "Improved Living Conditions",
                  "Sustainable Housing",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="group flex items-center gap-4 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-[0_8px_25px_rgba(18,60,45,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(18,60,45,0.10)]"
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#123C2D] text-[11px] font-black text-amber-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-sm font-bold leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedProgram("housing")}
                className="group mt-9 inline-flex items-center gap-3 border-b-2 border-amber-400 pb-1 text-sm font-black text-[#123C2D] transition hover:text-emerald-700"
              >
                Learn More About The Programme
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          IMPACT STATEMENT
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#123C2D]">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full border-[50px] border-white/[0.035]" />

        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid items-center gap-7 md:grid-cols-[auto_1fr] md:gap-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 bg-white/5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-7 w-7 text-amber-300"
                stroke="currentColor"
                strokeWidth="1.7"
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

      {/* ======================================================
          V-PAD PROGRAMME
      ====================================================== */}
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

              {/* Four roads preview cards */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["01", "Think Peace"],
                  ["02", "Talk Peace"],
                  ["03", "Make Peace"],
                  ["04", "Build Peace"],
                ].map(([number, title]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-emerald-900/10 bg-[#F7F9F5] p-4 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-[10px] font-black text-amber-700">
                      {number}
                    </div>

                    <p className="mt-3 text-sm font-black text-[#123C2D]">
                      {title}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedProgram("vpad")}
                className="group mt-9 inline-flex items-center gap-3 border-b-2 border-amber-400 pb-1 text-sm font-black text-[#123C2D] transition hover:text-emerald-700"
              >
                Learn More About V-PAD
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            {/* V-PAD image collage */}
            <div className="relative mx-auto w-full max-w-[620px] pb-12">
              <div className="overflow-hidden rounded-[1.7rem] shadow-[0_25px_70px_rgba(18,60,45,0.15)]">
                <img
                  src={vpadMainImage}
                  alt="ASBESOC V-PAD community activity"
                  className="aspect-[5/4] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-2 left-3 w-[37%] overflow-hidden rounded-[1.2rem] border-[5px] border-white shadow-xl sm:-left-7 sm:w-[40%]">
                <img
                  src={vpadImageTwo}
                  alt="ASBESOC peace and community programme"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-2 right-3 w-[37%] overflow-hidden rounded-[1.2rem] border-[5px] border-white shadow-xl sm:-right-5 sm:w-[38%]">
                <img
                  src={vpadImageThree}
                  alt="ASBESOC programme participants"
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

      {/* ======================================================
          OUR APPROACH
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#F3F7F2]">
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full border-[60px] border-emerald-900/[0.025]" />

        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">
              Our Approach
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#123C2D] sm:text-4xl">
              Community-centred.
              <span className="text-emerald-700">
                {" "}
                Sustainable by design.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Our programmes are developed around participation, practical
              action and solutions designed to create lasting impact.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
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
            ].map((item) => (
              <div
                key={item.number}
                className="group relative overflow-hidden rounded-[1.4rem] border border-emerald-900/10 bg-white p-6 shadow-[0_10px_30px_rgba(18,60,45,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(18,60,45,0.11)]"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-emerald-50" />

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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          HOUSING READING VIEW
      ====================================================== */}
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

              <p className="mt-6 text-base leading-8 text-slate-600">
                The End of Housing Deficit Programme is an ASBESOC initiative
                aimed at promoting access to decent, secure and affordable
                housing for individuals and families.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600">
                The programme provides a structured pathway towards home
                ownership through accessible contribution arrangements,
                encouraging savings, financial discipline and long-term
                planning.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600">
                It is designed to contribute to improved living conditions,
                community development and greater social and economic
                stability.
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-xl">
              <img
                src={housingImage}
                alt="The End of Housing Deficit Programme"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Housing key focus cards */}
          <section className="mt-16 rounded-[1.7rem] bg-[#F4F8F3] p-6 sm:p-9">
            <SectionHeading
              eyebrow="Key Focus Areas"
              title="Building pathways towards secure homes."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Affordable home ownership",
                "Community Development",
                "Financial planning and savings",
                "Improved living conditions",
                "Sustainable housing opportunities",
                "Reduction of housing challenges",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-xl border border-emerald-900/10 bg-white p-5 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-black text-emerald-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="text-sm font-bold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="relative mt-12 overflow-hidden rounded-[1.5rem] bg-[#123C2D] px-6 py-9 sm:px-9">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border-[30px] border-white/5" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                Our Goal
              </p>

              <p className="mt-4 max-w-4xl text-lg font-bold leading-8 text-white">
                To contribute to reducing housing deficit and creating
                opportunities for individuals and families to access decent
                and secure homes.
              </p>
            </div>
          </section>
        </ReadingPage>
      )}

      {/* ======================================================
          V-PAD READING VIEW
      ====================================================== */}
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

              <p className="mt-6 text-base leading-8 text-slate-600">
                The Volunteer Peace Advocates Project (V-PAD) is a flagship
                peacebuilding and community-development initiative of the
                Association for a Better Society (ASBESOC) Nigeria.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600">
                Introduced by ASBESOC in 2015, V-PAD creates a structured
                network of volunteers committed to promoting peaceful
                coexistence, preventing and managing conflicts, protecting
                human rights, supporting community security, promoting
                empowerment and strengthening integrity.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-600">
                V-PAD recognizes that sustainable peace depends not only on
                governments and formal institutions, but also on responsible
                individuals and communities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <img
                src={vpadMainImage}
                alt="V-PAD programme"
                className="col-span-2 aspect-[16/10] w-full rounded-2xl object-cover"
              />

              <img
                src={vpadImageTwo}
                alt="ASBESOC programme activity"
                className="aspect-square w-full rounded-2xl object-cover"
              />

              <img
                src={vpadImageThree}
                alt="ASBESOC community activity"
                className="aspect-square w-full rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Vision and Mission cards */}
          <section className="mt-16">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-emerald-900/10 bg-[#F5F8F3] p-7 sm:p-8">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-100/50" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">
                    Vision
                  </p>

                  <h3 className="mt-4 text-2xl font-black text-[#123C2D]">
                    One billion peace volunteers.
                  </h3>

                  <p className="mt-5 text-base leading-8 text-slate-600">
                    To reach ONE BILLION peace volunteers who can think peace,
                    talk peace, make and build sustainable peace beyond
                    Nigeria for mutual human co-existence, peaceful
                    socio-cultural growth and economic development across
                    Africa and the entire world.
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#123C2D] p-7 sm:p-8">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border-[24px] border-white/5" />

                <div className="relative">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                    Mission
                  </p>

                  <h3 className="mt-4 text-2xl font-black text-white">
                    Mobilize. Train. Organize.
                  </h3>

                  <p className="mt-5 text-base leading-8 text-white/75">
                    To mobilize, train and organize credible volunteers for
                    peacebuilding, conflict management, human-rights
                    promotion, community safety, empowerment and integrity
                    development.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Four Roads cards */}
          <section className="mt-16 border-t border-slate-200 pt-10">
            <SectionHeading
              eyebrow="Peacebuilding Philosophy"
              title="The Four Roads To Achieving Peace"
            />

            <div className="mt-9 grid gap-5 sm:grid-cols-2">
              {[
                {
                  number: "01",
                  title: "THINK PEACE",
                  text: "Before taking an action, consider whether the action will promote or undermine peace.",
                },
                {
                  number: "02",
                  title: "TALK PEACE",
                  text: "Before speaking, consider whether your words will create understanding or unnecessary conflict.",
                },
                {
                  number: "03",
                  title: "MAKE PEACE",
                  text: "When disagreements arise, encourage peaceful dialogue and appropriate mediation rather than allowing conflict to escalate.",
                },
                {
                  number: "04",
                  title: "BUILD PEACE",
                  text: "Individuals and communities should deliberately plan and behave in ways that sustain peace over time.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="group rounded-[1.4rem] border border-emerald-900/10 bg-[#F7F9F5] p-6 shadow-[0_8px_26px_rgba(18,60,45,0.05)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_38px_rgba(18,60,45,0.10)]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123C2D] text-xs font-black text-amber-300">
                    {item.number}
                  </div>

                  <h4 className="mt-5 text-base font-black text-[#123C2D]">
                    {item.title}
                  </h4>

                  <div className="mt-3 h-[3px] w-8 rounded-full bg-amber-400" />

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SMILE cards */}
          <section className="mt-16 rounded-[1.8rem] bg-[#F3F7F2] p-6 sm:p-9">
            <SectionHeading
              eyebrow="Our Core Values"
              title="V-PAD SMILE"
            />

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
                  className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                >
                  <span className="absolute -right-2 -top-5 text-7xl font-black text-emerald-900/[0.035]">
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

          {/* Volunteer qualities */}
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

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Good character",
                "Commitment to peace",
                "Integrity",
                "Respect for others",
                "Willingness to learn",
                "Team spirit",
                "Commitment to community service",
                "Responsible communication",
                "Respect for laws and institutions",
              ].map((item) => (
                <div
                  key={item}
                  className="flex min-h-[82px] items-center gap-4 rounded-xl border border-emerald-900/10 bg-white p-4 shadow-[0_7px_22px_rgba(18,60,45,0.05)]"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-800">
                    ✓
                  </span>

                  <span className="text-sm font-bold leading-6 text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Responsibilities cards */}
          <section className="mt-16 rounded-[1.8rem] bg-[#F5F8F3] p-6 sm:p-9">
            <SectionHeading
              eyebrow="Community Service"
              title="Responsibilities of V-PAD Volunteers"
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
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
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-xl border border-emerald-900/10 bg-white p-5 shadow-[0_7px_22px_rgba(18,60,45,0.045)]"
                >
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[#123C2D] text-[10px] font-black text-amber-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p className="text-sm leading-7 text-slate-600">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Closing */}
          <section className="relative mt-16 overflow-hidden rounded-[1.7rem] bg-[#123C2D] px-6 py-10 sm:px-10 sm:py-12">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border-[35px] border-white/5" />

            <div className="relative">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                V-PAD
              </p>

              <p className="mt-4 max-w-4xl text-2xl font-black leading-9 text-white">
                Think Peace. Talk Peace. Make Peace. Build Peace.
              </p>

              <p className="mt-5 text-sm font-bold text-white/70">
                V-PAD — Making Peace-Legends for God.
              </p>
            </div>
          </section>
        </ReadingPage>
      )}
    </main>
  );
}

/* ============================================================
   SMALL COMPONENTS
============================================================ */

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

      <span className="h-px w-10 bg-amber-300" />

      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800 sm:text-[11px]">
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
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-white">
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
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
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

          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#123C2D] sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          <div className="mt-6 h-1 w-14 rounded-full bg-amber-400" />
        </div>

        <div className="mt-11">{children}</div>

        <div className="mt-14 border-t border-slate-200 pt-8">
          <button
            type="button"
            onClick={onClose}
            className="group inline-flex items-center gap-3 text-sm font-black text-[#123C2D]"
          >
            <span className="text-lg text-amber-500 transition-transform group-hover:-translate-x-1">
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