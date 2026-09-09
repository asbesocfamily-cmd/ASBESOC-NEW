import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

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
      "Lamurde",
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

function Membership() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [agree, setAgree] = useState(false);

  const selectedStateData = useMemo(
    () =>
      nigeriaStates.find(
        (state) => state.name === selectedState
      ),
    [selectedState]
  );

  useEffect(() => {
    if (submitted) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [submitted]);

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

    if (!agree) {
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <MembershipSuccess
        onReturn={() => setSubmitted(false)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8f5]">
      {/* =====================================================
          HERO / INTRODUCTION
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#063b25]">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-amber-400/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
              ASBESOC Membership
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Become part of a movement for a better society.
            </h1>

            <div className="mt-7 h-1 w-20 rounded-full bg-amber-400" />

            <p className="mt-7 max-w-3xl text-sm leading-8 text-emerald-50/80 sm:text-base lg:text-lg">
              Membership connects individuals who believe in peace,
              empowerment, positive behavioural change, capacity
              building and sustainable community development.
            </p>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-emerald-50/65">
              Complete the membership application below to express
              your interest in joining ASBESOC Nigeria and becoming
              part of its community of members and supporters.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MEMBERSHIP BENEFITS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <BenefitCard
            number="01"
            title="Community"
            text="Connect with people and communities committed to positive social transformation."
          />

          <BenefitCard
            number="02"
            title="Participation"
            text="Take part in suitable initiatives, programmes and community-development activities."
          />

          <BenefitCard
            number="03"
            title="Impact"
            text="Contribute your skills, ideas and support toward peaceful and empowered communities."
          />
        </div>
      </section>

      {/* =====================================================
          APPLICATION FORM
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-xl"
        >
          {/* FORM HEADER */}

          <div className="bg-[#1B4332] px-6 py-9 sm:px-10 sm:py-12">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Membership Application
            </span>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Membership registration
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-50/75">
              Please provide the information below. The form is
              currently a demonstration and is not connected to a
              live membership database.
            </p>
          </div>

          <div className="space-y-10 p-6 sm:p-10">
            {/* =================================================
                SECTION 1
            ================================================= */}

            <FormSection
              number="01"
              title="Personal Information"
              description="Tell us a little about yourself."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField
                  label="First Name"
                  name="firstName"
                  placeholder="Enter your first name"
                  required
                />

                <InputField
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter your last name"
                  required
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  required
                />

                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  required
                />

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                    Gender
                  </label>

                  <select
                    name="gender"
                    required
                    className="form-input"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">
                      Prefer not to say
                    </option>
                  </select>
                </div>
              </div>
            </FormSection>

            {/* =================================================
                SECTION 2
            ================================================= */}

            <FormSection
              number="02"
              title="Location"
              description="Tell us where you are based."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                    State
                  </label>

                  <select
                    value={selectedState}
                    onChange={handleStateChange}
                    required
                    className="form-input"
                  >
                    <option value="">
                      Select your state
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
                    className="form-input disabled:cursor-not-allowed disabled:opacity-50"
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

                <div className="sm:col-span-2">
                  <InputField
                    label="Residential / Contact Address"
                    name="address"
                    placeholder="Enter your address"
                    required
                  />
                </div>
              </div>
            </FormSection>

            {/* =================================================
                SECTION 3
            ================================================= */}

            <FormSection
              number="03"
              title="Professional Information"
              description="Help us understand your background and skills."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <InputField
                  label="Occupation / Profession"
                  name="occupation"
                  placeholder="e.g. Teacher, Entrepreneur, Student"
                  required
                />

                <InputField
                  label="Organization / Institution"
                  name="organization"
                  placeholder="Optional"
                />

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                    Employment Status
                  </label>

                  <select
                    name="employmentStatus"
                    required
                    className="form-input"
                  >
                    <option value="">
                      Select employment status
                    </option>
                    <option value="Employed">
                      Employed
                    </option>
                    <option value="Self-employed">
                      Self-employed
                    </option>
                    <option value="Student">
                      Student
                    </option>
                    <option value="Unemployed">
                      Unemployed
                    </option>
                    <option value="Retired">
                      Retired
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                    Preferred Membership Interest
                  </label>

                  <select
                    name="membershipInterest"
                    required
                    className="form-input"
                  >
                    <option value="">
                      Select an option
                    </option>
                    <option value="Community Member">
                      Community Member
                    </option>
                    <option value="Volunteer">
                      Volunteer
                    </option>
                    <option value="Youth Engagement">
                      Youth Engagement
                    </option>
                    <option value="Professional Support">
                      Professional Support
                    </option>
                    <option value="Community Leadership">
                      Community Leadership
                    </option>
                  </select>
                </div>
              </div>
            </FormSection>

            {/* =================================================
                SECTION 4
            ================================================= */}

            <FormSection
              number="04"
              title="Areas of Interest"
              description="Select the areas where you would like to contribute or participate."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckOption
                  name="peace"
                  label="Peace Building"
                />

                <CheckOption
                  name="behaviouralChange"
                  label="Positive Behavioural Change"
                />

                <CheckOption
                  name="empowerment"
                  label="Economic Empowerment"
                />

                <CheckOption
                  name="capacityBuilding"
                  label="Capacity Building"
                />

                <CheckOption
                  name="communityDevelopment"
                  label="Community Development"
                />

                <CheckOption
                  name="advocacy"
                  label="Advocacy & Awareness"
                />

                <CheckOption
                  name="youth"
                  label="Youth Development"
                />

                <CheckOption
                  name="otherInterest"
                  label="Other"
                />
              </div>
            </FormSection>

            {/* =================================================
                SECTION 5
            ================================================= */}

            <FormSection
              number="05"
              title="About Your Interest"
              description="Tell us why you would like to become an ASBESOC member."
            >
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Why would you like to join ASBESOC?
                </label>

                <textarea
                  name="motivation"
                  rows={6}
                  required
                  placeholder="Tell us briefly about your interest in ASBESOC and how you would like to contribute..."
                  className="form-input resize-none leading-7"
                />
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  How did you hear about ASBESOC?
                </label>

                <select
                  name="heardAbout"
                  required
                  className="form-input"
                >
                  <option value="">
                    Select an option
                  </option>
                  <option value="Social Media">
                    Social Media
                  </option>
                  <option value="Friend or Family">
                    Friend or Family
                  </option>
                  <option value="Community">
                    Community
                  </option>
                  <option value="Event">
                    ASBESOC Event
                  </option>
                  <option value="Website">
                    ASBESOC Website
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            </FormSection>

            {/* =================================================
                SECTION 6
            ================================================= */}

            <FormSection
              number="06"
              title="Declaration"
              description="Please review the declaration before submitting."
            >
              <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5 sm:p-6">
                <p className="text-sm leading-7 text-slate-600">
                  I confirm that the information provided in this
                  membership application is accurate to the best of
                  my knowledge. I understand that membership and
                  participation in ASBESOC activities may be subject
                  to the organization's applicable policies,
                  procedures and approval processes.
                </p>

                <label className="mt-5 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) =>
                      setAgree(event.target.checked)
                    }
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-[#1B4332] focus:ring-[#1B4332]"
                  />

                  <span className="text-sm font-bold leading-6 text-[#1B4332]">
                    I agree to the declaration above and wish to
                    submit my membership application.
                  </span>
                </label>
              </div>
            </FormSection>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="border-t border-slate-100 pt-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-500">
                    Final Step
                  </p>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-slate-500">
                    This is currently a demonstration membership
                    application. It does not send your information
                    to a live database.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!agree}
                  className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-[#1B4332] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Submit Membership Application

                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* BACK HOME */}

        <div className="flex justify-center py-10">
          <NavLink
            to="/"
            className="rounded-full bg-[#1B4332] px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
          >
            ← Back to ASBESOC
          </NavLink>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   BENEFIT CARD
========================================================= */

function BenefitCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white p-6 shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B4332] text-xs font-black text-white">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-black text-[#1B4332]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-500">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-xs font-black text-white">
          {number}
        </div>

        <div>
          <h3 className="text-xl font-black text-[#1B4332] sm:text-2xl">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#1B4332]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}

/* =========================================================
   CHECK OPTION
========================================================= */

function CheckOption({
  name,
  label,
}: {
  name: string;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition hover:border-emerald-900/20 hover:bg-emerald-50">
      <input
        type="checkbox"
        name={name}
        className="h-5 w-5 rounded border-slate-300 text-[#1B4332] focus:ring-[#1B4332]"
      />

      <span className="text-sm font-bold text-slate-700">
        {label}
      </span>
    </label>
  );
}

/* =========================================================
   SUCCESS SCREEN
========================================================= */

function MembershipSuccess({
  onReturn,
}: {
  onReturn: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f8f5]">
      <section className="bg-[#063b25] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-5xl font-black text-[#1B4332] shadow-xl">
            ✓
          </div>

          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
            Application Submitted
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-6xl">
            Welcome to the ASBESOC community.
          </h1>

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-amber-400" />

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-emerald-50/80 sm:text-base">
            Thank you for expressing your interest in becoming
            an ASBESOC member. Your membership application has
            been recorded as a demonstration submission.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-7 shadow-xl sm:p-10">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">
            What Happens Next
          </span>

          <h2 className="mt-3 text-2xl font-black text-[#1B4332] sm:text-3xl">
            Membership application received
          </h2>

          <div className="mt-6 space-y-4">
            <NextStep
              number="01"
              title="Application Review"
              text="In the live system, the appropriate ASBESOC team would review the submitted membership application."
            />

            <NextStep
              number="02"
              title="Membership Follow-up"
              text="Applicants could receive further information about membership procedures, activities and participation."
            />

            <NextStep
              number="03"
              title="Get Involved"
              text="Approved members can participate in suitable ASBESOC initiatives and community-development activities."
            />
          </div>

          <div className="mt-8 rounded-2xl bg-emerald-50 p-5">
            <p className="text-xs leading-6 text-[#1B4332]">
              <strong>Demo notice:</strong> This membership
              application is currently a front-end demonstration.
              No personal information has been stored in a live
              database.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={onReturn}
            className="rounded-full border border-[#1B4332] bg-white px-8 py-4 text-sm font-black text-[#1B4332] shadow-lg transition hover:bg-emerald-50"
          >
            ← Submit Another Application
          </button>

          <NavLink
            to="/"
            className="rounded-full bg-[#1B4332] px-8 py-4 text-center text-sm font-black text-white shadow-lg transition hover:bg-amber-400 hover:text-[#163d31]"
          >
            Return to ASBESOC →
          </NavLink>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   NEXT STEP
========================================================= */

function NextStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B4332] text-xs font-black text-white">
        {number}
      </div>

      <div>
        <h3 className="font-black text-[#1B4332]">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-7 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

export default Membership;