/**
 * Yield Prediction Types for Farmer Interface
 * MaizeGenie Mobile App
 */

// ==================== Enums & Constants ====================

export const DISTRICTS = [
  'Anuradhapura',
  'Monaragala',
  'Badulla',
  'Ampara',
] as const;

export type District = typeof DISTRICTS[number];

export const LOCATIONS_BY_DISTRICT: Record<District, string[]> = {
  Anuradhapura: [
    'Eppawala',
    'Tambuttegama',
    'Nochchiyagama',
    'Kahatagasdigiliya',
    'Horowpathana',
  ],
  Monaragala: [
    'Siyambalanduwa',
    'Wellawaya',
    'Buttala',
    'Thanamalwila',
  ],
  Ampara: [
    'Maha Oya',
    'Padiyathalawa',
    'Dehiattakandiya',
  ],
  Badulla: [
    'Mahiyanganaya',
    'Rideemaliyadda',
  ],
};

export const SEASONS = ['Maha', 'Yala'] as const;
export type Season = typeof SEASONS[number];

export const LAND_UNITS = ['Acres', 'Hectares', 'Perches'] as const;
export type LandUnit = typeof LAND_UNITS[number];

export const SOIL_CONDITIONS = ['Good', 'Medium', 'Poor'] as const;
export type SoilCondition = typeof SOIL_CONDITIONS[number];

export const IRRIGATION_TYPES = ['Rainfed', 'Irrigated'] as const;
export type IrrigationType = typeof IRRIGATION_TYPES[number];

export const MAIZE_VARIETIES = [
  'Jet 999',
  'Pacific 808 (C.P.808)',
  'GT 709',
  'GT200',
  'Commando',
] as const;
export type MaizeVariety = typeof MAIZE_VARIETIES[number];

export const RAINFALL_CONDITIONS = ['Low', 'Normal', 'High'] as const;
export type RainfallCondition = typeof RAINFALL_CONDITIONS[number];

// ==================== Form Data Interfaces ====================

/**
 * Screen A: Location & Field Information
 */
export interface LocationFieldData {
  district: District | '';
  location: string;
  gps_enabled: boolean;
  gps_lat: number | null;
  gps_lng: number | null;
  planting_date: Date | null;
  season: Season | '';
  land_size_value: string;
  land_size_unit: LandUnit; // Always has a default value, never empty
  soil_condition: SoilCondition | '';
  irrigation_type: IrrigationType | '';
}

/**
 * Screen B: Crop Information
 */
export interface CropInformationData {
  variety: MaizeVariety | '';
}

/**
 * Screen C: Weather Condition
 */
export interface WeatherConditionData {
  rainfall_condition: RainfallCondition | '';
  weather_auto_detected: boolean;
}

/**
 * Complete Yield Prediction Form Data
 */
export interface YieldPredictionFormData
  extends LocationFieldData,
    CropInformationData,
    WeatherConditionData {}

/**
 * Initial/Default Form State
 */
export const INITIAL_FORM_DATA: YieldPredictionFormData = {
  // Location & Field
  district: '',
  location: '',
  gps_enabled: false,
  gps_lat: null,
  gps_lng: null,
  planting_date: null,
  season: '',
  land_size_value: '',
  land_size_unit: 'Acres',
  soil_condition: '',
  irrigation_type: '',
  
  // Crop Information
  variety: '',
  
  // Weather Condition
  rainfall_condition: '',
  weather_auto_detected: false,
};

// ==================== Validation Error Types ====================

export type ValidationErrors = Partial<Record<keyof YieldPredictionFormData, string>>;

// ==================== API Request/Response Types ====================

/**
 * API Request Payload for Yield Prediction
 */
export interface YieldPredictionRequest {
  district: District;
  location: string;
  gps_lat: number | null;
  gps_lng: number | null;
  season: Season;
  planting_date: string; // ISO date string
  land_size_value: number; // Mandatory field
  land_size_unit: 'Acres'; // Fixed unit - always Acres
  soil_condition: SoilCondition;
  irrigation_type: IrrigationType;
  variety: MaizeVariety;
  rainfall_condition: RainfallCondition;
}

/**
 * API Response for Yield Prediction
 * (Structure to be finalized when backend is implemented)
 */
export interface YieldPredictionResponse {
  prediction_id: string;
  predicted_yield: number;
  unit: string;
  confidence_score: number;
  factors: {
    name: string;
    impact: 'High' | 'Medium' | 'Low';
    value: number;
  }[];
  recommendations: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
  created_at: string;
}

// ==================== Utility Types ====================

/**
 * GPS Location
 */
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Weather Detection Result
 */
export interface WeatherDetectionResult {
  rainfall_condition: RainfallCondition;
  temperature: number;
  location: string;
  detected_at: string;
}

/**
 * Variety Option with Image
 */
export interface VarietyOption {
  value: MaizeVariety;
  label: string;
  image: any; // require() path
  description: string;
}
