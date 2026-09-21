import { lazy, Suspense, useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Programs from "./components/Programs";
import Projects from "./components/Projects";
import Membership from "./components/Membership";
import Contact from "./components/Contact";
import Gallery from "./components/Gallery";
import Footer from "./components/Footer";

const Admin = lazy(() => import("./components/Admin"));

function ScrollToTop() {
  const { pathname, key } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, key]);

  return null;
}

function App() {
  const { pathname } = useLocation();

  const isAdminPage =
    pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      <ScrollToTop />

      {!isAdminPage && <Navbar />}

      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center bg-[#f3f7f3]">
            <p role="status" className="text-sm font-semibold text-[#063b25]">
              Loading…
            </p>
          </main>
        }
      >
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Suspense>

      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;