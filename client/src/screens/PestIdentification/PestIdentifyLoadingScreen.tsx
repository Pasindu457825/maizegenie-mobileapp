import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import {
  Bug,
  Camera,
  Upload,
  Bell,
  CloudSun,
  MapPin,
  AlertCircle,
  Leaf,
  Sprout,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

const { width } = Dimensions.get("window");

type Language = "si" | "en";
type Content = {
  [key in Language]: {
    title: string;
    subtitle: string;
    mainText: string;
    description: string;
    loading: string;
    cameraOption: string;
    uploadOption: string;
    orText: string;
  };
};

type RootStackParamList = {
  PestCameraScreen: undefined;
  PestUploadScreen: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList>;

const PestIdentificationLoadingScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<Language>("si");
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [leafAnim] = useState(new Animated.Value(0));
  const [buttonFadeAnim] = useState(new Animated.Value(0));

  const content: Content = {
    si: {
      title: "🐛 පළිබෝධ හඳුනාගැනීම",
      subtitle: "ස්මාර්ට් ගොවිතැන",
      mainText: "ඔබේ වගාවට",
      description: "පළිබෝධ හඳුනා ගැනීම සහ විසඳුම්",
      loading: "සූදානම් වෙමින්",
      cameraOption: "කැමරාව භාවිතා කරන්න",
      uploadOption: "ඡායාරූපයක් උඩුගත කරන්න",
      orText: "හෝ",
    },
    en: {
      title: "🐛 Pest Identification",
      subtitle: "Smart Farming",
      mainText: "Protect Your Crops",
      description: "Identify pests and get solutions",
      loading: "Getting Ready",
      cameraOption: "Use Camera",
      uploadOption: "Upload Photo",
      orText: "OR",
    },
  };

  const headerContent = {
    si: {
      title: "පළිබෝධ හඳුනාගැනීම",
      subtitle: "ඡායාරූපයකින් පළිබෝධ හඳුනා ගන්න",
    },
    en: {
      title: "Pest Identification",
      subtitle: "Identify pests from photos",
    },
  };

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

    // Floating leaf animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [fadeAnim, scaleAnim, leafAnim]);

  // Animate button when progress reaches 100
  useEffect(() => {
    if (progress === 100) {
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [progress, buttonFadeAnim]);

  const leafTranslate = leafAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const handleCamera = () => {
    navigation.navigate("PestCameraScreen");
  };

  const handleUpload = () => {
    navigation.navigate("PestUploadScreen");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {headerContent[language].title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {headerContent[language].subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Bell color="#DC2626" size={20} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <CloudSun color="#DC2626" size={20} />
          </TouchableOpacity>

          {/* Language Toggle in Header */}
          <TouchableOpacity
            style={styles.langButtonHeader}
            onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>
              {language === "si" ? "EN" : "සිං"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-header with Location */}
      <View style={styles.subHeader}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🌾</Text>
          </View>
          <View>
            <View style={styles.locationRow}>
              <MapPin color="#991B1B" size={14} />
              <Text style={styles.locationText}>
                {language === "si" ? "මොණරාගල" : "Monaragala"}
              </Text>
            </View>
            <Text style={styles.logoTemp}>23°C</Text>
          </View>
        </View>
      </View>

      {/* Gradient Background Effect */}
      <View pointerEvents="none" style={styles.gradientTop} />
      <View pointerEvents="none" style={styles.gradientBottom} />

      {/* Floating Decorations */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf1,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <Bug color="#DC2626" size={40} opacity={0.3} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf2,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <AlertCircle color="#EF4444" size={35} opacity={0.3} />
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Icon Circle */}
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Text style={styles.pestEmoji}>🐛</Text>
            </View>
            <View style={styles.pulseRing} />
          </View>

          {/* Title Section */}
          <Text style={styles.subtitle}>{content[language].subtitle}</Text>
          <Text style={styles.mainText}>{content[language].mainText}</Text>
          <Text style={styles.title}>{content[language].title}</Text>
          <Text style={styles.description}>{content[language].description}</Text>

          {/* Simple Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>

          {/* Loading Text */}
          <Text style={styles.loadingText}>{content[language].loading}...</Text>

          {/* Action Buttons */}
          {progress === 100 && (
            <Animated.View style={[styles.buttonsContainer, { opacity: buttonFadeAnim }]}>
              {/* Camera Button */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCamera}
                activeOpacity={0.85}
              >
                <Camera color="#FFFFFF" size={24} />
                <Text style={styles.actionButtonText}>
                  {content[language].cameraOption}
                </Text>
              </TouchableOpacity>

              {/* OR Text */}
              <Text style={styles.orText}>{content[language].orText}</Text>

              {/* Upload Button */}
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={handleUpload}
                activeOpacity={0.85}
              >
                <Upload color="#DC2626" size={24} />
                <Text style={styles.actionButtonTextSecondary}>
                  {content[language].uploadOption}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    position: "relative",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  langButtonHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  langText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 99,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DC2626",
  },
  logoText: {
    fontSize: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991B1B",
  },
  logoTemp: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#DC2626",
  },
  gradientTop: {
    position: "absolute",
    top: 140,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#FECACA",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "#FEE2E2",
  },
  floatingLeaf1: {
    position: "absolute",
    top: 190,
    left: 30,
    zIndex: 1,
  },
  floatingLeaf2: {
    position: "absolute",
    top: 240,
    right: 40,
    zIndex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 10,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#B91C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  pestEmoji: {
    fontSize: 50,
  },
  pulseRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#DC2626",
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#B91C1C",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mainText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7F1D1D",
    marginBottom: 6,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#991B1B",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  progressContainer: {
    width: "85%",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 12,
    backgroundColor: "#FECACA",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#DC2626",
    borderRadius: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B91C1C",
  },
  loadingText: {
    fontSize: 15,
    color: "#991B1B",
    fontWeight: "600",
    marginBottom: 20,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#DC2626",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    width: "90%",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 14,
    color: "#991B1B",
    fontWeight: "600",
    marginVertical: 4,
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 50,
    width: "90%",
    borderWidth: 2,
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonTextSecondary: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PestIdentificationLoadingScreen;