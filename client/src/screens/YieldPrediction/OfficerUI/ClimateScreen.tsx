/**
 * AgriOfficer Screen 2: Climate & Environment
 * Auto-fetches climate data from Weather API
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Cloud, ChevronLeft, ChevronRight, RefreshCw, MapPin } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { translations } from '../../../translations/translationYieldPrediction';
import { fetchClimateData as fetchWeatherClimateData, getLocationCoordinates } from '../../../services/weatherApi';

export const ClimateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { formData, updateFormData, language } = useYieldForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get translations
  const t = translations.officerClimate[language];

  // Auto-fetch climate data on mount
  useEffect(() => {
    fetchClimateData();
  }, []);

  const fetchClimateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let lat: number;
      let lng: number;

      // Try to get coordinates from GPS data first
      if (formData.gps_lat && formData.gps_lng) {
        lat = typeof formData.gps_lat === 'string' ? parseFloat(formData.gps_lat) : formData.gps_lat;
        lng = typeof formData.gps_lng === 'string' ? parseFloat(formData.gps_lng) : formData.gps_lng;
      } else if (formData.district) {
        // Use location-specific coordinates if available, fallback to district center
        const coords = getLocationCoordinates(formData.location || '', formData.district);
        if (!coords) {
          throw new Error('Location coordinates not found');
        }
        lat = coords.lat;
        lng = coords.lng;
      } else {
        throw new Error('No location data available');
      }

      // Fetch climate data from OpenWeatherMap API
      const climateData = await fetchWeatherClimateData(lat, lng, formData.district);

      // Update form data with fetched climate data
      updateFormData({
        seasonal_rainfall: climateData.seasonal_rainfall,
        temperature: climateData.temperature,
        humidity: climateData.humidity,
        photoperiod: climateData.photoperiod,
        climate_auto_fetched: true,
      });

      setError(null);
      
    } catch (err) {
      console.error('Climate fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : t.fetchError;
      setError(errorMessage);
      
      Alert.alert(
        language === 'si' ? 'දෝෂයකි' : 'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchClimateData();
  };

  const handleNext = () => {
    // No validation needed - all fields are auto-fetched
    navigation.navigate('OfficerCropMeasurements' as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const hasClimateData = formData.seasonal_rainfall || formData.temperature || 
                         formData.humidity || formData.photoperiod;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Cloud size={28} color="#16A34A" />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Auto-fetch Badge */}
        <View style={styles.badge}>
          <MapPin size={16} color="#16A34A" />
          <Text style={styles.badgeText}>{t.autoFetched}</Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.loadingText}>{t.fetchingData}</Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>
                {language === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Climate Data Display */}
        {!isLoading && (
          <View style={styles.card}>
            {/* Info Message */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                {language === 'si' 
                  ? 'දේශගුණ දත්ත ස්වයංක්‍රීයව ලබාගනු ලැබේ. පසුව backend සම්බන්ධ කරන විට මෙම දත්ත Weather API වෙතින් ලබාගනු ලැබේ.'
                  : 'Climate data will be auto-fetched from Weather API when backend is connected. Currently ready for integration.'}
              </Text>
            </View>

            {/* Seasonal Rainfall */}
            <View style={styles.dataField}>
              <Text style={styles.label}>{t.seasonalRainfall}</Text>
              <View style={styles.dataDisplay}>
                <Text style={styles.dataValue}>
                  {formData.seasonal_rainfall || '--'}
                </Text>
                <Text style={styles.dataUnit}>mm</Text>
              </View>
            </View>

            {/* Temperature */}
            <View style={styles.dataField}>
              <Text style={styles.label}>{t.temperature}</Text>
              <View style={styles.dataDisplay}>
                <Text style={styles.dataValue}>
                  {formData.temperature || '--'}
                </Text>
                <Text style={styles.dataUnit}>°C</Text>
              </View>
            </View>

            {/* Humidity */}
            <View style={styles.dataField}>
              <Text style={styles.label}>{t.humidity}</Text>
              <View style={styles.dataDisplay}>
                <Text style={styles.dataValue}>
                  {formData.humidity || '--'}
                </Text>
                <Text style={styles.dataUnit}>%</Text>
              </View>
            </View>

            {/* Photoperiod */}
            <View style={styles.dataField}>
              <Text style={styles.label}>{t.photoperiod}</Text>
              <View style={styles.dataDisplay}>
                <Text style={styles.dataValue}>
                  {formData.photoperiod || '--'}
                </Text>
                <Text style={styles.dataUnit}>
                  {language === 'si' ? 'පැය' : 'hours'}
                </Text>
              </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw size={18} color="#16A34A" />
              <Text style={styles.refreshButtonText}>
                {language === 'si' ? 'නැවුම් කරන්න' : 'Refresh Data'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#16A34A" />
          <Text style={styles.backButtonText}>{t.backButton}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>{t.nextButton}</Text>
          <ChevronRight size={20} color="#FFFFFF" />
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
  headerContent: {
    flex: 1,
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  dataField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dataDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16A34A',
    flex: 1,
  },
  dataUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16A34A',
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
  nextButton: {
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
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
