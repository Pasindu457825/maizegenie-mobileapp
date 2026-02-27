import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

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

  const districts = [
    "Ampara", "Anuradhapura", "Badulla",
    "Monaragala", "Polonnaruwa", "Dambulla",
  ];

  const handleSignup = async () => {
    if (!email || !password || !fullName || !phone || !district) {
      Alert.alert(t.missingFields, t.missingFieldsMessage);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t.passwordMismatch, t.passwordMismatchMessage);
      return;
    }

    if (password.length < 6) {
      Alert.alert(t.weakPassword, t.weakPasswordMessage);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        email: email.trim(),
        password: password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        district: district,
        role: role,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("auth_token", response.data.token);
        Alert.alert(
          t.success,
          t.successMessage,
          [{ text: t.ok, onPress: () => navigation.replace("Login") }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail ||
        error.message ||
        "Failed to create account.";
      Alert.alert(t.signupFailed, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-green-700 mb-2 text-center">
          {t.title}
        </Text>
        <Text className="text-gray-600 mb-6 text-center">
          {t.subtitle}
        </Text>

        {/* Full Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.fullName}</Text>
        <TextInput
          placeholder={t.fullNamePlaceholder}
          value={fullName}
          onChangeText={setFullName}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          autoCapitalize="words"
        />

        {/* Email */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.email}</Text>
        <TextInput
          placeholder={t.emailPlaceholder}
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Phone */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.phone}</Text>
        <TextInput
          placeholder={t.phonePlaceholder}
          value={phone}
          onChangeText={setPhone}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          keyboardType="phone-pad"
        />

        {/* District */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.district}</Text>
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker
            selectedValue={district}
            onValueChange={setDistrict}
          >
            <Picker.Item label={t.selectDistrict} value="" />
            {districts.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>

        {/* Role */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.role}</Text>
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker
            selectedValue={role}
            onValueChange={setRole}
          >
            <Picker.Item label={t.farmer} value="farmer" />
            <Picker.Item label={t.officer} value="officer" />
          </Picker>
        </View>

        {/* Password */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.password}</Text>
        <TextInput
          placeholder={t.passwordPlaceholder}
          value={password}
          onChangeText={setPassword}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          secureTextEntry
        />

        {/* Confirm Password */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">{t.confirmPassword}</Text>
        <TextInput
          placeholder={t.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="border border-gray-300 p-3 rounded-lg mb-6"
          secureTextEntry
        />

        {/* Signup Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleSignup}
          className={`py-4 rounded-xl ${loading ? "bg-gray-400" : "bg-green-600"}`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              {t.createAccount}
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">{t.alreadyHaveAccount}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-green-600 font-bold">{t.login}</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login Info */}
        <View className="mt-8 p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 text-center text-sm">
            {t.socialLoginInfo}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
