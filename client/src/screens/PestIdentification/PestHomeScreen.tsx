import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

// Import your PestIdentifyStackParamList type
import { PestIdentifyStackParamList } from '../../navigation/PestIdentifyStack'; // adjust path

const { width, height } = Dimensions.get('window');

type MaizeGenieHomeProps = {
  navigation: StackNavigationProp<PestIdentifyStackParamList>;
};

export default function MaizeGenieHome({ navigation }: MaizeGenieHomeProps) {
  const handlePestIdentification = () => {
    // Navigate to PestIdentifyLoading screen
    navigation.navigate('PestIdentifyLoading');
  };

  const handleCropDetails = () => {
    // Navigate to crop details screen (add this to your stack if needed)
    console.log('Navigate to Crop Details');
    // navigation.navigate('CropDetails'); // when you add this screen
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a7a5e" />
      
      {/* Background with gradient */}
      <LinearGradient
        colors={['#2d9d78', '#1a7a5e', '#165c47']}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
          </View>
          
          
          <Text style={styles.tagline}>Smart Farming Companion</Text>
          <Text style={styles.subtitle}>for Sri Lankan Corn Farmers</Text>
          
          <View style={styles.divider} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          
          <Text style={styles.descriptionText}>
            කෘමි හඳුනාගැනීම සහ වගා කළමනාකරණය සඳහා {'\n'}
            ඔබේ ස්මාර්ට් සහායක
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handlePestIdentification}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>🔍</Text>
              </View>
              <Text style={styles.primaryButtonText}>කෘමියා හඳුනාගන්න</Text>
              <Text style={styles.buttonSubtext}>AI මගින් ක්ෂණිකව හඳුනාගන්න</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleCropDetails}
              activeOpacity={0.8}
            >
              <View style={styles.buttonIcon}>
                <Text style={styles.iconText}>📊</Text>
              </View>
              <Text style={styles.secondaryButtonText}>වගාව පිළිබඳ වැඩි විස්තර</Text>
              <Text style={styles.buttonSubtext}>සම්පූර්ණ මාර්ගෝපදේශ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... same styles as before
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: '40%',
    right: -50,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: '#e0f2e9',
    marginBottom: 4,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#c5e8d7',
    marginBottom: 20,
  },
  divider: {
    width: 80,
    height: 4,
    backgroundColor: '#ffa726',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#e0f2e9',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  buttonIcon: {
    marginBottom: 12,
  },
  iconText: {
    fontSize: 36,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a7a5e',
    marginBottom: 6,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  buttonSubtext: {
    fontSize: 13,
    color: '#64b896',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#c5e8d7',
    marginBottom: 4,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#a8d9c3',
  },
});