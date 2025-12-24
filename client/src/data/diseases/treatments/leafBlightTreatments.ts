// src/data/treatments/northernLeafBlightTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const leafBlightTreatments: SriLankanTreatment[] = [
  // 🔴 CHEMICAL – Primary & most effective for Northern Leaf Blight
  {
    id: "propiconazole_leaf_blight",
    name: {
      en: "Propiconazole 250 EC",
      si: "ප්‍රොපිකොනසෝල් 250 EC",
    },
    availableProducts: {
      en: ["Tilt 250 EC", "Bumper 25 EC", "Propimax"],
      si: ["ටිල්ට් 250 EC", "බම්පර් 25 EC", "ප්‍රොපිමැක්ස්"],
    },
    applicationMethod: {
      en: "Spray when elongated blight lesions first appear on leaves",
      si: "දිගු ලප කොළ මත පෙනෙන විට කොළ දෙපසම ආවරණය වන පරිදි සිදුරු කරන්න",
    },
    dosage: {
      en: "5 ml per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 5 ml",
    },
    schedule: {
      frequency: "Every 10–12 days",
      duration: "2–3 applications",
      bestTime: "Morning after dew dries",
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
    },
    availability: {
      en: ["CIC Agri Centers", "Authorized agrochemical dealers"],
      si: ["CIC කෘෂිකර්ම මධ්‍යස්ථාන", "අනුමත කෘෂි රසායනික ගබඩා"],
    },
    costEstimate: "රු. 7,000 – 10,000 (per hectare)",
    type: "chemical",
  },

  // 🟠 CHEMICAL – Preventive contact fungicide (early stage only)
  {
    id: "mancozeb_leaf_blight",
    name: {
      en: "Mancozeb 80% WP",
      si: "මැන්කොසෙබ් 80% WP",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
    },
    applicationMethod: {
      en: "Preventive spray before disease spreads",
      si: "රෝගය පැතිරීමට පෙර කොළ සම්පූර්ණයෙන් ආවරණය වන පරිදි සිදුරු කරන්න",
    },
    dosage: {
      en: "20–25 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20–25 g",
    },
    schedule: {
      frequency: "Every 7–10 days",
      duration: "2 applications",
      bestTime: "Early morning or late afternoon",
    },
    safety: {
      en: [
        "Avoid spraying during strong wind",
        "Wash equipment after spraying",
      ],
      si: [
        "බලවත් සුළං ඇති විට සිදුරු කිරීමෙන් වළකින්න",
        "සිදුරු කිරීමෙන් පසු උපකරණ හොඳින් සෝදන්න",
      ],
    },
    availability: {
      en: ["Local agrochemical shops", "CIC centers"],
      si: ["දේශීය කෘෂි ගබඩා", "CIC මධ්‍යස්ථාන"],
    },
    costEstimate: "රු. 4,000 – 6,000 (per hectare)",
    type: "chemical",
  },

  // 🌱 ORGANIC – Neem-based (supportive, mild infection only)
  {
    id: "neem_oil_leaf_blight",
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
      duration: "Mild or early infection stage",
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
];
