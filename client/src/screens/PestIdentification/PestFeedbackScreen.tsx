import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabaseNew as supabase } from "@lib/supabase_new";

type Feedback = {
  id: string;
  pest_type: string;
  message: string;
  district: string | null;
  created_at: string;
  pest_officer_replies?: {
    reply: string;
    created_at: string;
  }[];
};

// ✅ Helper to get user that works with ANY Supabase version
async function getUserSafely() {
  try {
    // Method 1: Direct user() call (Supabase v1)
    if (typeof (supabase.auth as any).user === "function") {
      return (supabase.auth as any).user();
    }

    // Method 2: session().user (Supabase v1)
    if (typeof (supabase.auth as any).session === "function") {
      const session = (supabase.auth as any).session();
      return session?.user ?? null;
    }

    // Method 3: Direct property access
    if ((supabase.auth as any).currentUser) {
      return (supabase.auth as any).currentUser;
    }

    // Method 4: getUser() (Supabase v2)
    if (typeof (supabase.auth as any).getUser === "function") {
      const { data } = await (supabase.auth as any).getUser();
      return data?.user ?? null;
    }

    // Method 5: getSession() (Supabase v2)
    if (typeof (supabase.auth as any).getSession === "function") {
      const { data } = await (supabase.auth as any).getSession();
      return data?.session?.user ?? null;
    }

    console.error(
      "No auth method found. Available methods:",
      Object.keys(supabase.auth)
    );
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export default function PestFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");
  const [pestType, setPestType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // 🔹 Load approved feedback
  const loadFeedbacks = async () => {
    const { data, error } = await supabase
      .from("pest_feedback")
      .select(
        `
        id,
        pest_type,
        message,
        district,
        created_at,
        pest_officer_replies (
          reply,
          created_at
        )
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) setFeedbacks(data as any);
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // 🔹 Submit feedback (Farmer)
  const submitFeedback = async () => {
    if (!pestType || !message) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // ✅ Get user using universal method
      const user = await getUserSafely();

      if (!user) {
        setLoading(false);
        Alert.alert("Error", "User not logged in. Please login again.");
        return;
      }

      // ✅ Insert feedback
      const { error: insertError } = await supabase
        .from("pest_feedback")
        .insert({
          farmer_id: user.id,
          pest_type: pestType,
          message: message,
          status: "pending",
        });

      setLoading(false);

      if (insertError) {
        Alert.alert("Error", insertError.message);
      } else {
        Alert.alert("✅ Submitted", "Your feedback has been sent for review");
        setMessage("");
        setPestType("");
        setShowForm(false);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(err);
    }
  };

  // 🔹 React (Helpful / Not Helpful)
  const reactToFeedback = async (
    feedbackId: string,
    reaction: "helpful" | "not_helpful"
  ) => {
    try {
      // ✅ Get user using universal method
      const user = await getUserSafely();

      if (!user) {
        Alert.alert("Error", "Please login first");
        return;
      }

      const { error } = await supabase.from("pest_reactions").insert({
        feedback_id: feedbackId,
        user_id: user.id,
        reaction: reaction,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("🙏 Thank you", "Your reaction has been recorded");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to record reaction");
    }
  };

  // 🔹 Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a7a5e" />

      {/* Header */}
      <LinearGradient
        colors={["#2d9d78", "#1a7a5e"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🌾 Pest Forum</Text>
        <Text style={styles.headerSubtitle}>
          Community discussions & expert advice
        </Text>
      </LinearGradient>

      {/* Create Post Button */}
      {!showForm && (
        <TouchableOpacity
          style={styles.createPostBtn}
          onPress={() => setShowForm(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.createPostIcon}>✏️</Text>
          <Text style={styles.createPostText}>Share Your Experience</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 Submit Form */}
      {showForm && (
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Create New Post</Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Pest Type</Text>
          <TextInput
            placeholder="e.g., Fall Armyworm, Aphids, Corn Borer"
            value={pestType}
            onChangeText={setPestType}
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Your Message</Text>
          <TextInput
            placeholder="Describe the issue, your experience, or ask for advice..."
            value={message}
            onChangeText={setMessage}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowForm(false);
                setPestType("");
                setMessage("");
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitFeedback}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>
                {loading ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.noteText}>
            💡 Your post will be reviewed before appearing in the forum
          </Text>
        </View>
      )}

      {/* 🔹 Approved Feedback List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          Community Discussions ({feedbacks.length})
        </Text>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Post Header */}
            <View style={styles.cardHeader}>
              <View style={styles.pestBadge}>
                <Text style={styles.pestBadgeText}>🐛 {item.pest_type}</Text>
              </View>
              <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
            </View>

            {/* Post Content */}
            <Text style={styles.messageText}>{item.message}</Text>

            {/* District Badge */}
            {item.district && (
              <View style={styles.districtBadge}>
                <Text style={styles.districtText}>📍 {item.district}</Text>
              </View>
            )}

            {/* Officer Reply */}
            {item.pest_officer_replies?.length ? (
              <View style={styles.replyContainer}>
                <View style={styles.replyHeader}>
                  <Text style={styles.replyIcon}>👨‍🌾</Text>
                  <Text style={styles.replyTitle}>Expert Advice</Text>
                </View>
                <Text style={styles.replyText}>
                  {item.pest_officer_replies[0].reply}
                </Text>
                <Text style={styles.replyTime}>
                  {formatDate(item.pest_officer_replies[0].created_at)}
                </Text>
              </View>
            ) : null}

            {/* Reactions */}
            <View style={styles.reactionRow}>
              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => reactToFeedback(item.id, "helpful")}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionIcon}>👍</Text>
                <Text style={styles.reactionLabel}>Helpful</Text>
              </TouchableOpacity>

              <View style={styles.reactionDivider} />

              <TouchableOpacity
                style={styles.reactionBtn}
                onPress={() => reactToFeedback(item.id, "not_helpful")}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionIcon}>👎</Text>
                <Text style={styles.reactionLabel}>Not Helpful</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No discussions yet</Text>
            <Text style={styles.emptyText}>
              Be the first to share your experience!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#D1FAE5",
  },
  createPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  createPostIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  createPostText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeBtn: {
    fontSize: 24,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 15,
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
    elevation: 2,
  },
  submitText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  noteText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pestBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pestBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  timeText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  messageText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  districtBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  districtText: {
    fontSize: 12,
    color: "#1E40AF",
    fontWeight: "500",
  },
  replyContainer: {
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  replyTitle: {
    fontWeight: "bold",
    color: "#047857",
    fontSize: 14,
  },
  replyText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 20,
    marginBottom: 6,
  },
  replyTime: {
    fontSize: 11,
    color: "#059669",
  },
  reactionRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    marginTop: 8,
  },
  reactionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  reactionIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  reactionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  reactionDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});