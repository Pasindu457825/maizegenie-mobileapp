import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE, ROUTES } from "../constants";
import { Eye, EyeOff } from "lucide-react-native";

const { height } = Dimensions.get("window");
const INPUT_HEIGHT = 54;
const PLACEHOLDER_COLOR = "#9CA3AF";
const INPUT_TEXT_COLOR = "#1F2937";

const translations = {
  sinhala: {
    title: "ගිණුමක් සාදන්න",
    subtitle: "MaizeGenie වෙත එක්වන්න",
    fullName: "සම්පූර්ණ නම *",
    fullNamePlaceholder: "ඔබේ සම්පූර්ණ නම ඇතුළත් කරන්න",
    email: "ඊමේල් *",
    emailPlaceholder: "ඔබේ ඊමේල් ඇතුළත් කරන්න",
    phone: "දුරකථන අංකය *",
    phonePlaceholder: "ඔබේ දුරකථන අංකය ඇතුළත් කරන්න",
    district: "දිස්ත්‍රික්කය *",
    selectDistrict: "ඔබේ දිස්ත්‍රික්කය තෝරන්න",
    role: "භූමිකාව *",
    farmer: "ගොවියා",
    officer: "කෘෂිකර්ම නිලධාරී",
    password: "මුරපදය *",
    passwordPlaceholder: "මුරපදය ඇතුළත් කරන්න (අවම 6 අකුරු)",
    confirmPassword: "මුරපදය තහවුරු කරන්න *",
    confirmPasswordPlaceholder: "ඔබේ මුරපදය තහවුරු කරන්න",
    createAccount: "ගිණුම සාදන්න",
    alreadyHaveAccount: "දැනටමත් ගිණුමක් තිබේද? ",
    login: "ඇතුල් වන්න",
    socialLoginInfo: "Google & Facebook ඇතුළත්වීම ඉක්මනින්!",
    missingFields: "අන්‍යොන්‍ය ක්ෂේත්‍ර",
    missingFieldsMessage: "කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර පුරවන්න.",
    passwordMismatch: "මුරපද නොගැළපේ",
    passwordMismatchMessage: "මුරපද ගැළපෙන්නේ නැත.",
    weakPassword: "දුර්වල මුරපදය",
    weakPasswordMessage: "මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුය.",
    invalidName: "අවලංගු නම",
    invalidNameMessage: "කරුණාකර අක්ෂර 3කට වඩා දිග සම්පූර්ණ නමක් ඇතුළත් කරන්න.",
    invalidEmail: "අවලංගු ඊමේල්",
    invalidEmailMessage: "කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.",
    invalidPhone: "අවලංගු දුරකථන අංකය",
    invalidPhoneMessage: "කරුණාකර වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.",
    invalidDistrict: "දිස්ත්‍රික්කය තෝරන්න",
    invalidDistrictMessage: "කරුණාකර වලංගු දිස්ත්‍රික්කයක් තෝරන්න.",
    invalidRole: "අවලංගු භූමිකාව",
    invalidRoleMessage: "කරුණාකර වලංගු භූමිකාවක් තෝරන්න.",
    weakPasswordRuleMessage: "මුරපදයේ අවම වශයෙන් අකුරක් සහ ඉලක්කමක් තිබිය යුතුය.",
    success: "සාර්ථකයි!",
    successMessage: "ගිණුම සාර්ථකව සාදන ලදී. කරුණාකර ඇතුල් වන්න.",
    signupFailed: "ලියාපදිංචිය අසාර්ථකයි",
    ok: "හරි",
  },
  english: {
    title: "Create Account",
    subtitle: "Join MaizeGenie",
    fullName: "Full Name *",
    fullNamePlaceholder: "Enter your full name",
    email: "Email *",
    emailPlaceholder: "Enter your email",
    phone: "Phone *",
    phonePlaceholder: "Enter your phone number",
    district: "District *",
    selectDistrict: "Select your district",
    role: "Role *",
    farmer: "Farmer",
    officer: "Agricultural Officer",
    password: "Password *",
    passwordPlaceholder: "Enter password (min 6 characters)",
    confirmPassword: "Confirm Password *",
    confirmPasswordPlaceholder: "Confirm your password",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account? ",
    login: "Login",
    socialLoginInfo: "Google & Facebook signup coming soon!",
    missingFields: "Missing Fields",
    missingFieldsMessage: "Please fill in all required fields.",
    passwordMismatch: "Password Mismatch",
    passwordMismatchMessage: "Passwords do not match.",
    weakPassword: "Weak Password",
    weakPasswordMessage: "Password must be at least 6 characters.",
    invalidName: "Invalid Name",
    invalidNameMessage: "Please enter a full name with at least 3 characters.",
    invalidEmail: "Invalid Email",
    invalidEmailMessage: "Please enter a valid email address.",
    invalidPhone: "Invalid Phone Number",
    invalidPhoneMessage: "Please enter a valid phone number.",
    invalidDistrict: "Invalid District",
    invalidDistrictMessage: "Please select a valid district.",
    invalidRole: "Invalid Role",
    invalidRoleMessage: "Please select a valid role.",
    weakPasswordRuleMessage: "Password must include at least one letter and one number.",
    success: "Success!",
    successMessage: "Account created successfully. Please login.",
    signupFailed: "Signup Failed",
    ok: "OK",
  },
  tamil: {
    title: "கணக்கை உருவாக்குக",
    subtitle: "MaizeGenie இல் இணையுங்கள்",
    fullName: "முழு பெயர் *",
    fullNamePlaceholder: "உங்கள் முழு பெயரை உள்ளிடுக",
    email: "மின்னஞ்சல் *",
    emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடுக",
    phone: "தொலைபேசி *",
    phonePlaceholder: "உங்கள் தொலைபேசி எண்ணை உள்ளிடுக",
    district: "மாவட்டம் *",
    selectDistrict: "உங்கள் மாவட்டத்தை தேர்வு செய்க",
    role: "பங்கு *",
    farmer: "விவசாயி",
    officer: "விவசாய அதிகாரி",
    password: "கடவுச்சொல் *",
    passwordPlaceholder: "கடவுச்சொல்லை உள்ளிடுக (குறைந்தபட்சம் 6 எழுத்துக்கள்)",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்துக *",
    confirmPasswordPlaceholder: "உங்கள் கடவுச்சொல்லை உறுதிப்படுத்துக",
    createAccount: "கணக்கை உருவாக்குக",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா? ",
    login: "உள்நுழைக",
    socialLoginInfo: "Google & Facebook பதிவு விரைவில்!",
    missingFields: "தவறான தகவல்கள்",
    missingFieldsMessage: "தயவுசெய்து அனைத்து தேவையான புலங்களையும் நிரப்புக.",
    passwordMismatch: "கடவுச்சொல் பொருத்தமில்லை",
    passwordMismatchMessage: "கடவுச்சொற்கள் பொருந்தவில்லை.",
    weakPassword: "பலவீனமான கடவுச்சொல்",
    weakPasswordMessage: "கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துக்கள் இருக்க வேண்டும்.",
    invalidName: "தவறான பெயர்",
    invalidNameMessage: "குறைந்தது 3 எழுத்துகளுடன் முழுப் பெயரை உள்ளிடவும்.",
    invalidEmail: "தவறான மின்னஞ்சல்",
    invalidEmailMessage: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
    invalidPhone: "தவறான தொலைபேசி எண்",
    invalidPhoneMessage: "சரியான தொலைபேசி எண்ணை உள்ளிடவும்.",
    invalidDistrict: "தவறான மாவட்டம்",
    invalidDistrictMessage: "சரியான மாவட்டத்தை தேர்வு செய்யவும்.",
    invalidRole: "தவறான பங்கு",
    invalidRoleMessage: "சரியான பங்கினை தேர்வு செய்யவும்.",
    weakPasswordRuleMessage: "கடவுச்சொல்லில் குறைந்தது ஒரு எழுத்தும் ஒரு எண்ணும் இருக்க வேண்டும்.",
    success: "வெற்றி!",
    successMessage: "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது. உள்நுழையவும்.",
    signupFailed: "பதிவு தோல்வி",
    ok: "சரி",
  },
};

export default function SignupScreen({ navigation }: any) {
  const { language } = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideUpAnim] = useState(new Animated.Value(30));
  const [logoAnim] = useState(new Animated.Value(0));
  const [cornAnim1] = useState(new Animated.Value(-20));
  const [cornAnim2] = useState(new Animated.Value(-20));
  const [fieldErrors, setFieldErrors] = useState<{
    fullName: string;
    email: string;
    phone: string;
    district: string;
    role: string;
    password: string;
    confirmPassword: string;
  }>({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<{
    fullName: boolean;
    email: boolean;
    phone: boolean;
    district: boolean;
    role: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    fullName: false,
    email: false,
    phone: false,
    district: false,
    role: false,
    password: false,
    confirmPassword: false,
  });

  const districts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const validRoles = ["farmer", "officer"];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(cornAnim1, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cornAnim2, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateField = (
    field:
      | "fullName"
      | "email"
      | "phone"
      | "district"
      | "role"
      | "password"
      | "confirmPassword"
  ) => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/\s+/g, "");
    const phoneDigits = normalizedPhone.replace(/\D/g, "");
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (field === "fullName") {
      if (!trimmedName) return t.missingFieldsMessage;
      if (trimmedName.length < 3) return t.invalidNameMessage;
      return "";
    }

    if (field === "email") {
      if (!trimmedEmail) return t.missingFieldsMessage;
      if (!emailRegex.test(trimmedEmail)) return t.invalidEmailMessage;
      return "";
    }

    if (field === "phone") {
      if (!normalizedPhone) return t.missingFieldsMessage;
      if (phoneDigits.length < 9 || phoneDigits.length > 12) return t.invalidPhoneMessage;
      return "";
    }

    if (field === "district") {
      if (!district) return t.missingFieldsMessage;
      if (!districts.includes(district)) return t.invalidDistrictMessage;
      return "";
    }

    if (field === "role") {
      if (!role) return t.missingFieldsMessage;
      if (!validRoles.includes(role)) return t.invalidRoleMessage;
      return "";
    }

    if (field === "password") {
      if (!password) return t.missingFieldsMessage;
      if (password.length < 6) return t.weakPasswordMessage;
      if (!hasLetter || !hasNumber) return t.weakPasswordRuleMessage;
      return "";
    }

    if (field === "confirmPassword") {
      if (!confirmPassword) return t.missingFieldsMessage;
      if (password !== confirmPassword) return t.passwordMismatchMessage;
      return "";
    }

    return "";
  };

  const setFieldError = (
    field:
      | "fullName"
      | "email"
      | "phone"
      | "district"
      | "role"
      | "password"
      | "confirmPassword"
  ) => {
    const message = validateField(field);
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    return message;
  };

  const validateAllFields = () => {
    const nextErrors = {
      fullName: validateField("fullName"),
      email: validateField("email"),
      phone: validateField("phone"),
      district: validateField("district"),
      role: validateField("role"),
      password: validateField("password"),
      confirmPassword: validateField("confirmPassword"),
    };
    setFieldErrors(nextErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      district: true,
      role: true,
      password: true,
      confirmPassword: true,
    });
    return Object.values(nextErrors).every((msg) => !msg);
  };

  const handleSignup = async () => {
    if (!validateAllFields()) {
      setErrorText(t.missingFieldsMessage);
      return;
    }

    try {
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const normalizedPhone = phone.replace(/\s+/g, "");
      setErrorText("");
      setLoading(true);
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        email: trimmedEmail,
        password: password,
        full_name: trimmedName,
        phone: normalizedPhone,
        district: district,
        role: role,
      }, { timeout: 12000 });

      if (response.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.token);
      }

      navigation.replace(ROUTES.AUTH.LOGIN);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        (error.code === "ECONNABORTED"
          ? `Request timeout. Cannot reach server: ${API_BASE}`
          : `Cannot connect to server: ${API_BASE}`) ||
        error.message ||
        "Failed to create account.";
      setErrorText(errorMessage);
      Alert.alert(t.signupFailed, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A8754" }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.45,
          backgroundColor: "#0A8754",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 40,
            left: 20,
            opacity: logoAnim,
            transform: [{ translateY: cornAnim1 }],
          }}
        >
          <Text style={{ fontSize: 48, opacity: 0.2 }}>🌽</Text>
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            top: 80,
            right: 30,
            opacity: logoAnim,
            transform: [{ translateY: cornAnim2 }],
          }}
        >
          <Text style={{ fontSize: 60, opacity: 0.2 }}>🌽</Text>
        </Animated.View>

        <Animated.View
          style={{
            alignItems: "center",
            marginTop: height * 0.08,
            opacity: logoAnim,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 3,
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Text style={{ fontSize: 50 }}>🌽</Text>
          </View>
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: 0.5,
            }}
          >
            MaizeGenie
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.9)",
              marginTop: 4,
              letterSpacing: 0.8,
            }}
          >
            for Sri Lankan Corn Farmers
          </Text>
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              marginTop: height * 0.30,
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                paddingHorizontal: 24,
                paddingTop: 30,
                paddingBottom: 30,
                minHeight: height * 0.70,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 28, fontWeight: "700", color: "#1F2937", marginBottom: 6 }}>
                  {t.title}
                </Text>
                <Text style={{ fontSize: 15, color: "#6B7280", lineHeight: 22 }}>{t.subtitle}</Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E5E7EB",
                    marginTop: 14,
                    marginHorizontal: 2,
                  }}
                />
              </View>

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.fullName}
              </Text>
              <TextInput
                placeholder={t.fullNamePlaceholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  if (touched.fullName) setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, fullName: true }));
                  setFieldError("fullName");
                }}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.fullName && fieldErrors.fullName ? "#ef4444" : "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: INPUT_TEXT_COLOR,
                  marginBottom: touched.fullName && fieldErrors.fullName ? 0 : 12,
                }}
              />
              {!!(touched.fullName && fieldErrors.fullName) && (
                <Text style={{ color: "#DC2626", marginTop: 4, marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.fullName}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.email}
              </Text>
              <TextInput
                placeholder={t.emailPlaceholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (touched.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, email: true }));
                  setFieldError("email");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.email && fieldErrors.email ? "#ef4444" : "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: INPUT_TEXT_COLOR,
                  marginBottom: touched.email && fieldErrors.email ? 0 : 12,
                }}
              />
              {!!(touched.email && fieldErrors.email) && (
                <Text style={{ color: "#DC2626", marginTop: 4, marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.email}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.phone}
              </Text>
              <TextInput
                placeholder={t.phonePlaceholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  if (touched.phone) setFieldErrors((prev) => ({ ...prev, phone: "" }));
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }));
                  setFieldError("phone");
                }}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.phone && fieldErrors.phone ? "#ef4444" : "#E5E7EB",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: INPUT_TEXT_COLOR,
                  marginBottom: touched.phone && fieldErrors.phone ? 0 : 12,
                }}
              />
              {!!(touched.phone && fieldErrors.phone) && (
                <Text style={{ color: "#DC2626", marginTop: 4, marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.phone}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.district}
              </Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.district && fieldErrors.district ? "#ef4444" : "#E5E7EB",
                  height: INPUT_HEIGHT,
                  justifyContent: "center",
                  marginBottom: touched.district && fieldErrors.district ? 6 : 12,
                }}
              >
                <Picker
                  selectedValue={district}
                  style={{
                    height: INPUT_HEIGHT,
                    color: district ? INPUT_TEXT_COLOR : PLACEHOLDER_COLOR,
                    marginTop: Platform.OS === "android" ? -2 : 0,
                  }}
                  dropdownIconColor="#111827"
                  onValueChange={(value) => {
                    setDistrict(value);
                    setTouched((prev) => ({ ...prev, district: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      district: !value ? t.missingFieldsMessage : districts.includes(value) ? "" : t.invalidDistrictMessage,
                    }));
                  }}
                >
                  <Picker.Item label={t.selectDistrict} value="" />
                  {districts.map((d) => (
                    <Picker.Item key={d} label={d} value={d} />
                  ))}
                </Picker>
              </View>
              {!!(touched.district && fieldErrors.district) && (
                <Text style={{ color: "#DC2626", marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.district}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.role}
              </Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.role && fieldErrors.role ? "#ef4444" : "#E5E7EB",
                  height: INPUT_HEIGHT,
                  justifyContent: "center",
                  marginBottom: touched.role && fieldErrors.role ? 6 : 12,
                }}
              >
                <Picker
                  selectedValue={role}
                  style={{
                    height: INPUT_HEIGHT,
                    color: INPUT_TEXT_COLOR,
                    marginTop: Platform.OS === "android" ? -2 : 0,
                  }}
                  dropdownIconColor="#111827"
                  onValueChange={(value) => {
                    setRole(value);
                    setTouched((prev) => ({ ...prev, role: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      role: !value ? t.missingFieldsMessage : validRoles.includes(value) ? "" : t.invalidRoleMessage,
                    }));
                  }}
                >
                  <Picker.Item label={t.farmer} value="farmer" />
                  <Picker.Item label={t.officer} value="officer" />
                </Picker>
              </View>
              {!!(touched.role && fieldErrors.role) && (
                <Text style={{ color: "#DC2626", marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.role}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.password}
              </Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.password && fieldErrors.password ? "#ef4444" : "#E5E7EB",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: touched.password && fieldErrors.password ? 0 : 12,
                }}
              >
                <TextInput
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (touched.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                    if (touched.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, password: true }));
                    setFieldError("password");
                  }}
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: INPUT_TEXT_COLOR,
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={{ paddingRight: 16 }}>
                  {showPassword ? (
                    <EyeOff size={20} color="#0A8754" />
                  ) : (
                    <Eye size={20} color="#0A8754" />
                  )}
                </TouchableOpacity>
              </View>
              {!!(touched.password && fieldErrors.password) && (
                <Text style={{ color: "#DC2626", marginTop: 4, marginBottom: 10, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.password}
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 4 }}>
                {t.confirmPassword}
              </Text>
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: touched.confirmPassword && fieldErrors.confirmPassword ? "#ef4444" : "#E5E7EB",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: touched.confirmPassword && fieldErrors.confirmPassword ? 0 : 12,
                }}
              >
                <TextInput
                  placeholder={t.confirmPasswordPlaceholder}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (touched.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, confirmPassword: true }));
                    setFieldError("confirmPassword");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: INPUT_TEXT_COLOR,
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} style={{ paddingRight: 16 }}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#0A8754" />
                  ) : (
                    <Eye size={20} color="#0A8754" />
                  )}
                </TouchableOpacity>
              </View>
              {!!(touched.confirmPassword && fieldErrors.confirmPassword) && (
                <Text style={{ color: "#DC2626", marginTop: 4, marginBottom: 14, marginLeft: 4, fontSize: 12 }}>
                  {fieldErrors.confirmPassword}
                </Text>
              )}

              <TouchableOpacity
                disabled={loading}
                onPress={() => void handleSignup()}
                activeOpacity={0.85}
                style={{
                  backgroundColor: loading ? "#9CA3AF" : "#0A8754",
                  paddingVertical: 18,
                  borderRadius: 14,
                  shadowColor: "#0A8754",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: loading ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: loading ? 0 : 6,
                  marginTop: 14,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "700", fontSize: 17 }}>
                    {t.createAccount}
                  </Text>
                )}
              </TouchableOpacity>

              {!!errorText && (
                <Text style={{ color: "#DC2626", marginTop: 10, textAlign: "center", fontSize: 12 }}>
                  {errorText}
                </Text>
              )}

              <View style={{ marginTop: 22, alignItems: "center" }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>{t.alreadyHaveAccount}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (navigation.canGoBack()) navigation.goBack();
                      else navigation.push(ROUTES.AUTH.LOGIN);
                    }}
                    disabled={loading}
                  >
                    <Text style={{ fontSize: 13, color: "#0A8754", fontWeight: "700" }}>{t.login}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 10 }}>
                  {t.socialLoginInfo}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
