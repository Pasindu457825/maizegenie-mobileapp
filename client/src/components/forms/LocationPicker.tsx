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

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Known coordinates for major locations (approximate center points)
  // You can expand this with actual coordinates for each location
  const LOCATION_COORDINATES: Record<string, { lat: number; lng: number }> = {
    // Anuradhapura District
    'Medawachchiya': { lat: 9.3667, lng: 80.4833 },
    'Horowpothana': { lat: 8.3667, lng: 80.5167 },
    'Kahatagasdigiliya': { lat: 8.4500, lng: 80.6000 },
    'Kebithigollewa': { lat: 8.2833, lng: 80.2500 },
    'Nochchiyagama': { lat: 8.2500, lng: 80.2000 },
    'Thalawa': { lat: 8.2667, lng: 80.3833 },
    'Galnewa': { lat: 8.0000, lng: 80.3667 },
    'Rambewa': { lat: 8.4167, lng: 80.4000 },
    
    // Monaragala District
    'Buttala': { lat: 6.7500, lng: 81.2333 },
    'Siyambalanduwa': { lat: 6.8500, lng: 81.5167 },
    'Medagama': { lat: 6.7000, lng: 81.4333 },
    'Thanamalwila': { lat: 6.5333, lng: 81.1333 },
    'Sevanagala': { lat: 6.3667, lng: 81.1000 },
    'Badalkumbura': { lat: 6.7833, lng: 81.0833 },
    'Wellawaya': { lat: 6.7333, lng: 81.1000 },
    'Kandaketiya': { lat: 6.9500, lng: 81.3667 },
    'Bibile': { lat: 7.1667, lng: 81.2000 },
    
    // Badulla District
    'Hali Ela': { lat: 6.9167, lng: 81.0167 },
    'Mahiyanganaya': { lat: 7.3333, lng: 81.0000 },
    'Badulla': { lat: 6.9833, lng: 81.0500 },
    'Welimada': { lat: 6.9000, lng: 80.9167 },
    
    // Ampara District
    'Ampara': { lat: 7.2833, lng: 81.6667 },
    'Kalmunai': { lat: 7.4167, lng: 81.8333 },
    'Akkarepattu': { lat: 7.2167, lng: 81.8333 },
    'Sainthamaruthu': { lat: 7.3333, lng: 81.8000 },
    'Sammanthurai': { lat: 7.3667, lng: 81.8333 },
    'Pottuvil': { lat: 6.8667, lng: 81.8333 },
  };

  const findNearestLocation = (latitude: number, longitude: number): string | null => {
    if (!district) return null;
    
    const availableLocations = LOCATIONS_BY_DISTRICT[district];
    if (!availableLocations || availableLocations.length === 0) return null;

    let nearestLocation = null;
    let minDistance = Infinity;

    availableLocations.forEach(location => {
      const coords = LOCATION_COORDINATES[location];
      if (coords) {
        const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
        if (distance < minDistance) {
          minDistance = distance;
          nearestLocation = location;
        }
      }
    });

    // If nearest location is within reasonable range (50km), return it
    if (nearestLocation && minDistance < 50) {
      return nearestLocation;
    }

    return null;
  };

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

      // Find nearest location from available options
      const nearestLocation = findNearestLocation(latitude, longitude);
      
      if (nearestLocation) {
        // Auto-select the nearest location
        onLocationChange(nearestLocation);
        onGPSToggle(true, latitude, longitude);
        
        Alert.alert(
          'GPS Location Detected',
          `Nearest location: ${nearestLocation}\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          [{ text: 'OK' }]
        );
      } else {
        // No nearby location found, but still save GPS coordinates
        onGPSToggle(true, latitude, longitude);
        
        Alert.alert(
          'GPS Location Detected',
          `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\nNo nearby location found in the list. Please select manually.`,
          [{ text: 'OK' }]
        );
      }

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
        <Text style={styles.mandatory}>*</Text>
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
  mandatory: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 4,
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
