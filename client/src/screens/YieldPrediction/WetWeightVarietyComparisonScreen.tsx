import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, Trophy, GitCompare } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { wetYieldPredictionService } from "../../services/wetYieldPredictionService";
import { SEED_VARIETIES } from "../../types/wetYieldPrediction";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "WetWeightVarietyComparison">;

interface VarietyResult {
    variety: string;
    wet_weight: number;
    loading: boolean;
    error: boolean;
}

const T = {
    si: {
        title: "ප්‍රභේද සංසන්දනය",
        subtitle: "මෙම ක්ෂේත්‍ර අවස්ථා සඳහා හොඳම ප්‍රභේදය",
        loading: "සංසන්දනය කරමින්...",
        yourSelection: "ඔබේ තේරීම",
        best: "හොඳම",
        vsYourSelection: "ඔබේ තේරීමට සාපේක්ෂ",
    },
    en: {
        title: "Variety Comparison",
        subtitle: "Best variety for this plot's conditions",
        loading: "Running comparison...",
        yourSelection: "Your selection",
        best: "Best",
        vsYourSelection: "vs your selection",
    },
};

export default function WetWeightVarietyComparisonScreen() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const { baseInputs, currentVariety, currentResult } =
        route.params as YieldPredictionStackParamList["WetWeightVarietyComparison"];
    const { language: lang } = useLanguage();
    const t = lang === "sinhala" ? T.si : T.en;

    const allVarieties = SEED_VARIETIES.map((v) => v.name);
    const [results, setResults] = useState<VarietyResult[]>(
        allVarieties.map((v) => ({
            variety: v,
            wet_weight: v === currentVariety ? currentResult : 0,
            loading: v !== currentVariety,
            error: false,
        }))
    );
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        const runComparisons = async () => {
            const others = allVarieties.filter((v) => v !== currentVariety);

            await Promise.all(
                others.map(async (variety) => {
                    try {
                        const res = await wetYieldPredictionService.predictWetYield({
                            seed_variety: variety,
                            ...baseInputs,
                            num_seed_rows: baseInputs.num_seed_rows,
                        });
                        setResults((prev) =>
                            prev.map((r) =>
                                r.variety === variety
                                    ? { ...r, wet_weight: res.predicted_wet_weight_field, loading: false }
                                    : r
                            )
                        );
                    } catch {
                        setResults((prev) =>
                            prev.map((r) =>
                                r.variety === variety ? { ...r, loading: false, error: true } : r
                            )
                        );
                    }
                })
            );
            setIsRunning(false);
        };

        runComparisons();
    }, []);

    const sorted = [...results]
        .filter((r) => !r.loading && !r.error)
        .sort((a, b) => b.wet_weight - a.wet_weight);

    const bestWW = sorted[0]?.wet_weight || currentResult;
    const maxBar = bestWW * 1.1;

    const getRankColor = (index: number) => {
        if (index === 0) return "#F59E0B";
        if (index === 1) return "#9CA3AF";
        if (index === 2) return "#CD7C2F";
        return "#10B981";
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `${index + 1}.`;
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
                        <GitCompare size={22} color="#FFFFFF" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{t.title}</Text>
                        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {isRunning && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text style={styles.loadingText}>{t.loading}</Text>
                    </View>
                )}

                {/* Best variety banner */}
                {!isRunning && sorted.length > 0 && (
                    <View style={styles.bestBanner}>
                        <Trophy size={28} color="#F59E0B" />
                        <View style={styles.bestBannerText}>
                            <Text style={styles.bestBannerTitle}>
                                {t.best}: {sorted[0].variety}
                            </Text>
                            <Text style={styles.bestBannerSub}>
                                {sorted[0].wet_weight.toFixed(4)} Kg/m²
                                {sorted[0].variety !== currentVariety && (
                                    <Text style={styles.deltaText}>
                                        {"  "}+{(((sorted[0].wet_weight - currentResult) / currentResult) * 100).toFixed(0)}% {t.vsYourSelection}
                                    </Text>
                                )}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Ranked list */}
                <View style={styles.card}>
                    {sorted.map((item, index) => {
                        const barPct = (item.wet_weight / maxBar) * 100;
                        const isCurrent = item.variety === currentVariety;
                        const delta = ((item.wet_weight - currentResult) / currentResult) * 100;

                        return (
                            <View key={item.variety} style={[styles.row, isCurrent && styles.rowHighlight]}>
                                <Text style={styles.rankText}>{getRankIcon(index)}</Text>
                                <View style={styles.rowContent}>
                                    <View style={styles.rowTop}>
                                        <Text style={[styles.varietyName, isCurrent && styles.varietyNameCurrent]}>
                                            {item.variety}
                                        </Text>
                                        <View style={styles.rowRight}>
                                            <Text style={[styles.wetWeightText, { color: getRankColor(index) }]}>
                                                {item.wet_weight.toFixed(4)} Kg/m²
                                            </Text>
                                            {isCurrent && (
                                                <Text style={styles.yourSelectionBadge}>{t.yourSelection}</Text>
                                            )}
                                            {!isCurrent && delta !== 0 && (
                                                <Text style={[styles.deltaSmall, { color: delta > 0 ? "#DC2626" : "#10B981" }]}>
                                                    {delta > 0 ? "+" : ""}{delta.toFixed(0)}%
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.barTrack}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    width: `${barPct}%`,
                                                    backgroundColor: isCurrent ? "#10B981" : getRankColor(index) + "CC",
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* Still loading rows */}
                    {results.filter((r) => r.loading).map((item) => (
                        <View key={item.variety} style={styles.row}>
                            <ActivityIndicator size="small" color="#10B981" style={{ width: 24 }} />
                            <View style={styles.rowContent}>
                                <Text style={styles.varietyName}>{item.variety}</Text>
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, { width: "30%", backgroundColor: "#D1FAE5" }]} />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Input summary chip row */}
                <View style={styles.inputChips}>
                    <Text style={styles.inputChipsTitle}>Plant: {baseInputs.plant_height_cm} cm</Text>
                    <Text style={styles.inputChipsTitle}>Cob: {baseInputs.cob_height_cm} cm</Text>
                    <Text style={styles.inputChipsTitle}>Weight: {baseInputs.cob_wet_weight_g} g</Text>
                    {baseInputs.plot_area_m2 && (
                        <Text style={styles.inputChipsTitle}>Area: {baseInputs.plot_area_m2} m²</Text>
                    )}
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        paddingTop: 52,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
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
    scrollView: { flex: 1 },
    loadingCard: {
        margin: 20,
        padding: 28,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        alignItems: "center",
        gap: 12,
        elevation: 2,
    },
    loadingText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
    bestBanner: {
        margin: 20,
        marginBottom: 12,
        padding: 16,
        backgroundColor: "#FFFBEB",
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1.5,
        borderColor: "#FDE68A",
        elevation: 2,
    },
    bestBannerText: { flex: 1 },
    bestBannerTitle: { fontSize: 17, fontWeight: "700", color: "#92400E" },
    bestBannerSub: { fontSize: 14, color: "#B45309", marginTop: 2 },
    deltaText: { fontSize: 13, color: "#DC2626", fontWeight: "600" },
    card: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
        gap: 10,
    },
    rowHighlight: {
        backgroundColor: "#F0FDF4",
        marginHorizontal: -8,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderBottomWidth: 0,
        marginBottom: 2,
    },
    rankText: { fontSize: 18, width: 28, textAlign: "center" },
    rowContent: { flex: 1 },
    rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    varietyName: { fontSize: 14, fontWeight: "600", color: "#374151" },
    varietyNameCurrent: { color: "#065F46" },
    rowRight: { alignItems: "flex-end", gap: 2 },
    wetWeightText: { fontSize: 14, fontWeight: "700" },
    yourSelectionBadge: {
        fontSize: 10,
        color: "#10B981",
        fontWeight: "600",
        backgroundColor: "#D1FAE5",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    deltaSmall: { fontSize: 11, fontWeight: "600" },
    barTrack: {
        height: 7,
        backgroundColor: "#F3F4F6",
        borderRadius: 4,
        overflow: "hidden",
    },
    barFill: { height: "100%", borderRadius: 4 },
    inputChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 8,
    },
    inputChipsTitle: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 12,
        color: "#6B7280",
        fontWeight: "500",
    },
});
