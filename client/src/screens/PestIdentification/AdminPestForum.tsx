import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bug,
  ChevronLeft,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  MessageSquare,
  User,
  RefreshCw,
  Eye,
  X,
  Image as ImageIcon,
} from "lucide-react-native";
import { supabase } from "@lib/supabase";
const { width, height } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────────────────
type FeedbackStatus = "pending" | "approved" | "rejected";

interface PestFeedback {
  id: string;
  farmer_id: string;
  pest_type: string;
  message: string;
  image_url: string | null;
  district: string | null;
  status: FeedbackStatus;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

const toSignedImageUrl = async (rawUrl: string | null): Promise<string | null> => {
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
};

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  FeedbackStatus,
  { color: string; bg: string; border: string; icon: any; label: string }
> = {
  pending: {
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: Clock,
    label: "Pending",
  },
  approved: {
    color: "#10b981",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: XCircle,
    label: "Rejected",
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

// ── Main Component ────────────────────────────────────────────────────────────
const AdminPestForum = () => {
  const navigation = useNavigation<any>();

  const [feedbacks, setFeedbacks] = useState<PestFeedback[]>([]);
  const [filtered, setFiltered] = useState<PestFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<PestFeedback | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Reply modal state
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyTargetFeedback, setReplyTargetFeedback] = useState<PestFeedback | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const summary = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === "pending").length,
    approved: feedbacks.filter((f) => f.status === "approved").length,
    rejected: feedbacks.filter((f) => f.status === "rejected").length,
  };

  // ── Fetch from Supabase ────────────────────────────────────────────────────
  const fetchFeedbacks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("pest_feedback")
        .select(`*, profiles ( full_name )`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const base = (data as PestFeedback[]) || [];
      const withSignedUrls = await Promise.all(
        base.map(async (item) => ({
          ...item,
          image_url: await toSignedImageUrl(item.image_url),
        }))
      );
      setFeedbacks(withSignedUrls);
    } catch (error: any) {
      console.error("Failed to fetch pest feedbacks:", error);
      Alert.alert("Error", error.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Filter + Search ────────────────────────────────────────────────────────
  useEffect(() => {
    let result = feedbacks;
    if (activeFilter !== "all") {
      result = result.filter((f) => f.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.pest_type.toLowerCase().includes(q) ||
          f.district?.toLowerCase().includes(q) ||
          f.profiles?.full_name?.toLowerCase().includes(q) ||
          f.message.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, activeFilter, feedbacks]);

  // ── Update Status ──────────────────────────────────────────────────────────
  const updateStatus = async (id: string, status: FeedbackStatus) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("pest_feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
      if (selectedFeedback?.id === id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, status } : null));
      }

      Alert.alert(
        "Success",
        `Feedback ${status === "approved" ? "approved ✅" : "rejected ❌"} successfully`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmStatusChange = (feedback: PestFeedback, newStatus: FeedbackStatus) => {
    // For approve → open reply modal instead of direct approve
    if (newStatus === "approved") {
      setReplyTargetFeedback(feedback);
      setReplyText("");
      setReplyModalVisible(true);
      return;
    }
    // For reject → direct confirm
    Alert.alert(
      "Reject Feedback",
      `Are you sure you want to reject this report from ${
        feedback.profiles?.full_name || "farmer"
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => updateStatus(feedback.id, "rejected"),
        },
      ]
    );
  };

  // Approve + insert reply in one go
  const handleApproveWithReply = async () => {
    if (!replyTargetFeedback) return;
    if (!replyText.trim()) {
      Alert.alert("Reply Required", "Please enter a reply before approving.");
      return;
    }
    setSubmittingReply(true);

    try {
      const authClient = supabase.auth as any;
      let officerId: string | undefined;

      if (typeof authClient.getUser === "function") {
        const { data, error } = await authClient.getUser();
        if (error) throw error;
        officerId = data?.user?.id;
      } else if (typeof authClient.getSession === "function") {
        const { data, error } = await authClient.getSession();
        if (error) throw error;
        officerId = data?.session?.user?.id;
      } else if (typeof authClient.user === "function") {
        officerId = authClient.user()?.id;
      } else if (typeof authClient.session === "function") {
        officerId = authClient.session()?.user?.id;
      }

      if (!officerId) {
        Alert.alert("Error", "Officer login not found. Please log in again.");
        return;
      }

      const { data: officerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", officerId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!officerProfile?.id) {
        Alert.alert(
          "Error",
          "Officer profile record not found in profiles table. Please contact admin."
        );
        return;
      }

      // 1. Insert reply into pest_officer_replies
      const { error: replyError } = await supabase
        .from("pest_officer_replies")
        .insert({
          feedback_id: replyTargetFeedback.id,
          officer_id: officerId,
          reply: replyText.trim(),
        });
      if (replyError) throw replyError;

      // 3. Update feedback status to approved
      const { error: statusError } = await supabase
        .from("pest_feedback")
        .update({ status: "approved" })
        .eq("id", replyTargetFeedback.id);
      if (statusError) throw statusError;

      // 4. Update local state
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === replyTargetFeedback.id ? { ...f, status: "approved" } : f
        )
      );
      if (selectedFeedback?.id === replyTargetFeedback.id) {
        setSelectedFeedback((prev) => (prev ? { ...prev, status: "approved" } : null));
      }

      setReplyModalVisible(false);
      setReplyText("");
      setReplyTargetFeedback(null);

      Alert.alert("Done ✅", "Feedback approved and reply sent to farmer!");
    } catch (error: any) {
      console.error("Approve with reply failed:", error);
      Alert.alert("Error", error.message || "Failed to approve feedback");
    } finally {
      setSubmittingReply(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedbacks();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const openDetail = (feedback: PestFeedback) => {
    setSelectedFeedback(feedback);
    setModalVisible(true);
  };

  // ── Feedback Card ──────────────────────────────────────────────────────────
  const renderCard = (feedback: PestFeedback) => {
    const cfg = STATUS_CONFIG[feedback.status];
    const StatusIcon = cfg.icon;
    const isUpdating = updatingId === feedback.id;

    return (
      <View key={feedback.id} style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.pestIconBox}>
              <Bug size={20} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.farmerRow}>
                <User size={11} color="#9ca3af" />
                <Text style={styles.farmerName} numberOfLines={1}>
                  {feedback.profiles?.full_name || "Unknown Farmer"}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <StatusIcon size={12} color={cfg.color} />
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.messagePreview} numberOfLines={2}>
          {feedback.message}
        </Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          {feedback.district && (
            <View style={styles.metaItem}>
              <MapPin size={12} color="#9ca3af" />
              <Text style={styles.metaText}>{feedback.district}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Calendar size={12} color="#9ca3af" />
            <Text style={styles.metaText}>{formatDate(feedback.created_at)}</Text>
          </View>
          {feedback.image_url && (
            <View style={styles.metaItem}>
              <ImageIcon size={12} color="#9ca3af" />
              <Text style={styles.metaText}>Image</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => openDetail(feedback)}
            activeOpacity={0.8}
          >
            <Eye size={13} color="#7c3aed" />
            <Text style={styles.viewBtnText}>Details</Text>
          </TouchableOpacity>

          {feedback.status !== "approved" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#10b981" }]}
              onPress={() => confirmStatusChange(feedback, "approved")}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle size={13} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {feedback.status !== "rejected" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ef4444" }]}
              onPress={() => confirmStatusChange(feedback, "rejected")}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <XCircle size={13} color="#fff" />
                  <Text style={styles.actionBtnText}>Reject</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ── Detail Modal ───────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selectedFeedback) return null;
    const cfg = STATUS_CONFIG[selectedFeedback.status];
    const StatusIcon = cfg.icon;
    const isUpdating = updatingId === selectedFeedback.id;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <LinearGradient
              colors={["#7c3aed", "#5b21b6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderRow}>
                <Bug size={18} color="#e9d5ff" />
                <Text style={styles.modalTitle}>Feedback Detail</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <X size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Current Status */}
              <View
                style={[
                  styles.modalStatusBadge,
                  { backgroundColor: cfg.bg, borderColor: cfg.border },
                ]}
              >
                <StatusIcon size={16} color={cfg.color} />
                <Text style={[styles.modalStatusText, { color: cfg.color }]}>
                  {cfg.label}
                </Text>
              </View>

              {/* Farmer Info */}
              <Text style={styles.modalSectionLabel}>Farmer Info</Text>
              <View style={styles.infoCard}>
                <InfoRow icon={<User size={15} color="#7c3aed" />} label="Name" value={selectedFeedback.profiles?.full_name || "Unknown"} />
                <View style={styles.infoDivider} />
                <InfoRow icon={<MapPin size={15} color="#7c3aed" />} label="District" value={selectedFeedback.district || "N/A"} />
                <View style={styles.infoDivider} />
                <InfoRow icon={<Calendar size={15} color="#7c3aed" />} label="Date" value={formatDate(selectedFeedback.created_at)} />
              </View>

              {/* Message */}
              <Text style={styles.modalSectionLabel}>Message</Text>
              <View style={styles.messageBox}>
                <MessageSquare size={16} color="#7c3aed" />
                <Text style={styles.messageBoxText}>{selectedFeedback.message}</Text>
              </View>

              {/* Image */}
              {selectedFeedback.image_url && (
                <>
                  <Text style={styles.modalSectionLabel}>Attached Image</Text>
                  <Image
                    source={{ uri: selectedFeedback.image_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                </>
              )}

              {/* Status Change Actions */}
              <View style={styles.modalActions}>
                {selectedFeedback.status === "pending" && (
                  <>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, { backgroundColor: "#10b981" }]}
                      onPress={() => confirmStatusChange(selectedFeedback, "approved")}
                      disabled={isUpdating}
                      activeOpacity={0.85}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <CheckCircle size={18} color="#fff" />
                          <Text style={styles.modalActionText}>Approve Feedback</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, { backgroundColor: "#ef4444" }]}
                      onPress={() => confirmStatusChange(selectedFeedback, "rejected")}
                      disabled={isUpdating}
                      activeOpacity={0.85}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <XCircle size={18} color="#fff" />
                          <Text style={styles.modalActionText}>Reject Feedback</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {selectedFeedback.status === "approved" && (
                  <>
                    <View style={[styles.doneBox, { backgroundColor: "#f0fdf4" }]}>
                      <CheckCircle size={16} color="#10b981" />
                      <Text style={[styles.doneText, { color: "#10b981" }]}>
                        This feedback has been approved
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, { backgroundColor: "#ef4444" }]}
                      onPress={() => confirmStatusChange(selectedFeedback, "rejected")}
                      disabled={isUpdating}
                      activeOpacity={0.85}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <XCircle size={18} color="#fff" />
                          <Text style={styles.modalActionText}>Change to Rejected</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}

                {selectedFeedback.status === "rejected" && (
                  <>
                    <View style={[styles.doneBox, { backgroundColor: "#fef2f2" }]}>
                      <XCircle size={16} color="#ef4444" />
                      <Text style={[styles.doneText, { color: "#ef4444" }]}>
                        This feedback has been rejected
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.modalActionBtn, { backgroundColor: "#10b981" }]}
                      onPress={() => confirmStatusChange(selectedFeedback, "approved")}
                      disabled={isUpdating}
                      activeOpacity={0.85}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <CheckCircle size={18} color="#fff" />
                          <Text style={styles.modalActionText}>Change to Approved</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ── Reply Modal ────────────────────────────────────────────────────────────
  const renderReplyModal = () => (
    <Modal
      visible={replyModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setReplyModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: "60%" }]}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderRow}>
              <CheckCircle size={18} color="#d1fae5" />
              <Text style={styles.modalTitle}>Approve & Reply</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setReplyModalVisible(false)}
              >
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={{ padding: 20 }}>
            <Text style={styles.modalSectionLabel}>Farmer</Text>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1f2937", marginBottom: 16 }}>
              {replyTargetFeedback?.profiles?.full_name || "Unknown Farmer"}
            </Text>

            <Text style={styles.modalSectionLabel}>Your Reply to Farmer</Text>
            <TextInput
              style={styles.replyInput}
              placeholder="Write your reply here..."
              placeholderTextColor="#9ca3af"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.modalActionBtn,
                { backgroundColor: submittingReply ? "#6ee7b7" : "#10b981", marginTop: 16 },
              ]}
              onPress={handleApproveWithReply}
              disabled={submittingReply}
              activeOpacity={0.85}
            >
              {submittingReply ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CheckCircle size={18} color="#fff" />
                  <Text style={styles.modalActionText}>Send Reply & Approve</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ── Main Render ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7c3aed" />

      {/* Header */}
      <LinearGradient
        colors={["#7c3aed", "#5b21b6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Bug size={18} color="#e9d5ff" />
            <Text style={styles.headerTitle}>Admin Pest Forum</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
            <RefreshCw size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Farmer pest feedback management</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Summary */}
          <View style={styles.summaryRow}>
            {[
              { num: summary.total, label: "Total", color: "#7c3aed", bg: "#ede9fe" },
              { num: summary.pending, label: "Pending", color: "#f59e0b", bg: "#fffbeb" },
              { num: summary.approved, label: "Approved", color: "#10b981", bg: "#f0fdf4" },
              { num: summary.rejected, label: "Rejected", color: "#ef4444", bg: "#fef2f2" },
            ].map((s) => (
              <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
                <Text style={[styles.summaryNum, { color: s.color }]}>{s.num}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Search size={16} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search pest, farmer, district..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <X size={15} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}
                >
                  {f.label}
                  {f.key !== "all" &&
                    ` (${feedbacks.filter((fb) => fb.status === f.key).length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Card List */}
          {loading ? (
            <View style={styles.centeredBox}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.centeredText}>Loading feedbacks...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centeredBox}>
              <Bug size={52} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No feedbacks found</Text>
              <Text style={styles.emptySubtitle}>
                {search || activeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No farmer feedbacks submitted yet"}
              </Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {filtered.map((fb) => renderCard(fb))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>

      {renderModal()}
      {renderReplyModal()}
    </View>
  );
};

// ── Helper Component ──────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    {icon}
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 12,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerSub: { textAlign: "center", fontSize: 12, color: "#e9d5ff", fontWeight: "500" },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20, paddingHorizontal: 16 },

  // Summary
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1, borderRadius: 14, paddingVertical: 12,
    alignItems: "center", justifyContent: "center",
  },
  summaryNum: { fontSize: 22, fontWeight: "800" },
  summaryLabel: { fontSize: 9, color: "#6b7280", fontWeight: "600", marginTop: 2 },

  // Search
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#fff", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: "#e5e7eb",
    marginBottom: 12, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1f2937" },

  // Filters
  filterRow: { gap: 8, paddingBottom: 16, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb",
  },
  filterChipActive: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  filterTextActive: { color: "#fff" },

  // Cards
  cardList: { gap: 12 },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "#e5e7eb",
    elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginRight: 8,
  },
  pestIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#ede9fe", justifyContent: "center", alignItems: "center",
  },
  farmerRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  farmerName: { fontSize: 12, color: "#9ca3af", fontWeight: "500" },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  messagePreview: { fontSize: 13, color: "#4b5563", lineHeight: 18, marginBottom: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: "#9ca3af", fontWeight: "500" },
  cardActions: {
    flexDirection: "row", gap: 8,
    borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12,
  },
  viewBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, paddingVertical: 9,
    borderRadius: 10, backgroundColor: "#ede9fe",
  },
  viewBtnText: { fontSize: 12, fontWeight: "700", color: "#7c3aed" },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 10,
  },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  // Loading / Empty
  centeredBox: { paddingVertical: 60, alignItems: "center", gap: 12 },
  centeredText: { fontSize: 14, color: "#9ca3af", fontWeight: "500" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#6b7280", marginTop: 8 },
  emptySubtitle: { fontSize: 13, color: "#9ca3af", textAlign: "center" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28,
    borderTopRightRadius: 28, maxHeight: height * 0.9, overflow: "hidden",
  },
  modalHeader: { paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20 },
  modalHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: "#fff" },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  modalContent: { paddingHorizontal: 20, paddingTop: 20 },
  modalStatusBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    alignSelf: "flex-start", paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 20,
  },
  modalStatusText: { fontSize: 14, fontWeight: "700" },
  modalSectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#7c3aed",
    marginBottom: 8, marginTop: 4,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  infoCard: {
    backgroundColor: "#f8fafc", borderRadius: 14,
    paddingHorizontal: 16, borderWidth: 1,
    borderColor: "#e5e7eb", marginBottom: 16,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  infoLabel: { fontSize: 12, color: "#9ca3af", fontWeight: "500", width: 65 },
  infoValue: { flex: 1, fontSize: 13, fontWeight: "600", color: "#1f2937" },
  infoDivider: { height: 1, backgroundColor: "#f1f5f9" },
  messageBox: {
    flexDirection: "row", gap: 10, backgroundColor: "#f8fafc",
    borderRadius: 14, padding: 16, borderWidth: 1,
    borderColor: "#e5e7eb", marginBottom: 16,
  },
  messageBoxText: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 20 },
  modalImage: {
    width: "100%", height: 200, borderRadius: 14,
    borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 16,
  },
  modalActions: { gap: 10, marginTop: 8 },
  modalActionBtn: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
  },
  modalActionText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  doneBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14, borderRadius: 12, justifyContent: "center",
  },
  doneText: { fontSize: 13, fontWeight: "600" },

  replyInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    fontSize: 14,
    color: "#1f2937",
    minHeight: 120,
  },
});

export default AdminPestForum;
