// src/data/treatments/grayLeafSpotTreatments.ts
import { SriLankanTreatment } from "./treatmentTypes";

export const grayLeafSpotTreatments: SriLankanTreatment[] = [
  // 🔴 CHEMICAL – Gray Leaf Spot specific fungicide
  {
    id: "chlorothalonil_gray_leaf_spot",
    name: {
      en: "Chlorothalonil 75% WP",
      si: "ක්ලෝරොතැලොනීල් 75% WP",
      ta: "குளோரோதலோனில் 75% WP",
    },
    availableProducts: {
      en: ["Bravo 75 WP", "Kavach", "Chloro Gold"],
      si: ["බ්‍රාවෝ 75 WP", "කවච්", "ක්ලෝරෝ ගෝල්ඩ්"],
      ta: ["பிராவோ 75 WP", "கவாச்", "குளோரோ கோல்ட்"],
    },
    applicationMethod: {
      en: "Preventive foliar spray covering both leaf surfaces",
      si: "රෝගය පැතිරීමට පෙර කොළ දෙපසම ආවරණය වන පරිදි ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "நோய் பரவுவதற்கு முன்பு இலைகளின் இருபுறமும் படும்படி தெளிக்கவும்",
    },
    dosage: {
      en: "20 g per 10 L of water",
      si: "ලීටර් 10ක ජලයකට 20 g",
      ta: "10 லிட்டர் தண்ணீருக்கு 20 கிராம்",
    },
    schedule: {
      frequency: {
        en: "Every 7–10 days",
        si: "සෑම දින 7-10 කට වරක්",
        ta: "ஒவ்வொரு 7-10 நாட்களுக்கும்",
      },
      duration: {
        en: "2–3 applications",
        si: "යෙදුම් 2-3",
        ta: "2-3 பயன்பாடுகள்",
      },
      bestTime: {
        en: "Early morning or late afternoon",
        si: "උදේ හෝ සවස් වරුවේ",
        ta: "அதிகாலை அல்லது பிற்பகல்",
      },
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
      ta: [
        "தெளிக்கும்போது கையுறைகள் மற்றும் முகமூடி அணியுங்கள்",
        "காற்றுள்ள காலங்களில் தெளிப்பதைத் தவிர்க்கவும்",
        "மீண்டும் প্রবেশের காலத்தை (7 நாட்கள்) கவனிக்கவும்",
      ],
    },
    availability: {
      en: ["CIC Agri Centers", "Agrochemical shops"],
      si: ["CIC කෘෂිකර්ම මධ්‍යස්ථාන", "කෘෂි රසායනික ගබඩා"],
      ta: ["சிஐசி விவசாய மையங்கள்", "வேளாண் வேதியியல் கடைகள்"],
    },
    costEstimate: {
      en: "Rs. 5,000 – 7,000 (per hectare)",
      si: "රු. 5,000 – 7,000 (per hectare)",
      ta: "ரூ. 5,000 – 7,000 (per hectare)",
    },
    type: "chemical",
  },

  // 🌱 ORGANIC – Gray Leaf Spot supportive control
  {
    id: "garlic_extract_gray_leaf_spot",
    name: {
      en: "Garlic Extract Spray",
      si: "සුදුළුනු සාරය ස්ප්‍රේ කිරිමේ කිරීම",
      ta: "பூண்டு சாறு தெளிப்பு",
    },
    availableProducts: {
      en: ["Fresh garlic cloves"],
      si: ["නව සුදුළුනු"],
      ta: ["புதிய பூண்டு கிராம்புகள்"],
    },
    applicationMethod: {
      en: "Prepare garlic extract and spray on affected leaves",
      si: "සුදුළුනු සාරය සකසා ආසාදිත කොළ මත ස්ප්‍රේ කිරිමේ කරන්න",
      ta: "பூண்டு சாற்றைத் தயாரித்து, பாதிக்கப்பட்ட இலைகளில் தெளிக்கவும்",
    },
    dosage: {
      en: "50 g crushed garlic per liter of water",
      si: "ලීටර් ජලයකට තලාගත් සුදුළුනු 50 g",
      ta: "ஒரு லிட்டர் தண்ணீருக்கு 50 கிராம் நொறுக்கப்பட்ட பூண்டு",
    },
    schedule: {
      frequency: {
        en: "Every 7 days",
        si: "සෑම දින 7 කට වරක්",
        ta: "ஒவ்வொரு 7 நாட்களுக்கும்",
      },
      duration: {
        en: "Early or mild infection stage",
        si: "මුල් හෝ මෘදු ආසාදන අවධිය",
        ta: "ஆரம்ப அல்லது லேசான தொற்று நிலை",
      },
      bestTime: {
        en: "Evening",
        si: "සවස් වරුවේ",
        ta: "மாலை",
      },
    },
    safety: {
      en: ["Safe for humans and environment", "Use fresh solution only"],
      si: [
        "මිනිසුන්ට හා පරිසරයට ආරක්ෂිත",
        "නව සකස් කළ ද්‍රාවණය පමණක් භාවිත කරන්න",
      ],
      ta: ["மனிதர்களுக்கும் சுற்றுச்சூழலுக்கும் பாதுகாப்பானது", "புதிய தீர்வை மட்டுமே பயன்படுத்தவும்"],
    },
    availability: {
      en: ["Prepared at home"],
      si: ["ගෙදර සකස් කළ හැක"],
      ta: ["வீட்டில் தயாரிக்கப்பட்டது"],
    },
    costEstimate: {
      en: "Rs. 200 – 500",
      si: "රු. 200 – 500",
      ta: "ரூ. 200 – 500",
    },
    type: "organic",
  },
];
