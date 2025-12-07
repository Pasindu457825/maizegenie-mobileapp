/**
 * Variety Selector Component
 * Image-based maize variety selection
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { MaizeVariety, MAIZE_VARIETIES } from '../../types/farmerYieldPrediction';

interface VarietySelectorProps {
  label: string;
  value: MaizeVariety | '';
  onChange: (variety: MaizeVariety) => void;
  error?: string;
  mandatory?: boolean;
}

// Variety data with images and descriptions
const VARIETY_OPTIONS = [
  {
    value: 'Jet 999' as MaizeVariety,
    label: 'Jet 999',
    description: 'High yield hybrid, 95-100 days',
    // Placeholder - replace with actual image path
    image: require('../../../assets/varieties/jet999.png'),
  },
  {
    value: 'Pacific 808 (C.P.808)' as MaizeVariety,
    label: 'Pacific 808',
    description: 'Popular hybrid, 90-95 days',
    image: require('../../../assets/varieties/pacific808.png'),
  },
  {
    value: 'GT 709' as MaizeVariety,
    label: 'GT 709',
    description: 'Disease resistant, 100-105 days',
    image: require('../../../assets/varieties/gt709.png'),
  },
  {
    value: 'GT200' as MaizeVariety,
    label: 'GT200',
    description: 'Early maturing, 85-90 days',
    image: require('../../../assets/varieties/gt200.png'),
  },
  {
    value: 'Commando' as MaizeVariety,
    label: 'Commando',
    description: 'Drought tolerant, 95-100 days',
    image: require('../../../assets/varieties/commando.png'),
  },
];

export const VarietySelector: React.FC<VarietySelectorProps> = ({
  label,
  value,
  onChange,
  error,
  mandatory = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {VARIETY_OPTIONS.map((variety) => {
          const isSelected = value === variety.value;
          
          return (
            <TouchableOpacity
              key={variety.value}
              style={[
                styles.varietyCard,
                isSelected && styles.varietyCardSelected,
              ]}
              onPress={() => onChange(variety.value)}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={variety.image}
                  style={styles.varietyImage}
                  resizeMode="cover"
                />
                {isSelected && (
                  <View style={styles.checkmark}>
                    <CheckCircle size={24} color="#16A34A" fill="#FFFFFF" />
                  </View>
                )}
              </View>
              
              <View style={styles.varietyInfo}>
                <Text style={[styles.varietyLabel, isSelected && styles.varietyLabelSelected]}>
                  {variety.label}
                </Text>
                <Text style={styles.varietyDescription}>
                  {variety.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {value && (
        <View style={styles.selectedInfo}>
          <CheckCircle size={16} color="#16A34A" />
          <Text style={styles.selectedText}>
            Selected: {VARIETY_OPTIONS.find(v => v.value === value)?.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mandatory: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 4,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  varietyCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  varietyCardSelected: {
    borderColor: '#16A34A',
    borderWidth: 3,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  varietyImage: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  varietyInfo: {
    padding: 12,
  },
  varietyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  varietyLabelSelected: {
    color: '#16A34A',
  },
  varietyDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  errorContainer: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '500',
  },
});
