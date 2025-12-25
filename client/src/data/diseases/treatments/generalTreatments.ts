// src/data/treatments/generalTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const generalTreatments: SriLankanTreatment[] = [
  // Chemical
  {
    id: "general_fungicide",
    name: {
      en: "General Purpose Fungicide",
      si: "පොදු කාර්යය දිලීර නාශක",
    },
    availableProducts: {
      en: ["Mancozeb 80% WP", "Copper oxychloride"],
      si: ["Mancozeb 80% WP", "තඹ ඔක්සික්ලෝරයිඩ්"],
    },
    applicationMethod: {
      en: "Spray thoroughly on all plant parts",
      si: "සියලුම ශාක කොටස් මත හොඳින් සිදුරු කරන්න",
    },
    dosage: {
      en: "As per product label instructions",
      si: "නිෂ්පාදන ලේබලයේ උපදෙස් පරිදි",
    },
    schedule: {
      frequency: "Every 7-10 days",
      duration: "2-3 applications",
      bestTime: "Morning",
    },
    safety: {
      en: ["Follow label instructions", "Wear protective gear", "Store safely"],
      si: [
        "ලේබල් උපදෙස් පිළිපදින්න",
        "රැකවරණ ඇඳුම් භාවිත කරන්න",
        "සුරක්ෂිතව ගබඩා කරන්න",
      ],
    },
    availability: {
      en: ["Local agrochemical shops", "CIC centers", "Cooperative stores"],
      si: ["දේශීය කෘෂි රසයනික ගබඩා", "සීඅයිසී මධ්‍යස්ථාන", "සහකාරී ගබඩා"],
    },
    costEstimate: "රු. 3,000 - 6,000",
    type: "chemical",
  },

  // Organic
  {
    id: "neem_oil_general",
    name: {
      en: "Neem Oil Extract",
      si: "නීම් තෙල් උද්දීපන",
    },
    availableProducts: {
      en: ["Neemazal", "Neem Oil 3000ppm"],
      si: ["නීමසල්", "නීම් තෙල් 3000ppm"],
    },
    applicationMethod: {
      en: "Mix with water and spray",
      si: "ජලය සමඟ මිශ්‍ර කර සිදුරු කරන්න",
    },
    dosage: {
      en: "3-5 ml per liter",
      si: "ලීටර් ජලයකට 3-5 ml",
    },
    schedule: {
      frequency: "Every 7 days",
      duration: "Continuous",
      bestTime: "Morning or evening",
    },
    safety: {
      en: ["Safe for humans"],
      si: ["මිනිසුන්ට ආරක්ෂිත"],
    },
    availability: {
      en: ["Organic stores"],
      si: ["කාබනික ගබඩා"],
    },
    costEstimate: "රු. 1,500 - 2,500",
    type: "organic",
  },
];
