import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles, MessageCircle, AlertCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";

const { width } = Dimensions.get("window");

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර උපදේශ",
        subtitle: "ඔබේ සේවා",
        nlpAdvisory: "නීති පදනම් පොහොර උපදේශක",
        nlpDescription: "ස්වභාවික භාෂාවෙන් පොහොර උපදේශ ලබා ගන්න",
        farmerChat: "කෘෂි නිලධාරියා සමඟ කතා කරන්න",
        farmerChatDescription: "විශේෂඥ උපදේශ සඳහා සජීවී චැට්",
    },
    en: {
        title: "Fertilizer Advisory",
        subtitle: "Your Services",
        nlpAdvisory: "Rule-Based Fertilizer Advisory",
        nlpDescription: "Get fertilizer advice in natural language",
        farmerChat: "Chat With Agriculture Officer",
        farmerChatDescription: "Live chat for expert advice",
    },
};

export default function FertilizerAdvisorLandingScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const [language, setLanguage] = useState<Language>("en");
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

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

    const slides = [
        require("../../../assets/fert_advices/YaraMila1.jpg"),
        require("../../../assets/fert_advices/YaraMila2.jpg"),
    ];

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
        setActiveSlide(index);
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
                {/* Image Slideshow */}
                <View style={styles.slideshowContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.slideshow}
                    >
                        {slides.map((slide, index) => (
                            <View key={index} style={styles.slide}>
                                <Image
                                    source={slide}
                                    style={styles.slideImage}
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    activeSlide === index && styles.paginationDotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>

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
    slideshowContainer: {
        marginTop: 16,
        marginBottom: 24,
    },
    slideshow: {
        height: 240,
    },
    slide: {
        width: width,
        paddingHorizontal: 16,
    },
    slideImage: {
        width: width - 32,
        height: 240,
        borderRadius: 16,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#D1D5DB",
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: "#10b981",
        width: 24,
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
