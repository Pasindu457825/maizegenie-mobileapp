import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, MessageSquare, Mic, Send, AlertCircle, Sprout, CloudRain, Droplets } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../../context/AppContext";
import { growthStages, matchSymptoms, getWeatherAdvisory } from "../../../data/fertilizerKnowledgeBase";

const getApiUrl = () => {
    if (Platform.OS === "android") {
        return process.env.EXPO_PUBLIC_API_BASE;
    }
    return "http://localhost:8000";
};

const API_URL = getApiUrl();

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර උපදේශ",
        subtitle: "නීති පදනම් සහායක",
        mainLabel: "ඔබගේ වගා තත්ත්වය ඔබේ වචන වලින් කියන්න",
        placeholder: "උදාහරණයක් ලෙස:\n\n• දවස් 25ක් වගා කරලා. කොළ කහයි. වැස්ස අඩුයි.\n\n• මල් එන වෙලාව. කොළ අග දහනවා වගේ.\n\n• බිම වියලි. පැළ දුර්වලයි. මුල් දුර්වල.",
        quickTags: "ඉක්මන් උපකාර (විකල්ප):",
        analyze: "විශ්ලේෂණය කරන්න",
        analyzing: "විශ්ලේෂණය වෙමින්...",
        voiceInput: "හඬ ආදානය",
        howItWorks: "මෙය ක්‍රියා කරන්නේ කෙසේද?",
        howItWorksDesc: "ඔබේ වචන වලින් කියන්න. අපේ නීති පදනම් පද්ධතිය ඔබේ භාෂාව තේරුම් ගෙන DOA සහ CIC නිල දත්ත අනුව පොහොර නිර්දේශ ලබා දෙයි.",
        exampleRotate1: "දවස් 25ක් වගා කරලා. කොළ කහයි. වැස්ස අඩුයි.",
        exampleRotate2: "මල් එන වෙලාව. කොළ අග දහනවා වගේ.",
        exampleRotate3: "බිම වියලි. පැළ දුර්වලයි.",
    },
    en: {
        title: "Fertilizer Advisory",
        subtitle: "Rule-Based Assistant",
        mainLabel: "Describe your crop condition in your own words",
        placeholder: "For example:\n\n• 25 days planted. Leaves yellow. Less rain.\n\n• Flowering time. Leaf tips burning.\n\n• Soil dry. Plants weak.",
        quickTags: "Quick helpers (optional):",
        analyze: "Analyze",
        analyzing: "Analyzing...",
        voiceInput: "Voice Input",
        howItWorks: "How it works?",
        howItWorksDesc: "Describe in your words. Our rule-based system understands your language and provides DOA & CIC official fertilizer recommendations.",
        exampleRotate1: "25 days planted. Leaves yellow. Less rain.",
        exampleRotate2: "Flowering time. Leaf tips burning.",
        exampleRotate3: "Soil dry. Plants weak.",
    },
};

export default function RuleBasedAdvisoryInputScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const [language, setLanguage] = useState<Language>("en");
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedQuickTag, setSelectedQuickTag] = useState<string>("");
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    // Check if user is a farmer
    useEffect(() => {
        if (!user || user.role !== "farmer") {
            Alert.alert(
                language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
                language === "si" 
                    ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි."
                    : "This feature is only available for farmers.",
                [{
                    text: "OK",
                    onPress: () => navigation.goBack()
                }]
            );
        }
    }, [user, language, navigation]);

    // If not a farmer, show access denied screen
    if (!user || user.role !== "farmer") {
        return (
            <View style={styles.container}>
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
                            <ArrowLeft color="#ffffff" size={24} />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerTitle}>
                                {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>
                <View style={styles.accessDeniedContainer}>
                    <AlertCircle color="#ef4444" size={64} />
                    <Text style={styles.accessDeniedTitle}>
                        {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
                    </Text>
                    <Text style={styles.accessDeniedText}>
                        {language === "si" 
                            ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි. කරුණාකර ගොවි ගිණුමකින් පුරනය වන්න."
                            : "This feature is only available for farmers. Please log in with a farmer account."}
                    </Text>
                    <TouchableOpacity
                        style={styles.backButtonLarge}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>
                            {language === "si" ? "ආපසු යන්න" : "Go Back"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const t = content[language];

    // Rotate placeholder examples every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getRotatingPlaceholder = () => {
        const examples = [
            t.exampleRotate1,
            t.exampleRotate2,
            t.exampleRotate3,
        ];
        return examples[placeholderIndex];
    };

    const handleQuickTag = (tag: string) => {
        setSelectedQuickTag(tag);
        // Optionally append to input
        if (inputText && !inputText.includes(tag)) {
            setInputText(inputText + " " + tag);
        } else if (!inputText) {
            setInputText(tag);
        }
    };

    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "කරුණාකර ඔබේ වගාවේ තත්ත්වය විස්තර කරන්න"
                    : "Please describe your crop condition"
            );
            return;
        }

        setLoading(true);

        try {
            // Rule-Based: Send raw farmer text for backend to infer everything
            const payload = {
                farmer_input: inputText,
                language: language,
                // Backend will infer: growth_stage, symptoms, weather, deficiencies
            };

            const response = await fetch(`${API_URL}/api/v1/rule-based-advisory/analyze`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                navigation.navigate("RuleBasedAdvisoryResultsScreen", {
                    data: {
                        ...result,
                        farmer_input: inputText,
                    },
                    language,
                });
            } else {
                Alert.alert(
                    language === "si" ? "දෝෂයකි" : "Error",
                    result.detail || "Analysis failed"
                );
            }
        } catch (error) {
            console.error("Analysis error:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si"
                    ? "විශ්ලේෂණය අසාර්ථක විය"
                    : "Analysis failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const useExample = (example: string) => {
        setInputText(example);
    };

    return (
        <View style={styles.container}>
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
                        <ArrowLeft color="#ffffff" size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{t.title}</Text>
                        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.langButton}
                        onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
                    >
                        <Text style={styles.langText}>
                            {language === "si" ? "EN" : "සිං"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoCard}>
                    <MessageSquare color="#10b981" size={24} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>{t.howItWorks}</Text>
                        <Text style={styles.infoDesc}>{t.howItWorksDesc}</Text>
                    </View>
                </View>

                {/* PRIMARY RULE-BASED INPUT */}
                <View style={styles.inputSection}>
                    <View style={styles.labelWithIcon}>
                        <MessageSquare color="#10b981" size={20} />
                        <Text style={styles.mainLabel}>{t.mainLabel}</Text>
                    </View>
                    <TextInput
                        style={styles.textInputLarge}
                        placeholder={getRotatingPlaceholder()}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={8}
                        value={inputText}
                        onChangeText={setInputText}
                        textAlignVertical="top"
                    />
                </View>

                {/* OPTIONAL QUICK TAGS (not mandatory) */}
                <View style={styles.quickTagsSection}>
                    <Text style={styles.quickTagsTitle}>{t.quickTags}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            style={styles.quickTag}
                            onPress={() => handleQuickTag(language === "si" ? "දවස් 0-20" : "Days 0-20")}
                        >
                            <Text style={styles.quickTagIcon}>🌱</Text>
                            <Text style={styles.quickTagText}>{language === "si" ? "දවස් 0-20" : "Days 0-20"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickTag}
                            onPress={() => handleQuickTag(language === "si" ? "දවස් 20-60" : "Days 20-60")}
                        >
                            <Text style={styles.quickTagIcon}>🌿</Text>
                            <Text style={styles.quickTagText}>{language === "si" ? "දවස් 20-60" : "Days 20-60"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickTag}
                            onPress={() => handleQuickTag(language === "si" ? "දවස් 60-90" : "Days 60-90")}
                        >
                            <Text style={styles.quickTagIcon}>🌽</Text>
                            <Text style={styles.quickTagText}>{language === "si" ? "දවස් 60-90" : "Days 60-90"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickTag}
                            onPress={() => handleQuickTag(language === "si" ? "කොළ කහයි" : "Yellow leaves")}
                        >
                            <Text style={styles.quickTagIcon}>🍂</Text>
                            <Text style={styles.quickTagText}>{language === "si" ? "කොළ කහයි" : "Yellow leaves"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.quickTag}
                            onPress={() => handleQuickTag(language === "si" ? "වියලි පස" : "Dry soil")}
                        >
                            <Text style={styles.quickTagIcon}>🏜️</Text>
                            <Text style={styles.quickTagText}>{language === "si" ? "වියලි පස" : "Dry soil"}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
                    onPress={handleAnalyze}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ["#9CA3AF", "#6B7280"] : ["#10b981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.analyzeButtonGradient}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color="#ffffff" size="small" />
                                <Text style={styles.analyzeButtonText}>{t.analyzing}</Text>
                            </>
                        ) : (
                            <>
                                <Send color="#ffffff" size={20} />
                                <Text style={styles.analyzeButtonText}>{t.analyze}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
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
    },
    backButton: {
        marginRight: 12,
    },
    headerCenter: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#D1FAE5",
    },
    langButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    langText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    infoCard: {
        backgroundColor: "#ECFDF5",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#065F46",
        marginBottom: 4,
    },
    infoDesc: {
        fontSize: 13,
        color: "#047857",
        lineHeight: 18,
    },
    inputSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 12,
    },
    textInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        color: "#1F2937",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        minHeight: 160,
    },
    examplesSection: {
        marginBottom: 24,
    },
    examplesTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 12,
    },
    exampleChip: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    exampleText: {
        fontSize: 14,
        color: "#374151",
    },
    analyzeButton: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    analyzeButtonDisabled: {
        opacity: 0.7,
    },
    analyzeButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        gap: 8,
    },
    analyzeButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    accessDeniedContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    accessDeniedTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 24,
        marginBottom: 12,
        textAlign: "center",
    },
    accessDeniedText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    backButtonLarge: {
        backgroundColor: "#10b981",
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    labelWithIcon: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    mainLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2937",
        flex: 1,
    },
    textInputLarge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        fontSize: 16,
        color: "#1F2937",
        borderWidth: 2,
        borderColor: "#10b981",
        minHeight: 180,
        lineHeight: 24,
    },
    quickTagsSection: {
        marginBottom: 20,
    },
    quickTagsTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 12,
    },
    quickTag: {
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    quickTagIcon: {
        fontSize: 16,
    },
    quickTagText: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "500",
    },
});
