import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.PNG";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Projects", path: "/projects" },
    { name: "Gallery", path: "/gallery" },
    { name: "Get Involved", path: "/membership" },
    { name: "Contact Us", path: "/contact" },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {/* ================= DESKTOP / MOBILE HEADER ================= */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* LOGO + BRAND NAME */}
          <NavLink
            to="/"
            onClick={closeMenu}
            aria-label="ASBESOC Nigeria Home"
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <img
              src={logo}
              alt="ASBESOC Nigeria Logo"
              className="h-[56px] w-auto max-w-[130px] object-contain sm:h-[62px] sm:max-w-[150px]"
            />

            <div className="leading-tight">
              <div className="whitespace-nowrap text-base font-extrabold tracking-tight text-[#1B4332] sm:text-xl">
                ASBESOC
              </div>

              <div className="whitespace-nowrap text-[10px] font-extrabold tracking-[0.12em] text-slate-700 sm:text-xs">
                NIGERIA
              </div>
            </div>
          </NavLink>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1.5 lg:flex"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `group relative flex min-h-[44px] items-center rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#1B4332] text-white shadow-sm"
                      : "bg-emerald-50 text-slate-800 hover:bg-emerald-100 hover:text-[#1B4332]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>

                    {/* Subtle active/hover underline */}
                    <span
                      className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#D4AF37] transition-all duration-200 ${
                        isActive
                          ? "opacity-100"
                          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-emerald-900/10 bg-emerald-50 text-[#1B4332] transition-all duration-200 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30 lg:hidden"
          >
            {/* Hamburger SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* ================= MOBILE BACKDROP ================= */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* ================= MOBILE DRAWER ================= */}
      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-[70] h-screen w-[62vw] max-w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* DRAWER HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-emerald-900/10 px-3 py-3">
            <NavLink
              to="/"
              onClick={closeMenu}
              aria-label="ASBESOC Nigeria Home"
              className="flex min-w-0 items-center gap-1.5"
            >
              <img
                src={logo}
                alt="ASBESOC Nigeria Logo"
                className="h-11 w-auto max-w-[92px] object-contain"
              />

              <div className="leading-tight">
                <div className="whitespace-nowrap text-[14px] font-extrabold text-[#1B4332]">
                  ASBESOC
                </div>

                <div className="whitespace-nowrap text-[9px] font-extrabold tracking-[0.08em] text-slate-700">
                  NIGERIA
                </div>
              </div>
            </NavLink>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
              aria-expanded={menuOpen}
              className="ml-2 flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-[#1B4332] transition-all duration-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-[#1B4332]/30"
            >
              {/* Close X SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          {/* MOBILE LINKS */}
          <nav
            aria-label="Mobile main navigation"
            className="flex flex-1 flex-col justify-center gap-2 px-3"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `group relative flex min-h-[44px] shrink-0 items-center rounded-xl px-3 text-[13px] font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[#1B4332] text-white shadow-sm"
                      : "bg-emerald-50 text-slate-800 hover:bg-emerald-100 hover:text-[#1B4332]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.name}</span>

                    <span
                      className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#D4AF37] transition-all duration-200 ${
                        isActive
                          ? "opacity-100"
                          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* DRAWER FOOTER */}
          <div className="shrink-0 border-t border-emerald-900/10 px-3 py-3 text-center">
            <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#1B4332]">
              ASBESOC NIGERIA
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;