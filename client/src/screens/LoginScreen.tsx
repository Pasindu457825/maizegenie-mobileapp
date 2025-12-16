import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { useRoute } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";

// ✨ Type definition for language
type LanguageType = "si" | "en";

export default function LoginScreen({ navigation, route }: any) {
  const { signIn, loading } = useApp();

  const { language: lang } = useLanguage();
  const language: LanguageType = lang === "sinhala" ? "si" : "en";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // ✨ Translations
  const translations: Record<
    LanguageType,
    {
      welcomeTitle: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      loginButton: string;
      signingInButton: string;
      forgotPassword: string;
      appTitle: string;
      appSubtitle: string;
      empoweringText: string;
      madeWithText: string;
      missingFields: string;
      missingFieldsMessage: string;
      loginFailed: string;
      invalidCredentials: string;
    }
  > = {
    si: {
      welcomeTitle: "මගපෙන්වීමට පිවිසෙන්න! 👋",
      emailLabel: "📧 ඉමේල්",
      emailPlaceholder: "your.email@example.com",
      passwordLabel: "🔒 මුරපදය",
      passwordPlaceholder: "ඔබේ මුරපදය ඇතුළු කරන්න",
      loginButton: "🚀 පිවිසෙන්න",
      signingInButton: "🌱 පිවිසෙමින්...",
      forgotPassword: "මුරපදය අමතකද?",
      appTitle: "MaizeGenie",
      appSubtitle: "ඔබේ ස්මාර්ට් ගොවිදේවි සහකරු",
      empoweringText: "🌽 ශ්‍රී ලංකා ගොවිවරුන් ශක්තිමත් කිරීම",
      madeWithText: "Made with 💚 for our farming community",
      missingFields: "දත්ත අහිමිවී ඇත",
      missingFieldsMessage: "කරුණාකර ඉමේල් සහ මුරපදය ඇතුළු කරන්න.",
      loginFailed: "පිවිසීම අසාර්ථකයි",
      invalidCredentials: "අවලංගු ඉමේල් හෝ මුරපදය",
    },
    en: {
      welcomeTitle: "Welcome Back! 👋",
      emailLabel: "📧 Email",
      emailPlaceholder: "your.email@example.com",
      passwordLabel: "🔒 Password",
      passwordPlaceholder: "Enter your password",
      loginButton: "🚀 Login",
      signingInButton: "🌱 Signing in...",
      forgotPassword: "Forgot Password?",
      appTitle: "MaizeGenie",
      appSubtitle: "Your Smart Farming Companion",
      empoweringText: "🌽 Empowering Sri Lankan Farmers",
      madeWithText: "Made with 💚 for our farming community",
      missingFields: "Missing fields",
      missingFieldsMessage: "Please enter email & password.",
      loginFailed: "Login Failed",
      invalidCredentials: "Invalid email or password",
    },
  };

  const t = translations[language];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t.missingFields, t.missingFieldsMessage);
      return;
    }

    const ok = await signIn(email.trim(), password);
    if (ok) {
      navigation.replace("Main");
    } else {
      Alert.alert(t.loginFailed, t.invalidCredentials);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-gradient-to-b from-green-50 to-yellow-50">
          {/* Decorative Background Elements */}
          <View className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <Text className="text-9xl absolute top-10 -left-10 rotate-12">
              🌾
            </Text>
            <Text className="text-9xl absolute top-32 right-5 -rotate-12">
              🌽
            </Text>
            <Text className="text-7xl absolute bottom-40 left-8 rotate-45">
              🌾
            </Text>
            <Text className="text-8xl absolute bottom-20 right-12 -rotate-45">
              🌽
            </Text>
          </View>

          <Animated.View
            className="flex-1 px-6 justify-center"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* App Logo & Title */}
            <Animated.View
              className="items-center mb-8"
              style={{ transform: [{ scale: scaleAnim }] }}
            >
              <View className="bg-gradient-to-br from-green-400 to-yellow-400 rounded-full p-6 mb-4 shadow-lg">
                <Text className="text-6xl">🌾</Text>
              </View>
              <Text className="text-4xl font-bold text-green-800 mb-2">
                {t.appTitle}
              </Text>
              <Text className="text-base text-gray-600 text-center">
                {t.appSubtitle}
              </Text>
            </Animated.View>

            {/* Login Card */}
            <View className="bg-white rounded-3xl p-6 shadow-2xl">
              <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {t.welcomeTitle}
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  {t.emailLabel}
                </Text>
                <TextInput
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  className="border-2 border-gray-200 p-4 rounded-xl bg-gray-50 text-base"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              {/* Password Input with Show/Hide Toggle */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                  {t.passwordLabel}
                </Text>
                <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50">
                  <TextInput
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 p-4 text-base"
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  {/* Show/Hide Password Button */}
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="pr-4"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color="#059669" strokeWidth={2} />
                    ) : (
                      <Eye size={22} color="#059669" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                disabled={loading}
                onPress={handleLogin}
                activeOpacity={0.8}
                className={`py-4 rounded-xl shadow-lg ${
                  loading
                    ? "bg-gray-400"
                    : "bg-gradient-to-r from-green-600 to-green-700"
                }`}
                style={{
                  shadowColor: "#059669",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  minHeight: 56,
                  justifyContent: "center",
                }}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {loading ? t.signingInButton : t.loginButton}
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity className="mt-4" disabled={loading}>
                <Text className="text-green-700 text-center text-sm font-semibold">
                  {t.forgotPassword}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Info */}
            <View className="mt-8 items-center pb-4">
              <Text className="text-gray-500 text-sm">{t.empoweringText}</Text>
              <Text className="text-gray-400 text-xs mt-1">
                {t.madeWithText}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
