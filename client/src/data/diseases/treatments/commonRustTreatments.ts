// src/data/treatments/commonRustTreatments.ts
import { SriLankanTreatment } from './treatmentTypes';

export const commonRustTreatments: SriLankanTreatment[] = [
  {
    id: "tebuconazole_rust",
    name: {
      en: "Tebuconazole 250 EC (Folicur)",
      si: "Tebuconazole 250 EC (Folicur)",
    },
    availableProducts: {
      en: ["Folicur 250 EW", "Tebucon 250 EC", "Rust Guard"],
      si: ["Folicur 250 EW", "ටෙබුකොන් 250 EC", "රස්ට් ගාර්ඩ්"],
    },
    applicationMethod: {
      en: "Spray when first pustules appear, cover thoroughly",
      si: "පළමු පුටු පෙනෙන විට සිදුරු කරන්න, සම්පූර්ණයෙන් ආවරණය කරන්න",
    },
    dosage: {
      en: "500 ml per hectare (5ml per 10L water)",
      si: "හෙක්ටයාරයකට 500 ml (ලීටර් 10ක ජලයකට 5ml)",
    },
    schedule: {
      frequency: "Every 14 days",
      duration: "2 applications",
      bestTime: "Morning after dew dries",
    },
    safety: {
      en: [
        "3-day re-entry interval",
        "Don't apply during flowering",
        "Store in original container",
      ],
      si: [
        "නැවත ඇතුල් වීමට 3 දිනක ප්‍රමාදය",
        "මල් හටගැනීමේදී යොදන්න එපා",
        "මුල් බඳුනේම ගබඩා කරන්න",
      ],
    },
    availability: {
      en: [
        "Bayer Crop Science dealers",
        "Agro input shops",
        "Cooperative societies",
      ],
      si: [
        "බේයර් ක්‍රොප් සයන්ස් වෙළෙන්දන්",
        "කෘෂි ආදාන ගබඩා",
        "සහකාරී සමිති",
      ],
    },
    costEstimate: "රු. 8,000 - 10,000 per hectare",
    type: "chemical",
  },
  // Add more treatments...
];