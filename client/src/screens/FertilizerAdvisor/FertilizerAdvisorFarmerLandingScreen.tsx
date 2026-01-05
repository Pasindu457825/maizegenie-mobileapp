import React, { useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles, MessageCircle, AlertCircle, BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර උපදේශ",
        subtitle: "ඔබේ සේවා",
        nlpAdvisory: "ඔබේ පොහොර උපදේශ සහායක",
        nlpDescription: "දෘශ්‍යමාන ලක්ෂණ මත පදනම්ව පොහොර උපදේශ ලබා ගන්න",
        farmerChat: "කෘෂි නිලධාරියා සමඟ කතා කරන්න",
        farmerChatDescription: "විශේෂඥ උපදේශ සඳහා සජීවී චැට්",
        knowledgeBank: "පෝෂක මාර්ගෝපදේශ කියවන්න",
        knowledgeBankDescription: "වගාව සඳහා වැදගත් වන පෝෂක තොරතුරු ලබාගන්න",
    },
    en: {
        title: "Fertilizer Advisory",
        subtitle: "Your Services",
        nlpAdvisory: "Your Fertilizer Advisory Assistant",
        nlpDescription: "Get fertilizer advices on visible signs based",
        farmerChat: "Chat With Agriculture Officer",
        farmerChatDescription: "Live chat for expert advice",
        knowledgeBank: "Read Fertilizer Guidelines",
        knowledgeBankDescription: "Get important nutrient information for cultivation",
    },
};

export default function FertilizerAdvisorLandingScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";

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

    const t = content[language];

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
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Services Section */}
                <View style={styles.servicesSection}>
                    {/* Rule-Based Advisory Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("RuleBasedAdvisoryInputScreen")}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#ECFDF5", "#D1FAE5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={styles.serviceIconContainer}>
                                <Sparkles color="#10b981" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.nlpAdvisory}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.nlpDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Farmer Chat Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("Chat", { roomId: null, userId: "" })}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#EFF6FF", "#DBEAFE"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: "#DBEAFE" }]}>
                                <MessageCircle color="#3b82f6" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.farmerChat}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.farmerChatDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Knowledge Bank Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("KnowledgeBankMain")}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#FEF3C7", "#FDE68A"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: "#FDE68A" }]}>
                                <BookOpen color="#F59E0B" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.knowledgeBank}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.knowledgeBankDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

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
        paddingTop: 60,
        paddingBottom: 32,
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
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
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
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 20,
    },
    servicesSection: {
        gap: 16,
    },
    serviceCard: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    serviceCardGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
    },
    serviceIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    serviceContent: {
        flex: 1,
    },
    serviceTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 4,
    },
    serviceDescription: {
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
    },
    serviceArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        alignItems: "center",
        justifyContent: "center",
    },
    serviceArrowText: {
        fontSize: 18,
        color: "#1F2937",
        fontWeight: "700",
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
});
