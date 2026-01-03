import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../../context/LanguageContext";

type Language = "si" | "en";

const content = {
    si: {
        title: "පෝෂක මාර්ගෝපදේශ",
        subtitle: "වගාව සඳහා වැදගත් වන පෝෂක තොරතුරු",
        sectionTitle: "පෝෂක කළමනාකරණය",
        nutrientManagement: "පෝෂක කළමනාකරණය",
        nutrientDeficiency: "පෝෂණ ඌණතාවය",
    },
    en: {
        title: "Fertilizer Guidelines",
        subtitle: "Important nutrient information for cultivation",
        sectionTitle: "Nutrient Information",
        nutrientManagement: "Nutrient Management",
        nutrientDeficiency: "Nutrient Deficiency",
    },
};

export default function KnowledgeBankMainScreen() {
    const navigation = useNavigation<any>();
    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";
    const t = content[language];

    const handleNutrientManagement = () => {
        console.log("Navigate to Nutrient Management");
    };

    const handleNutrientDeficiency = () => {
        navigation.navigate("NutrientDeficiency");
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
                        <ArrowLeft color="#ffffff" size={24} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t.title}</Text>
                    <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Section Title */}
                <View style={styles.sectionTitleContainer}>
                    <Text style={styles.sectionTitle}>{t.sectionTitle}</Text>
                </View>

                {/* Knowledge Cards */}
                <View style={styles.cardsContainer}>
                    {/* Nutrient Management Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleNutrientManagement}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#ECFDF5", "#D1FAE5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardIconContainer}>
                                <AlertCircle color="#10b981" size={32} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardText}>{t.nutrientManagement}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Nutrient Deficiency Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleNutrientDeficiency}
                        activeOpacity={0.7}
                    >
                        <LinearGradient
                            colors={["#ECFDF5", "#D1FAE5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardIconContainer}>
                                <AlertCircle color="#10b981" size={32} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardText}>{t.nutrientDeficiency}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Bottom Logo */}
            <View style={styles.bottomLogo}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>�</Text>
                </View>
            </View>
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
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    backText: {
        color: "#ffffff",
        fontSize: 16,
        marginLeft: 4,
        fontWeight: "500",
    },
    homeButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    homeText: {
        color: "#ffffff",
        fontSize: 16,
        marginLeft: 4,
        fontWeight: "500",
    },
    headerTitleContainer: {
        marginTop: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#D1FAE5",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
        paddingTop: 16,
    },
    sectionTitleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
    },
    cardsContainer: {
        paddingHorizontal: 20,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardGradient: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
    },
    cardIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardText: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1F2937",
    },
    bottomLogo: {
        position: "absolute",
        bottom: 20,
        right: 20,
    },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    logoEmoji: {
        fontSize: 30,
    },
});
