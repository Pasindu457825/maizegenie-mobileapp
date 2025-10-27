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
  Alert,
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
  Leaf,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

type Language = "si" | "en";

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
}

type RootStackParamList = {
  PestIdentificationScreen: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList>;

// Enhanced API configuration
const getApiConfig = () => {
  if (__DEV__) {
    // Automatically detect your PC IP via Expo
    const { manifest2, manifest } = Constants;
    let devHost = "localhost";

    if (manifest2?.extra?.expoGo?.developer?.host) {
      devHost = manifest2.extra.expoGo.developer.host.split(":")[0];
    } else if (manifest?.debuggerHost) {
      devHost = manifest.debuggerHost.split(":")[0];
    }

    const baseURL =
      Platform.OS === "android"
        ? `http://${devHost}:8000`
        : `http://${devHost}:8000`;

    console.log("🌐 API_BASE =>", baseURL);
    return { baseURL, timeout: 45000 };
  }

  // Production API (later, when deployed)
  return { baseURL: "https://api.maizegenie.lk", timeout: 45000 };
};

const API_CONFIG = getApiConfig();

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
  const [slideAnim] = useState(new Animated.Value(50));

  const content = {
    si: {
      title: "🐛 පළිබෝධ හඳුනාගැනීම",
      subtitle: "ස්මාර්ට් ගොවිතැන",
      headerTitle: "පළිබෝධ හඳුනාගැනීම",
      headerSubtitle: "ඡායාරූපයකින් පළිබෝධ හඳුනා ගන්න",
      cameraOption: "කැමරාව භාවිතා කරන්න",
      uploadOption: "ඡායාරූපයක් උඩුගත කරන්න",
      detectButton: "පළිබෝධ හඳුනා ගන්න",
      analyzing: "රූපය විශ්ලේෂණය කරමින්...",
      resultTitle: "හඳුනාගත් පළිබෝධ",
      noPests: "පළිබෝධ හමු නොවීය! 🎉",
      tryAgain: "නැවත උත්සාහ කරන්න",
      pickImage: "ඡායාරූපයක් තෝරන්න",
      orText: "හෝ",
      successMessage: "සාර්ථකව හඳුනාගති!",
      selectImageFirst: "කරුණාකර පළමුව ඡායාරූපයක් තෝරන්න",
      permissionDenied: "ප්‍රවේශ අවසරය අවශ්‍යයි",
      serverError: "සේවාදායකයට සම්බන්ධ විය නොහැක",
    },
    en: {
      title: "🐛 Pest Identification",
      subtitle: "Smart Farming",
      headerTitle: "Pest Identification",
      headerSubtitle: "Identify pests from photos",
      cameraOption: "Use Camera",
      uploadOption: "Upload Photo",
      detectButton: "Detect Pest",
      analyzing: "Analyzing image...",
      resultTitle: "Detected Pests",
      noPests: "No pests detected! 🎉",
      tryAgain: "Try Again",
      pickImage: "Pick an Image",
      orText: "OR",
      successMessage: "Successfully identified!",
      selectImageFirst: "Please select an image first",
      permissionDenied: "Permission required",
      serverError: "Cannot connect to server",
    },
  };

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating leaf animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, leafAnim, slideAnim]);

  const leafTranslate = leafAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const requestPermissions = async (
    type: "camera" | "gallery"
  ): Promise<boolean> => {
    let permissionResult;

    if (type === "camera") {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permissionResult.granted) {
      Alert.alert(
        content[language].permissionDenied,
        language === "si"
          ? `කරුණාකර ${
              type === "camera" ? "කැමරා" : "ගැලරි"
            } ප්‍රවේශය ලබා දෙන්න!`
          : `Please grant ${type} permissions to continue!`,
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    if (!(await requestPermissions("gallery"))) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
    }
  };

  const pickImageFromCamera = async () => {
    if (!(await requestPermissions("camera"))) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
    }
  };

  const uploadAndDetect = async () => {
    if (!imageUri) {
      Alert.alert(content[language].selectImageFirst);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        "🔍 Connecting to:",
        `${API_CONFIG.baseURL}/api/disease/identify`
      );

      const formData = new FormData();

      // Handle different platforms
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, "pest-image.jpg");
      } else {
        formData.append("file", {
          uri: imageUri,
          name: "pest-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/disease/identify?conf=0.4&return_image=false`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: API_CONFIG.timeout,
        }
      );

      console.log("✅ Response received:", response.data);

      if (response.data.success) {
        const predictions = response.data.predictions || [];
        setResult(predictions);

        if (predictions.length === 0) {
          setError(content[language].noPests);
        }
      } else {
        throw new Error(response.data.message || "Detection failed");
      }
    } catch (err: any) {
      console.error("❌ Upload error:", err);

      let errorMsg = content[language].serverError;

      if (err.code === "ECONNABORTED") {
        errorMsg =
          language === "si"
            ? "කාලය ඉක්මවී ගියේය! නැවත උත්සාහ කරන්න"
            : "Request timeout! Please try again";
      } else if (err.response?.data) {
        errorMsg =
          err.response.data.detail ||
          err.response.data.message ||
          JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetScreen = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#EF4444"; // High - Red
    if (confidence >= 0.6) return "#F59E0B"; // Medium - Amber
    return "#10B981"; // Low - Green
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return language === "si" ? "ඉහළ" : "High";
    if (confidence >= 0.6) return language === "si" ? "මධ්‍යම" : "Medium";
    return language === "si" ? "අඩු" : "Low";
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
            <Leaf color="#DC2626" size={20} />
          </View>
          <View>
            <View style={styles.locationRow}>
              <MapPin color="#991B1B" size={14} />
              <Text style={styles.locationText}>
                {language === "si" ? "මොණරාගල" : "Monaragala"}
              </Text>
            </View>
            <Text style={styles.apiText}>
              API: {__DEV__ ? "Development" : "Production"}
            </Text>
          </View>
        </View>
      </View>

      {/* Animated Background Elements */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf1,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <Bug color="#DC2626" size={44} opacity={0.2} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.floatingLeaf2,
          { transform: [{ translateY: leafTranslate }] },
        ]}
      >
        <Leaf color="#16A34A" size={38} opacity={0.2} />
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
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          {/* Animated Icon */}
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
            <Animated.View
              style={[
                styles.imagePreviewContainer,
                { transform: [{ scale: fadeAnim }] },
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={resetScreen}
              >
                <X color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Action Buttons */}
          {!imageUri && !loading && (
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

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>{content[language].orText}</Text>
                <View style={styles.dividerLine} />
              </View>

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
              disabled={loading}
            >
              <Bug color="#FFFFFF" size={24} />
              <Text style={styles.detectButtonText}>
                {content[language].detectButton}
              </Text>
            </TouchableOpacity>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#DC2626" />
              <Text style={styles.loadingText}>
                {content[language].analyzing}
              </Text>
              <Text style={styles.loadingSubtext}>
                {language === "si"
                  ? "කරුණාකර රැඳී සිටින්න..."
                  : "Please wait..."}
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !result && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#DC2626" size={32} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetScreen}
              >
                <Text style={styles.retryButtonText}>
                  {content[language].tryAgain}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results */}
          {result && result.length > 0 && (
            <Animated.View
              style={[
                styles.resultContainer,
                { transform: [{ scale: fadeAnim }] },
              ]}
            >
              <View style={styles.resultHeader}>
                <CheckCircle color="#16A34A" size={28} />
                <Text style={styles.resultTitle}>
                  {content[language].resultTitle}
                </Text>
                <Text style={styles.successSubtitle}>
                  {content[language].successMessage}
                </Text>
              </View>

              {result.map((prediction, index) => (
                <View
                  key={`${prediction.class_id}-${index}`}
                  style={styles.resultItem}
                >
                  <View style={styles.resultItemLeft}>
                    <Bug color="#DC2626" size={20} />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultName}>
                        {prediction.class_name}
                      </Text>
                      <Text style={styles.confidenceLevel}>
                        {getConfidenceLevel(prediction.confidence)}{" "}
                        {language === "si" ? "විශ්වාසනීයත්වය" : "confidence"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.confidenceBadge,
                      {
                        backgroundColor: getConfidenceColor(
                          prediction.confidence
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {Math.round(prediction.confidence * 100)}%
                    </Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={resetScreen}
              >
                <Text style={styles.tryAgainButtonText}>
                  {content[language].tryAgain}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* No Pests Found */}
          {result && result.length === 0 && (
            <View style={styles.noPestsContainer}>
              <CheckCircle color="#16A34A" size={48} />
              <Text style={styles.noPestsText}>
                {content[language].noPests}
              </Text>
              <Text style={styles.noPestsSubtext}>
                {language === "si"
                  ? "ඔබේ බෝගය පළිබෝධ තර්ජනයකින් තොරව සෞඛ්‍ය සම්පන්නයි!"
                  : "Your crop is healthy and free from pest threats!"}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={resetScreen}
              >
                <Text style={styles.retryButtonText}>
                  {content[language].tryAgain}
                </Text>
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
    paddingHorizontal: 20,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    lineHeight: 22,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  langButtonHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#DC2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  langText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "bold",
  },
  subHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 99,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DC2626",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#991B1B",
  },
  apiText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  floatingLeaf1: {
    position: "absolute",
    top: 180,
    left: 20,
    zIndex: 1,
  },
  floatingLeaf2: {
    position: "absolute",
    top: 250,
    right: 25,
    zIndex: 1,
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
    paddingVertical: 20,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    position: "relative",
  },
  iconInner: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "#B91C1C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pestEmoji: {
    fontSize: 52,
  },
  pulseRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#DC2626",
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: "#B91C1C",
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#DC2626",
    marginBottom: 30,
    textAlign: "center",
    textShadowColor: "rgba(220, 38, 38, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imagePreviewContainer: {
    width: width - 80,
    height: width - 80,
    maxWidth: 320,
    maxHeight: 320,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    position: "relative",
    borderWidth: 4,
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(220, 38, 38, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#DC2626",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 50,
    width: "100%",
    maxWidth: 280,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 280,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#FECACA",
    borderRadius: 1,
  },
  orText: {
    fontSize: 14,
    color: "#991B1B",
    fontWeight: "700",
    marginHorizontal: 16,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 50,
    width: "100%",
    maxWidth: 280,
    borderWidth: 3,
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonTextSecondary: {
    color: "#DC2626",
    fontSize: 18,
    fontWeight: "700",
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#16A34A",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 50,
    width: "100%",
    maxWidth: 280,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    marginTop: 10,
  },
  detectButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 20,
    width: "100%",
  },
  loadingText: {
    fontSize: 18,
    color: "#991B1B",
    fontWeight: "700",
    textAlign: "center",
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#B45309",
    fontWeight: "500",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 320,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#FCA5A5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: "#991B1B",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resultContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#D1FAE5",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  resultHeader: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderBottomColor: "#D1FAE5",
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "600",
    textAlign: "center",
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resultItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  confidenceLevel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  confidenceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  tryAgainButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  tryAgainButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  noPestsContainer: {
    backgroundColor: "#F0FDF4",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    gap: 20,
    width: "100%",
    maxWidth: 320,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#BBF7D0",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  noPestsText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#166534",
    textAlign: "center",
  },
  noPestsSubtext: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default PestIdentificationScreen;
