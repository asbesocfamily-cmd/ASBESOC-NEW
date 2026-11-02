
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useSiteContent } from "../contexts/useSiteContent";

type Department =
  | "General Enquiry"
  | "Membership"
  | "Partnership"
  | "Administration"
  | "Human Rights"
  | "Community Development"
  | "Volunteering"
  | "Other";

const departmentEmails: Record<Department, string> = {
  "General Enquiry": "info@asbesoc.org",
  Membership: "admin@asbesoc.org",
  Partnership: "md@asbesoc.org",
  Administration: "secretary@asbesoc.org",
  "Human Rights": "humanrightsteam@asbesoc.org",
  "Community Development": "info@asbesoc.org",
  Volunteering: "admin@asbesoc.org",
  Other: "info@asbesoc.org",
};

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Programs", to: "/programs" },
  { label: "Projects", to: "/projects" },
  { label: "Gallery", to: "/gallery" },
  { label: "Membership", to: "/membership" },
  { label: "Privacy & Analytics", to: "/privacy" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">
      {children}
    </p>
  );
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#063b25] text-amber-300">
      {children}
    </div>
  );
}

export default function Contact() {
  const cms = useSiteContent("contact");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] =
    useState<Department>("General Enquiry");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const recipient = departmentEmails[department];
    const emailSubject =
      subject.trim() || `${department} - ASBESOC Enquiry`;

    const emailBody = [
      "ASBESOC WEBSITE ENQUIRY",
      "",
      `Name: ${name.trim()}`,
      `Sender's email: ${email.trim()}`,
      `Department: ${department}`,
      "",
      "Message:",
      message.trim(),
    ].join("\n");

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(
      emailSubject
    )}&body=${encodeURIComponent(emailBody)}`;

    setStatus(
      `Your email application should open with your message addressed to ${recipient}. Please press Send in your email application.`
    );

    window.location.href = mailtoLink;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf8] text-[#173b2c]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#063b25] px-6 py-20 text-white md:py-28">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 h-[350px] w-[350px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-emerald-900/40 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              Association for a Better Society
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl">
            {cms?.title || "We are here to connect."}
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
            {cms?.intro ||
              "Connect with ASBESOC Nigeria. Whether you are seeking information, exploring a partnership, joining our mission or reaching one of our offices, we would be glad to hear from you."}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#contact-form"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-300 px-7 py-3 text-sm font-bold text-[#173b2c] transition hover:bg-amber-200"
            >
              Send us a message
              <span className="ml-3" aria-hidden="true">↗</span>
            </a>

            <a
              href="#our-offices"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore our offices
            </a>
          </div>

          <div className="mt-16 grid max-w-2xl grid-cols-2 gap-8 border-t border-white/15 pt-8 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-black text-amber-300">1999</p>
              <p className="mt-2 text-xs text-white/65">Established</p>
            </div>
            <div>
              <p className="text-3xl font-black text-amber-300">22526</p>
              <p className="mt-2 text-xs text-white/65">Registration number</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-3xl font-black text-amber-300">Nigeria</p>
              <p className="mt-2 text-xs text-white/65">Our organisation</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:items-end">
          <div>
            <SectionLabel>Connect with us</SectionLabel>
            <h2 className="max-w-xl text-3xl font-black leading-tight text-[#063b25] md:text-5xl">
              More than a point of contact. A connection to our mission.
            </h2>
          </div>

          <p className="max-w-xl text-base leading-8 text-gray-600">
            ASBESOC works towards promoting peace, empowerment and sustainable
            community development in Nigeria. We welcome individuals,
            organisations, institutions and communities interested in
            connecting with our work.
          </p>
        </div>
      </section>

      {/* CONTACT DETAILS */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Reach the right team</SectionLabel>
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-black text-[#063b25] md:text-4xl">
              Contact directory
            </h2>
            <p className="max-w-md text-sm leading-6 text-gray-500">
              Choose the appropriate contact for your question or request.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "General Enquiries",
                email: "info@asbesoc.org",
                description: "General information and organisational enquiries.",
                symbol: "✉",
              },
              {
                title: "Membership & Applications",
                email: "admin@asbesoc.org",
                description: "Membership enquiries, applications and assistance.",
                symbol: "◎",
              },
              {
                title: "Partnerships",
                email: "md@asbesoc.org",
                description: "Institutional relationships and partnership proposals.",
                symbol: "◇",
              },
              {
                title: "Administration",
                email: "secretary@asbesoc.org",
                description: "Administrative and official correspondence.",
                symbol: "▤",
              },
              {
                title: "Human Rights Team",
                email: "humanrightsteam@asbesoc.org",
                description: "Human rights-related enquiries and communication.",
                symbol: "✳",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <ContactIcon>
                    <span className="text-2xl" aria-hidden="true">
                      {item.symbol}
                    </span>
                  </ContactIcon>
                  <span className="text-amber-500 transition group-hover:translate-x-1 group-hover:-translate-y-1">
                    ↗
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-bold text-[#063b25]">
                  {item.title}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                  {item.description}
                </p>
                <a
                  href={`mailto:${item.email}`}
                  className="mt-5 inline-block break-all text-sm font-bold text-[#1b6545] transition hover:text-amber-700"
                >
                  {item.email}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICES */}
      <section id="our-offices" className="bg-[#063b25] px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionLabel>Find our locations</SectionLabel>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <h2 className="max-w-xl text-3xl font-black leading-tight md:text-5xl">
              Our offices. Our doors are open.
            </h2>
            <p className="max-w-md text-sm leading-7 text-white/65">
              ASBESOC has its head office and branch office in Enugu State,
              Nigeria.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <ContactIcon>
                  <span className="text-xl" aria-hidden="true">⌖</span>
                </ContactIcon>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Main location
                </span>
              </div>

              <h3 className="mt-7 text-2xl font-bold">Head Office</h3>
              <p className="mt-4 text-base leading-8 text-white/75">
                {cms?.headOffice ||
                  "Plot 359, Mmiri N'ezere Ora Avenue, New G.R.A, Trans Ekulu, Enugu State."}
              </p>
              <p className="mt-6 border-t border-white/10 pt-5 text-xs text-white/50">
                ASBESOC Nigeria · Head Office
              </p>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 md:p-9">
              <div className="flex items-center gap-3">
                <ContactIcon>
                  <span className="text-xl" aria-hidden="true">⌖</span>
                </ContactIcon>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                  Additional location
                </span>
              </div>

              <h3 className="mt-7 text-2xl font-bold">Branch Office</h3>
              <p className="mt-4 text-base leading-8 text-white/75">
                {cms?.branchOffice ||
                  "1st Floor, Kessington Plaza, Ugbowa Junction, Phase Six, Trans Ekulu, Enugu State."}
              </p>
              <p className="mt-6 border-t border-white/10 pt-5 text-xs text-white/50">
                ASBESOC Nigeria · Branch Office
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* PHONE AND EMAIL */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionLabel>Direct communication</SectionLabel>
              <h2 className="text-3xl font-black leading-tight text-[#063b25] md:text-5xl">
                Let’s make communication easier.
              </h2>
              <p className="mt-5 max-w-xl leading-8 text-gray-600">
                You can reach our organisation through the telephone numbers
                and email addresses listed here. For a specific department,
                use the contact directory above.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={`tel:${cms?.phone1 || "+2349023916067"}`}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Telephone 01
                </span>
                <p className="mt-3 text-xl font-black text-[#063b25]">
                  {cms?.phone1 || "09023916067"}
                </p>
                <p className="mt-2 text-xs text-gray-500">Call ASBESOC</p>
              </a>

              <a
                href={`tel:${cms?.phone2 || "+2347081486898"}`}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Telephone 02
                </span>
                <p className="mt-3 text-xl font-black text-[#063b25]">
                  {cms?.phone2 || "07081486898"}
                </p>
                <p className="mt-2 text-xs text-gray-500">Call ASBESOC</p>
              </a>

              <a
                href={`mailto:${cms?.email1 || "asbesocng@gmail.com"}`}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Email address 01
                </span>
                <p className="mt-3 break-all text-base font-bold text-[#063b25]">
                  {cms?.email1 || "asbesocng@gmail.com"}
                </p>
                <p className="mt-2 text-xs text-gray-500">Send an email</p>
              </a>

              <a
                href={`mailto:${cms?.email2 || "infoasbesoc@gmail.com"}`}
                className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-amber-300 hover:shadow-lg"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Email address 02
                </span>
                <p className="mt-3 break-all text-base font-bold text-[#063b25]">
                  {cms?.email2 || "infoasbesoc@gmail.com"}
                </p>
                <p className="mt-2 text-xs text-gray-500">Send an email</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MESSAGE FORM */}
      <section id="contact-form" className="bg-[#edf3ee] px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="lg:pt-8">
            <SectionLabel>Write to ASBESOC</SectionLabel>
            <h2 className="text-3xl font-black leading-tight text-[#063b25] md:text-5xl">
              Have something to share with us?
            </h2>
            <p className="mt-6 leading-8 text-gray-600">
              Send a message to the appropriate department. We welcome
              enquiries about our organisation, membership, partnerships,
              community development and other areas of our work.
            </p>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-5">
              <p className="font-bold text-[#063b25]">
                A quick note about this form
              </p>
              <p className="mt-2 text-sm leading-7 text-gray-600">
                For now, submitting this form opens your device’s email
                application with your message prepared. You must press Send
                in that application to deliver it.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-[#063b25]/5 md:p-10">
            <h3 className="text-2xl font-black text-[#063b25]">
              Send a message
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Complete the details below and select the team you want to reach.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1b6545] focus:ring-2 focus:ring-[#1b6545]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1b6545] focus:ring-2 focus:ring-[#1b6545]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-department"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Department
                </label>
                <select
                  id="contact-department"
                  value={department}
                  onChange={(event) =>
                    setDepartment(event.target.value as Department)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#1b6545] focus:ring-2 focus:ring-[#1b6545]/10"
                >
                  <option>General Enquiry</option>
                  <option>Membership</option>
                  <option>Partnership</option>
                  <option>Administration</option>
                  <option>Human Rights</option>
                  <option>Community Development</option>
                  <option>Volunteering</option>
                  <option>Other</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Your message will be addressed to the email assigned to this department.
                </p>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="What is your message about?"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1b6545] focus:ring-2 focus:ring-[#1b6545]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Your Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                  required
                  className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#1b6545] focus:ring-2 focus:ring-[#1b6545]/10"
                />
              </div>

              <button
                type="submit"
                className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#063b25] px-6 py-4 font-bold text-white transition hover:bg-[#0b5133] focus:outline-none focus:ring-4 focus:ring-[#063b25]/20"
              >
                Open Email to Send Message
                <span className="text-amber-300" aria-hidden="true">↗</span>
              </button>

              {status && (
                <p
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
                >
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* QUICK LINKS AND ORGANISATION IDENTITY */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
            <div>
              <SectionLabel>Explore ASBESOC</SectionLabel>
              <h2 className="text-3xl font-black text-[#063b25] md:text-4xl">
                Learn more about our organisation.
              </h2>
              <p className="mt-5 max-w-lg leading-8 text-gray-600">
                Discover our work, programmes, projects and opportunities to
                become part of the ASBESOC community.
              </p>
            </div>

            <nav aria-label="ASBESOC quick links">
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-[#174a34] transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    {item.label}
                    <span className="text-amber-600" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-14 rounded-3xl bg-[#063b25] p-8 text-white md:p-12">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-3xl font-black tracking-tight">
                  ASBESOC<span className="text-amber-300">.</span>
                </p>
                <p className="mt-2 text-sm text-white/75">
                  Association for a Better Society
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
                  Promoting peace, empowerment and sustainable community
                  development in Nigeria.
                </p>
              </div>

              <div className="md:text-right">
                <p className="text-sm font-semibold text-amber-300">
                  Empowering communities since 1999
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Registered Organisation · RC 22526
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
