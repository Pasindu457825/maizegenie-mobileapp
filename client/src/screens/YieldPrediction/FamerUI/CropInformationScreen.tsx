/**
 * Screen B: Crop Information
 * Second screen of yield prediction flow
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Leaf, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useYieldForm } from '../../../contexts/YieldFormContext';
import { VarietySelector } from '../../../components/forms/VarietySelector';
import { MaizeVariety } from '../../../types/yieldPrediction';
import { translations } from '../../../translations/translationYieldPrediction';

export const CropInformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { formData, updateFormData, errors, setErrors, language } = useYieldForm();

  // Get translations
  const t = translations.cropInformation[language];

  const validateScreen = (): boolean => {
    const newErrors: any = {};

    if (!formData.variety) {
      newErrors.variety = t.errorVariety;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateScreen()) {
      navigation.navigate('WeatherCondition' as never);
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
          <Text style={styles.sectionTitle}>{t.selectVariety}</Text>
          <Text style={styles.sectionDescription}>
            {language === 'si' 
              ? 'ඔබ වගා කරන වර්ගය තෝරන්න. විවිධ වර්ග වලට විවිධ වර්ධන රටා සහ අස්වැන්න විභවයන් ඇත.'
              : 'Choose the variety you are cultivating. Different varieties have different growth patterns and yield potential.'}
          </Text>

          <VarietySelector
            label={t.maizeVariety}
            value={formData.variety}
            onChange={(variety) => updateFormData({ variety: variety as MaizeVariety })}
            error={errors.variety}
            mandatory
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              {language === 'si' ? '💡 තෝරා ගැනීම සඳහා උපදෙස්' : '💡 Tips for Selection'}
            </Text>
            <Text style={styles.infoText}>
              {language === 'si'
                ? '• Jet 999 සහ Pacific 808 ඉහළ අස්වැන්න සඳහා ජනප්‍රියයි\n• GT වර්ග වඩා හොඳ රෝග ප්‍රතිරෝධය ලබා දෙයි\n• Commando නියඟ බහුල ප්‍රදේශ සඳහා වඩාත් සුදුසුය\n• ඔබේ කන්නයට සහ ස්ථානයට ගැලපෙන වර්ගය තෝරන්න'
                : '• Jet 999 and Pacific 808 are popular for high yield\n• GT varieties offer better disease resistance\n• Commando is ideal for drought-prone areas\n• Match variety to your season and location'}
            </Text>
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
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
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
