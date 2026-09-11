import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
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

const supportTypes = [
  "Financial Support",
  "Material / Equipment",
  "Technical Expertise",
  "Training / Professional Services",
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

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [getInvolvedOpen, setGetInvolvedOpen] = useState(false);
  const [selectedForm, setSelectedForm] =
    useState<FormType | null>(null);

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

          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
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
                type="button"
                onClick={() =>
                  setGetInvolvedOpen((open) => !open)
                }
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  getInvolvedOpen
                    ? "bg-[#1B4332] text-white"
                    : "bg-emerald-50 text-slate-800 hover:bg-emerald-100"
                }`}
              >
                Get Involved
                <span
                  className={`transition ${
                    getInvolvedOpen ? "rotate-180" : ""
                  }`}
                >
                  ↓
                </span>
              </button>

              {getInvolvedOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-56 rounded-2xl border border-emerald-900/10 bg-white p-2 shadow-2xl">
                  <NavLink
                    to="/membership"
                    onClick={() =>
                      setGetInvolvedOpen(false)
                    }
                    className="flex justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50"
                  >
                    Membership <span>→</span>
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => openForm("Support")}
                    className="flex w-full justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50"
                  >
                    Support <span>→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openForm("Partnership")}
                    className="flex w-full justify-between rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-emerald-50"
                  >
                    Partnership <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#1B4332] lg:hidden"
            aria-label="Open menu"
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

      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-[60] bg-black/30 transition lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
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
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#1B4332]"
            >
              ✕
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
                      : "bg-emerald-50 text-slate-800"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() =>
                setGetInvolvedOpen((open) => !open)
              }
              className={`flex min-h-[44px] items-center justify-between rounded-xl px-3 text-[13px] font-bold ${
                getInvolvedOpen
                  ? "bg-[#1B4332] text-white"
                  : "bg-emerald-50 text-slate-800"
              }`}
            >
              Get Involved <span>↓</span>
            </button>

            {getInvolvedOpen && (
              <div className="space-y-1 rounded-xl bg-emerald-50 p-1.5">
                <NavLink
                  to="/membership"
                  onClick={closeMenu}
                  className="flex min-h-[42px] items-center rounded-lg px-3 text-xs font-bold"
                >
                  Membership
                </NavLink>

                <button
                  type="button"
                  onClick={() => openForm("Support")}
                  className="flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-xs font-bold"
                >
                  Support
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openForm("Partnership")
                  }
                  className="flex min-h-[42px] w-full items-center rounded-lg px-3 text-left text-xs font-bold"
                >
                  Partnership
                </button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {selectedForm && (
        <GetInvolvedForm
          type={selectedForm}
          onClose={() => setSelectedForm(null)}
        />
      )}
    </>
  );
}

type GetInvolvedFormProps = {
  type: FormType;
  onClose: () => void;
};

function GetInvolvedForm({
  type,
  onClose,
}: GetInvolvedFormProps) {
  const isSupport = type === "Support";

  const [country, setCountry] = useState("");
  const [selectedState, setSelectedState] =
    useState("");
  const [selectedLga, setSelectedLga] =
    useState("");
  const [supportType, setSupportType] =
    useState("Financial Support");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [submitError, setSubmitError] =
    useState("");

  const isNigeria =
    country.trim().toLowerCase() === "nigeria";

  const selectedStateData = useMemo(
    () =>
      nigeriaStates.find(
        (state) => state.name === selectedState
      ),
    [selectedState]
  );

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  const changeCountry = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCountry(event.target.value);
    setSelectedState("");
    setSelectedLga("");
  };

  const changeState = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedState(event.target.value);
    setSelectedLga("");
  };

  const submitForm = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const value = (name: string) =>
      String(formData.get(name) ?? "").trim();

    try {
      if (isSupport) {
        await submitSupport({
          fullNameOrOrganization: anonymous
            ? ""
            : value("fullNameOrOrganization"),
          email: value("email"),
          phone: value("phone"),
          supportType: value("supportType"),
          anonymous,
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

          supportDescription: value(
            "supportDescription"
          ),
          message: value("message"),
        });
      } else {
        await submitPartnership({
          organization: value("organization"),
          organizationType: value(
            "organizationType"
          ),
          contactPerson: value("contactPerson"),
          jobTitle: value("jobTitle"),
          email: value("email"),
          phone: value("phone"),
          website: value("website"),
          nationality: value("nationality"),
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

          areasOfInterest: formData
            .getAll("areasOfInterest")
            .map((item) => String(item)),

          partnershipMethods: formData
            .getAll("partnershipMethod")
            .map((item) => String(item)),

          message: value("message"),
        });
      }

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        `${type} submission failed:`,
        error
      );

      setSubmitError(
        isSupport
          ? "We could not submit your support request. Please check your internet connection and try again."
          : "We could not submit your partnership request. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#f2f7f3]">
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
          <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-2xl">
            <div className="bg-[#063b25] px-6 py-12 text-center sm:px-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-2xl font-black text-[#163d31]">
                ✓
              </div>

              <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                ASBESOC Nigeria
              </p>

              <h2 className="mt-3 break-words text-3xl font-black text-white sm:text-4xl">
                {isSupport
                  ? "Thank you for supporting our work."
                  : "Thank you for your partnership interest."}
              </h2>

              <p className="mx-auto mt-5 max-w-xl break-words text-sm leading-7 text-emerald-50/80">
                {isSupport
                  ? "Your support request has been submitted successfully. ASBESOC will review your information and contact you when necessary."
                  : "Your partnership request has been submitted successfully. ASBESOC will review your information and contact you when necessary."}
              </p>
            </div>

            <div className="px-6 py-7 text-center sm:px-10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#1B4332] px-7 py-3.5 text-sm font-black text-white transition hover:bg-amber-400 hover:text-[#163d31]"
              >
                Return to ASBESOC
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] overflow-x-hidden overflow-y-auto bg-[#f3f7f3]">
      <div className="sticky top-0 z-50 border-b border-emerald-900/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">
              Get Involved
            </p>

            <p className="mt-1 truncate text-sm font-black text-[#1B4332] sm:text-base">
              {isSupport
                ? "Support Our Work"
                : "Partner With Us"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-900/10 bg-emerald-50 text-xl font-bold text-[#1B4332] transition hover:bg-[#1B4332] hover:text-white"
            aria-label="Close form"
          >
            ×
          </button>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#063b25] px-5 py-10 shadow-2xl sm:px-10 sm:py-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10" />
          <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-emerald-300/10" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex rounded-full border border-amber-300/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              Be Part of the Change
            </span>

            <h1 className="mt-5 break-words text-3xl font-black leading-tight text-white sm:text-5xl">
              {isSupport
                ? "Support Our Work"
                : "Partner With Us"}
            </h1>

            <div className="mt-4 h-1 w-16 rounded-full bg-amber-400" />

            <p className="mt-6 max-w-2xl break-words text-sm leading-7 text-emerald-50/80 sm:text-base">
              {isSupport
                ? "Help ASBESOC expand programmes, strengthen communities and reach more individuals through meaningful support."
                : "Collaborate with ASBESOC to develop practical, sustainable solutions that strengthen people and communities."}
            </p>
          </div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoStrip
            title={
              isSupport
                ? "Direct Impact"
                : "Shared Purpose"
            }
            text={
              isSupport
                ? "Support that contributes to real programmes and community initiatives."
                : "Work with us around common development goals."
            }
          />

          <InfoStrip
            title={
              isSupport
                ? "Flexible Support"
                : "International Reach"
            }
            text={
              isSupport
                ? "Financial, material, technical and professional support are welcome."
                : "Partnership opportunities are open to organizations locally and internationally."
            }
          />

          <InfoStrip
            title="Responsible Engagement"
            text="Information submitted will be reviewed for relevant ASBESOC engagement."
          />
        </section>

        <form
          onSubmit={submitForm}
          className="mt-6 w-full min-w-0 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-xl"
        >
          <div className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-5 py-6 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              {isSupport
                ? "Support Information"
                : "Partnership Information"}
            </p>

            <h2 className="mt-2 break-words text-2xl font-black text-[#1B4332]">
              {isSupport
                ? "Tell us how you would like to support"
                : "Tell us about your organization"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Complete the information below. Fields are
              designed to accommodate both Nigerian and
              international participants.
            </p>
          </div>

          <div className="p-4 sm:p-8">
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
              {isSupport ? (
                <>
                  {!anonymous && (
                    <TextField
                      label="Full Name / Organization Name"
                      name="fullNameOrOrganization"
                      placeholder="Enter your name or organization"
                      required
                    />
                  )}

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />

                  <TextField
                    label="Contact Number"
                    name="phone"
                    type="tel"
                    placeholder="+234..."
                    required
                  />

                  <SelectField
                    label="Type of Support"
                    name="supportType"
                    options={supportTypes}
                    value={supportType}
                    onChange={setSupportType}
                    required
                  />

                  <div className="min-w-0 sm:col-span-2">
                    <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4 transition hover:bg-emerald-50">
                      <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(event) =>
                          setAnonymous(
                            event.target.checked
                          )
                        }
                        className="mt-1 h-4 w-4 shrink-0"
                      />

                      <span className="min-w-0">
                        <span className="block break-words text-sm font-black text-[#1B4332]">
                          I would like to remain anonymous
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          Your personal name will not be
                          displayed publicly as part of the
                          support.
                        </span>
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <TextField
                    label="Organization / Institution Name"
                    name="organization"
                    placeholder="Enter organization name"
                    required
                  />

                  <SelectField
                    label="Type of Organization"
                    name="organizationType"
                    options={organizationTypes}
                    required
                  />

                  <TextField
                    label="Contact Person"
                    name="contactPerson"
                    placeholder="Enter contact person's name"
                    required
                  />

                  <TextField
                    label="Position / Job Title"
                    name="jobTitle"
                    placeholder="Enter position"
                    required
                  />

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="contact@example.com"
                    required
                  />

                  <TextField
                    label="Contact Number"
                    name="phone"
                    type="tel"
                    placeholder="+234..."
                    required
                  />

                  <TextField
                    label="Website / Social Media"
                    name="website"
                    placeholder="Website or social media link"
                  />

                  <TextField
                    label="Nationality"
                    name="nationality"
                    placeholder="Enter nationality"
                  />
                </>
              )}

              <div className="min-w-0">
                <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={country}
                  onChange={changeCountry}
                  placeholder="e.g. Nigeria"
                  required
                  className="form-input box-border w-full min-w-0 max-w-full"
                />
              </div>

              {isNigeria ? (
                <>
                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      State
                    </label>

                    <select
                      name="state"
                      value={selectedState}
                      onChange={changeState}
                      required
                      className="form-input box-border w-full min-w-0 max-w-full"
                    >
                      <option value="">
                        Select state
                      </option>

                      {nigeriaStates.map((state) => (
                        <option
                          key={state.name}
                          value={state.name}
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      Local Government Area
                    </label>

                    <select
                      name="lga"
                      value={selectedLga}
                      onChange={(event) =>
                        setSelectedLga(
                          event.target.value
                        )
                      }
                      disabled={!selectedStateData}
                      required
                      className="form-input box-border w-full min-w-0 max-w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {selectedStateData
                          ? "Select LGA"
                          : "Select state first"}
                      </option>

                      {selectedStateData?.lgas.map(
                        (lga) => (
                          <option
                            key={lga}
                            value={lga}
                          >
                            {lga}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </>
              ) : country.trim() ? (
                <>
                  <TextField
                    label="State / Province / Region"
                    name="region"
                    placeholder="Enter state, province or region"
                    required
                  />

                  <TextField
                    label="City / District"
                    name="city"
                    placeholder="Enter city or district"
                    required
                  />
                </>
              ) : null}

              {isSupport && (
                <>
                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      Amount / Description of Support
                    </label>

                    <textarea
                      name="supportDescription"
                      rows={4}
                      required
                      placeholder={
                        supportType ===
                        "Financial Support"
                          ? "Enter amount and currency..."
                          : "Describe the support you would like to provide..."
                      }
                      className="form-input box-border w-full min-w-0 max-w-full resize-none"
                    />
                  </div>

                  {supportType ===
                    "Financial Support" && (
                    <div className="min-w-0 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-[#163d31]">
                          ₦
                        </div>

                        <div className="min-w-0">
                          <p className="break-words text-xs font-black uppercase tracking-[0.14em] text-amber-700">
                            Financial Support Payment
                            Details
                          </p>

                          <h3 className="mt-2 break-words text-base font-black text-[#1B4332]">
                            Official account details will
                            appear here.
                          </h3>

                          <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                            This section is reserved only
                            for verified ASBESOC financial
                            support payment or bank
                            details. The final account
                            information can be added later
                            without changing the rest of
                            the form.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      Additional Message
                    </label>

                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Add any additional information..."
                      className="form-input box-border w-full min-w-0 max-w-full resize-none"
                    />
                  </div>
                </>
              )}

              {!isSupport && (
                <>
                  <CheckboxGroup
                    title="Area(s) of Interest"
                    name="areasOfInterest"
                    options={partnershipInterests}
                  />

                  <CheckboxGroup
                    title="How would you like to partner with ASBESOC?"
                    name="partnershipMethod"
                    options={partnershipMethods}
                  />

                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      Additional Information
                    </label>

                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us anything else that may help us understand the partnership opportunity..."
                      className="form-input box-border w-full min-w-0 max-w-full resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-emerald-900/10 pt-7">
              {submitError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-sm font-bold text-red-700">
                    {submitError}
                  </p>
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 max-w-2xl break-words text-xs leading-5 text-slate-500">
                  Your information will be reviewed by
                  ASBESOC for the purpose of responding
                  to your request and determining the
                  appropriate next steps.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full shrink-0 rounded-full bg-[#1B4332] px-7 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-400 hover:text-[#163d31] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : isSupport
                      ? "Submit Support Request →"
                      : "Submit Partnership Request →"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <p className="px-4 py-8 text-center text-xs leading-6 text-slate-400">
          Building a peaceful, empowered and better society
          requires collective action.
        </p>
      </main>
    </div>
  );
}

type InfoStripProps = {
  title: string;
  text: string;
};

function InfoStrip({
  title,
  text,
}: InfoStripProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-emerald-900/10 bg-white px-4 py-4 shadow-sm">
      <div className="mb-3 h-1 w-10 rounded-full bg-amber-400" />

      <h3 className="break-words text-sm font-black text-[#1B4332]">
        {title}
      </h3>

      <p className="mt-2 break-words text-xs leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function TextField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: TextFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="form-input box-border w-full min-w-0 max-w-full"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

function SelectField({
  label,
  name,
  options,
  required = false,
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        defaultValue={
          value === undefined ? "" : undefined
        }
        onChange={
          onChange
            ? (event) =>
                onChange(event.target.value)
            : undefined
        }
        required={required}
        className="form-input box-border w-full min-w-0 max-w-full"
      >
        {value === undefined && (
          <option value="" disabled>
            Select an option
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

type CheckboxGroupProps = {
  title: string;
  name: string;
  options: string[];
};

function CheckboxGroup({
  title,
  name,
  options,
}: CheckboxGroupProps) {
  return (
    <fieldset className="min-w-0 sm:col-span-2">
      <legend className="mb-3 max-w-full break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
        {title}
      </legend>

      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-[#f9fbf9] px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              className="mt-1 h-4 w-4 shrink-0"
            />

            <span className="min-w-0 break-words text-sm font-semibold text-slate-700">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default Navbar;