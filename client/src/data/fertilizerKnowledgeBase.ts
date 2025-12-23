/**
 * Sri Lankan Agricultural Fertilizer Knowledge Base
 * Based on CIC Fertilizer & Department of Agriculture (DOA) Sri Lanka
 * 
 * This data structure supports NLP-based fertilizer advisory system
 * with official, explainable recommendations for maize cultivation
 */

export interface GrowthStage {
  id: string;
  nameEn: string;
  nameSi: string;
  description: string;
  daysAfterPlanting: string;
}

export interface NutrientDeficiency {
  id: string;
  symptomSi: string[];
  symptomEn: string[];
  meaning: string;
  nutrient: string;
  severity: "low" | "medium" | "high";
}

export interface CICFertilizer {
  id: string;
  productName: string;
  productNameSi: string;
  type: string;
  npkRatio?: string;
  micronutrients?: string[];
  useStage: string[];
  benefits: string[];
  benefitsSi: string[];
  soilSuitability?: string;
  packSizes: string[];
  applicationMethod: string;
  applicationMethodSi: string;
}

export interface TimingGuideline {
  id: string;
  condition: string;
  conditionSi: string;
  recommendation: string;
  recommendationSi: string;
  timing: string;
}

export interface WeatherAdvisory {
  id: string;
  situation: string;
  situationSi: string;
  advisory: string;
  advisorySi: string;
  risk: "low" | "medium" | "high";
}

// SECTION 1: MAIZE GROWTH STAGES (DOA)
export const growthStages: GrowthStage[] = [
  {
    id: "land_prep",
    nameEn: "Land Preparation",
    nameSi: "ඉඩම් සකස් කිරීම",
    description: "Soil is prepared with good drainage and loosened for planting",
    daysAfterPlanting: "Before planting",
  },
  {
    id: "planting",
    nameEn: "Planting",
    nameSi: "බීජ රෝපණය",
    description: "Maize seeds are planted in prepared soil",
    daysAfterPlanting: "Day 0",
  },
  {
    id: "early_growth",
    nameEn: "Early Growth",
    nameSi: "මුල් වර්ධන අවධිය",
    description: "Root establishment and first leaves appear",
    daysAfterPlanting: "0-20 days",
  },
  {
    id: "vegetative",
    nameEn: "Vegetative Growth",
    nameSi: "ශාක වර්ධන අවධිය",
    description: "Rapid leaf and stem growth",
    daysAfterPlanting: "20-60 days",
  },
  {
    id: "reproductive",
    nameEn: "Reproductive Stage",
    nameSi: "මල් හා කොබ් වර්ධන අවධිය",
    description: "Flowering and cob formation",
    daysAfterPlanting: "60-90 days",
  },
  {
    id: "maturity",
    nameEn: "Maturity/Harvest",
    nameSi: "අස්වනු අවධිය",
    description: "Crop matures and ready for harvest",
    daysAfterPlanting: "105-115 days",
  },
];

// SECTION 2: NUTRIENT DEFICIENCY SYMPTOMS (DOA)
export const nutrientDeficiencies: NutrientDeficiency[] = [
  {
    id: "nitrogen_def",
    symptomSi: ["කොළ කහ පාට වීම", "කොළ සහ පාට වීම"],
    symptomEn: ["yellow leaves", "pale leaves", "poor leaf greenness"],
    meaning: "Nitrogen deficiency",
    nutrient: "Nitrogen (N)",
    severity: "high",
  },
  {
    id: "nitrogen_phosphorus_def",
    symptomSi: ["වර්ධනය අඩු වීම", "පැල දුර්වල", "වර්ධනය අඩුයි"],
    symptomEn: ["stunted growth", "slow growth", "weak plants", "poor growth"],
    meaning: "Nitrogen or Phosphorus deficiency",
    nutrient: "Nitrogen (N) / Phosphorus (P)",
    severity: "high",
  },
  {
    id: "phosphorus_def",
    symptomSi: ["මුල් දුර්වල වීම", "මුල් දුර්වල"],
    symptomEn: ["weak roots", "poor root development", "weak root system"],
    meaning: "Phosphorus deficiency",
    nutrient: "Phosphorus (P)",
    severity: "medium",
  },
  {
    id: "potassium_def",
    symptomSi: ["කොළ අග වියළීම", "කොළ අග පිළිස්සීම"],
    symptomEn: ["leaf edge burn", "leaf edge drying", "leaf tips burning"],
    meaning: "Potassium deficiency",
    nutrient: "Potassium (K)",
    severity: "medium",
  },
  {
    id: "micronutrient_def",
    symptomSi: ["කොළ මැද කහ වීම", "කොළ නහර කහ වීම"],
    symptomEn: ["interveinal chlorosis", "yellowing between leaf veins", "leaf veins yellow"],
    meaning: "Magnesium or micronutrient deficiency",
    nutrient: "Mg / Micronutrients",
    severity: "low",
  },
];

// SECTION 3: CIC FERTILIZER PRODUCTS
export const cicFertilizers: CICFertilizer[] = [
  {
    id: "cic_522",
    productName: "CIC 522 (Organo Mineral)",
    productNameSi: "CIC 522 (ජෛව හා රසායනික මිශ්‍ර පොහොර)",
    type: "Organo-mineral fertilizer",
    npkRatio: "Balanced N-P-K",
    useStage: ["early_growth", "vegetative"],
    benefits: [
      "Improves root and leaf growth",
      "Enhances soil fertility",
      "Improves nutrient uptake",
    ],
    benefitsSi: [
      "මුල් හා කොළ වර්ධනය වැඩි දියුණු කරයි",
      "පස සාරවත් බව වැඩි කරයි",
      "පෝෂක අවශෝෂණය වැඩි දියුණු කරයි",
    ],
    packSizes: ["25 kg", "60 kg"],
    applicationMethod: "Apply to soil and mix well",
    applicationMethodSi: "පසට යොදා හොඳින් මිශ්‍ර කරන්න",
  },
  {
    id: "yara_grower",
    productName: "Yara Grower",
    productNameSi: "යාරා ග්‍රෝවර්",
    type: "Compound fertilizer",
    npkRatio: "21-7-14",
    useStage: ["vegetative"],
    benefits: [
      "Rapid plant growth",
      "Balanced nutrient supply",
    ],
    benefitsSi: [
      "වේගවත් ශාක වර්ධනය",
      "සමබර පෝෂක සැපයුම",
    ],
    soilSuitability: "Acidic to neutral soils",
    packSizes: ["25 kg"],
    applicationMethod: "Top dressing application",
    applicationMethodSi: "උඩින් පොහොර යෙදීම",
  },
  {
    id: "yaramila_winplex",
    productName: "YaraMila WINPLEX",
    productNameSi: "යාරාමිලා වින්ප්ලෙක්ස්",
    type: "Compound fertilizer with micronutrients",
    npkRatio: "17:8:17 + MgO + S + TE",
    micronutrients: ["B", "Mn", "Zn", "Fe"],
    useStage: ["vegetative", "reproductive"],
    benefits: [
      "Corrects micro-nutrient deficiency",
      "Improves soil pH balance",
      "Enhances flowering and cob formation",
    ],
    benefitsSi: [
      "ක්ෂුද්‍ර පෝෂක ඌනතාව නිවැරදි කරයි",
      "පස pH සමතුලිතතාවය වැඩි දියුණු කරයි",
      "මල් හා කොබ් සෑදීම වැඩි දියුණු කරයි",
    ],
    packSizes: ["25 kg"],
    applicationMethod: "Broadcast or band application",
    applicationMethodSi: "විසිරුවා හෝ පේළි වශයෙන් යොදන්න",
  },
  {
    id: "mp_basal",
    productName: "MP Basal",
    productNameSi: "MP බේසල් පොහොර",
    type: "Basal fertilizer",
    npkRatio: "6-17-10++",
    useStage: ["land_prep", "planting"],
    benefits: [
      "Strong root establishment",
      "Initial nutrient supply",
      "Improves early growth",
    ],
    benefitsSi: [
      "ශක්තිමත් මුල් පද්ධතිය",
      "ආරම්භක පෝෂක සැපයුම",
      "මුල් වර්ධනය වැඩි දියුණු කරයි",
    ],
    packSizes: ["50 kg"],
    applicationMethod: "Mixed with soil before planting",
    applicationMethodSi: "බීජ රෝපණයට පෙර පසට මිශ්‍ර කරන්න",
  },
];

// SECTION 4: DOA FERTILIZER TIMING GUIDELINES
export const timingGuidelines: TimingGuideline[] = [
  {
    id: "basal_application",
    condition: "Before planting",
    conditionSi: "බීජ රෝපණයට පෙර",
    recommendation: "Apply basal fertilizer (MP Basal)",
    recommendationSi: "බේසල් පොහොර යෙදීම (MP Basal)",
    timing: "Day 0",
  },
  {
    id: "top_dressing",
    condition: "15-20 days after planting",
    conditionSi: "බීජ රෝපණයෙන් දින 15-20 පසු",
    recommendation: "Top dressing with nitrogen-rich fertilizer",
    recommendationSi: "නයිට්‍රජන් බහුල පොහොර උඩින් යෙදීම",
    timing: "15-20 days",
  },
  {
    id: "heavy_rain_delay",
    condition: "During heavy rainfall",
    conditionSi: "වර්ෂාව වැඩි විට",
    recommendation: "Delay fertilizer application",
    recommendationSi: "පොහොර දමීම පසුවට යොමු කරන්න",
    timing: "Wait for dry weather",
  },
  {
    id: "dry_soil_split",
    condition: "Dry soil conditions",
    conditionSi: "වියළි පසකදී",
    recommendation: "Apply fertilizer in split doses",
    recommendationSi: "පොහොර කොටස් වශයෙන් යොදන්න",
    timing: "Multiple applications",
  },
];

// SECTION 5: WEATHER & SOIL ADVISORIES (DOA)
export const weatherAdvisories: WeatherAdvisory[] = [
  {
    id: "high_rainfall",
    situation: "High rainfall",
    situationSi: "වර්ෂාව වැඩි",
    advisory: "Risk of fertilizer loss through leaching. Delay application.",
    advisorySi: "පොහොර සෝදා බැස යාමේ අවදානම. යෙදීම ප්‍රමාද කරන්න.",
    risk: "high",
  },
  {
    id: "waterlogged",
    situation: "Waterlogged soil",
    situationSi: "ජලයෙන් පිරුණු පස",
    advisory: "Root damage risk. Improve drainage before fertilizing.",
    advisorySi: "මුල් නසා යාමේ අවදානම. පොහොර දැමීමට පෙර ජලය බැස යාම වැඩි දියුණු කරන්න.",
    risk: "high",
  },
  {
    id: "dry_soil",
    situation: "Dry soil",
    situationSi: "වියළි පස",
    advisory: "Poor nutrient absorption. Water before fertilizer application.",
    advisorySi: "පෝෂක අවශෝෂණය දුර්වල. පොහොර දැමීමට පෙර ජලය දෙන්න.",
    risk: "medium",
  },
  {
    id: "good_drainage",
    situation: "Well-drained soil",
    situationSi: "ජලය හොඳින් බැස යන පස",
    advisory: "Optimal conditions for fertilizer efficiency.",
    advisorySi: "පොහොර කාර්යක්ෂමතාව සඳහා හොඳම තත්ත්වය.",
    risk: "low",
  },
];

/**
 * Helper function to match farmer input (Sinhala/English) to nutrient deficiencies
 */
export const matchSymptoms = (input: string): NutrientDeficiency[] => {
  const lowerInput = input.toLowerCase();
  const matched: NutrientDeficiency[] = [];

  nutrientDeficiencies.forEach((deficiency) => {
    const allSymptoms = [...deficiency.symptomSi, ...deficiency.symptomEn];
    const hasMatch = allSymptoms.some((symptom) =>
      lowerInput.includes(symptom.toLowerCase())
    );

    if (hasMatch) {
      matched.push(deficiency);
    }
  });

  return matched;
};

/**
 * Helper function to recommend fertilizers based on growth stage and deficiencies
 */
export const recommendFertilizers = (
  growthStageId: string,
  deficiencies: NutrientDeficiency[]
): CICFertilizer[] => {
  const recommended: CICFertilizer[] = [];

  // Filter fertilizers suitable for current growth stage
  const stageAppropriate = cicFertilizers.filter((fert) =>
    fert.useStage.includes(growthStageId)
  );

  // If deficiencies detected, prioritize accordingly
  if (deficiencies.length > 0) {
    const needsNitrogen = deficiencies.some((d) => d.nutrient.includes("N"));
    const needsPhosphorus = deficiencies.some((d) => d.nutrient.includes("P"));
    const needsMicronutrients = deficiencies.some((d) =>
      d.nutrient.includes("Mg") || d.nutrient.includes("Micronutrients")
    );

    if (needsMicronutrients) {
      recommended.push(...cicFertilizers.filter((f) => f.id === "yaramila_winplex"));
    }

    if (needsNitrogen && growthStageId === "vegetative") {
      recommended.push(...cicFertilizers.filter((f) => f.id === "yara_grower"));
    }

    if (needsPhosphorus || growthStageId === "early_growth") {
      recommended.push(...cicFertilizers.filter((f) => f.id === "cic_522"));
    }
  }

  // Add stage-appropriate fertilizers
  stageAppropriate.forEach((fert) => {
    if (!recommended.find((r) => r.id === fert.id)) {
      recommended.push(fert);
    }
  });

  return recommended.slice(0, 3); // Return top 3 recommendations
};

/**
 * Helper function to get weather-based advisories
 */
export const getWeatherAdvisory = (input: string): WeatherAdvisory[] => {
  const lowerInput = input.toLowerCase();
  const matched: WeatherAdvisory[] = [];

  weatherAdvisories.forEach((advisory) => {
    const situations = [advisory.situation.toLowerCase(), advisory.situationSi];
    const hasMatch = situations.some((situation) =>
      lowerInput.includes(situation)
    );

    if (hasMatch) {
      matched.push(advisory);
    }
  });

  return matched;
};
