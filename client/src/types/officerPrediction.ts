/**
 * Type definitions for AgriOfficer Yield Prediction
 * Enhanced prediction with fertilizer scheduling outputs
 */

// Fertilizer application status
export type FertilizerStatus = 'done' | 'partial' | 'pending';

// Single fertilizer application (basal, top-dress 1, top-dress 2)
export interface FertilizerApplication {
  date: string; // ISO date string
  day_number: number; // Days after planting
  recommended_amount: number; // kg/ha
  applied_amount: number; // kg/ha (from officer input)
  remaining_amount: number; // kg/ha (calculated)
  status: FertilizerStatus;
  adjustment_reason?: string;
  timing_warning?: string | null;
  instructions_si: string;
  instructions_en: string;
}

// Complete fertilizer schedule (OUTPUT - what farmer should do)
export interface FertilizerSchedule {
  total_n_requirement: number;
  total_p_requirement: number;
  total_k_requirement: number;
  
  basal: FertilizerApplication & {
    npk_amount: number;
  };
  
  top_dress_1: FertilizerApplication;
  top_dress_2: FertilizerApplication;
  
  warnings: string[];
  
  calendar_events: Array<{
    title: string;
    date: string;
    description: string;
    reminder_days_before: number;
  }>;
}

// Impact factor from SHAP analysis
export interface ImpactFactor {
  factor: string;
  value: number | string;
  impact: number;
  impact_percentage: number;
  description: string;
}

// Recommendation priority
export type RecommendationPriority = 'high' | 'medium' | 'low';

// Single recommendation
export interface Recommendation {
  priority: RecommendationPriority;
  category: string;
  title_si: string;
  title_en: string;
  description_si: string;
  description_en: string;
}

// Officer-specific insights
export interface OfficerInsights {
  soil_health_score: number; // 0-10
  fertilizer_efficiency: number; // 0-1
  expected_roi: number; // Return on investment multiplier
  risk_factors: string[];
  field_visit_recommendations: string[];
}

// Complete officer prediction response
export interface OfficerPredictionResponse {
  status: 'success';
  prediction_id: string;
  timestamp: string;
  
  // Basic prediction
  prediction: {
    predicted_yield: number;
    yield_unit: string;
    confidence_score: number;
    yield_category: string;
    
    harvest_window: {
      start_date: string;
      target_date: string;
      end_date: string;
      days_to_harvest: number;
    };
  };
  
  // 🟥 OUTPUT: Fertilizer schedule (ONLY for officers)
  fertilizer_schedule: FertilizerSchedule;
  
  // Impact factors (SHAP values)
  impact_factors: ImpactFactor[];
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Officer-specific insights
  officer_insights: OfficerInsights;
}

// Request payload for officer prediction
export interface OfficerPredictionRequest {
  user_role: 'officer';
  officer_id: string;
  farmer_id?: string;
  
  soil_profile: {
    district: string;
    location?: string;
    gps_lat?: number;
    gps_lng?: number;
    soil_ph: number;
    soil_nitrogen: number;
    soil_phosphorus: number;
    soil_potassium: number;
    soil_type: string;
    organic_matter: number;
  };
  
  climate_data: {
    seasonal_rainfall: string;
    temperature: string;
    humidity: string;
    photoperiod: string;
    climate_auto_fetched?: boolean;
  };
  
  crop_measurements?: {
    plant_height?: number;
    cob_height?: number;
    cob_length?: number;
    kernel_rows?: number;
    wet_weight_per_m2?: number;
    measurements_taken?: boolean;
  };
  
  fertilizer_applied: {
    basal_npk: number;
    top_dress_1_amount?: number | null;
    top_dress_1_date?: string | null;
    top_dress_2_amount?: number | null;
    top_dress_2_date?: string | null;
  };
  
  planting_date: string;
  variety: string;
  season?: string;
  land_size_value?: number;
  land_size_unit?: string;
}

// Error response
export interface PredictionErrorResponse {
  status: 'error';
  error_code: string;
  message: string;
  details?: Record<string, any>;
}
