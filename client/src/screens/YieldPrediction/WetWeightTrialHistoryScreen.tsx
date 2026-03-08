import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, Trash2, FileSpreadsheet } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wetYieldTrialService, WetYieldTrialRecord } from "../../services/wetYieldTrialService";
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "WetWeightTrialHistory">;

const T = {
    si: {
        title: "අත්හදා ඉතිහාසය",
        subtitle: "සුරකින ලද පුරෝකථන වාර්තා",
        empty: "කිසිදු වාර්තාවක් නොමැත. ප්‍රථමයෙන් පුරෝකථනයක් සුරකින්න.",
        exportCSV: "Excel බාගන්න",
        deleteAll: "සියල්ල මකන්න",
        deleteConfirm: "ඔබට මෙම වාර්තාව මැකීමට අවශ්‍යද?",
        deleteAllConfirm: "සියලු වාර්තා මැකීමට අවශ්‍යද?",
        yes: "ඔව්",
        cancel: "අවලංගු",
        trial: "අත්හදා",
        field: "ක්ෂේත්‍රය",
        replicate: "පුනරාවර්තනය",
        wetWeight: "තෙත් බර",
        totalYield: "මුළු අස්වැන්න",
        dryWeight: "ශු. බර",
        plotArea: "ඉඩම",
        loading: "පූරණය කරමින්...",
        error: "දෝෂය",
    },
    en: {
        title: "Trial History",
        subtitle: "Saved prediction records",
        empty: "No records yet. Save a prediction first.",
        exportCSV: "Export Excel",
        deleteAll: "Delete All",
        deleteConfirm: "Delete this record?",
        deleteAllConfirm: "Delete all records?",
        yes: "Yes",
        cancel: "Cancel",
        trial: "Trial",
        field: "Field",
        replicate: "Rep.",
        wetWeight: "Wet Wt.",
        totalYield: "Total Yield",
        dryWeight: "Dry Wt.",
        plotArea: "Area",
        loading: "Loading...",
        error: "Error",
    },
};

export default function WetWeightTrialHistoryScreen() {
    const navigation = useNavigation<NavProp>();
    const { language: lang } = useLanguage();
    const t = lang === "sinhala" ? T.si : T.en;

    const [records, setRecords] = useState<WetYieldTrialRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadRecords = useCallback(async () => {
        try {
            const data = await wetYieldTrialService.getTrialHistory();
            setRecords(data);
        } catch (e: any) {
            Alert.alert(t.error, e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadRecords(); }, [loadRecords]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadRecords();
    };

    const handleDelete = (id: string) => {
        Alert.alert(t.deleteConfirm, "", [
            { text: t.cancel, style: "cancel" },
            {
                text: t.yes,
                style: "destructive",
                onPress: async () => {
                    try {
                        await wetYieldTrialService.deleteTrialRecord(id);
                        setRecords((prev) => prev.filter((r) => r.id !== id));
                    } catch (e: any) {
                        Alert.alert(t.error, e.message);
                    }
                },
            },
        ]);
    };

    const handleDeleteAll = () => {
        if (records.length === 0) return;
        Alert.alert(t.deleteAllConfirm, "", [
            { text: t.cancel, style: "cancel" },
            {
                text: t.yes,
                style: "destructive",
                onPress: async () => {
                    try {
                        await Promise.all(records.map((r) => wetYieldTrialService.deleteTrialRecord(r.id!)));
                        setRecords([]);
                    } catch (e: any) {
                        Alert.alert(t.error, e.message);
                    }
                },
            },
        ]);
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = async () => {
        if (records.length === 0) return;
        setIsExporting(true);
        try {
            const header = [
                "Trial Name", "Field Block", "Replicate", "Plot No.", "Seed Variety",
                "Plant Height (cm)", "Cob Height (cm)", "Cob Wet Wt (g)", "Cob Length (cm)",
                "Seed Rows", "Plot Area (m\u00b2)",
                "Wet Weight (Kg/m\u00b2)", "Total Yield (Kg)",
                "Lower Bound", "Upper Bound", "Confidence (%)", "Confidence Label",
                "Date",
            ];
            const dataRows = records.map((r) => [
                r.trial_name ?? "",
                r.field_block_id ?? "",
                r.replicate_number ?? "",
                r.plot_number ?? "",
                r.seed_variety ?? "",
                r.plant_height_cm ?? "",
                r.cob_height_cm ?? "",
                r.cob_wet_weight_g ?? "",
                r.cob_length_cm ?? "",
                r.num_seed_rows ?? "",
                r.plot_area_m2 ?? "",
                r.predicted_wet_weight_field ?? "",
                r.total_plot_yield_kg ?? "",
                r.lower_bound ?? "",
                r.upper_bound ?? "",
                r.confidence_score ?? "",
                r.confidence_label ?? "",
                r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
            ]);

            const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
            ws["!cols"] = header.map(() => ({ wch: 18 }));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Trial History");

            const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
            const filename = `WetYield_TrialHistory_${Date.now()}.xlsx`;
            const fileUri = FileSystem.cacheDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: "Export Trial History",
                    UTI: "com.microsoft.excel.xlsx",
                });
            } else {
                Alert.alert("Exported", `Saved to ${fileUri}`);
            }
        } catch (e: any) {
            Alert.alert(t.error, e.message || "Export failed.");
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString(undefined, {
            day: "2-digit", month: "short", year: "2-digit",
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#10B981", "#0faa76ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerIconCircle}>
                        <Ionicons name="time-outline" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{t.title}</Text>
                        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                    </View>
                </View>

                {/* Action row */}
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerBtn} onPress={handleExportExcel} disabled={isExporting}>
                        {isExporting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <FileSpreadsheet size={16} color="#FFFFFF" />
                        )}
                        <Text style={styles.headerBtnText}>{t.exportCSV}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerBtn, styles.headerBtnDanger]} onPress={handleDeleteAll}>
                        <Trash2 size={16} color="#FCA5A5" />
                        <Text style={[styles.headerBtnText, { color: "#FCA5A5" }]}>{t.deleteAll}</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={styles.loadingText}>{t.loading}</Text>
                </View>
            ) : records.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="document-text-outline" size={64} color="#D1FAE5" />
                    <Text style={styles.emptyText}>{t.empty}</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10B981" />
                    }
                >
                    <Text style={styles.countLabel}>{records.length} records</Text>
                    {records.map((record) => (
                        <View key={record.id} style={styles.card}>
                            {/* Card header row */}
                            <View style={styles.cardTop}>
                                <View style={styles.cardTopLeft}>
                                    <Text style={styles.varietyTag}>{record.seed_variety}</Text>
                                    {record.trial_name && (
                                        <Text style={styles.trialName}>{record.trial_name}</Text>
                                    )}
                                </View>
                                <View style={styles.cardTopRight}>
                                    <Text style={styles.dateText}>{formatDate(record.created_at)}</Text>
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDelete(record.id!)}
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Field / Replicate row */}
                            {(record.field_block_id || record.replicate_number || record.plot_number) && (
                                <View style={styles.metaRow}>
                                    {record.field_block_id && (
                                        <Text style={styles.metaChip}>📍 {record.field_block_id}</Text>
                                    )}
                                    {record.replicate_number && (
                                        <Text style={styles.metaChip}>{record.replicate_number}</Text>
                                    )}
                                    {record.plot_number != null && (
                                        <Text style={styles.metaChip}>Plot {record.plot_number}</Text>
                                    )}
                                </View>
                            )}

                            {/* Prediction results */}
                            <View style={styles.resultsRow}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultValue}>
                                        {record.predicted_wet_weight_field.toFixed(3)}
                                    </Text>
                                    <Text style={styles.resultLabel}>{t.wetWeight} (Kg/m²)</Text>
                                </View>
                                {record.total_plot_yield_kg != null && (
                                    <View style={styles.resultItem}>
                                        <Text style={[styles.resultValue, { color: "#10B981" }]}>
                                            {record.total_plot_yield_kg.toFixed(2)} Kg
                                        </Text>
                                        <Text style={styles.resultLabel}>{t.totalYield}</Text>
                                    </View>
                                )}
                                {record.plot_area_m2 != null && (
                                    <View style={styles.resultItem}>
                                        <Text style={[styles.resultValue, { color: "#6B7280" }]}>
                                            {record.plot_area_m2} m²
                                        </Text>
                                        <Text style={styles.resultLabel}>{t.plotArea}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Confidence */}
                            {record.confidence_score != null && (
                                <View style={styles.confidenceRow}>
                                    <View style={styles.confBarTrack}>
                                        <View
                                            style={[
                                                styles.confBarFill,
                                                {
                                                    width: `${record.confidence_score}%`,
                                                    backgroundColor:
                                                        record.confidence_score >= 85
                                                            ? "#10B981"
                                                            : record.confidence_score >= 70
                                                            ? "#F59E0B"
                                                            : "#EF4444",
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.confText}>
                                        {record.confidence_score.toFixed(1)}%
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        paddingTop: 52,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    backButton: { padding: 4 },
    headerIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF", marginBottom: 2 },
    headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
    headerActions: { flexDirection: "row", gap: 10 },
    headerBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
    },
    headerBtnDanger: { backgroundColor: "rgba(239,68,68,0.2)" },
    headerBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, padding: 40 },
    loadingText: { fontSize: 15, color: "#6B7280" },
    emptyText: { fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22 },
    scrollView: { flex: 1 },
    countLabel: {
        fontSize: 13,
        color: "#9CA3AF",
        fontWeight: "500",
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 14,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    cardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardTopLeft: { flex: 1, gap: 2 },
    cardTopRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    varietyTag: {
        fontSize: 15,
        fontWeight: "700",
        color: "#065F46",
        backgroundColor: "#D1FAE5",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    trialName: { fontSize: 13, color: "#6B7280", marginTop: 2 },
    dateText: { fontSize: 12, color: "#9CA3AF" },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
    },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
    metaChip: {
        backgroundColor: "#F3F4F6",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        fontSize: 12,
        color: "#4B5563",
        fontWeight: "500",
    },
    resultsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    resultItem: { minWidth: 70 },
    resultValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
    },
    resultLabel: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
    confidenceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
    confBarTrack: {
        flex: 1,
        height: 5,
        backgroundColor: "#F3F4F6",
        borderRadius: 3,
        overflow: "hidden",
    },
    confBarFill: { height: "100%", borderRadius: 3 },
    confText: { fontSize: 11, color: "#9CA3AF", width: 38, textAlign: "right" },
});
