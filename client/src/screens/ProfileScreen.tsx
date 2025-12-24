import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { useApp } from "../context/AppContext";
import { getFarmerPredictionHistory } from "../services/yieldPredictionApi";
import { useNavigation } from "@react-navigation/native";
import {
  User,
  Calendar,
  MapPin,
  Leaf,
  LogOut,
  Copy,
  Share2,
} from "lucide-react-native";

const ProfileScreen = () => {
  const { user, signOut } = useApp();
  const navigation = useNavigation<any>();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPredictionHistory();
  }, []);

  const loadPredictionHistory = async () => {
    try {
      setLoading(true);
      const response = await getFarmerPredictionHistory(1);
      setPredictions(response.predictions || []);
    } catch (error: any) {
      console.error("Failed to load prediction history:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to load prediction history"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPredictionHistory();
  };

  const handleCopyPrediction = (prediction: any) => {
    try {
      Clipboard.setString(prediction.shareable_text);
      Alert.alert("Copied!", "Prediction details copied to clipboard");
    } catch (error) {
      console.error("Copy failed:", error);
      Alert.alert("Error", "Failed to copy prediction details");
    }
  };

  const handleShareWithOfficer = (prediction: any) => {
    const contextMessage = `🌾 Maize Yield Prediction Request

📝 Farmer Details:
Name: ${user?.full_name || "Farmer"}
District: ${prediction.district}

🌱 Crop Information:
Variety: ${prediction.variety || "N/A"}
Season: ${prediction.season}
Land Size: ${prediction.land_size || "N/A"}
Planting Date: ${formatDate(prediction.planting_date)}

I would like to get advice from an Agricultural Officer regarding my yield prediction and crop management.`;

    navigation.navigate("PredictYield", {
      screen: "AgriculturalAdvisoryChat",
      params: {
        prefilledMessage: contextMessage,
        context: "yield_prediction",
        advisoryType: "yield",
        advisoryData: {
          prediction: prediction,
          farmer: user,
        },
      },
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const { diseaseModel, setDiseaseModel } = useApp();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User color="#10B981" size={48} />
        </View>
        <Text style={styles.name}>{user?.full_name || "Farmer"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.district && (
          <View style={styles.districtBadge}>
            <MapPin color="#10B981" size={16} />
            <Text style={styles.districtText}>{user.district}</Text>
          </View>
        )}
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      {/* Disease Detection Model Switch */}
      {user?.role === "farmer" && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={22} />
            <Text style={styles.sectionTitle}>Disease Detection Model</Text>
          </View>

          <View style={styles.modelCard}>
            <TouchableOpacity
              style={[
                styles.modelButton,
                diseaseModel === "local" && styles.modelButtonActive,
              ]}
              onPress={() => setDiseaseModel("local")}
            >
              <Text
                style={[
                  styles.modelText,
                  diseaseModel === "local" && styles.modelTextActive,
                ]}
              >
                Local AI
              </Text>
              <Text style={styles.modelSubText}>Faster • Offline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modelButton,
                diseaseModel === "roboflow" && styles.modelButtonActive,
              ]}
              onPress={() => setDiseaseModel("roboflow")}
            >
              <Text
                style={[
                  styles.modelText,
                  diseaseModel === "roboflow" && styles.modelTextActive,
                ]}
              >
                Cloud AI
              </Text>
              <Text style={styles.modelSubText}>More Accurate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut color="#EF4444" size={20} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Recent Yield Predictions Section - Farmers Only */}
      {user?.role === "farmer" && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={24} />
            <Text style={styles.sectionTitle}>Recent Yield Predictions</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading predictions...</Text>
            </View>
          ) : predictions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Leaf color="#D1D5DB" size={48} />
              <Text style={styles.emptyText}>No predictions yet</Text>
              <Text style={styles.emptySubtext}>
                Start by creating a yield prediction
              </Text>
            </View>
          ) : (
            <View>
              {predictions.slice(0, 1).map((prediction, index) => (
                <View
                  key={prediction.id || index}
                  style={styles.predictionCard}
                >
                  <View style={styles.predictionHeader}>
                    <View style={styles.predictionInfo}>
                      <Text style={styles.predictionVariety}>
                        {prediction.variety}
                      </Text>
                      <View style={styles.predictionMeta}>
                        <Calendar color="#6B7280" size={14} />
                        <Text style={styles.predictionDate}>
                          {formatDate(prediction.created_at)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.shareButton}
                      onPress={() => handleCopyPrediction(prediction)}
                    >
                      <Copy color="#10B981" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.predictionDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>District:</Text>
                      <Text style={styles.detailValue}>
                        {prediction.district}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Season:</Text>
                      <Text style={styles.detailValue}>
                        {prediction.season}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Land Size:</Text>
                      <Text style={styles.detailValue}>
                        {prediction.land_size}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Planting Date:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(prediction.planting_date)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.shareTextButton}
                    onPress={() => handleShareWithOfficer(prediction)}
                  >
                    <Share2 color="#FFFFFF" size={16} />
                    <Text style={styles.shareTextButtonText}>
                      Share with Officer
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  districtBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  districtText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  role: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginLeft: 8,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  modelCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    gap: 12,
  },

  modelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  modelButtonActive: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },

  modelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },

  modelTextActive: {
    color: "#065F46",
  },

  modelSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  loadingContainer: {
    padding: 48,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  emptyContainer: {
    padding: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  predictionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  predictionInfo: {
    flex: 1,
  },
  predictionVariety: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  predictionMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  predictionDate: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  shareButton: {
    padding: 8,
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
  },
  predictionDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  shareTextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
  },
  shareTextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
});

export default ProfileScreen;
