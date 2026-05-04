import React, { useState, useEffect, useRef } from "react";
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
  StatusBar,
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
  MessageSquare,
  Scan,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Search,
  TrendingUp,
  Volume2,
  Shield,
  ArrowLeft,
  RefreshCw,
} from "lucide-react-native";
import { API_BASE } from "../../services/api";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useLanguage } from "../../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Constants from "expo-constants";
import * as Speech from "expo-speech";

import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";

import { Audio } from "expo-av";
import { useApp } from "../../context/AppContext";

type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "DiseaseDetection"
>;
type DiseaseDetectionRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "DiseaseDetection"
>;

const { width, height } = Dimensions.get("window");

type Language = "si" | "en";

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
  box_xyxy?: number[];
  impact_boxes?: number[][];
}

const normalizePredictions = (raw: any): Prediction[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return [];
};

const API_BASE_URL = API_BASE;
const REQUEST_TIMEOUT = 45000;

const DiseaseIdentificationScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DiseaseDetectionRouteProp>();
  const { language: lang, setLanguage } = useLanguage();
  const language = lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";

  const content = {
    si: {
      title: "🍃 කොළ රෝග හඳුනාගැනීම",
      subtitle: "ස්මාර්ට් ගොවිතැන",
      headerTitle: "කොළ රෝග හඳුනාගැනීම",
      headerSubtitle: "ඡායාරූපයකින් කොළ රෝග හඳුනා ගන්න",
      cameraOption: "කැමරාව භාවිතා කරන්න",
      uploadOption: "ඡායාරූපයක් උඩුගත කරන්න",
      detectButton: "රෝග හඳුනා ගන්න",
      analyzing: "රූපය විශ්ලේෂණය කරමින්...",
      resultTitle: "රෝගය හමුවිය",
      noDiseases: "රෝග හමු නොවීය! 🎉",
      tryAgain: "නැවත උත්සාහ කරන්න",
      pickImage: "ඡායාරූපයක් තෝරන්න",
      orText: "හෝ",
      successMessage: "සාර්ථකව හඳුනාගති!",
      selectImageFirst: "කරුණාකර පළමුව ඡායාරූපයක් තෝරන්න",
      permissionDenied: "ප්‍රවේශ අවසරය අවශ්‍යයි",
      serverError: "සේවාදායකයට සම්බන්ධ විය නොහැක",
      viewDetails: "වැඩි විස්තර බලන්න",
      uploadPhoto: "ඡායාරූපය උඩුගත කරන්න",
      modernAgriculture: "නවීන කෘෂිකර්මය",
      healthyCrop: "සෞඛ්‍ය සම්පන්න බෝග",
      back: "ආපසු",
      newDetection: "නව හඳුනාගැනීම",
      speak: "කියවන්න",
      confidence: "විශ්වාසනීයත්වය",
      high: "වැඩිය",
      medium: "මධ්‍යමය",
      low: "අඩුය",
      severity: "රෝගය ආසාදිත ප්‍රමාණය",
      detectionStatus: "හඳුනාගැනීමේ තත්ත්වය",
      healthy: "සෞඛ්‍ය සම්පන්න කොළයකි",
      location: "ස්ථානය",
      status: "තත්ත්වය",
      invalidLeafTitle: "වලංගු නොවන කොළ ඡායාරූපයක්",
      invalidLeafSubtitle:
        "මෙය බඩ ඉරිඟු කොළයක් නොවිය හැක. කරුණාකර නිවැරදි කොළ ඡායාරූපයක් නැවත උඩුගත කරන්න.",
      invalidSuggestionsTitle: "ඡායාරූපය නිවැරදි ලෙස ලබාගැනීමට උපදෙස්",
      invalidSuggestions: [
        "හානි වූ බඩ ඉරිඟු කොළයක් පමණක් ඡායාරූපයට ගන්න",
        "හොඳ ආලෝකය සහ පැහැදිලි බව සහිත ඡායාරූපයක් ගන්න",
        "කොළය සම්පූර්ණයෙන්ම කැමරාවේ මධ්‍යයට පැහැදිලිව ගන්න",
        "ලප, කහ පැහැය, වියළීම, රස්ට් වැනි රෝග ලක්ෂණ පැහැදිලිව පෙනෙන කොළයක් භාවිතා කරන්න",
        "බොඳ වූ හෝ දුරින් ගත් ඡායාරූප භාවිතා නොකරන්න",
      ],
      managePrices: "ප්‍රතිකාර මිල කළමනාකරණය",
      managePricesDesc:
        "නිලධාරීන්ට පමණක්: බලන්න, එකතු කරන්න, යාවත්කාලීන කරන්න, මකන්න",
      identifyDisease: "රෝගය හඳුනාගන්න",
      identifyDiseaseDesc: "AI මගින් ඉක්මන් හඳුනාගැනීම",
      openTreatmentPrices: "ප්‍රතිකාර මිල බලන්න",
      openTreatmentPricesDesc: "නිලධාරීන්ට පමණක් මිල කළමනාකරණය",
      chooseImageMethod: "ඡායාරූප මූලාශ්‍රය තෝරන්න",
      homeDescription:
        "කොළ රෝග හඳුනාගැනීම සහ ප්‍රතිකාර තීරණ සඳහා ඔබේ බුද්ධිමත් සහායක",
      smartAI: "Smart AI",
      realTime: "Real-time",
      community: "Community",
    },
    en: {
      title: "🍃 Leaf Disease Detection",
      subtitle: "Smart Farming",
      headerTitle: "Leaf Disease Detection",
      headerSubtitle: "Identify leaf diseases from photos",
      cameraOption: "Use Camera",
      uploadOption: "Upload Photo",
      detectButton: "Detect Disease",
      analyzing: "Analyzing image...",
      resultTitle: "Diseases Detected ",
      noDiseases: "No diseases detected! 🎉",
      tryAgain: "Try Again",
      pickImage: "Pick an Image",
      orText: "OR",
      successMessage: "Successfully identified!",
      selectImageFirst: "Please select an image first",
      permissionDenied: "Permission required",
      serverError: "Cannot connect to server",
      viewDetails: "View More Details",
      uploadPhoto: "Upload Photo",
      modernAgriculture: "Modern Agriculture",
      healthyCrop: "Healthy Crop",
      back: "Back",
      newDetection: "New Detection",
      speak: "Speak",
      confidence: "Confidence",
      high: "High",
      medium: "Medium",
      low: "Low",
      severity: "Degree of Infection",
      detectionStatus: "Detection Status",
      healthy: "Healthy",
      location: "Location",
      status: "Status",
      invalidLeafTitle: "Invalid Leaf Image",
      invalidLeafSubtitle:
        "This image may not be a maize leaf. Please upload a clear maize leaf image.",
      invalidSuggestionsTitle: "Tips to upload a correct image",
      invalidSuggestions: [
        "Capture only a damaged or diseased maize leaf",
        "Use good lighting and clear focus",
        "Keep the leaf fully centered in the image",
        "Ensure visible disease symptoms (spots, discoloration, rust, or drying)",
        "Avoid blurry or distant photos",
      ],
      managePrices: "Manage Treatment Prices",
      managePricesDesc: "Officers only: view, add, update, delete",
      identifyDisease: "Identify Disease",
      identifyDiseaseDesc: "Instant AI-powered identification",
      openTreatmentPrices: "View Treatment Prices",
      openTreatmentPricesDesc: "Officer-only price management",
      chooseImageMethod: "Choose image source",
      homeDescription:
        "Your intelligent assistant for disease detection and treatment guidance",
      smartAI: "Smart AI",
      realTime: "Real-time",
      community: "Community",
    },
    ta: {
      title: "🍃 இலை நோய் கண்டறிதல்",
      subtitle: "திறன்மிகு விவசாயம்",
      headerTitle: "இலை நோய் கண்டறிதல்",
      headerSubtitle: "புகைப்படங்களிலிருந்து இலை நோய்களைக் கண்டறியவும்",
      cameraOption: "கேமராவைப் பயன்படுத்து",
      uploadOption: "புகைப்படத்தைப் பதிவேற்று",
      detectButton: "நோயைக் கண்டறி",
      analyzing: "படத்தை பகுப்பாய்வு செய்கிறது...",
      resultTitle: "நோய்கள் கண்டறியப்பட்டன",
      noDiseases: "நோய்கள் எதுவும் கண்டறியப்படவில்லை! 🎉",
      tryAgain: "மீண்டும் முயற்சி செய்",
      pickImage: "ஒரு படத்தைத் தேர்ந்தெடு",
      orText: "அல்லது",
      successMessage: "வெற்றிகரமாக அடையாளம் காணப்பட்டது!",
      selectImageFirst: "முதலில் ஒரு படத்தைத் தேர்ந்தெடுக்கவும்",
      permissionDenied: "அனுமதி தேவை",
      serverError: "சேவையகத்துடன் இணைக்க முடியவில்லை",
      viewDetails: "மேலும் விவரங்களைக் காண்க",
      uploadPhoto: "புகைப்படத்தைப் பதிவேற்று",
      modernAgriculture: "நவீன விவசாயம்",
      healthyCrop: "ஆரோக்கியமான பயிர்",
      back: "பின்செல்",
      newDetection: "புதிய கண்டறிதல்",
      speak: "பேசு",
      confidence: "நம்பிக்கை",
      high: "அதிகம்",
      medium: "நடுத்தரம்",
      low: "குறைவு",
      severity: "தொற்றுநோயின் அளவு",
      detectionStatus: "கண்டறிதல் நிலை",
      healthy: "ஆரோக்கியமானது",
      location: "இடம்",
      status: "நிலை",
      invalidLeafTitle: "செல்லாத இலைப் படம்",
      invalidLeafSubtitle:
        "இந்தப் படம் மக்காச்சோள இலையாக இருக்காது. தெளிவான மக்காச்சோள இலைப் படத்தைப் பதிவேற்றவும்.",
      invalidSuggestionsTitle:
        "சரியான படத்தைப் பதிவேற்றுவதற்கான உதவிக்குறிப்புகள்",
      invalidSuggestions: [
        "சேதமடைந்த அல்லது நோயுற்ற மக்காச்சோள இலையை மட்டும் படம்பிடிக்கவும்",
        "நல்ல வெளிச்சம் மற்றும் தெளிவான மையத்தைப் பயன்படுத்தவும்",
        "படத்தின் மையத்தில் இலையை முழுமையாக வைத்திருக்கவும்",
        "தெளிவான நோய் அறிகுறிகளை (புள்ளிகள், நிறமாற்றம், துரு, அல்லது உலர்தல்) உறுதிசெய்யவும்",
        "மங்கலான அல்லது தொலைதூரப் புகைப்படங்களைத் தவிர்க்கவும்",
      ],
      managePrices: "சிகிச்சை விலைகளை நிர்வகி",
      managePricesDesc:
        "அதிகாரிகளுக்கு மட்டும்: பார்வை, சேர்த்து, புதுப்பித்து, நீக்கு",
      identifyDisease: "நோயை கண்டறி",
      identifyDiseaseDesc: "உடனடி AI அடையாளம்",
      openTreatmentPrices: "சிகிச்சை விலைகளை பார்க்க",
      openTreatmentPricesDesc: "அதிகாரிகளுக்கு மட்டும் விலை மேலாண்மை",
      chooseImageMethod: "பட மூலத்தைத் தேர்வு செய்க",
      homeDescription:
        "நோய் கண்டறிதலும் சிகிச்சை முடிவுகளுக்கும் உங்கள் புத்திசாலி உதவியாளர்",
      smartAI: "Smart AI",
      realTime: "Real-time",
      community: "Community",
    },
  };

  const [imageUri, setImageUri] = useState<string | null>(null);
  interface DetectionResult {
    predictions: Prediction[];
    severity_score: number;
    severity_label: string;
  }

  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [slideAnim] = useState(new Animated.Value(30));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showIdentifyOptions, setShowIdentifyOptions] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    }
  }, []);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for main button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const soundRef = useRef<Audio.Sound | null>(null);

  const requestPermissions = async (
    type: "camera" | "gallery",
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
          : language === "ta"
            ? `தொடர ${
                type === "camera" ? "கேமரா" : "கேலரி"
              } அனுமதிகளை வழங்கவும்!`
            : `Please grant ${type} permissions to continue!`,
        [{ text: "OK" }],
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
      quality: 0.9,
      exif: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
      // Scroll to top when new image is selected
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const [isSpeaking, setIsSpeaking] = useState(false);

  const pickImageFromCamera = async () => {
    if (!(await requestPermissions("camera"))) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
      exif: false,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const { diseaseModel, user } = useApp(); // ✅ global value

  const uploadAndDetect = async () => {
    if (!imageUri) {
      Alert.alert(content[language].selectImageFirst);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Connecting to:", `${API_BASE_URL}/api/disease/identify`);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, "disease-image.jpg");
      } else {
        formData.append("file", {
          uri: imageUri,
          name: "disease-image.jpg",
          type: "image/jpeg",
        } as any);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/disease/identify?model=${diseaseModel}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );

      console.log("✅ Response received:", response.data);

      if (response.data.success) {
        const res = response.data;
        const predictions = normalizePredictions(res?.predictions);
        const severity_score = res.severity_score ?? 0;
        const severity_label = res.severity_label ?? "None";

        setResult({
          predictions,
          severity_score,
          severity_label,
        });

        if (!predictions || predictions.length === 0) {
          setError(content[language].noDiseases);
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
            : language === "ta"
              ? "நேரம் முடிந்தது! மீண்டும் முயற்சி செய்யவும்"
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

  const speakDisease = async (predictionName: string) => {
    const cleanName = formatDiseaseName(predictionName).toLowerCase();

    // 🔴 ALWAYS stop TTS first (iOS requirement)
    Speech.stop();

    // 🔴 Stop & unload previous audio if any
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }

    // 🇱🇰 Sinhala → play recorded audio
    if (language === "si" && sinhalaAudioMap[cleanName]) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          sinhalaAudioMap[cleanName],
          { shouldPlay: true },
        );

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsSpeaking(false); // 👈 auto-hide STOP
          }
        });

        soundRef.current = sound;
        return;
      } catch (err) {
        console.log("Sinhala audio failed, fallback to TTS", err);
      }
    }

    // 🔊 English / fallback TTS (NOW WORKS ON iOS)
    Speech.speak(
      language === "si"
        ? `${cleanName} රෝගය හමුවිය`
        : language === "ta"
          ? `${cleanName} நோய் கண்டறியப்பட்டது`
          : `${cleanName} disease detected`,
      {
        language:
          language === "si" ? "si-LK" : language === "ta" ? "ta-IN" : "en-US",
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          setIsSpeaking(false); // ✅ auto-hide STOP when TTS ends
        },
      },
    );
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      Speech.stop();
    };
  }, []);

  const resetScreen = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
    setShowIdentifyOptions(true);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    if (route.params?.resetToken) {
      resetScreen();
    }
  }, [route.params?.resetToken]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#10B981";
    if (confidence >= 0.6) return "#F59E0B";
    return "#EF4444";
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return content[language].high;
    if (confidence >= 0.6) return content[language].medium;
    return content[language].low;
  };

  const getSeverityColor = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev.includes("high") || sev.includes("severe")) return "#DC2626";
    if (sev.includes("medium") || sev.includes("moderate")) return "#F59E0B";
    return "#10B981";
  };

  const getSeverityIcon = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev.includes("high") || sev.includes("severe")) return "🔴";
    if (sev.includes("medium") || sev.includes("moderate")) return "🟡";
    return "🟢";
  };

  // Convert class names like "gray_leaf_spot" → "Gray Leaf Spot"
  const formatDiseaseName = (name: string) => {
    return name
      .replace(/_/g, " ") // replace underscores
      .replace(/\s+/g, " ") // fix extra spaces
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const sinhalaAudioMap: Record<string, any> = {
    "gray spot": require("../../../assets/disease_sinhala_voices/gray_leaf_spot_si.wav"),
    "common rust": require("../../../assets/disease_sinhala_voices/common_rust_si.wav"),
    blight: require("../../../assets/disease_sinhala_voices/leaf_blight_si.wav"),
  };

  const isInvalidPrediction =
    result?.predictions?.length === 1 &&
    ["invalid_leaf", "invalid_image"].includes(
      result.predictions[0].class_name.toLowerCase(),
    );

  const isHealthyPrediction =
    result?.predictions?.length === 1 &&
    result.predictions[0].class_name.toLowerCase() === "health";

  const primaryPrediction = result?.predictions?.[0] || null;
  const diseaseName = primaryPrediction
    ? formatDiseaseName(primaryPrediction.class_name)
    : "";
  const confidencePct = primaryPrediction
    ? Math.round(primaryPrediction.confidence * 100)
    : 0;

  const getDiseaseNameSi = (rawClassName: string) => {
    const key = formatDiseaseName(rawClassName).toLowerCase();

    if (key.includes("blight")) return "කොළ බ්ලයිට්";
    if (key.includes("common rust")) return "කොමන් රස්ට්";
    if (key.includes("gray") && key.includes("spot")) return "අළු ලප";

    // fallback (if unknown)
    return diseaseName;
  };

  const getDiseaseNameTa = (rawClassName: string) => {
    const key = formatDiseaseName(rawClassName).toLowerCase();

    if (key.includes("blight")) return "இலை கருகல்";
    if (key.includes("common rust")) return "பொதுவான துரு";
    if (key.includes("gray") && key.includes("spot")) return "சாம்பல் புள்ளி";

    // fallback (if unknown)
    return diseaseName;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#10ad79ff" />

      {/* Enhanced Header */}
      <LinearGradient
        colors={["#10ad79ff", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {content[language].headerTitle}
          </Text>
        </View>
      </LinearGradient>

      {/* Main ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Animated.View
                  style={[
                    styles.heroIcon,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <View style={styles.heroIconInner}>
                    <Leaf size={48} color="#FFFFFF" />
                  </View>
                  <View style={styles.heroIconRing} />
                </Animated.View>

                <View style={styles.sparkleContainer}>
                  <Sparkles size={16} color="#10B981" style={styles.sparkle1} />
                  <Sparkles size={12} color="#059669" style={styles.sparkle2} />
                </View>
              </View>

              <Text style={styles.heroTitle}>{content[language].title}</Text>
              <Text style={styles.heroSubtitle}>
                {content[language].subtitle}
              </Text>
            </View>
          </View>

          {!imageUri && !loading && !showIdentifyOptions && (
            <View style={styles.homeInfoSection}>
              <Text style={styles.homeInfoDescription}>
                {content[language].homeDescription}
              </Text>
              <View style={styles.homeStatsRow}>
                <View style={styles.homeStatCard}>
                  <View style={styles.homeStatIcon}>
                    <Shield size={18} color="#10B981" />
                  </View>
                  <Text style={styles.homeStatText}>
                    {content[language].smartAI}
                  </Text>
                </View>
                <View style={styles.homeStatCard}>
                  <View style={styles.homeStatIcon}>
                    <TrendingUp size={18} color="#10B981" />
                  </View>
                  <Text style={styles.homeStatText}>
                    {content[language].realTime}
                  </Text>
                </View>
                <View style={styles.homeStatCard}>
                  <View style={styles.homeStatIcon}>
                    <MessageSquare size={18} color="#10B981" />
                  </View>
                  <Text style={styles.homeStatText}>
                    {content[language].community}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Image Preview Section */}
          {imageUri && (
            <Animated.View
              style={[
                styles.imageSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.imageCard}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={resetScreen}
                  >
                    <X size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Action Buttons Section */}
          {!imageUri && !loading && (
            <Animated.View
              style={[
                styles.actionSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Image Upload Guidance */}
              {showIdentifyOptions && (
                <View
                  style={{
                    backgroundColor: "#ECFDF5",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: "#A7F3D0",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <AlertCircle size={18} color="#059669" />
                    <Text
                      style={{
                        marginLeft: 8,
                        fontWeight: "700",
                        color: "#047857",
                        fontSize: 14,
                      }}
                    >
                      {content[language].invalidSuggestionsTitle}
                    </Text>
                  </View>

                  {content[language].invalidSuggestions.map(
                    (tip: string, index: number) => (
                      <Text
                        key={index}
                        style={{
                          color: "#047857",
                          fontSize: 13,
                          marginBottom: 6,
                          lineHeight: 18,
                        }}
                      >
                        • {tip}
                      </Text>
                    ),
                  )}
                </View>
              )}
              <View style={styles.actionCards}>
                {!showIdentifyOptions ? (
                  <>
                    <TouchableOpacity
                      style={styles.primaryHomeAction}
                      onPress={() => setShowIdentifyOptions(true)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.homeActionIconPrimary}>
                        <Search size={24} color="#10B981" />
                      </View>
                      <View style={styles.homeActionContent}>
                        <Text style={styles.homeCardTitle}>
                          {content[language].identifyDisease}
                        </Text>
                        <Text style={styles.homeCardDesc}>
                          {content[language].identifyDiseaseDesc}
                        </Text>
                      </View>
                      <View style={styles.homeActionArrowPrimary}>
                        <ArrowRight size={18} color="#10B981" />
                      </View>
                    </TouchableOpacity>

                    {user?.role === "officer" && (
                      <TouchableOpacity
                        style={styles.secondaryHomeAction}
                        onPress={() =>
                          navigation.navigate("TreatmentPricesAdmin")
                        }
                        activeOpacity={0.9}
                      >
                        <View style={styles.homeActionIconSecondary}>
                          <Shield size={22} color="#38BDF8" />
                        </View>
                        <View style={styles.homeActionContent}>
                          <Text style={styles.homeCardTitle}>
                            {content[language].openTreatmentPrices}
                          </Text>
                          <Text style={styles.homeCardDesc}>
                            {content[language].openTreatmentPricesDesc}
                          </Text>
                        </View>
                        <View style={styles.homeActionArrowSecondary}>
                          <ArrowRight size={16} color="#38BDF8" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <View style={styles.chooseMethodBanner}>
                      <Text style={styles.chooseMethodText}>
                        {content[language].chooseImageMethod}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.actionCard, styles.actionCardPrimary]}
                      onPress={pickImageFromCamera}
                      activeOpacity={0.9}
                    >
                      <View style={styles.actionIconContainer}>
                        <Camera size={28} color="#FFFFFF" />
                      </View>
                      <Text style={styles.actionCardTitle}>
                        {content[language].cameraOption}
                      </Text>
                      <Text style={styles.actionCardDescription}>
                        {language === "si"
                          ? "කැමරාවෙන් සෘජුවම ඡායාරූප ගන්න"
                          : language === "ta"
                            ? "கேமராவிலிருந்து நேரடியாக புகைப்படம் எடுக்கவும்"
                            : "Take photo directly from camera"}
                      </Text>
                      <View style={styles.actionArrow}>
                        <ChevronRight size={18} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionCard, styles.actionCardSecondary]}
                      onPress={pickImageFromGallery}
                      activeOpacity={0.9}
                    >
                      <View
                        style={[
                          styles.actionIconContainer,
                          styles.actionIconSecondary,
                        ]}
                      >
                        <Upload size={28} color="#10B981" />
                      </View>
                      <Text
                        style={[
                          styles.actionCardTitle,
                          styles.actionCardTitleSecondary,
                        ]}
                      >
                        {content[language].uploadOption}
                      </Text>
                      <Text
                        style={[
                          styles.actionCardDescription,
                          styles.actionCardDescriptionSecondary,
                        ]}
                      >
                        {language === "si"
                          ? "ගැලරියෙන් පවතින ඡායාරූප තෝරන්න"
                          : language === "ta"
                            ? "கேலரியில் இருந்து இருக்கும் புகைப்படங்களைத் தேர்ந்தெடுக்கவும்"
                            : "Choose existing photos from gallery"}
                      </Text>
                      <View
                        style={[
                          styles.actionArrow,
                          styles.actionArrowSecondary,
                        ]}
                      >
                        <ChevronRight size={18} color="#10B981" />
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </Animated.View>
          )}

          {/* Detect Button */}
          {imageUri && !loading && !result && (
            <Animated.View
              style={[
                styles.detectSection,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.detectButton}
                onPress={uploadAndDetect}
                activeOpacity={0.9}
                disabled={loading}
              >
                <View style={styles.detectButtonContent}>
                  <Scan size={24} color="#FFFFFF" />
                  <Text style={styles.detectButtonText}>
                    {content[language].detectButton}
                  </Text>
                  <Shield size={20} color="#FFFFFF" />
                </View>
                <View style={styles.detectButtonGlow} />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingSection}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#10B981" />
                <View style={styles.loadingTextContainer}>
                  <Text style={styles.loadingText}>
                    {content[language].analyzing}
                  </Text>
                  <Text style={styles.loadingSubtext}>
                    {language === "si"
                      ? "කරුණාකර රැඳී සිටින්න..."
                      : language === "ta"
                        ? "தயவுசெய்து காத்திருக்கவும்..."
                        : "Please wait..."}
                  </Text>
                </View>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}

          {/* Error State */}
          {error && !result && (
            <View style={styles.errorSection}>
              <View style={styles.errorCard}>
                <View style={styles.errorIconContainer}>
                  <AlertCircle size={36} color="#EF4444" />
                </View>
                <Text style={styles.errorTitle}>
                  {language === "si"
                    ? "දෝෂයක්"
                    : language === "ta"
                      ? "பிழை"
                      : "Error"}
                </Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={resetScreen}
                >
                  <Text style={styles.retryButtonText}>
                    {content[language].tryAgain}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Invalid Leaf Result */}
          {result && isInvalidPrediction && (
            <Animated.View
              style={[
                styles.resultSection,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.resultCard}>
                <View style={{ alignItems: "center", gap: 12 }}>
                  <AlertCircle size={48} color="#F59E0B" />

                  <Text style={styles.resultTitle}>
                    {content[language].invalidLeafTitle}
                  </Text>

                  <Text
                    style={{
                      textAlign: "center",
                      color: "#64748B",
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                  >
                    {content[language].invalidLeafSubtitle}
                  </Text>

                  <View
                    style={{
                      width: "100%",
                      marginTop: 16,
                      backgroundColor: "#FFFBEB",
                      borderRadius: 14,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: "#FDE68A",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        marginBottom: 10,
                        color: "#92400E",
                      }}
                    >
                      {content[language].invalidSuggestionsTitle}
                    </Text>

                    {content[language].invalidSuggestions.map(
                      (tip: string, index: number) => (
                        <Text
                          key={index}
                          style={{ color: "#92400E", marginBottom: 6 }}
                        >
                          • {tip}
                        </Text>
                      ),
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.resetButton, { marginTop: 20 }]}
                    onPress={resetScreen}
                  >
                    <RefreshCw color="#059669" size={18} />
                    <Text style={styles.resetButtonText}>
                      {content[language].tryAgain}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Results Section */}
          {result &&
            result.predictions.length > 0 &&
            !isHealthyPrediction &&
            !isInvalidPrediction && (
              <Animated.View
                style={[
                  styles.resultSection,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.resultCard}>
                  {/* Result Header (CENTER + SINGLE LANGUAGE) */}
                  <View style={[styles.resultHeader, { alignItems: "center" }]}>
                    {primaryPrediction && (
                      <>
                        {/* Title + Mic */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            width: "100%",
                          }}
                        >
                          <Text
                            style={[
                              styles.resultTitle,
                              { textAlign: "center" },
                            ]}
                          >
                            {language === "si"
                              ? getDiseaseNameSi(primaryPrediction.class_name)
                              : language === "ta"
                                ? getDiseaseNameTa(primaryPrediction.class_name)
                                : diseaseName}{" "}
                            {content[language].resultTitle}
                          </Text>
                        </View>
                        {/* 🔊 Audio Control Button */}
                        {!isSpeaking ? (
                          // ▶️ LISTEN
                          <TouchableOpacity
                            style={{
                              marginTop: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              paddingHorizontal: 18,
                              paddingVertical: 10,
                              borderRadius: 20,
                              backgroundColor: "#ECFDF5",
                              borderWidth: 1,
                              borderColor: "#10B981",
                            }}
                            onPress={() => {
                              setIsSpeaking(true);
                              speakDisease(primaryPrediction.class_name);
                            }}
                            activeOpacity={0.8}
                          >
                            <Volume2 size={18} color="#059669" />
                            <Text
                              style={{
                                color: "#047857",
                                fontWeight: "700",
                                fontSize: 14,
                              }}
                            >
                              {language === "si"
                                ? "ශබ්දයෙන් අසන්න"
                                : language === "ta"
                                  ? "கேள்"
                                  : "Listen"}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          // ⏹ STOP (INLINE – uses existing logic)
                          <TouchableOpacity
                            style={{
                              marginTop: 12,
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              paddingHorizontal: 18,
                              paddingVertical: 10,
                              borderRadius: 20,
                              backgroundColor: "#FEE2E2",
                              borderWidth: 1,
                              borderColor: "#DC2626",
                            }}
                            onPress={async () => {
                              // 🔴 SAME stop logic you already have
                              Speech.stop();

                              if (soundRef.current) {
                                try {
                                  await soundRef.current.stopAsync();
                                  await soundRef.current.unloadAsync();
                                } catch {}
                                soundRef.current = null;
                              }

                              setIsSpeaking(false);
                            }}
                            activeOpacity={0.8}
                          >
                            <X size={18} color="#DC2626" />
                            <Text
                              style={{
                                color: "#991B1B",
                                fontWeight: "700",
                                fontSize: 14,
                              }}
                            >
                              {language === "si"
                                ? "ශබ්දය නවත්වන්න"
                                : language === "ta"
                                  ? "நிறுத்து"
                                  : "Stop"}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Disease detected line (same language only) */}
                        <Text
                          style={[
                            styles.resultSubtitle,
                            { textAlign: "center", marginTop: 8 },
                          ]}
                        ></Text>

                        {/* Confidence line (same language only) */}
                        <Text
                          style={[
                            styles.resultSubtitle,
                            {
                              textAlign: "center",
                              marginTop: 8,
                              color: "#64748B",
                            },
                          ]}
                        >
                          {content[language].confidence}:{" "}
                          {getConfidenceLevel(primaryPrediction.confidence)} (
                          {confidencePct}%)
                        </Text>

                        {/* Severity badge (center) */}
                        <View
                          style={{
                            marginTop: 14,
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <View
                            style={[
                              styles.severityBadge,
                              {
                                backgroundColor: getSeverityColor(
                                  result.severity_label,
                                ),
                                alignSelf: "center",
                              },
                            ]}
                          >
                            <Shield color="#FFFFFF" size={16} />
                            <Text style={styles.severityText}>
                              {content[language].severity}:{" "}
                              {language === "si"
                                ? result.severity_label
                                    .toLowerCase()
                                    .includes("high")
                                  ? content.si.high
                                  : result.severity_label
                                        .toLowerCase()
                                        .includes("medium")
                                    ? content.si.medium
                                    : content.si.low
                                : language === "ta"
                                  ? result.severity_label
                                      .toLowerCase()
                                      .includes("high")
                                    ? content.ta.high
                                    : result.severity_label
                                          .toLowerCase()
                                          .includes("medium")
                                      ? content.ta.medium
                                      : content.ta.low
                                  : result.severity_label}
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.resultActions}>
                    {result?.predictions?.some((p) => p.confidence >= 0.4) && (
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() =>
                          navigation.navigate("SeverityDetails", {
                            image: imageUri,
                            severity_score: result.severity_score,
                            severity_label: result.severity_label,
                            predictions: result.predictions,

                            diseaseNameEn: diseaseName,
                            diseaseNameSi: primaryPrediction
                              ? getDiseaseNameSi(primaryPrediction.class_name)
                              : diseaseName,
                            diseaseNameTa: primaryPrediction
                              ? getDiseaseNameTa(primaryPrediction.class_name)
                              : diseaseName,
                          })
                        }
                      >
                        <Text style={styles.detailsButtonText}>
                          {content[language].viewDetails}
                        </Text>
                        <ChevronRight color="#FFFFFF" size={18} />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={resetScreen}
                    >
                      <RefreshCw color="#059669" size={18} />
                      <Text style={styles.resetButtonText}>
                        {content[language].newDetection}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}

          {/* No Diseases Found */}
          {result &&
            (result.predictions.length === 0 || isHealthyPrediction) && (
              <View style={styles.healthyCard}>
                <View style={styles.healthyIconContainer}>
                  <CheckCircle color="#059669" size={40} />
                </View>
                <Text style={styles.healthyTitle}>
                  {content[language].healthy}!
                </Text>
                <Text style={styles.healthySubtitle}>
                  {language === "si"
                    ? "ඔබේ කොළය සෞඛ්‍ය සම්පන්න තත්ත්වයේ පවතී"
                    : language === "ta"
                      ? "உங்கள் இலை ஆரோக்கியமான நிலையில் இருப்பதாக தெரிகிறது"
                      : "Your leaf appears to be in healthy condition"}
                </Text>
                <TouchableOpacity
                  style={styles.healthyButton}
                  onPress={resetScreen}
                >
                  <Text style={styles.healthyButtonText}>
                    {content[language].tryAgain}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    fontWeight: "500",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  langText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
    width: "100%",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  heroIconContainer: {
    position: "relative",
    marginBottom: 20,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  heroIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#047857",
    justifyContent: "center",
    alignItems: "center",
  },
  heroIconRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
    top: -10,
    left: -10,
  },
  sparkleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle1: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  sparkle2: {
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "500",
  },
  homeInfoSection: {
    paddingHorizontal: 20,
    marginTop: 26,
    marginBottom: 6,
  },
  homeInfoDescription: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  homeStatsRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  homeStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  homeStatIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  homeStatText: {
    fontSize: 11,
    color: "#1F2937",
    fontWeight: "700",
    textAlign: "center",
  },
  imageSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  imageCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imagePreview: {
    width: "100%",
    height: 280,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: 16,
  },
  removeButton: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageLabel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 6,
  },
  imageLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  actionCards: {
    gap: 16,
  },
  primaryHomeAction: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryHomeAction: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    backgroundColor: "#FFFFFF",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  homeActionIconPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  homeActionIconSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  homeActionContent: {
    flex: 1,
    marginLeft: 12,
  },
  homeCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
  },
  homeCardDesc: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  homeActionArrowPrimary: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  homeActionArrowSecondary: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  chooseMethodBanner: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  chooseMethodText: {
    color: "#047857",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  officerCard: {
    backgroundColor: "#0F766E",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  officerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  officerContent: {
    flex: 1,
    marginLeft: 10,
  },
  officerTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  officerDesc: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  officerArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionCard: {
    borderRadius: 20,
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  actionCardPrimary: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  actionCardSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  actionIconSecondary: {
    backgroundColor: "#F0FDF4",
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  actionCardTitleSecondary: {
    color: "#1E293B",
  },
  actionCardDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
    marginBottom: 20,
  },
  actionCardDescriptionSecondary: {
    color: "#64748B",
  },
  actionArrow: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionArrowSecondary: {
    backgroundColor: "#F0FDF4",
  },
  detectSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  detectButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    position: "relative",
    overflow: "hidden",
  },
  detectButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  detectButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detectButtonGlow: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  loadingSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadingTextContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#64748B",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  errorSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  resultSection: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
  },
  severityContainer: {
    marginBottom: 20,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  severityText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  predictionsList: {
    gap: 12,
    marginBottom: 20,
  },
  predictionCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  predictionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  diseaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  predictionDetails: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  confidenceLevel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  predictionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  speakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  confidenceContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  confidenceBar: {
    height: "100%",
    borderRadius: 4,
  },
  confidencePercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    minWidth: 45,
    textAlign: "right",
  },
  resultActions: {
    gap: 12,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  detailsButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#059669",
  },
  resetButtonText: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "600",
  },
  healthyCard: {
    backgroundColor: "#ECFDF5",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#A7F3D0",
  },
  healthyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#059669",
  },
  healthyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    textAlign: "center",
  },
  healthySubtitle: {
    fontSize: 16,
    color: "#047857",
    textAlign: "center",
    lineHeight: 24,
  },
  healthyButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  healthyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
  retryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default DiseaseIdentificationScreen;
