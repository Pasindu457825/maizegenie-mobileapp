/**
 * API Service for AgriOfficer Yield Predictions
 * Handles enhanced predictions with fertilizer scheduling
 */

import { YieldPredictionFormData } from '../types/farmerYieldPrediction';
import { 
  OfficerPredictionRequest, 
  OfficerPredictionResponse, 
  PredictionErrorResponse 
} from '../types/officerPrediction';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

/**
 * Submit officer yield prediction request
 */
export const submitOfficerPrediction = async (
  formData: YieldPredictionFormData,
  officerId: string,
  officerToken: string
): Promise<OfficerPredictionResponse> => {
  try {
    // Build request payload
    const requestPayload: OfficerPredictionRequest = {
      user_role: 'officer',
      officer_id: officerId,
      
      // Soil profile data
      soil_profile: {
        district: formData.district,
        location: formData.location || undefined,
        gps_lat: formData.gps_lat ? (typeof formData.gps_lat === 'string' ? parseFloat(formData.gps_lat) : formData.gps_lat) : undefined,
        gps_lng: formData.gps_lng ? (typeof formData.gps_lng === 'string' ? parseFloat(formData.gps_lng) : formData.gps_lng) : undefined,
        soil_ph: parseFloat(formData.soil_ph || '0'),
        soil_nitrogen: parseFloat(formData.soil_nitrogen || '0'),
        soil_phosphorus: parseFloat(formData.soil_phosphorus || '0'),
        soil_potassium: parseFloat(formData.soil_potassium || '0'),
        soil_type: formData.soil_type_officer || '',
        organic_matter: parseFloat(formData.organic_matter || '0'),
      },
      
      // Climate data (auto-fetched from Weather API)
      climate_data: {
        seasonal_rainfall: formData.seasonal_rainfall || '',
        temperature: formData.temperature || '',
        humidity: formData.humidity || '',
        photoperiod: formData.photoperiod || '',
        climate_auto_fetched: formData.climate_auto_fetched || false,
      },
      
      // Crop measurements (optional)
      crop_measurements: formData.plant_height ? {
        plant_height: parseFloat(formData.plant_height),
        cob_height: formData.cob_height ? parseFloat(formData.cob_height) : undefined,
        cob_length: formData.cob_length ? parseFloat(formData.cob_length) : undefined,
        kernel_rows: formData.kernel_rows ? parseInt(formData.kernel_rows) : undefined,
        wet_weight_per_m2: formData.wet_weight_per_m2 ? parseFloat(formData.wet_weight_per_m2) : undefined,
        measurements_taken: true,
      } : undefined,
      
      // Fertilizer applied (INPUT - what farmer already did)
      fertilizer_applied: {
        basal_npk: parseFloat(formData.basal_npk || '0'),
        top_dress_1_amount: formData.top_dress_1_amount ? parseFloat(formData.top_dress_1_amount) : null,
        top_dress_1_date: formData.top_dress_1_date ? formData.top_dress_1_date.toISOString().split('T')[0] : null,
        top_dress_2_amount: formData.top_dress_2_amount ? parseFloat(formData.top_dress_2_amount) : null,
        top_dress_2_date: formData.top_dress_2_date ? formData.top_dress_2_date.toISOString().split('T')[0] : null,
      },
      
      // Additional context
      planting_date: formData.planting_date ? formData.planting_date.toISOString().split('T')[0] : '',
      variety: formData.variety || '',
      season: formData.season || undefined,
      land_size_value: formData.land_size_value ? parseFloat(formData.land_size_value) : undefined,
      land_size_unit: formData.land_size_unit || undefined,
    };

    // Make API call
    const response = await fetch(`${API_BASE_URL}/v1/yield-prediction/officer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${officerToken}`,
        'Content-Type': 'application/json',
        'X-User-Role': 'officer',
      },
      body: JSON.stringify(requestPayload),
    });

    // Handle response
    if (!response.ok) {
      const errorData: PredictionErrorResponse = await response.json();
      throw new Error(errorData.message || 'Prediction failed');
    }

    const data: OfficerPredictionResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Officer prediction error:', error);
    throw error;
  }
};

/**
 * Get prediction by ID (for viewing past predictions)
 */
export const getOfficerPrediction = async (
  predictionId: string,
  officerToken: string
): Promise<OfficerPredictionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/predictions/${predictionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${officerToken}`,
        'Content-Type': 'application/json',
        'X-User-Role': 'officer',
      },
    });

    if (!response.ok) {
      const errorData: PredictionErrorResponse = await response.json();
      throw new Error(errorData.message || 'Failed to fetch prediction');
    }

    const data: OfficerPredictionResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Get prediction error:', error);
    throw error;
  }
};

/**
 * Get officer's prediction history
 */
export const getOfficerPredictionHistory = async (
  officerId: string,
  officerToken: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ predictions: OfficerPredictionResponse[]; total: number }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/predictions/officer/${officerId}?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${officerToken}`,
          'Content-Type': 'application/json',
          'X-User-Role': 'officer',
        },
      }
    );

    if (!response.ok) {
      const errorData: PredictionErrorResponse = await response.json();
      throw new Error(errorData.message || 'Failed to fetch history');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Get history error:', error);
    throw error;
  }
};

/**
 * Update fertilizer application status
 * (When officer verifies that farmer applied fertilizer)
 */
export const updateFertilizerApplication = async (
  predictionId: string,
  applicationType: 'top_dress_1' | 'top_dress_2',
  appliedAmount: number,
  appliedDate: Date,
  officerToken: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/v1/predictions/${predictionId}/fertilizer-application`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${officerToken}`,
          'Content-Type': 'application/json',
          'X-User-Role': 'officer',
        },
        body: JSON.stringify({
          application_type: applicationType,
          applied_amount: appliedAmount,
          applied_date: appliedDate.toISOString().split('T')[0],
        }),
      }
    );

    if (!response.ok) {
      const errorData: PredictionErrorResponse = await response.json();
      throw new Error(errorData.message || 'Failed to update application');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Update fertilizer application error:', error);
    throw error;
  }
};
