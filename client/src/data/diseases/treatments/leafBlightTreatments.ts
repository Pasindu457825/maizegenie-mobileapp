// src/data/treatments/northernLeafBlightTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const leafBlightTreatments: SriLankanTreatment[] = [
  // Chemical treatments
  {
    id: "azoxystrobin_blight",
    name: {
      en: "Azoxystrobin 250 SC (Amistar)",
      si: "Azoxystrobin 250 SC (Amistar)",
    },
    availableProducts: {
      en: ["Amistar 250 SC", "Azoxi 250 SC", "Quadris"],
      si: ["ඇමිස්ටාර් 250 SC", "ඇසොක්සි 250 SC", "ක්වොඩ්රිස්"],
    },
    applicationMethod: {
      en: "Spray at first disease signs, good coverage essential",
      si: "පළමු රෝග ලක්ෂණ දක්නා විට සිදුරු කරන්න, හොඳ ආවරණය අත්‍යවශ්‍යය",
    },
    dosage: {
      en: "1 L per hectare (10ml per 10L water)",
      si: "හෙක්ටයාරයකට 1 L (ලීටර් 10ක ජලයකට 10ml)",
    },
    schedule: {
      frequency: "Every 10-12 days",
      duration: "3 applications",
      bestTime: "Late afternoon",
    },
    safety: {
      en: [
        "7-day re-entry period",
        "Don't exceed recommended dose",
        "Keep away from water sources",
      ],
      si: [
        "නැවත ඇතුල් වීමට 7 දිනක ප්‍රමාදය",
        "නිර්දේශිත ප්‍රමාණය ඉක්මවන්න එපා",
        "ජල මූලාශ්‍රවලින් දුරින් තබාගන්න",
      ],
    },
    availability: {
      en: [
        "Syngenta authorized dealers",
        "Major agro centers",
        "District cooperatives",
      ],
      si: [
        "සින්ජෙන්ටා අනුමත වෙළෙන්දන්",
        "ප්‍රධාන කෘෂි මධ්‍යස්ථාන",
        "දිස්ත්‍රික් සහකාරී",
      ],
    },
    costEstimate: "රු. 12,000 - 15,000 per hectare",
    type: "chemical",
  },
  // Organic treatments for Blight
  {
    id: "bicarbonate_blight",
    name: {
      en: "Baking Soda & Oil Spray",
      si: "බේකිං සෝඩා හා තෙල් සිදුරු",
    },
    availableProducts: {
      en: ["Baking soda", "Horticultural oil", "Soap"],
      si: ["බේකිං සෝඩා", "උද්‍යානික තෙල්", "සබන්"],
    },
    applicationMethod: {
      en: "Mix baking soda with oil and soap, then dilute with water",
      si: "බේකිං සෝඩා තෙල් හා සබන් සමඟ මිශ්‍ර කර ජලයෙන් තනුක කරන්න",
    },
    dosage: {
      en: "1 tbsp baking soda + 1 tsp oil + few drops soap per liter water",
      si: "ලීටර් ජලයකට බේකිං සෝඩා 1 හැදි + තෙල් 1 තේ හැදි + සබන් බිංදු කිහිපයක්",
    },
    schedule: {
      frequency: "Every 7 days",
      duration: "Until disease controlled",
      bestTime: "Cool, cloudy day",
    },
    safety: {
      en: [
        "Test on small area first",
        "Avoid spraying in hot sun",
        "Can cause leaf burn if too concentrated",
      ],
      si: [
        "පළමුව කුඩා ප්‍රදේශයක පරීක්ෂා කරන්න",
        "උණුසුම් අව්වේදී සිදුරු කිරීමෙන් වළකින්න",
        "අධික සාන්ද්‍රණයක් නම් කොළ දහඩිය ඇති කළ හැක",
      ],
    },
    availability: {
      en: ["Supermarkets", "Garden centers", "Home stores"],
      si: ["සුපිරි වෙළඳසැල්", "උද්‍යාන මධ්‍යස්ථාන", "ගෙවත්ත ගබඩා"],
    },
    costEstimate: "රු. 500 - 1,000",
    type: "organic",
  },
  {
    id: "compost_tea_blight",
    name: {
      en: "Compost Tea Foliar Spray",
      si: "කොම්පෝස්ට් තේ පත්ර සිදුරු",
    },
    availableProducts: {
      en: ["Well-aged compost", "Molasses", "Aquarium pump"],
      si: ["හොඳින් පැකිළුණු කොම්පෝස්ට්", "මොලසස්", "මත්ස්‍යාල පම්පුව"],
    },
    applicationMethod: {
      en: "Brew compost with molasses for 24-48 hours, strain and spray",
      si: "කොම්පෝස්ට් මොලසස් සමඟ පැය 24-48 ක් තබා, පෙරා සිදුරු කරන්න",
    },
    dosage: {
      en: "1 part compost tea to 10 parts water",
      si: "කොම්පෝස්ට් තේ 1 කොටස, ජලය 10 කොටස්",
    },
    schedule: {
      frequency: "Every 10-14 days",
      duration: "Throughout growing season",
      bestTime: "Early morning",
    },
    safety: {
      en: [
        "100% safe and beneficial",
        "Improves plant immunity",
        "Enhances soil health",
      ],
      si: [
        "100% ආරක්ෂිත හා ප්‍රයෝජනවත්",
        "ශාක ප්‍රතිශක්තිකරණය වැඩි කරයි",
        "මඩ සෞඛ්‍යය වැඩිදියුණු කරයි",
      ],
    },
    availability: {
      en: ["Make at home", "Organic farm suppliers"],
      si: ["ගෙදර සකසන්න", "කාබනික කෙත් සැපයුම්කරුවන්"],
    },
    costEstimate: "රු. 500 - 2,000 (for setup)",
    type: "organic",
  },
];
