import { SriLankanTreatment } from "./treatmentTypes";

export const commonRustTreatments: SriLankanTreatment[] = [
  // =========================
  // 🟢 LOW SEVERITY – ORGANIC
  // =========================

  {
    id: "common_rust_neem_oil_low",
    type: "organic",
    name: {
      en: "Neem Oil (Azadirachtin-based)",
      si: "නීම් තෙල් (අසඩිරැක්ටින්)",
      ta: "வேப்ப எண்ணெய் (அசாடிராச்டின் அடிப்படையிலானது)",
    },
    availableProducts: {
      en: ["Neem Oil 3000 ppm", "Neemazal"],
      si: ["නීම් තෙල් 3000 ppm", "නීමසල්"],
      ta: ["வேப்ப எண்ணெய் 3000 பிபிஎம்", "நீமசல்"],
    },
    applicationMethod: {
      en: "Spray evenly on affected leaves",
      si: "ආසාදිත කොළ මත සමානව ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "பாதிக்கப்பட்ட இலைகளில் சமமாக தெளிக்கவும்",
    },
    dosage: {
      en: "3 ml per liter of water",
      si: "ලීටර් ජලයකට 3 ml",
      ta: "ஒரு லிட்டர் தண்ணீருக்கு 3 மில்லி",
    },
    schedule: {
      frequency: {
        en: "Every 7 days",
        si: "සෑම දින 7 කට වරක්",
        ta: "ஒவ்வொரு 7 நாட்களுக்கும்",
      },
      duration: {
        en: "2–3 weeks",
        si: "සති 2-3",
        ta: "2-3 வாரங்கள்",
      },
      bestTime: {
        en: "Evening",
        si: "සවස් වරුවේ",
        ta: "மாலை",
      },
    },
    safety: {
      en: ["Safe for humans and beneficial insects"],
      si: ["මිනිසුන්ට හා හිතකර කෘමීන්ට ආරක්ෂිත"],
      ta: ["மனிதர்களுக்கும் நன்மை பயக்கும் பூச்சிகளுக்கும் பாதுகாப்பானது"],
    },
    availability: {
      en: ["Organic farming centers", "Home garden stores"],
      si: ["කාබනික කෘෂිකර්ම මධ්‍යස්ථාන", "ගෙවත්ත ගබඩා"],
      ta: ["கரிம வேளாண்மை மையங்கள்", "வீட்டுத் தோட்டக் கடைகள்"],
    },
    costEstimate: {
      en: "Rs. 1,500 – 2,500",
      si: "රු. 1,500 – 2,500",
      ta: "ரூ. 1,500 – 2,500",
    },
  },

  // =========================
  // 🟢 LOW SEVERITY – CHEMICAL (LOW DOSE)
  // =========================

  {
    id: "common_rust_mancozeb_low",
    type: "chemical",
    name: {
      en: "Mancozeb 80% WP",
      si: "මැන්කොසෙබ් 80% WP",
      ta: "மான்கோசெப் 80% WP",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
      ta: ["டைதேன் எம்-45", "இண்டோஃபில் எம்-45"],
    },
    applicationMethod: {
      en: "Light preventive spray covering leaf surface",
      si: "කොළ මතුපිට ආවරණය වන පරිදි ලාභ ස්ප්‍රේ කිරිමේ කිරීම",
      ta: "இலை மேற்பரப்பை உள்ளடக்கிய லேசான தடுப்பு தெளிப்பு",
    },
    dosage: {
      en: "15 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 15 g",
      ta: "10 லிட்டர் தண்ணீருக்கு 15 கிராம்",
    },
    schedule: {
      frequency: {
        en: "Every 10–14 days",
        si: "සෑම දින 10-14 කට වරක්",
        ta: "ஒவ்வொரு 10-14 நாட்களுக்கும்",
      },
      duration: {
        en: "1–2 applications",
        si: "යෙදුම් 1-2",
        ta: "1-2 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Morning",
        si: "උදේ",
        ta: "காலை",
      },
    },
    safety: {
      en: ["Avoid spraying in windy conditions"],
      si: ["සුළං සහිත අවස්ථාවලදී ස්ප්‍රේ කිරිමේ කිරීමෙන් වළකින්න"],
      ta: ["காற்றுள்ள சூழ்நிலையில் தெளிப்பதைத் தவிர்க்கவும்"],
    },
    availability: {
      en: ["Agrochemical shops", "CIC centers"],
      si: ["කෘෂි රසායනික ගබඩා", "CIC මධ්‍යස්ථාන"],
      ta: ["வேளாண் வேதியியல் கடைகள்", "சிஐசி மையங்கள்"],
    },
    costEstimate: {
      en: "Rs. 2,500 – 3,500",
      si: "රු. 2,500 – 3,500",
      ta: "ரூ. 2,500 – 3,500",
    },
  },

  // =========================
  // 🟡 MEDIUM SEVERITY
  // =========================

  {
    id: "common_rust_mancozeb_medium",
    type: "chemical",
    name: {
      en: "Mancozeb 80% WP (Moderate control)",
      si: "මැන්කොසෙබ් 80% WP (මධ්‍යම පාලනය)",
      ta: "மான்கோசெப் 80% WP (மிதமான கட்டுப்பாடு)",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
      ta: ["டைதேன் எம்-45", "இண்டோஃபில் எம்-45"],
    },
    applicationMethod: {
      en: "Preventive foliar spray covering both leaf surfaces",
      si: "කොළ දෙපසම ආවරණය වන පරිදි ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "இரு இலைகளின் மேற்பரப்புகளையும் உள்ளடக்கிய தடுப்பு இலைவழி தெளிப்பு",
    },
    dosage: {
      en: "20 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20 g",
      ta: "10 லிட்டர் தண்ணீருக்கு 20 கிராம்",
    },
    schedule: {
      frequency: {
        en: "Every 7–10 days",
        si: "සෑම දින 7-10 කට වරක්",
        ta: "ஒவ்வொரு 7-10 நாட்களுக்கும்",
      },
      duration: {
        en: "2–3 applications",
        si: "යෙදුම් 2-3",
        ta: "2-3 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Morning or late afternoon",
        si: "උදේ හෝ සවස් වරුවේ",
        ta: "காலை அல்லது பிற்பகல்",
      },
    },
    safety: {
      en: ["Avoid spraying in windy conditions"],
      si: ["සුළං සහිත අවස්ථාවලදී ස්ප්‍රේ කිරිමේ කිරීමෙන් වළකින්න"],
      ta: ["காற்றுள்ள சூழ்நிலையில் தெளிப்பதைத் தவிர்க்கவும்"],
    },
    availability: {
      en: ["Agrochemical shops", "CIC centers"],
      si: ["කෘෂි රසායනික ගබඩා", "CIC මධ්‍යස්ථාන"],
      ta: ["வேளாண் வேதியியல் கடைகள்", "சிஐசி மையங்கள்"],
    },
    costEstimate: {
      en: "Rs. 3,500 – 5,500",
      si: "රු. 3,500 – 5,500",
      ta: "ரூ. 3,500 – 5,500",
    },
  },

  // =========================
  // 🔴 HIGH SEVERITY
  // =========================

  {
    id: "common_rust_tebuconazole_high",
    type: "chemical",
    name: {
      en: "Tebuconazole 250 EC (Severe infection)",
      si: "ටෙබුකොනසෝල් 250 EC",
      ta: "டெபுகோனசோல் 250 EC (கடுமையான தொற்று)",
    },
    availableProducts: {
      en: ["Folicur 250 EW", "Orius"],
      si: ["ෆොලිකර් 250 EW", "ඔරියස්"],
      ta: ["ஃபோலிகுர் 250 EW", "ஓரியஸ்"],
    },
    applicationMethod: {
      en: "Systemic spray with full leaf penetration",
      si: "කොළ තුළට හොඳින් ශෝෂණය වන ලෙස ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "முழு இலை ஊடுருவலுடன் கூடிய முறையான தெளிப்பு",
    },
    dosage: {
      en: "7.5 ml per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 7.5 ml",
      ta: "10 லிட்டர் தண்ணீருக்கு 7.5 மில்லி",
    },
    schedule: {
      frequency: {
        en: "Every 5–7 days",
        si: "සෑම දින 5-7 කට වරක්",
        ta: "ஒவ்வொரு 5-7 நாட்களுக்கும்",
      },
      duration: {
        en: "3–4 applications",
        si: "යෙදුම් 3-4",
        ta: "3-4 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Morning after dew dries",
        si: "පිනි වියළී ගිය පසු උදෑසන",
        ta: "பனி காய்ந்த பிறகு காலை",
      },
    },
    safety: {
      en: [
        "Wear gloves and mask",
        "Do not spray during flowering",
        "Re-entry interval: 3 days",
      ],
      si: [
        "අත් ආවරණ හා මුඛ ආවරණ භාවිත කරන්න",
        "මල් කාලයේදී ස්ප්‍රේ කිරිමේ කරන්න එපා",
        "නැවත ඇතුල් වීම: දින 3",
      ],
      ta: [
        "கையுறைகள் மற்றும் முகமூடி அணியுங்கள்",
        "பூக்கும் காலத்தில் தெளிக்க வேண்டாம்",
        "மீண்டும் প্রবেশের இடைவெளி: 3 நாட்கள்",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Licensed agro shops"],
      si: ["CIC කෘෂි මධ්‍යස්ථාන", "ලියාපදිංචි කෘෂි ගබඩා"],
      ta: ["சிஐசி விவசாய மையங்கள்", "உரிமம் பெற்ற விவசாய கடைகள்"],
    },
    costEstimate: {
      en: "Rs. 7,500 – 10,000",
      si: "රු. 7,500 – 10,000",
      ta: "ரூ. 7,500 – 10,000",
    },
  },
];
