/**
 * AgriOfficer Screen 1: Soil Profile
 * Collects soil analysis data
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Leaf, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { CustomDropdown } from '../../../components/forms/CustomDropdown';
import { translations } from '../../../translations/translationYieldPrediction';
import { PredictYieldStackParamList } from '../../../navigation/PredictYieldStack';
import { LOCATIONS_BY_DISTRICT } from '../../../types/farmerYieldPrediction';

const SOIL_TYPES = ['Clay', 'Loam', 'RBE', 'RBL'] as const;
const DISTRICTS = ['Anuradhapura', 'Monaragala', 'Badulla', 'Ampara', 'Hambantota', 'Polonnaruwa', 'Kurunegala', 'Puttalam'] as const;

type RouteParams = {
  OfficerSoilProfile: { language?: 'si' | 'en' };
};

export const SoilProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'OfficerSoilProfile'>>();
  const { formData, updateFormData, errors, setErrors, language, setLanguage } = useYieldForm();

  // Set language from navigation params
  useEffect(() => {
    if (route.params?.language && route.params.language !== language) {
      setLanguage(route.params.language);
    }
  }, [route.params?.language]);

  // Get translations
  const t = translations.officerSoilProfile[language];

  const validateScreen = (): boolean => {
    const newErrors: any = {};

    // Validate district
    if (!formData.district) {
      newErrors.district = language === 'si' ? 'දිස්ත්‍රික්කය තෝරන්න' : 'Please select district';
    }

    // Validate soil pH (0-14)
    if (!formData.soil_ph) {
      newErrors.soil_ph = t.errorSoilPH;
    } else if (parseFloat(formData.soil_ph) < 0 || parseFloat(formData.soil_ph) > 14) {
      newErrors.soil_ph = t.errorSoilPH;
    }

    // Validate nitrogen
    if (!formData.soil_nitrogen) {
      newErrors.soil_nitrogen = t.errorNitrogen;
    } else if (parseFloat(formData.soil_nitrogen) < 0) {
      newErrors.soil_nitrogen = t.errorNitrogen;
    }

    // Validate phosphorus
    if (!formData.soil_phosphorus) {
      newErrors.soil_phosphorus = t.errorPhosphorus;
    } else if (parseFloat(formData.soil_phosphorus) < 0) {
      newErrors.soil_phosphorus = t.errorPhosphorus;
    }

    // Validate potassium
    if (!formData.soil_potassium) {
      newErrors.soil_potassium = t.errorPotassium;
    } else if (parseFloat(formData.soil_potassium) < 0) {
      newErrors.soil_potassium = t.errorPotassium;
    }

    // Validate soil type
    if (!formData.soil_type_officer) {
      newErrors.soil_type_officer = t.errorSoilType;
    }

    // Validate organic matter (0-100%)
    if (!formData.organic_matter) {
      newErrors.organic_matter = t.errorOrganicMatter;
    } else if (parseFloat(formData.organic_matter) < 0 || parseFloat(formData.organic_matter) > 100) {
      newErrors.organic_matter = t.errorOrganicMatter;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateScreen()) {
      navigation.navigate('OfficerClimate' as never);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Translate soil types
  const soilTypeOptions = SOIL_TYPES.map(type => ({
    value: type,
    label: language === 'si' 
      ? (type === 'Clay' ? t.clay : type === 'Loam' ? t.loam : type === 'RBE' ? t.rbe : t.rbl)
      : (type === 'Clay' ? t.clay : type === 'Loam' ? t.loam : type === 'RBE' ? t.rbe : t.rbl)
  }));

  const districtOptions = DISTRICTS.map(district => ({
    label: district,
    value: district,
  }));

  // Get locations for selected district
  const locationOptions = formData.district && LOCATIONS_BY_DISTRICT[formData.district as keyof typeof LOCATIONS_BY_DISTRICT]
    ? LOCATIONS_BY_DISTRICT[formData.district as keyof typeof LOCATIONS_BY_DISTRICT].map(location => ({
        label: location,
        value: location,
      }))
    : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Leaf size={28} color="#16A34A" />
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
            label={language === 'si' ? 'දිස්ත්‍රික්කය' : 'District'}
            value={formData.district}
            options={districtOptions}
            onChange={(value) => {
              updateFormData({ district: value, location: '' }); // Reset location when district changes
            }}
            error={errors.district}
            mandatory
          />

          {/* Location (shows only after district is selected) */}
          {formData.district && locationOptions.length > 0 && (
            <CustomDropdown
              label={language === 'si' ? 'ස්ථානය' : 'Location'}
              value={formData.location}
              options={locationOptions}
              onChange={(value) => updateFormData({ location: value })}
              error={errors.location}
              placeholder={language === 'si' ? 'ස්ථානය තෝරන්න' : 'Select location'}
            />
          )}

          {/* Soil pH */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.soilPH} <Text style={styles.mandatory}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.soil_ph && styles.inputError]}
              value={formData.soil_ph}
              onChangeText={(value) => updateFormData({ soil_ph: value })}
              placeholder="6.5"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.soil_ph && (
              <Text style={styles.errorText}>{errors.soil_ph}</Text>
            )}
          </View>

          {/* Soil Nitrogen */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.soilNitrogen} <Text style={styles.mandatory}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.soil_nitrogen && styles.inputError]}
              value={formData.soil_nitrogen}
              onChangeText={(value) => updateFormData({ soil_nitrogen: value })}
              placeholder="120"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.soil_nitrogen && (
              <Text style={styles.errorText}>{errors.soil_nitrogen}</Text>
            )}
          </View>

          {/* Soil Phosphorus */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.soilPhosphorus} <Text style={styles.mandatory}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.soil_phosphorus && styles.inputError]}
              value={formData.soil_phosphorus}
              onChangeText={(value) => updateFormData({ soil_phosphorus: value })}
              placeholder="40"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.soil_phosphorus && (
              <Text style={styles.errorText}>{errors.soil_phosphorus}</Text>
            )}
          </View>

          {/* Soil Potassium */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.soilPotassium} <Text style={styles.mandatory}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.soil_potassium && styles.inputError]}
              value={formData.soil_potassium}
              onChangeText={(value) => updateFormData({ soil_potassium: value })}
              placeholder="80"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.soil_potassium && (
              <Text style={styles.errorText}>{errors.soil_potassium}</Text>
            )}
          </View>

          {/* Soil Type */}
          <CustomDropdown
            label={t.soilType}
            value={formData.soil_type_officer}
            options={soilTypeOptions}
            onChange={(value) => updateFormData({ soil_type_officer: value })}
            error={errors.soil_type_officer}
            mandatory
            placeholder={language === 'si' ? 'පස් වර්ගය තෝරන්න' : 'Select soil type'}
          />

          {/* Organic Matter */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.organicMatter} <Text style={styles.mandatory}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.organic_matter && styles.inputError]}
              value={formData.organic_matter}
              onChangeText={(value) => updateFormData({ organic_matter: value })}
              placeholder="3.5"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
            {errors.organic_matter && (
              <Text style={styles.errorText}>{errors.organic_matter}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#16A34A" />
          <Text style={styles.backButtonText}>{t.backButton}</Text>
        </TouchableOpacity>

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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  mandatory: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
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
