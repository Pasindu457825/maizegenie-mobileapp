import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useApp } from "../context/AppContext";

export default function LoginScreen({ navigation }: any) {
  const { signIn, loading } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const ok = await signIn(email, password);
    if (ok) navigation.replace("Main");
    else Alert.alert("Login Failed", "Invalid credentials");
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
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        className="border p-3 rounded-lg mb-6"
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-green-600 py-4 rounded-xl"
      >
        <Text className="text-white text-center font-bold text-lg">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
