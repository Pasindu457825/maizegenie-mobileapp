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
  Image,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabaseNew as supabase } from "@lib/supabase_new";

type Feedback = {
  id: string;
  message: string;
  image_url?: string | null;
  district: string | null;
  created_at: string;
  pest_officer_replies?: {
    reply: string;
    created_at: string;
  }[];
};

async function getUserSafely() {
  try {
    if (typeof (supabase.auth as any).user === "function") {
      return (supabase.auth as any).user();
    }
    if (typeof (supabase.auth as any).session === "function") {
      return (supabase.auth as any).session()?.user ?? null;
    }
    if ((supabase.auth as any).currentUser) {
      return (supabase.auth as any).currentUser;
    }
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

async function uploadFeedbackImage(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const fileExt = (asset.uri.split(".").pop() || "jpg").toLowerCase();
  const fileName = `pest_feedback_${Date.now()}.${fileExt}`;
  const filePath = `feedback/${fileName}`;
  const bucketName = process.env.EXPO_PUBLIC_PEST_FEEDBACK_BUCKET || "pest-feedback-images";

  const response = await fetch(asset.uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, arrayBuffer, {
      contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

async function toSignedImageUrl(rawUrl: string | null): Promise<string | null> {
  if (!rawUrl) return null;
  if (!rawUrl.includes("/storage/v1/object/")) return rawUrl;

  try {
    const marker = "/storage/v1/object/public/";
    const idx = rawUrl.indexOf(marker);
    if (idx === -1) return rawUrl;

    const rest = rawUrl.slice(idx + marker.length);
    const slash = rest.indexOf("/");
    if (slash === -1) return rawUrl;

    const bucket = rest.slice(0, slash);
    const path = decodeURIComponent(rest.slice(slash + 1));

    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) return rawUrl;
    return data.signedUrl;
  } catch {
    return rawUrl;
  }
}

export default function PestFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [message, setMessage] = useState("");
  const [imageAsset, setImageAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const loadFeedbacks = async () => {
    const { data, error } = await supabase
      .from("pest_feedback")
      .select(`
        id, message, image_url, district, created_at,
        pest_officer_replies ( reply, created_at )
      `)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const base = data as Feedback[];
      const withSigned = await Promise.all(
        base.map(async (item) => ({
          ...item,
          image_url: await toSignedImageUrl(item.image_url ?? null),
        }))
      );
      setFeedbacks(withSigned);
    }
    setFetching(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadFeedbacks();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    void loadFeedbacks();
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Allow photo access to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageAsset(result.assets[0]);
    }
  };

  const submitFeedback = async () => {
    if (!message.trim() || !imageAsset) {
      Alert.alert("Missing fields", "Please add your problem and one photo.");
      return;
    }

    setSubmitting(true);
    try {
      const user = await getUserSafely();
      if (!user) {
        Alert.alert("Error", "Please login again.");
        return;
      }

      const imageUrl = await uploadFeedbackImage(imageAsset);

      const { error } = await supabase.from("pest_feedback").insert({
        farmer_id: user.id,
        pest_type: "General Pest Issue",
        message: message.trim(),
        image_url: imageUrl,
        status: "pending",
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Submitted", "Your post is under review by our officer.");
        setMessage("");
        setImageAsset(null);
        setShowForm(false);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong.");
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
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: { item: Feedback }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={styles.messageText}>{item.message}</Text>

      {item.image_url ? (
        <TouchableOpacity
          style={styles.thumbWrap}
          activeOpacity={0.85}
          onPress={() => setPreviewImageUrl(item.image_url || null)}
        >
          <Image source={{ uri: item.image_url }} style={styles.feedbackThumb} resizeMode="cover" />
          <Text style={styles.thumbHint}>Tap to view</Text>
        </TouchableOpacity>
      ) : null}

      {item.district ? <Text style={styles.districtText}>Location: {item.district}</Text> : null}

      {item.pest_officer_replies && item.pest_officer_replies.length > 0 && (
        <View style={styles.replyBox}>
          <Text style={styles.replyLabel}>Officer Reply</Text>
          <Text style={styles.replyText}>{item.pest_officer_replies[0].reply}</Text>
          <Text style={styles.replyTime}>{formatDate(item.pest_officer_replies[0].created_at)}</Text>
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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pest Forum</Text>
        <Text style={styles.headerSub}>Community discussions and expert advice</Text>
      </View>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2d9d78" />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {showForm ? (
              <View style={styles.form}>
                <View style={styles.formTopRow}>
                  <Text style={styles.formTitle}>New Post</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowForm(false);
                      setMessage("");
                      setImageAsset(null);
                    }}
                  >
                    <Text style={styles.closeText}>x</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the pest problem..."
                  placeholderTextColor="#bbb"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.imageBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Text style={styles.imageBtnText}>{imageAsset ? "Change Photo" : "Upload Photo"}</Text>
                </TouchableOpacity>

                {imageAsset ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: imageAsset.uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageAsset(null)}>
                      <Text style={styles.removeImageText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View style={styles.formBtns}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setShowForm(false);
                      setMessage("");
                      setImageAsset(null);
                    }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.postBtn, submitting && { opacity: 0.6 }]}
                    onPress={submitFeedback}
                    disabled={submitting}
                  >
                    {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.postText}>Post</Text>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.noteText}>Add one clear photo. Your post will be reviewed before appearing.</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.newPostBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
                <Text style={styles.newPostText}>+ Share Your Experience</Text>
              </TouchableOpacity>
            )}

            {!fetching && <Text style={styles.sectionTitle}>Discussions ({feedbacks.length})</Text>}
          </View>
        }
        ListEmptyComponent={
          fetching ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2d9d78" />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to share</Text>
            </View>
          )
        }
      />

      <Modal
        visible={Boolean(previewImageUrl)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity style={styles.previewCloseArea} onPress={() => setPreviewImageUrl(null)} />
          <View style={styles.previewCard}>
            {previewImageUrl ? (
              <Image source={{ uri: previewImageUrl }} style={styles.previewFullImage} resizeMode="contain" />
            ) : null}
            <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setPreviewImageUrl(null)}>
              <Text style={styles.previewCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  header: {
    backgroundColor: "#fff",
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: "#999", marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  newPostBtn: {
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "#2d9d78",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  newPostText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
  formTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  formTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  closeText: { fontSize: 20, color: "#bbb", lineHeight: 22 },
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
  textArea: { height: 100, paddingTop: 11 },

  imageBtn: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  imageBtnText: { color: "#065f46", fontWeight: "700", fontSize: 13 },
  previewWrap: { marginBottom: 10 },
  previewImage: { width: "100%", height: 180, borderRadius: 10, backgroundColor: "#e5e7eb" },
  removeImageBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeImageText: { color: "#b91c1c", fontSize: 12, fontWeight: "700" },

  formBtns: { flexDirection: "row", gap: 10, marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: { color: "#666", fontWeight: "600", fontSize: 14 },
  postBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#2d9d78",
    alignItems: "center",
  },
  postText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  noteText: { fontSize: 11, color: "#bbb", textAlign: "center" },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333", marginTop: 20, marginBottom: 10 },

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
  cardRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 10 },
  timeText: { fontSize: 11, color: "#bbb" },
  messageText: { fontSize: 14, color: "#333", lineHeight: 21 },
  thumbWrap: { marginTop: 10, alignSelf: "flex-start" },
  feedbackThumb: { width: 110, height: 110, borderRadius: 10, backgroundColor: "#e5e7eb" },
  thumbHint: { marginTop: 6, fontSize: 11, color: "#64748b", fontWeight: "600" },
  districtText: { fontSize: 12, color: "#3b82f6", marginTop: 7 },

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
  replyText: { fontSize: 14, color: "#065f46", lineHeight: 20 },
  replyTime: { fontSize: 11, color: "#6ee7b7", marginTop: 5 },

  centered: { paddingVertical: 60, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#555", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#aaa" },

  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  previewCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  previewFullImage: {
    width: "100%",
    height: 420,
    borderRadius: 10,
    backgroundColor: "#0f172a",
  },
  previewCloseBtn: {
    marginTop: 10,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  previewCloseText: {
    color: "#fff",
    fontWeight: "700",
  },
});
