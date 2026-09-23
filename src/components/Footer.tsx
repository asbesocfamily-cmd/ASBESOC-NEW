import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Programs", to: "/programs" },
  { label: "Projects", to: "/projects" },
  { label: "Gallery", to: "/gallery" },
  { label: "Membership", to: "/membership" },
  { label: "Contact Us", to: "/contact" },
];

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-amber-300 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-[#063b25]";

function Footer() {
  function scrollToTop() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <footer className="bg-[#063b25] text-white">
      <div
        aria-hidden="true"
        className="h-0.5 bg-gradient-to-r from-emerald-700 via-amber-400 to-emerald-700"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-7 py-8 sm:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] lg:gap-10">
          {/* Organization */}
          <div className="min-w-0">
            <Link
              to="/"
              aria-label="ASBESOC home"
              className={`inline-block rounded ${focusClass}`}
            >
              <span className="block text-2xl font-black tracking-tight">
                ASBESOC
                <span className="text-amber-300">.</span>
              </span>

              <span className="mt-1 block text-xs text-white/80">
                Association for a Better Society
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-[13px] leading-6 text-white/75">
              Promoting peace, empowerment and sustainable community
              development in Nigeria.
            </p>

            <p className="mt-3 text-xs text-white/65">
              Since 1999
              <span
                aria-hidden="true"
                className="mx-2 text-amber-300"
              >
                ·
              </span>
              RC 22526
            </p>
          </div>

          {/* Underlined quick links */}
          <nav aria-labelledby="footer-links-heading">
            <h2
              id="footer-links-heading"
              className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300"
            >
              Quick Links
            </h2>

            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`inline-flex min-h-11 items-center rounded text-[13px] text-white/80 underline decoration-white/50 decoration-1 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300 ${focusClass}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact information */}
          <section
            aria-labelledby="footer-contact-heading"
            className="min-w-0 sm:col-span-2 lg:col-span-1"
          >
            <h2
              id="footer-contact-heading"
              className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300"
            >
              Contact & Offices
            </h2>

            <address className="mt-2 text-[13px] not-italic leading-6 text-white/80">
              <div className="flex flex-wrap gap-x-5">
                <a
                  href="mailto:asbesocng@gmail.com"
                  className={`inline-flex min-h-11 min-w-0 items-center gap-2 rounded transition-colors hover:text-amber-300 ${focusClass}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-amber-300"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <span className="break-all">
                    asbesocng@gmail.com
                  </span>
                </a>

                <a
                  href="tel:+2349023916067"
                  className={`inline-flex min-h-11 items-center gap-2 rounded transition-colors hover:text-amber-300 ${focusClass}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-amber-300"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.08 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.33 1.83.56 2.79.69A2 2 0 0 1 22 16.92Z" />
                  </svg>

                  09023916067
                </a>

                <a
                  href="mailto:infoasbesoc@gmail.com"
                  className={`inline-flex min-h-11 min-w-0 items-center gap-2 rounded transition-colors hover:text-amber-300 ${focusClass}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-amber-300"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <span className="break-all">
                    infoasbesoc@gmail.com
                  </span>
                </a>

                <a
                  href="tel:+2347081486898"
                  className={`inline-flex min-h-11 items-center gap-2 rounded transition-colors hover:text-amber-300 ${focusClass}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-amber-300"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.79a2 2 0 0 1-.45 2.11L8.08 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.33 1.83.56 2.79.69A2 2 0 0 1 22 16.92Z" />
                  </svg>

                  07081486898
                </a>
              </div>

              <p className="mt-2">
                <span className="font-semibold text-white">
                  Head Office:
                </span>{" "}
                Plot 359, Mmiri N'ezere Ora Avenue, New G.R.A,
                Trans Ekulu, Enugu State.
              </p>

              <p className="mt-2">
                <span className="font-semibold text-white">
                  Branch Office:
                </span>{" "}
                1st Floor, Kessington Plaza, Ugbowa Junction,
                Phase Six, Trans Ekulu, Enugu State.
              </p>
            </address>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 border-t border-white/15 py-3">
          <p className="text-xs leading-6 text-white/65">
            © {new Date().getFullYear()} ASBESOC Nigeria.
            All rights reserved.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex min-h-11 items-center gap-2 rounded px-1 text-xs font-semibold text-white/80 transition-colors hover:text-amber-300 ${focusClass}`}
          >
            Back to top

            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;