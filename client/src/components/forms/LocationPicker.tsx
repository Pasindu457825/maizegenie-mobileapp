/**
 * Location Picker Component
 * GPS auto-detection + manual dropdown selection
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { MapPin, Navigation } from 'lucide-react-native';
import { CustomDropdown } from './CustomDropdown';
import { District, LOCATIONS_BY_DISTRICT } from '../../types/yieldPrediction';

interface LocationPickerProps {
  district: District | '';
  selectedLocation: string;
  gpsEnabled: boolean;
  gpsLat: number | null;
  gpsLng: number | null;
  onLocationChange: (location: string) => void;
  onGPSToggle: (enabled: boolean, lat: number | null, lng: number | null) => void;
  error?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  district,
  selectedLocation,
  gpsEnabled,
  gpsLat,
  gpsLng,
  onLocationChange,
  onGPSToggle,
  error,
}) => {
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  const handleGPSDetection = async () => {
    if (gpsEnabled) {
      // Disable GPS
      onGPSToggle(false, null, null);
      return;
    }

    setIsLoadingGPS(true);

    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use GPS detection.',
          [{ text: 'OK' }]
        );
        setIsLoadingGPS(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Try to reverse geocode to get location name (optional enhancement)
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        // If we have district and the geocoded locality matches one of our locations
        if (district && address.district) {
          const locations = LOCATIONS_BY_DISTRICT[district];
          const matchedLocation = locations.find(loc => 
            address.district?.toLowerCase().includes(loc.toLowerCase())
          );
          
          if (matchedLocation) {
            onLocationChange(matchedLocation);
          }
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed:', geocodeError);
        // Continue anyway with coordinates
      }

      onGPSToggle(true, latitude, longitude);
      
      Alert.alert(
        'GPS Location Detected',
        `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

    } catch (err) {
      console.error('GPS Error:', err);
      Alert.alert(
        'GPS Error',
        'Failed to get your location. Please select manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const availableLocations = district ? LOCATIONS_BY_DISTRICT[district] : [];

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.optional}>(Optional)</Text>
      </View>

      {/* GPS Detection Button */}
      <TouchableOpacity
        style={[styles.gpsButton, gpsEnabled && styles.gpsButtonActive]}
        onPress={handleGPSDetection}
        disabled={isLoadingGPS || !district}
      >
        <View style={styles.gpsContent}>
          {isLoadingGPS ? (
            <ActivityIndicator size="small" color="#16A34A" />
          ) : (
            <Navigation size={20} color={gpsEnabled ? '#16A34A' : '#6B7280'} />
          )}
          
          <View style={styles.gpsText}>
            <Text style={[styles.gpsTitle, gpsEnabled && styles.gpsActive]}>
              {isLoadingGPS ? 'Detecting GPS Location...' : gpsEnabled ? 'GPS Active' : 'Use GPS Location'}
            </Text>
            {gpsEnabled && gpsLat && gpsLng && (
              <Text style={styles.gpsCoords}>
                {gpsLat.toFixed(6)}, {gpsLng.toFixed(6)}
              </Text>
            )}
            {!district && (
              <Text style={styles.gpsHint}>Select district first</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Manual Location Selection */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <CustomDropdown
        label="Manual Selection"
        value={selectedLocation}
        options={availableLocations}
        onChange={onLocationChange}
        placeholder={district ? "Select location" : "Select district first"}
        disabled={!district}
        error={error}
      />

      {selectedLocation && (
        <View style={styles.selectedInfo}>
          <MapPin size={16} color="#16A34A" />
          <Text style={styles.selectedText}>
            Selected: {district} - {selectedLocation}
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
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  optional: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  gpsButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  gpsButtonActive: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  gpsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gpsText: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  gpsActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  gpsCoords: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  gpsHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
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
