// src/data/treatments/grayLeafSpotTreatments.ts
import { SriLankanTreatment } from './treatmentTypes';

export const grayLeafSpotTreatments: SriLankanTreatment[] = [
  {
    id: "mancozeb_gray_spot",
    name: {
      en: "Mancozeb 80% WP (Dithane M-45)",
      si: "Mancozeb 80% WP (Dithane M-45)",
    },
    availableProducts: {
      en: ["Dithane M-45", "Indofil M-45", "Roko M-45"],
      si: ["Dithane M-45", "Indofil M-45", "Roko M-45"],
    },
    applicationMethod: {
      en: "Foliar spray covering both sides of leaves",
      si: "කොළ දෙපසම ආවරණය වන පරිදි පත්‍ර සිදුරු කරන්න",
    },
    dosage: {
      en: "2-2.5 kg per hectare (20-25g per 10L water)",
      si: "හෙක්ටයාරයකට 2-2.5 kg (ලීටර් 10ක ජලයකට 20-25g)",
    },
    schedule: {
      frequency: "Every 10-14 days",
      duration: "3-4 applications",
      bestTime: "Early morning or late afternoon",
    },
    safety: {
      en: [
        "Wear gloves and mask during mixing",
        "Wait 7 days before harvest",
        "Avoid spraying in windy conditions",
      ],
      si: [
        "මිශ්‍ර කිරීමේදී අත්වැසුම් හා මුඛ ආවරණය භාවිත කරන්න",
        "අස්වැන්නට 7 දිනකට පෙර නවත්වන්න",
        "සුලං සහිත තත්ත්වයන්හිදී සිදුරු කිරීමෙන් වළකින්න",
      ],
    },
    availability: {
      en: [
        "CIC Agri Centers",
        "Lanka Harvest Stores",
        "Local agrochemical shops",
      ],
      si: [
        "සීඅයිසී කෘෂිකර්ම මධ්‍යස්ථාන",
        "ලංකා හාර්වෙස්ට් ගබඩා",
        "දේශීය කෘෂි රසායනික ගබඩා",
      ],
    },
    costEstimate: "රු. 4,500 - 5,500 per hectare",
    type: "chemical",
  },
  // Add more treatments...
];