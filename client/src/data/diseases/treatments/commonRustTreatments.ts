// src/data/treatments/commonRustTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const commonRustTreatments: SriLankanTreatment[] = [
  // 🔴 CHEMICAL – Systemic fungicide (Sri Lanka available)
  {
    id: "tebuconazole_common_rust",
    name: {
      en: "Tebuconazole 250 EC",
      si: "ටෙබුකොනසෝල් 250 EC",
    },
    availableProducts: {
      en: ["Folicur 250 EW", "Tebucon 250 EC", "Orius"],
      si: ["ෆොලිකර් 250 EW", "ටෙබුකොන් 250 EC", "ඔරියස්"],
    },
    applicationMethod: {
      en: "Foliar spray at first rust symptoms with full leaf coverage",
      si: "පළමු රස්ට් ලක්ෂණ පෙනෙන විට කොළ සම්පූර්ණයෙන් ආවරණය වන පරිදි සිදුරු කරන්න",
    },
    dosage: {
      en: "5 ml per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 5 ml",
    },
    schedule: {
      frequency: "Every 12–14 days",
      duration: "2 applications",
      bestTime: "Morning after dew dries",
    },
    safety: {
      en: [
        "Wear gloves and mask",
        "Do not spray during flowering",
        "Follow re-entry interval (3 days)",
      ],
      si: [
        "අත් ආවරණ හා මුඛ ආවරණ භාවිත කරන්න",
        "මල් කාලයේදී සිදුරු කරන්න එපා",
        "දින 3ක නැවත ඇතුල් වීමේ කාලය පිළිපදින්න",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Agrochemical shops"],
      si: ["CIC කෘෂිකර්ම මධ්‍යස්ථාන", "කෘෂි රසායනික ගබඩා"],
    },
    costEstimate: "රු. 7,500 – 10,000 (per hectare)",
    type: "chemical",
  },

  // 🟠 CHEMICAL – Contact fungicide (preventive)
  {
    id: "mancozeb_common_rust",
    name: {
      en: "Mancozeb 80% WP",
      si: "මැන්කොසෙබ් 80% WP",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
    },
    applicationMethod: {
      en: "Preventive foliar spray covering both leaf surfaces",
      si: "රෝගය පැතිරීමට පෙර කොළ දෙපසම ආවරණය වන පරිදි සිදුරු කරන්න",
    },
    dosage: {
      en: "20–25 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20–25 g",
    },
    schedule: {
      frequency: "Every 7–10 days",
      duration: "2–3 applications",
      bestTime: "Morning or late afternoon",
    },
    safety: {
      en: ["Avoid spraying in windy conditions", "Wash equipment after use"],
      si: [
        "සුළං සහිත අවස්ථාවලදී සිදුරු කිරීමෙන් වළකින්න",
        "භාවිතයෙන් පසු උපකරණ හොඳින් සෝදන්න",
      ],
    },
    availability: {
      en: ["Local agro shops", "CIC centers"],
      si: ["දේශීය කෘෂි ගබඩා", "CIC මධ්‍යස්ථාන"],
    },
    costEstimate: "රු. 3,500 – 5,500 (per hectare)",
    type: "chemical",
  },

  // 🌱 ORGANIC – Neem-based control (Sri Lanka common)
  {
    id: "neem_oil_common_rust",
    name: {
      en: "Neem Oil (Azadirachtin-based)",
      si: "නීම් තෙල් (අසඩිරැක්ටින්)",
    },
    availableProducts: {
      en: ["Neem Oil 3000 ppm", "Neemazal"],
      si: ["නීම් තෙල් 3000 ppm", "නීමසල්"],
    },
    applicationMethod: {
      en: "Mix with water and spray on affected leaves",
      si: "ජලය සමඟ මිශ්‍ර කර ආසාදිත කොළ මත සිදුරු කරන්න",
    },
    dosage: {
      en: "3–5 ml per liter of water",
      si: "ලීටර් ජලයකට 3–5 ml",
    },
    schedule: {
      frequency: "Every 7 days",
      duration: "Throughout disease period",
      bestTime: "Evening",
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
    },
    availability: {
      en: ["Organic farming centers", "Home garden stores"],
      si: ["කාබනික කෘෂිකර්ම මධ්‍යස්ථාන", "ගෙවත්ත ගබඩා"],
    },
    costEstimate: "රු. 1,500 – 2,500",
    type: "organic",
  },

  // 🌱 ORGANIC – Compost tea (supportive, not standalone)
  {
    id: "compost_tea_common_rust",
    name: {
      en: "Aerated Compost Tea Spray",
      si: "කොම්පෝස්ට් තේ සිදුරු",
    },
    availableProducts: {
      en: ["Well-decomposed compost", "Molasses"],
      si: ["හොඳින් පැකිළුණු කොම්පෝස්ට්", "මොලසස්"],
    },
    applicationMethod: {
      en: "Brew compost tea and spray on leaves",
      si: "කොම්පෝස්ට් තේ සකසා කොළ මත සිදුරු කරන්න",
    },
    dosage: {
      en: "1 part compost tea to 10 parts water",
      si: "කොම්පෝස්ට් තේ 1 කොටස : ජලය 10 කොටස්",
    },
    schedule: {
      frequency: "Every 10–14 days",
      duration: "Supportive treatment",
      bestTime: "Early morning",
    },
    safety: {
      en: ["100% organic and safe"],
      si: ["100% කාබනික හා ආරක්ෂිත"],
    },
    availability: {
      en: ["Prepared at home"],
      si: ["ගෙදර සකස් කළ හැක"],
    },
    costEstimate: "රු. 300 – 1,000",
    type: "organic",
  },
];
