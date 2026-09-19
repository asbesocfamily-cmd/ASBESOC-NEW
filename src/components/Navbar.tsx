import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";

import logo from "../assets/logo.PNG";
import {
  submitPartnership,
  submitSupport,
} from "../firebase/submissions";

type FormType = "Support" | "Partnership";

type NigeriaState = {
  name: string;
  lgas: string[];
};

const nigeriaStates: NigeriaState[] = [
  {
    name: "Abia",
    lgas: "Aba North|Aba South|Arochukwu|Bende|Ikwuano|Isiala Ngwa North|Isiala Ngwa South|Isuikwuato|Obi Ngwa|Ohafia|Osisioma Ngwa|Ugwunagbo|Ukwa East|Ukwa West|Umuahia North|Umuahia South|Umunneochi".split("|"),
  },
  {
    name: "Adamawa",
    lgas: "Demsa|Fufore|Ganye|Girei|Gombi|Guyuk|Hong|Jada|Jimeta|Lamurde|Madagali|Maiha|Mayo-Belwa|Michika|Mubi North|Mubi South|Numan|Shelleng|Song|Toungo|Yola North|Yola South".split("|"),
  },
  {
    name: "Akwa Ibom",
    lgas: "Abak|Eastern Obolo|Eket|Esit Eket|Essien Udim|Etim Ekpo|Etinan|Ibeno|Ibesikpo Asutan|Ibiono Ibom|Ika|Ikono|Ikot Abasi|Ikot Ekpene|Ini|Itu|Mbo|Mkpat Enin|Nsit Atai|Nsit Ibom|Nsit Ubium|Obot Akara|Okobo|Onna|Oron|Oruk Anam|Udung Uko|Ukanafun|Uruan|Urue-Offong/Oruko|Uyo".split("|"),
  },
  {
    name: "Anambra",
    lgas: "Aguata|Anambra East|Anambra West|Anaocha|Awka North|Awka South|Ayamelum|Dunukofia|Ekwusigo|Idemili North|Idemili South|Ihiala|Njikoka|Nnewi North|Nnewi South|Ogbaru|Onitsha North|Onitsha South|Orumba North|Orumba South|Oyi".split("|"),
  },
  {
    name: "Bauchi",
    lgas: "Bauchi|Bogoro|Damban|Darazo|Dass|Gamawa|Ganjuwa|Giade|Itas/Gadau|Jama'are|Katagum|Kirfi|Misau|Ningi|Shira|Tafawa Balewa|Toro|Warji|Zaki".split("|"),
  },
  {
    name: "Bayelsa",
    lgas: "Brass|Ekeremor|Kolokuma/Opokuma|Nembe|Ogbia|Sagbama|Southern Ijaw|Yenagoa".split("|"),
  },
  {
    name: "Benue",
    lgas: "Ado|Agatu|Apa|Buruku|Gbajimba|Guma|Gwer East|Gwer West|Katsina-Ala|Konshisha|Kwande|Makurdi|Ogbadibo|Ohimini|Oju|Okpokwu|Otukpo|Tarka|Ukum|Ushongo|Vandeikya".split("|"),
  },
  {
    name: "Borno",
    lgas: "Abadam|Askira/Uba|Bama|Bayo|Biu|Chibok|Damboa|Dikwa|Gubio|Guzamala|Gwoza|Hawul|Jere|Kaga|Kala/Balge|Konduga|Kukawa|Kwaya Kusar|Mafa|Magumeri|Maiduguri|Marte|Mobbar|Monguno|Ngala|Nganzai|Shani".split("|"),
  },
  {
    name: "Cross River",
    lgas: "Abi|Akamkpa|Akpabuyo|Bakassi|Bekwarra|Biase|Boki|Calabar Municipal|Calabar South|Etung|Ikom|Obanliku|Obubra|Obudu|Odukpani|Ogoja|Yakuur|Yala".split("|"),
  },
  {
    name: "Delta",
    lgas: "Aniocha North|Aniocha South|Bomadi|Burutu|Ethiope East|Ethiope West|Ika North East|Ika South|Isoko North|Isoko South|Ndokwa East|Ndokwa West|Okpe|Oshimili North|Oshimili South|Patani|Sapele|Udu|Ughelli North|Ughelli South|Ukwuani|Uvwie|Warri North|Warri South|Warri South West".split("|"),
  },
  {
    name: "Ebonyi",
    lgas: "Abakaliki|Afikpo North|Afikpo South|Ebonyi|Ezza North|Ezza South|Ikwo|Ishielu|Ivo|Izzi|Ohaukwu|Onicha".split("|"),
  },
  {
    name: "Edo",
    lgas: "Akoko-Edo|Egor|Esan Central|Esan North-East|Esan South-East|Esan West|Etsako Central|Etsako East|Etsako West|Igueben|Ikpoba-Okha|Oredo|Orhionmwon|Ovia North-East|Ovia South-West|Owan East|Owan West|Uhunmwonde".split("|"),
  },
  {
    name: "Ekiti",
    lgas: "Ado Ekiti|Efon|Ekiti East|Ekiti South-West|Ekiti West|Emure|Gbonyin|Ido/Osi|Ijero|Ikere|Ikole|Ilejemeje|Irepodun/Ifelodun|Ise/Orun|Moba|Oye".split("|"),
  },
  {
    name: "Enugu",
    lgas: "Aninri|Awgu|Enugu East|Enugu North|Enugu South|Ezeagu|Igbo-Etiti|Igbo-Eze North|Igbo-Eze South|Isi-Uzo|Nkanu East|Nkanu West|Nsukka|Oji River|Udenu|Udi|Uzo-Uwani".split("|"),
  },
  {
    name: "Gombe",
    lgas: "Akko|Balanga|Billiri|Dukku|Funakaye|Gombe|Kaltungo|Kwami|Nafada|Shongom|Yamaltu/Deba".split("|"),
  },
  {
    name: "Imo",
    lgas: "Aboh Mbaise|Ahiazu Mbaise|Ehime Mbano|Ezinihitte|Ideato North|Ideato South|Ihitte/Uboma|Ikeduru|Isiala Mbano|Isu|Mbaitoli|Ngor Okpala|Njaba|Nkwerre|Nwangele|Obowo|Oguta|Ohaji/Egbema|Okigwe|Orlu|Orsu|Oru East|Oru West|Owerri Municipal|Owerri North|Owerri West|Unuimo".split("|"),
  },
  {
    name: "Jigawa",
    lgas: "Auyo|Babura|Biriniwa|Birnin Kudu|Buji|Dutse|Gagarawa|Garki|Gumel|Guri|Gwaram|Gwiwa|Hadejia|Jahun|Kafin Hausa|Kaugama|Kazaure|Kiri Kasama|Kiyawa|Maigatari|Malam Madori|Miga|Ringim|Roni|Sule Tankarkar|Taura|Yankwashi".split("|"),
  },
  {
    name: "Kaduna",
    lgas: "Birnin Gwari|Chikun|Giwa|Igabi|Ikara|Jaba|Jema'a|Kachia|Kaduna North|Kaduna South|Kagarko|Kajuru|Kaura|Kauru|Kubau|Kudan|Lere|Makarfi|Sabon Gari|Sanga|Soba|Zangon Kataf|Zaria".split("|"),
  },
  {
    name: "Kano",
    lgas: "Ajingi|Albasu|Bagwai|Bebeji|Bichi|Bunkure|Dala|Dambatta|Dawakin Kudu|Dawakin Tofa|Doguwa|Fagge|Gabasawa|Garko|Garun Mallam|Gaya|Gezawa|Gwale|Gwarzo|Kabo|Kano Municipal|Karaye|Kibiya|Kiru|Kumbotso|Kunchi|Kura|Madobi|Makoda|Minjibir|Nasarawa|Rano|Rimin Gado|Rogo|Shanono|Sumaila|Takai|Tarauni|Tofa|Tsanyawa|Tudun Wada|Ungogo|Warawa|Wudil".split("|"),
  },
  {
    name: "Katsina",
    lgas: "Bakori|Batagarawa|Batsari|Baure|Bindawa|Charanchi|Dan Musa|Dandume|Danja|Danmusa|Daura|Dutsi|Dutsin Ma|Faskari|Funtua|Ingawa|Jibia|Kafur|Kaita|Kankara|Kankia|Katsina|Kurfi|Kusada|Mai'Adua|Malumfashi|Mani|Mashi|Matazu|Musawa|Rimi|Sabuwa|Safana|Sandamu|Zango".split("|"),
  },
  {
    name: "Kebbi",
    lgas: "Aleiro|Arewa Dandi|Argungu|Augie|Bagudo|Birnin Kebbi|Bunza|Dandi|Danko/Wasagu|Fakai|Gwandu|Jega|Kalgo|Koko/Besse|Maiyama|Ngaski|Sakaba|Shanga|Suru|Yauri|Zuru".split("|"),
  },
  {
    name: "Kogi",
    lgas: "Adavi|Ajaokuta|Ankpa|Bassa|Dekina|Ibaji|Idah|Igalamela-Odolu|Ijumu|Kabba/Bunu|Kogi|Lokoja|Mopa-Muro|Ofu|Ogori/Magongo|Okehi|Okene|Olamaboro|Omala|Yagba East|Yagba West".split("|"),
  },
  {
    name: "Kwara",
    lgas: "Asa|Baruten|Edu|Ekiti|Ifelodun|Ilorin East|Ilorin South|Ilorin West|Irepodun|Isin|Kaiama|Moro|Offa|Oke Ero|Oyun|Pategi".split("|"),
  },
  {
    name: "Lagos",
    lgas: "Agege|Ajeromi-Ifelodun|Alimosho|Amuwo-Odofin|Apapa|Badagry|Epe|Eti-Osa|Ibeju-Lekki|Ifako-Ijaiye|Ikeja|Ikorodu|Kosofe|Lagos Island|Lagos Mainland|Mushin|Ojo|Oshodi-Isolo|Shomolu|Surulere".split("|"),
  },
  {
    name: "Nasarawa",
    lgas: "Akwanga|Awe|Doma|Karu|Keana|Keffi|Kokona|Lafia|Nasarawa|Nasarawa Eggon|Obi|Toto|Wamba".split("|"),
  },
  {
    name: "Niger",
    lgas: "Agaie|Agwara|Bida|Borgu|Bosso|Chanchaga|Edati|Gbako|Gurara|Katcha|Kontagora|Lapai|Lavun|Magama|Mariga|Mashegu|Mokwa|Munya|Paikoro|Rafi|Rijau|Shiroro|Suleja|Tafa|Wushishi".split("|"),
  },
  {
    name: "Ogun",
    lgas: "Abeokuta North|Abeokuta South|Ado-Odo/Ota|Egbado North|Egbado South|Ewekoro|Ifo|Ijebu East|Ijebu North|Ijebu North East|Ijebu Ode|Ikenne|Imeko Afon|Ipokia|Obafemi Owode|Odeda|Odogbolu|Remo North|Sagamu".split("|"),
  },
  {
    name: "Ondo",
    lgas: "Akoko North-East|Akoko North-West|Akoko South-East|Akoko South-West|Akure North|Akure South|Ese Odo|Idanre|Ifedore|Ilaje|Ile Oluji/Okeigbo|Irele|Odigbo|Okitipupa|Ondo East|Ondo West|Ose|Owo".split("|"),
  },
  {
    name: "Osun",
    lgas: "Atakunmosa East|Atakunmosa West|Aiyedaade|Aiyedire|Boluwaduro|Boripe|Ede North|Ede South|Egbedore|Ejigbo|Ife Central|Ife East|Ife North|Ife South|Ifedayo|Ila|Ilesa East|Ilesa West|Irepodun|Irewole|Isokan|Iwo|Obokun|Odo Otin|Ola Oluwa|Olorunda|Oriade|Orolu|Osogbo".split("|"),
  },
  {
    name: "Oyo",
    lgas: "Afijio|Akinyele|Atiba|Atisbo|Egbeda|Ibadan North|Ibadan North-East|Ibadan North-West|Ibadan South-East|Ibadan South-West|Ibarapa Central|Ibarapa East|Ibarapa North|Ido|Irepo|Iseyin|Itesiwaju|Iwajowa|Kajola|Lagelu|Ogbomosho North|Ogbomosho South|Ogo Oluwa|Olorunsogo|Oluyole|Ona Ara|Orelope|Ori Ire|Oyo East|Oyo West|Saki East|Saki West|Surulere".split("|"),
  },
  {
    name: "Plateau",
    lgas: "Barkin Ladi|Bassa|Bokkos|Jos East|Jos North|Jos South|Kanam|Kanke|Langtang North|Langtang South|Mangu|Mikang|Pankshin|Qua'an Pan|Riyom|Shendam|Wase".split("|"),
  },
  {
    name: "Rivers",
    lgas: "Abua/Odual|Ahoada East|Ahoada West|Akuku-Toru|Andoni|Asari-Toru|Bonny|Degema|Eleme|Emohua|Etche|Gokana|Ikwerre|Khana|Obio/Akpor|Ogba/Egbema/Ndoni|Ogu/Bolo|Okrika|Omuma|Opobo/Nkoro|Oyigbo|Port Harcourt|Tai".split("|"),
  },
  {
    name: "Sokoto",
    lgas: "Binji|Bodinga|Dange Shuni|Gada|Goronyo|Gudu|Gwadabawa|Illela|Isa|Kebbe|Kware|Rabah|Sabon Birni|Shagari|Silame|Sokoto North|Sokoto South|Tambuwal|Tangaza|Tureta|Wamakko|Wurno|Yabo".split("|"),
  },
  {
    name: "Taraba",
    lgas: "Ardo Kola|Bali|Donga|Gashaka|Gassol|Ibi|Jalingo|Karim Lamido|Kumi|Lau|Sardauna|Takum|Ussa|Wukari|Yorro|Zing".split("|"),
  },
  {
    name: "Yobe",
    lgas: "Bade|Bursari|Damaturu|Fika|Fune|Geidam|Gujba|Gulani|Jakusko|Karasuwa|Machina|Nangere|Nguru|Potiskum|Tarmuwa|Yunusari|Yusufari".split("|"),
  },
  {
    name: "Zamfara",
    lgas: "Anka|Bakura|Birnin Magaji/Kiyaw|Bungudu|Bukkuyum|Chafe|Gummi|Gusau|Kaura Namoda|Maradun|Maru|Shinkafi|Talata Mafara|Tsafe|Zurmi".split("|"),
  },
  {
    name: "Federal Capital Territory",
    lgas: "Abaji|Bwari|Gwagwalada|Kuje|Kwali|Municipal Area Council".split("|"),
  },
];

const supportTypes = [
  "Financial Support",
  "Material / Equipment",
  "Food / Clothing / Essential Supplies",
  "Volunteer Time / Community Service",
  "Technical Expertise",
  "Training / Professional Services",
  "Educational Materials / Scholarships",
  "Healthcare / Medical Supplies",
  "Land / Buildings / Facilities",
  "Transport / Logistics",
  "Media / Publicity / Advocacy",
  "Programme Support",
  "Other",
];

const organizationTypes = [
  "NGO / CSO",
  "Government Institution",
  "Private Sector / Business",
  "Foundation / Donor Organization",
  "Community-Based Organization",
  "Academic Institution",
  "International Organization",
  "Other",
];

const partnershipInterests = [
  "Peace Building and Behavioural Change",
  "Entrepreneurship / Empowerment",
  "Human Capital Development",
  "Advocacy",
  "Research / Training",
  "Community Development",
  "Housing",
  "Other",
];

const partnershipMethods = [
  "Technical Support",
  "Financial Partnership",
  "Programme Implementation",
  "Training / Capacity Building",
  "Research / Knowledge Sharing",
  "Community Mobilization",
  "Other",
];

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Programs", path: "/programs" },
  { name: "Projects", path: "/projects" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact Us", path: "/contact" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [getInvolvedOpen, setGetInvolvedOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);

  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setGetInvolvedOpen(false);
  };

  const openForm = (form: FormType) => {
    returnFocusRef.current = menuOpen
      ? mobileMenuRef.current
      : desktopTriggerRef.current;

    closeMenu();
    setSelectedForm(form);
  };

  const closeForm = useCallback(() => {
    setSelectedForm(null);

    requestAnimationFrame(() => {
      returnFocusRef.current?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex min-w-0 shrink-0 items-center gap-2.5"
          >
            <img
              src={logo}
              alt="ASBESOC Nigeria Logo"
              className="h-[56px] w-auto max-w-[130px] object-contain sm:h-[62px] sm:max-w-[150px]"
            />

            <div className="min-w-0 leading-tight">
              <div className="whitespace-nowrap text-base font-extrabold text-[#1B4332] sm:text-xl">
                ASBESOC
              </div>
              <div className="whitespace-nowrap text-[10px] font-extrabold tracking-[0.12em] text-slate-700 sm:text-xs">
                NIGERIA
              </div>
            </div>
          </NavLink>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1.5 lg:flex"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#1B4332] text-white"
                      : "bg-emerald-50 text-slate-800 hover:bg-emerald-100 hover:text-[#1B4332]"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="relative">
              <button
                ref={desktopTriggerRef}
                type="button"
                aria-expanded={getInvolvedOpen}
                aria-controls="desktop-get-involved"
                onClick={() => setGetInvolvedOpen((open) => !open)}
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  getInvolvedOpen
                    ? "bg-[#1B4332] text-white"
                    : "bg-emerald-50 text-slate-800 hover:bg-emerald-100"
                }`}
              >
                Get Involved
                <span
                  aria-hidden="true"
                  className={`transition ${
                    getInvolvedOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {getInvolvedOpen && (
                <div
                  id="desktop-get-involved"
                  className="absolute right-0 top-[calc(100%+10px)] z-[80] w-56 rounded-2xl border border-emerald-900/10 bg-white p-2 shadow-2xl"
                >
                  <NavLink
                    to="/membership"
                    onClick={closeMenu}
                    className="flex justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50"
                  >
                    Membership <span aria-hidden="true">→</span>
                  </NavLink>

                  {(["Support", "Partnership"] as const).map((form) => (
                    <button
                      key={form}
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => openForm(form)}
                      className="flex w-full justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50"
                    >
                      {form} <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <button
            ref={mobileMenuRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#1B4332] lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/30 transition lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        style={{
          height: "100dvh",
          visibility: menuOpen ? "visible" : "hidden",
        }}
        className={`fixed right-0 top-0 z-[70] h-screen w-[62vw] max-w-[280px] bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-emerald-900/10 px-3 py-3">
            <NavLink
              to="/"
              onClick={closeMenu}
              className="flex min-w-0 items-center gap-1.5"
            >
              <img
                src={logo}
                alt="ASBESOC"
                className="h-11 w-auto max-w-[92px] object-contain"
              />

              <div className="min-w-0">
                <div className="text-[14px] font-extrabold text-[#1B4332]">
                  ASBESOC
                </div>
                <div className="text-[9px] font-extrabold tracking-[0.08em] text-slate-700">
                  NIGERIA
                </div>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#1B4332]"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-5">
            <div className="my-auto space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center rounded-xl px-3 text-[13px] font-bold ${
                      isActive
                        ? "bg-[#1B4332] text-white"
                        : "bg-emerald-50 text-slate-800"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <button
                type="button"
                aria-expanded={getInvolvedOpen}
                aria-controls="mobile-get-involved"
                onClick={() => setGetInvolvedOpen((open) => !open)}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-[13px] font-bold ${
                  getInvolvedOpen
                    ? "bg-[#1B4332] text-white"
                    : "bg-emerald-50 text-slate-800"
                }`}
              >
                Get Involved <span aria-hidden="true">↓</span>
              </button>

              {getInvolvedOpen && (
                <div
                  id="mobile-get-involved"
                  className="space-y-1 rounded-xl bg-emerald-50 p-1.5"
                >
                  <NavLink
                    to="/membership"
                    onClick={closeMenu}
                    className="flex min-h-[42px] items-center rounded-lg px-3 text-xs font-bold"
                  >
                    Membership
                  </NavLink>

                  {(["Support", "Partnership"] as const).map((form) => (
                    <button
                      key={form}
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => openForm(form)}
                      className="flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-xs font-bold"
                    >
                      {form}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {selectedForm &&
        createPortal(
          <GetInvolvedForm
            key={selectedForm}
            type={selectedForm}
            onClose={closeForm}
          />,
          document.body
        )}
    </>
  );
}

/* ============================================================
   FORM DATA AND VALIDATION
============================================================ */

type TextValues = {
  fullNameOrOrganization: string;
  organization: string;
  organizationType: string;
  contactPerson: string;
  jobTitle: string;
  email: string;
  phone: string;
  website: string;
  nationality: string;
  country: string;
  state: string;
  lga: string;
  region: string;
  city: string;
  supportType: string;
  supportDescription: string;
  message: string;
};

type FieldName = keyof TextValues;

type FormValues = TextValues & {
  anonymous: boolean;
  areasOfInterest: string[];
  partnershipMethods: string[];
};

type FormErrors = Partial<Record<FieldName, string>>;

function emptyForm(): FormValues {
  return {
    fullNameOrOrganization: "",
    organization: "",
    organizationType: "",
    contactPerson: "",
    jobTitle: "",
    email: "",
    phone: "",
    website: "",
    nationality: "",
    country: "",
    state: "",
    lga: "",
    region: "",
    city: "",
    supportType: "Financial Support",
    supportDescription: "",
    message: "",
    anonymous: false,
    areasOfInterest: [],
    partnershipMethods: [],
  };
}

function isNigeriaCountry(country: string) {
  return country.trim().toLowerCase() === "nigeria";
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

function isValidWebsite(value: string) {
  if (!value.trim()) return true;
  if (/\s/.test(value.trim())) return false;

  if (
    /^[a-z][a-z\d+.-]*:/i.test(value.trim()) &&
    !/^https?:\/\//i.test(value.trim())
  ) {
    return false;
  }

  try {
    const url = new URL(normalizeWebsite(value));

    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.includes(".") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function validateForm(
  values: FormValues,
  isSupport: boolean
): FormErrors {
  const errors: FormErrors = {};

  const requireField = (name: FieldName, message: string) => {
    if (!values[name].trim()) {
      errors[name] = message;
    }
  };

  if (isSupport) {
    if (!values.anonymous) {
      requireField(
        "fullNameOrOrganization",
        "Please enter your name or organization."
      );
    }

    if (!supportTypes.includes(values.supportType)) {
      errors.supportType = "Please choose a type of support.";
    }

    requireField(
      "supportDescription",
      values.supportType === "Financial Support"
        ? "Please enter the amount and currency you would like to offer."
        : "Please describe the support you would like to offer."
    );
  } else {
    requireField("organization", "Please enter your organization name.");
    requireField("contactPerson", "Please enter the contact person's name.");
    requireField("jobTitle", "Please enter your position or job title.");

    if (!organizationTypes.includes(values.organizationType)) {
      errors.organizationType = "Please select your organization type.";
    }

    if (!isValidWebsite(values.website)) {
      errors.website = "Please enter a website or social media URL.";
    }
  }

  requireField("email", "Please enter your email address.");
  requireField("phone", "Please enter your contact number.");
  requireField("country", "Please enter your country.");

  if (
    values.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Please enter a valid email address.";
  }

  const normalizedPhone = values.phone.trim().replace(/[\s().-]/g, "");

  if (
    values.phone.trim() &&
    (!/^\+?\d{7,15}$/.test(normalizedPhone) ||
      /^\+?0+$/.test(normalizedPhone))
  ) {
    errors.phone = "Please enter a valid phone number, including country code if needed.";
  }

  if (isNigeriaCountry(values.country)) {
    const state = nigeriaStates.find((item) => item.name === values.state);

    if (!state) {
      errors.state = "Please select your state.";
    }

    if (!state || !state.lgas.includes(values.lga)) {
      errors.lga = "Please select your local government area.";
    }
  } else if (values.country.trim()) {
    requireField("region", "Please enter your state, province or region.");
    requireField("city", "Please enter your city or district.");
  }

  return errors;
}

/* ============================================================
   SUPPORT AND PARTNERSHIP FORMS
============================================================ */

function GetInvolvedForm({
  type,
  onClose,
}: {
  type: FormType;
  onClose: () => void;
}) {
  const isSupport = type === "Support";
  const formTitle = isSupport ? "Support Our Work" : "Partner With Us";

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [touched, setTouched] = useState<
    Partial<Record<FieldName, boolean>>
  >({});
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const submissionLock = useRef(false);

  const isNigeria = isNigeriaCountry(values.country);

  const selectedStateData = useMemo(
    () => nigeriaStates.find((state) => state.name === values.state),
    [values.state]
  );

  const errors = useMemo(
    () => validateForm(values, isSupport),
    [values, isSupport]
  );

  useEffect(() => {
    const oldBodyOverflow = document.body.style.overflow;
    const oldRootOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (!submissionLock.current) {
          onClose();
        }

        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
        )
      ).filter((element) => element.getClientRects().length > 0);

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const current = document.activeElement;
      const currentIsFocusable = focusable.some(
        (element) => element === current
      );

      if (!currentIsFocusable) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldBodyOverflow;
      document.documentElement.style.overflow = oldRootOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!submitted) return;

    dialogRef.current?.scrollTo({ top: 0, behavior: "auto" });
    successRef.current?.focus({ preventScroll: true });
  }, [submitted]);

  const updateText = (name: FieldName, value: string) => {
    setValues((current) => {
      const next = { ...current, [name]: value };

      if (
        name === "country" &&
        current.country.trim().toLowerCase() !== value.trim().toLowerCase()
      ) {
        next.state = "";
        next.lga = "";
        next.region = "";
        next.city = "";
      }

      if (name === "state") {
        next.lga = "";
      }

      return next;
    });

    if (name === "country") {
      setTouched((current) => ({
        ...current,
        state: false,
        lga: false,
        region: false,
        city: false,
      }));
    }

    if (name === "state") {
      setTouched((current) => ({ ...current, lga: false }));
    }

    setSubmitError("");
  };

  const field = (name: FieldName) => ({
    name,
    value: values[name],
    error: touched[name] || attempted ? errors[name] : undefined,
    onChange: (value: string) => updateText(name, value),
    onBlur: () =>
      setTouched((current) => ({ ...current, [name]: true })),
  });

  const toggleChoice = (
    name: "areasOfInterest" | "partnershipMethods",
    option: string
  ) => {
    setValues((current) => ({
      ...current,
      [name]: current[name].includes(option)
        ? current[name].filter((item) => item !== option)
        : [...current[name], option],
    }));

    setSubmitError("");
  };

  const closeSafely = () => {
    if (!submissionLock.current) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submissionLock.current) return;

    setAttempted(true);
    setSubmitError("");

    const currentErrors = validateForm(values, isSupport);

    if (Object.keys(currentErrors).length > 0) {
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(
            '[aria-invalid="true"]:not(:disabled)'
          )
          ?.focus();
      });

      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);

    const value = (name: FieldName) => values[name].trim();

    const location = {
      country: value("country"),
      ...(isNigeria
        ? {
            state: value("state"),
            lga: value("lga"),
          }
        : {
            region: value("region"),
            city: value("city"),
          }),
    };

    try {
      if (isSupport) {
        await submitSupport({
          fullNameOrOrganization: values.anonymous
            ? ""
            : value("fullNameOrOrganization"),
          email: value("email"),
          phone: value("phone"),
          supportType: values.supportType,
          anonymous: values.anonymous,
          ...location,
          supportDescription: value("supportDescription"),
          message: value("message"),
        });
      } else {
        await submitPartnership({
          organization: value("organization"),
          organizationType: values.organizationType,
          contactPerson: value("contactPerson"),
          jobTitle: value("jobTitle"),
          email: value("email"),
          phone: value("phone"),
          website: normalizeWebsite(values.website),
          nationality: value("nationality"),
          ...location,
          areasOfInterest: [...values.areasOfInterest],
          partnershipMethods: [...values.partnershipMethods],
          message: value("message"),
        });
      }

      setSubmitted(true);
    } catch {
      setSubmitError(
        "We couldn’t confirm your submission. Your answers are still here. Please check your connection and try again. If this continues, contact asbesocngo@gmail.com."
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="involved-dialog-title"
      tabIndex={-1}
      style={{ height: "100dvh" }}
      className="fixed inset-0 z-[99999] overflow-x-hidden overflow-y-auto overscroll-contain bg-[#f3f7f3] outline-none"
    >
      <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[68px] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              Get Involved
            </p>

            <h2
              id="involved-dialog-title"
              className="mt-1 truncate text-sm font-black text-[#1B4332] sm:text-base"
            >
              {formTitle}
            </h2>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={closeSafely}
            disabled={isSubmitting}
            aria-label="Close form"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-900/10 bg-emerald-50 text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </header>

      {submitted ? (
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center px-4 py-10">
          <section className="w-full overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-xl">
            <div className="relative overflow-hidden bg-[#063b25] px-6 py-12 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/5"
              />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-[#163d31]">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                </div>

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                  Request Submitted
                </p>

                <h3
                  ref={successRef}
                  tabIndex={-1}
                  className="mt-3 text-3xl font-black leading-tight text-white outline-none sm:text-4xl"
                >
                  {isSupport
                    ? "Thank you for supporting our work."
                    : "Thank you for your partnership interest."}
                </h3>

                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-emerald-50/80">
                  Your request has been submitted successfully. ASBESOC
                  will review your information and contact you when
                  necessary.
                </p>

                {isSupport &&
                  values.supportType === "Financial Support" && (
                    <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-emerald-50/70">
                      This confirms your support request. No payment has
                      been collected through this form.
                    </p>
                  )}
              </div>
            </div>

            <div className="px-6 py-7 text-center">
              <button
                type="button"
                onClick={closeSafely}
                className="min-h-12 rounded-full bg-[#1B4332] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-amber-400 hover:text-[#163d31]"
              >
                Return to ASBESOC
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {/* ONE RESPONSIVE INTRODUCTION CARD */}
          <section className="relative overflow-hidden rounded-3xl bg-[#063b25] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8 lg:py-9">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-60 w-60 rounded-full border-[35px] border-white/[0.04]"
            />

            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                Be Part of the Change
              </p>

              <h3 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                {formTitle}
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80 lg:hidden">
                {isSupport
                  ? "Contribute funds, time, skills or resources to support our work."
                  : "Work with ASBESOC to strengthen people and communities."}
              </p>

              <p className="mt-4 hidden max-w-3xl text-sm leading-7 text-emerald-50/80 lg:block">
                {isSupport
                  ? "Help ASBESOC expand programmes, strengthen communities and reach more individuals through financial, material, professional and volunteer support."
                  : "Collaborate with ASBESOC to develop practical, sustainable solutions that strengthen people and communities."}
              </p>

              <div className="mt-7 hidden grid-cols-3 gap-6 border-t border-white/15 pt-6 lg:grid">
                <IntroItem
                  title={isSupport ? "Direct Impact" : "Shared Purpose"}
                  text={
                    isSupport
                      ? "Contribute to programmes and community initiatives."
                      : "Work with us around common development goals."
                  }
                />

                <IntroItem
                  title={
                    isSupport ? "Flexible Support" : "International Reach"
                  }
                  text={
                    isSupport
                      ? "Offer your time, skills, resources or financial support."
                      : "Open to organizations locally and internationally."
                  }
                />

                <IntroItem
                  title="Responsible Engagement"
                  text="Your request will be reviewed for relevant ASBESOC engagement."
                />
              </div>
            </div>
          </section>

          {/* FORM CARD */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSubmitting}
            className="mt-6 overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-[0_18px_55px_rgba(18,60,45,0.08)] sm:mt-8"
          >
            <div className="h-1 bg-gradient-to-r from-[#1B4332] via-emerald-600 to-amber-400" />

            <div className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-50/80 via-white to-amber-50/60 px-5 py-6 sm:px-8">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
                {isSupport ? "Support Form" : "Partnership Form"}
              </p>

              <h3 className="mt-2 text-xl font-black text-[#1B4332] sm:text-2xl">
                {isSupport
                  ? "Tell us how you would like to help"
                  : "Tell us about your organization"}
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Fields marked <span className="text-rose-600">*</span>{" "}
                are required.
              </p>
            </div>

            <div className="px-5 py-6 sm:p-8">
              <fieldset disabled={isSubmitting} className="min-w-0">
                <legend className="sr-only">{formTitle}</legend>

                <FormSection
                  number="01"
                  title={isSupport ? "Your details" : "Organization details"}
                  description="Let us know who to contact about your request."
                >
                  {isSupport ? (
                    <>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={values.anonymous}
                          onChange={(event) => {
                            const anonymous = event.target.checked;

                            setValues((current) => ({
                              ...current,
                              anonymous,
                            }));
                            setSubmitError("");
                          }}
                          className="mt-1 h-4 w-4 shrink-0 accent-emerald-800"
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-bold text-[#1B4332]">
                            I would like to remain anonymous
                          </span>

                          <span className="mt-1 block text-xs leading-6 text-slate-500">
                            You can omit your name. Email and phone are
                            still required so ASBESOC can respond to
                            your request.
                          </span>
                        </span>
                      </label>

                      {!values.anonymous && (
                        <Field
                          {...field("fullNameOrOrganization")}
                          label="Full Name / Organization Name"
                          placeholder="Enter your name or organization"
                          autoComplete="name"
                          maxLength={200}
                          required
                        />
                      )}

                      <Field
                        {...field("email")}
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        maxLength={254}
                        required
                      />

                      <Field
                        {...field("phone")}
                        label="Contact Number"
                        type="tel"
                        placeholder="e.g. +234 902 391 6067"
                        autoComplete="tel"
                        maxLength={40}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <Field
                        {...field("organization")}
                        label="Organization / Institution Name"
                        placeholder="Enter organization name"
                        autoComplete="organization"
                        maxLength={200}
                        required
                      />

                      <Field
                        {...field("organizationType")}
                        label="Type of Organization"
                        kind="select"
                        options={organizationTypes}
                        placeholder="Select organization type"
                        required
                      />

                      <Field
                        {...field("contactPerson")}
                        label="Contact Person"
                        placeholder="Enter contact person's name"
                        autoComplete="name"
                        maxLength={150}
                        required
                      />

                      <Field
                        {...field("jobTitle")}
                        label="Position / Job Title"
                        placeholder="Enter position"
                        autoComplete="organization-title"
                        maxLength={150}
                        required
                      />

                      <Field
                        {...field("email")}
                        label="Email Address"
                        type="email"
                        placeholder="contact@example.com"
                        autoComplete="email"
                        maxLength={254}
                        required
                      />

                      <Field
                        {...field("phone")}
                        label="Contact Number"
                        type="tel"
                        placeholder="e.g. +234 902 391 6067"
                        autoComplete="tel"
                        maxLength={40}
                        required
                      />

                      <Field
                        {...field("website")}
                        label="Website / Social Media"
                        placeholder="example.com or social media URL"
                        autoComplete="url"
                        maxLength={500}
                      />

                      <Field
                        {...field("nationality")}
                        label="Nationality"
                        placeholder="Enter nationality"
                        maxLength={100}
                      />
                    </>
                  )}
                </FormSection>

                <FormSection
                  number="02"
                  title="Your location"
                  description="Applications are welcome from Nigeria and other countries."
                >
                  <Field
                    {...field("country")}
                    label="Country"
                    placeholder="e.g. Nigeria"
                    autoComplete="country-name"
                    maxLength={100}
                    required
                  />

                  {isNigeria ? (
                    <>
                      <Field
                        {...field("state")}
                        label="State"
                        kind="select"
                        options={nigeriaStates.map((state) => state.name)}
                        placeholder="Select your state"
                        autoComplete="address-level1"
                        required
                      />

                      <Field
                        {...field("lga")}
                        label="Local Government Area"
                        kind="select"
                        options={selectedStateData?.lgas ?? []}
                        placeholder={
                          selectedStateData
                            ? "Select your LGA"
                            : "Select state first"
                        }
                        disabled={!selectedStateData}
                        required
                      />
                    </>
                  ) : values.country.trim() ? (
                    <>
                      <Field
                        {...field("region")}
                        label="State / Province / Region"
                        placeholder="Enter state, province or region"
                        autoComplete="address-level1"
                        maxLength={100}
                        required
                      />

                      <Field
                        {...field("city")}
                        label="City / District"
                        placeholder="Enter city or district"
                        autoComplete="address-level2"
                        maxLength={100}
                        required
                      />
                    </>
                  ) : null}
                </FormSection>

                <FormSection
                  number="03"
                  title={isSupport ? "Your contribution" : "Partnership interests"}
                  description={
                    isSupport
                      ? "Tell us what you would like to offer."
                      : "Tell us where and how you would like to collaborate."
                  }
                >
                  {isSupport ? (
                    <>
                      <Field
                        {...field("supportType")}
                        label="Type of Support"
                        kind="select"
                        options={supportTypes}
                        required
                        fullWidth
                      />

                      <Field
                        {...field("supportDescription")}
                        label={
                          values.supportType === "Financial Support"
                            ? "Amount and Currency"
                            : "Description of Support"
                        }
                        kind="textarea"
                        rows={4}
                        maxLength={3000}
                        placeholder={
                          values.supportType === "Financial Support"
                            ? "Enter the amount and currency you would like to offer..."
                            : "Describe the time, skills, materials, services or other support you would like to offer..."
                        }
                        hint="You can also describe additional types of support here."
                        required
                        fullWidth
                      />

                      {values.supportType === "Financial Support" && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:col-span-2 sm:p-5">
                          <p className="text-sm font-bold text-[#1B4332]">
                            About financial support
                          </p>

                          <p className="mt-2 text-xs leading-6 text-slate-600">
                            This form records your offer of support. It
                            does not collect or process a payment. For
                            payment instructions, contact{" "}
                            <a
                              href="mailto:asbesocngo@gmail.com"
                              className="break-all font-semibold text-emerald-800 underline underline-offset-2"
                            >
                              asbesocngo@gmail.com
                            </a>
                            .
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <ChoiceGroup
                        title="Area(s) of Interest"
                        name="areasOfInterest"
                        options={partnershipInterests}
                        selected={values.areasOfInterest}
                        onToggle={(option) =>
                          toggleChoice("areasOfInterest", option)
                        }
                      />

                      <ChoiceGroup
                        title="How would you like to partner with ASBESOC?"
                        name="partnershipMethod"
                        options={partnershipMethods}
                        selected={values.partnershipMethods}
                        onToggle={(option) =>
                          toggleChoice("partnershipMethods", option)
                        }
                      />
                    </>
                  )}

                  <Field
                    {...field("message")}
                    label={
                      isSupport
                        ? "Additional Message"
                        : "Additional Information"
                    }
                    kind="textarea"
                    rows={4}
                    maxLength={3000}
                    placeholder={
                      isSupport
                        ? "Add anything else you would like us to know..."
                        : "Tell us more about the partnership opportunity..."
                    }
                    fullWidth
                  />
                </FormSection>
              </fieldset>

              <div className="mt-8 border-t border-emerald-900/10 pt-6">
                {submitError && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
                  >
                    {submitError}
                  </div>
                )}

                <div
                  role="status"
                  aria-live="polite"
                  className="text-sm text-emerald-800"
                >
                  {isSubmitting && (
                    <p className="mb-4">
                      Submitting your request. Please keep this form open.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-lg text-xs leading-6 text-slate-500">
                    Your information will be reviewed by ASBESOC to
                    respond to your request and determine the
                    appropriate next steps.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-[#1B4332] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#285c45] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M21 12a9 9 0 0 0-9-9"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        {isSupport
                          ? "Submit Support Request"
                          : "Submit Partnership Request"}
                        <span aria-hidden="true" className="text-amber-300">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          <p className="px-3 pb-2 pt-6 text-center text-xs leading-6 text-slate-500">
            Building a peaceful, empowered and better society requires
            collective action.
          </p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SHARED FORM COMPONENTS
============================================================ */

function IntroItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-bold text-white">{title}</h4>
      <p className="mt-2 text-xs leading-6 text-emerald-50/70">
        {text}
      </p>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-slate-100 pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-800">
          {number}
        </span>

        <div>
          <h4 className="text-base font-bold text-[#1B4332] sm:text-lg">
            {title}
          </h4>

          <p className="mt-1 text-xs leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

type FieldProps = {
  name: FieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  kind?: "input" | "select" | "textarea";
  type?: "text" | "email" | "tel";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: string;
  hint?: string;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
};

function Field({
  name,
  label,
  value,
  onChange,
  onBlur,
  kind = "input",
  type = "text",
  placeholder,
  options = [],
  required = false,
  disabled = false,
  fullWidth = false,
  error,
  hint,
  rows = 4,
  maxLength,
  autoComplete,
}: FieldProps) {
  const id = `involved-${name}`;

  const describedBy =
    [
      hint ? `${id}-hint` : "",
      error ? `${id}-error` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const controlClass = `block min-h-[52px] w-full min-w-0 max-w-full scroll-mt-24 rounded-xl border px-4 py-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 sm:text-sm ${
    error
      ? "border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-200 bg-[#fafcf9] hover:border-emerald-300 focus:border-emerald-600 focus:bg-white focus:ring-emerald-100/70"
  }`;

  const shared = {
    id,
    name,
    value,
    required,
    disabled,
    onBlur,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className={`min-w-0 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label
        htmlFor={id}
        className="mb-2 flex flex-wrap items-baseline gap-1.5 text-sm font-semibold text-[#1B4332]"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-rose-600">
            *
          </span>
        ) : (
          <span className="text-xs font-normal text-slate-400">
            (optional)
          </span>
        )}
      </label>

      {kind === "textarea" ? (
        <textarea
          {...shared}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${controlClass} min-h-[112px] resize-y`}
        />
      ) : kind === "select" ? (
        <div className="relative">
          <select
            {...shared}
            autoComplete={autoComplete}
            onChange={(event) => onChange(event.target.value)}
            className={`${controlClass} appearance-none pr-10`}
          >
            <option value="">
              {placeholder ?? "Select an option"}
            </option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m7 10 5 5 5-5"
            />
          </svg>
        </div>
      ) : (
        <input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        />
      )}

      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-xs font-medium leading-5 text-rose-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceGroup({
  title,
  name,
  options,
  selected,
  onToggle,
}: {
  title: string;
  name: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <fieldset className="min-w-0 sm:col-span-2">
      <legend className="mb-3 text-sm font-semibold text-[#1B4332]">
        {title}{" "}
        <span className="text-xs font-normal text-slate-400">
          (optional)
        </span>
      </legend>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);

          return (
            <label
              key={option}
              className={`flex min-h-[54px] min-w-0 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                checked
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-slate-200 bg-[#fafcf9] hover:border-emerald-300"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onToggle(option)}
                className="mt-1 h-4 w-4 shrink-0 accent-emerald-800"
              />

              <span className="min-w-0 text-sm font-medium leading-6 text-slate-700">
                {option}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default Navbar;