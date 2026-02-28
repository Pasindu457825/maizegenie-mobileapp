// src/data/treatments/generalTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const generalTreatments: SriLankanTreatment[] = [
  // Chemical
  {
    id: "general_fungicide",
    name: {
      en: "General Purpose Fungicide",
      si: "පොදු කාර්යය දිලීර නාශක",
      ta: "பொது நோக்கம் கொண்ட பூஞ்சைக் கொல்லி",
    },
    availableProducts: {
      en: ["Mancozeb 80% WP", "Copper oxychloride"],
      si: ["Mancozeb 80% WP", "තඹ ඔක්සික්ලෝරයිඩ්"],
      ta: ["மான்கோசெப் 80% WP", "செப்பு ஆக்ஸிகுளோரைடு"],
    },
    applicationMethod: {
      en: "Spray thoroughly on all plant parts",
      si: "සියලුම ශාක කොටස් මත හොඳින් ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "அனைத்து தாவர பாகங்களிலும் நன்கு தெளிக்கவும்",
    },
    dosage: {
      en: "As per product label instructions",
      si: "නිෂ්පාදන ලේබලයේ උපදෙස් පරිදි",
      ta: "தயாரிப்பு லேபிள் அறிவுறுத்தல்களின்படி",
    },
    schedule: {
      frequency: {
        en: "Every 7-10 days",
        si: "සෑම දින 7-10 කට වරක්",
        ta: "ஒவ்வொரு 7-10 நாட்களுக்கும்",
      },
      duration: {
        en: "2-3 applications",
        si: "යෙදුම් 2-3",
        ta: "2-3 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Morning",
        si: "උදෑසන",
        ta: "காலை",
      },
    },
    safety: {
      en: ["Follow label instructions", "Wear protective gear", "Store safely"],
      si: [
        "ලේබල් උපදෙස් පිළිපදින්න",
        "රැකවරණ ඇඳුම් භාවිත කරන්න",
        "සුරක්ෂිතව ගබඩා කරන්න",
      ],
      ta: [
        "லேபிள் வழிமுறைகளைப் பின்பற்றவும்",
        "பாதுகாப்பு கியர் அணியுங்கள்",
        "பாதுப்பாக சேமிக்கவும்",
      ],
    },
    availability: {
      en: ["Local agrochemical shops", "CIC centers", "Cooperative stores"],
      si: ["දේශීය කෘෂි රසයනික ගබඩා", "සීඅයිසී මධ්‍යස්ථාන", "සහකාරී ගබඩා"],
      ta: ["உள்ளூர் விவசாய கடைகள்", "சிஐசி மையங்கள்", "கூட்டுறவு கடைகள்"],
    },
    costEstimate: {
      en: "Rs. 3,000 - 6,000",
      si: "රු. 3,000 - 6,000",
      ta: "ரூ. 3,000 - 6,000",
    },
    type: "chemical",
  },

  // Organic
  {
    id: "neem_oil_general",
    name: {
      en: "Neem Oil Extract",
      si: "නීම් තෙල් උද්දීපන",
      ta: "வேப்ப எண்ணெய் சாறு",
    },
    availableProducts: {
      en: ["Neemazal", "Neem Oil 3000ppm"],
      si: ["නීමසල්", "නීම් තෙල් 3000ppm"],
      ta: ["நீமசல்", "வேப்ப எண்ணெய் 3000ppm"],
    },
    applicationMethod: {
      en: "Mix with water and spray",
      si: "ජලය සමඟ මිශ්‍ර කර ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "தண்ணீருடன் கலந்து தெளிக்கவும்",
    },
    dosage: {
      en: "3-5 ml per liter",
      si: "ලීටර් ජලයකට 3-5 ml",
      ta: "ஒரு லிட்டருக்கு 3-5 மில்லி",
    },
    schedule: {
      frequency: {
        en: "Every 7 days",
        si: "සෑම දින 7 කට වරක්",
        ta: "ஒவ்வொரு 7 நாட்களுக்கும்",
      },
      duration: {
        en: "Continuous",
        si: "අඛණ්ඩව",
        ta: "தொடர்ச்சியாக",
      },
      bestTime: {
        en: "Morning or evening",
        si: "උදෑසන හෝ සවස",
        ta: "காலை அல்லது மாலை",
      },
    },
    safety: {
      en: ["Safe for humans"],
      si: ["මිනිසුන්ට ආරක්ෂිත"],
      ta: ["மனிதர்களுக்கு பாதுகாப்பானது"],
    },
    availability: {
      en: ["Organic stores"],
      si: ["කාබනික ගබඩා"],
      ta: ["கரிம அங்காடிகள்"],
    },
    costEstimate: {
      en: "Rs. 1,500 - 2,500",
      si: "රු. 1,500 - 2,500",
      ta: "ரூ. 1,500 - 2,500",
    },
    type: "organic",
  },
];
