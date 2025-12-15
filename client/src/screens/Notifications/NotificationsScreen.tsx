import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import { ArrowLeft, Bell, Trash2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import type { RootStackParamList } from "../../navigation";

type RootNavProp = StackNavigationProp<
  RootStackParamList,
  "Notifications"
>;

export default function NotificationsScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { language } = useLanguage();
  const isSinhala = language === "sinhala";

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  /* =======================
     CONFIRM DELETE (WEB + MOBILE)
  ======================= */
  const confirmDelete = (id: string) => {
    if (Platform.OS === "web") {
      const ok = window.confirm(
        isSinhala
          ? "මෙම දැනුම්දීම මකා දැමීමට ඔබට විශ්වාසද?"
          : "Are you sure you want to delete this notification?"
      );
      if (ok) deleteNotification(id);
      return;
    }

    // Mobile
    import("react-native").then(({ Alert }) => {
      Alert.alert(
        isSinhala ? "දැනුම්දීම මකන්නද?" : "Delete notification?",
        isSinhala
          ? "මෙය මකා දැමීමට ඔබට විශ්වාසද?"
          : "Are you sure you want to delete this notification?",
        [
          { text: isSinhala ? "නැහැ" : "Cancel", style: "cancel" },
          {
            text: isSinhala ? "මකන්න" : "Delete",
            style: "destructive",
            onPress: () => deleteNotification(id),
          },
        ]
      );
    });
  };

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.card,
        !item.read && styles.unreadCard,
      ]}
    >
      <View style={styles.row}>
        {/* READ AREA */}
        <Pressable
          style={{ flex: 1 }}
          onPress={() => !item.read && markAsRead(item.id)}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </Pressable>

        {/* DELETE BUTTON */}
        <Pressable
          onPressIn={() => confirmDelete(item.id)} // 👈 WEB SAFE
          style={styles.deleteBtn}
        >
          <Trash2
            size={18}
            color="#EF4444"
            pointerEvents="none"
          />
        </Pressable>
      </View>
    </View>
  );

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

        {notifications.some((n) => !n.read) ? (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.clearText}>
              {isSinhala ? "සියල්ල කියවූවා" : "Mark all read"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
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
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  deleteBtn: {
    padding: 6,
    cursor: Platform.OS === "web" ? "pointer" : "auto",
  },

  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065F46",
  },

  message: {
    fontSize: 13,
    color: "#374151",
    marginVertical: 4,
  },

  time: {
    fontSize: 11,
    color: "#6B7280",
  },
});
