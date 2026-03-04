// src/data/treatments/northernLeafBlightTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const leafBlightTreatments: SriLankanTreatment[] = [
  // 🔴 CHEMICAL – Primary & most effective for Northern Leaf Blight
  {
    id: "propiconazole_leaf_blight",
    name: {
      en: "Propiconazole 250 EC",
      si: "ප්‍රොපිකොනසෝල් 250 EC",
      ta: "புரோபிகோனசோல் 250 EC",
    },
    availableProducts: {
      en: ["Tilt 250 EC", "Bumper 25 EC", "Propimax"],
      si: ["ටිල්ට් 250 EC", "බම්පර් 25 EC", "ප්‍රොපිමැක්ස්"],
      ta: ["டில்ட் 250 EC", "பம்ப் 25 EC", "புரோபிமேக்ஸ்"],
    },
    applicationMethod: {
      en: "Spray when elongated blight lesions first appear on leaves",
      si: "දිගු ලප කොළ මත පෙනෙන විට කොළ දෙපසම ආවරණය වන පරිදි ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "இலைகளில் நீளமான கருகல் புண்கள் முதலில் தோன்றும்போது தெளிக்கவும்",
    },
    dosage: {
      en: "5 ml per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 5 ml",
      ta: "10 லிட்டர் தண்ணீருக்கு 5 மில்லி",
    },
    schedule: {
      frequency: {
        en: "Every 10–12 days",
        si: "සෑම දින 10-12 කට වරක්",
        ta: "ஒவ்வொரு 10-12 நாட்களுக்கும்",
      },
      duration: {
        en: "2–3 applications",
        si: "යෙදුම් 2-3",
        ta: "2-3 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Morning after dew dries",
        si: "පිනි වියළී ගිය පසු උදෑසන",
        ta: "பனி காய்ந்த பிறகு காலை",
      },
    },
    safety: {
      en: [
        "Wear gloves and face mask",
        "Do not exceed recommended dose",
        "Observe 7-day re-entry interval",
      ],
      si: [
        "අත් ආවරණ හා මුඛ ආවරණ භාවිත කරන්න",
        "නිර්දේශිත ප්‍රමාණය ඉක්මවන්න එපා",
        "දින 7ක නැවත ඇතුල් වීමේ කාලය පිළිපදින්න",
      ],
      ta: [
        "கையுறைகள் மற்றும் முகமூடி அணியுங்கள்",
        "பரிந்துரைக்கப்பட்ட அளவைத் தாண்ட வேண்டாம்",
        "7-நாள் மீண்டும் நுழைவு இடைவெளியைக் கவனிக்கவும்",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Authorized agrochemical dealers"],
      si: ["CIC කෘෂිකර්ම මධ්‍යස්ථාන", "අනුමත කෘෂි රසායනික ගබඩා"],
      ta: ["சிஐசி விவசாய மையங்கள்", "அங்கீகரிக்கப்பட்ட வேளாண் வேதியியல் விற்பனையாளர்கள்"],
    },
    costEstimate: {
      en: "Rs. 7,000 – 10,000 (per hectare)",
      si: "රු. 7,000 – 10,000 (per hectare)",
      ta: "ரூ. 7,000 – 10,000 (per hectare)",
    },
    type: "chemical",
  },

  // 🟠 CHEMICAL – Preventive contact fungicide (early stage only)
  {
    id: "mancozeb_leaf_blight",
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
      en: "Preventive spray before disease spreads",
      si: "රෝගය පැතිරීමට පෙර කොළ සම්පූර්ණයෙන් ආවරණය වන පරිදි ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "நோய் பரவுவதற்கு முன் தடுப்பு தெளிப்பு",
    },
    dosage: {
      en: "20–25 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20–25 g",
      ta: "10 லிட்டர் தண்ணீருக்கு 20-25 கிராம்",
    },
    schedule: {
      frequency: {
        en: "Every 7–10 days",
        si: "සෑම දින 7-10 කට වරක්",
        ta: "ஒவ்வொரு 7-10 நாட்களுக்கும்",
      },
      duration: {
        en: "2 applications",
        si: "යෙදුම් 2",
        ta: "2 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Early morning or late afternoon",
        si: "උදේ හෝ සවස් වරුවේ",
        ta: "அதிகாலை அல்லது பிற்பகல்",
      },
    },
    safety: {
      en: [
        "Avoid spraying during strong wind",
        "Wash equipment after spraying",
      ],
      si: [
        "බලවත් සුළං ඇති විට ස්ප්‍රේ කිරිමේ කිරීමෙන් වළකින්න",
        "ස්ප්‍රේ කිරිමේ කිරීමෙන් පසු උපකරණ හොඳින් සෝදන්න",
      ],
      ta: [
        " பலத்த காற்றின் போது தெளிப்பதைத் தவிர்க்கவும்",
        "தெளித்த பிறகு உபகரணங்களைக் கழுவவும்",
      ],
    },
    availability: {
      en: ["Local agrochemical shops", "CIC centers"],
      si: ["දේශීය කෘෂි ගබඩා", "CIC මධ්‍යස්ථාන"],
      ta: ["உள்ளூர் வேளாண் வேதியியல் கடைகள்", "சிஐசி மையங்கள்"],
    },
    costEstimate: {
      en: "Rs. 4,000 – 6,000 (per hectare)",
      si: "රු. 4,000 – 6,000 (per hectare)",
      ta: "ரூ. 4,000 – 6,000 (per hectare)",
    },
    type: "chemical",
  },

  // 🌱 ORGANIC – Neem-based (supportive, mild infection only)
  {
    id: "neem_oil_leaf_blight",
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
      en: "Mix with water and spray on affected leaves",
      si: "ජලය සමඟ මිශ්‍ර කර ආසාදිත කොළ මත ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "தண்ணீரில் கலந்து பாதிக்கப்பட்ட இலைகளில் தெளிக்கவும்",
    },
    dosage: {
      en: "3–5 ml per liter of water",
      si: "ලීටර් ජලයකට 3–5 ml",
      ta: "ஒரு லிட்டர் தண்ணீருக்கு 3-5 மில்லி",
    },
    schedule: {
      frequency: {
        en: "Every 7 days",
        si: "සෑම දින 7 කට වරක්",
        ta: "ஒவ்வொரு 7 நாட்களுக்கும்",
      },
      duration: {
        en: "Mild or early infection stage",
        si: "මෘදු හෝ මුල් ආසාදන අවධිය",
        ta: "லேசான அல்லது ஆரம்ப தொற்று நிலை",
      },
      bestTime: {
        en: "Evening",
        si: "සවස් වරුවේ",
        ta: "மாலை",
      },
    },
    safety: {
      en: [
        "Safe for humans and beneficial insects",
        "No harvest waiting period",
      ],
      si: [
        "මිනිසුන්ට හා හිතකර කෘමීන්ට ආරක්ෂිත",
        "අස්වැන්නට පෙර ප්‍රමාද කාලයක් අවශ්‍ය නැත",
      ],
      ta: [
        "மனிதர்களுக்கும் நன்மை பயக்கும் பூச்சிகளுக்கும் பாதுகாப்பானது",
        "அறுவடைக்கு காத்திருப்பு காலம் இல்லை",
      ],
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
    type: "organic",
  },
];
