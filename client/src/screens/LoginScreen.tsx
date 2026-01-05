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
  Dimensions,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useApp } from "../context/AppContext";
import { useRoute } from "@react-navigation/native";
import { useLanguage } from "../context/LanguageContext";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
  const [slideUpAnim] = useState(new Animated.Value(30));
  const [logoAnim] = useState(new Animated.Value(0));
  const [cornAnim1] = useState(new Animated.Value(-20));
  const [cornAnim2] = useState(new Animated.Value(-20));

  // ✨ Translations
  const translations: Record<
    LanguageType,
    {
      welcomeTitle: string;
      welcomeSubtitle: string;
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
      welcomeTitle: "ආයුබෝවන් 🌱",
      welcomeSubtitle: "ඔබේ ගොවිතැන් ගමන දිගටම කරගෙන යන්න",
      emailLabel: "ඉමේල් ලිපිනය",
      emailPlaceholder: "your.email@example.com",
      passwordLabel: "මුරපදය",
      passwordPlaceholder: "ඔබේ මුරපදය ඇතුළු කරන්න",
      loginButton: "පිවිසෙන්න",
      signingInButton: "පිවිසෙමින්...",
      forgotPassword: "මුරපදය අමතකද?",
      appTitle: "MaizeGenie",
      appSubtitle: "ඔබේ ස්මාර්ට් ගොවිදේවි සහකරු",
      empoweringText: "ශ්‍රී ලංකා ඉරිඟු ගොවීන් සඳහා",
      madeWithText: "Made with 💚 for our farming community",
      missingFields: "දත්ත අහිමිවී ඇත",
      missingFieldsMessage: "කරුණාකර ඉමේල් සහ මුරපදය ඇතුළු කරන්න.",
      loginFailed: "පිවිසීම අසාර්ථකයි",
      invalidCredentials: "අවලංගු ඉමේල් හෝ මුරපදය",
    },
    en: {
      welcomeTitle: "Welcome Back 🌱",
      welcomeSubtitle: "Continue your farming journey",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      loginButton: "Sign In",
      signingInButton: "Signing in...",
      forgotPassword: "Forgot Password?",
      appTitle: "MaizeGenie",
      appSubtitle: "Your Smart Farming Companion",
      empoweringText: "for Sri Lankan Corn Farmers",
      madeWithText: "Made with 💚 for our farming community",
      missingFields: "Missing fields",
      missingFieldsMessage: "Please enter email & password.",
      loginFailed: "Login Failed",
      invalidCredentials: "Invalid email or password",
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Quick animations - all start together
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
    <View style={{ flex: 1, backgroundColor: '#0A8754' }}>
      {/* Top curved background with gradient */}
      <View style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: height * 0.45,
        backgroundColor: '#0A8754',
      }}>
        {/* Decorative corn elements */}
        <Animated.View style={{
          position: 'absolute',
          top: 40,
          left: 20,
          opacity: logoAnim,
          transform: [{ translateY: cornAnim1 }]
        }}>
          <Text style={{ fontSize: 48, opacity: 0.2 }}>🌽</Text>
        </Animated.View>
        
        <Animated.View style={{
          position: 'absolute',
          top: 80,
          right: 30,
          opacity: logoAnim,
          transform: [{ translateY: cornAnim2 }]
        }}>
          <Text style={{ fontSize: 60, opacity: 0.2 }}>🌽</Text>
        </Animated.View>

        {/* Logo and Brand */}
        <Animated.View style={{
          alignItems: 'center',
          marginTop: height * 0.08,
          opacity: logoAnim,
        }}>
          {/* Logo circle */}
          <View style={{
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            borderWidth: 3,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}>
            <Text style={{ fontSize: 50 }}>🌽</Text>
          </View>

          {/* App Name */}
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            color: '#FFFFFF',
            letterSpacing: 0.5,
            textShadowColor: 'rgba(0, 0, 0, 0.1)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            {t.appTitle}
          </Text>

          {/* Subtitle */}
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: 4,
            letterSpacing: 1,
          }}>
            {t.empoweringText}
          </Text>
        </Animated.View>
      </View>

      {/* Main Login Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{
            marginTop: height * 0.38,
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 40,
              paddingBottom: 40,
              minHeight: height * 0.62,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}>
              {/* Welcome Text */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: 6,
                }}>
                  {t.welcomeTitle}
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: '#6B7280',
                  lineHeight: 22,
                }}>
                  {t.welcomeSubtitle}
                </Text>
              </View>

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                  marginLeft: 4,
                }}>
                  {t.emailLabel}
                </Text>
                <View style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                }}>
                  <TextInput
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChangeText={setEmail}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: 8,
                  marginLeft: 4,
                }}>
                  {t.passwordLabel}
                </Text>
                <View style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <TextInput
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChangeText={setPassword}
                    style={{
                      flex: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ paddingRight: 16 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color="#0A8754" strokeWidth={2.5} />
                    ) : (
                      <Eye size={22} color="#0A8754" strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={{ alignSelf: 'flex-end', marginBottom: 24 }}
                disabled={loading}
              >
                <Text style={{
                  fontSize: 14,
                  color: '#0A8754',
                  fontWeight: '600',
                }}>
                  {t.forgotPassword}
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                disabled={loading}
                onPress={handleLogin}
                activeOpacity={0.85}
                style={{
                  backgroundColor: loading ? '#9CA3AF' : '#0A8754',
                  paddingVertical: 18,
                  borderRadius: 14,
                  shadowColor: '#0A8754',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: loading ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: loading ? 0 : 6,
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 17,
                  letterSpacing: 0.5,
                }}>
                  {loading ? t.signingInButton : t.loginButton}
                </Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={{
                marginTop: 32,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#9CA3AF',
                  textAlign: 'center',
                }}>
                  {t.madeWithText}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}