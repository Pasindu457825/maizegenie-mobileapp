// src/data/treatments/grayLeafSpotTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const grayLeafSpotTreatments: SriLankanTreatment[] = [
  // 🔴 CHEMICAL – Gray Leaf Spot specific fungicide
  {
    id: "chlorothalonil_gray_leaf_spot",
    name: {
      en: "Chlorothalonil 75% WP",
      si: "ක්ලෝරොතැලොනීල් 75% WP",
    },
    availableProducts: {
      en: ["Bravo 75 WP", "Kavach", "Chloro Gold"],
      si: ["බ්‍රාවෝ 75 WP", "කවච්", "ක්ලෝරෝ ගෝල්ඩ්"],
    },
    applicationMethod: {
      en: "Preventive foliar spray covering both leaf surfaces",
      si: "රෝගය පැතිරීමට පෙර කොළ දෙපසම ආවරණය වන පරිදි ස්ප්‍රේ කිරිමේ කරන්න",
    },
    dosage: {
      en: "20 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20 g",
    },
    schedule: {
      frequency: "Every 7–10 days",
      duration: "2–3 applications",
      bestTime: "Early morning or late afternoon",
    },
    safety: {
      en: [
        "Wear gloves and mask during spraying",
        "Avoid spraying during windy conditions",
        "Observe re-entry period (7 days)",
      ],
      si: [
        "ස්ප්‍රේ කිරිමේ කිරීමේදී අත් ආවරණ හා මුඛ ආවරණ භාවිත කරන්න",
        "සුළං සහිත අවස්ථාවලදී ස්ප්‍රේ කිරිමේ කිරීමෙන් වළකින්න",
        "දින 7ක නැවත ඇතුල් වීමේ කාලය පිළිපදින්න",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Agrochemical shops"],
      si: ["CIC කෘෂිකර්ම මධ්‍යස්ථාන", "කෘෂි රසායනික ගබඩා"],
    },
    costEstimate: "රු. 5,000 – 7,000 (per hectare)",
    type: "chemical",
  },

  // 🌱 ORGANIC – Gray Leaf Spot supportive control
  {
    id: "garlic_extract_gray_leaf_spot",
    name: {
      en: "Garlic Extract Spray",
      si: "සුදුළුනු සාරය ස්ප්‍රේ කිරිමේ කිරීම",
    },
    availableProducts: {
      en: ["Fresh garlic cloves"],
      si: ["නව සුදුළුනු"],
    },
    applicationMethod: {
      en: "Prepare garlic extract and spray on affected leaves",
      si: "සුදුළුනු සාරය සකසා ආසාදිත කොළ මත ස්ප්‍රේ කිරිමේ කරන්න",
    },
    dosage: {
      en: "50 g crushed garlic per liter of water",
      si: "ලීටර් ජලයකට තලාගත් සුදුළුනු 50 g",
    },
    schedule: {
      frequency: "Every 7 days",
      duration: "Early or mild infection stage",
      bestTime: "Evening",
    },
    safety: {
      en: ["Safe for humans and environment", "Use fresh solution only"],
      si: [
        "මිනිසුන්ට හා පරිසරයට ආරක්ෂිත",
        "නව සකස් කළ ද්‍රාවණය පමණක් භාවිත කරන්න",
      ],
    },
    availability: {
      en: ["Prepared at home"],
      si: ["ගෙදර සකස් කළ හැක"],
    },
    costEstimate: "රු. 200 – 500",
    type: "organic",
  },
];
