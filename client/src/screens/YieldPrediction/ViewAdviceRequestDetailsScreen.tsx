import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, User, MapPin, Calendar, Droplets, TrendingUp, MessageSquare, Sprout, CheckCircle2, Lightbulb } from "lucide-react-native";
import { getAdviceRequest } from "../../services/adviceRequestApi";
import type { AdviceRequest } from "../../services/adviceRequestApi";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "ViewAdviceRequestDetailsScreen">;

const ViewAdviceRequestDetailsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<AdviceRequest | null>(null);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdviceRequest(requestId);
      setRequest(data);
    } catch (error: any) {
      console.error("Failed to load request details:", error);
      Alert.alert("Error", "Failed to load request details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "normal":
        return "#3B82F6";
      case "low":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Request not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(request.status) }]} />
              <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.requestType}>
            {request.request_type === "yield_enhancement"
              ? "Yield Enhancement"
              : request.request_type === "seed_variety"
              ? "Seed Variety Selection"
              : "Both (Yield & Seed)"}
          </Text>
          <Text style={styles.createdAt}>Created: {formatDate(request.created_at)}</Text>
        </View>

        {/* Farmer Message */}
        {request.farmer_message && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MessageSquare size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>Farmer's Message</Text>
            </View>
            <Text style={styles.messageText}>{request.farmer_message}</Text>
          </View>
        )}

        {/* Prediction Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>Prediction Details</Text>
          </View>
          
          {request.predicted_yield_kg_ha && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Predicted Yield:</Text>
              <Text style={styles.detailValue}>{request.predicted_yield_kg_ha.toFixed(2)} kg/ha</Text>
            </View>
          )}

          {request.variety && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Variety:</Text>
              <Text style={styles.detailValue}>{request.variety}</Text>
            </View>
          )}

          {request.land_size_ha && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Land Size:</Text>
              <Text style={styles.detailValue}>{request.land_size_ha.toFixed(2)} ha</Text>
            </View>
          )}
        </View>

        {/* Location Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>Location Details</Text>
          </View>

          {request.district && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>District:</Text>
              <Text style={styles.detailValue}>{request.district}</Text>
            </View>
          )}

          {request.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{request.location}</Text>
            </View>
          )}
        </View>

        {/* Field Conditions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Droplets size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>Field Conditions</Text>
          </View>

          {request.irrigation_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Irrigation Type:</Text>
              <Text style={styles.detailValue}>{request.irrigation_type}</Text>
            </View>
          )}

          {request.rainfall_condition && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rainfall Condition:</Text>
              <Text style={styles.detailValue}>{request.rainfall_condition}</Text>
            </View>
          )}

          {request.planting_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Planting Date:</Text>
              <Text style={styles.detailValue}>{request.planting_date}</Text>
            </View>
          )}
        </View>

        {/* Divider - Officer's Response Section */}
        {request.officer_response && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Officer's Response</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Officer Response */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>Officer's Response</Text>
            </View>
            <Text style={styles.messageText}>{request.officer_response}</Text>
            {request.responded_at && (
              <Text style={styles.timestamp}>Responded: {formatDate(request.responded_at)}</Text>
            )}
          </View>
          </>
        )}

        {/* Fertilizer Plan */}
        {request.fertilizer_plan && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle2 size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>Fertilizer Plan</Text>
            </View>

            {/* Basal Application */}
            {request.fertilizer_plan.basal && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>Basal Application</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.basal.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>TSP: {request.fertilizer_plan.basal.tsp_kg} kg</Text>
                  <Text style={styles.fertilizerAmount}>MOP: {request.fertilizer_plan.basal.mop_kg} kg</Text>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.basal.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.basal.timing}</Text>
              </View>
            )}

            {/* First Top Dressing */}
            {request.fertilizer_plan.top_dress_1 && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>First Top Dressing</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.top_dress_1.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.top_dress_1.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.top_dress_1.timing}</Text>
              </View>
            )}

            {/* Second Top Dressing */}
            {request.fertilizer_plan.top_dress_2 && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>Second Top Dressing</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.top_dress_2.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.top_dress_2.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.top_dress_2.timing}</Text>
              </View>
            )}

            {/* Organic Recommendations */}
            {request.fertilizer_plan.organic && (
              <View style={styles.organicSection}>
                <Text style={styles.organicTitle}>Organic Fertilizer (Optional)</Text>
                {request.fertilizer_plan.organic.compost_tons && (
                  <Text style={styles.organicAmount}>
                    Compost: {request.fertilizer_plan.organic.compost_tons} tons
                  </Text>
                )}
                <Text style={styles.organicNote}>{request.fertilizer_plan.organic.timing}</Text>
              </View>
            )}

            {/* Total Nutrients */}
            {request.fertilizer_plan.total_nutrients && (
              <View style={styles.nutrientSummary}>
                <Text style={styles.nutrientTitle}>Total Nutrients:</Text>
                <Text style={styles.nutrientText}>
                  N: {request.fertilizer_plan.total_nutrients.nitrogen_kg} kg | 
                  P: {request.fertilizer_plan.total_nutrients.phosphorus_kg} kg | 
                  K: {request.fertilizer_plan.total_nutrients.potassium_kg} kg
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Cultivation Advice */}
        {request.cultivation_advice && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lightbulb size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>Cultivation Advice</Text>
            </View>
            <Text style={styles.messageText}>{request.cultivation_advice}</Text>
          </View>
        )}

        {/* Expected Yield Improvement */}
        {request.expected_yield_improvement && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>Expected Yield Improvement</Text>
            </View>
            <Text style={styles.messageText}>{request.expected_yield_improvement}</Text>
          </View>
        )}

        {/* Officer Notes */}
        {request.officer_notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Officer's Notes</Text>
            </View>
            <Text style={styles.messageText}>{request.officer_notes}</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#10b981",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  requestType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  createdAt: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  fertilizerSection: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  fertilizerStage: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#15803D",
    marginBottom: 4,
  },
  fertilizerDate: {
    fontSize: 13,
    color: "#16A34A",
    marginBottom: 8,
  },
  fertilizerAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  fertilizerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  fertilizerNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  organicSection: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  organicTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  organicAmount: {
    fontSize: 14,
    color: "#78350F",
    marginBottom: 4,
  },
  organicNote: {
    fontSize: 12,
    color: "#92400E",
    fontStyle: "italic",
  },
  nutrientSummary: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  nutrientTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
  },
  nutrientText: {
    fontSize: 13,
    color: "#1E3A8A",
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#10B981",
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginHorizontal: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default ViewAdviceRequestDetailsScreen;
