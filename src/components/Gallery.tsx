import { useEffect, useState } from "react";

import heroImage from "../assets/hero.jpg";
import membershipImage from "../assets/membership.jpg";
import executiveImage1 from "../assets/executives/image1.jpg";
import executiveImage2 from "../assets/executives/image2.jpg";

type GalleryItem = {
  image: string;
  title: string;
  description: string;
};

function Gallery() {
  /*
   * Your photos are directly inside the ASBESOC-NEW project folder.
   *
   * Development:
   * /IMGL0989.jpg
   *
   * GitHub Pages:
   * /ASBESOC-NEW/IMGL0989.jpg
   */
  const imageBaseUrl = import.meta.env.DEV
    ? "/"
    : import.meta.env.BASE_URL;

  /*
   * PHOTOS 5–14 HAVE BEEN REMOVED.
   *
   * We now start from IMGL0989.jpg.
   *
   * The gallery automatically renumbers the remaining
   * photos, so there are no gaps in the numbering.
   */
  const galleryFiles = [
    "IMGL0989.jpg",
    "IMGL0990.jpg",
    "IMGL0992.jpg",
    "IMGL0994.jpg",
    "IMGL0996.jpg",
    "IMGL0999.jpg",
    "IMGL1001.jpg",
    "IMGL1005.jpg",
    "IMGL1008.jpg",
    "IMGL1009.jpg",
    "IMGL1014.jpg",
    "IMGL1019.jpg",
    "IMGL1020.jpg",
    "IMGL1023.jpg",
    "IMGL1024.jpg",
    "IMGL1025.jpg",
    "IMGL1027.jpg",
    "IMGL1031.jpg",
    "IMGL1035.jpg",
    "IMGL1041.jpg",
    "IMGL1042.jpg",
    "IMGL1045.jpg",
    "IMGL1046.jpg",
    "IMGL1048.jpg",
    "IMGL1051.jpg",
    "IMGL1054.jpg",
    "IMGL1060.jpg",
    "IMGL1063.jpg",
    "IMGL1067.jpg",
    "IMGL1069.jpg",
    "IMGL1070.jpg",
    "IMGL1073.jpg",
    "IMGL1078.jpg",
    "IMGL1082.jpg",
    "IMGL1085.jpg",
    "IMGL1086.jpg",
    "IMGL1088.jpg",
    "IMGL1091.jpg",
    "IMGL1093.jpg",
    "IMGL1102.jpg",
    "IMGL1103.jpg",
    "IMGL1106.jpg",
    "IMGL1107.jpg",
    "IMGL1111.jpg",
    "IMGL1112.jpg",
    "IMGL1113.jpg",
    "IMGL1115.jpg",
    "IMGL1121.jpg",
    "IMGL1126.jpg",
    "IMGL1127.jpg",
    "IMGL1131.jpg",
    "IMGL1133.jpg",
    "IMGL1135.jpg",
    "IMGL1138.jpg",
    "IMGL1140.jpg",
    "IMGL1142.jpg",
    "IMGL1144.jpg",
    "IMGL1145.jpg",
    "IMGL1150.jpg",
    "IMGL1152.jpg",
    "IMGL1153.jpg",
    "IMGL1154.jpg",
    "IMGL1158.jpg",
    "IMGL1161.jpg",
    "IMGL1164.jpg",
  ];

  /*
   * Main gallery.
   *
   * The first four are the existing ASBESOC images.
   * The rest are the remaining community photos.
   */
  const galleryItems: GalleryItem[] = [
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

    ...galleryFiles.map((fileName) => ({
      image: `${imageBaseUrl}${fileName}`,
      title: "",
      description: "",
    })),
  ];

  /*
   * Currently selected image.
   */
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedImage =
    selectedIndex !== null
      ? galleryItems[selectedIndex]
      : null;

  /*
   * Keyboard controls.
   *
   * ESC       = close
   * LEFT      = previous
   * RIGHT     = next
   */
  useEffect(() => {
    if (selectedIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => {
          if (current === null) return 0;

          return (
            (current + 1) % galleryItems.length
          );
        });
      }

      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => {
          if (current === null) {
            return galleryItems.length - 1;
          }

          return (
            (current - 1 + galleryItems.length) %
            galleryItems.length
          );
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedIndex, galleryItems.length]);

  /*
   * Previous image.
   */
  const goToPrevious = () => {
    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (
        (current - 1 + galleryItems.length) %
        galleryItems.length
      );
    });
  };

  /*
   * Next image.
   */
  const goToNext = () => {
    setSelectedIndex((current) => {
      if (current === null) return 0;

      return (
        (current + 1) % galleryItems.length
      );
    });
  };

  return (
    <>
      <main className="min-h-screen bg-white text-slate-800">

        {/* =========================
            HERO
        ========================== */}
        <section className="relative overflow-hidden bg-[#063b25] px-4 py-20 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#063b25] via-[#0b5d3b] to-[#1B4332]" />

          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-5xl text-center">
            <span className="mb-4 inline-flex rounded-full border border-amber-400/40 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300 backdrop-blur-sm sm:text-sm">
              ASBESOC Nigeria
            </span>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Our Gallery
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/90 sm:text-base sm:leading-8">
              A glimpse into the people, projects, activities,
              partnerships, and moments that represent the work
              and impact of ASBESOC Nigeria.
            </p>

            <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-amber-400" />
          </div>
        </section>

        {/* =========================
            INTRO
        ========================== */}
        <section className="px-4 pb-8 pt-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-amber-500">
                  Our Moments
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1B4332] sm:text-4xl">
                  See ASBESOC in Action
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  Explore moments that reflect our commitment
                  to community development, leadership,
                  collaboration and positive social impact.
                </p>
              </div>

              <div className="shrink-0 rounded-full border border-emerald-900/10 bg-emerald-50 px-5 py-3">
                <span className="text-sm font-bold text-[#1B4332]">
                  {galleryItems.length} Photos
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* =========================
            GALLERY GRID
        ========================== */}
        <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {galleryItems.map((item, index) => (
                <button
                  key={`${item.image}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedIndex(index)
                  }
                  className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#f5f8f5] text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-900/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                  aria-label={`Open gallery image ${index + 1}`}
                >

                  {/* IMAGE */}
                  <div className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden bg-slate-100">

                    <img
                      src={item.image}
                      alt={`ASBESOC Gallery ${index + 1}`}
                      loading="lazy"
                      className="block h-auto max-h-[520px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.025]"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#063b25]/80 via-[#063b25]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* NUMBER */}
                    <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-black text-[#1B4332] shadow-md backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* FULL SCREEN ICON */}
                    <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-amber-400 text-[#163d31] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                      </svg>

                    </div>
                  </div>

                  {/* CAPTION ONLY FOR THE FIRST FOUR */}
                  {item.title && (
                    <div className="border-t border-emerald-900/5 bg-white p-4">

                      <h3 className="text-sm font-extrabold text-[#1B4332]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>

                      <div className="mt-3 h-1 w-8 rounded-full bg-amber-400 transition-all duration-300 group-hover:w-14" />

                    </div>
                  )}

                </button>
              ))}

            </div>
          </div>
        </section>

        {/* =========================
            BOTTOM MESSAGE
        ========================== */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="rounded-[2rem] border border-emerald-900/10 bg-[#eef6f1] px-6 py-12 text-center sm:px-10">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white shadow-lg">

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
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                  />

                  <circle
                    cx="8.5"
                    cy="8.5"
                    r="1.5"
                  />

                  <path d="M21 15l-5-5L5 21" />
                </svg>

              </div>

              <h3 className="mt-5 text-xl font-black text-[#1B4332] sm:text-2xl">
                More Stories Coming Soon
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
                This gallery will continue to grow as we document
                more of our community projects, outreach activities,
                events, partnerships, and achievements across Nigeria.
              </p>

            </div>

          </div>
        </section>

      </main>

      {/* ==================================================
          TRUE FULL-SCREEN IMAGE VIEWER
      ================================================== */}
      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Full screen gallery viewer"
          onClick={() => setSelectedIndex(null)}
        >

          {/* =========================
              TOP BAR
          ========================== */}
          <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-4 sm:px-6">

            <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
              {selectedIndex + 1} / {galleryItems.length}
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedIndex(null)
              }
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/40 text-3xl text-white backdrop-blur-md transition hover:bg-amber-400 hover:text-[#163d31]"
              aria-label="Close full screen viewer"
            >
              ×
            </button>

          </div>

          {/* =========================
              PREVIOUS
          ========================== */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-3 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md transition hover:bg-amber-400 hover:text-[#163d31] sm:left-6"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* =========================
              FULL-SCREEN IMAGE
          ========================== */}
          <div
            className="flex h-screen w-screen items-center justify-center p-3 sm:p-6"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <img
              src={selectedImage.image}
              alt={`ASBESOC Gallery ${selectedIndex + 1}`}
              className="max-h-[94vh] max-w-[96vw] object-contain"
            />

          </div>

          {/* =========================
              NEXT
          ========================== */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-xl backdrop-blur-md transition hover:bg-amber-400 hover:text-[#163d31] sm:right-6"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* =========================
              BOTTOM HELP
          ========================== */}
          <div className="absolute bottom-4 left-1/2 z-50 hidden -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[11px] text-white/70 backdrop-blur-md sm:block">
            ← Previous · → Next · ESC Close
          </div>

        </div>
      )}
    </>
  );
}

export default Gallery;