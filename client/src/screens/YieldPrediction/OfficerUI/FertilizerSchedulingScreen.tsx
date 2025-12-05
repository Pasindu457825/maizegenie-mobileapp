/**
 * AgriOfficer Screen 4: Fertilizer Scheduling
 * Final screen before yield prediction
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sprout, ChevronLeft, Send } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { CustomDatePicker } from '../../../components/forms/CustomDatePicker';
import { translations } from '../../../translations/translationYieldPrediction';

export const FertilizerSchedulingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { formData, updateFormData, errors, setErrors, language } = useYieldForm();

  // Get translations
  const t = translations.officerFertilizer[language];

  const validateScreen = (): boolean => {
    const newErrors: any = {};

    // Validate Basal NPK
    if (!formData.basal_npk) {
      newErrors.basal_npk = t.errorBasalNPK;
    } else if (parseFloat(formData.basal_npk) < 0) {
      newErrors.basal_npk = t.errorBasalNPK;
    }

    // Validate Top-dress 1 (both amount and date required if one is filled)
    if (formData.top_dress_1_amount || formData.top_dress_1_date) {
      if (!formData.top_dress_1_amount) {
        newErrors.top_dress_1_amount = t.errorTopDress1Amount;
      } else if (parseFloat(formData.top_dress_1_amount) < 0) {
        newErrors.top_dress_1_amount = t.errorTopDress1Amount;
      }
      
      if (!formData.top_dress_1_date) {
        newErrors.top_dress_1_date = t.errorTopDress1Date;
      }
    }

    // Validate Top-dress 2 (both amount and date required if one is filled)
    if (formData.top_dress_2_amount || formData.top_dress_2_date) {
      if (!formData.top_dress_2_amount) {
        newErrors.top_dress_2_amount = t.errorTopDress2Amount;
      } else if (parseFloat(formData.top_dress_2_amount) < 0) {
        newErrors.top_dress_2_amount = t.errorTopDress2Amount;
      }
      
      if (!formData.top_dress_2_date) {
        newErrors.top_dress_2_date = t.errorTopDress2Date;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateScreen()) {
      // Navigate to loading screen which will handle the API call
      navigation.navigate('PredictYieldLoading' as never);
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
          <Sprout size={28} color="#16A34A" />
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
        <View style={styles.card}>
          {/* Basal NPK */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t.basalNPK} <Text style={styles.mandatory}>*</Text>
            </Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.input, errors.basal_npk && styles.inputError]}
                value={formData.basal_npk}
                onChangeText={(value) => updateFormData({ basal_npk: value })}
                placeholder="250"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unit}>kg/ha</Text>
            </View>
            {errors.basal_npk && (
              <Text style={styles.errorText}>{errors.basal_npk}</Text>
            )}
          </View>

          {/* Top-dress 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.topDress1}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.amount}</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, errors.top_dress_1_amount && styles.inputError]}
                  value={formData.top_dress_1_amount}
                  onChangeText={(value) => updateFormData({ top_dress_1_amount: value })}
                  placeholder="150"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.unit}>kg/ha</Text>
              </View>
              {errors.top_dress_1_amount && (
                <Text style={styles.errorText}>{errors.top_dress_1_amount}</Text>
              )}
            </View>

            <CustomDatePicker
              label={t.date}
              value={formData.top_dress_1_date || null}
              onChange={(date) => updateFormData({ top_dress_1_date: date })}
              error={errors.top_dress_1_date}
            />
          </View>

          {/* Top-dress 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.topDress2}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.amount}</Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, errors.top_dress_2_amount && styles.inputError]}
                  value={formData.top_dress_2_amount}
                  onChangeText={(value) => updateFormData({ top_dress_2_amount: value })}
                  placeholder="100"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.unit}>kg/ha</Text>
              </View>
              {errors.top_dress_2_amount && (
                <Text style={styles.errorText}>{errors.top_dress_2_amount}</Text>
              )}
            </View>

            <CustomDatePicker
              label={t.date}
              value={formData.top_dress_2_date || null}
              onChange={(date) => updateFormData({ top_dress_2_date: date })}
              error={errors.top_dress_2_date}
            />
          </View>

          {/* Organic Fertilizer */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.organicFertilizer}</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.input}
                value={formData.organic_fertilizer}
                onChangeText={(value) => updateFormData({ organic_fertilizer: value })}
                placeholder="500"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.unit}>kg/ha</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={20} color="#16A34A" />
          <Text style={styles.backButtonText}>{t.backButton}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t.predictYield}</Text>
          <Send size={20} color="#FFFFFF" />
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
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 16,
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
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 60,
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
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
