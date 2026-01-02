/**
 * Seasonal Climate Data for Sri Lankan Districts
 * 
 * Data sources:
 * - climate-data.org: Anuradhapura, Badulla, Matale
 * - timeanddate.com: Monaragala
 * - weather-atlas.com: Ampara
 * 
 * Seasons:
 * - Maha: October-February (wet north-east monsoon)
 * - Yala: May-September (drier south-west monsoon)
 * 
 * Note: These are historical seasonal averages, not current weather data.
 * Use these values for ML model predictions.
 */

export interface SeasonalClimateData {
  avg_temp_c: number;        // Average temperature in Celsius
  avg_humidity_pct: number;  // Average relative humidity percentage
  total_rainfall_mm: number; // Total seasonal rainfall in millimeters
}

export interface DistrictSeasonalClimate {
  Maha: SeasonalClimateData;
  Yala: SeasonalClimateData;
}

export const SEASONAL_CLIMATE: Record<string, DistrictSeasonalClimate> = {
  "Anuradhapura": {
    // Maha season (Oct–Feb) draws from the wet north‑east monsoon.
    "Maha": {
      avg_temp_c: 25.2,
      avg_humidity_pct: 81,
      total_rainfall_mm: 750
    },
    // Yala (May–Sep) corresponds to the drier south‑west monsoon period.
    "Yala": {
      avg_temp_c: 27.4,
      avg_humidity_pct: 76,
      total_rainfall_mm: 322
    }
  },
  "Badulla": {
    // Cool high‑elevation district; highest rainfall in Oct–Dec.
    "Maha": {
      avg_temp_c: 20.9,
      avg_humidity_pct: 84,
      total_rainfall_mm: 1015
    },
    // Yala (May–Sep) is warmer and drier.
    "Yala": {
      avg_temp_c: 23.8,
      avg_humidity_pct: 70,
      total_rainfall_mm: 451
    }
  },
  "Matale": {
    // Wettest months are Oct–Dec; high humidity.
    "Maha": {
      avg_temp_c: 23.2,
      avg_humidity_pct: 83,
      total_rainfall_mm: 993
    },
    // Yala season sees moderate rainfall.
    "Yala": {
      avg_temp_c: 24.7,
      avg_humidity_pct: 79,
      total_rainfall_mm: 579
    }
  },
  "Ampara": {
    // Tropical lowland district; November and December are the wettest months (220–272 mm).
    "Maha": {
      avg_temp_c: 25.7,
      avg_humidity_pct: 83,
      total_rainfall_mm: 990
    },
    // June–July have the lowest rainfall (≈30 mm) and humidity around 68 %.
    "Yala": {
      avg_temp_c: 29.0,
      avg_humidity_pct: 70,
      total_rainfall_mm: 345
    }
  },
  "Monaragala": {
    // High rainfall during the north‑east monsoon; October–November precipitation exceeds 8 inches.
    "Maha": {
      avg_temp_c: 27.2,
      avg_humidity_pct: 79,
      total_rainfall_mm: 610
    },
    // May–Sep temperatures around 28 °C with lower rainfall.
    "Yala": {
      avg_temp_c: 28.1,
      avg_humidity_pct: 81,
      total_rainfall_mm: 543
    }
  },
  "Colombo": {
    // Western Province wet zone; high rainfall throughout the year, especially during monsoons.
    "Maha": {
      avg_temp_c: 26.8,
      avg_humidity_pct: 82,
      total_rainfall_mm: 1350
    },
    // Yala season still receives significant rainfall due to south-west monsoon.
    "Yala": {
      avg_temp_c: 28.2,
      avg_humidity_pct: 85,
      total_rainfall_mm: 1650
    }
  },
  "Kalutara": {
    // Coastal wet zone district; very high rainfall, especially during Yala (south-west monsoon).
    "Maha": {
      avg_temp_c: 27.0,
      avg_humidity_pct: 83,
      total_rainfall_mm: 1400
    },
    // Peak rainfall during south-west monsoon period.
    "Yala": {
      avg_temp_c: 28.5,
      avg_humidity_pct: 88,
      total_rainfall_mm: 1850
    }
  }
};

/**
 * Get seasonal climate data for a district and season
 * @param district District name
 * @param season Season name (Maha or Yala)
 * @returns Seasonal climate data or null if not found
 */
export const getSeasonalClimate = (
  district: string,
  season: "Maha" | "Yala"
): SeasonalClimateData | null => {
  const districtData = SEASONAL_CLIMATE[district];
  if (!districtData) {
    console.warn(`No seasonal climate data for district: ${district}`);
    return null;
  }
  return districtData[season];
};

/**
 * Get all available districts with seasonal climate data
 */
export const getAvailableDistricts = (): string[] => {
  return Object.keys(SEASONAL_CLIMATE);
};
