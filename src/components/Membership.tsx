import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { NavLink } from "react-router-dom";
import { submitMembership } from "../firebase/submissions";

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

const membershipInterests = [
  "Peace Building",
  "Human Rights",
  "Volunteer Activities",
  "Entrepreneurship / Empowerment",
  "Training / Capacity Building",
  "Community Development",
  "Other",
];

const discoveryOptions = [
  "Website",
  "Social Media",
  "Referral",
  "Community",
  "Event / Programme",
  "Other",
];

function Membership() {
  const [country, setCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const isNigeria =
    country.trim().toLowerCase() === "nigeria";

  const selectedStateData = useMemo(
    () =>
      nigeriaStates.find(
        (state) => state.name === selectedState
      ),
    [selectedState]
  );

  const handleCountryChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setCountry(event.target.value);
    setSelectedState("");
    setSelectedLga("");
  };

  const handleStateChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedState(event.target.value);
    setSelectedLga("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const value = (name: string) =>
        String(formData.get(name) ?? "").trim();

      await submitMembership({
        fullName: value("fullName"),
        dateOfBirth: value("dateOfBirth"),
        gender: value("gender"),
        phone: value("phone"),
        email: value("email"),
        nationality: value("nationality"),
        residentialAddress: value("residentialAddress"),
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

        occupation: value("occupation"),
        qualification: value("qualification"),
        reasonForJoining: value("reasonForJoining"),
        membershipInterests: formData
          .getAll("membershipInterests")
          .map((item) => String(item)),
        skills: value("skills"),
        referralSource: value("referralSource"),
      });

      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Membership submission failed:", error);

      setSubmitError(
        "We could not submit your membership application. Please check your internet connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-[#f3f7f3] px-4 py-10 sm:py-16">
        <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-2xl">
          <div className="relative overflow-hidden bg-[#063b25] px-6 py-14 text-center sm:px-12">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-400/10" />
            <div className="absolute -bottom-14 -left-14 h-40 w-40 rounded-full bg-emerald-200/10" />

            <div className="relative z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-2xl font-black text-[#163d31]">
                ✓
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">
                Membership Application
              </p>

              <h1 className="mt-3 break-words text-3xl font-black leading-tight text-white sm:text-5xl">
                Thank you for your interest in ASBESOC.
              </h1>

              <p className="mx-auto mt-5 max-w-2xl break-words text-sm leading-8 text-emerald-50/80">
                Your membership application has been submitted
                successfully. ASBESOC will review your information
                and contact you when necessary.
              </p>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-10">
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-full bg-[#1B4332] px-7 py-3.5 text-sm font-black text-white transition hover:bg-amber-400 hover:text-[#163d31]"
              >
                New Application
              </button>

              <NavLink
                to="/"
                className="rounded-full border border-emerald-900/10 bg-emerald-50 px-7 py-3.5 text-center text-sm font-black text-[#1B4332] transition hover:bg-emerald-100"
              >
                Return Home
              </NavLink>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f7f3]">
      <section className="relative overflow-hidden bg-[#063b25]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10" />
        <div className="absolute -bottom-24 left-[15%] h-56 w-56 rounded-full bg-emerald-200/10" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <span className="inline-flex rounded-full border border-amber-400/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
            Get Involved
          </span>

          <h1 className="mt-5 max-w-4xl break-words text-4xl font-black leading-tight text-white sm:text-6xl">
            Become a Member
          </h1>

          <div className="mt-5 h-1 w-16 rounded-full bg-amber-400" />

          <p className="mt-6 max-w-3xl break-words text-sm leading-8 text-emerald-50/80 sm:text-base">
            Join our network and contribute to building a peaceful,
            empowered and better society. Membership brings together
            people who share ASBESOC's commitment to positive
            change, empowerment and sustainable community
            development.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-3 px-3 pt-6 sm:grid-cols-3 sm:px-6">
        <InfoStrip
          title="Shared Purpose"
          text="Connect with people committed to peace, empowerment and positive social transformation."
        />

        <InfoStrip
          title="International Participation"
          text="Membership applications can be completed by individuals in Nigeria and other countries."
        />

        <InfoStrip
          title="Meaningful Contribution"
          text="Bring your skills, experience and interests into ASBESOC programmes and community initiatives."
        />
      </section>

      <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-white shadow-xl"
        >
          <div className="border-b border-emerald-900/10 bg-gradient-to-r from-emerald-50 via-white to-amber-50 px-5 py-7 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              Membership Form
            </p>

            <h2 className="mt-2 break-words text-2xl font-black text-[#1B4332] sm:text-3xl">
              Personal Information
            </h2>

            <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-slate-500">
              Please provide accurate information so ASBESOC can
              review your membership application and communicate
              with you appropriately.
            </p>
          </div>

          <div className="p-4 sm:p-8 lg:p-10">
            <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                label="Full Name"
                name="fullName"
                placeholder="Enter your full name"
                required
              />

              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                required
              />

              <SelectField
                label="Gender"
                name="gender"
                options={[
                  "Male",
                  "Female",
                  "Prefer not to say",
                ]}
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
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

              <TextField
                label="Nationality"
                name="nationality"
                placeholder="Enter nationality"
                required
              />

              <div className="min-w-0 sm:col-span-2">
                <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Residential Address
                </label>

                <textarea
                  name="residentialAddress"
                  rows={3}
                  required
                  placeholder="Enter your residential address"
                  className="form-input box-border w-full min-w-0 max-w-full resize-none"
                />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <div className="rounded-2xl border border-emerald-900/10 bg-[#f8fbf8] p-4 sm:p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                    Location
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#1B4332]">
                    Where are you based?
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Nigerian applicants can select their State and
                    Local Government Area. International applicants
                    can enter their region and city.
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Country of Residence
                </label>

                <input
                  type="text"
                  name="country"
                  value={country}
                  onChange={handleCountryChange}
                  placeholder="e.g. Nigeria, Ghana, Canada"
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
                      onChange={handleStateChange}
                      required
                      className="form-input box-border w-full min-w-0 max-w-full"
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

                  <div className="min-w-0">
                    <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                      Local Government Area
                    </label>

                    <select
                      name="lga"
                      value={selectedLga}
                      onChange={(event) =>
                        setSelectedLga(event.target.value)
                      }
                      disabled={!selectedStateData}
                      required
                      className="form-input box-border w-full min-w-0 max-w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {selectedStateData
                          ? "Select your LGA"
                          : "Select state first"}
                      </option>

                      {selectedStateData?.lgas.map((lga) => (
                        <option
                          key={lga}
                          value={lga}
                        >
                          {lga}
                        </option>
                      ))}
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

              <TextField
                label="Occupation / Profession"
                name="occupation"
                placeholder="Enter occupation or profession"
                required
              />

              <TextField
                label="Educational Qualification"
                name="qualification"
                placeholder="Enter highest qualification"
                required
              />

              <div className="min-w-0 sm:col-span-2">
                <div className="mt-2 rounded-2xl bg-[#063b25] px-5 py-6 sm:px-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                    Membership Information
                  </p>

                  <h3 className="mt-2 break-words text-xl font-black text-white sm:text-2xl">
                    Tell us about your interest
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-emerald-50/75">
                    Help us understand what inspires you to join
                    ASBESOC and the areas where you would like to
                    contribute.
                  </p>
                </div>
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Why would you like to become an ASBESOC member?
                </label>

                <textarea
                  name="reasonForJoining"
                  rows={5}
                  required
                  placeholder="Tell us why you would like to join ASBESOC..."
                  className="form-input box-border w-full min-w-0 max-w-full resize-none"
                />
              </div>

              <CheckboxGroup
                title="Area(s) you are interested in"
                name="membershipInterests"
                options={membershipInterests}
              />

              <div className="min-w-0 sm:col-span-2">
                <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
                  Relevant Skills / Experience
                </label>

                <textarea
                  name="skills"
                  rows={5}
                  placeholder="Tell us about relevant skills, professional experience, community work or volunteering..."
                  className="form-input box-border w-full min-w-0 max-w-full resize-none"
                />
              </div>

              <SelectField
                label="How did you hear about ASBESOC?"
                name="referralSource"
                options={discoveryOptions}
                required
              />

              <div className="min-w-0 sm:col-span-2">
                <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-emerald-50 to-white p-4 sm:p-5">
                  <input
                    type="checkbox"
                    name="declaration"
                    required
                    className="mt-1 h-4 w-4 shrink-0"
                  />

                  <span className="min-w-0">
                    <span className="block break-words text-sm font-black text-[#1B4332]">
                      Membership Declaration
                    </span>

                    <span className="mt-1 block break-words text-xs leading-6 text-slate-500">
                      I confirm that the information provided in
                      this application is accurate. I understand
                      that membership is subject to ASBESOC's
                      review and applicable membership procedures.
                    </span>
                  </span>
                </label>
              </div>
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
                  Your information will be used for membership review,
                  communication and relevant ASBESOC membership
                  activities.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full shrink-0 rounded-full bg-[#1B4332] px-7 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-400 hover:text-[#163d31] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Membership Application →"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-center py-8">
          <NavLink
            to="/"
            className="rounded-full px-5 py-2 text-sm font-bold text-[#1B4332] transition hover:bg-emerald-50 hover:text-amber-600"
          >
            ← Back to ASBESOC
          </NavLink>
        </div>
      </section>
    </main>
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
};

function SelectField({
  label,
  name,
  options,
  required = false,
}: SelectFieldProps) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block break-words text-xs font-black uppercase tracking-wider text-[#1B4332]">
        {label}
      </label>

      <select
        name={name}
        defaultValue=""
        required={required}
        className="form-input box-border w-full min-w-0 max-w-full"
      >
        <option
          value=""
          disabled
        >
          Select an option
        </option>

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

export default Membership;