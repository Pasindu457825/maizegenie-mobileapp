/**
 * Yield Prediction API Service
 * Handles communication with FastAPI backend for yield predictions
 */

import { API_BASE } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// REQUEST INTERFACES
// ============================================================

export interface FarmerPredictionRequest {
    farmer_id: string;
    district: string;
    location?: string;
    planting_date: string; // YYYY-MM-DD format
    season: string;
    land_size_value: number;
    land_size_unit: string; // "Acres" or "Hectares"
    
    // Crop details (mandatory - same as officer)
    variety: string;
    planting_month: number; // Planting month (1-12)
    field_size_ha: number; // Field size in hectares
    
    // Fertilizer Dates (mandatory - same as officer)
    first_fert_date: string; // First fertilizer application date (YYYY-MM-DD)
    second_fert_date?: string; // Second fertilizer application date (YYYY-MM-DD)
    
    // Soil information
    soil_type?: string; // Soil type (Reddish Brown Earth, Red-Yellow Podzolic, etc.)
    soil_condition: string; // "Good", "Medium", "Poor"
    
    // Soil test data (mandatory - farmer must provide soil testing results)
    soil_ph: number; // Soil pH level (0-14)
    soil_nitrogen_n: number; // Nitrogen content (ppm)
    soil_phosphorus_p: number; // Phosphorus content (ppm)
    soil_potassium_k: number; // Potassium content (ppm)
    soil_fertility_index: number; // Soil fertility index (0-1)
    
    // NPK Status Classification (mandatory - same as officer)
    n_status_class: string; // Nitrogen status: Low/Medium/High
    p_status_class: string; // Phosphorus status: Low/Medium/High
    k_status_class: string; // Potassium status: Low/Medium/High
    
    // Field conditions
    irrigation_type: string; // "Irrigated", "Rainfed", "Mixed"
    rainfall_condition: string; // "High", "Normal", "Low"
    
    // Weather data (mandatory - same as officer)
    rainfall_30d: number; // 30-day rainfall in mm
    seasonal_rainfall: number; // Seasonal total rainfall in mm
    avg_temperature: number; // Average temperature in Celsius
    max_temperature: number; // Maximum temperature in Celsius
    avg_humidity: number; // Average humidity percentage
    sunshine_hours: number; // Daily sunshine hours
    
    // Weather data source tracking
    weather_data_source?: string; // "auto" or "manual"
}

// ============================================================
// RESPONSE INTERFACES
// ============================================================

export interface PredictionData {
    predicted_yield_kg_per_ha: number;
    predicted_yield_tons_per_ha: number;
    confidence_level: 'High' | 'Medium' | 'Low';
    confidence_score: number; // 0-100
    yield_lower_bound?: number;
    yield_upper_bound?: number;
    prediction_method: 'ml_model' | 'rule_based' | 'hybrid';
    model_version: string;
}

export interface ImpactFactor {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description_english: string;
    description_sinhala: string;
    weight: number; // 0-1
}

export interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    title_english: string;
    title_sinhala: string;
    description_english: string;
    description_sinhala: string;
    icon: string;
}

export interface FarmerPredictionResponse {
    prediction_id: string;
    farmer_input_id: string;
    timestamp: string;
    prediction: PredictionData;
    impact_factors: ImpactFactor[];
    primary_limiting_factors: string[];
    recommendations: Recommendation[];
    summary_english: string;
    summary_sinhala: string;
    status: string;
}

export interface PredictionErrorResponse {
    message: string;
    details?: any;
    timestamp: string;
    status: string;
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Submit farmer yield prediction request
 * @param data Farmer prediction request data
 * @returns Prediction response with yield estimate and recommendations
 */
export const predictYieldFarmer = async (
    data: FarmerPredictionRequest,
    token?: string
): Promise<FarmerPredictionResponse> => {
    try {
        console.log('🌾 Submitting farmer prediction request...');
        console.log('📍 API Endpoint:', `${API_BASE}/api/v1/yield-prediction/farmer`);
        console.log('📦 Request Data:', JSON.stringify(data, null, 2));

        // Get token from AsyncStorage if not provided
        const authToken = token || await AsyncStorage.getItem('auth_token');
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        
        // Add Authorization header if token exists
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            console.log('🔐 Using authentication token');
        } else {
            console.warn('⚠️ No authentication token found');
        }

        const response = await fetch(`${API_BASE}/api/v1/yield-prediction/farmer`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        console.log('📡 Response Status:', response.status);

        if (!response.ok) {
            const errorData: PredictionErrorResponse = await response.json();
            console.error('❌ API Error:', errorData);
            
            // Handle token expiration specifically
            if (response.status === 401) {
                const errorMessage = (errorData as any).detail || errorData.message || '';
                if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
                    throw new Error('Your session has expired. Please log in again.');
                }
                throw new Error('Authentication failed. Please log in again.');
            }
            
            throw new Error(errorData.message || 'Prediction request failed');
        }

        const result: FarmerPredictionResponse = await response.json();
        console.log('✅ Prediction successful!');
        console.log('📊 Predicted Yield:', result.prediction.predicted_yield_kg_per_ha, 'kg/ha');
        
        return result;
    } catch (error) {
        console.error('❌ Prediction API Error:', error);
        
        // Network error or other issues
        if (error instanceof TypeError) {
            throw new Error('Network error. Please check your connection and ensure the server is running.');
        }
        
        throw error;
    }
};

/**
 * Get prediction history for authenticated farmer
 * @param limit Maximum number of predictions to return (default: 10)
 * @returns Prediction history with shareable text
 */
export const getFarmerPredictionHistory = async (
    limit: number = 10
): Promise<any> => {
    try {
        console.log('📊 Fetching farmer prediction history...');
        
        // Get token from AsyncStorage
        const authToken = await AsyncStorage.getItem('auth_token');
        
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        // Add Authorization header
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        } else {
            throw new Error('Authentication required. Please login.');
        }

        const response = await fetch(
            `${API_BASE}/api/v1/yield-prediction/farmer/history?limit=${limit}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch prediction history');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ History API Error:', error);
        throw error;
    }
};

/**
 * Get a specific prediction by ID
 * @param predictionId Prediction ID
 * @returns Prediction details
 */
export const getPredictionById = async (
    predictionId: string
): Promise<FarmerPredictionResponse> => {
    try {
        const response = await fetch(
            `${API_BASE}/api/v1/yield-prediction/farmer/${predictionId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch prediction');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Get Prediction Error:', error);
        throw error;
    }
};
