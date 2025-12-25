import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  MessageSquare,
  MapPin,
  Clock,
  ChevronRight,
  User,
  Shield,
  CheckCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { getOfficerRooms } from "../../services/officerApi";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

// ✨ Language translations
const translations = {
  en: {
    title: "Farmer Chats",
    subtitle: "Assigned conversations",
    searchPlaceholder: "Search farmers...",
    activeChats: "Active Chats",
    recentChats: "Recent Chats",
    noChats: "No active chats assigned yet",
    noChatsDesc: "Farmers will appear here when they start conversations",
    district: "District",
    lastMessage: "Last message",
    minutesAgo: "min ago",
    hoursAgo: "hr ago",
    daysAgo: "d ago",
    justNow: "Just now",
    viewChat: "View Chat",
    farmer: "Farmer",
    status: {
      active: "Active",
      waiting: "Waiting",
      resolved: "Resolved",
    },
  },
  si: {
    title: "ගොවි සංවාද",
    subtitle: "නිලධාරියාට පවරා ඇති සංවාද",
    searchPlaceholder: "ගොවීන් සොයන්න...",
    activeChats: "සක්‍රිය සංවාද",
    recentChats: "මෑත සංවාද",
    noChats: "තවම කිසිදු සංවාදයක් පවරා නැත",
    noChatsDesc: "ගොවීන් සංවාද ආරම්භ කළ විට ඔවුන් මෙහි දිස්වනු ඇත",
    district: "දිස්ත්‍රික්කය",
    lastMessage: "අවසන් පණිවිඩය",
    minutesAgo: "මිනිත්තු පෙර",
    hoursAgo: "පැය පෙර",
    daysAgo: "දින පෙර",
    justNow: "මේ දැන්",
    viewChat: "සංවාදය බලන්න",
    farmer: "ගොවියා",
    status: {
      active: "සක්‍රිය",
      waiting: "රැඳී සිටී",
      resolved: "විසඳූ",
    },
  },
};

export default function OfficerRoomsScreen({ route, navigation }: any) {
  const { language } = useLanguage();
  const t = translations[language === "sinhala" ? "si" : "en"];

  const officerId = route?.params?.officerId;
  const [rooms, setRooms] = useState<any[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // ✨ Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!officerId) return;
    loadRooms();
  }, [officerId]);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchQuery, activeFilter]);

  async function loadRooms() {
    try {
      const data = await getOfficerRooms(officerId);
      // Add mock data for demonstration
      const enhancedData = (data || []).map((room: any, index: number) => ({
        ...room,
        farmer_name: room.farmer_name || `Farmer ${index + 1}`,
        last_message: room.last_message || "Hello, I need help with my crops",
        last_message_time:
          room.last_message_time ||
          new Date(Date.now() - index * 3600000).toISOString(),
        unread_count: room.unread_count || Math.floor(Math.random() * 5),
        status: ["active", "waiting", "resolved"][
          Math.floor(Math.random() * 3)
        ] as "active" | "waiting" | "resolved",
      }));
      setRooms(enhancedData);
    } catch (err) {
      console.log("Failed to load officer rooms:", err);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (room) =>
          room.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.last_message?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((room) => room.status === activeFilter);
    }

    setFilteredRooms(filtered);
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return t.justNow;
    if (diffMinutes < 60) return `${diffMinutes} ${t.minutesAgo}`;
    if (diffMinutes < 1440)
      return `${Math.floor(diffMinutes / 60)} ${t.hoursAgo}`;
    return `${Math.floor(diffMinutes / 1440)} ${t.daysAgo}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "waiting":
        return "#F59E0B";
      case "resolved":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "active":
        return "rgba(16, 185, 129, 0.1)";
      case "waiting":
        return "rgba(245, 158, 11, 0.1)";
      case "resolved":
        return "rgba(107, 114, 128, 0.1)";
      default:
        return "rgba(107, 114, 128, 0.1)";
    }
  };

  const openRoom = (room: any) => {
    navigation.navigate("Chat", {
      roomId: room.id,
      userId: officerId,
    });
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: t.status.active },
    { key: "waiting", label: t.status.waiting },
    { key: "resolved", label: t.status.resolved },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#0faa76ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>

          <View style={styles.headerIcon}>
            <Shield size={24} color="#ffffff" />
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.searchWrapper}
        >
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : (
            <Filter size={20} color="#9ca3af" />
          )}
        </LinearGradient>
      </Animated.View>

      {/* Filter Tabs */}
      <Animated.View
        style={[
          styles.filterContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10B981"]}
            tintColor="#10B981"
          />
        }
      >
        {filteredRooms.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <LinearGradient
              colors={["#f8fafc", "#f1f5f9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyStateCard}
            >
              <View style={styles.emptyStateIcon}>
                <Users size={48} color="#9ca3af" />
              </View>
              <Text style={styles.emptyStateTitle}>{t.noChats}</Text>
              <Text style={styles.emptyStateText}>{t.noChatsDesc}</Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.refreshButtonGradient}
                >
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        ) : (
          <>
            {/* Stats Summary */}
            <Animated.View
              style={[
                styles.statsContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <LinearGradient
                colors={["#f0fdf4", "#dcfce7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statsCard}
              >
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {rooms.filter((r) => r.status === "active").length}
                  </Text>
                  <Text style={styles.statLabel}>{t.status.active}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
                    {rooms.filter((r) => r.status === "waiting").length}
                  </Text>
                  <Text style={styles.statLabel}>{t.status.waiting}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: "#6B7280" }]}>
                    {rooms.filter((r) => r.status === "resolved").length}
                  </Text>
                  <Text style={styles.statLabel}>{t.status.resolved}</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Chat Rooms List */}
            <View style={styles.roomsSection}>
              <Text style={styles.sectionTitle}>
                {t.activeChats} ({filteredRooms.length})
              </Text>
              <View style={styles.roomsList}>
                {filteredRooms.map((room, index) => (
                  <Animated.View
                    key={room.id}
                    style={[
                      styles.roomCardWrapper,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: slideAnim.interpolate({
                              inputRange: [0, 30],
                              outputRange: [0, 10 * index],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.roomCard}
                      onPress={() => openRoom(room)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={["#ffffff", "#f9fafb"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.roomCardGradient}
                      >
                        {/* Room Header */}
                        <View style={styles.roomHeader}>
                          <View style={styles.farmerAvatar}>
                            <User size={20} color="#10B981" />
                          </View>
                          <View style={styles.farmerInfo}>
                            <View style={styles.nameRow}>
                              <Text style={styles.farmerName}>
                                {room.farmer_name}
                              </Text>
                              <View
                                style={[
                                  styles.statusBadge,
                                  {
                                    backgroundColor: getStatusBgColor(
                                      room.status
                                    ),
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.statusText,
                                    { color: getStatusColor(room.status) },
                                  ]}
                                >
                                  {
                                    t.status[
                                      room.status as keyof typeof t.status
                                    ]
                                  }
                                </Text>
                              </View>
                            </View>
                            <View style={styles.districtRow}>
                              <MapPin size={12} color="#6b7280" />
                              <Text style={styles.districtText}>
                                {room.district || "Unknown District"}
                              </Text>
                            </View>
                          </View>
                          {room.unread_count > 0 && (
                            <View style={styles.unreadBadge}>
                              <LinearGradient
                                colors={["#ef4444", "#dc2626"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.unreadBadgeGradient}
                              >
                                <Text style={styles.unreadCount}>
                                  {room.unread_count}
                                </Text>
                              </LinearGradient>
                            </View>
                          )}
                        </View>

                        {/* Last Message */}
                        <View style={styles.messagePreview}>
                          <MessageSquare size={14} color="#9ca3af" />
                          <Text style={styles.previewText} numberOfLines={2}>
                            {room.last_message || "No messages yet"}
                          </Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.roomFooter}>
                          <View style={styles.timeInfo}>
                            <Clock size={12} color="#9ca3af" />
                            <Text style={styles.timeText}>
                              {getTimeAgo(room.last_message_time)}
                            </Text>
                          </View>
                          <View style={styles.viewChatButton}>
                            <Text style={styles.viewChatText}>
                              {t.viewChat}
                            </Text>
                            <ChevronRight size={16} color="#10B981" />
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1f2937",
  },
  clearText: {
    fontSize: 18,
    color: "#9ca3af",
    paddingHorizontal: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterPillActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    paddingBottom: 40,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  emptyStateCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  refreshButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#10B981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  roomsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 16,
  },
  roomsList: {
    gap: 12,
  },
  roomCardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  roomCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  roomCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  farmerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#dcfce7",
  },
  farmerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  districtRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  districtText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  unreadBadge: {
    borderRadius: 12,
    overflow: "hidden",
  },
  unreadBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  roomFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  viewChatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewChatText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});
