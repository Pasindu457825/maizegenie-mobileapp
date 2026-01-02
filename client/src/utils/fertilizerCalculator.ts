/**
 * Fertilizer Calculator Utility
 * Generates fertilizer plans based on farmer input and DOA guidelines
 */

import {
  CORN_VARIETIES,
  DOA_FERTILIZER_PROGRAM,
  ORGANIC_FERTILIZERS,
  getVarietyRecommendation,
  calculateFertilizerForLandSize,
  getFertilizerSchedule,
  getOrganicRecommendation,
  formatDate
} from '../constants/cornKnowledgeBase';

// ============================================================
// TYPES
// ============================================================

export interface FertilizerPlan {
  basal: {
    tsp_kg: number;
    mop_kg: number;
    urea_kg: number;
    timing: string;
    date: string;
    notes: string[];
  };
  top_dress_1: {
    urea_kg: number;
    timing: string;
    date: string;
    notes: string[];
  };
  top_dress_2: {
    urea_kg: number;
    timing: string;
    date: string;
    notes: string[];
  };
  organic?: {
    compost_tons?: number;
    cattle_manure_tons?: number;
    poultry_manure_tons?: number;
    timing: string;
    notes: string[];
  };
  total_nutrients: {
    nitrogen_kg: number;
    phosphorus_kg: number;
    potassium_kg: number;
  };
  summary: string;
}

export interface FarmerInputData {
  variety: string;
  land_size_ha: number;
  planting_date: string;
  district?: string;
  location?: string;
  irrigation_type?: string;
  rainfall_condition?: string;
  predicted_yield_kg_ha?: number;
  include_organic?: boolean;
}

// ============================================================
// MAIN CALCULATOR FUNCTION
// ============================================================

export function generateFertilizerPlan(input: FarmerInputData): FertilizerPlan {
  const {
    variety,
    land_size_ha,
    planting_date,
    include_organic = true
  } = input;

  // Get variety information
  const varietyInfo = getVarietyRecommendation(variety);
  const varietyType = varietyInfo?.type || 'hybrid';
  const multiplier = varietyInfo?.fertilizerMultiplier || 1.0;

  // Calculate fertilizer amounts
  const amounts = calculateFertilizerForLandSize(land_size_ha, variety);

  // Calculate dates
  const plantDate = new Date(planting_date);
  const schedule = getFertilizerSchedule(plantDate);

  // Get DOA program instructions
  const basalProgram = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'basal');
  const topDress1Program = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'top_dress_1');
  const topDress2Program = DOA_FERTILIZER_PROGRAM.find(p => p.stage === 'top_dress_2');

  // Build fertilizer plan
  const plan: FertilizerPlan = {
    basal: {
      tsp_kg: amounts.basal.tsp,
      mop_kg: amounts.basal.mop,
      urea_kg: amounts.basal.urea,
      timing: 'At planting',
      date: formatDate(schedule.basal),
      notes: basalProgram?.instructions || []
    },
    top_dress_1: {
      urea_kg: amounts.topDress1.urea,
      timing: '3-4 weeks after planting (knee-height)',
      date: formatDate(schedule.topDress1),
      notes: topDress1Program?.instructions || []
    },
    top_dress_2: {
      urea_kg: amounts.topDress2.urea,
      timing: '7-8 weeks after planting (tasseling stage)',
      date: formatDate(schedule.topDress2),
      notes: topDress2Program?.instructions || []
    },
    total_nutrients: calculateTotalNutrients(amounts),
    summary: generateSummary(variety, land_size_ha, varietyType, amounts)
  };

  // Add organic recommendations if requested
  if (include_organic) {
    const organicAmounts = getOrganicRecommendation(land_size_ha);
    plan.organic = {
      compost_tons: organicAmounts.compost,
      cattle_manure_tons: organicAmounts.cattleManure,
      poultry_manure_tons: organicAmounts.poultryManure,
      timing: 'During land preparation (2-3 weeks before planting)',
      notes: [
        'Use well-decomposed compost or manure',
        'Incorporate thoroughly into soil',
        'Choose one organic source based on availability',
        'Organic matter improves soil health and water retention'
      ]
    };
  }

  return plan;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateTotalNutrients(amounts: {
  basal: { tsp: number; mop: number; urea: number };
  topDress1: { urea: number };
  topDress2: { urea: number };
  total: { urea: number; tsp: number; mop: number };
}): { nitrogen_kg: number; phosphorus_kg: number; potassium_kg: number } {
  // Urea contains 46% N
  const nitrogen = amounts.total.urea * 0.46;
  
  // TSP contains 46% P₂O₅
  const phosphorus = amounts.total.tsp * 0.46;
  
  // MOP contains 60% K₂O
  const potassium = amounts.total.mop * 0.60;

  return {
    nitrogen_kg: Math.round(nitrogen * 10) / 10,
    phosphorus_kg: Math.round(phosphorus * 10) / 10,
    potassium_kg: Math.round(potassium * 10) / 10
  };
}

function generateSummary(
  variety: string,
  landSize: number,
  varietyType: string,
  amounts: any
): string {
  const varietyInfo = getVarietyRecommendation(variety);
  const expectedYield = varietyInfo?.yieldPotential.average || 5;

  return `Fertilizer plan for ${landSize} hectares of ${variety} (${varietyType}). ` +
    `Total fertilizer: ${amounts.total.urea} kg Urea, ${amounts.total.tsp} kg TSP, ${amounts.total.mop} kg MOP. ` +
    `Expected yield with proper management: ${expectedYield} tons/ha. ` +
    `Follow DOA guidelines for timing and application methods.`;
}

// ============================================================
// CULTIVATION ADVICE GENERATOR
// ============================================================

export function generateCultivationAdvice(input: FarmerInputData): {
  variety_specific: string[];
  general_tips: string[];
  yield_improvement: string[];
  warnings: string[];
} {
  const varietyInfo = getVarietyRecommendation(input.variety);
  const isHybrid = varietyInfo?.type === 'hybrid';

  const advice = {
    variety_specific: [
      `${input.variety} is a ${varietyInfo?.type || 'hybrid'} variety with yield potential of ${varietyInfo?.yieldPotential.min}-${varietyInfo?.yieldPotential.max} tons/ha`,
      ...varietyInfo?.characteristics || []
    ],
    general_tips: [
      'Maintain 75cm row spacing and 25cm plant spacing',
      'Ensure good drainage to prevent waterlogging',
      'Weed 2-3 times during crop growth (before each fertilizer application)',
      'Monitor for Fall Armyworm and stem borers',
      'Irrigate 1-2 days after fertilizer application',
      'Keep field weed-free during first 6 weeks'
    ],
    yield_improvement: [
      'Follow the recommended fertilizer schedule strictly',
      'Apply fertilizers when soil has adequate moisture',
      'Incorporate organic matter for long-term soil health',
      isHybrid ? 'Hybrid varieties require full fertilizer dose for maximum yield' : 'OP varieties can use 75% of hybrid fertilizer rates',
      'Timely application at tasseling stage is critical for grain filling'
    ],
    warnings: [
      'Do not apply fertilizer to dry soil',
      'Avoid over-application of nitrogen (causes lodging)',
      'Do not apply fertilizer during heavy rain (causes runoff)',
      'Weed before fertilizer application to prevent nutrient competition',
      'Monitor for nutrient deficiency symptoms (yellowing = N deficiency)'
    ]
  };

  return advice;
}

// ============================================================
// EXPECTED YIELD CALCULATOR
// ============================================================

export function calculateExpectedYield(input: FarmerInputData): {
  baseline_yield: number;
  with_fertilizer: number;
  optimal_yield: number;
  improvement_percentage: number;
} {
  const varietyInfo = getVarietyRecommendation(input.variety);
  const avgYield = varietyInfo?.yieldPotential.average || 5;
  const maxYield = varietyInfo?.yieldPotential.max || 6;

  // Baseline without fertilizer (40% of average)
  const baseline = avgYield * 0.4;

  // With DOA fertilizer recommendation (average yield)
  const withFertilizer = avgYield;

  // Optimal management (80% of max yield)
  const optimal = maxYield * 0.8;

  // Improvement percentage
  const improvement = ((withFertilizer - baseline) / baseline) * 100;

  return {
    baseline_yield: Math.round(baseline * 10) / 10,
    with_fertilizer: Math.round(withFertilizer * 10) / 10,
    optimal_yield: Math.round(optimal * 10) / 10,
    improvement_percentage: Math.round(improvement)
  };
}

// ============================================================
// FERTILIZER COST ESTIMATOR (Optional)
// ============================================================

export interface FertilizerCosts {
  urea_price_per_kg: number;
  tsp_price_per_kg: number;
  mop_price_per_kg: number;
}

export function estimateFertilizerCost(
  plan: FertilizerPlan,
  prices: FertilizerCosts
): {
  basal_cost: number;
  top_dress_1_cost: number;
  top_dress_2_cost: number;
  total_cost: number;
} {
  const basalCost = 
    (plan.basal.tsp_kg * prices.tsp_price_per_kg) +
    (plan.basal.mop_kg * prices.mop_price_per_kg) +
    (plan.basal.urea_kg * prices.urea_price_per_kg);

  const topDress1Cost = plan.top_dress_1.urea_kg * prices.urea_price_per_kg;
  const topDress2Cost = plan.top_dress_2.urea_kg * prices.urea_price_per_kg;

  return {
    basal_cost: Math.round(basalCost),
    top_dress_1_cost: Math.round(topDress1Cost),
    top_dress_2_cost: Math.round(topDress2Cost),
    total_cost: Math.round(basalCost + topDress1Cost + topDress2Cost)
  };
}

// ============================================================
// BILINGUAL SUPPORT
// ============================================================

export function translateFertilizerPlan(
  plan: FertilizerPlan,
  language: 'en' | 'si'
): FertilizerPlan {
  if (language === 'en') return plan;

  // Sinhala translations
  return {
    ...plan,
    basal: {
      ...plan.basal,
      timing: 'වගා කිරීමේදී',
      notes: plan.basal.notes.map(note => translateNote(note, 'si'))
    },
    top_dress_1: {
      ...plan.top_dress_1,
      timing: 'සති 3-4 කට පසු (දණහිස උස)',
      notes: plan.top_dress_1.notes.map(note => translateNote(note, 'si'))
    },
    top_dress_2: {
      ...plan.top_dress_2,
      timing: 'සති 7-8 කට පසු (මල් පිපීමේ අවධිය)',
      notes: plan.top_dress_2.notes.map(note => translateNote(note, 'si'))
    },
    organic: plan.organic ? {
      ...plan.organic,
      timing: 'ඉඩම සකස් කිරීමේදී (වගා කිරීමට සති 2-3 කට පෙර)',
      notes: plan.organic.notes.map(note => translateNote(note, 'si'))
    } : undefined
  };
}

function translateNote(note: string, language: 'si'): string {
  // Basic translation mapping (expand as needed)
  const translations: Record<string, string> = {
    'Mix fertilizers into soil during final land preparation': 'අවසාන ඉඩම සකස් කිරීමේදී පොහොර පසට මිශ්‍ර කරන්න',
    'Apply when crop reaches knee-height': 'බෝගය දණහිස උසට ළඟා වූ විට යොදන්න',
    'Apply at tasseling/silking stage': 'මල් පිපීමේ අවධියේදී යොදන්න',
    'Ensure soil has adequate moisture': 'පසෙහි ප්‍රමාණවත් තෙතමනය ඇති බව සහතික කරන්න',
    'Weed before application': 'යෙදීමට පෙර වල් පැලෑටි ඉවත් කරන්න'
  };

  return translations[note] || note;
}
