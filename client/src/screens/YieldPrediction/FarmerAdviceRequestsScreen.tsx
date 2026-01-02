/**
 * Farmer Advice Requests Screen (Officer View)
 * Lists all farmer advice requests with filters and pagination
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Leaf,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import {
  listAdviceRequests,
  getAdviceRequestStats,
  assignAdviceRequest,
  AdviceRequest,
  AdviceRequestStats,
  AdviceRequestFilters,
} from "../../services/adviceRequestApi";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<YieldPredictionStackParamList>;

const FarmerAdviceRequestsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: lang } = useLanguage();
  const language: "si" | "en" = lang === "sinhala" ? "si" : "en";

  // State
  const [requests, setRequests] = useState<AdviceRequest[]>([]);
  const [stats, setStats] = useState<AdviceRequestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Content
  const content = {
    si: {
      title: "ගොවි ඉල්ලීම්",
      subtitle: "උපදේශ ඉල්ලීම් කළමනාකරණය",
      all: "සියල්ල",
      pending: "බලාපොරොත්තු",
      inProgress: "ක්‍රියාත්මක",
      completed: "සම්පූර්ණ",
      cancelled: "අවලංගු",
      noRequests: "ඉල්ලීම් නොමැත",
      noRequestsDesc: "තවම ගොවි ඉල්ලීම් නොමැත",
      loadMore: "තවත් පූරණය කරන්න",
      provideAdvice: "උපදේශ ලබා දෙන්න",
      continue: "ඉදිරියට",
      viewDetails: "විස්තර බලන්න",
      yieldPrediction: "අස්වැන්න පුරෝකථනය",
      kgPerHa: "කි.ග්‍රෑ/හෙක්ටයාර",
      requestType: "ඉල්ලීම් වර්ගය",
      yieldEnhancement: "අස්වැන්න වැඩිදියුණු",
      seedVariety: "බීජ තෝරාගැනීම",
      both: "දෙකම",
      ago: "පෙර",
      hours: "පැය",
      days: "දින",
      minutes: "මිනිත්තු",
    },
    en: {
      title: "Farmer Requests",
      subtitle: "Manage advice requests",
      all: "All",
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      noRequests: "No Requests",
      noRequestsDesc: "No farmer advice requests yet",
      loadMore: "Load More",
      provideAdvice: "Provide Advice",
      continue: "Continue",
      viewDetails: "View Details",
      yieldPrediction: "Yield Prediction",
      kgPerHa: "kg/ha",
      requestType: "Request Type",
      yieldEnhancement: "Yield Enhancement",
      seedVariety: "Seed Selection",
      both: "Both",
      ago: "ago",
      hours: "hours",
      days: "days",
      minutes: "minutes",
    },
  };

  const t = content[language];

  // Fetch data
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: AdviceRequestFilters = {};
      if (selectedStatus) {
        filters.status = selectedStatus as any;
      }

      const [requestsResponse, statsResponse] = await Promise.all([
        listAdviceRequests(filters, page, 20),
        getAdviceRequestStats(),
      ]);

      setRequests(requestsResponse.requests);
      setTotalPages(requestsResponse.total_pages);
      setStats(statsResponse);
    } catch (error: any) {
      console.error("Failed to fetch requests:", error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        error.message || "Failed to load requests"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, page, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle status filter change
  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setPage(1);
  };

  // Handle provide advice - navigate to ProvideAdviceScreen
  const handleProvideAdvice = async (requestId: string) => {
    try {
      // Change status to in_progress when officer starts providing advice
      await assignAdviceRequest(requestId);
      // Navigate to the advice screen
      navigation.navigate("ProvideAdviceScreen", { requestId });
    } catch (error: any) {
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        error.message || "Failed to update request status"
      );
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) {
      return `${diffDays} ${t.days} ${t.ago}`;
    } else if (diffHours > 0) {
      return `${diffHours} ${t.hours} ${t.ago}`;
    } else {
      return `${diffMins} ${t.minutes} ${t.ago}`;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock color="#F59E0B" size={16} />;
      case "in_progress":
        return <AlertCircle color="#3B82F6" size={16} />;
      case "completed":
        return <CheckCircle color="#10B981" size={16} />;
      case "cancelled":
        return <XCircle color="#6B7280" size={16} />;
      default:
        return <Clock color="#6B7280" size={16} />;
    }
  };

  // Get request type label
  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "yield_enhancement":
        return t.yieldEnhancement;
      case "seed_variety":
        return t.seedVariety;
      case "both":
        return t.both;
      default:
        return type;
    }
  };

  // Render stats cards
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[
            styles.statCard,
            selectedStatus === null && styles.statCardActive,
          ]}
          onPress={() => handleStatusFilter(null)}
        >
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>{t.all}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: "#F59E0B" },
            selectedStatus === "pending" && styles.statCardActive,
          ]}
          onPress={() => handleStatusFilter("pending")}
        >
          <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
            {stats.pending}
          </Text>
          <Text style={styles.statLabel}>{t.pending}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: "#3B82F6" },
            selectedStatus === "in_progress" && styles.statCardActive,
          ]}
          onPress={() => handleStatusFilter("in_progress")}
        >
          <Text style={[styles.statNumber, { color: "#3B82F6" }]}>
            {stats.in_progress}
          </Text>
          <Text style={styles.statLabel}>{t.inProgress}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            { borderLeftColor: "#10B981" },
            selectedStatus === "completed" && styles.statCardActive,
          ]}
          onPress={() => handleStatusFilter("completed")}
        >
          <Text style={[styles.statNumber, { color: "#10B981" }]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>{t.completed}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render request card
  const renderRequestCard = (request: AdviceRequest) => {
    return (
      <View key={request.id} style={styles.requestCard}>
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.requestHeaderLeft}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + "20" },
              ]}
            >
              {getStatusIcon(request.status)}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {request.status === "pending"
                  ? t.pending
                  : request.status === "in_progress"
                  ? t.inProgress
                  : request.status === "completed"
                  ? t.completed
                  : t.cancelled}
              </Text>
            </View>
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(request.created_at)}</Text>
        </View>

        {/* Location */}
        {(request.district || request.location) && (
          <View style={styles.locationRow}>
            <MapPin color="#6B7280" size={14} />
            <Text style={styles.locationText}>
              {[request.district, request.location].filter(Boolean).join(" - ")}
            </Text>
          </View>
        )}

        {/* Yield Info */}
        {request.predicted_yield_kg_ha && (
          <View style={styles.yieldRow}>
            <TrendingUp color="#10B981" size={14} />
            <Text style={styles.yieldText}>
              {t.yieldPrediction}: {request.predicted_yield_kg_ha.toFixed(0)} {t.kgPerHa}
            </Text>
          </View>
        )}

        {/* Variety */}
        {request.variety && (
          <View style={styles.varietyRow}>
            <Leaf color="#16A34A" size={14} />
            <Text style={styles.varietyText}>{request.variety}</Text>
          </View>
        )}

        {/* Request Type */}
        <View style={styles.requestTypeRow}>
          <Text style={styles.requestTypeLabel}>{t.requestType}:</Text>
          <Text style={styles.requestTypeValue}>
            {getRequestTypeLabel(request.request_type)}
          </Text>
        </View>

        {/* Farmer Message */}
        {request.farmer_message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText} numberOfLines={2}>
              "{request.farmer_message}"
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {request.status === "pending" && (
            <TouchableOpacity
              style={styles.provideAdviceButton}
              onPress={() => handleProvideAdvice(request.id)}
            >
              <Text style={styles.provideAdviceButtonText}>{t.provideAdvice}</Text>
            </TouchableOpacity>
          )}
          {request.status === "in_progress" && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                navigation.navigate("ProvideAdviceScreen", { requestId: request.id });
              }}
            >
              <Text style={styles.continueButtonText}>{t.continue}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              navigation.navigate("ViewAdviceRequestDetailsScreen", { requestId: request.id });
            }}
          >
            <Text style={styles.viewButtonText}>{t.viewDetails}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
          <TouchableOpacity
            onPress={() => fetchData(true)}
            style={styles.refreshButton}
          >
            <RefreshCw color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      {renderStats()}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={["#10B981"]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users color="#D1D5DB" size={64} />
            <Text style={styles.emptyTitle}>{t.noRequests}</Text>
            <Text style={styles.emptyDesc}>{t.noRequestsDesc}</Text>
          </View>
        ) : (
          <>
            {requests.map(renderRequestCard)}

            {/* Load More */}
            {page < totalPages && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setPage((p) => p + 1)}
              >
                <Text style={styles.loadMoreText}>{t.loadMore}</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardActive: {
    backgroundColor: "#ECFDF5",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
  },
  statLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  yieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  yieldText: {
    fontSize: 13,
    color: "#10B981",
    fontWeight: "500",
  },
  varietyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  varietyText: {
    fontSize: 13,
    color: "#16A34A",
  },
  requestTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  requestTypeLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  requestTypeValue: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  messageContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  provideAdviceButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  provideAdviceButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  viewButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  viewButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "500",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  loadMoreButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadMoreText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FarmerAdviceRequestsScreen;
