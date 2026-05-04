import axios from 'axios';
import { WetYieldPredictionRequest, WetYieldPredictionResponse } from '../types/wetYieldPrediction';
import { API_BASE } from './api';

export const wetYieldPredictionService = {
  async predictWetYield(data: WetYieldPredictionRequest): Promise<WetYieldPredictionResponse> {
    try {
      console.log('🌾 Wet Yield Prediction API URL:', `${API_BASE}/api/wet-yield/predict`);
      console.log('📊 Request Data:', data);
      
      const response = await axios.post<WetYieldPredictionResponse>(
        `${API_BASE}/api/wet-yield/predict`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      console.log('✅ Prediction Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Prediction Error:', error);
      if (error.response) {
        console.error('Response Error:', error.response.data);
        throw new Error(error.response.data.detail || 'Prediction failed');
      } else if (error.request) {
        console.error('Request Error:', error.request);
        throw new Error('Network error. Please check your connection and ensure the server is running.');
      } else {
        console.error('Unknown Error:', error.message);
        throw new Error('An unexpected error occurred');
      }
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE}/api/wet-yield/health`, {
        timeout: 5000,
      });
      return response.data.model_loaded === true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  async getSupportedVarieties(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE}/api/wet-yield/varieties`, {
        timeout: 5000,
      });
      return response.data.varieties;
    } catch (error) {
      console.error('Failed to fetch varieties:', error);
      return [];
    }
  },
};
