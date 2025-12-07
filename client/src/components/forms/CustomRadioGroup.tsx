/**
 * Custom Radio Group Component
 * Reusable radio button group with validation
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';

interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface CustomRadioGroupProps<T extends string> {
  label: string;
  value: T | '';
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  mandatory?: boolean;
  disabled?: boolean;
}

export function CustomRadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  mandatory = false,
  disabled = false,
}: CustomRadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                isSelected && styles.radioOptionSelected,
                disabled && styles.disabled,
              ]}
              onPress={() => !disabled && onChange(option.value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={styles.radioContent}>
                <View style={styles.radioCircle}>
                  {isSelected ? (
                    <CheckCircle size={24} color="#16A34A" />
                  ) : (
                    <Circle size={24} color="#9CA3AF" />
                  )}
                </View>
                
                <View style={styles.radioText}>
                  <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text style={styles.radioDescription}>{option.description}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

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
  optionsContainer: {
    gap: 12,
  },
  radioOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  radioOptionSelected: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  disabled: {
    opacity: 0.5,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioCircle: {
    marginTop: 2,
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  radioLabelSelected: {
    color: '#16A34A',
    fontWeight: '600',
  },
  radioDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
});
