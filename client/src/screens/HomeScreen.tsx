import React from "react";
import { View, Text } from "react-native";
import { useApp } from "../context/AppContext";

export default function HomeScreen() {
  const { user, signIn, signOut } = useApp();

  return (
    <View className="flex-1">
      <View className="w-full border-b border-zinc-200 bg-[var(--color-brand-bg)] px-5 py-3">
        <Text className="text-xl font-extrabold text-[var(--color-brand-dark)]">🌽 Home</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Text className="text-2xl font-extrabold">Welcome {user?.email ?? "Guest"}</Text>

        {user ? (
          <Text
            className="rounded-xl bg-red-500 px-4 py-3 font-bold text-white"
            onPress={signOut}
          >
            Sign Out
          </Text>
        ) : (
          <Text
            className="rounded-xl bg-brand px-4 py-3 font-bold text-white"
            onPress={() => signIn("demo@user.com", "1234")}
          >
            Quick Sign In
          </Text>
        )}
      </View>
    </View>
  );
}
