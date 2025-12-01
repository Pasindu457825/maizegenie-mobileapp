/**
 * AgriOfficer Screen 3: Crop Measurements (Optional)
 * Smart Skip/Next button based on data entry
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ruler, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { translations } from '../../../translations/translationYieldPrediction';

export const CropMeasurementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { formData, updateFormData, language } = useYieldForm();

  // Get translations
  const t = translations.officerCropMeasurements[language];

  // Check if any measurement data has been entered
  const hasAnyData = useMemo(() => {
    return !!(
      formData.plant_height ||
      formData.cob_height ||
      formData.cob_length ||
      formData.kernel_rows ||
      formData.wet_weight_per_m2
    );
  }, [formData]);

  const handleNext = () => {
    navigation.navigate('OfficerFertilizer' as never);
  };

  const handleSkip = () => {
    // Clear any partial data and skip to next screen
    updateFormData({
      plant_height: '',
      cob_height: '',
      cob_length: '',
      kernel_rows: '',
      wet_weight_per_m2: '',
    });
    navigation.navigate('OfficerFertilizer' as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ruler size={28} color="#16A34A" />
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
        {/* Optional Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t.optional}</Text>
        </View>

        <View style={styles.card}>
          {/* Info Message */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{t.fieldInspection}</Text>
          </View>

          {/* Plant Height */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.plantHeight}</Text>
            <TextInput
              style={styles.input}
              value={formData.plant_height}
              onChangeText={(value) => updateFormData({ plant_height: value })}
              placeholder="180"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Cob Height */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.cobHeight}</Text>
            <TextInput
              style={styles.input}
              value={formData.cob_height}
              onChangeText={(value) => updateFormData({ cob_height: value })}
              placeholder="90"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Cob Length */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.cobLength}</Text>
            <TextInput
              style={styles.input}
              value={formData.cob_length}
              onChangeText={(value) => updateFormData({ cob_length: value })}
              placeholder="18"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Kernel Rows */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.kernelRows}</Text>
            <TextInput
              style={styles.input}
              value={formData.kernel_rows}
              onChangeText={(value) => updateFormData({ kernel_rows: value })}
              placeholder="14"
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Wet Weight per m² */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.wetWeight}</Text>
            <TextInput
              style={styles.input}
              value={formData.wet_weight_per_m2}
              onChangeText={(value) => updateFormData({ wet_weight_per_m2: value })}
              placeholder="2.5"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#16A34A" />
          <Text style={styles.backButtonText}>{t.backButton}</Text>
        </TouchableOpacity>

        {/* Smart Skip/Next Button */}
        {hasAnyData ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>{t.nextButton}</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>{t.skipButton}</Text>
            <SkipForward size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
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
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
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
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
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
  skipButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
