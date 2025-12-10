import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useApp } from "../context/AppContext";

export default function LoginScreen({ navigation }: any) {
  const { signIn, loading } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

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
      Alert.alert("Missing fields", "Please enter email & password.");
      return;
    }

    const ok = await signIn(email.trim(), password);
    if (ok) navigation.replace("Main");
    else Alert.alert("Login Failed", "Invalid email or password");
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-green-50 to-yellow-50">
      {/* Decorative Background Elements */}
      <View className="absolute top-0 left-0 w-full h-full opacity-5">
        <Text className="text-9xl absolute top-10 -left-10 rotate-12">🌾</Text>
        <Text className="text-9xl absolute top-32 right-5 -rotate-12">🌽</Text>
        <Text className="text-7xl absolute bottom-40 left-8 rotate-45">🌾</Text>
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
          className="items-center mb-12"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          <View className="bg-gradient-to-br from-green-400 to-yellow-400 rounded-full p-6 mb-4 shadow-lg">
            <Text className="text-6xl">🌾</Text>
          </View>
          <Text className="text-4xl font-bold text-green-800 mb-2">
            MaizeGenie
          </Text>
          <Text className="text-base text-gray-600 text-center">
            Your Smart Farming Companion
          </Text>
        </Animated.View>

        {/* Login Card */}
        <View className="bg-white rounded-3xl p-6 shadow-2xl">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Welcome Back! 👋
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              📧 Email
            </Text>
            <TextInput
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              className="border-2 border-gray-200 p-4 rounded-xl bg-gray-50 text-base"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Input with Show/Hide Toggle */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
              🔒 Password
            </Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-xl bg-gray-50">
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                className="flex-1 p-4 text-base"
                secureTextEntry={!showPassword}
              />
              {/* Show/Hide Password Button */}
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="pr-4"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
            }}
          >
            <Text className="text-white text-center font-bold text-lg">
              {loading ? "🌱 Signing in..." : "🚀 Login"}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity className="mt-4">
            <Text className="text-green-700 text-center text-sm font-semibold">
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View className="mt-8 items-center">
          <Text className="text-gray-500 text-sm">
            🌽 Empowering Sri Lankan Farmers
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            Made with 💚 for our farming community
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
