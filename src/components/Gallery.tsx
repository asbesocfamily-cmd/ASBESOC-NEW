import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";

import heroImage from "../assets/hero.jpg";
import membershipImage from "../assets/membership.jpg";
import executiveImage1 from "../assets/executives/image1.jpg";
import executiveImage2 from "../assets/executives/image2.jpg";

type GalleryItem = {
  thumbnail: string;
  image: string;
  title: string;
  description: string;
};

const thumbnailModules = import.meta.glob(
  "../assets/gallery/thumbnails/*.webp",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const fullscreenModules = import.meta.glob(
  "../assets/gallery/fullscreen/*.webp",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const imageBaseUrl = import.meta.env.DEV
  ? "/"
  : import.meta.env.BASE_URL;

function getOptimizedImage(
  name: string,
  size: "thumbnails" | "fullscreen",
  fallback: string,
) {
  const modules =
    size === "thumbnails" ? thumbnailModules : fullscreenModules;

  return modules[`../assets/gallery/${size}/${name}.webp`] ?? fallback;
}

function createGalleryItem(
  name: string,
  originalImage: string,
  title = "",
  description = "",
): GalleryItem {
  return {
    thumbnail: getOptimizedImage(name, "thumbnails", originalImage),
    image: getOptimizedImage(name, "fullscreen", originalImage),
    title,
    description,
  };
}

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

const galleryItems: GalleryItem[] = [
  createGalleryItem(
    "hero",
    heroImage,
    "Empowering Communities",
    "Working together to create stronger and more sustainable communities.",
  ),
  createGalleryItem(
    "membership",
    membershipImage,
    "Community Engagement",
    "Building meaningful connections and encouraging people to get involved.",
  ),
  createGalleryItem(
    "executive-1",
    executiveImage1,
    "ASBESOC Leadership",
    "Our leadership team driving the vision and mission of ASBESOC Nigeria.",
  ),
  createGalleryItem(
    "executive-2",
    executiveImage2,
    "ASBESOC Administration",
    "Supporting effective coordination and organizational development.",
  ),
  ...galleryFiles.map((fileName) =>
    createGalleryItem(
      fileName.replace(/\.jpe?g$/i, ""),
      `${imageBaseUrl}${fileName}`,
    ),
  ),
];

function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const closeViewer = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const changeImage = useCallback((direction: number) => {
    setSelectedIndex((current) => {
      if (current === null) return null;

      return (
        (current + direction + galleryItems.length) %
        galleryItems.length
      );
    });
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white text-slate-800">
        {/* HERO */}
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

        {/* INTRO */}
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

        {/* GALLERY GRID */}
        <section className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {galleryItems.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#f5f8f5] text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-900/20 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-label={`Open ${
                    item.title || `gallery image ${index + 1}`
                  }`}
                  aria-haspopup="dialog"
                >
                  <div className="relative flex min-h-[240px] w-full items-center justify-center overflow-hidden bg-slate-100">
                    <GalleryThumbnail item={item} index={index} />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#063b25]/80 via-[#063b25]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

                    <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-black text-[#1B4332] shadow-md backdrop-blur-sm">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-amber-400 text-[#163d31] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <svg
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

        {/* BOTTOM MESSAGE */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-emerald-900/10 bg-[#eef6f1] px-6 py-12 text-center sm:px-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4332] text-white shadow-lg">
                <svg
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

      {selectedIndex !== null &&
        createPortal(
          <GalleryViewer
            item={galleryItems[selectedIndex]}
            index={selectedIndex}
            total={galleryItems.length}
            onClose={closeViewer}
            onChange={changeImage}
          />,
          document.body,
        )}
    </>
  );
}

function GalleryThumbnail({
  item,
  index,
}: {
  item: GalleryItem;
  index: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="px-6 py-16 text-center text-sm text-slate-500">
        Photo unavailable. Select to open.
      </span>
    );
  }

  return (
    <img
      src={item.thumbnail}
      alt={item.title || `ASBESOC Gallery ${index + 1}`}
      loading={index < 4 ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className="block h-auto max-h-[520px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
    />
  );
}

type GalleryViewerProps = {
  item: GalleryItem;
  index: number;
  total: number;
  onClose: () => void;
  onChange: (direction: number) => void;
};

function GalleryViewer({
  item,
  index,
  total,
  onClose,
  onChange,
}: GalleryViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const touchStart = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onChange(1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChange(-1);
        return;
      }

      if (event.key !== "Tab") return;

      const buttons = viewerRef.current?.querySelectorAll<
        HTMLButtonElement
      >("button:not([disabled])");

      if (!buttons?.length) {
        event.preventDefault();
        viewerRef.current?.focus();
        return;
      }

      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      const active = document.activeElement;
      const focusIsOutside = !viewerRef.current?.contains(active);

      if (event.shiftKey && (active === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || focusIsOutside)
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      window.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [onClose, onChange]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }

    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      time: Date.now(),
    };
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      touchStart.current = null;
    }
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;

    if (
      !start ||
      event.touches.length !== 0 ||
      event.changedTouches.length !== 1
    ) {
      return;
    }

    const end = event.changedTouches[0];
    const distanceX = end.clientX - start.x;
    const distanceY = end.clientY - start.y;
    const duration = Date.now() - start.time;

    const isHorizontalSwipe =
      Math.abs(distanceX) >= 50 &&
      Math.abs(distanceX) > Math.abs(distanceY) * 1.5 &&
      duration < 1200;

    if (isHorizontalSwipe) {
      onChange(distanceX < 0 ? 1 : -1);
    }
  }

  const arrowClass =
    "absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-sm transition hover:bg-amber-400 hover:text-[#163d31] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:h-14 sm:w-14";

  return (
    <div
      ref={viewerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full screen gallery viewer"
      aria-describedby="gallery-viewer-help"
      tabIndex={-1}
      className="fixed inset-0 z-[99999] h-screen w-full overflow-hidden bg-black outline-none"
      style={{ height: "100dvh" }}
    >
      {/* FULL-WINDOW IMAGE AND SWIPE AREA */}
      <div
        className="absolute inset-0 select-none"
        style={{ touchAction: "pan-y pinch-zoom" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          touchStart.current = null;
        }}
      >
        <ViewerPhoto
          key={item.image}
          item={item}
          index={index}
        />
      </div>

      {/* TOP CONTROLS */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-4 bg-gradient-to-b from-black/55 to-transparent px-4 pb-8 pt-4 sm:px-6"
        style={{
          paddingTop: "max(1rem, env(safe-area-inset-top))",
        }}
      >
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm"
        >
          {index + 1} / {total}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-sm transition hover:bg-amber-400 hover:text-[#163d31] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          aria-label="Close full screen viewer"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      {/* PREVIOUS IMAGE */}
      <button
        type="button"
        onClick={() => onChange(-1)}
        className={`${arrowClass} left-2 sm:left-6`}
        aria-label="Previous image"
      >
        <svg
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
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      {/* NEXT IMAGE */}
      <button
        type="button"
        onClick={() => onChange(1)}
        className={`${arrowClass} right-2 sm:right-6`}
        aria-label="Next image"
      >
        <svg
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
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* VIEWER HELP */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 pt-8"
        style={{
          paddingBottom:
            "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <p
          id="gallery-viewer-help"
          className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-center text-[11px] text-white/80 backdrop-blur-sm"
        >
          <span className="sm:hidden">
            Swipe left or right · × Close
          </span>
          <span className="hidden sm:inline">
            ← Previous · → Next · Swipe on touchscreens · ESC Close
          </span>
        </p>
      </div>
    </div>
  );
}

function ViewerPhoto({
  item,
  index,
}: {
  item: GalleryItem;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const imageUrl =
    attempt === 0
      ? item.image
      : `${item.image}${
          item.image.includes("?") ? "&" : "?"
        }galleryRetry=${attempt}`;

  const alt = item.title || `ASBESOC Gallery ${index + 1}`;

  function retryImage() {
    setLoaded(false);
    setFailed(false);
    setAttempt((current) => current + 1);
  }

  return (
    <div className="relative h-full w-full">
      {/* Show the small preview while the full image loads. */}
      {!loaded && !previewFailed && (
        <img
          src={item.thumbnail}
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          onError={() => setPreviewFailed(true)}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
      )}

      {/* Only the selected full-size image is requested. */}
      {!failed && (
        <img
          key={imageUrl}
          src={imageUrl}
          alt={alt}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-contain ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {!loaded && !failed && (
        <div
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center px-4"
        >
          <span className="rounded-full bg-black/65 px-4 py-2 text-xs font-medium text-white">
            Loading photo…
          </span>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center px-16">
          <div
            role="status"
            className="max-w-sm rounded-2xl border border-white/15 bg-black/85 p-6 text-center text-white"
          >
            <p className="text-sm font-bold">
              The full-size photo couldn’t load.
            </p>

            <button
              type="button"
              onClick={retryImage}
              className="mt-4 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#163d31] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;