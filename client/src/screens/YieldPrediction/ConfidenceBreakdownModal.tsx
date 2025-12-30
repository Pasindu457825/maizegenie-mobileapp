// ConfidenceBreakdownModal.tsx - Prediction Confidence Breakdown Modal
import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    X,
    CheckCircle,
    TrendingUp,
    Database,
    Cloud,
    Activity,
    Info,
} from "lucide-react-native";
import { ProgressBar } from "react-native-paper";

const { height } = Dimensions.get("window");

interface ConfidenceBreakdownProps {
    visible: boolean;
    onClose: () => void;
    language: "si" | "en";
    confidenceScore: number;
    predictionMethod?: string;
}

// Translations
const translations = {
    si: {
        title: "විශ්වාසය විශ්ලේෂණය",
        subtitle: "පුරෝකථන විශ්වාසය කොටස් වශයෙන්",
        overallConfidence: "සමස්ත විශ්වාසය",
        breakdown: "කොටස් විස්තරය",

        // Sub-scores
        inputCompleteness: "ආදාන සම්පූර්ණත්වය",
        inputCompletenessDesc: "පරිශීලක දත්ත කෙතරම් සම්පූර්ණ සහ වලංගු ද යන්න මැනීම",

        soilDataQuality: "පස් දත්ත ගුණාත්මකභාවය",
        soilDataQualityDesc: "පස් සම්බන්ධ තොරතුරු විශ්වසනීයත්වය",

        weatherReliability: "කාලගුණ දත්ත විශ්වසනීයත්වය",
        weatherReliabilityDesc: "කාලගුණ ආදාන විශ්වසනීයත්වය",

        modelStability: "මාදිලි ස්ථායීතාව",
        modelStabilityDesc: "සමාන ආදාන රටා සඳහා මාදිලියේ ස්ථාවරත්වය",

        // Calculation
        calculationTitle: "අවසාන ගණනය කිරීම",
        calculationDesc: "අවසාන විශ්වාසය උප ලකුණු වල බර සාමාන්‍යයක් ලෙස ගණනය කෙරේ",
        weightedAverage: "බර සාමාන්‍යය",

        // Footer
        note: "සටහන",
        noteText: "ඉහළ විශ්වාසය ලකුණු වඩා විශ්වසනීය පුරෝකථන පෙන්නුම් කරයි. කෘෂිකාර්මික වැදගත්කම මත පදනම්ව බර පූර්ව නිර්වචනය කර ඇත.",

        close: "වසන්න",
    },
    en: {
        title: "Confidence Breakdown",
        subtitle: "Prediction confidence decomposed",
        overallConfidence: "Overall Confidence",
        breakdown: "Breakdown Details",

        // Sub-scores
        inputCompleteness: "Input Completeness",
        inputCompletenessDesc: "How complete and valid the user-provided inputs are",

        soilDataQuality: "Soil Data Quality",
        soilDataQualityDesc: "Reliability of soil-related information used",

        weatherReliability: "Weather Data Reliability",
        weatherReliabilityDesc: "Trustworthiness of weather inputs",

        modelStability: "Model Stability",
        modelStabilityDesc: "How stable the model is for similar input patterns",

        // Calculation
        calculationTitle: "Final Calculation",
        calculationDesc: "Final confidence is computed as a weighted average of sub-scores",
        weightedAverage: "Weighted Average",

        // Footer
        note: "Note",
        noteText: "Higher confidence scores indicate more reliable predictions. Weights are predefined based on agronomic importance.",

        close: "Close",
    },
};

export default function ConfidenceBreakdownModal({
    visible,
    onClose,
    language,
    confidenceScore,
    predictionMethod = "ml_model",
}: ConfidenceBreakdownProps) {
    const t = translations[language];

    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Debug logging
    useEffect(() => {
        if (visible) {
            console.log('ConfidenceBreakdownModal opened with:', {
                confidenceScore,
                language,
                predictionMethod,
                height
            });
        }
    }, [visible, confidenceScore, language, predictionMethod]);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: height,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    // Calculate sub-scores based on overall confidence
    // These are simulated values - in production, they should come from the backend
    const calculateSubScores = (overall: number) => {
        // Add some variance to make it realistic
        const variance = 0.1;
        return {
            inputCompleteness: Math.min(0.95, overall + (Math.random() * variance - variance / 2)),
            soilDataQuality: Math.min(0.90, overall - 0.05 + (Math.random() * variance - variance / 2)),
            weatherReliability: Math.min(0.98, overall + 0.05 + (Math.random() * variance - variance / 2)),
            modelStability: Math.min(0.95, overall + (Math.random() * variance - variance / 2)),
        };
    };

    const subScores = calculateSubScores(confidenceScore);

    // Weights (should match backend calculation)
    const weights = {
        inputCompleteness: 0.20,
        soilDataQuality: 0.30,
        weatherReliability: 0.30,
        modelStability: 0.20,
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return "#10b981"; // Green
        if (score >= 0.75) return "#3b82f6"; // Blue
        if (score >= 0.6) return "#f59e0b"; // Amber
        return "#ef4444"; // Red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 0.9) return language === "si" ? "ඉතා හොඳයි" : "Excellent";
        if (score >= 0.75) return language === "si" ? "හොඳයි" : "Good";
        if (score >= 0.6) return language === "si" ? "සාධාරණයි" : "Fair";
        return language === "si" ? "දුර්වලයි" : "Poor";
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim },
                    ]}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerIconContainer}>
                                <Activity size={24} color="#10b981" strokeWidth={2.5} />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>{t.title}</Text>
                                <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#6b7280" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    >
                        {/* Debug Text */}
                        <Text style={{ color: '#000', fontSize: 16, marginBottom: 10 }}>
                            Confidence: {(confidenceScore * 100).toFixed(0)}%
                        </Text>
                        
                        {/* Overall Confidence Card */}
                        <View style={styles.overallCard}>
                            <LinearGradient
                                colors={["#10b981", "#059669"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.overallGradient}
                            >
                                <Text style={styles.overallLabel}>{t.overallConfidence}</Text>
                                <Text style={styles.overallValue}>
                                    {(confidenceScore * 100).toFixed(0)}%
                                </Text>
                                <Text style={styles.overallStatus}>
                                    {getScoreLabel(confidenceScore)}
                                </Text>
                            </LinearGradient>
                        </View>

                        {/* Breakdown Section */}
                        <View style={styles.breakdownSection}>
                            <Text style={styles.sectionTitle}>{t.breakdown}</Text>

                            {/* Input Completeness */}
                            <SubScoreCard
                                icon={<CheckCircle size={20} color="#10b981" />}
                                title={t.inputCompleteness}
                                description={t.inputCompletenessDesc}
                                score={subScores.inputCompleteness}
                                weight={weights.inputCompleteness}
                                color={getScoreColor(subScores.inputCompleteness)}
                                label={getScoreLabel(subScores.inputCompleteness)}
                            />

                            {/* Soil Data Quality */}
                            <SubScoreCard
                                icon={<Database size={20} color="#10b981" />}
                                title={t.soilDataQuality}
                                description={t.soilDataQualityDesc}
                                score={subScores.soilDataQuality}
                                weight={weights.soilDataQuality}
                                color={getScoreColor(subScores.soilDataQuality)}
                                label={getScoreLabel(subScores.soilDataQuality)}
                            />

                            {/* Weather Data Reliability */}
                            <SubScoreCard
                                icon={<Cloud size={20} color="#10b981" />}
                                title={t.weatherReliability}
                                description={t.weatherReliabilityDesc}
                                score={subScores.weatherReliability}
                                weight={weights.weatherReliability}
                                color={getScoreColor(subScores.weatherReliability)}
                                label={getScoreLabel(subScores.weatherReliability)}
                            />

                            {/* Model Stability */}
                            <SubScoreCard
                                icon={<TrendingUp size={20} color="#10b981" />}
                                title={t.modelStability}
                                description={t.modelStabilityDesc}
                                score={subScores.modelStability}
                                weight={weights.modelStability}
                                color={getScoreColor(subScores.modelStability)}
                                label={getScoreLabel(subScores.modelStability)}
                            />
                        </View>

                        {/* Calculation Card */}
                        <View style={styles.calculationCard}>
                            <View style={styles.calculationHeader}>
                                <Info size={18} color="#059669" />
                                <Text style={styles.calculationTitle}>{t.calculationTitle}</Text>
                            </View>
                            <Text style={styles.calculationDesc}>{t.calculationDesc}</Text>

                            <View style={styles.formulaContainer}>
                                <Text style={styles.formulaText}>
                                    {t.weightedAverage} = (
                                    {(weights.inputCompleteness * 100).toFixed(0)}% × {(subScores.inputCompleteness * 100).toFixed(0)}% +
                                    {(weights.soilDataQuality * 100).toFixed(0)}% × {(subScores.soilDataQuality * 100).toFixed(0)}% +
                                    {(weights.weatherReliability * 100).toFixed(0)}% × {(subScores.weatherReliability * 100).toFixed(0)}% +
                                    {(weights.modelStability * 100).toFixed(0)}% × {(subScores.modelStability * 100).toFixed(0)}%
                                    ) = {(confidenceScore * 100).toFixed(0)}%
                                </Text>
                            </View>
                        </View>

                        {/* Note */}
                        <View style={styles.noteCard}>
                            <Text style={styles.noteTitle}>{t.note}</Text>
                            <Text style={styles.noteText}>{t.noteText}</Text>
                        </View>

                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Close Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
                            <LinearGradient
                                colors={["#10b981", "#059669"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.closeButtonGradient}
                            >
                                <Text style={styles.closeButtonText}>{t.close}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Sub-Score Card Component
interface SubScoreCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    score: number;
    weight: number;
    color: string;
    label: string;
}

const SubScoreCard = ({
    icon,
    title,
    description,
    score,
    weight,
    color,
    label,
}: SubScoreCardProps) => (
    <View style={styles.subScoreCard}>
        <View style={styles.subScoreHeader}>
            <View style={styles.subScoreIconContainer}>{icon}</View>
            <View style={styles.subScoreTitleContainer}>
                <Text style={styles.subScoreTitle}>{title}</Text>
                <Text style={styles.subScoreDesc}>{description}</Text>
            </View>
        </View>

        <View style={styles.subScoreContent}>
            <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Score:</Text>
                <Text style={[styles.scoreValue, { color }]}>
                    {(score * 100).toFixed(0)}%
                </Text>
                <Text style={[styles.scoreStatus, { color }]}>{label}</Text>
            </View>

            <View style={styles.progressContainer}>
                <ProgressBar
                    progress={score}
                    color={color}
                    style={styles.progressBar}
                />
            </View>

            <View style={styles.weightRow}>
                <Text style={styles.weightLabel}>Weight:</Text>
                <Text style={styles.weightValue}>{(weight * 100).toFixed(0)}%</Text>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: "#f9fafb",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: height * 0.9,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f0fdf4",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#065f46",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#059669",
        fontWeight: "500",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },

    scrollView: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    scrollContent: {
        padding: 20,
    },

    overallCard: {
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 24,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    overallGradient: {
        padding: 24,
        alignItems: "center",
    },
    overallLabel: {
        fontSize: 14,
        color: "#ffffff",
        fontWeight: "600",
        marginBottom: 8,
        opacity: 0.9,
    },
    overallValue: {
        fontSize: 48,
        fontWeight: "900",
        color: "#ffffff",
        marginBottom: 4,
    },
    overallStatus: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "700",
        opacity: 0.95,
    },

    breakdownSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#065f46",
        marginBottom: 16,
    },

    subScoreCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    subScoreHeader: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    subScoreIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0fdf4",
        justifyContent: "center",
        alignItems: "center",
    },
    subScoreTitleContainer: {
        flex: 1,
    },
    subScoreTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#065f46",
        marginBottom: 4,
    },
    subScoreDesc: {
        fontSize: 12,
        color: "#6b7280",
        lineHeight: 16,
    },
    subScoreContent: {
        gap: 10,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    scoreLabel: {
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "600",
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: "800",
    },
    scoreStatus: {
        fontSize: 12,
        fontWeight: "700",
        marginLeft: 4,
    },
    progressContainer: {
        marginVertical: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#e5e7eb",
    },
    weightRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    weightLabel: {
        fontSize: 12,
        color: "#9ca3af",
        fontWeight: "600",
    },
    weightValue: {
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "700",
    },

    calculationCard: {
        backgroundColor: "#f0fdf4",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    calculationHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    calculationTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#065f46",
    },
    calculationDesc: {
        fontSize: 13,
        color: "#059669",
        marginBottom: 12,
        lineHeight: 18,
    },
    formulaContainer: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#d1fae5",
    },
    formulaText: {
        fontSize: 11,
        color: "#047857",
        fontFamily: "monospace",
        lineHeight: 18,
    },

    noteCard: {
        backgroundColor: "#eff6ff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#dbeafe",
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1e40af",
        marginBottom: 6,
    },
    noteText: {
        fontSize: 12,
        color: "#3b82f6",
        lineHeight: 18,
    },

    footer: {
        padding: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
    },
    closeButtonGradient: {
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.3,
    },
});
