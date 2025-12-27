import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Users, MessageCircle, FileText, AlertCircle, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර නිර්දේශ",
        subtitle: "නිලධාරී සේවා",
        ruleBasedAdvisory: "නීති පදනම් උපදේශක",
        ruleBasedDescription: "ව්‍යුහගත දත්ත භාවිතයෙන් විස්තරාත්මක පොහොර විශ්ලේෂණය",
        farmerRequests: "ගොවි ඉල්ලීම්",
        farmerRequestsDescription: "ගොවීන්ගේ පොහොර උපදේශ ඉල්ලීම් බලන්න",
        chatWithFarmers: "ගොවීන් සමඟ කතා කරන්න",
        chatWithFarmersDescription: "ගොවීන්ට සජීවී උපදේශ සපයන්න",
        recommendations: "නිර්දේශ ඉතිහාසය",
        recommendationsDescription: "පෙර නිර්දේශ බලන්න සහ කළමනාකරණය කරන්න",
    },
    en: {
        title: "Fertilizer Recommendation",
        subtitle: "Officer Services",
        ruleBasedAdvisory: "Rule-Based Advisory",
        ruleBasedDescription: "Detailed fertilizer analysis using structured data",
        farmerRequests: "Farmer Requests",
        farmerRequestsDescription: "View farmer fertilizer advisory requests",
        chatWithFarmers: "Chat With Farmers",
        chatWithFarmersDescription: "Provide live advice to farmers",
        recommendations: "Recommendation History",
        recommendationsDescription: "View and manage past recommendations",
    },
};

export default function FertilizerAdvisorOfficerLandingScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";

    // Check if user is an officer
    useEffect(() => {
        if (!user || user.role !== "officer") {
            Alert.alert(
                language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
                language === "si" 
                    ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි."
                    : "This feature is only available for officers.",
                [{
                    text: "OK",
                    onPress: () => navigation.goBack()
                }]
            );
        }
    }, [user, language, navigation]);

    const t = content[language];

    // If not an officer, show access denied screen
    if (!user || user.role !== "officer") {
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
                            ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි. කරුණාකර නිලධාරී ගිණුමකින් පුරනය වන්න."
                            : "This feature is only available for officers. Please log in with an officer account."}
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

    const handleComingSoon = (feature: string) => {
        Alert.alert(
            language === "si" ? "ඉදිරි දිනවල" : "Coming Soon",
            language === "si"
                ? `${feature} ඉක්මනින් ලබා දෙනු ඇත.`
                : `${feature} will be available soon.`
        );
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
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Card */}
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>
                        {language === "si" ? "සාදරයෙන් පිළිගනිමු, නිලධාරී" : "Welcome, Officer"}
                    </Text>
                    <Text style={styles.welcomeText}>
                        {language === "si" 
                            ? "ගොවීන්ට පොහොර උපදේශ සහ නිර්දේශ සපයන්න"
                            : "Provide fertilizer advice and recommendations to farmers"}
                    </Text>
                </View>

                {/* Services Section */}
                <View style={styles.servicesSection}>
                    {/* Rule-Based Advisory Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("OfficerAdvisoryInputScreen")}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#ECFDF5", "#D1FAE5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: "#A7F3D0" }]}>
                                <Sparkles color="#059669" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.ruleBasedAdvisory}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.ruleBasedDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Farmer Requests Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => handleComingSoon(t.farmerRequests)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#FEF3C7", "#FDE68A"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: "#FDE68A" }]}>
                                <Users color="#D97706" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.farmerRequests}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.farmerRequestsDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Chat With Farmers Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("OfficerRooms")}
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
                                <Text style={styles.serviceTitle}>{t.chatWithFarmers}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.chatWithFarmersDescription}
                                </Text>
                            </View>
                            <View style={styles.serviceArrow}>
                                <Text style={styles.serviceArrowText}>→</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Recommendation History Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => handleComingSoon(t.recommendations)}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#F3E8FF", "#E9D5FF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.serviceCardGradient}
                        >
                            <View style={[styles.serviceIconContainer, { backgroundColor: "#E9D5FF" }]}>
                                <FileText color="#9333ea" size={28} />
                            </View>
                            <View style={styles.serviceContent}>
                                <Text style={styles.serviceTitle}>{t.recommendations}</Text>
                                <Text style={styles.serviceDescription}>
                                    {t.recommendationsDescription}
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
        paddingBottom: 20,
    },
    welcomeCard: {
        margin: 16,
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
    },
    servicesSection: {
        paddingHorizontal: 16,
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
