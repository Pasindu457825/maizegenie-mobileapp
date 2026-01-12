/**
 * Districts and Locations for Maize Cultivation in Sri Lanka
 * Updated list based on agricultural zones
 */

export interface LocationData {
  latitude: number;
  longitude: number;
  soilTypes: string[];
}

// Soil type mapping: Full name -> Database abbreviation
export const SOIL_TYPE_MAPPING: Record<string, string> = {
  "Reddish Brown Earth": "RBE",
  "Red-Yellow Podzolic": "RYP",
  "Low Humic Gley": "LHG",
  "Immature Brown Loam": "IBL",
  "Alluvial Soil": "Alluvial",
  "Lateritic Soil": "Alluvial", // Map to closest match
};

// Reverse mapping for display: Database abbreviation -> Full name
export const SOIL_TYPE_DISPLAY: Record<string, string> = {
  "RBE": "Reddish Brown Earth",
  "RYP": "Red-Yellow Podzolic",
  "LHG": "Low Humic Gley",
  "IBL": "Immature Brown Loam",
  "Alluvial": "Alluvial Soil",
};

export const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Colombo",
  "Kalutara",
  "Matale",
  "Monaragala"
];

// Sinhala translations for districts
export const DISTRICTS_SINHALA: Record<string, string> = {
  "Ampara": "අම්පාර",
  "Anuradhapura": "අනුරාධපුරය",
  "Badulla": "බදුල්ල",
  "Colombo": "කොළඹ",
  "Kalutara": "කළුතර",
  "Matale": "මාතලේ",
  "Monaragala": "මොණරාගල"
};

// Sinhala translations for locations
export const LOCATIONS_SINHALA: Record<string, Record<string, string>> = {
  "Ampara": {
    "Dehiattakandiya": "දෙහිආටකන්දිය",
    "Maha Oya": "මහ ඔය",
    "Padiyathalawa": "පදියතලාව"
  },
  "Anuradhapura": {
    "Eppawala": "ඇප්පාවල",
    "Horowpathana": "හොරොව්පතන",
    "Kahatagasdigiliya": "කහටගස්දිගිලිය",
    "Nochchiyagama": "නොච්චියාගම",
    "Tambuttegama": "තඹුත්තේගම"
  },
  "Badulla": {
    "Mahiyanganaya": "මහියංගනය",
    "Rideemaliyadda": "රිදීමලියද්ද"
  },
  "Colombo": {
    "Kaduwela": "කඩුවෙල",
    "Malabe": "මාලබේ",
    "Pittugala": "පිට්ටුගල"
  },
  "Kalutara": {
    "Panadura": "පානදුර"
  },
  "Matale": {
    "Dambulla": "දඹුල්ල",
    "Pelwehera": "පෙල්වෙහෙර"
  },
  "Monaragala": {
    "Buttala": "බුත්තල",
    "Siyambalanduwa": "සියඹලාන්දුව",
    "Thanamalwila": "තනමල්විල",
    "Wellawaya": "වැල්ලවාය"
  }
};

export const LOCATIONS_BY_DISTRICT: Record<string, string[]> = {
  "Ampara": [
    "Dehiattakandiya",
    "Maha Oya",
    "Padiyathalawa"
  ],
  "Anuradhapura": [
    "Eppawala",
    "Horowpathana",
    "Kahatagasdigiliya",
    "Nochchiyagama",
    "Tambuttegama"
  ],
  "Badulla": [
    "Mahiyanganaya",
    "Rideemaliyadda"
  ],
  "Colombo": [
    "Kaduwela",
    "Malabe",
    "Pittugala"
  ],
  "Kalutara": [
    "Panadura"
  ],
  "Matale": [
    "Dambulla",
    "Pelwehera"
  ],
  "Monaragala": [
    "Buttala",
    "Siyambalanduwa",
    "Thanamalwila",
    "Wellawaya"
  ]
};

/**
 * Location coordinates and soil types
 * Note: Coordinates are approximate and should be verified for GPS matching
 */
export const LOCATION_COORDINATES: Record<string, Record<string, LocationData>> = {
  "Ampara": {
    "Dehiattakandiya": {
      latitude: 7.8167,
      longitude: 81.1833,
      soilTypes: ["Reddish Brown Earth", "Low Humic Gley"]
    },
    "Maha Oya": {
      latitude: 7.7500,
      longitude: 81.4500,
      soilTypes: ["Reddish Brown Earth", "Alluvial Soil"]
    },
    "Padiyathalawa": {
      latitude: 7.7000,
      longitude: 81.0500,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    }
  },
  "Anuradhapura": {
    "Eppawala": {
      latitude: 8.1500,
      longitude: 80.4500,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    },
    "Horowpathana": {
      latitude: 8.3667,
      longitude: 80.4000,
      soilTypes: ["Reddish Brown Earth", "Low Humic Gley"]
    },
    "Kahatagasdigiliya": {
      latitude: 8.0167,
      longitude: 80.6333,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    },
    "Nochchiyagama": {
      latitude: 8.3167,
      longitude: 80.1333,
      soilTypes: ["Reddish Brown Earth", "Low Humic Gley"]
    },
    "Tambuttegama": {
      latitude: 8.0167,
      longitude: 80.1833,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    }
  },
  "Badulla": {
    "Mahiyanganaya": {
      latitude: 7.3333,
      longitude: 81.0000,
      soilTypes: ["Red-Yellow Podzolic", "Immature Brown Loam"]
    },
    "Rideemaliyadda": {
      latitude: 7.2000,
      longitude: 81.1500,
      soilTypes: ["Red-Yellow Podzolic", "Reddish Brown Earth"]
    }
  },
  "Colombo": {
    "Kaduwela": {
      latitude: 6.9333,
      longitude: 79.9833,
      soilTypes: ["Red-Yellow Podzolic", "Alluvial Soil"]
    },
    "Malabe": {
      latitude: 6.9167,
      longitude: 79.9667,
      soilTypes: ["Red-Yellow Podzolic", "Lateritic Soil"]
    },
    "Pittugala": {
      latitude: 6.9000,
      longitude: 79.9500,
      soilTypes: ["Red-Yellow Podzolic", "Alluvial Soil"]
    }
  },
  "Kalutara": {
    "Panadura": {
      latitude: 6.7133,
      longitude: 79.9025,
      soilTypes: ["Red-Yellow Podzolic", "Lateritic Soil"]
    }
  },
  "Matale": {
    "Dambulla": {
      latitude: 7.8667,
      longitude: 80.6500,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    },
    "Pelwehera": {
      latitude: 7.9500,
      longitude: 80.5000,
      soilTypes: ["Reddish Brown Earth", "Low Humic Gley"]
    }
  },
  "Monaragala": {
    "Buttala": {
      latitude: 6.7500,
      longitude: 81.2333,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    },
    "Siyambalanduwa": {
      latitude: 6.8500,
      longitude: 81.5333,
      soilTypes: ["Reddish Brown Earth", "Low Humic Gley"]
    },
    "Thanamalwila": {
      latitude: 6.4667,
      longitude: 81.2667,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    },
    "Wellawaya": {
      latitude: 6.7333,
      longitude: 81.1000,
      soilTypes: ["Reddish Brown Earth", "Red-Yellow Podzolic"]
    }
  }
};

/**
 * Get locations for a specific district
 */
export const getLocationsForDistrict = (district: string): string[] => {
  return LOCATIONS_BY_DISTRICT[district] || [];
};

/**
 * Get location data (coordinates and soil types)
 */
export const getLocationData = (district: string, location: string): LocationData | null => {
  const districtData = LOCATION_COORDINATES[district];
  if (!districtData) return null;
  return districtData[location] || null;
};

/**
 * Get soil types for a location
 */
export const getSoilTypesForLocation = (district: string, location: string): string[] => {
  const locationData = getLocationData(district, location);
  return locationData?.soilTypes || [];
};
