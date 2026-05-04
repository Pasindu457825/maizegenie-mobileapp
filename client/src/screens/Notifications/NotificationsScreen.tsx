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
import { ArrowLeft, Bell, Trash2, CheckCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useLanguage } from "../../context/LanguageContext";
import { useNotifications } from "../../context/NotificationContext";
import type { RootStackParamList } from "../../navigation";

// Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

type RootNavProp = StackNavigationProp<RootStackParamList, "Notifications">;

type Language = "si" | "en" | "ta";

interface Translations {
  [key: string]: {
    si: string;
    en: string;
    ta: string;
  };
}

const translations: Translations = {
  NEW: {
    si: "අලුත්",
    en: "NEW",
    ta: "புதியது",
  },
  READ: {
    si: "කියවා ඇත",
    en: "Read",
    ta: "படிக்கப்பட்டுவிட்டது",
  },
  DELETE_CONFIRM: {
    si: "මෙම දැනුම්දීම මකා දැමීමට ඔබට විශ්වාසද?",
    en: "Are you sure you want to delete this notification?",
    ta: "இந்த அறிவிப்பை நீக்க நீங்கள் உறுதியாக இருக்கிறீர்களா?",
  },
  DELETE_TITLE: {
    si: "දැනුම්දීම මකන්නද?",
    en: "Delete notification?",
    ta: "அறிவிப்பை நீக்கவா?",
  },
  CANCEL: {
    si: "නැහැ",
    en: "Cancel",
    ta: "ரத்து செய்",
  },
  DELETE: {
    si: "මකන්න",
    en: "Delete",
    ta: "நீக்கு",
  },
  NOTIFICATIONS: {
    si: "දැනුම්දීම්",
    en: "Notifications",
    ta: "அறிவிப்புகள்",
  },
  ALL: {
    si: "සියල්ල",
    en: "All",
    ta: "எல்லாம்",
  },
  NO_NOTIFICATIONS: {
    si: "දැනුම්දීම් නැත",
    en: "No Notifications",
    ta: "அறிவிப்புகள் இல்லை",
  },
  NO_NOTIFICATIONS_TEXT: {
    si: "ඔබට කිසිදු දැනුම්දීමක් නොමැත",
    en: "You don't have any notifications yet",
    ta: "உங்களுக்கு இன்னும் அறிவிப்புகள் எதுவும் இல்லை",
  },
};

export default function NotificationsScreen() {
  const navigation = useNavigation<RootNavProp>();
  const { language: globalLang } = useLanguage();
  const language: Language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  /* =======================
     CONFIRM DELETE (WEB + MOBILE)
  ======================= */
  const confirmDelete = (id: string) => {
    if (Platform.OS === "web") {
      const ok = window.confirm(translations.DELETE_CONFIRM[language]);
      if (ok) deleteNotification(id);
      return;
    }

    // Mobile
    import("react-native").then(({ Alert }) => {
      Alert.alert(
        translations.DELETE_TITLE[language],
        translations.DELETE_CONFIRM[language],
        [
          { text: translations.CANCEL[language], style: "cancel" },
          {
            text: translations.DELETE[language],
            style: "destructive",
            onPress: () => deleteNotification(id),
          },
        ],
      );
    });
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, !item.read && styles.unreadCard]}>
      {/* Unread indicator dot */}
      {!item.read && <View style={styles.unreadDot} />}

      <View style={styles.row}>
        {/* READ AREA */}
        <Pressable
          style={{ flex: 1 }}
          onPress={() => !item.read && markAsRead(item.id)}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {!item.read && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>
                  {translations.NEW[language]}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <View style={styles.footer}>
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            {item.read && (
              <View style={styles.readIndicator}>
                <CheckCheck size={14} color="#10B981" />
                <Text style={styles.readText}>
                  {translations.READ[language]}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* DELETE BUTTON */}
        <Pressable
          onPress={() => confirmDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Trash2 size={18} color="#EF4444" pointerEvents="none" />
        </Pressable>
      </View>
    </View>
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      {/* HEADER with gradient effect */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#047857" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {translations.NOTIFICATIONS[language]}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {notifications.some((n) => !n.read) ? (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={styles.markAllButton}
            >
              <CheckCheck size={16} color="#10B981" />
              <Text style={styles.clearText}>{translations.ALL[language]}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>
      </View>

      {/* CONTENT */}
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Bell size={48} color="#10B981" />
          </View>
          <Text style={styles.emptyTitle}>
            {translations.NO_NOTIFICATIONS[language]}
          </Text>
          <Text style={styles.emptyText}>
            {translations.NO_NOTIFICATIONS_TEXT[language]}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    padding: 4,
  },

  headerCenter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#065F46",
    letterSpacing: 0.3,
  },

  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  unreadBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10B981",
  },

  clearText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065F46",
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  unreadCard: {
    borderColor: "#10B981",
    borderWidth: 2,
    backgroundColor: "#F0FDF4",
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  unreadDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  deleteBtn: {
    padding: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    cursor: Platform.OS === "web" ? "pointer" : "auto",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#065F46",
    flex: 1,
    lineHeight: 20,
  },

  newBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  newBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  message: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  time: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  readIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  readText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
});
