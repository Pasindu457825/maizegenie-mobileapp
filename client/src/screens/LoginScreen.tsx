import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useApp } from "../context/AppContext";

export default function LoginScreen({ navigation }: any) {
  const { signIn, loading } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    <View className="flex-1 px-6 justify-center bg-white">
      <Text className="text-3xl font-bold text-green-700 mb-6 text-center">
        Login
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        className="border p-3 rounded-lg mb-4"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        className="border p-3 rounded-lg mb-6"
        secureTextEntry
      />

      <TouchableOpacity
        disabled={loading}
        onPress={handleLogin}
        className={`py-4 rounded-xl ${
          loading ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        <Text className="text-white text-center font-bold text-lg">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
