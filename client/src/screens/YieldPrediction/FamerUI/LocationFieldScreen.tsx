/**
 * Screen A: Location & Field Information
 * First screen of yield prediction flow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MapPin, ChevronRight, Plus, Minus } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { CustomDatePicker } from '../../../components/forms/CustomDatePicker';
import { CustomRadioGroup } from '../../../components/forms/CustomRadioGroup';
import { LocationPicker } from '../../../components/forms/LocationPicker';
import {
  DISTRICTS,
  SOIL_CONDITIONS,
  IRRIGATION_TYPES,
  District,
  SoilCondition,
  IrrigationType,
  Season,
} from '../../../types/farmerYieldPrediction';
import { TextInput } from 'react-native-paper';
import { translations, translateOption } from '../../../translations/translationYieldPrediction';

export const LocationFieldScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { formData, updateFormData, errors, setErrors, language, setLanguage } = useYieldForm();

  // Get language from route params and set in context
  useEffect(() => {
    const params = route.params as { language?: 'si' | 'en' };
    if (params?.language) {
      setLanguage(params.language);
    }
  }, [route.params]);

  // Get translations
  const t = translations.locationField[language];

  // Auto-detect season from planting date
  useEffect(() => {
    if (formData.planting_date) {
      const month = formData.planting_date.getMonth() + 1; // 1-12
      
      // Maha: Sep-Jan (months 9,10,11,12,1)
      // Yala: Apr-Aug (months 4,5,6,7,8)
      let detectedSeason: Season | '' = '';
      
      if ([9, 10, 11, 12, 1].includes(month)) {
        detectedSeason = 'Maha';
      } else if ([4, 5, 6, 7, 8].includes(month)) {
        detectedSeason = 'Yala';
      }
      
      if (detectedSeason && detectedSeason !== formData.season) {
        updateFormData({ season: detectedSeason });
      }
    }
  }, [formData.planting_date]);

  const validateScreen = (): boolean => {
    const newErrors: any = {};

    if (!formData.district) {
      newErrors.district = t.errorDistrict;
    }

    if (!formData.location) {
      newErrors.location = t.errorLocation;
    }

    // Planting date is now OPTIONAL
    // Only validate if user has entered a date
    if (formData.planting_date) {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (formData.planting_date > today) {
        newErrors.planting_date = t.errorPlantingDateFuture;
      } else if (formData.planting_date < sixMonthsAgo) {
        newErrors.planting_date = t.errorPlantingDateOld;
      }
    }

    if (!formData.soil_condition) {
      newErrors.soil_condition = t.errorSoilCondition;
    }

    if (!formData.irrigation_type) {
      newErrors.irrigation_type = t.errorIrrigation;
    }

    // Validate land size (mandatory)
    if (!formData.land_size_value || formData.land_size_value.trim() === '') {
      newErrors.land_size_value = t.errorLandSize;
    } else {
      const landSize = parseFloat(formData.land_size_value);
      if (isNaN(landSize) || landSize <= 0) {
        newErrors.land_size_value = t.errorLandSizePositive;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateScreen()) {
      navigation.navigate('CropInformation' as never);
    }
  };

  // Get min/max dates for planting date
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MapPin size={28} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* District */}
          <CustomDropdown
            label={t.district}
            value={formData.district}
            options={DISTRICTS}
            onChange={(value) => updateFormData({ district: value as District, location: '' })}
            error={errors.district}
            mandatory
          />

          {/* Location Picker with GPS */}
          <LocationPicker
            district={formData.district}
            selectedLocation={formData.location}
            gpsEnabled={formData.gps_enabled}
            gpsLat={formData.gps_lat}
            gpsLng={formData.gps_lng}
            onLocationChange={(location) => updateFormData({ location })}
            onGPSToggle={(enabled, lat, lng) => 
              updateFormData({ gps_enabled: enabled, gps_lat: lat, gps_lng: lng })
            }
            error={errors.location}
          />

          {/* Planting Date - Now Optional */}
          <CustomDatePicker
            label={t.plantingDate}
            value={formData.planting_date}
            onChange={(date) => updateFormData({ planting_date: date })}
            error={errors.planting_date}
            minimumDate={sixMonthsAgo}
            maximumDate={today}
          />

          {/* Season (Auto-detected) */}
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyLabel}>{t.season}</Text>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonText}>
                {formData.season ? translateOption('seasons', formData.season, language) : t.seasonNotDetected}
              </Text>
            </View>
          </View>

          {/* Land Size */}
          <View style={styles.landSizeContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>{t.landSize}</Text>
              <Text style={styles.mandatory}>*</Text>
            </View>
            <View style={styles.landSizeRow}>
              {/* Decrement Button */}
              <TouchableOpacity 
                style={styles.incrementButton}
                onPress={() => {
                  const current = parseFloat(formData.land_size_value) || 0;
                  const newValue = Math.max(0, current - 0.5);
                  updateFormData({ land_size_value: newValue.toString() });
                }}
              >
                <Minus size={20} color="#16A34A" />
              </TouchableOpacity>

              {/* Value Input */}
              <TextInput
                value={formData.land_size_value}
                onChangeText={(text) => updateFormData({ land_size_value: text })}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.landSizeInput}
                mode="outlined"
                error={!!errors.land_size_value}
                dense
              />

              {/* Increment Button */}
              <TouchableOpacity 
                style={styles.incrementButton}
                onPress={() => {
                  const current = parseFloat(formData.land_size_value) || 0;
                  const newValue = current + 0.5;
                  updateFormData({ land_size_value: newValue.toString() });
                }}
              >
                <Plus size={20} color="#16A34A" />
              </TouchableOpacity>
              
              {/* Fixed Unit Label */}
              <View style={styles.unitLabel}>
                <Text style={styles.unitText}>{t.acres}</Text>
              </View>
            </View>
            {errors.land_size_value && (
              <Text style={styles.errorText}>{errors.land_size_value}</Text>
            )}
          </View>

          {/* Soil Condition */}
          <CustomDropdown
            label={t.soilCondition}
            value={formData.soil_condition}
            options={SOIL_CONDITIONS.map(value => ({
              value,
              label: translateOption('soilConditions', value, language)
            }))}
            onChange={(value) => updateFormData({ soil_condition: value as SoilCondition })}
            error={errors.soil_condition}
            mandatory
          />

          {/* Irrigation Type */}
          <CustomRadioGroup
            label={t.irrigationType}
            value={formData.irrigation_type}
            options={IRRIGATION_TYPES.map(value => ({
              value,
              label: translateOption('irrigationTypes', value, language),
              description: ''
            }))}
            onChange={(value) => updateFormData({ irrigation_type: value as IrrigationType })}
            error={errors.irrigation_type}
            mandatory
          />
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
  readOnlyField: {
    marginBottom: 20,
  },
  readOnlyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  seasonBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  seasonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
    textAlign: 'center',
  },
  landSizeContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mandatory: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 4,
  },
  landSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incrementButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landSizeInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  unitLabel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
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
