/**
 * Screen C: Weather Condition
 * Final screen of yield prediction flow
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CloudRain, ChevronLeft, Send, Cloud } from 'lucide-react-native';
import { useYieldForm } from '../../contexts/YieldFormContext';
import { CustomDropdown } from '../../components/forms/CustomDropdown';
import {
  RAINFALL_CONDITIONS,
  RainfallCondition,
  YieldPredictionRequest,
} from '../../types/yieldPrediction';

export const WeatherConditionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { formData, updateFormData, errors, setErrors, resetForm } = useYieldForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingWeather, setIsDetectingWeather] = useState(false);

  // TODO: Implement actual weather API detection based on GPS location
  const handleWeatherDetection = async () => {
    if (!formData.gps_lat || !formData.gps_lng) {
      Alert.alert(
        'GPS Required',
        'Please enable GPS location in the first screen to auto-detect weather.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsDetectingWeather(true);

    try {
      // TODO: Replace with actual weather API call
      // const weatherData = await fetchWeatherData(formData.gps_lat, formData.gps_lng);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock detection - replace with actual API response
      const detectedCondition: RainfallCondition = 'Normal';
      
      updateFormData({
        rainfall_condition: detectedCondition,
        weather_auto_detected: true,
      });

      Alert.alert(
        'Weather Detected',
        `Rainfall condition: ${detectedCondition}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Weather detection error:', error);
      Alert.alert(
        'Detection Failed',
        'Failed to detect weather. Please select manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDetectingWeather(false);
    }
  };

  const validateScreen = (): boolean => {
    const newErrors: any = {};

    if (!formData.rainfall_condition) {
      newErrors.rainfall_condition = 'Please describe recent rainfall in your area.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildRequestPayload = (): YieldPredictionRequest => {
    // Safely handle planting date - use current date if not provided
    let plantingDateStr = '';
    try {
      if (formData.planting_date && formData.planting_date instanceof Date && !isNaN(formData.planting_date.getTime())) {
        plantingDateStr = formData.planting_date.toISOString().split('T')[0];
      } else {
        // Use current date as fallback
        plantingDateStr = new Date().toISOString().split('T')[0];
      }
    } catch (error) {
      console.warn('Invalid planting date, using current date:', error);
      plantingDateStr = new Date().toISOString().split('T')[0];
    }

    // Use detected season or default to Maha if not available
    const season = formData.season || 'Maha';

    return {
      district: formData.district as any,
      location: formData.location,
      gps_lat: formData.gps_lat,
      gps_lng: formData.gps_lng,
      season: season as any,
      planting_date: plantingDateStr,
      land_size_value: parseFloat(formData.land_size_value),
      land_size_unit: 'Acres', // Fixed unit - always Acres
      soil_condition: formData.soil_condition as any,
      irrigation_type: formData.irrigation_type as any,
      variety: formData.variety as any,
      rainfall_condition: formData.rainfall_condition as any,
    };
  };

  const handleSubmit = async () => {
    if (!validateScreen()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildRequestPayload();
      
      console.log('Yield Prediction Payload:', JSON.stringify(payload, null, 2));

      // Navigate to loading screen with the payload
      // The loading screen will handle the API call and show results
      (navigation as any).navigate('PredictYieldLoading', { 
        payload,
        formData 
      });

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Submission Failed',
        'Failed to submit prediction request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <CloudRain size={28} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.headerTitle}>Weather Condition</Text>
          <Text style={styles.headerSubtitle}>Step 3 of 3</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rainfall Information</Text>
          <Text style={styles.sectionDescription}>
            Recent rainfall affects soil moisture and crop growth. Select the condition that best describes your area.
          </Text>

          {/* Auto-detect Weather Button */}
          {formData.gps_lat && formData.gps_lng && (
            <TouchableOpacity
              style={styles.detectButton}
              onPress={handleWeatherDetection}
              disabled={isDetectingWeather}
            >
              {isDetectingWeather ? (
                <ActivityIndicator size="small" color="#16A34A" />
              ) : (
                <Cloud size={20} color="#16A34A" />
              )}
              <Text style={styles.detectButtonText}>
                {isDetectingWeather ? 'Detecting Weather...' : 'Auto-Detect from GPS'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Manual Selection */}
          <CustomDropdown
            label="Rainfall Condition"
            value={formData.rainfall_condition}
            options={RAINFALL_CONDITIONS}
            onChange={(value) => updateFormData({ 
              rainfall_condition: value as RainfallCondition,
              weather_auto_detected: false,
            })}
            error={errors.rainfall_condition}
            mandatory
            placeholder="Select rainfall condition"
          />

          {formData.weather_auto_detected && (
            <View style={styles.autoDetectedBadge}>
              <Cloud size={16} color="#3B82F6" />
              <Text style={styles.autoDetectedText}>Auto-detected from location</Text>
            </View>
          )}

          {/* Summary Section */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>📋 Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>District:</Text>
              <Text style={styles.summaryValue}>{formData.district || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Season:</Text>
              <Text style={styles.summaryValue}>{formData.season || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Land Size:</Text>
              <Text style={styles.summaryValue}>
                {formData.land_size_value ? `${formData.land_size_value} Acres` : '-'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Variety:</Text>
              <Text style={styles.summaryValue}>{formData.variety || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Soil:</Text>
              <Text style={styles.summaryValue}>{formData.soil_condition || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Irrigation:</Text>
              <Text style={styles.summaryValue}>{formData.irrigation_type || '-'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          disabled={isSubmitting}
        >
          <ChevronLeft size={20} color="#16A34A" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Submit Prediction</Text>
              <Send size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  detectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  autoDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  autoDetectedText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
