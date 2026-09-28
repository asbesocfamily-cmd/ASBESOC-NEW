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
import RequireAuth from "./components/RequireAuth";

const Admin = lazy(() => import("./components/Admin"));
const SignUp = lazy(() => import("./components/SignUp"));
const Login = lazy(() => import("./components/Login"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const ForgotPassword = lazy(
  () => import("./components/ForgotPassword"),
);
const MemberDashboard = lazy(
  () => import("./components/MemberDashboard"),
);

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
            <p
              role="status"
              className="text-sm font-semibold text-[#063b25]"
            >
              Loading…
            </p>
          </main>
        }
      >
        <Routes>
          {/* Public website */}
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />

          {/* Account pages */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Login required; email verification may be incomplete */}
          <Route
            element={<RequireAuth requireVerifiedEmail={false} />}
          >
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* Login and verified email required */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard/*" element={<MemberDashboard />} />
            <Route path="/membership" element={<Membership />} />
          </Route>

          {/* Existing admin area */}
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Suspense>

      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;
