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
    },
    availableProducts: {
      en: ["Neem Oil 3000 ppm", "Neemazal"],
      si: ["නීම් තෙල් 3000 ppm", "නීමසල්"],
    },
    applicationMethod: {
      en: "Spray evenly on affected leaves",
      si: "ආසාදිත කොළ මත සමානව සිදුරු කරන්න",
    },
    dosage: {
      en: "3 ml per liter of water",
      si: "ලීටර් ජලයකට 3 ml",
    },
    schedule: {
      frequency: "Every 7 days",
      duration: "2–3 weeks",
      bestTime: "Evening",
    },
    safety: {
      en: ["Safe for humans and beneficial insects"],
      si: ["මිනිසුන්ට හා හිතකර කෘමීන්ට ආරක්ෂිත"],
    },
    availability: {
      en: ["Organic farming centers", "Home garden stores"],
      si: ["කාබනික කෘෂිකර්ම මධ්‍යස්ථාන", "ගෙවත්ත ගබඩා"],
    },
    costEstimate: "රු. 1,500 – 2,500",
  },

  // =========================
  // 🟢 LOW SEVERITY – CHEMICAL (LOW DOSE)
  // =========================

  {
    id: "common_rust_mancozeb_low",
    type: "chemical",
    name: {
      en: "Mancozeb 80% WP (Low dose – preventive)",
      si: "මැන්කොසෙබ් 80% WP (අඩු මාත්‍රාව)",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
    },
    applicationMethod: {
      en: "Light preventive spray covering leaf surface",
      si: "කොළ මතුපිට ආවරණය වන පරිදි ලාභ සිදුරු කිරීම",
    },
    dosage: {
      en: "15 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 15 g",
    },
    schedule: {
      frequency: "Every 10–14 days",
      duration: "1–2 applications",
      bestTime: "Morning",
    },
    safety: {
      en: ["Avoid spraying in windy conditions"],
      si: ["සුළං සහිත අවස්ථාවලදී සිදුරු කිරීමෙන් වළකින්න"],
    },
    availability: {
      en: ["Agrochemical shops", "CIC centers"],
      si: ["කෘෂි රසායනික ගබඩා", "CIC මධ්‍යස්ථාන"],
    },
    costEstimate: "රු. 2,500 – 3,500",
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
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45"],
      si: ["ඩිතේන් M-45", "ඉන්ඩොෆිල් M-45"],
    },
    applicationMethod: {
      en: "Preventive foliar spray covering both leaf surfaces",
      si: "කොළ දෙපසම ආවරණය වන පරිදි සිදුරු කරන්න",
    },
    dosage: {
      en: "20 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20 g",
    },
    schedule: {
      frequency: "Every 7–10 days",
      duration: "2–3 applications",
      bestTime: "Morning or late afternoon",
    },
    safety: {
      en: ["Avoid spraying in windy conditions"],
      si: ["සුළං සහිත අවස්ථාවලදී සිදුරු කිරීමෙන් වළකින්න"],
    },
    availability: {
      en: ["Agrochemical shops", "CIC centers"],
      si: ["කෘෂි රසායනික ගබඩා", "CIC මධ්‍යස්ථාන"],
    },
    costEstimate: "රු. 3,500 – 5,500",
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
    },
    availableProducts: {
      en: ["Folicur 250 EW", "Orius"],
      si: ["ෆොලිකර් 250 EW", "ඔරියස්"],
    },
    applicationMethod: {
      en: "Systemic spray with full leaf penetration",
      si: "කොළ තුළට හොඳින් ශෝෂණය වන ලෙස සිදුරු කරන්න",
    },
    dosage: {
      en: "7.5 ml per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 7.5 ml",
    },
    schedule: {
      frequency: "Every 5–7 days",
      duration: "3–4 applications",
      bestTime: "Morning after dew dries",
    },
    safety: {
      en: [
        "Wear gloves and mask",
        "Do not spray during flowering",
        "Re-entry interval: 3 days",
      ],
      si: [
        "අත් ආවරණ හා මුඛ ආවරණ භාවිත කරන්න",
        "මල් කාලයේදී සිදුරු කරන්න එපා",
        "නැවත ඇතුල් වීම: දින 3",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Licensed agro shops"],
      si: ["CIC කෘෂි මධ්‍යස්ථාන", "ලියාපදිංචි කෘෂි ගබඩා"],
    },
    costEstimate: "රු. 7,500 – 10,000",
  },
];
