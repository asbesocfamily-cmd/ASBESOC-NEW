import heroImage from "../assets/hero.jpg";
import membershipImage from "../assets/membership.jpg";
import executiveImage1 from "../assets/executives/image1.jpg";
import executiveImage2 from "../assets/executives/image2.jpg";

function Gallery() {
  const galleryItems = [
    {
      image: heroImage,
      title: "Empowering Communities",
      description:
        "Working together to create stronger and more sustainable communities.",
    },
    {
      image: membershipImage,
      title: "Community Engagement",
      description:
        "Building meaningful connections and encouraging people to get involved.",
    },
    {
      image: executiveImage1,
      title: "ASBESOC Leadership",
      description:
        "Our leadership team driving the vision and mission of ASBESOC Nigeria.",
    },
    {
      image: executiveImage2,
      title: "ASBESOC Administration",
      description:
        "Supporting effective coordination and organizational development.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-[#063b25] px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#063b25] via-[#0b5d3b] to-[#1B4332]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-[#D4AF37]/40 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D4AF37] backdrop-blur-sm sm:text-sm">
            ASBESOC Nigeria
          </span>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Our Gallery
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base sm:leading-8">
            A glimpse into the people, projects, activities, and moments that
            represent the work and impact of ASBESOC Nigeria.
          </p>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* SECTION HEADING */}
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">
              Our Moments
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1B4332] sm:text-4xl">
              See ASBESOC in Action
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Explore moments that reflect our commitment to community
              development, leadership, collaboration, and positive social
              impact.
            </p>
          </div>

          {/* GALLERY GRID */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="group overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

                  {/* IMAGE NUMBER */}
                  <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-black text-[#1B4332] shadow-md backdrop-blur-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-[#1B4332]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>

                  <div className="mt-4 h-1 w-10 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-16" />
                </div>
              </article>
            ))}
          </div>

          {/* ================= FUTURE PHOTOS MESSAGE ================= */}
          <div className="mt-14 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 px-6 py-10 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-black text-[#1B4332]">
              More Stories Coming Soon
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              This gallery will continue to grow as we document more of our
              community projects, outreach activities, events, partnerships,
              and achievements across Nigeria.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Gallery;