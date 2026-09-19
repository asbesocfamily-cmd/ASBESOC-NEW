import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type HTMLInputTypeAttribute,
  type ReactNode,
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

const genderOptions = ["Male", "Female", "Prefer not to say"];

type TextValues = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  nationality: string;
  residentialAddress: string;
  country: string;
  state: string;
  lga: string;
  region: string;
  city: string;
  occupation: string;
  qualification: string;
  reasonForJoining: string;
  skills: string;
  referralSource: string;
};

type FormValues = TextValues & {
  membershipInterests: string[];
  declaration: boolean;
};

type TextFieldName = keyof TextValues;
type FieldName = keyof FormValues;
type FormErrors = Partial<Record<FieldName, string>>;

const fieldLabels: Record<TextFieldName, string> = {
  fullName: "Full Name",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  phone: "Contact Number",
  email: "Email Address",
  nationality: "Nationality",
  residentialAddress: "Residential Address",
  country: "Country of Residence",
  state: "State",
  lga: "Local Government Area",
  region: "State / Province / Region",
  city: "City / District",
  occupation: "Occupation / Profession",
  qualification: "Educational Qualification",
  reasonForJoining: "Reason for Joining",
  skills: "Relevant Skills / Experience",
  referralSource: "How You Heard About ASBESOC",
};

const fieldLimits: Partial<Record<TextFieldName, number>> = {
  fullName: 150,
  phone: 40,
  email: 254,
  nationality: 100,
  residentialAddress: 500,
  country: 100,
  region: 100,
  city: 100,
  occupation: 150,
  qualification: 150,
  reasonForJoining: 3000,
  skills: 3000,
};

function createEmptyForm(): FormValues {
  return {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    nationality: "",
    residentialAddress: "",
    country: "",
    state: "",
    lga: "",
    region: "",
    city: "",
    occupation: "",
    qualification: "",
    reasonForJoining: "",
    skills: "",
    referralSource: "",
    membershipInterests: [],
    declaration: false,
  };
}

function isNigeriaCountry(country: string) {
  return country.trim().toLowerCase() === "nigeria";
}

function getToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const requiredFields: TextFieldName[] = [
    "fullName",
    "dateOfBirth",
    "gender",
    "phone",
    "email",
    "nationality",
    "residentialAddress",
    "country",
    "occupation",
    "qualification",
    "reasonForJoining",
    "referralSource",
  ];

  for (const name of requiredFields) {
    if (!values[name].trim()) {
      errors[name] =
        `Please complete ${fieldLabels[name].toLowerCase()}.`;
    }
  }

  for (const name of Object.keys(fieldLimits) as TextFieldName[]) {
    const limit = fieldLimits[name];

    if (limit && values[name].length > limit) {
      errors[name] = `Please use ${limit} characters or fewer.`;
    }
  }

  const birthDate = values.dateOfBirth.trim();

  if (birthDate) {
    if (!isRealDate(birthDate)) {
      errors.dateOfBirth = "Please enter a valid date of birth.";
    } else if (birthDate > getToday()) {
      errors.dateOfBirth =
        "Your date of birth cannot be in the future.";
    }
  }

  const email = values.email.trim();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email =
      "Enter an email address such as name@example.com.";
  }

  const phone = values.phone.trim();
  const compactPhone = phone.replace(/[\s().-]/g, "");

  if (
    phone &&
    (!/^\+?\d{7,15}$/.test(compactPhone) ||
      /^0+$/.test(compactPhone.replace(/^\+/, "")))
  ) {
    errors.phone =
      "Enter 7–15 digits. You may include a leading +, spaces or hyphens.";
  }

  if (values.gender && !genderOptions.includes(values.gender)) {
    errors.gender = "Please choose one of the listed options.";
  }

  if (
    values.referralSource &&
    !discoveryOptions.includes(values.referralSource)
  ) {
    errors.referralSource =
      "Please choose one of the listed options.";
  }

  if (isNigeriaCountry(values.country)) {
    const state = nigeriaStates.find(
      (item) => item.name === values.state,
    );

    if (!state) {
      errors.state = "Please select your state.";
    }

    if (!values.lga) {
      errors.lga = "Please select your Local Government Area.";
    } else if (!state?.lgas.includes(values.lga)) {
      errors.lga =
        "Select an LGA belonging to your chosen state.";
    }
  } else if (values.country.trim()) {
    if (!values.region.trim()) {
      errors.region =
        "Please enter your state, province or region.";
    }

    if (!values.city.trim()) {
      errors.city = "Please enter your city or district.";
    }
  }

  if (
    values.membershipInterests.some(
      (interest) => !membershipInterests.includes(interest),
    )
  ) {
    errors.membershipInterests =
      "Please select from the listed interests.";
  }

  if (!values.declaration) {
    errors.declaration =
      "Please confirm the declaration before submitting.";
  }

  return errors;
}

const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-emerald-700 focus-visible:ring-offset-2";

function Membership() {
  const [values, setValues] =
    useState<FormValues>(createEmptyForm);

  const [touched, setTouched] = useState<
    Partial<Record<FieldName, boolean>>
  >({});

  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submissionLock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  const isNigeria = isNigeriaCountry(values.country);

  const selectedStateData = useMemo(
    () =>
      nigeriaStates.find(
        (state) => state.name === values.state,
      ),
    [values.state],
  );

  const errors = useMemo(
    () => validateForm(values),
    [values],
  );

  useEffect(() => {
    if (submitted) {
      successHeadingRef.current?.focus({
        preventScroll: true,
      });

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  }, [submitted]);

  function updateText(name: TextFieldName, value: string) {
    if (submissionLock.current) return;

    setValues((current) => {
      const next = { ...current, [name]: value };

      if (
        name === "country" &&
        current.country.trim().toLowerCase() !==
          value.trim().toLowerCase()
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
    } else if (name === "state") {
      setTouched((current) => ({
        ...current,
        lga: false,
      }));
    }

    setSubmitError("");
  }

  function touchField(name: FieldName) {
    setTouched((current) => ({
      ...current,
      [name]: true,
    }));
  }

  function visibleError(name: FieldName) {
    return attempted || touched[name]
      ? errors[name]
      : undefined;
  }

  function bindField(name: TextFieldName) {
    return {
      name,
      value: values[name],
      error: visibleError(name),
      onChange: (value: string) =>
        updateText(name, value),
      onBlur: () => touchField(name),
    };
  }

  function toggleInterest(interest: string) {
    if (submissionLock.current) return;

    setValues((current) => ({
      ...current,
      membershipInterests:
        current.membershipInterests.includes(interest)
          ? current.membershipInterests.filter(
              (item) => item !== interest,
            )
          : [...current.membershipInterests, interest],
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLock.current) return;

    setAttempted(true);
    setSubmitError("");

    const currentErrors = validateForm(values);

    if (Object.keys(currentErrors).length > 0) {
      requestAnimationFrame(() => {
        const firstInvalid =
          formRef.current?.querySelector<HTMLElement>(
            '[aria-invalid="true"]:not(:disabled)',
          );

        firstInvalid?.focus();
      });

      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);

    const value = (name: TextFieldName) =>
      values[name].trim();

    try {
      await submitMembership({
        fullName: value("fullName"),
        dateOfBirth: value("dateOfBirth"),
        gender: value("gender"),
        phone: value("phone"),
        email: value("email"),
        nationality: value("nationality"),
        residentialAddress: value("residentialAddress"),
        country: isNigeria ? "Nigeria" : value("country"),

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
        membershipInterests: [
          ...values.membershipInterests,
        ],
        skills: value("skills"),
        referralSource: value("referralSource"),
      });

      setSubmitted(true);
    } catch {
      setSubmitError(
        "We couldn’t confirm your submission. Your answers are still here. Please check your connection and try again. If this continues, contact asbesocngo@gmail.com.",
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f3f7f3] px-4 py-12 sm:py-20">
        <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-emerald-900/10 bg-white shadow-[0_24px_70px_rgba(6,59,37,0.10)]">
          <div className="relative overflow-hidden bg-[#063b25] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[36px] border-white/5"
            />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-[#063b25]">
                <CheckIcon className="h-8 w-8" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                Membership Application
              </p>

              <h1
                ref={successHeadingRef}
                tabIndex={-1}
                className="mt-4 text-3xl font-black leading-tight text-white outline-none sm:text-4xl"
              >
                Thank you for your interest in ASBESOC.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/85 sm:text-base">
                Your membership application has been submitted
                successfully. ASBESOC will review your information
                and contact you when necessary.
              </p>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <p className="text-center text-sm leading-7 text-slate-600">
              Submission is the first step. Membership remains
              subject to ASBESOC&apos;s review and applicable
              procedures.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <NavLink
                to="/"
                className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-[#063b25] px-7 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 ${focusClass}`}
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
    <main className="min-h-screen overflow-x-hidden bg-[#f3f7f3] text-slate-800">
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
        {/* One introduction card */}
        <section
          aria-labelledby="membership-page-heading"
          className="relative overflow-hidden rounded-[24px] bg-[#063b25] px-5 py-6 text-white shadow-sm sm:px-8 lg:py-9"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border-[32px] border-white/5"
          />

          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300 lg:text-xs">
              Get Involved
            </p>

            <h1
              id="membership-page-heading"
              className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl"
            >
              Become a Member
            </h1>

            {/* Compact mobile introduction */}
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 lg:hidden">
              Join ASBESOC and help build a peaceful, empowered
              and better society.
            </p>

            {/* More information on desktop */}
            <div className="hidden lg:block">
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85">
                Join our network and contribute to building a
                peaceful, empowered and better society.
                Membership brings together people who share
                ASBESOC&apos;s commitment to positive change,
                empowerment and sustainable community
                development.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-6 border-t border-white/15 pt-5">
                <div>
                  <h2 className="text-sm font-bold text-amber-300">
                    Shared Purpose
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-white/75">
                    Connect with people committed to peace,
                    empowerment and positive social
                    transformation.
                  </p>
                </div>

                <div className="border-l border-white/15 pl-6">
                  <h2 className="text-sm font-bold text-amber-300">
                    International Participation
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-white/75">
                    Membership applications can be completed
                    by individuals in Nigeria and other
                    countries.
                  </p>
                </div>

                <div className="border-l border-white/15 pl-6">
                  <h2 className="text-sm font-bold text-amber-300">
                    Meaningful Contribution
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-white/75">
                    Bring your skills, experience and interests
                    into ASBESOC programmes and community
                    initiatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Application card */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          aria-labelledby="membership-form-heading"
          aria-busy={isSubmitting}
          className="mt-6 overflow-hidden rounded-[24px] border border-emerald-900/10 bg-white shadow-[0_20px_65px_rgba(6,59,37,0.09)] sm:mt-8 sm:rounded-[30px]"
        >
          <div className="h-1 bg-gradient-to-r from-[#063b25] via-emerald-600 to-amber-400" />

          <header className="border-b border-emerald-900/10 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 px-5 py-7 sm:px-9 sm:py-9">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#063b25] text-amber-300 sm:flex">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="4"
                    width="14"
                    height="17"
                    rx="2"
                  />
                  <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Membership Form
                </p>

                <h2
                  id="membership-form-heading"
                  className="mt-2 text-2xl font-black tracking-tight text-[#063b25] sm:text-3xl"
                >
                  Your application starts here.
                </h2>

                <p className="mt-3 hidden max-w-2xl text-sm leading-7 text-slate-600 lg:block">
                  Please provide accurate information so ASBESOC
                  can review your membership application and
                  communicate with you appropriately.
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  Fields marked{" "}
                  <span className="font-bold text-rose-700">
                    *
                  </span>{" "}
                  are required.
                </p>
              </div>
            </div>
          </header>

          <div className="px-5 py-7 sm:px-9 sm:py-9">
            <fieldset
              disabled={isSubmitting}
              className="m-0 min-w-0 border-0 p-0"
            >
              <legend className="sr-only">
                Membership application details
              </legend>

              <div className="space-y-9">
                <FormSection
                  number="01"
                  title="Personal information"
                  description="Let us know who you are and how to reach you."
                >
                  <Field
                    {...bindField("fullName")}
                    label="Full Name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />

                  <Field
                    {...bindField("dateOfBirth")}
                    label="Date of Birth"
                    type="date"
                    max={getToday()}
                    autoComplete="bday"
                  />

                  <Field
                    {...bindField("gender")}
                    label="Gender"
                    kind="select"
                    options={genderOptions}
                    placeholder="Select your gender"
                  />

                  <Field
                    {...bindField("phone")}
                    label="Contact Number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="e.g. 09023916067 or +2349023916067"
                    hint="For international numbers, include the country code."
                  />

                  <Field
                    {...bindField("email")}
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />

                  <Field
                    {...bindField("nationality")}
                    label="Nationality"
                    placeholder="Enter your nationality"
                  />
                </FormSection>

                <FormSection
                  number="02"
                  title="Address & location"
                  description="Nigerian applicants can select their state and LGA. International applicants can enter their region and city."
                >
                  <div className="min-w-0 sm:col-span-2">
                    <Field
                      {...bindField("residentialAddress")}
                      label="Residential Address"
                      kind="textarea"
                      rows={3}
                      autoComplete="street-address"
                      placeholder="House number, street and neighbourhood"
                    />
                  </div>

                  <Field
                    {...bindField("country")}
                    label="Country of Residence"
                    autoComplete="country-name"
                    placeholder="e.g. Nigeria, Ghana, Canada"
                    hint="Enter Nigeria to choose your state and LGA."
                  />

                  {isNigeria ? (
                    <>
                      <Field
                        {...bindField("state")}
                        label="State"
                        kind="select"
                        options={nigeriaStates.map(
                          (state) => state.name,
                        )}
                        placeholder="Select your state"
                        autoComplete="address-level1"
                      />

                      <Field
                        {...bindField("lga")}
                        label="Local Government Area"
                        kind="select"
                        options={selectedStateData?.lgas ?? []}
                        placeholder={
                          selectedStateData
                            ? "Select your LGA"
                            : "Select your state first"
                        }
                        disabled={!selectedStateData}
                        autoComplete="address-level2"
                      />
                    </>
                  ) : values.country.trim() ? (
                    <>
                      <Field
                        {...bindField("region")}
                        label="State / Province / Region"
                        placeholder="Enter your state, province or region"
                        autoComplete="address-level1"
                      />

                      <Field
                        {...bindField("city")}
                        label="City / District"
                        placeholder="Enter your city or district"
                        autoComplete="address-level2"
                      />
                    </>
                  ) : null}
                </FormSection>

                <FormSection
                  number="03"
                  title="Background & interests"
                  description="Help us understand what inspires you to join ASBESOC and the areas where you would like to contribute."
                >
                  <Field
                    {...bindField("occupation")}
                    label="Occupation / Profession"
                    placeholder="Enter your occupation or profession"
                  />

                  <Field
                    {...bindField("qualification")}
                    label="Educational Qualification"
                    placeholder="Enter your highest qualification"
                  />

                  <div className="min-w-0 sm:col-span-2">
                    <Field
                      {...bindField("reasonForJoining")}
                      label="Why would you like to become an ASBESOC member?"
                      kind="textarea"
                      rows={5}
                      placeholder="Tell us why you would like to join ASBESOC..."
                    />
                  </div>

                  <fieldset
                    id="membership-membershipInterests"
                    tabIndex={-1}
                    aria-invalid={Boolean(
                      visibleError("membershipInterests"),
                    )}
                    aria-describedby={
                      visibleError("membershipInterests")
                        ? "membership-interests-hint membership-interests-error"
                        : "membership-interests-hint"
                    }
                    className="min-w-0 scroll-mt-28 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 sm:col-span-2"
                  >
                    <legend className="text-sm font-semibold text-[#163d31]">
                      Area(s) you are interested in{" "}
                      <span className="font-normal text-slate-500">
                        (optional)
                      </span>
                    </legend>

                    <p
                      id="membership-interests-hint"
                      className="mb-4 mt-2 text-xs leading-6 text-slate-500"
                    >
                      Choose as many as you like.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {membershipInterests.map((interest, index) => {
                        const checked =
                          values.membershipInterests.includes(interest);

                        return (
                          <label
                            key={interest}
                            className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                              checked
                                ? "border-emerald-700 bg-emerald-50"
                                : "border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"
                            }`}
                          >
                            <input
                              id={`membership-interest-${index}`}
                              type="checkbox"
                              name="membershipInterests"
                              value={interest}
                              checked={checked}
                              onChange={() =>
                                toggleInterest(interest)
                              }
                              className={`mt-0.5 h-4 w-4 shrink-0 accent-emerald-800 ${focusClass}`}
                            />

                            <span className="min-w-0 text-sm font-medium leading-6 text-[#163d31]">
                              {interest}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {visibleError("membershipInterests") && (
                      <p
                        id="membership-interests-error"
                        className="mt-2 text-sm text-rose-700"
                      >
                        {visibleError("membershipInterests")}
                      </p>
                    )}
                  </fieldset>

                  <div className="min-w-0 sm:col-span-2">
                    <Field
                      {...bindField("skills")}
                      label="Relevant Skills / Experience"
                      kind="textarea"
                      rows={4}
                      required={false}
                      placeholder="Tell us about relevant skills, professional experience, community work or volunteering..."
                    />
                  </div>

                  <div className="min-w-0 sm:col-span-2">
                    <Field
                      {...bindField("referralSource")}
                      label="How did you hear about ASBESOC?"
                      kind="select"
                      options={discoveryOptions}
                      placeholder="Select an option"
                    />
                  </div>
                </FormSection>

                <FormSection
                  number="04"
                  title="Review & submit"
                  description="Check your contact details and confirm the declaration below."
                >
                  <div className="min-w-0 sm:col-span-2">
                    <label
                      htmlFor="membership-declaration"
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 sm:p-5 ${
                        visibleError("declaration")
                          ? "border-rose-300 bg-rose-50"
                          : "border-emerald-900/15 bg-[#f5f9f5]"
                      }`}
                    >
                      <input
                        id="membership-declaration"
                        name="declaration"
                        type="checkbox"
                        required
                        checked={values.declaration}
                        aria-invalid={Boolean(
                          visibleError("declaration"),
                        )}
                        aria-describedby={
                          visibleError("declaration")
                            ? "membership-declaration-text membership-declaration-error"
                            : "membership-declaration-text"
                        }
                        onBlur={() =>
                          touchField("declaration")
                        }
                        onChange={(event) => {
                          const checked = event.target.checked;

                          setValues((current) => ({
                            ...current,
                            declaration: checked,
                          }));

                          touchField("declaration");
                          setSubmitError("");
                        }}
                        className={`mt-1 h-5 w-5 shrink-0 scroll-mt-28 accent-emerald-800 ${focusClass}`}
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[#163d31]">
                          Membership Declaration{" "}
                          <span
                            aria-hidden="true"
                            className="text-rose-700"
                          >
                            *
                          </span>
                        </span>

                        <span
                          id="membership-declaration-text"
                          className="mt-2 block text-sm leading-7 text-slate-600"
                        >
                          I confirm that the information
                          provided in this application is
                          accurate. I understand that membership
                          is subject to ASBESOC&apos;s review
                          and applicable membership procedures.
                        </span>
                      </span>
                    </label>

                    {visibleError("declaration") && (
                      <p
                        id="membership-declaration-error"
                        className="mt-2 text-sm leading-6 text-rose-700"
                      >
                        {visibleError("declaration")}
                      </p>
                    )}
                  </div>
                </FormSection>
              </div>
            </fieldset>

            {/* Submission feedback */}
            <div aria-live="polite" aria-atomic="true">
              {isSubmitting && (
                <p className="mt-6 text-sm font-medium text-emerald-800">
                  Sending your application. Please keep this
                  page open.
                </p>
              )}
            </div>

            {submitError && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4"
              >
                <p className="text-sm font-bold text-rose-900">
                  Submission not confirmed
                </p>

                <p className="mt-2 text-sm leading-7 text-rose-800">
                  {submitError}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-5 border-t border-slate-200 pt-7 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-md text-xs leading-6 text-slate-500">
                Your information will be used for membership
                review, communication and relevant ASBESOC
                membership activities.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex min-h-14 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-[#063b25] px-6 py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(6,59,37,0.15)] transition-colors hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70 lg:w-auto ${focusClass}`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin motion-reduce:animate-none"
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
                        opacity="0.25"
                      />
                      <path
                        d="M12 3a9 9 0 0 1 9 9"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>

                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Membership Application

                    <svg
                      className="h-5 w-5 shrink-0 text-amber-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-7 flex justify-center">
          <NavLink
            to="/"
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#063b25] transition hover:bg-emerald-100/60 ${focusClass}`}
          >
            <span aria-hidden="true">←</span>
            Back to ASBESOC
          </NavLink>
        </div>
      </div>
    </main>
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
  const headingId = `membership-section-${number}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-6 flex items-start gap-3 sm:gap-4">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-900/10 bg-emerald-50 text-xs font-black text-emerald-800"
        >
          {number}
        </span>

        <div className="min-w-0">
          <h3
            id={headingId}
            className="text-lg font-bold tracking-tight text-[#063b25] sm:text-xl"
          >
            {title}
          </h3>

          <p className="mt-1 text-sm leading-7 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

type FieldProps = {
  name: TextFieldName;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  kind?: "input" | "textarea" | "select";
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  disabled?: boolean;
  options?: string[];
  rows?: number;
  max?: string;
  autoComplete?: string;
};

function Field({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  placeholder,
  kind = "input",
  type = "text",
  required = true,
  disabled = false,
  options = [],
  rows = 4,
  max,
  autoComplete,
}: FieldProps) {
  const id = `membership-${name}`;

  const describedBy =
    [
      hint ? `${id}-hint` : "",
      error ? `${id}-error` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const className = [
    "block box-border w-full min-w-0 max-w-full scroll-mt-28 rounded-xl border",
    "bg-white px-4 py-3.5 text-base leading-6 text-slate-800",
    "shadow-sm outline-none transition-colors sm:text-sm",
    "placeholder:text-slate-400",
    "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
    error
      ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
      : "border-slate-300 hover:border-emerald-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100",
  ].join(" ");

  const shared = {
    id,
    name,
    value,
    required,
    disabled,
    autoComplete,
    onBlur,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy,
  };

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold leading-6 text-[#163d31]"
      >
        {label}{" "}
        {required ? (
          <span
            aria-hidden="true"
            className="text-rose-700"
          >
            *
          </span>
        ) : (
          <span className="font-normal text-slate-500">
            (optional)
          </span>
        )}
      </label>

      {kind === "textarea" ? (
        <textarea
          {...shared}
          rows={rows}
          maxLength={fieldLimits[name]}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`${className} min-h-28 resize-y`}
        />
      ) : kind === "select" ? (
        <div className="relative">
          <select
            {...shared}
            onChange={(event) =>
              onChange(event.target.value)
            }
            className={`${className} min-h-[52px] appearance-none pr-11`}
          >
            <option value="">
              {placeholder || "Select an option"}
            </option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <svg
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      ) : (
        <input
          {...shared}
          type={type}
          max={max}
          maxLength={fieldLimits[name]}
          placeholder={placeholder}
          spellCheck={
            type === "email" ? false : undefined
          }
          autoCapitalize={
            type === "email" ? "none" : undefined
          }
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`${className} min-h-[52px]`}
        />
      )}

      {hint && (
        <p
          id={`${id}-hint`}
          className="mt-2 text-xs leading-6 text-slate-500"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-start gap-1.5 text-sm leading-6 text-rose-700"
        >
          <svg
            className="mt-1 h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
          </svg>

          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function CheckIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default Membership;