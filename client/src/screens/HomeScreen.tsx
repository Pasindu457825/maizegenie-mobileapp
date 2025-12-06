import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useApp } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const { user } = useApp();
  const navigation = useNavigation<any>();

  const features = [
    {
      icon: "trending-up",
      title: "Price Forecast",
      description: "Get accurate price predictions",
      color: "#3b82f6",
    },
    {
      icon: "bug",
      title: "Pest Identifier",
      description: "Identify pests instantly",
      color: "#ef4444",
    },
    {
      icon: "medical",
      title: "Disease Identifier",
      description: "Diagnose crop diseases",
      color: "#f59e0b",
    },
    {
      icon: "leaf",
      title: "Fertilizer Advisor",
      description: "Get fertilizer recommendations",
      color: "#22c55e",
    },
    {
      icon: "analytics",
      title: "Yield Prediction",
      description: "Predict your crop yield",
      color: "#8b5cf6",
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="w-full border-b border-gray-200 bg-white px-5 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-extrabold text-green-700">
              🌾 MaizeGenie
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Your farming companion
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="bg-gradient-to-r from-green-500 to-green-600 p-6 m-4 rounded-2xl shadow-lg">
          <Text className="text-white text-2xl font-bold mb-2">
            Welcome Back! 👋
          </Text>

          <Text className="text-white text-base opacity-90">
            {user?.full_name || user?.email || "Guest User"}
          </Text>

          {!user && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              className="bg-white mt-4 px-5 py-3 rounded-xl"
            >
              <Text className="text-green-600 font-bold text-center">
                Quick Sign In
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View className="px-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Quick Stats
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-3xl font-bold text-green-600">24</Text>
              <Text className="text-gray-600 text-sm mt-1">Crops Tracked</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm">
              <Text className="text-3xl font-bold text-blue-600">12</Text>
              <Text className="text-gray-600 text-sm mt-1">
                Price Forecasts
              </Text>
            </View>
          </View>
        </View>

        {/* Features Grid */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Features</Text>
          <View className="gap-3">
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm flex-row items-center"
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: feature.color + "20" }}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={feature.color}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {feature.description}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Today&apos;s Tip 💡
          </Text>
          <View className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <Text className="text-amber-900 font-semibold mb-2">
              Monitor your crops regularly
            </Text>
            <Text className="text-amber-800 text-sm">
              Early detection of pests and diseases can save your harvest. Check
              your plants daily for any signs of trouble.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
