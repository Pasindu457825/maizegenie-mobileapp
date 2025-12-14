import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { ArrowLeft, Bell } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";

// ✅ ROOT NAVIGATION TYPE
import type { RootStackParamList } from "../../navigation";

// 🔑 Typed navigation prop
type RootNavProp = StackNavigationProp<RootStackParamList, "Notifications">;

export default function NotificationsScreen() {
  const navigation = useNavigation<RootNavProp>();

  const {
    notifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { language } = useLanguage();
  const isSinhala = language === "sinhala";

  const renderItem = ({ item }: any) => {
    const handlePress = async () => {
      if (!item.read) {
        await markAsRead(item.id);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[
          styles.card,
          !item.read && styles.unreadCard,
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#047857" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isSinhala ? "දැනුම්දීම්" : "Notifications"}
        </Text>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.clearText}>
              {isSinhala ? "සියල්ල කියවූවා" : "Mark all read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTENT */}
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Bell size={32} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {isSinhala
              ? "දැනුම්දීම් නොමැත"
              : "No notifications available"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },
  clearText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  unreadCard: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#ECFDF5",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: "#6B7280",
  },
});
