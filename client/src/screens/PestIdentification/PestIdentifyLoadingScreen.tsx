import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import {
  Bug,
  Camera,
  Upload,
  Bell,
  CloudSun,
  MapPin,
  AlertCircle,
  X,
  CheckCircle,
  ArrowRight,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import { PestIdentifyStackParamList } from "src/navigation/PestIdentifyStack";

const { width } = Dimensions.get("window");

type Language = "si" | "en";

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
}

type NavProp = StackNavigationProp<PestIdentifyStackParamList>;

// Dynamic API URL based on platform
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_API_BASE || "http://192.168.8.125:8000";
  } else if (Platform.OS === 'ios') {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const PestIdentificationScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<Language>("si");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [leafAnim] = useState(new Animated.Value(0));

  const content = {
    si: {
      title: "🐛 පළිබෝධ හඳුනාගැනීම",
      subtitle: "ස්මාර්ට් ගොවිතැන",
      headerTitle: "පළිබෝධ හඳුනාගැනීම",
      headerSubtitle: "ඡායාරූපයකින් පළිබෝධ හඳුනා ගන්න",
      cameraOption: "කැමරාව භාවිතා කරන්න",
      uploadOption: "ඡායාරූපයක් උඩුගත කරන්න",
      detectButton: "පළිබෝධ හඳුනා ගන්න",
      analyzing: "විශ්ලේෂණය කරමින්...",
      resultTitle: "හඳුනාගත් පළිබෝධ",
      noPests: "පළිබෝධ හමු නොවීය",
      tryAgain: "නැවත උත්සාහ කරන්න",
      pickImage: "ඡායාරූපයක් තෝරන්න",
      orText: "හෝ",
      viewLifecycle: "ජීවන චක්‍රය බලන්න",
    },
    en: {
      title: "🐛 Pest Identification",
      subtitle: "Smart Farming",
      headerTitle: "Pest Identification",
      headerSubtitle: "Identify pests from photos",
      cameraOption: "Use Camera",
      uploadOption: "Upload Photo",
      detectButton: "Detect Pest",
      analyzing: "Analyzing...",
      resultTitle: "Detected Pests",
      noPests: "No pests detected",
      tryAgain: "Try Again",
      pickImage: "Pick an Image",
      orText: "OR",
      viewLifecycle: "View Lifecycle",
    },
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

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
  }, [fadeAnim, scaleAnim, leafAnim]);

  const leafTranslate = leafAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert(language === 'si' 
        ? 'කරුණාකර ගැලරි ප්‍රවේශය ලබා දෙන්න!' 
        : 'Sorry, we need gallery permissions!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
    }
  };

  const pickImageFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert(language === 'si' 
        ? 'කරුණාකර කැමරා ප්‍රවේශය ලබා දෙන්න!' 
        : 'Sorry, we need camera permissions!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
    }
  };

  const uploadAndDetect = async () => {
    if (!imageUri) {
      alert(language === 'si' 
        ? "කරුණාකර පළමුව ඡායාරූපයක් තෝරන්න" 
        : "Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Connecting to:", `${API_URL}/api/pest/identify`);
      console.log("Image URI:", imageUri);

      let formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, "pest.jpg");
      } else {
        formData.append("file", {
          uri: imageUri,
          name: "pest.jpg",
          type: "image/jpeg",
        } as any);
      }
      
      const res = await axios.post(
        `${API_URL}/api/pest/identify?conf=0.4&return_image=false`,
        formData,
        { 
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000
        }
      );

      console.log("Response:", res.data);

      if (res.data.success) {
        setResult(res.data.predictions);
        if (!res.data.predictions || res.data.predictions.length === 0) {
          setError(language === 'si' 
            ? "ඡායාරූපයේ පළිබෝධ හමු නොවීය" 
            : "No pests detected in the image");
        }
      } else {
        setError(language === 'si' ? "හඳුනාගැනීම අසාර්ථකයි" : "Detection failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMsg = language === 'si' 
        ? "සර්වරය සමඟ සම්බන්ධ විය නොහැක!" 
        : "Failed to connect to server!";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Check if Fall Armyworm is detected
  const isFallArmywormDetected = () => {
    if (!result || result.length === 0) return false;
    return result.some(
      (p) => p.class_name.toLowerCase().includes("armyworm")
    );
  };

  const isBollwormDetected = () => {
    if (!result || result.length === 0) return false;
    return result.some((p) => p.class_name.toLowerCase().includes("bollworm"));
  };

  const resetScreen = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {content[language].headerTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {content[language].headerSubtitle}
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

      {/* Sub-header */}
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
            <Text style={styles.apiText}>API: Connected</Text>
          </View>
        </View>
      </View>

      {/* Gradient Background */}
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

          <Text style={styles.subtitle}>{content[language].subtitle}</Text>
          <Text style={styles.title}>{content[language].title}</Text>

          {/* Image Preview */}
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity style={styles.removeImageButton} onPress={resetScreen}>
                <X color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Buttons */}
          {!imageUri && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={pickImageFromCamera}
                activeOpacity={0.85}
              >
                <Camera color="#FFFFFF" size={24} />
                <Text style={styles.actionButtonText}>
                  {content[language].cameraOption}
                </Text>
              </TouchableOpacity>

              <Text style={styles.orText}>{content[language].orText}</Text>

              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={pickImageFromGallery}
                activeOpacity={0.85}
              >
                <Upload color="#DC2626" size={24} />
                <Text style={styles.actionButtonTextSecondary}>
                  {content[language].uploadOption}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Detect Button */}
          {imageUri && !loading && !result && (
            <TouchableOpacity
              style={styles.detectButton}
              onPress={uploadAndDetect}
              activeOpacity={0.85}
            >
              <Bug color="#FFFFFF" size={24} />
              <Text style={styles.detectButtonText}>
                {content[language].detectButton}
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>{content[language].analyzing}</Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#DC2626" size={24} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={resetScreen}>
                <Text style={styles.retryButtonText}>{content[language].tryAgain}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results */}
          {result && result.length > 0 && (
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <CheckCircle color="#16A34A" size={28} />
                <Text style={styles.resultTitle}>{content[language].resultTitle}</Text>
              </View>
              {result.map((p, i) => (
                <View key={i} style={styles.resultItem}>
                  <View style={styles.resultItemLeft}>
                    <Bug color="#DC2626" size={20} />
                    <Text style={styles.resultName}>{p.class_name}</Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {Math.round(p.confidence * 100)}%
                    </Text>
                  </View>
                </View>
              ))}
              
              {/* Show lifecycle button only if Fall Armyworm is detected */}
              {isFallArmywormDetected() && (
                <TouchableOpacity 
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("FallArmywormLifecycle")}
                  activeOpacity={0.85}
                >
                  <Text >
                    {content[language].viewLifecycle}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={20} />
                </TouchableOpacity>
              )}

              {/* Show lifecycle button only if Bollworm is detected */}
              {isBollwormDetected() && (
                <TouchableOpacity 
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("BollwormLifecycle")}
                  activeOpacity={0.85}
                >
                  <Text >
                    {content[language].viewLifecycle}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={20} />
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.tryAgainButton} onPress={resetScreen}>
                <Text style={styles.tryAgainButtonText}>{content[language].tryAgain}</Text>
              </TouchableOpacity>
            </View>
          )}

          {result && result.length === 0 && (
            <View style={styles.noPestsContainer}>
              <CheckCircle color="#16A34A" size={48} />
              <Text style={styles.noPestsText}>{content[language].noPests}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={resetScreen}>
                <Text style={styles.retryButtonText}>{content[language].tryAgain}</Text>
              </TouchableOpacity>
            </View>
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
  lifecycleButton: {
    backgroundColor: "#DC2626",
    padding: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
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
  apiText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16A34A",
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePreviewContainer: {
    width: width - 80,
    height: width - 80,
    maxWidth: 350,
    maxHeight: 350,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
    borderWidth: 3,
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
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
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#16A34A",
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 50,
    width: "90%",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    marginTop: 10,
  },
  detectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 15,
  },
  loadingText: {
    fontSize: 16,
    color: "#991B1B",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    width: "90%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 15,
    color: "#991B1B",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "95%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#D1FAE5",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  resultItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  tryAgainButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
  },
  tryAgainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noPestsContainer: {
    backgroundColor: "#F0FDF4",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    width: "90%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },
  noPestsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
});

export default PestIdentificationScreen;