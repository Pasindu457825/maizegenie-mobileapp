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
  Info,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { PestIdentifyStackParamList } from "src/navigation/PestIdentifyStack";
import { useLanguage } from "../../context/LanguageContext";

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
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE || "http://192.168.8.125:8000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

const PestIdentificationScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const { language: appLang } = useLanguage();
  const language: Language = appLang === "sinhala" ? "si" : "en";

  const content = {
    si: {
      title: "කෘමි හඳුනාගැනීම",
      subtitle: "AI මගින් බලගැන්වූ හඳුනාගැනීම",
      headerTitle: "කෘමි හඳුනාගැනීම",
      headerSubtitle: "ඡායාරූපයකින් කෘමි හඳුනා ගන්න",
      cameraOption: "කැමරාව",
      uploadOption: "ඡායාරූපය",
      detectButton: "හඳුනා ගන්න",
      analyzing: "විශ්ලේෂණය කරමින්...",
      resultTitle: "හඳුනාගත් කෘමි",
      noPests: "කෘමි හමු නොවීය",
      tryAgain: "නැවත උත්සාහ කරන්න",
      pickImage: "ඡායාරූපයක් තෝරන්න",
      orText: "හෝ",
      viewControl: "පාලනය බලන්න",
      viewLifecycle: "ජීවන චක්‍රය බලන්න",
      instructionsTitle: "📸 හොඳ ඡායාරූපයක් සඳහා උපදෙස්",
      instruction1: "✓ පැහැදිලි සහ නිරවුල් රූප භාවිතා කරන්න",
      instruction2: "✓ ප්‍රමාණවත් ආලෝකය තිබේදැයි සහතික කරන්න",
      instruction3: "✓ කෘමියා සමීපයෙන් හා අවධානයෙන් රූගත කරන්න",
      instruction4: "✗ නොපැහැදිලි හෝ අඳුරු රූප වළකින්න",
      instruction5: "✗ ඉතා දුරින් රූගත කළ ඡායාරූප වළකින්න",
    },
    en: {
      title: "Pest Identification",
      subtitle: "AI-Powered Detection",
      headerTitle: "Pest Identification",
      headerSubtitle: "Identify pests from photos",
      cameraOption: "Camera",
      uploadOption: "Gallery",
      detectButton: "Identify Pest",
      analyzing: "Analyzing...",
      resultTitle: "Detected Pests",
      noPests: "No pests detected",
      tryAgain: "Try Again",
      pickImage: "Pick an Image",
      orText: "OR",
      viewControl: "View Control",
      viewLifecycle: "View Lifecycle",
      instructionsTitle: "📸 Tips for Best Results",
      instruction1: "✓ Use clear and focused images",
      instruction2: "✓ Ensure good lighting conditions",
      instruction3: "✓ Capture pest up close and centered",
      instruction4: "✗ Avoid blurry or dark photos",
      instruction5: "✗ Avoid photos taken from too far",
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
  }, [fadeAnim, scaleAnim]);

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(
        language === "si"
          ? "කරුණාකර ගැලරි ප්‍රවේශය ලබා දෙන්න!"
          : "Sorry, we need gallery permissions!"
      );
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

    if (status !== "granted") {
      alert(
        language === "si"
          ? "කරුණාකර කැමරා ප්‍රවේශය ලබා දෙන්න!"
          : "Sorry, we need camera permissions!"
      );
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
      alert(
        language === "si"
          ? "කරුණාකර පළමුව ඡායාරූපයක් තෝරන්න"
          : "Please select an image first"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Connecting to:", `${API_URL}/api/pest/identify`);
      console.log("Image URI:", imageUri);

      let formData = new FormData();

      if (Platform.OS === "web") {
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
          timeout: 30000,
        }
      );

      console.log("Response:", res.data);

      if (res.data.success) {
        setResult(res.data.predictions);
        if (!res.data.predictions || res.data.predictions.length === 0) {
          setError(
            language === "si"
              ? "ඡායාරූපයේ කෘමි හමු නොවීය"
              : "No pests detected in the image"
          );
        }
      } else {
        setError(
          language === "si" ? "හඳුනාගැනීම අසාර්ථකයි" : "Detection failed"
        );
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);

      let errorMsg =
        language === "si"
          ? "සර්වරය සමඟ සම්බන්ධ විය නොහැක!"
          : "Failed to connect to server!";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
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
    return result.some((p) => p.class_name.toLowerCase().includes("armyworm"));
  };

  const isBollwormDetected = () => {
    if (!result || result.length === 0) return false;
    return result.some((p) => p.class_name.toLowerCase().includes("bollworm"));
  };

  const isAsianCornBorerDetected = () => {
    if (!result?.length) return false;

    return result.some((p) => p.class_name.toLowerCase() === "asian-corn-borer");
  };

  const resetScreen = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient colors={["#10AD79", "#0F9D6B"]} style={styles.header}>
        <View style={styles.headerContent}>
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
              <Bell color="#FFFFFF" size={20} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <LinearGradient
                colors={["#10AD79", "#0F9D6B"]}
                style={styles.iconGradient}
              >
                <Text style={styles.pestEmoji}>🔍</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>{content[language].title}</Text>
            <Text style={styles.subtitle}>{content[language].subtitle}</Text>
          </View>

          {/* Instructions Card - Show only when no image */}
          {!imageUri && !result && (
            <View style={styles.instructionsCard}>
              <View style={styles.instructionsHeader}>
                <Info color="#10AD79" size={24} />
                <Text style={styles.instructionsTitle}>
                  {content[language].instructionsTitle}
                </Text>
              </View>

              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionGood}>
                    {content[language].instruction1}
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionGood}>
                    {content[language].instruction2}
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionGood}>
                    {content[language].instruction3}
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBad}>
                    {content[language].instruction4}
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionBad}>
                    {content[language].instruction5}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Image Preview */}
          {imageUri && (
            <View style={styles.imagePreviewContainer}>
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
                <LinearGradient
                  colors={["#10AD79", "#0F9D6B"]}
                  style={styles.buttonGradient}
                >
                  <Camera color="#FFFFFF" size={24} />
                  <Text style={styles.actionButtonText}>
                    {content[language].cameraOption}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.orText}>{content[language].orText}</Text>

              <TouchableOpacity
                style={styles.actionButtonSecondary}
                onPress={pickImageFromGallery}
                activeOpacity={0.85}
              >
                <Upload color="#10AD79" size={24} />
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
              <LinearGradient
                colors={["#10AD79", "#0F9D6B"]}
                style={styles.buttonGradient}
              >
                <Bug color="#FFFFFF" size={24} />
                <Text style={styles.detectButtonText}>
                  {content[language].detectButton}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10AD79" />
              <Text style={styles.loadingText}>
                {content[language].analyzing}
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#EF4444" size={24} />
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
            <View style={styles.resultContainer}>
              <View style={styles.resultHeader}>
                <CheckCircle color="#10AD79" size={28} />
                <Text style={styles.resultTitle}>
                  {content[language].resultTitle}
                </Text>
              </View>
              {result.map((p, i) => (
                <View key={i} style={styles.resultItem}>
                  <View style={styles.resultItemLeft}>
                    <Bug color="#10AD79" size={20} />
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
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewLifecycle}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Show lifecycle button only if Bollworm is detected */}
              {isBollwormDetected() && (
                <TouchableOpacity
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("BollwormLifecycle")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewLifecycle}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Show lifecycle button only if Asian Corn Borer is detected */}
              {isAsianCornBorerDetected() && (
                <TouchableOpacity
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("AsianCornBorerLifecycle")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewLifecycle}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Show control button only if Fall Armyworm is detected */}
              {isFallArmywormDetected() && (
                <TouchableOpacity
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("FallArmywormControl")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewControl}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Show control button only if bollworm is detected */}
              {isBollwormDetected() && (
                <TouchableOpacity
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("BollwormControl")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewControl}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Show control button only if Asian Corn Borer is detected */}
              {isAsianCornBorerDetected() && (
                <TouchableOpacity
                  style={styles.lifecycleButton}
                  onPress={() => navigation.navigate("AsianCornBorerControl")}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#10AD79", "#0F9D6B"]}
                    style={styles.lifecycleGradient}
                  >
                    <Text style={styles.lifecycleButtonText}>
                      {content[language].viewControl}
                    </Text>
                    <ArrowRight color="#FFFFFF" size={20} />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={resetScreen}
              >
                <Text style={styles.tryAgainButtonText}>
                  {content[language].tryAgain}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {result && result.length === 0 && (
            <View style={styles.noPestsContainer}>
              <CheckCircle color="#10AD79" size={48} />
              <Text style={styles.noPestsText}>
                {content[language].noPests}
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
    backgroundColor: "#F0F9FF",
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
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
  content: {
    alignItems: "center",
    paddingVertical: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#10AD79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pestEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  instructionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    width: "100%",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
  },
  instructionsList: {
    gap: 10,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionGood: {
    fontSize: 14,
    color: "#059669",
    lineHeight: 20,
    flex: 1,
  },
  instructionBad: {
    fontSize: 14,
    color: "#DC2626",
    lineHeight: 20,
    flex: 1,
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
    borderColor: "#10AD79",
    shadowColor: "#10AD79",
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
    backgroundColor: "#EF4444",
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
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#10AD79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginVertical: 4,
  },
  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    width: "100%",
    borderWidth: 2,
    borderColor: "#10AD79",
    elevation: 3,
  },
  actionButtonTextSecondary: {
    color: "#10AD79",
    fontSize: 18,
    fontWeight: "bold",
  },
  detectButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
    elevation: 6,
    shadowColor: "#10AD79",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    color: "#10AD79",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    width: "100%",
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
    backgroundColor: "#10AD79",
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
    width: "100%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    shadowColor: "#10AD79",
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
    color: "#047857",
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
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
    backgroundColor: "#10AD79",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  lifecycleButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    elevation: 4,
  },
  lifecycleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lifecycleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  tryAgainButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  tryAgainButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "bold",
  },
  noPestsContainer: {
    backgroundColor: "#F0FDF4",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    gap: 16,
    width: "100%",
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },
  noPestsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#047857",
    textAlign: "center",
  },
});

export default PestIdentificationScreen;