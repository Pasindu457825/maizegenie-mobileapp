import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../../context/LanguageContext";

type Language = "si" | "en";

interface ContentType {
    title: string;
    subtitle: string;
    sectionTitle: string;
    infoPoints: string[];
    nitrogenDeficiency: string;
    phosphorusDeficiency: string;
    potassiumDeficiency: string;
}

const content: Record<Language, ContentType> = {
    si: {
        title: "පෝෂක ඌණතාව",
        subtitle: "වගාව සඳහා වැදගත් වන පෝෂක තොරතුරු",
        sectionTitle: "පෝෂණ ඌනතාවය යනු කුමක්ද?",
        infoPoints: [
            "ප්‍රාථමික පෝෂ්‍ය පදාර්ථ වන නයිට්‍රජන්, පොස්පරස් සහ පොටෑසියම් වලට අමතරව, මැග්නීසියම්, කැල්සියම් සහ සල්ෆර් වැනි ද්විතියික පෝෂ්‍ය පදාර්ථ ද අවශ්‍ය වේ. ඒ අනුව, පෝෂක ඌනතාවය ශාකයේ කාබෝහයිඩ්‍රේට්, ප්‍රෝටීන් සහ සෛලීය ක්‍රියාකාරකම් වලට බාධා කරයි.",
            "මෙම පෝෂ්‍ය පදාර්ථ ඌන වූ විට, බෝග වර්ධනය අඩුවීම, පරිණත කාලය කෙටි වීම සහ දුර්වල කරල් සෑදීම වැනි රෝග ලක්ෂණ බෝගයේ නිරීක්ෂණය කළ හැකිය.",
            "පසෙහි පෝෂක තත්ත්වය පිළිබඳ නිසි දැනුමක් නොමැතිව වගාව සිදු කරන විට පෝෂක ඌනතාවය ඇති විය හැක.",
            "එබැවින්, ගොවීන් වගා කරන පසෙහි පෝෂක මට්ටම් අවබෝධ කර ගැනීම අත්‍යවශ්‍ය වේ.",
            "පාංශු සාධක වලට අමතරව, අපේක්ෂිත අස්වැන්න මට්ටමට නොගැලපෙන ගැටළු මතු වූ විට, ගොවීන්ට ගැටළු හඳුනාගෙන ඒවාට විසඳුම් ලබා දිය හැකි වන පරිදි පෝෂක ඌනතාවයට හේතු හඳුනා ගැනීම වැදගත් වේ.",
        ],
        nitrogenDeficiency: "නයිට්‍රජන් ඌණතාව",
        phosphorusDeficiency: "පොස්පරස් ඌණතාව",
        potassiumDeficiency: "පොටෑසියම් ඌණතාව",
    },
    en: {
        title: "Nutrient Deficiency",
        subtitle: "Important nutrient information for cultivation",
        sectionTitle: "What is Nutrient Deficiency?",
        infoPoints: [
            "In addition to the primary nutrients nitrogen, phosphorus, and potassium, secondary nutrients such as magnesium, calcium, and sulfur are also required. Accordingly, nutrient deficiency disrupts carbohydrate, protein, and cellular activities in the plant.",
            "When these nutrients are lacking, symptoms such as reduced crop growth, shortened maturity period, and poor ear formation can be observed in the crop.",
            "Nutrient deficiency may occur when cultivation is carried out without proper knowledge of the soil nutrient status.",
            "Therefore, understanding the nutrient levels of the soil in which farmers cultivate is essential.",
            "In addition to soil factors, when issues arise that do not match the expected yield level, identifying the causes of nutrient deficiency becomes important so that farmers can recognize and address the problems.",
        ],
        nitrogenDeficiency: "Nitrogen Deficiency",
        phosphorusDeficiency: "Phosphorus Deficiency",
        potassiumDeficiency: "Potassium Deficiency",
    },
};

export default function NutrientDeficiencyScreen() {
    const navigation = useNavigation<any>();
    const { language: lang } = useLanguage();

    // ✅ Robust mapping (keeps the same UI/behavior, avoids wrong language if context returns "si"/"en")
    const normalized = String(lang || "").toLowerCase();
    const language: Language =
        normalized === "sinhala" || normalized === "si" ? "si" : "en";

    const t = content[language];

    const handleNitrogenDeficiency = () => {
        console.log("Navigate to Nitrogen Deficiency Details");
    };

    const handlePhosphorusDeficiency = () => {
        console.log("Navigate to Phosphorus Deficiency Details");
    };

    const handlePotassiumDeficiency = () => {
        console.log("Navigate to Potassium Deficiency Details");
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

                    <TouchableOpacity
                        onPress={() => navigation.navigate("KnowledgeBankMain")}
                        style={styles.homeButton}
                    >
                        <BookOpen color="#ffffff" size={24} />
                        <Text style={styles.homeText}>Menu</Text>
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

                {/* Information Content */}
                <View style={styles.infoContainer}>
                    {t.infoPoints.map((point, index) => (
                        <View key={index} style={styles.infoPoint}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.infoText}>{point}</Text>
                        </View>
                    ))}
                </View>

                {/* Deficiency Cards */}
                <View style={styles.cardsContainer}>
                    {/* Nitrogen Deficiency Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handleNitrogenDeficiency}
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
                                <Text style={styles.cardText}>{t.nitrogenDeficiency}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Phosphorus Deficiency Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handlePhosphorusDeficiency}
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
                                <Text style={styles.cardText}>{t.phosphorusDeficiency}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Potassium Deficiency Card */}
                    <TouchableOpacity
                        style={styles.card}
                        onPress={handlePotassiumDeficiency}
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
                                <Text style={styles.cardText}>{t.potassiumDeficiency}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Bottom Logo */}
            <View style={styles.bottomLogo}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>🌽</Text>
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
    infoContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    infoPoint: {
        flexDirection: "row",
        marginBottom: 16,
    },
    bullet: {
        fontSize: 16,
        color: "#10b981",
        marginRight: 12,
        marginTop: 2,
        fontWeight: "700",
    },
    infoText: {
        flex: 1,
        fontSize: 15,
        color: "#374151",
        lineHeight: 24,
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
