import React, { useState, useRef } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles, MessageCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර උපදේශ",
        subtitle: "ඔබේ සේවා",
        nlpAdvisory: "NLP පොහොර උපදේශක",
        nlpDescription: "ස්වභාවික භාෂාවෙන් පොහොර උපදේශ ලබා ගන්න",
        farmerChat: "කෘෂි නිලධාරියා සමඟ කතා කරන්න",
        farmerChatDescription: "විශේෂඥ උපදේශ සඳහා සජීවී චැට්",
    },
    en: {
        title: "Fertilizer Advisory",
        subtitle: "Your Services",
        nlpAdvisory: "NLP Fertilizer Advisory",
        nlpDescription: "Get fertilizer advice in natural language",
        farmerChat: "Chat With Agriculture Officer",
        farmerChatDescription: "Live chat for expert advice",
    },
};

export default function FertilizerAdvisorLandingScreen() {
    const navigation = useNavigation<any>();
    const [language, setLanguage] = useState<Language>("en");
    const [activeSlide, setActiveSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const t = content[language];

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
                    {/* NLP Advisory Card */}
                    <TouchableOpacity
                        style={styles.serviceCard}
                        onPress={() => navigation.navigate("NLPAdvisoryInputScreen")}
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
});
