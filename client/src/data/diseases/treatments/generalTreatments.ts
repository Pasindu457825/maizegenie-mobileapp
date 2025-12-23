// src/data/treatments/generalTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const generalTreatments = {
  chemical: [
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
        en: [
          "Follow label instructions",
          "Wear protective gear",
          "Store safely",
        ],
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
      type: "chemical" as const,
    },
  ],
  organic: [
    {
      id: "neem_oil_general",
      name: {
        en: "Neem Oil Extract",
        si: "නීම් තෙල් උද්දීපන",
      },
      availableProducts: {
        en: ["Neemazal", "Neem Oil 3000ppm", "Bio-neem"],
        si: ["නීමසල්", "නීම් තෙල් 3000ppm", "බයෝ-නීම්"],
      },
      applicationMethod: {
        en: "Mix with water and spray on both leaf surfaces",
        si: "ජලය සමඟ මිශ්‍ර කර කොළ දෙපසම සිදුරු කරන්න",
      },
      dosage: {
        en: "3-5 ml per liter of water",
        si: "ලීටර් ජලයකට 3-5 ml",
      },
      schedule: {
        frequency: "Every 7 days",
        duration: "Continuous during disease period",
        bestTime: "Early morning or evening",
      },
      safety: {
        en: [
          "Safe for beneficial insects",
          "No waiting period for harvest",
          "Can be mixed with other organic inputs",
        ],
        si: [
          "හිතකර කෘමීන්ට ආරක්ෂිතය",
          "අස්වැන්න සඳහා ප්‍රමාද කාලයක් නැත",
          "වෙනත් කාබනික ආදාන සමඟ මිශ්‍ර කළ හැක",
        ],
      },
      availability: {
        en: [
          "Bio control product shops",
          "Organic farming centers",
          "Home garden stores",
        ],
        si: [
          "ජීව පාලන නිෂ්පාදන ගබඩා",
          "කාබනික කෘෂිකර්ම මධ්‍යස්ථාන",
          "ගෙවත්ත උද්‍යාන ගබඩා",
        ],
      },
      costEstimate: "රු. 1,500 - 2,500 per liter",
      type: "organic" as const,
    },
    {
      id: "baking_soda_general",
      name: {
        en: "Baking Soda Solution",
        si: "බේකිං සෝඩා ද්‍රාවණය",
      },
      availableProducts: {
        en: ["Pure baking soda", "Sodium bicarbonate"],
        si: ["පිරිසිදු බේකිං සෝඩා", "සෝඩියම් බයිකාබනේට්"],
      },
      applicationMethod: {
        en: "Dissolve in water and spray on affected areas",
        si: "ජලයේ දිය කර ආසාදිත ප්‍රදේශවලට සිදුරු කරන්න",
      },
      dosage: {
        en: "1 tablespoon per liter of water + few drops of soap",
        si: "ලීටර් ජලයකට 1 හැදි + සබන් බිංදු කිහිපයක්",
      },
      schedule: {
        frequency: "Every 5-7 days",
        duration: "Until symptoms disappear",
        bestTime: "Cool part of the day",
      },
      safety: {
        en: [
          "Completely safe for humans",
          "No residue concerns",
          "Can use until harvest day",
        ],
        si: [
          "මිනිසුන්ට සම්පූර්ණයෙන් ආරක්ෂිත",
          "අවශේෂ කොන්දේසි නැත",
          "අස්වැන්න දිනය දක්වා භාවිත කළ හැක",
        ],
      },
      availability: {
        en: ["Supermarkets", "Grocery stores", "Baking supply shops"],
        si: ["සුපිරි වෙළඳසැල්", "ග්‍රෝසරි ගබඩා", "බේකිං සැපයුම් ගබඩා"],
      },
      costEstimate: "රු. 200 - 400 per 500g",
      type: "organic" as const,
    },
  ],
};
