/**
 * Custom Date Picker Component
 * Reusable date picker with validation
 * SUPPORTS: iOS, Android, and Web platforms
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface CustomDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  mandatory?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  mandatory = false,
  minimumDate,
  maximumDate,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Handle date change for native date pickers (iOS/Android)
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  // Handle date change for web input
  const handleWebDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString);
      onChange(date);
    } else {
      onChange(null);
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format date for HTML input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format minimum/maximum dates for HTML input
  const formatMinMax = (date?: Date): string | undefined => {
    return date ? formatDateForInput(date) : undefined;
  };

  // Render web-compatible date input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {mandatory && <Text style={styles.mandatory}>*</Text>}
        </View>

        <View style={[
          styles.dateButton,
          error && styles.dateButtonError,
          disabled && styles.disabled,
        ]}>
          <View style={styles.dateContent}>
            <Calendar size={20} color={value ? '#16A34A' : '#9CA3AF'} />
            <TextInput
              style={styles.webDateInput}
              value={formatDateForInput(value)}
              onChange={(e: any) => handleWebDateChange(e.target.value)}
              placeholder="Select date"
              editable={!disabled}
              // @ts-ignore - Web-specific props
              type="date"
              min={formatMinMax(minimumDate)}
              max={formatMinMax(maximumDate)}
            />
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

  // Render native date picker for iOS/Android
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      <TouchableOpacity
        style={[
          styles.dateButton,
          error && styles.dateButtonError,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <View style={styles.dateContent}>
          <Calendar size={20} color={value ? '#16A34A' : '#9CA3AF'} />
          <Text style={[styles.dateText, !value && styles.placeholderText]}>
            {formatDate(value)}
          </Text>
        </View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
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
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateButtonError: {
    borderColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  webDateInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    backgroundColor: 'transparent',
    // @ts-ignore - Web-specific styles
    border: 'none',
    outline: 'none',
  } as any,
  errorContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
});
