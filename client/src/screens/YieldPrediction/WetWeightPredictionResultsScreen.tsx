import React, { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, TrendingUp, Save, History, Info } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../context/LanguageContext";
import { wetYieldTrialService } from "../../services/wetYieldTrialService";

const T = {
    si: {
        headerTitle: "පුරෝකථන ෆලය",
        headerSubtitle: "තෙත් බර අස්වැන්න විශ්ලෙෂනය",
        resultLabel: "තෙත් බර (Kg/m²)",
        totalYieldLabel: "කුඩා ඉඩම් මුළු අස්වැන්න",
        excellent: "අති උසස්",
        good: "හොඳ",
        fair: "සාමාන්‍ය",
        poor: "අඩු",
        trialInfo: "අත්හදා තොරතුරු",
        predictionRange: "පුරෝකථන පරාසය (95%)",
        predictionRangeSub: "සැබෑ අගය මෙම පරාසය තුළ",
        modelConfidence: "ආදර්ශ විශ්වාසය",
        basedOn: "පදනම: Test R²",
        rmseNote: "Test RMSE ±{rmse} Kg/m²",
        inputSummary: "ආදාන සාරාංශය",
        newPrediction: "නව පුරෝකථනයක්",
        saveRecord: "වාර්තාව සුරකින්න",
        saving: "සුරකිමින්...",
        saved: "සුරකිනා ලදි!",
        compareVarieties: "ප්‍රභේද සංසන්දනය",
        trialHistory: "අත්හදා ඉතිහාසය",
        trial: "අත්හදා",
        field: "ක්ෂේත්‍රය",
        variety: "බීජ ප්‍රභේදය",
        plantHeight: "ශාක උස",
        cobHeight: "මිදුළු උස",
        cobWeight: "මිදුළු බර",
        cobLength: "මිදුළු දිග",
        seedRows: "බීජ පේළි",
        plotArea: "කුඩා ඉඩම්",
        cobRatio: "මිදුළු/ශාක",
        weightPerRow: "පේළි බර",
        saveSuccess: "වාර්තාව ඉතිහාසයට සුරකිනා ලදි",
        saveError: "වාර්තාව සුරැකීමේ දෝෂය",
        exportExcel: "Excel බාගන්න",
    },
    en: {
        headerTitle: "Prediction Results",
        headerSubtitle: "Wet Weight Yield Analysis",
        resultLabel: "Wet Weight (Kg/m²)",
        totalYieldLabel: "Total Plot Yield",
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        poor: "Poor",
        trialInfo: "Trial Information",
        predictionRange: "Prediction Range (95%)",
        predictionRangeSub: "Likely true value within this range",
        modelConfidence: "Model Confidence",
        basedOn: "Based on Test R²",
        rmseNote: "Test RMSE ±{rmse} Kg/m²",
        inputSummary: "Input Summary",
        newPrediction: "New Prediction",
        saveRecord: "Save Record",
        saving: "Saving...",
        saved: "Saved!",
        compareVarieties: "Compare Varieties",
        trialHistory: "Trial History",
        trial: "Trial",
        field: "Field",
        variety: "Seed Variety",
        plantHeight: "Plant Height",
        cobHeight: "Cob Height",
        cobWeight: "Cob Weight",
        cobLength: "Cob Length",
        seedRows: "Seed Rows",
        plotArea: "Plot Area",
        cobRatio: "Cob/Plant Ratio",
        weightPerRow: "Weight per Row",
        saveSuccess: "Record saved to trial history",
        saveError: "Failed to save record",
        exportExcel: "Export Excel",
    },
};

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "WetWeightPredictionResults">;

const WetWeightPredictionResultsScreen = () => {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { data, meta } = route.params as { data: any; meta?: any };
    const { language: lang } = useLanguage();
    const t = lang === "sinhala" ? T.si : T.en;
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const wetWeight = data.predicted_wet_weight_field as number;
    const plotArea = meta?.plot_area_m2 as number | undefined;
    const totalPlotYield = plotArea ? wetWeight * plotArea : undefined;
    const lowerBound = (data.lower_bound ?? wetWeight - 0.225) as number;
    const upperBound = (data.upper_bound ?? wetWeight + 0.225) as number;
    const confidenceScore = (data.confidence_score ?? 94) as number;
    const confidenceLabel = (data.confidence_label ?? "High") as string;
    const modelRmse = (data.model_rmse ?? 0.115) as number;
    const modelR2 = (data.model_r2 ?? 0.94) as number;

    const getConfidenceColor = (score: number) => {
        if (score >= 90) return "#10B981";
        if (score >= 80) return "#3B82F6";
        if (score >= 70) return "#F59E0B";
        return "#DC2626";
    };

    const confidenceColor = getConfidenceColor(confidenceScore);

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const plotArea = meta?.plot_area_m2 as number | undefined;
            const totalYield = plotArea ? wetWeight * plotArea : undefined;

            const rows = [
                ["Field", "Value"],
                ["Trial / Season Name", meta?.trial_name ?? ""],
                ["Field Block ID", meta?.field_block_id ?? ""],
                ["Replicate", meta?.replicate_number ?? ""],
                ["Plot Number", meta?.plot_number ?? ""],
                ["Seed Variety", data.input_summary?.seed_variety ?? ""],
                ["", ""],
                ["--- Inputs ---", ""],
                ["Plant Height (cm)", data.input_summary?.plant_height_cm ?? ""],
                ["Cob Height (cm)", data.input_summary?.cob_height_cm ?? ""],
                ["Cob Wet Weight (g)", data.input_summary?.cob_wet_weight_g ?? ""],
                ["Cob Length (cm)", data.input_summary?.cob_length_cm ?? ""],
                ["Seed Rows", data.input_summary?.num_seed_rows ?? ""],
                ["Cob-to-Plant Ratio", data.input_summary?.cob_to_plant_ratio ?? ""],
                ["Weight per Row (g)", data.input_summary?.weight_per_row ?? ""],
                ["Plot Area (m²)", plotArea ?? ""],
                ["", ""],
                ["--- Results ---", ""],
                ["Predicted Wet Weight (Kg/m²)", wetWeight.toFixed(4)],
                ["Total Plot Yield (Kg)", totalYield !== undefined ? totalYield.toFixed(2) : ""],
                ["95% Lower Bound (Kg/m²)", lowerBound.toFixed(4)],
                ["95% Upper Bound (Kg/m²)", upperBound.toFixed(4)],
                ["", ""],
                ["--- Model ---", ""],
                ["Model Confidence (%)", confidenceScore.toFixed(1)],
                ["Confidence Label", confidenceLabel],
                ["Test R²", modelR2.toFixed(4)],
                ["Test RMSE (Kg/m²)", modelRmse.toFixed(4)],
            ];

            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws["!cols"] = [{ wch: 32 }, { wch: 24 }];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Wet Yield Result");

            const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
            const trialTag = meta?.trial_name ? `_${meta.trial_name.replace(/\s+/g, "_")}` : "";
            const filename = `WetYield${trialTag}_${Date.now()}.xlsx`;
            const fileUri = FileSystem.cacheDirectory + filename;

            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: "Export Wet Yield Result",
                    UTI: "com.microsoft.excel.xlsx",
                });
            } else {
                Alert.alert("Exported", `Saved to ${fileUri}`);
            }
        } catch (err: any) {
            Alert.alert("Export Error", err.message || "Could not export file.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await wetYieldTrialService.saveTrialRecord({
                trial_name: meta?.trial_name,
                field_block_id: meta?.field_block_id,
                replicate_number: meta?.replicate_number,
                plot_number: meta?.plot_number,
                seed_variety: meta?.seed_variety || data.input_summary?.seed_variety || "",
                plant_height_cm: data.input_summary?.plant_height_cm,
                cob_height_cm: data.input_summary?.cob_height_cm,
                cob_wet_weight_g: data.input_summary?.cob_wet_weight_g,
                cob_length_cm: data.input_summary?.cob_length_cm,
                num_seed_rows: data.input_summary?.num_seed_rows,
                plot_area_m2: plotArea,
                predicted_wet_weight_field: wetWeight,
                total_plot_yield_kg: totalPlotYield,
                confidence_score: confidenceScore,
                confidence_label: confidenceLabel,
                lower_bound: lowerBound,
                upper_bound: upperBound,
            });
            setIsSaved(true);
            Alert.alert("✅", t.saveSuccess);
        } catch (e: any) {
            Alert.alert(t.saveError, e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCompare = () => {
        navigation.navigate("WetWeightVarietyComparison", {
            baseInputs: {
                cob_height_cm: data.input_summary?.cob_height_cm,
                plant_height_cm: data.input_summary?.plant_height_cm,
                cob_wet_weight_g: data.input_summary?.cob_wet_weight_g,
                cob_length_cm: data.input_summary?.cob_length_cm,
                num_seed_rows: data.input_summary?.num_seed_rows,
                plot_area_m2: plotArea,
            },
            currentVariety: meta?.seed_variety || data.input_summary?.seed_variety || "",
            currentResult: wetWeight,
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
                        <Ionicons name="stats-chart-outline" size={26} color="#FFFFFF" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
                        <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Action bar: Save on left, View History on right */}
            <View style={styles.actionToolbar}>
                <TouchableOpacity
                    style={[styles.toolbarBtn, isSaved && styles.toolbarBtnSaved]}
                    onPress={handleSave}
                    disabled={isSaving || isSaved}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                        <Save size={16} color={isSaved ? "#10B981" : "#374151"} />
                    )}
                    <Text style={[styles.toolbarBtnText, isSaved && { color: "#10B981" }]}>
                        {isSaved ? t.saved : t.saveRecord}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={() => navigation.navigate("WetWeightTrialHistory")}
                >
                    <History size={16} color="#374151" />
                    <Text style={styles.toolbarBtnText}>{t.trialHistory}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Main prediction metrics card */}
                <View style={styles.resultCard}>
                    <View style={styles.metricsRow}>
                        {/* Primary metric */}
                        <View style={styles.primaryMetric}>
                            <View style={styles.resultIconContainer}>
                                <Ionicons name="stats-chart-outline" size={36} color="#10B981" />
                            </View>
                            <Text style={styles.resultLabel}>{t.resultLabel}</Text>
                            <Text style={styles.resultValue}>{wetWeight.toFixed(4)}</Text>
                        </View>

                        {/* Right side: Confidence score + optional Total Plot Yield */}
                        <View style={styles.secondaryMetrics}>
                            {/* Confidence score chip with info toggle */}
                            <TouchableOpacity
                                style={[styles.secondaryMetric, { borderColor: confidenceColor + "60", backgroundColor: confidenceColor + "12" }]}
                                onPress={() => setShowDetails(v => !v)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.confidenceChipRow}>
                                    <TrendingUp size={16} color={confidenceColor} />
                                    <Info size={13} color={confidenceColor} style={{ marginLeft: 2 }} />
                                </View>
                                <Text style={[styles.secondaryValue, { color: confidenceColor }]}>
                                    {confidenceScore.toFixed(0)}%
                                </Text>
                                <Text style={[styles.secondaryLabel, { color: confidenceColor }]}>
                                    {t.modelConfidence}
                                </Text>
                                <Text style={[styles.confidenceChipLabel, { color: confidenceColor }]}>
                                    {confidenceLabel}
                                </Text>
                            </TouchableOpacity>

                            {/* Total Plot Yield */}
                            {totalPlotYield !== undefined && (
                                <View style={styles.secondaryMetric}>
                                    <Ionicons name="leaf-outline" size={20} color="#10B981" />
                                    <Text style={styles.secondaryValue}>{totalPlotYield.toFixed(2)} Kg</Text>
                                    <Text style={styles.secondaryLabel}>{t.totalYieldLabel}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                
                {/* Collapsible: Prediction Range + Model Confidence — shown on info tap */}
                {showDetails && (
                    <>
                        {/* Prediction Range (95%) */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="analytics-outline" size={20} color="#6366F1" />
                                <Text style={styles.cardTitle}>{t.predictionRange}</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>{t.predictionRangeSub}</Text>
                            <View style={styles.rangeRow}>
                                <Text style={styles.rangeBound}>{lowerBound.toFixed(3)}</Text>
                                <View style={styles.rangeBarOuter}>
                                    <View style={styles.rangeBarInner}>
                                        <View
                                            style={[
                                                styles.rangeMarker,
                                                {
                                                    left: `${Math.min(Math.max(((wetWeight - lowerBound) / (upperBound - lowerBound)) * 100, 2), 98)}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.rangeBound}>{upperBound.toFixed(3)}</Text>
                            </View>
                            <Text style={styles.rangeCenterLabel}>▲ {wetWeight.toFixed(4)} Kg/m²</Text>
                        </View>

                        {/* Model Confidence */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <TrendingUp size={20} color={confidenceColor} />
                                <Text style={styles.cardTitle}>{t.modelConfidence}</Text>
                            </View>
                            <View style={styles.confidenceBarContainer}>
                                <View
                                    style={[
                                        styles.confidenceBar,
                                        { width: `${confidenceScore}%`, backgroundColor: confidenceColor },
                                    ]}
                                />
                            </View>
                            <View style={styles.confidenceFootRow}>
                                <Text style={[styles.confidenceValue, { color: confidenceColor }]}>
                                    {confidenceScore.toFixed(1)}%  {confidenceLabel.toUpperCase()}
                                </Text>
                                <Text style={styles.confidenceNote}>
                                    {t.basedOn} = {modelR2.toFixed(2)}  •  {t.rmseNote.replace("{rmse}", modelRmse.toFixed(3))}
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Trial Info (if provided) */}
                {(meta?.trial_name || meta?.field_block_id || meta?.replicate_number) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="clipboard-outline" size={20} color="#10B981" />
                            <Text style={styles.cardTitle}>{t.trialInfo}</Text>
                        </View>
                        <View style={styles.trialRow}>
                            {meta?.trial_name && (
                                <View style={styles.trialItem}>
                                    <Text style={styles.trialLabel}>{t.trial}</Text>
                                    <Text style={styles.trialValue}>{meta.trial_name}</Text>
                                </View>
                            )}
                            {meta?.field_block_id && (
                                <View style={styles.trialItem}>
                                    <Text style={styles.trialLabel}>{t.field}</Text>
                                    <Text style={styles.trialValue}>
                                        {meta.field_block_id}{meta?.replicate_number ? ` · ${meta.replicate_number}` : ""}
                                    </Text>
                                </View>
                            )}
                            {meta?.seed_variety && (
                                <View style={styles.trialItem}>
                                    <Text style={styles.trialLabel}>{t.variety}</Text>
                                    <Text style={styles.trialValue}>{meta.seed_variety}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Input Summary */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Info size={20} color="#10B981" />
                        <Text style={styles.cardTitle}>{t.inputSummary}</Text>
                    </View>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.variety}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.seed_variety}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.plantHeight}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.plant_height_cm} cm</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.cobHeight}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.cob_height_cm} cm</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.cobWeight}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.cob_wet_weight_g} g</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.cobLength}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.cob_length_cm} cm</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.seedRows}</Text>
                            <Text style={styles.summaryValue}>{data.input_summary.num_seed_rows}</Text>
                        </View>
                        {plotArea && (
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>{t.plotArea}</Text>
                                <Text style={styles.summaryValue}>{plotArea} m²</Text>
                            </View>
                        )}
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.cobRatio}</Text>
                            <Text style={styles.summaryValue}>
                                {data.input_summary.cob_to_plant_ratio?.toFixed(3)}
                            </Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>{t.weightPerRow}</Text>
                            <Text style={styles.summaryValue}>
                                {data.input_summary.weight_per_row?.toFixed(2)} g
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        paddingTop: 52,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
    },
    actionToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    toolbarBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        backgroundColor: "#F0FDF4",
    },
    toolbarBtnSaved: {
        borderColor: "#10B981",
        backgroundColor: "#D1FAE5",
    },
    toolbarBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#065F46",
    },
    scrollView: {
        flex: 1,
    },
    resultCard: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        marginBottom: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    metricsRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    primaryMetric: {
        flex: 1,
        alignItems: "center",
    },
    secondaryMetrics: {
        width: 130,
        gap: 10,
    },
    secondaryMetric: {
        backgroundColor: "#F0FDF4",
        borderRadius: 10,
        padding: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    secondaryValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#065F46",
        marginTop: 4,
    },
    secondaryLabel: {
        fontSize: 10,
        color: "#6B7280",
        textAlign: "center",
        marginTop: 2,
    },
    confidenceChipRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
    confidenceChipLabel: {
        fontSize: 10,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 1,
    },
    resultIconContainer: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 2.5,
        borderColor: "#10B981",
    },
    resultLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 4,
        textAlign: "center",
    },
    resultValue: {
        fontSize: 38,
        fontWeight: "800",
        color: "#10B981",
        marginBottom: 8,
        textAlign: "center",
    },
    resultUnit: {
        fontSize: 20,
        color: "#6B7280",
    },
    qualityBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
    },
    qualityText: {
        fontSize: 13,
        fontWeight: "700",
    },
    trialRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 8,
    },
    trialItem: {
        flex: 1,
        minWidth: 90,
    },
    trialLabel: {
        fontSize: 11,
        color: "#6B7280",
        marginBottom: 2,
    },
    trialValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F2937",
    },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1F2937",
        marginLeft: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 16,
    },
    rangeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 10,
    },
    rangeBound: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        minWidth: 44,
    },
    rangeBarOuter: {
        flex: 1,
        height: 14,
        backgroundColor: "#EDE9FE",
        borderRadius: 7,
        overflow: "hidden",
    },
    rangeBarInner: {
        flex: 1,
        height: "100%",
        backgroundColor: "#6366F1",
        borderRadius: 7,
        position: "relative",
    },
    rangeMarker: {
        position: "absolute",
        top: -2,
        width: 4,
        height: 18,
        backgroundColor: "#1F2937",
        borderRadius: 2,
        marginLeft: -2,
    },
    rangeCenterLabel: {
        fontSize: 12,
        color: "#6366F1",
        fontWeight: "700",
        textAlign: "center",
        marginTop: 2,
    },
    confidenceBarContainer: {
        height: 10,
        backgroundColor: "#E5E7EB",
        borderRadius: 5,
        overflow: "hidden",
        marginBottom: 10,
    },
    confidenceBar: {
        height: "100%",
        borderRadius: 5,
    },
    confidenceFootRow: {
        gap: 4,
    },
    confidenceValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#6B7280",
    },
    confidenceNote: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 2,
    },
    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
    },
    summaryItem: {
        width: "50%",
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
    },
    featureList: {
        marginTop: 8,
    },
    featureItem: {
        marginBottom: 16,
    },
    featureName: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 6,
        fontWeight: "500",
    },
    featureBarContainer: {
        height: 8,
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4,
    },
    featureBar: {
        height: "100%",
        borderRadius: 4,
    },
    featureValue: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "right",
    },
    recommendationItem: {
        flexDirection: "row",
        marginBottom: 12,
        paddingVertical: 4,
    },
    recommendationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
        marginTop: 6,
        marginRight: 12,
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },
    bottomPadding: {
        height: 20,
    },
    footer: {
        padding: 12,
        paddingBottom: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    footerRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: "column",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
        gap: 4,
    },
    actionBtnSaved: {
        borderColor: "#A7F3D0",
        backgroundColor: "#F0FDF4",
    },
    actionBtnText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#374151",
        textAlign: "center",
    },
    newPredictionButton: {
        borderRadius: 12,
        overflow: "hidden",
    },
    buttonGradient: {
        flexDirection: "row",
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    newPredictionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default WetWeightPredictionResultsScreen;
