/**
 * Corn/Maize Knowledge Base for Sri Lanka
 * Based on Department of Agriculture (DOA) guidelines and research
 */

// ============================================================
// CORN VARIETIES
// ============================================================

export interface CornVariety {
  id: string;
  name: string;
  type: 'hybrid' | 'open_pollinated' | 'local';
  yieldPotential: {
    min: number; // tons/ha
    max: number; // tons/ha
    average: number; // tons/ha
  };
  characteristics: string[];
  fertilizerMultiplier: number; // 1.0 for hybrids, 0.75 for OP
  growthDuration: number; // days
  suitableSeasons: ('Maha' | 'Yala')[];
}

export const CORN_VARIETIES: Record<string, CornVariety> = {
  'Commando': {
    id: 'commando',
    name: 'Commando',
    type: 'hybrid',
    yieldPotential: { min: 5, max: 6.5, average: 5.5 },
    characteristics: [
      'High-yielding hybrid',
      'Good drought tolerance',
      'Promoted by CIC Agri Businesses',
      'Excellent grain quality'
    ],
    fertilizerMultiplier: 1.0,
    growthDuration: 110,
    suitableSeasons: ['Maha', 'Yala']
  },
  'GT200': {
    id: 'gt200',
    name: 'GT200',
    type: 'hybrid',
    yieldPotential: { min: 4.5, max: 6, average: 5.2 },
    characteristics: [
      'Widely grown hybrid',
      'Improved pest resistance',
      'Stable performance',
      'Good for Dry Zone'
    ],
    fertilizerMultiplier: 0.95,
    growthDuration: 105,
    suitableSeasons: ['Maha', 'Yala']
  },
  'GT 709': {
    id: 'gt_709',
    name: 'GT 709',
    type: 'hybrid',
    yieldPotential: { min: 7, max: 10, average: 8.5 },
    characteristics: [
      'Top-performing hybrid in Sri Lanka',
      'Highest yield potential (9-10 t/ha)',
      'Requires optimal management',
      'Best for well-managed farms'
    ],
    fertilizerMultiplier: 1.1,
    growthDuration: 115,
    suitableSeasons: ['Maha', 'Yala']
  },
  'Jet 999': {
    id: 'jet_999',
    name: 'Jet 999',
    type: 'hybrid',
    yieldPotential: { min: 5, max: 6.5, average: 5.8 },
    characteristics: [
      'Vigorous growth',
      'Stable yields across seasons',
      'Popular in Dry Zone',
      'Used in fertilizer trials'
    ],
    fertilizerMultiplier: 1.03,
    growthDuration: 110,
    suitableSeasons: ['Maha', 'Yala']
  },
  'Pacific 808': {
    id: 'pacific_808',
    name: 'Pacific 808 (CP808)',
    type: 'hybrid',
    yieldPotential: { min: 5.5, max: 7, average: 6.2 },
    characteristics: [
      'Large cob with deep kernels',
      'High yield potential',
      'Strong farmer uptake',
      'Good performance across seasons'
    ],
    fertilizerMultiplier: 1.05,
    growthDuration: 112,
    suitableSeasons: ['Maha', 'Yala']
  },
  'Local Variety': {
    id: 'local_variety',
    name: 'Local Variety',
    type: 'local',
    yieldPotential: { min: 2.5, max: 4, average: 3.2 },
    characteristics: [
      'Traditional local maize variety',
      'Hardy and reliable under low-input conditions',
      'Lower fertilizer requirements (75% of hybrid rates)',
      'Well-adapted to local conditions'
    ],
    fertilizerMultiplier: 0.75,
    growthDuration: 100,
    suitableSeasons: ['Maha', 'Yala']
  }
};

// ============================================================
// FERTILIZER RECOMMENDATIONS (DOA Guidelines)
// ============================================================

export interface FertilizerApplication {
  stage: 'basal' | 'top_dress_1' | 'top_dress_2';
  timing: string;
  daysAfterPlanting: number;
  fertilizers: {
    name: string;
    type: 'TSP' | 'MOP' | 'Urea';
    amountPerHa: number; // kg/ha
    nutrient: string;
  }[];
  instructions: string[];
}

export const DOA_FERTILIZER_PROGRAM: FertilizerApplication[] = [
  {
    stage: 'basal',
    timing: 'At planting',
    daysAfterPlanting: 0,
    fertilizers: [
      {
        name: 'Triple Superphosphate',
        type: 'TSP',
        amountPerHa: 100,
        nutrient: 'Phosphorus (P₂O₅) - 45-46 kg/ha'
      },
      {
        name: 'Muriate of Potash',
        type: 'MOP',
        amountPerHa: 75,
        nutrient: 'Potassium (K₂O) - 30-45 kg/ha'
      },
      {
        name: 'Urea (Starter)',
        type: 'Urea',
        amountPerHa: 35,
        nutrient: 'Nitrogen (N) - 16 kg/ha'
      }
    ],
    instructions: [
      'Mix fertilizers into soil during final land preparation',
      'Can place in planting holes for better uptake',
      'Ensure good soil moisture before application',
      'Cover fertilizer with soil to prevent losses'
    ]
  },
  {
    stage: 'top_dress_1',
    timing: '3-4 weeks after planting (knee-height)',
    daysAfterPlanting: 25,
    fertilizers: [
      {
        name: 'Urea',
        type: 'Urea',
        amountPerHa: 65,
        nutrient: 'Nitrogen (N) - 30 kg/ha'
      }
    ],
    instructions: [
      'Apply when crop reaches knee-height',
      'Ensure soil has adequate moisture',
      'Apply uniformly along rows',
      'Lightly incorporate or water-in to reduce volatilization',
      'Weed before application',
      'In Maha season, apply before rainfall',
      'In Yala season, irrigate after application'
    ]
  },
  {
    stage: 'top_dress_2',
    timing: '7-8 weeks after planting (tasseling stage)',
    daysAfterPlanting: 52,
    fertilizers: [
      {
        name: 'Urea',
        type: 'Urea',
        amountPerHa: 65,
        nutrient: 'Nitrogen (N) - 30 kg/ha'
      }
    ],
    instructions: [
      'Apply at tasseling/silking stage',
      'Critical for grain filling',
      'Ensure adequate soil moisture',
      'Do not apply too late (past flowering)',
      'Avoid excessive N to prevent lodging',
      'Apply to moist soil for best uptake'
    ]
  }
];

// Total NPK: ~100-120 kg N, 45-46 kg P₂O₅, 30-45 kg K₂O per hectare

// ============================================================
// ORGANIC FERTILIZER RECOMMENDATIONS
// ============================================================

export interface OrganicFertilizer {
  type: string;
  amountPerHa: { min: number; max: number; recommended: number }; // tons/ha
  timing: string;
  benefits: string[];
  precautions: string[];
}

export const ORGANIC_FERTILIZERS: Record<string, OrganicFertilizer> = {
  compost: {
    type: 'Compost',
    amountPerHa: { min: 5, max: 10, recommended: 7.5 },
    timing: 'During land preparation (2nd ploughing)',
    benefits: [
      'Improves soil structure',
      'Increases water retention',
      'Adds organic matter and humus',
      'Provides slow-release nutrients',
      'Enhances microbial activity'
    ],
    precautions: [
      'Use well-decomposed compost only',
      'Follow SLS 1684:2020 quality standards',
      'Incorporate thoroughly into soil',
      'Allow 1-2 weeks before planting'
    ]
  },
  cattle_manure: {
    type: 'Cattle/Buffalo Manure',
    amountPerHa: { min: 10, max: 20, recommended: 12.5 },
    timing: '2-3 weeks before planting',
    benefits: [
      'Slow-release nitrogen source',
      'Adds potassium and organic matter',
      'Improves soil fertility over time',
      'Cost-effective for smallholders'
    ],
    precautions: [
      'Apply well before planting',
      'Work into soil thoroughly',
      'Higher quantities needed due to lower nutrient density',
      'Ensure proper decomposition'
    ]
  },
  poultry_manure: {
    type: 'Poultry Manure',
    amountPerHa: { min: 2, max: 3, recommended: 2.5 },
    timing: '3-4 weeks before planting',
    benefits: [
      'Higher nitrogen content than cattle manure',
      'Rich in phosphorus',
      'Quick-acting nutrients'
    ],
    precautions: [
      'Must be well-composted',
      'High ammonia content - can burn seedlings',
      'Apply well before seeding',
      'Use smaller quantities than cattle manure'
    ]
  }
};

// ============================================================
// CULTIVATION TIPS & BEST PRACTICES
// ============================================================

export const CULTIVATION_TIPS = {
  land_preparation: [
    'Plough 2-3 times to achieve fine tilth',
    'Ensure good drainage to prevent waterlogging',
    'Incorporate organic matter during final ploughing',
    'Level the field properly'
  ],
  planting: [
    'Maintain 75cm row spacing',
    'Keep 25cm plant-to-plant spacing',
    'Plant at 3-5cm depth',
    'Ensure good seed-soil contact',
    'Plant when soil has adequate moisture'
  ],
  water_management: [
    'Maha season: Mostly rain-fed, supplemental irrigation if needed',
    'Yala season: Regular irrigation required',
    'Critical stages: Tasseling and grain filling',
    'Avoid waterlogging - ensure drainage',
    'Irrigate 1-2 days after fertilizer application'
  ],
  weed_management: [
    'Weed 2-3 times during crop growth',
    'First weeding at 2-3 weeks',
    'Second weeding at 5-6 weeks',
    'Weed before each fertilizer application',
    'Keep field weed-free during first 6 weeks'
  ],
  pest_management: [
    'Monitor for Fall Armyworm during vegetative stage',
    'Check for stem borers',
    'Scout regularly for pest damage',
    'Use IPM practices',
    'Consult DOA for pest outbreaks'
  ],
  nutrient_deficiency_signs: [
    'Yellowing leaves → Nitrogen deficiency',
    'Purple/reddish leaves → Phosphorus deficiency',
    'Leaf margin burning → Potassium deficiency',
    'Stunted growth → Multiple nutrient deficiencies'
  ]
};

// ============================================================
// YIELD IMPROVEMENT FACTORS
// ============================================================

export const YIELD_FACTORS = {
  fertilizer_impact: {
    no_fertilizer: 'Baseline yield (~2-2.5 t/ha)',
    doa_recommendation: 'Expected yield increase: +150-200% (5-6 t/ha)',
    optimal_management: 'Potential yield: 7-10 t/ha (for high-yielding hybrids)'
  },
  organic_vs_chemical: {
    organic_only: '~60% of chemical fertilizer yield',
    chemical_only: '100% yield potential (but degrades soil over time)',
    integrated: 'Best approach: 100%+ yield + improved soil health'
  },
  variety_selection: {
    hybrid_advantage: 'Hybrids yield ~40% higher than OP varieties',
    top_hybrids: 'GT 709, Pacific 808, Commando for maximum yield',
    op_varieties: 'Local varieties for lower-input farming'
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getVarietyRecommendation(variety: string): CornVariety | null {
  return CORN_VARIETIES[variety] || null;
}

export function calculateFertilizerForLandSize(
  landSizeHa: number,
  variety: string
): {
  basal: { tsp: number; mop: number; urea: number };
  topDress1: { urea: number };
  topDress2: { urea: number };
  total: { urea: number; tsp: number; mop: number };
} {
  const varietyInfo = getVarietyRecommendation(variety);
  const multiplier = varietyInfo?.fertilizerMultiplier || 1.0;

  const basal = {
    tsp: Math.round(100 * landSizeHa * multiplier * 10) / 10,
    mop: Math.round(75 * landSizeHa * multiplier * 10) / 10,
    urea: Math.round(35 * landSizeHa * multiplier * 10) / 10
  };

  const topDress1 = {
    urea: Math.round(65 * landSizeHa * multiplier * 10) / 10
  };

  const topDress2 = {
    urea: Math.round(65 * landSizeHa * multiplier * 10) / 10
  };

  const total = {
    urea: Math.round((basal.urea + topDress1.urea + topDress2.urea) * 10) / 10,
    tsp: basal.tsp,
    mop: basal.mop
  };

  return { basal, topDress1, topDress2, total };
}

export function getFertilizerSchedule(plantingDate: Date): {
  basal: Date;
  topDress1: Date;
  topDress2: Date;
} {
  const basal = new Date(plantingDate);
  
  const topDress1 = new Date(plantingDate);
  topDress1.setDate(topDress1.getDate() + 25); // 3-4 weeks (average 25 days)
  
  const topDress2 = new Date(plantingDate);
  topDress2.setDate(topDress2.getDate() + 52); // 7-8 weeks (average 52 days)
  
  return { basal, topDress1, topDress2 };
}

export function getOrganicRecommendation(landSizeHa: number): {
  compost: number;
  cattleManure: number;
  poultryManure: number;
} {
  return {
    compost: Math.round(ORGANIC_FERTILIZERS.compost.amountPerHa.recommended * landSizeHa * 10) / 10,
    cattleManure: Math.round(ORGANIC_FERTILIZERS.cattle_manure.amountPerHa.recommended * landSizeHa * 10) / 10,
    poultryManure: Math.round(ORGANIC_FERTILIZERS.poultry_manure.amountPerHa.recommended * landSizeHa * 10) / 10
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
