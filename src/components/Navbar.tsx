import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.PNG";

type FormType = "Support" | "Partnership";

type SupportCategory =
  | "Financial Support"
  | "Materials / Resources"
  | "Volunteer Support"
  | "Community Support"
  | "Other";

type NigeriaState = {
  name: string;
  lgas: string[];
};

/* =========================================================
   NIGERIA STATES + LOCAL GOVERNMENT AREAS
========================================================= */

const nigeriaStates: NigeriaState[] = [
  {
    name: "Abia",
    lgas: [
      "Aba North",
      "Aba South",
      "Arochukwu",
      "Bende",
      "Ikwuano",
      "Isiala Ngwa North",
      "Isiala Ngwa South",
      "Isuikwuato",
      "Obi Ngwa",
      "Ohafia",
      "Osisioma Ngwa",
      "Ugwunagbo",
      "Ukwa East",
      "Ukwa West",
      "Umuahia North",
      "Umuahia South",
      "Umunneochi",
    ],
  },

  {
    name: "Adamawa",
    lgas: [
      "Demsa",
      "Fufore",
      "Ganye",
      "Girei",
      "Gombi",
      "Guyuk",
      "Hong",
      "Jada",
      "Jimeta",
      "Lamurde",
      "Madagali",
      "Maiha",
      "Mayo-Belwa",
      "Michika",
      "Mubi North",
      "Mubi South",
      "Numan",
      "Shelleng",
      "Song",
      "Toungo",
      "Yola North",
      "Yola South",
    ],
  },

  {
    name: "Akwa Ibom",
    lgas: [
      "Abak",
      "Eastern Obolo",
      "Eket",
      "Esit Eket",
      "Essien Udim",
      "Etim Ekpo",
      "Etinan",
      "Ibeno",
      "Ibesikpo Asutan",
      "Ibiono Ibom",
      "Ika",
      "Ikono",
      "Ikot Abasi",
      "Ikot Ekpene",
      "Ini",
      "Itu",
      "Mbo",
      "Mkpat Enin",
      "Nsit Atai",
      "Nsit Ibom",
      "Nsit Ubium",
      "Obot Akara",
      "Okobo",
      "Onna",
      "Oron",
      "Oruk Anam",
      "Udung Uko",
      "Ukanafun",
      "Uruan",
      "Urue-Offong/Oruko",
      "Uyo",
    ],
  },

  {
    name: "Anambra",
    lgas: [
      "Aguata",
      "Anambra East",
      "Anambra West",
      "Anaocha",
      "Awka North",
      "Awka South",
      "Ayamelum",
      "Dunukofia",
      "Ekwusigo",
      "Idemili North",
      "Idemili South",
      "Ihiala",
      "Njikoka",
      "Nnewi North",
      "Nnewi South",
      "Ogbaru",
      "Onitsha North",
      "Onitsha South",
      "Orumba North",
      "Orumba South",
      "Oyi",
    ],
  },

  {
    name: "Bauchi",
    lgas: [
      "Bauchi",
      "Bogoro",
      "Damban",
      "Darazo",
      "Dass",
      "Gamawa",
      "Ganjuwa",
      "Giade",
      "Itas/Gadau",
      "Jama'are",
      "Katagum",
      "Kirfi",
      "Misau",
      "Ningi",
      "Shira",
      "Tafawa Balewa",
      "Toro",
      "Warji",
      "Zaki",
    ],
  },

  {
    name: "Bayelsa",
    lgas: [
      "Brass",
      "Ekeremor",
      "Kolokuma/Opokuma",
      "Nembe",
      "Ogbia",
      "Sagbama",
      "Southern Ijaw",
      "Yenagoa",
    ],
  },

  {
    name: "Benue",
    lgas: [
      "Ado",
      "Agatu",
      "Apa",
      "Buruku",
      "Gbajimba",
      "Guma",
      "Gwer East",
      "Gwer West",
      "Katsina-Ala",
      "Konshisha",
      "Kwande",
      "Makurdi",
      "Ogbadibo",
      "Ohimini",
      "Oju",
      "Okpokwu",
      "Otukpo",
      "Tarka",
      "Ukum",
      "Ushongo",
      "Vandeikya",
    ],
  },

  {
    name: "Borno",
    lgas: [
      "Abadam",
      "Askira/Uba",
      "Bama",
      "Bayo",
      "Biu",
      "Chibok",
      "Damboa",
      "Dikwa",
      "Gubio",
      "Guzamala",
      "Gwoza",
      "Hawul",
      "Jere",
      "Kaga",
      "Kala/Balge",
      "Konduga",
      "Kukawa",
      "Kwaya Kusar",
      "Mafa",
      "Magumeri",
      "Maiduguri",
      "Marte",
      "Mobbar",
      "Monguno",
      "Ngala",
      "Nganzai",
      "Shani",
    ],
  },

  {
    name: "Cross River",
    lgas: [
      "Abi",
      "Akamkpa",
      "Akpabuyo",
      "Bakassi",
      "Bekwarra",
      "Biase",
      "Boki",
      "Calabar Municipal",
      "Calabar South",
      "Etung",
      "Ikom",
      "Obanliku",
      "Obubra",
      "Obudu",
      "Odukpani",
      "Ogoja",
      "Yakuur",
      "Yala",
    ],
  },

  {
    name: "Delta",
    lgas: [
      "Aniocha North",
      "Aniocha South",
      "Bomadi",
      "Burutu",
      "Ethiope East",
      "Ethiope West",
      "Ika North East",
      "Ika South",
      "Isoko North",
      "Isoko South",
      "Ndokwa East",
      "Ndokwa West",
      "Okpe",
      "Oshimili North",
      "Oshimili South",
      "Patani",
      "Sapele",
      "Udu",
      "Ughelli North",
      "Ughelli South",
      "Ukwuani",
      "Uvwie",
      "Warri North",
      "Warri South",
      "Warri South West",
    ],
  },

  {
    name: "Ebonyi",
    lgas: [
      "Abakaliki",
      "Afikpo North",
      "Afikpo South",
      "Ebonyi",
      "Ezza North",
      "Ezza South",
      "Ikwo",
      "Ishielu",
      "Ivo",
      "Izzi",
      "Ohaukwu",
      "Onicha",
    ],
  },

  {
    name: "Edo",
    lgas: [
      "Akoko-Edo",
      "Egor",
      "Esan Central",
      "Esan North-East",
      "Esan South-East",
      "Esan West",
      "Etsako Central",
      "Etsako East",
      "Etsako West",
      "Igueben",
      "Ikpoba-Okha",
      "Oredo",
      "Orhionmwon",
      "Ovia North-East",
      "Ovia South-West",
      "Owan East",
      "Owan West",
      "Uhunmwonde",
    ],
  },

  {
    name: "Ekiti",
    lgas: [
      "Ado Ekiti",
      "Efon",
      "Ekiti East",
      "Ekiti South-West",
      "Ekiti West",
      "Emure",
      "Gbonyin",
      "Ido/Osi",
      "Ijero",
      "Ikere",
      "Ikole",
      "Ilejemeje",
      "Irepodun/Ifelodun",
      "Ise/Orun",
      "Moba",
      "Oye",
    ],
  },

  {
    name: "Enugu",
    lgas: [
      "Aninri",
      "Awgu",
      "Enugu East",
      "Enugu North",
      "Enugu South",
      "Ezeagu",
      "Igbo-Etiti",
      "Igbo-Eze North",
      "Igbo-Eze South",
      "Isi-Uzo",
      "Nkanu East",
      "Nkanu West",
      "Nsukka",
      "Oji River",
      "Udenu",
      "Udi",
      "Uzo-Uwani",
    ],
  },

  {
    name: "Gombe",
    lgas: [
      "Akko",
      "Balanga",
      "Billiri",
      "Dukku",
      "Funakaye",
      "Gombe",
      "Kaltungo",
      "Kwami",
      "Nafada",
      "Shongom",
      "Yamaltu/Deba",
    ],
  },

  {
    name: "Imo",
    lgas: [
      "Aboh Mbaise",
      "Ahiazu Mbaise",
      "Ehime Mbano",
      "Ezinihitte",
      "Ideato North",
      "Ideato South",
      "Ihitte/Uboma",
      "Ikeduru",
      "Isiala Mbano",
      "Isu",
      "Mbaitoli",
      "Ngor Okpala",
      "Njaba",
      "Nkwerre",
      "Nwangele",
      "Obowo",
      "Oguta",
      "Ohaji/Egbema",
      "Okigwe",
      "Orlu",
      "Orsu",
      "Oru East",
      "Oru West",
      "Owerri Municipal",
      "Owerri North",
      "Owerri West",
      "Unuimo",
    ],
  },

  {
    name: "Jigawa",
    lgas: [
      "Auyo",
      "Babura",
      "Biriniwa",
      "Birnin Kudu",
      "Buji",
      "Dutse",
      "Gagarawa",
      "Garki",
      "Gumel",
      "Guri",
      "Gwaram",
      "Gwiwa",
      "Hadejia",
      "Jahun",
      "Kafin Hausa",
      "Kaugama",
      "Kazaure",
      "Kiri Kasama",
      "Kiyawa",
      "Maigatari",
      "Malam Madori",
      "Miga",
      "Ringim",
      "Roni",
      "Sule Tankarkar",
      "Taura",
      "Yankwashi",
    ],
  },

  {
    name: "Kaduna",
    lgas: [
      "Birnin Gwari",
      "Chikun",
      "Giwa",
      "Igabi",
      "Ikara",
      "Jaba",
      "Jema'a",
      "Kachia",
      "Kaduna North",
      "Kaduna South",
      "Kagarko",
      "Kajuru",
      "Kaura",
      "Kauru",
      "Kubau",
      "Kudan",
      "Lere",
      "Makarfi",
      "Sabon Gari",
      "Sanga",
      "Soba",
      "Zangon Kataf",
      "Zaria",
    ],
  },

  {
    name: "Kano",
    lgas: [
      "Ajingi",
      "Albasu",
      "Bagwai",
      "Bebeji",
      "Bichi",
      "Bunkure",
      "Dala",
      "Dambatta",
      "Dawakin Kudu",
      "Dawakin Tofa",
      "Doguwa",
      "Fagge",
      "Gabasawa",
      "Garko",
      "Garun Mallam",
      "Gaya",
      "Gezawa",
      "Gwale",
      "Gwarzo",
      "Kabo",
      "Kano Municipal",
      "Karaye",
      "Kibiya",
      "Kiru",
      "Kumbotso",
      "Kunchi",
      "Kura",
      "Madobi",
      "Makoda",
      "Minjibir",
      "Nasarawa",
      "Rano",
      "Rimin Gado",
      "Rogo",
      "Shanono",
      "Sumaila",
      "Takai",
      "Tarauni",
      "Tofa",
      "Tsanyawa",
      "Tudun Wada",
      "Ungogo",
      "Warawa",
      "Wudil",
    ],
  },

  {
    name: "Katsina",
    lgas: [
      "Bakori",
      "Batagarawa",
      "Batsari",
      "Baure",
      "Bindawa",
      "Charanchi",
      "Dan Musa",
      "Dandume",
      "Danja",
      "Danmusa",
      "Daura",
      "Dutsi",
      "Dutsin Ma",
      "Faskari",
      "Funtua",
      "Ingawa",
      "Jibia",
      "Kafur",
      "Kaita",
      "Kankara",
      "Kankia",
      "Katsina",
      "Kurfi",
      "Kusada",
      "Mai'Adua",
      "Malumfashi",
      "Mani",
      "Mashi",
      "Matazu",
      "Musawa",
      "Rimi",
      "Sabuwa",
      "Safana",
      "Sandamu",
      "Zango",
    ],
  },

  {
    name: "Kebbi",
    lgas: [
      "Aleiro",
      "Arewa Dandi",
      "Argungu",
      "Augie",
      "Bagudo",
      "Birnin Kebbi",
      "Bunza",
      "Dandi",
      "Danko/Wasagu",
      "Fakai",
      "Gwandu",
      "Jega",
      "Kalgo",
      "Koko/Besse",
      "Maiyama",
      "Ngaski",
      "Sakaba",
      "Shanga",
      "Suru",
      "Yauri",
      "Zuru",
    ],
  },

  {
    name: "Kogi",
    lgas: [
      "Adavi",
      "Ajaokuta",
      "Ankpa",
      "Bassa",
      "Dekina",
      "Ibaji",
      "Idah",
      "Igalamela-Odolu",
      "Ijumu",
      "Kabba/Bunu",
      "Kogi",
      "Lokoja",
      "Mopa-Muro",
      "Ofu",
      "Ogori/Magongo",
      "Okehi",
      "Okene",
      "Olamaboro",
      "Omala",
      "Yagba East",
      "Yagba West",
    ],
  },

  {
    name: "Kwara",
    lgas: [
      "Asa",
      "Baruten",
      "Edu",
      "Ekiti",
      "Ifelodun",
      "Ilorin East",
      "Ilorin South",
      "Ilorin West",
      "Irepodun",
      "Isin",
      "Kaiama",
      "Moro",
      "Offa",
      "Oke Ero",
      "Oyun",
      "Pategi",
    ],
  },

  {
    name: "Lagos",
    lgas: [
      "Agege",
      "Ajeromi-Ifelodun",
      "Alimosho",
      "Amuwo-Odofin",
      "Apapa",
      "Badagry",
      "Epe",
      "Eti-Osa",
      "Ibeju-Lekki",
      "Ifako-Ijaiye",
      "Ikeja",
      "Ikorodu",
      "Kosofe",
      "Lagos Island",
      "Lagos Mainland",
      "Mushin",
      "Ojo",
      "Oshodi-Isolo",
      "Shomolu",
      "Surulere",
    ],
  },

  {
    name: "Nasarawa",
    lgas: [
      "Akwanga",
      "Awe",
      "Doma",
      "Karu",
      "Keana",
      "Keffi",
      "Kokona",
      "Lafia",
      "Nasarawa",
      "Nasarawa Eggon",
      "Obi",
      "Toto",
      "Wamba",
    ],
  },

  {
    name: "Niger",
    lgas: [
      "Agaie",
      "Agwara",
      "Bida",
      "Borgu",
      "Bosso",
      "Chanchaga",
      "Edati",
      "Gbako",
      "Gurara",
      "Katcha",
      "Kontagora",
      "Lapai",
      "Lavun",
      "Magama",
      "Mariga",
      "Mashegu",
      "Mokwa",
      "Munya",
      "Paikoro",
      "Rafi",
      "Rijau",
      "Shiroro",
      "Suleja",
      "Tafa",
      "Wushishi",
    ],
  },

  {
    name: "Ogun",
    lgas: [
      "Abeokuta North",
      "Abeokuta South",
      "Ado-Odo/Ota",
      "Egbado North",
      "Egbado South",
      "Ewekoro",
      "Ifo",
      "Ijebu East",
      "Ijebu North",
      "Ijebu North East",
      "Ijebu Ode",
      "Ikenne",
      "Imeko Afon",
      "Ipokia",
      "Obafemi Owode",
      "Odeda",
      "Odogbolu",
      "Remo North",
      "Sagamu",
    ],
  },

  {
    name: "Ondo",
    lgas: [
      "Akoko North-East",
      "Akoko North-West",
      "Akoko South-East",
      "Akoko South-West",
      "Akure North",
      "Akure South",
      "Ese Odo",
      "Idanre",
      "Ifedore",
      "Ilaje",
      "Ile Oluji/Okeigbo",
      "Irele",
      "Odigbo",
      "Okitipupa",
      "Ondo East",
      "Ondo West",
      "Ose",
      "Owo",
    ],
  },

  {
    name: "Osun",
    lgas: [
      "Atakunmosa East",
      "Atakunmosa West",
      "Aiyedaade",
      "Aiyedire",
      "Boluwaduro",
      "Boripe",
      "Ede North",
      "Ede South",
      "Egbedore",
      "Ejigbo",
      "Ife Central",
      "Ife East",
      "Ife North",
      "Ife South",
      "Ifedayo",
      "Ila",
      "Ilesa East",
      "Ilesa West",
      "Irepodun",
      "Irewole",
      "Isokan",
      "Iwo",
      "Obokun",
      "Odo Otin",
      "Ola Oluwa",
      "Olorunda",
      "Oriade",
      "Orolu",
      "Osogbo",
    ],
  },

  {
    name: "Oyo",
    lgas: [
      "Afijio",
      "Akinyele",
      "Atiba",
      "Atisbo",
      "Egbeda",
      "Ibadan North",
      "Ibadan North-East",
      "Ibadan North-West",
      "Ibadan South-East",
      "Ibadan South-West",
      "Ibarapa Central",
      "Ibarapa East",
      "Ibarapa North",
      "Ido",
      "Irepo",
      "Iseyin",
      "Itesiwaju",
      "Iwajowa",
      "Kajola",
      "Lagelu",
      "Ogbomosho North",
      "Ogbomosho South",
      "Ogo Oluwa",
      "Olorunsogo",
      "Oluyole",
      "Ona Ara",
      "Orelope",
      "Ori Ire",
      "Oyo East",
      "Oyo West",
      "Saki East",
      "Saki West",
      "Surulere",
    ],
  },

  {
    name: "Plateau",
    lgas: [
      "Barkin Ladi",
      "Bassa",
      "Bokkos",
      "Jos East",
      "Jos North",
      "Jos South",
      "Kanam",
      "Kanke",
      "Langtang North",
      "Langtang South",
      "Mangu",
      "Mikang",
      "Pankshin",
      "Qua'an Pan",
      "Riyom",
      "Shendam",
      "Wase",
    ],
  },

  {
    name: "Rivers",
    lgas: [
      "Abua/Odual",
      "Ahoada East",
      "Ahoada West",
      "Akuku-Toru",
      "Andoni",
      "Asari-Toru",
      "Bonny",
      "Degema",
      "Eleme",
      "Emohua",
      "Etche",
      "Gokana",
      "Ikwerre",
      "Khana",
      "Obio/Akpor",
      "Ogba/Egbema/Ndoni",
      "Ogu/Bolo",
      "Okrika",
      "Omuma",
      "Opobo/Nkoro",
      "Oyigbo",
      "Port Harcourt",
      "Tai",
    ],
  },

  {
    name: "Sokoto",
    lgas: [
      "Binji",
      "Bodinga",
      "Dange Shuni",
      "Gada",
      "Goronyo",
      "Gudu",
      "Gwadabawa",
      "Illela",
      "Isa",
      "Kebbe",
      "Kware",
      "Rabah",
      "Sabon Birni",
      "Shagari",
      "Silame",
      "Sokoto North",
      "Sokoto South",
      "Tambuwal",
      "Tangaza",
      "Tureta",
      "Wamakko",
      "Wurno",
      "Yabo",
    ],
  },

  {
    name: "Taraba",
    lgas: [
      "Ardo Kola",
      "Bali",
      "Donga",
      "Gashaka",
      "Gassol",
      "Ibi",
      "Jalingo",
      "Karim Lamido",
      "Kumi",
      "Lau",
      "Sardauna",
      "Takum",
      "Ussa",
      "Wukari",
      "Yorro",
      "Zing",
    ],
  },

  {
    name: "Yobe",
    lgas: [
      "Bade",
      "Bursari",
      "Damaturu",
      "Fika",
      "Fune",
      "Geidam",
      "Gujba",
      "Gulani",
      "Jakusko",
      "Karasuwa",
      "Machina",
      "Nangere",
      "Nguru",
      "Potiskum",
      "Tarmuwa",
      "Yunusari",
      "Yusufari",
    ],
  },

  {
    name: "Zamfara",
    lgas: [
      "Anka",
      "Bakura",
      "Birnin Magaji/Kiyaw",
      "Bungudu",
      "Bukkuyum",
      "Chafe",
      "Gummi",
      "Gusau",
      "Kaura Namoda",
      "Maradun",
      "Maru",
      "Shinkafi",
      "Talata Mafara",
      "Tsafe",
      "Zurmi",
    ],
  },

  {
    name: "Federal Capital Territory",
    lgas: [
      "Abaji",
      "Bwari",
      "Gwagwalada",
      "Kuje",
      "Kwali",
      "Municipal Area Council",
    ],
  },
];

/* =========================================================
   NAVBAR
========================================================= */

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [getInvolvedOpen, setGetInvolvedOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Programs", path: "/programs" },
    { name: "Projects", path: "/projects" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact Us", path: "/contact" },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setGetInvolvedOpen(false);
  };

  const openForm = (form: FormType) => {
    setMenuOpen(false);
    setGetInvolvedOpen(false);
    setSelectedForm(form);
  };

  return (
    <>
      {/* ================= DESKTOP / MAIN NAVBAR ================= */}

      <header className="sticky top-0 z-50 w-full border-b border-emerald-900/10 bg-white shadow-sm">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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

            {/* ================= GET INVOLVED DROPDOWN ================= */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setGetInvolvedOpen((open) => !open)
                }
                aria-expanded={getInvolvedOpen}
                aria-haspopup="menu"
                className={`group relative flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  getInvolvedOpen
                    ? "bg-[#1B4332] text-white shadow-sm"
                    : "bg-emerald-50 text-slate-800 hover:bg-emerald-100 hover:text-[#1B4332]"
                }`}
              >
                <span>Get Involved</span>

                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    getInvolvedOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="m6 9 6 6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span
                  className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-[#D4AF37] transition-all duration-200 ${
                    getInvolvedOpen
                      ? "opacity-100"
                      : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                  }`}
                />
              </button>

              {getInvolvedOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-56 overflow-hidden rounded-2xl border border-emerald-900/10 bg-white p-2 shadow-2xl">
                  <NavLink
                    to="/membership"
                    onClick={() => setGetInvolvedOpen(false)}
                    className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-[#1B4332]"
                  >
                    <span>Membership</span>

                    <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => openForm("Support")}
                    className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-[#1B4332]"
                  >
                    <span>Support</span>

                    <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openForm("Partnership")}
                    className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-[#1B4332]"
                  >
                    <span>Partnership</span>

                    <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-emerald-900/10 bg-emerald-50 text-[#1B4332] transition hover:bg-emerald-100 lg:hidden"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* ================= MOBILE DRAWER ================= */}

      <aside
        className={`fixed right-0 top-0 z-[70] h-screen w-[62vw] max-w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b border-emerald-900/10 px-3 py-3">
            <NavLink
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-1.5"
            >
              <img
                src={logo}
                alt="ASBESOC Nigeria Logo"
                className="h-11 w-auto max-w-[92px] object-contain"
              />

              <div className="leading-tight">
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
              aria-label="Close navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#1B4332] hover:bg-emerald-50"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 overflow-y-auto px-3">
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
                      : "bg-emerald-50 text-slate-800 hover:bg-emerald-100"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* MOBILE GET INVOLVED */}

            <div>
              <button
                type="button"
                onClick={() =>
                  setGetInvolvedOpen((open) => !open)
                }
                className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-[13px] font-bold ${
                  getInvolvedOpen
                    ? "bg-[#1B4332] text-white"
                    : "bg-emerald-50 text-slate-800 hover:bg-emerald-100"
                }`}
              >
                <span>Get Involved</span>

                <span
                  className={`transition-transform ${
                    getInvolvedOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {getInvolvedOpen && (
                <div className="mt-1.5 space-y-1 rounded-xl bg-emerald-50 p-1.5">
                  <NavLink
                    to="/membership"
                    onClick={closeMenu}
                    className="flex min-h-[42px] items-center rounded-lg px-3 text-[12px] font-bold text-slate-700 hover:bg-white hover:text-[#1B4332]"
                  >
                    Membership
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => openForm("Support")}
                    className="flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-[12px] font-bold text-slate-700 hover:bg-white hover:text-[#1B4332]"
                  >
                    Support
                  </button>

                  <button
                    type="button"
                    onClick={() => openForm("Partnership")}
                    className="flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-[12px] font-bold text-slate-700 hover:bg-white hover:text-[#1B4332]"
                  >
                    Partnership
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="border-t border-emerald-900/10 px-3 py-3 text-center">
            <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#1B4332]">
              ASBESOC NIGERIA
            </p>
          </div>
        </div>
      </aside>

      {/* ================= FORM SYSTEM ================= */}

      {selectedForm && (
        <DemoForm
          type={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
    </>
  );
}

/* =========================================================
   MAIN FORM SYSTEM
========================================================= */

type DemoFormProps = {
  type: FormType;
  onClose: () => void;
};

function DemoForm({ type, onClose }: DemoFormProps) {
  const isSupport = type === "Support";

  const [supportCategory, setSupportCategory] =
    useState<SupportCategory>("Financial Support");

  const [anonymous, setAnonymous] = useState(false);

  const [selectedState, setSelectedState] = useState("");

  const [selectedLga, setSelectedLga] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const selectedStateData = useMemo(
    () =>
      nigeriaStates.find(
        (state) => state.name === selectedState
      ),
    [selectedState]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleStateChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedState(event.target.value);
    setSelectedLga("");
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SuccessScreen
        type={type}
        supportCategory={supportCategory}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] h-screen w-screen overflow-y-auto bg-[#f5f8f5]">
      {/* TOP BAR */}

      <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B4332] text-xs font-black text-white">
              {isSupport ? "01" : "02"}
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500">
                ASBESOC Nigeria
              </p>

              <p className="text-xs font-bold text-[#1B4332]">
                {isSupport
                  ? "Support & Contribution"
                  : "Partnership Enquiry"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B4332] text-2xl text-white transition hover:bg-amber-400 hover:text-[#163d31]"
          >
            ×
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {isSupport ? (
          <SupportIntroduction
            category={supportCategory}
            onCategoryChange={setSupportCategory}
          />
        ) : (
          <section className="rounded-[2rem] bg-[#063b25] px-6 py-10 shadow-xl sm:px-10 sm:py-14">
            <span className="inline-flex rounded-full border border-amber-400/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              Work With ASBESOC
            </span>

            <h1 className="mt-5 text-3xl font-black leading-tight text-white sm:text-5xl">
              Partnership Enquiry
            </h1>

            <div className="mt-5 h-1 w-16 rounded-full bg-amber-400" />

            <p className="mt-6 max-w-2xl text-sm leading-8 text-emerald-50/80 sm:text-base">
              ASBESOC welcomes responsible partnerships with
              organizations, institutions, businesses and
              stakeholders that share a commitment to peaceful
              communities, empowerment and sustainable development.
            </p>
          </section>
        )}

        {/* ================= FORM ================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-6 shadow-xl sm:p-10"
        >
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
              {isSupport
                ? "Support Request"
                : "Partnership Enquiry"}
            </span>

            <h2 className="mt-2 text-2xl font-black text-[#1B4332] sm:text-3xl">
              {isSupport
                ? "Tell us how you would like to support"
                : "Tell us about your organization"}
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {isSupport
                ? "Complete the form below so the ASBESOC team can understand your proposed support and the community context involved."
                : "Share your organization details and the kind of partnership you would like to explore with ASBESOC."}
            </p>
          </div>

          {/* SUPPORT CATEGORY */}

          {isSupport && (
            <div className="mb-8 rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5">
              <label className="mb-3 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                Support Category
              </label>

              <select
                value={supportCategory}
                onChange={(event) =>
                  setSupportCategory(
                    event.target.value as SupportCategory
                  )
                }
                className="w-full rounded-xl border border-emerald-900/10 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10"
              >
                <option>Financial Support</option>
                <option>Materials / Resources</option>
                <option>Volunteer Support</option>
                <option>Community Support</option>
                <option>Other</option>
              </select>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {/* FULL NAME */}

            {(!anonymous || !isSupport) && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  required={!anonymous || !isSupport}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#1B4332] focus:bg-white focus:ring-2 focus:ring-[#1B4332]/10"
                />
              </div>
            )}

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#1B4332] focus:bg-white focus:ring-2 focus:ring-[#1B4332]/10"
              />
            </div>

            {/* PHONE */}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter your phone number"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#1B4332] focus:bg-white focus:ring-2 focus:ring-[#1B4332]/10"
              />
            </div>

            {/* STATE */}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                State
              </label>

              <select
                value={selectedState}
                onChange={handleStateChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#1B4332] focus:bg-white"
              >
                <option value="">Select your state</option>

                {nigeriaStates.map((state) => (
                  <option key={state.name} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* LGA */}

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                Local Government Area
              </label>

              <select
                value={selectedLga}
                onChange={(event) =>
                  setSelectedLga(event.target.value)
                }
                required
                disabled={!selectedStateData}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#1B4332] focus:bg-white"
              >
                <option value="">
                  {selectedStateData
                    ? "Select your LGA"
                    : "Select state first"}
                </option>

                {selectedStateData?.lgas.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>

            {/* ANONYMOUS */}

            {isSupport && (
              <div className="sm:col-span-2">
                <div className="flex items-start gap-4 rounded-2xl border border-emerald-900/10 bg-slate-50 p-5">
                  <input
                    id="anonymous-support"
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) =>
                      setAnonymous(event.target.checked)
                    }
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-[#1B4332] focus:ring-[#1B4332]"
                  />

                  <div>
                    <label
                      htmlFor="anonymous-support"
                      className="cursor-pointer text-sm font-black text-[#1B4332]"
                    >
                      I would like to remain anonymous
                    </label>

                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Select this option if you do not want your
                      name displayed with your support request.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL AMOUNT */}

            {isSupport &&
              supportCategory === "Financial Support" && (
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                    Intended Support Amount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#1B4332]">
                      ₦
                    </span>

                    <input
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm outline-none focus:border-[#1B4332] focus:bg-white"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400">
                    Demonstration only. No real payment will be
                    processed.
                  </p>
                </div>
              )}

            {/* PARTNERSHIP ORGANIZATION */}

            {!isSupport && (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Organization / Company
                </label>

                <input
                  type="text"
                  placeholder="Enter organization name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#1B4332] focus:bg-white"
                />
              </div>
            )}

            {/* MESSAGE */}

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                Message
              </label>

              <textarea
                rows={6}
                placeholder={
                  isSupport
                    ? "Tell ASBESOC more about the support you would like to provide..."
                    : "Tell us about your organization and the partnership you have in mind..."
                }
                required
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-7 outline-none focus:border-[#1B4332] focus:bg-white"
              />
            </div>
          </div>

          {/* SUBMIT */}

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              Demonstration form — information is not connected
              to a live database yet.
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B4332] px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
            >
              {isSupport
                ? "Submit Support Request"
                : "Submit Partnership Enquiry"}

              <span>→</span>
            </button>
          </div>
        </form>

        <div className="flex justify-center py-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#1B4332] px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
          >
            ← Back to ASBESOC
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SUPPORT INTRODUCTION
========================================================= */

type SupportIntroductionProps = {
  category: SupportCategory;
  onCategoryChange: (category: SupportCategory) => void;
};

function SupportIntroduction({
  category,
  onCategoryChange,
}: SupportIntroductionProps) {
  return (
    <>
      <section className="overflow-hidden rounded-[2rem] bg-[#063b25] shadow-xl">
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <span className="inline-flex rounded-full border border-amber-400/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            Support ASBESOC
          </span>

          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
            Your support helps strengthen communities and
            create lasting positive change.
          </h1>

          <div className="mt-6 h-1 w-16 rounded-full bg-amber-400" />

          <p className="mt-6 max-w-3xl text-sm leading-8 text-emerald-50/80 sm:text-base">
            ASBESOC works with communities, individuals,
            institutions, development organizations and
            partners to promote peace, empowerment, positive
            behavioural change, capacity building and
            sustainable community development.
          </p>
        </div>

        <div className="grid border-t border-white/10 sm:grid-cols-3">
          <SupportStat
            number="01"
            title="Empower"
            text="Support initiatives that help people build skills, confidence and opportunity."
          />

          <SupportStat
            number="02"
            title="Transform"
            text="Contribute to programmes focused on positive behavioural and social change."
          />

          <SupportStat
            number="03"
            title="Build"
            text="Help communities develop practical and sustainable solutions to social challenges."
          />
        </div>
      </section>

      {/* WAYS TO SUPPORT */}

      <section className="mt-8">
        <div className="mb-6">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
            Ways You Can Help
          </span>

          <h2 className="mt-2 text-2xl font-black text-[#1B4332] sm:text-3xl">
            Choose how you would like to support
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            Every form of support can contribute to stronger
            communities. Select a category below to see what
            your support could mean.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SupportCategoryCard
            number="01"
            title="Financial Support"
            description="Provide financial assistance that can help strengthen approved programmes, community initiatives, empowerment activities and capacity building."
            active={category === "Financial Support"}
            onClick={() =>
              onCategoryChange("Financial Support")
            }
          />

          <SupportCategoryCard
            number="02"
            title="Materials & Resources"
            description="Support ASBESOC with useful educational, programme, community-development or operational resources."
            active={category === "Materials / Resources"}
            onClick={() =>
              onCategoryChange("Materials / Resources")
            }
          />

          <SupportCategoryCard
            number="03"
            title="Volunteer Support"
            description="Offer your time, professional skills, knowledge or practical assistance to suitable ASBESOC initiatives."
            active={category === "Volunteer Support"}
            onClick={() =>
              onCategoryChange("Volunteer Support")
            }
          />

          <SupportCategoryCard
            number="04"
            title="Community Support"
            description="Support community-led activities through participation, mobilization, resources and practical assistance."
            active={category === "Community Support"}
            onClick={() =>
              onCategoryChange("Community Support")
            }
          />
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-emerald-900/10 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
                Selected Support
              </p>

              <h3 className="mt-1 text-xl font-black text-[#1B4332]">
                {category}
              </h3>
            </div>

            <div className="rounded-full bg-emerald-50 px-5 py-2.5 text-xs font-bold text-[#1B4332]">
              Complete the form below
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   SUPPORT STAT
========================================================= */

type SupportStatProps = {
  number: string;
  title: string;
  text: string;
};

function SupportStat({
  number,
  title,
  text,
}: SupportStatProps) {
  return (
    <div className="border-white/10 px-6 py-6 sm:border-r sm:px-8 last:border-r-0">
      <span className="text-xs font-black tracking-[0.2em] text-amber-300">
        {number}
      </span>

      <h3 className="mt-2 text-lg font-black text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-emerald-50/70">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   SUPPORT CATEGORY CARD
========================================================= */

type SupportCategoryCardProps = {
  number: string;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

function SupportCategoryCard({
  number,
  title,
  description,
  active,
  onClick,
}: SupportCategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-[1.75rem] border p-6 text-left shadow-lg transition-all duration-200 hover:-translate-y-1 ${
        active
          ? "border-[#1B4332] bg-[#1B4332] text-white shadow-xl"
          : "border-emerald-900/10 bg-white text-slate-800 hover:border-[#1B4332]/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black ${
            active
              ? "bg-amber-400 text-[#163d31]"
              : "bg-emerald-50 text-[#1B4332]"
          }`}
        >
          {number}
        </div>

        <span
          className={`text-xl transition-transform group-hover:translate-x-1 ${
            active ? "text-amber-300" : "text-[#1B4332]"
          }`}
        >
          →
        </span>
      </div>

      <h3
        className={`mt-6 text-xl font-black ${
          active ? "text-white" : "text-[#1B4332]"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-7 ${
          active ? "text-emerald-50/75" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

/* =========================================================
   SUCCESS SCREEN
========================================================= */

type SuccessScreenProps = {
  type: FormType;
  supportCategory: SupportCategory;
  onClose: () => void;
};

function SuccessScreen({
  type,
  supportCategory,
  onClose,
}: SuccessScreenProps) {
  const isSupport = type === "Support";

  return (
    <div className="fixed inset-0 z-[99999] h-screen w-screen overflow-y-auto bg-[#f5f8f5]">
      <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="ASBESOC Nigeria Logo"
              className="h-11 w-auto max-w-[95px] object-contain"
            />

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500">
                ASBESOC Nigeria
              </p>

              <p className="text-xs font-bold text-[#1B4332]">
                Submission Confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* SUCCESS */}

        <section className="overflow-hidden rounded-[2rem] bg-[#063b25] text-center shadow-2xl">
          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-[#1B4332]">
              ✓
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Request Submitted Successfully
            </p>

            <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              Thank you for getting involved.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-emerald-50/80 sm:text-base">
              {isSupport
                ? `Your ${supportCategory.toLowerCase()} support request has been recorded as a demonstration submission.`
                : "Your partnership enquiry has been recorded as a demonstration submission."}
            </p>
          </div>
        </section>

        {/* SUPPORT-SPECIFIC NEXT STEPS */}

        {isSupport && (
          <SupportNextSteps category={supportCategory} />
        )}

        {/* PARTNERSHIP NEXT STEPS */}

        {!isSupport && (
          <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
              Next Steps
            </span>

            <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
              Partnership enquiry received
            </h2>

            <p className="mt-4 text-sm leading-8 text-slate-500">
              In the live version of the website, this
              information would be securely delivered to the
              appropriate ASBESOC team for review and
              follow-up.
            </p>

            <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm leading-7 text-[#1B4332]">
              <strong>Demo notice:</strong> No information has
              been sent to a live database yet.
            </div>
          </section>
        )}

        <div className="flex justify-center py-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#1B4332] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
          >
            ← Return to ASBESOC
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   CATEGORY-SPECIFIC SUPPORT DETAILS
========================================================= */

function SupportNextSteps({
  category,
}: {
  category: SupportCategory;
}) {
  /* FINANCIAL */

  if (category === "Financial Support") {
    return (
      <section className="mt-8 rounded-[2rem] border border-amber-200 bg-white p-7 shadow-xl sm:p-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
          Financial Support
        </span>

        <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
          Mock contribution details
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          In the live ASBESOC website, approved financial
          support instructions would appear here. The details
          below are deliberately marked as demonstration
          information and are not real payment instructions.
        </p>

        <div className="mt-7 rounded-[1.5rem] bg-[#063b25] p-6 text-white sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                Bank
              </p>

              <p className="mt-2 text-lg font-black">
                ASBESOC DEMO BANK
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                Account Name
              </p>

              <p className="mt-2 text-lg font-black">
                ASBESOC NIGERIA — DEMO
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                Account Number
              </p>

              <p className="mt-2 text-xl font-black tracking-wider">
                0000000000
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-300">
                Reference
              </p>

              <p className="mt-2 text-lg font-black">
                ASBESOC-SUPPORT-DEMO
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="text-xs leading-6 text-emerald-50/70">
              ⚠ DEMONSTRATION ONLY — The bank, account name,
              account number and reference above are mock data.
              Do not transfer money using these details.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* MATERIALS */

  if (category === "Materials / Resources") {
    return (
      <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
          Materials & Resources
        </span>

        <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
          Thank you for offering practical resources
        </h2>

        <p className="mt-4 text-sm leading-8 text-slate-500">
          In the live version, the ASBESOC team would provide
          appropriate delivery, verification and coordination
          instructions for the resources being offered.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <InfoBox
            title="Educational"
            text="Training materials, books and learning resources."
          />

          <InfoBox
            title="Programme"
            text="Resources that can support approved community activities."
          />

          <InfoBox
            title="Equipment"
            text="Useful equipment and practical community resources."
          />
        </div>
      </section>
    );
  }

  /* VOLUNTEER */

  if (category === "Volunteer Support") {
    return (
      <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
          Volunteer Support
        </span>

        <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
          Your skills can make a difference
        </h2>

        <p className="mt-4 text-sm leading-8 text-slate-500">
          The next stage of the live system can connect
          suitable volunteers with programmes based on their
          skills, interests, availability and location.
        </p>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-6">
          <p className="text-sm font-bold leading-7 text-[#1B4332]">
            Demo next step: ASBESOC would review the volunteer
            request and contact the applicant with suitable
            opportunities.
          </p>
        </div>
      </section>
    );
  }

  /* COMMUNITY */

  if (category === "Community Support") {
    return (
      <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
          Community Support
        </span>

        <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
          Community support request received
        </h2>

        <p className="mt-4 text-sm leading-8 text-slate-500">
          In the live system, community support requests could
          be reviewed according to the needs described,
          available programmes and relevant ASBESOC
          partnerships.
        </p>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-6">
          <p className="text-sm font-bold leading-7 text-[#1B4332]">
            Demo next step: the relevant ASBESOC team would
            review the request and determine the appropriate
            follow-up.
          </p>
        </div>
      </section>
    );
  }

  /* OTHER */

  return (
    <section className="mt-8 rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
        Support Request
      </span>

      <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
        Your message has been received
      </h2>

      <p className="mt-4 text-sm leading-8 text-slate-500">
        Thank you for offering to support ASBESOC. In the
        live version, your request would be reviewed and
        directed to the appropriate team.
      </p>
    </section>
  );
}

/* =========================================================
   INFORMATION BOX
========================================================= */

function InfoBox({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-emerald-50 p-5">
      <h3 className="font-black text-[#1B4332]">{title}</h3>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

export default Navbar;