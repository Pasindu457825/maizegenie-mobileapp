/**
 * Custom Dropdown Component
 * Reusable dropdown with validation and error display
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChevronDown } from 'lucide-react-native';

interface CustomDropdownProps<T extends string> {
  label: string;
  value: T | '' | undefined;
  options: readonly T[] | T[];
  onChange: (value: T | '') => void;
  error?: string;
  placeholder?: string;
  mandatory?: boolean;
  disabled?: boolean;
}

export function CustomDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Select an option',
  mandatory = false,
  disabled = false,
}: CustomDropdownProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      <View style={[styles.pickerContainer, error && styles.pickerError, disabled && styles.disabled]}>
        <Picker
          selectedValue={value}
          onValueChange={onChange}
          style={styles.picker}
          enabled={!disabled}
        >
          <Picker.Item label={placeholder} value="" color="#9CA3AF" />
          {options.map((option) => (
            <Picker.Item key={option} label={option} value={option} />
          ))}
        </Picker>
        <View style={styles.iconContainer}>
          <ChevronDown size={20} color="#6B7280" />
        </View>
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
    marginBottom: 8,
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
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  picker: {
    height: 56,
    paddingHorizontal: 16,
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    pointerEvents: 'none',
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
