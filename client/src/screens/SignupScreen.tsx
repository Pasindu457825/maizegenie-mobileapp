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

export default function SignupScreen({ navigation }: any) {
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
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
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
          "Success!",
          "Account created successfully. Please login.",
          [{ text: "OK", onPress: () => navigation.replace("Login") }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          "Failed to create account.";
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-8">
        <Text className="text-3xl font-bold text-green-700 mb-2 text-center">
          Create Account
        </Text>
        <Text className="text-gray-600 mb-6 text-center">
          Join MaizeGenie
        </Text>

        {/* Full Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name *</Text>
        <TextInput
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          autoCapitalize="words"
        />

        {/* Email */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Email *</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Phone */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Phone *</Text>
        <TextInput
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          keyboardType="phone-pad"
        />

        {/* District */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">District *</Text>
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker
            selectedValue={district}
            onValueChange={setDistrict}
          >
            <Picker.Item label="Select your district" value="" />
            {districts.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>

        {/* Role */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Role *</Text>
        <View className="border border-gray-300 rounded-lg mb-4">
          <Picker
            selectedValue={role}
            onValueChange={setRole}
          >
            <Picker.Item label="Farmer" value="farmer" />
            <Picker.Item label="Agricultural Officer" value="officer" />
          </Picker>
        </View>

        {/* Password */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Password *</Text>
        <TextInput
          placeholder="Enter password (min 6 characters)"
          value={password}
          onChangeText={setPassword}
          className="border border-gray-300 p-3 rounded-lg mb-4"
          secureTextEntry
        />

        {/* Confirm Password */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Confirm Password *</Text>
        <TextInput
          placeholder="Confirm your password"
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
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-green-600 font-bold">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Social Login Info */}
        <View className="mt-8 p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 text-center text-sm">
            Google & Facebook signup coming soon!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
