/**
 * My Advice Requests Screen (Farmer View)
 * Allows farmers to view their advice requests and officer responses
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
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageSquare,
    Leaf,
    TrendingUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import {
    listAdviceRequests,
    AdviceRequest,
    AdviceRequestFilters,
} from "../../services/adviceRequestApi";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<YieldPredictionStackParamList>;

const MyAdviceRequestsScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { language: lang } = useLanguage();
    const { user } = useApp();
    const language: "si" | "en" = lang === "sinhala" ? "si" : "en";

    const [requests, setRequests] = useState<AdviceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const content = {
        si: {
            title: "මගේ උපදේශ ඉල්ලීම්",
            subtitle: "නිලධාරීන්ගෙන් උපදේශ ලබා ගන්න",
            pending: "බලාපොරොත්තු",
            inProgress: "ක්‍රියාත්මක",
            completed: "සම්පූර්ණ",
            noRequests: "ඉල්ලීම් නොමැත",
            noRequestsDesc: "ඔබ තවම උපදේශ ඉල්ලීමක් කර නැත",
            viewDetails: "විස්තර බලන්න",
            yieldEnhancement: "අස්වැන්න වැඩිදියුණු",
            seedVariety: "බීජ තෝරාගැනීම",
            both: "දෙකම",
            ago: "පෙර",
            hours: "පැය",
            days: "දින",
            minutes: "මිනිත්තු",
            responded: "ප්‍රතිචාර දක්වා ඇත",
            notResponded: "තවම ප්‍රතිචාර දක්වා නැත",
        },
        en: {
            title: "My Advice Requests",
            subtitle: "Get advice from agricultural officers",
            pending: "Pending",
            inProgress: "In Progress",
            completed: "Completed",
            noRequests: "No Requests",
            noRequestsDesc: "You haven't requested any advice yet",
            viewDetails: "View Details",
            yieldEnhancement: "Yield Enhancement",
            seedVariety: "Seed Selection",
            both: "Both",
            ago: "ago",
            hours: "hours",
            days: "days",
            minutes: "minutes",
            responded: "Responded",
            notResponded: "Still Not Responded",
        },
    };

    const t = content[language];

    const fetchData = useCallback(async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const filters: AdviceRequestFilters = {};
            // Add farmer_id filter for farmer role
            if (user?.id) {
                filters.farmer_id = user.id;
            }

            console.log('🔍 Fetching with filters:', filters);
            const result = await listAdviceRequests(filters, 1, 50);
            console.log('📦 Received result:', result);
            
            // Safely handle the response
            if (result && result.requests && Array.isArray(result.requests)) {
                setRequests(result.requests);
                console.log(`✅ Set ${result.requests.length} requests`);
            } else {
                console.warn('⚠️ Invalid response structure:', result);
                setRequests([]);
            }
        } catch (error: any) {
            console.error("❌ Failed to fetch advice requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} ${t.minutes} ${t.ago}`;
        } else if (diffHours < 24) {
            return `${diffHours} ${t.hours} ${t.ago}`;
        } else {
            return `${diffDays} ${t.days} ${t.ago}`;
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
            default:
                return "#6B7280";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock size={16} color="#F59E0B" />;
            case "in_progress":
                return <AlertCircle size={16} color="#3B82F6" />;
            case "completed":
                return <CheckCircle size={16} color="#10B981" />;
            default:
                return <Clock size={16} color="#6B7280" />;
        }
    };

    const renderRequestCard = (request: AdviceRequest) => {
        return (
            <View key={request.id} style={styles.requestCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.statusBadge}>
                        {getStatusIcon(request.status)}
                        <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                            {t[request.status as keyof typeof t] || request.status}
                        </Text>
                    </View>
                    <Text style={styles.timeAgo}>{formatTimeAgo(request.created_at)}</Text>
                </View>

                <Text style={styles.requestType}>
                    {request.request_type === "yield_enhancement"
                        ? t.yieldEnhancement
                        : request.request_type === "seed_variety"
                            ? t.seedVariety
                            : t.both}
                </Text>

                {request.variety && (
                    <View style={styles.detailRow}>
                        <Leaf size={14} color="#6B7280" />
                        <Text style={styles.detailText}>{request.variety}</Text>
                    </View>
                )}

                {request.predicted_yield_kg_ha && (
                    <View style={styles.detailRow}>
                        <TrendingUp size={14} color="#6B7280" />
                        <Text style={styles.detailText}>
                            {request.predicted_yield_kg_ha.toFixed(0)} kg/ha
                        </Text>
                    </View>
                )}

                {request.farmer_message && (
                    <View style={styles.messageContainer}>
                        <MessageSquare size={14} color="#6B7280" />
                        <Text style={styles.messageText} numberOfLines={2}>
                            {request.farmer_message}
                        </Text>
                    </View>
                )}

                {request.status === "completed" ? (
                    <View style={styles.responseIndicator}>
                        <CheckCircle size={14} color="#10B981" />
                        <Text style={styles.responseText}>{t.responded}</Text>
                    </View>
                ) : (
                    <View style={styles.notRespondedIndicator}>
                        <AlertCircle size={14} color="#EF4444" />
                        <Text style={styles.notRespondedText}>{t.notResponded}</Text>
                    </View>
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
                        <ArrowLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{t.title}</Text>
                        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                    </View>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#10B981" />
                    </View>
                ) : requests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MessageSquare size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>{t.noRequests}</Text>
                        <Text style={styles.emptyDesc}>{t.noRequestsDesc}</Text>
                    </View>
                ) : (
                    requests.map((request) => renderRequestCard(request))
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
        padding: 8,
    },
    headerTextContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#FFFFFF",
        opacity: 0.9,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
    },
    requestCard: {
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
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    timeAgo: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    requestType: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },
    detailText: {
        fontSize: 13,
        color: "#6B7280",
    },
    messageContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
        backgroundColor: "#F9FAFB",
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
        marginBottom: 8,
    },
    messageText: {
        flex: 1,
        fontSize: 13,
        color: "#4B5563",
        fontStyle: "italic",
    },
    responseIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ECFDF5",
        borderRadius: 6,
        padding: 8,
        marginBottom: 12,
    },
    responseText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#10B981",
    },
    notRespondedIndicator: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FEE2E2",
        borderRadius: 6,
        padding: 8,
        marginBottom: 12,
    },
    notRespondedText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#EF4444",
    },
    viewButton: {
        backgroundColor: "#10B981",
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: "center",
    },
    viewButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default MyAdviceRequestsScreen;
