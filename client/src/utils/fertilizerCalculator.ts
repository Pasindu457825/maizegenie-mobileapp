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
import { getEffectivePlan } from '../services/fertilizerPlanService';
import type { FertilizerPlanRecord } from '../services/fertilizerPlanService';

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
  language?: 'si' | 'en';
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
  const si = input.language === 'si';

  if (si) {
    const varietyType = isHybrid ? 'දෙමුහුන්' : varietyInfo?.type === 'open_pollinated' ? 'විවෘත පරාග' : 'දේශීය';
    const characteristics = varietyInfo?.characteristics?.map(c => translateCharacteristic(c)) || [];

    return {
      variety_specific: [
        `${input.variety} යනු ${varietyType} ප්‍රභේදයක් වන අතර අස්වැන්න විභවය ${varietyInfo?.yieldPotential.min}-${varietyInfo?.yieldPotential.max} ටොන්/හෙක්ටයාරයට වේ`,
        ...characteristics
      ],
      general_tips: [
        'පේළි අතර සෙන්ටිමීටර 75 ක් සහ පැළ අතර සෙන්ටිමීටර 25 ක් පරතරය පවත්වන්න',
        'ජලය බැස යාම සහතික කර ජලය රැඳීම වළක්වන්න',
        'බෝග වර්ධන කාලය තුළ 2-3 වතාවක් වල් පැලෑටි ඉවත් කරන්න (සෑම පොහොර යෙදීමකට පෙර)',
        'සේනා පණුවා සහ කඳ විදින පණුවන් සඳහා නිරීක්ෂණය කරන්න',
        'පොහොර යෙදීමෙන් දින 1-2 කට පසු ජලය සපයන්න',
        'මුල් සති 6 තුළ කෙත වල් නැති ලෙස පවත්වන්න'
      ],
      yield_improvement: [
        'නිර්දේශිත පොහොර කාලසටහන හරියටම අනුගමනය කරන්න',
        'පසේ ප්‍රමාණවත් තෙතමනය ඇති විට පොහොර යොදන්න',
        'දිගුකාලීන පස සෞඛ්‍යයට කාබනික පදාර්ථ එකතු කරන්න',
        isHybrid ? 'දෙමුහුන් ප්‍රභේද සඳහා උපරිම අස්වැන්නට සම්පූර්ණ පොහොර මාත්‍රාව අවශ්‍යයි' : 'විවෘත පරාග ප්‍රභේද සඳහා දෙමුහුන් පොහොර අනුපාතයෙන් 75% ක් ප්‍රමාණවත්ය',
        'මල් පිපීමේ අවධියේ කාලෝචිත පොහොර යෙදීම ධාන්‍ය පිරවීම සඳහා ඉතා වැදගත්ය'
      ],
      warnings: [
        'වියළි පසට පොහොර නොයොදන්න',
        'නයිට්‍රජන් අධික ලෙස යෙදීමෙන් වළකින්න (බෝගය වැටීමට හේතු වේ)',
        'බලවත් වැසි වේලාවට පොහොර නොයොදන්න (සෝදා යාමට හේතු වේ)',
        'පෝෂක තරඟය වැළැක්වීමට පොහොර යෙදීමට පෙර වල් පැලෑටි ඉවත් කරන්න',
        'පෝෂක ඌනතා රෝග ලක්ෂණ නිරීක්ෂණය කරන්න (කහ පැහැ වීම = නයිට්‍රජන් ඌනතාව)'
      ]
    };
  }

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

function translateCharacteristic(c: string): string {
  const map: Record<string, string> = {
    'High-yielding hybrid': 'ඉහළ අස්වැන්නක් ලබා දෙන දෙමුහුන් ප්‍රභේදය',
    'Good drought tolerance': 'නියඟ සහිත තත්ත්වයන්ට හොඳ ඔරොත්තු දීමේ හැකියාව',
    'Promoted by CIC Agri Businesses': 'CIC කෘෂි ව්‍යාපාර මගින් ප්‍රවර්ධනය කෙරේ',
    'Excellent grain quality': 'ඉතා හොඳ ධාන්‍ය ගුණාත්මක බව',
    'Widely grown hybrid': 'බහුලව වගා කරන දෙමුහුන් ප්‍රභේදය',
    'Improved pest resistance': 'වැඩි දියුණු කළ පළිබෝධ ප්‍රතිරෝධය',
    'Stable performance': 'ස්ථාවර කාර්ය සාධනය',
    'Good for Dry Zone': 'වියළි කලාපයට සුදුසුය',
    'Top-performing hybrid in Sri Lanka': 'ශ්‍රී ලංකාවේ ඉහළම කාර්ය සාධනය ඇති දෙමුහුන් ප්‍රභේදය',
    'Highest yield potential (9-10 t/ha)': 'ඉහළම අස්වැන්න විභවය (හෙක්ටයාරයට ටොන් 9-10)',
    'Requires optimal management': 'ප්‍රශස්ත කළමනාකරණය අවශ්‍යයි',
    'Best for well-managed farms': 'හොඳින් කළමනාකරණය කරන ගොවිපලවලට වඩාත් සුදුසුය',
    'Vigorous growth': 'ශක්තිමත් වර්ධනය',
    'Stable yields across seasons': 'සෑම කන්නයකම ස්ථාවර අස්වැන්නක්',
    'Popular in Dry Zone': 'වියළි කලාපයේ ජනප්‍රියයි',
    'Used in fertilizer trials': 'පොහොර අත්හදා බැලීම් සඳහා යොදා ගැනේ',
    'Large cob with deep kernels': 'ගැඹුරු ධාන්‍ය සහිත විශාල බඩ ඉරිඟු කරල්',
    'High yield potential': 'ඉහළ අස්වැන්න විභවය',
    'Strong farmer uptake': 'ගොවීන් අතර ඉහළ ප්‍රචලිතභාවය',
    'Good performance across seasons': 'සෑම කන්නයකම හොඳ කාර්ය සාධනය',
    'Traditional local maize variety': 'සම්ප්‍රදායික දේශීය බඩ ඉරිඟු ප්‍රභේදය',
    'Hardy and reliable under low-input conditions': 'අඩු යෙදවුම් තත්ත්වයන්හි ශක්තිමත් සහ විශ්වාසදායකය',
    'Lower fertilizer requirements (75% of hybrid rates)': 'අඩු පොහොර අවශ්‍යතා (දෙමුහුන් අනුපාතයෙන් 75%)',
    'Well-adapted to local conditions': 'දේශීය තත්ත්වයන්ට හොඳින් අනුවර්තනය වී ඇත',
  };
  return map[c] || c;
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

// ============================================================
// SUPABASE-AWARE FERTILIZER PLAN GENERATOR
// ============================================================

/**
 * Async version of generateFertilizerPlan that fetches the plan from Supabase first.
 * Falls back to the hardcoded DOA defaults if Supabase has no data.
 */
export async function generateFertilizerPlanAsync(input: FarmerInputData): Promise<FertilizerPlan> {
  const { variety, land_size_ha, planting_date, include_organic = true } = input;

  try {
    const dbPlan = await getEffectivePlan(variety);
    return buildPlanFromRecord(dbPlan, land_size_ha, planting_date, include_organic);
  } catch (err) {
    console.warn('⚠️ Supabase plan fetch failed, using hardcoded defaults:', err);
    return generateFertilizerPlan(input);
  }
}

/**
 * Build a FertilizerPlan from a Supabase FertilizerPlanRecord.
 */
function buildPlanFromRecord(
  record: FertilizerPlanRecord,
  landSizeHa: number,
  plantingDate: string,
  includeOrganic: boolean
): FertilizerPlan {
  const plantDate = new Date(plantingDate);

  // Calculate schedule dates
  const basalDate = new Date(plantDate);
  const td1Date = new Date(plantDate);
  td1Date.setDate(td1Date.getDate() + record.top_dress_1_days_after_planting);
  const td2Date = new Date(plantDate);
  td2Date.setDate(td2Date.getDate() + record.top_dress_2_days_after_planting);

  // Scale per-ha amounts by land size only
  // NOTE: DB values already include the variety multiplier (applied in buildDefaultPlans),
  //       so we must NOT multiply by fertilizer_multiplier again here.
  const basalTsp = Math.round(Number(record.basal_tsp_kg_per_ha) * landSizeHa * 10) / 10;
  const basalMop = Math.round(Number(record.basal_mop_kg_per_ha) * landSizeHa * 10) / 10;
  const basalUrea = Math.round(Number(record.basal_urea_kg_per_ha) * landSizeHa * 10) / 10;
  const td1Urea = Math.round(Number(record.top_dress_1_urea_kg_per_ha) * landSizeHa * 10) / 10;
  const td2Urea = Math.round(Number(record.top_dress_2_urea_kg_per_ha) * landSizeHa * 10) / 10;

  const totalUrea = Math.round((basalUrea + td1Urea + td2Urea) * 10) / 10;

  const plan: FertilizerPlan = {
    basal: {
      tsp_kg: basalTsp,
      mop_kg: basalMop,
      urea_kg: basalUrea,
      timing: record.basal_timing,
      date: formatDate(basalDate),
      notes: record.basal_instructions || [],
    },
    top_dress_1: {
      urea_kg: td1Urea,
      timing: record.top_dress_1_timing,
      date: formatDate(td1Date),
      notes: record.top_dress_1_instructions || [],
    },
    top_dress_2: {
      urea_kg: td2Urea,
      timing: record.top_dress_2_timing,
      date: formatDate(td2Date),
      notes: record.top_dress_2_instructions || [],
    },
    total_nutrients: {
      nitrogen_kg: Math.round(totalUrea * 0.46 * 10) / 10,
      phosphorus_kg: Math.round(basalTsp * 0.46 * 10) / 10,
      potassium_kg: Math.round(basalMop * 0.60 * 10) / 10,
    },
    summary: `Fertilizer plan for ${landSizeHa} hectares of ${record.variety} (${record.variety_type}). ` +
      `Total fertilizer: ${totalUrea} kg Urea, ${basalTsp} kg TSP, ${basalMop} kg MOP. ` +
      `Expected yield: ${record.yield_potential_avg} tons/ha.`,
  };

  if (includeOrganic) {
    plan.organic = {
      compost_tons: Math.round(Number(record.organic_compost_tons_per_ha) * landSizeHa * 10) / 10,
      cattle_manure_tons: Math.round(Number(record.organic_cattle_manure_tons_per_ha) * landSizeHa * 10) / 10,
      poultry_manure_tons: Math.round(Number(record.organic_poultry_manure_tons_per_ha) * landSizeHa * 10) / 10,
      timing: 'During land preparation (2-3 weeks before planting)',
      notes: [
        'Use well-decomposed compost or manure',
        'Incorporate thoroughly into soil',
        'Choose one organic source based on availability',
        'Organic matter improves soil health and water retention',
      ],
    };
  }

  return plan;
}
