import { Link } from "react-router-dom";
import heroImage from "../assets/hero.webp";
import membershipImage from "../assets/membership.webp";
import executiveImage1 from "../assets/executives/image1.webp";
import executiveImage2 from "../assets/executives/image2.webp";
import executiveImage3 from "../assets/executives/image3.webp";

function Hero() {
  const statistics = [
    {
      number: "20+",
      label: "Years",
      description: "Of dedicated service to communities across Nigeria.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      ),
    },
    {
      number: "50+",
      label: "Communities",
      description:
        "Empowered through sustainable programs and partnerships.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <circle cx="9" cy="7" r="4" />
          <path d="M2 21v-1a7 7 0 0 1 14 0v1" />
          <path d="M16 4.5a4 4 0 0 1 0 7.5" />
          <path d="M18 14a6 6 0 0 1 4 5.5V21" />
        </svg>
      ),
    },
    {
      number: "1000+",
      label: "Lives",
      description: "Touched and transformed through our initiatives.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 8.8 2.5Z" />
        </svg>
      ),
    },
  ];

  const benefits = [
    {
      title: "Connect",
      description: "Meet people working towards positive change.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <circle cx="9" cy="7" r="3" />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M15.5 14.5A5 5 0 0 1 21 19" />
        </svg>
      ),
    },
    {
      title: "Contribute",
      description: "Support meaningful community initiatives.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 21s-7-4.5-7-10.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 16.5 12 21 12 21Z" />
          <path d="M12 5V2M9.5 3.5h5" />
        </svg>
      ),
    },
    {
      title: "Create Impact",
      description: "Help build stronger communities.",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 21c0-6 3-10 9-12-1 6-4 10-9 12Z" />
          <path d="M12 21c0-5-2-8-7-10 0 5 2 8 7 10Z" />
          <path d="M12 21V9" />
        </svg>
      ),
    },
  ];

  const executives = [
    {
      name: "Chief Honourable Engr. Dr. Igwe Chibuike Elias Elijah",
      role: "FOUNDER & CHIEF EXECUTIVE OFFICER",
      badge: "FOUNDER / CEO",
      image: executiveImage1,
      description:
        "Founder and Chief Executive Officer of ASBESOC, leading sustainable community development and positive social impact.",
      highlight: "Leadership With Purpose",
      highlightText: "Building a better society",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 2 4 5v6c0 5.5 3.5 9.5 8 11 4.5-1.5 8-5.5 8-11V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      name: "Anekwe Benedict Ikechukwu, Esq.",
      role: "SECRETARY",
      badge: "SECRETARY",
      image: executiveImage2,
      description:
        "Secretary of ASBESOC, supporting effective administration, coordination, and organizational development.",
      highlight: "Service & Commitment",
      highlightText: "Supporting organizational impact",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M4 5h16v14H4z" />
          <path d="M8 9h8M8 13h5" />
        </svg>
      ),
    },
    {
      name: "Dr. Isaiah Onyeka",
      role: "MANAGING DIRECTOR",
      badge: "MANAGING DIRECTOR",
      image: executiveImage3,
      description:
        "Managing Director of ASBESOC, providing strategic leadership and overseeing organizational operations and development.",
      highlight: "Strategic Leadership",
      highlightText: "Advancing the mission of ASBESOC",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18M10 12v2h4v-2" />
        </svg>
      ),
    },
  ];

  return (
    <main className="w-full overflow-hidden bg-[#f7fbf8]">
      {/* HERO SECTION */}
      <section className="px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8 lg:pb-14 lg:pt-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[26px] bg-[#063b25] shadow-[0_20px_55px_rgba(6,59,37,0.16)] sm:rounded-[30px] lg:rounded-[34px]">
          <img
            src={heroImage}
            alt="ASBESOC community empowerment initiative"
            width="1600"
            height="900"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#032e1d]/80 via-[#063b25]/55 to-[#063b25]/10" />
          <div className="absolute inset-0 bg-[#032e1d]/15 lg:hidden" />

          <div
            className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-green-300/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 grid min-h-[620px] items-center lg:min-h-[640px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="px-6 py-14 sm:px-10 sm:py-16 lg:px-12 lg:py-20 xl:px-16">
              <div className="mb-6 flex flex-col items-start gap-2">
                <div className="inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-white/95 px-4 py-1.5 text-[11px] font-black tracking-[0.12em] text-[#063b25] shadow-sm backdrop-blur-sm sm:text-xs">
                  RC 22526
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/90 px-4 py-2 text-xs font-bold text-[#087f3e] shadow-sm backdrop-blur-sm sm:text-sm">
                  <span
                    className="h-2 w-2 rounded-full bg-[#D4AF37]"
                    aria-hidden="true"
                  />
                  Empowering Communities Since 1999
                </div>
              </div>

              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-[68px] xl:text-[76px]">
                Building A <span className="text-[#00a844]">Better</span>{" "}
                Society
              </h1>

              <div className="my-6 h-1 w-12 rounded-full bg-[#00b848] sm:my-7" />

              <p className="max-w-xl text-base font-medium leading-7 text-white/90 sm:text-lg sm:leading-8">
                Together, we create positive change through community
                development, empowerment, trust, and sustainable solutions that
                transform lives and build a better tomorrow.
              </p>

              <p className="mt-4 max-w-xl text-base font-medium leading-7 text-white/90 sm:text-lg sm:leading-8">
                However, our areas of intervention also include human rights
                protection, awareness and education; conflict management,
                resolution and mediation; security surveillance; and human
                capital development.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/membership"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-[#00a844] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#008f3b] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#063b25] sm:px-7"
                >
                  Join ASBESOC
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>

                <Link
                  to="/about"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/60 bg-white/5 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white hover:text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-[#063b25] sm:px-7"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="hidden h-full lg:block" />
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          {statistics.map((stat) => (
            <article
              key={stat.label}
              className="group rounded-[22px] border border-emerald-900/5 bg-white p-6 shadow-[0_10px_35px_rgba(6,59,37,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(6,59,37,0.12)] sm:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#008f3b] transition-colors duration-300 group-hover:bg-emerald-100">
                  {stat.icon}
                </div>

                <div>
                  <div className="text-3xl font-black tracking-tight text-[#008f3b] sm:text-4xl">
                    {stat.number}
                  </div>

                  <div className="mt-0.5 text-sm font-extrabold text-slate-900 sm:text-base">
                    {stat.label}
                  </div>
                </div>
              </div>

              <div className="mt-5 h-[2px] w-8 rounded-full bg-[#00a844]" />

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {stat.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP SECTION */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[26px] bg-[#031f14] shadow-[0_20px_55px_rgba(6,59,37,0.18)] sm:rounded-[30px]">
          <img
            src={membershipImage}
            alt="ASBESOC members working together"
            width="1400"
            height="800"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#031f14]/60" />

          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 px-5 py-12 text-center sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <p className="text-sm font-black tracking-wide text-[#00d457] sm:text-base">
              JOIN ASBESOC
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Become Part Of <span className="text-[#00c94f]">ASBESOC</span>
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7 lg:text-lg">
              Join a thriving community focused on leadership, innovation,
              transformation, and building a better society.
            </p>

            <Link
              to="/membership"
              className="mt-7 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#00a844] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#008f3b] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#00d457] focus:ring-offset-2 focus:ring-offset-[#031f14] sm:px-8"
            >
              Membership Application Form
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>

            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className={`px-4 ${
                    index !== benefits.length - 1
                      ? "md:border-r md:border-white/30"
                      : ""
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#00c94f] text-[#00d457]">
                    {benefit.icon}
                  </div>

                  <h3 className="mt-3 text-lg font-black text-[#00d457]">
                    {benefit.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-white/85">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXECUTIVES */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black tracking-[0.18em] text-[#008f3b]">
              OUR LEADERSHIP
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#063b25] sm:text-4xl lg:text-5xl">
              Meet Our Executives
            </h2>

            <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#D4AF37]" />

            <p className="mt-5 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Guided by dedicated leadership committed to empowering
              communities and building a better society.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
            {executives.map((executive) => (
              <article
                key={executive.name}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white shadow-[0_18px_50px_rgba(6,59,37,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,59,37,0.14)]"
              >
                <div className="relative h-[340px] overflow-hidden bg-[#063b25] sm:h-[380px] lg:h-[420px]">
                  <img
                    src={executive.image}
                    alt={executive.name}
                    width="900"
                    height="1100"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#031f14]/65 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] rounded-full border border-white/20 bg-white/95 px-4 py-2 text-xs font-black text-[#087f3e] shadow-lg backdrop-blur-sm">
                    {executive.badge}
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-5 py-8 sm:px-6 lg:px-7 lg:py-9">
                  <p className="text-[11px] font-black tracking-[0.14em] text-[#00a844] sm:text-xs">
                    {executive.role}
                  </p>

                  <h3 className="mt-4 break-words text-xl font-black leading-tight tracking-tight text-[#063b25] sm:text-2xl lg:text-[27px]">
                    {executive.name}
                  </h3>

                  <div className="mt-5 h-1 w-12 rounded-full bg-[#D4AF37]" />

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {executive.description}
                  </p>

                  <div className="mt-auto flex items-center gap-3 pt-7">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#008f3b]">
                      {executive.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-[#063b25]">
                        {executive.highlight}
                      </p>

                      <p className="text-xs text-slate-500">
                        {executive.highlightText}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Hero;