import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
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

async function getUserSafely() {
  try {
    if (typeof (supabase.auth as any).user === "function")
      return (supabase.auth as any).user();
    if (typeof (supabase.auth as any).session === "function")
      return (supabase.auth as any).session()?.user ?? null;
    if ((supabase.auth as any).currentUser)
      return (supabase.auth as any).currentUser;
    if (typeof (supabase.auth as any).getUser === "function") {
      const { data } = await (supabase.auth as any).getUser();
      return data?.user ?? null;
    }
    if (typeof (supabase.auth as any).getSession === "function") {
      const { data } = await (supabase.auth as any).getSession();
      return data?.session?.user ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function PestFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");
  const [pestType, setPestType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadFeedbacks = async () => {
    const { data, error } = await supabase
      .from("pest_feedback")
      .select(`
        id, pest_type, message, district, created_at,
        pest_officer_replies ( reply, created_at )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) setFeedbacks(data as any);
    setFetching(false);
    setRefreshing(false);
  };

  useEffect(() => { loadFeedbacks(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeedbacks();
  };

  const submitFeedback = async () => {
    if (!pestType.trim() || !message.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await getUserSafely();
      if (!user) {
        Alert.alert("Error", "Please login again.");
        return;
      }
      const { error } = await supabase.from("pest_feedback").insert({
        farmer_id: user.id,
        pest_type: pestType.trim(),
        message: message.trim(),
        status: "pending",
      });
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Submitted", "Your post is under review by our officer.");
        setMessage("");
        setPestType("");
        setShowForm(false);
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

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
    return date.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: Feedback }) => (
    <View style={styles.card}>
      {/* Pest type + time */}
      <View style={styles.cardRow}>
        <View style={styles.pestTag}>
          <Text style={styles.pestTagText}>{item.pest_type}</Text>
        </View>
        <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
      </View>

      {/* Message */}
      <Text style={styles.messageText}>{item.message}</Text>

      {/* District */}
      {item.district ? (
        <Text style={styles.districtText}>📍 {item.district}</Text>
      ) : null}

      {/* Officer reply */}
      {item.pest_officer_replies && item.pest_officer_replies.length > 0 && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Officer Reply</Text>
          <Text style={styles.replyText}>
            {item.pest_officer_replies[0].reply}
          </Text>
          <Text style={styles.replyTime}>
            {formatDate(item.pest_officer_replies[0].created_at)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pest Forum</Text>
        <Text style={styles.headerSub}>
          Community discussions & expert advice
        </Text>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2d9d78"
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Post form or button */}
            {showForm ? (
              <View style={styles.form}>
                <View style={styles.formTopRow}>
                  <Text style={styles.formTitle}>New Post</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowForm(false);
                      setPestType("");
                      setMessage("");
                    }}
                  >
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Pest type (e.g. Fall Armyworm)"
                  placeholderTextColor="#bbb"
                  value={pestType}
                  onChangeText={setPestType}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the issue or ask a question..."
                  placeholderTextColor="#bbb"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.formBtns}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setShowForm(false);
                      setPestType("");
                      setMessage("");
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.postBtn, submitting && { opacity: 0.6 }]}
                    onPress={submitFeedback}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.postText}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.noteText}>
                  Your post will be reviewed before appearing.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.newPostBtn}
                onPress={() => setShowForm(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.newPostText}>＋ Share Your Experience</Text>
              </TouchableOpacity>
            )}

            {/* Section title */}
            {!fetching && (
              <Text style={styles.sectionTitle}>
                Discussions ({feedbacks.length})
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          fetching ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2d9d78" />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to share!</Text>
            </View>
          )
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#fff",
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },

  // ── List padding ──────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // ── New post button ───────────────────────────────────────────────────────
  newPostBtn: {
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "#2d9d78",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  newPostText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  closeText: {
    fontSize: 20,
    color: "#bbb",
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#222",
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    paddingTop: 11,
  },
  formBtns: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  postBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2d9d78",
    alignItems: "center",
  },
  postText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  noteText: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "center",
  },

  // ── Section title ─────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pestTag: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  pestTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  timeText: {
    fontSize: 11,
    color: "#bbb",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },
  districtText: {
    fontSize: 12,
    color: "#3b82f6",
    marginTop: 7,
  },

  // ── Reply ─────────────────────────────────────────────────────────────────
  replyBox: {
    marginTop: 12,
    backgroundColor: "#f0fdf6",
    borderLeftWidth: 3,
    borderLeftColor: "#2d9d78",
    borderRadius: 8,
    padding: 12,
  },
  replyLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2d9d78",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  replyText: {
    fontSize: 14,
    color: "#065f46",
    lineHeight: 20,
  },
  replyTime: {
    fontSize: 11,
    color: "#6ee7b7",
    marginTop: 5,
  },

  // ── Empty / Loading ───────────────────────────────────────────────────────
  centered: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555",
    marginBottom: 4,
  },
  emptyText: { fontSize: 13, color: "#aaa" },
});