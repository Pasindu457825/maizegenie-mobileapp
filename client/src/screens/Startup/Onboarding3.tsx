// Onboarding3.tsx - Pricing/Subscription Screen
import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    ArrowRight,
    Check,
    Crown,
    Sparkles,
    TestTube,
    BarChart3,
    MessageCircle,
    Zap,
    Camera,
    Send,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

const { width, height } = Dimensions.get("window");

// Translations
const translations = {
    sinhala: {
        title: "ඔබේ සැලැස්ම තෝරන්න",
        subtitle: "ඔබේ ගොවිතැනට සුදුසු පැකේජය තෝරන්න",
        free: "නොමිලේ",
        pro: "Pro",
        perMonth: "මාසිකව",
        perYear: "වාර්ෂිකව",
        monthlyPrice: "රු. 300",
        annualPrice: "රු. 2,500",
        getStarted: "ආරම්භ කරමු",
        upgradeToPro: "Pro වෙත උත්ශ්‍රේණි කරන්න",
        mostPopular: "වඩාත් ජනප්‍රිය",
        limitedOffer: "සීමිත දීමනාව",

        // Free Features
        freeFeature1: "මූලික අස්වැන්න පුරෝකථනය",
        freeFeature2: "පළිබෝධ හඳුනාගැනීම",
        freeFeature3: "කාලගුණ තොරතුරු",
        freeFeature4: "මිල තොරතුරු",
        freeFeature5: "මූලික පෝෂක උපදෙස්",

        // Pro Features
        proFeature1: "විශේෂඥ උපදෙස්",
        proFeature2: "සවිස්තර වාර්තා",
        proFeature3: "පස් පරීක්ෂණ ඉල්ලීම",
        proFeature4: "දැන්වීම් රහිත",
        proFeature5: "Pro රෝග හඳුනාගැනීම",
        proFeature6: "කෘෂිකර්ම නිලධාරීන්ට පින්තූර යැවීම",
    },
    english: {
        title: "Choose Your Plan",
        subtitle: "Select the perfect package for your farming needs",
        free: "Free",
        pro: "Pro",
        perMonth: "per month",
        perYear: "per year",
        monthlyPrice: "Rs. 300",
        annualPrice: "Rs. 2,500",
        getStarted: "Get Started",
        upgradeToPro: "Upgrade to Pro",
        mostPopular: "Most Popular",
        limitedOffer: "Limited Offer",

        // Free Features
        freeFeature1: "Basic Yield Prediction",
        freeFeature2: "Pest Detection",
        freeFeature3: "Weather Information",
        freeFeature4: "Market Prices",
        freeFeature5: "Basic Fertilizer Tips",

        // Pro Features
        proFeature1: "Expert Consultation",
        proFeature2: "Detailed Reports",
        proFeature3: "Soil Test Request",
        proFeature4: "Ad-Free Experience",
        proFeature5: "Pro Disease Identification",
        proFeature6: "Send Images to Agri Officers",
    },
    tamil: {
        title: "உங்கள் திட்டத்தைத் தேர்வு செய்யுங்கள்",
        subtitle: "உங்கள் விவசாயத் தேவைகளுக்கு ஏற்ற பொதியை தேர்வு செய்யுங்கள்",
        free: "இலவசம்",
        pro: "Pro",
        perMonth: "மாதந்தோறும்",
        perYear: "வருடந்தோறும்",
        monthlyPrice: "ரூ. 300",
        annualPrice: "ரூ. 2,500",
        getStarted: "தொடங்குங்கள்",
        upgradeToPro: "Pro க்கு மேம்படுத்து",
        mostPopular: "மிகவும் பிரபலமானது",
        limitedOffer: "வரையறுக்கப்பட்ட சலுகை",

        // Free Features
        freeFeature1: "அடிப்படை விளைச்சல் மதிப்பீடு",
        freeFeature2: "பூச்சி கண்டறிதல்",
        freeFeature3: "வானிலை தகவல்",
        freeFeature4: "சந்தை விலைகள்",
        freeFeature5: "அடிப்படை உர குறிப்புகள்",

        // Pro Features
        proFeature1: "நிபுணர் ஆலோசனை",
        proFeature2: "விரிவான அறிக்கைகள்",
        proFeature3: "மண் பரிசோதனை கோரிக்கை",
        proFeature4: "விளம்பரமில்லா அனுபவம்",
        proFeature5: "Pro நோய் அடையாளம்",
        proFeature6: "விவசாய அதிகாரிகளுக்கு படங்களை அனுப்புக",
    },
};

type LanguageKey = keyof typeof translations;

export default function Onboarding3({ navigation, route }: any) {
    const { language } = useLanguage();
    const t = translations[language];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for Pro badge
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Shimmer animation for Pro card
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300],
    });

    const handleFreePlan = () => {
        navigation.navigate("Login");
    };

    const handleProPlan = () => {
        // Navigate to payment or subscription flow
        navigation.navigate("Login", { selectedPlan: "pro" });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Background Decoration */}
            <View style={styles.bgDecoration1} />
            <View style={styles.bgDecoration2} />

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressDot} />
                <View style={styles.progressDot} />
                <View style={styles.progressDotActive} />
            </View>

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <Text style={styles.title}>{t.title}</Text>
                <Text style={styles.subtitle}>{t.subtitle}</Text>
            </Animated.View>

            {/* Pricing Cards */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.cardsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Free Plan Card */}
                    <View style={styles.freeCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.planBadge}>
                                <Zap size={16} color="#10b981" />
                                <Text style={styles.planName}>{t.free}</Text>
                            </View>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceAmount}>රු. 0</Text>
                            </View>
                        </View>

                        <View style={styles.featuresContainer}>
                            <FeatureItem icon={Check} text={t.freeFeature1} />
                            <FeatureItem icon={Check} text={t.freeFeature2} />
                            <FeatureItem icon={Check} text={t.freeFeature3} />
                            <FeatureItem icon={Check} text={t.freeFeature4} />
                            <FeatureItem icon={Check} text={t.freeFeature5} />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleFreePlan}
                            style={styles.freeButton}
                        >
                            <Text style={styles.freeButtonText}>{t.getStarted}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Pro Plan Card */}
                    <Animated.View
                        style={[
                            styles.proCard,
                            {
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    >
                        {/* Most Popular Badge */}
                        <View style={styles.popularBadge}>
                            <LinearGradient
                                colors={["#fbbf24", "#f59e0b"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.popularBadgeGradient}
                            >
                                <Crown size={14} color="#ffffff" />
                                <Text style={styles.popularText}>{t.mostPopular}</Text>
                            </LinearGradient>
                        </View>

                        {/* Shimmer Effect */}
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX: shimmerTranslate }],
                                },
                            ]}
                        />

                        <View style={styles.cardHeader}>
                            <View style={styles.proPlanBadge}>
                                <Sparkles size={16} color="#ffffff" />
                                <Text style={styles.proPlanName}>{t.pro}</Text>
                            </View>

                            <View style={styles.priceContainer}>
                                <View style={styles.limitedOfferBadge}>
                                    <Text style={styles.limitedOfferText}>{t.limitedOffer}</Text>
                                </View>
                                <View style={styles.pricingOptions}>
                                    <View style={styles.priceOption}>
                                        <Text style={styles.priceLabel}>{t.perMonth}</Text>
                                        <Text style={styles.proPriceAmount}>{t.monthlyPrice}</Text>
                                    </View>
                                    <View style={styles.priceDivider} />
                                    <View style={styles.priceOption}>
                                        <Text style={styles.priceLabel}>{t.perYear}</Text>
                                        <Text style={styles.proPriceAmount}>{t.annualPrice}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.featuresContainer}>
                            <ProFeatureItem icon={MessageCircle} text={t.proFeature1} />
                            <ProFeatureItem icon={BarChart3} text={t.proFeature2} />
                            <ProFeatureItem icon={TestTube} text={t.proFeature3} />
                            <ProFeatureItem icon={Sparkles} text={t.proFeature4} />
                            <ProFeatureItem icon={Camera} text={t.proFeature5} highlight={true} />
                            <ProFeatureItem icon={Send} text={t.proFeature6} highlight={true} />
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleProPlan}
                        >
                            <LinearGradient
                                colors={["#10b981", "#059669"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.proButton}
                            >
                                <Crown size={20} color="#ffffff" />
                                <Text style={styles.proButtonText}>{t.upgradeToPro}</Text>
                                <ArrowRight size={20} color="#ffffff" strokeWidth={2.5} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Feature Item Component for Free Plan
const FeatureItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIconContainer}>
            <Icon size={16} color="#10b981" strokeWidth={2.5} />
        </View>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

// Feature Item Component for Pro Plan
const ProFeatureItem = ({
    icon: Icon,
    text,
    highlight = false,
}: {
    icon: any;
    text: string;
    highlight?: boolean;
}) => (
    <View style={styles.proFeatureItem}>
        <View
            style={[
                styles.proFeatureIconContainer,
                highlight && styles.proFeatureIconHighlight,
            ]}
        >
            <Icon
                size={16}
                color={highlight ? "#10b981" : "#ffffff"}
                strokeWidth={2.5}
            />
        </View>
        <Text style={[styles.proFeatureText, highlight && styles.proFeatureTextHighlight]}>
            {text}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginTop: 60,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(16, 185, 129, 0.3)",
    },
    progressDotActive: {
        width: 32,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#10b981",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },

    // Background Decorations
    bgDecoration1: {
        position: "absolute",
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        top: -60,
        right: -60,
    },
    bgDecoration2: {
        position: "absolute",
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "rgba(5, 150, 105, 0.06)",
        bottom: 80,
        left: -40,
    },

    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "900",
        color: "#065f46",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: "#059669",
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "500",
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    cardsContainer: {
        gap: 20,
    },

    // Free Card
    freeCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 2,
        borderColor: "#e5e7eb",
    },
    cardHeader: {
        marginBottom: 20,
    },
    planBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
    },
    planName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#10b981",
    },
    priceContainer: {
        alignItems: "flex-start",
    },
    priceAmount: {
        fontSize: 42,
        fontWeight: "900",
        color: "#065f46",
    },

    featuresContainer: {
        gap: 12,
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    featureIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "#f0fdf4",
        justifyContent: "center",
        alignItems: "center",
    },
    featureText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "600",
        flex: 1,
    },

    freeButton: {
        height: 52,
        backgroundColor: "#f0fdf4",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#10b981",
    },
    freeButtonText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#10b981",
    },

    // Pro Card
    proCard: {
        backgroundColor: "#065f46",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 3,
        borderColor: "#10b981",
        position: "relative",
        overflow: "hidden",
    },

    // Shimmer Effect
    shimmer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 100,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        transform: [{ skewX: "-20deg" }],
    },

    popularBadge: {
        position: "absolute",
        top: -2,
        right: 20,
        zIndex: 10,
    },
    popularBadgeGradient: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    popularText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.5,
    },

    proPlanBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
        marginTop: 20,
    },
    proPlanName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ffffff",
    },

    limitedOfferBadge: {
        backgroundColor: "#fbbf24",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
        alignSelf: "flex-start",
    },
    limitedOfferText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#065f46",
        letterSpacing: 0.5,
    },

    pricingOptions: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 12,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
    },
    priceOption: {
        alignItems: "center",
        flex: 1,
    },
    priceDivider: {
        width: 1,
        height: 50,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    priceLabel: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
        marginBottom: 6,
        fontWeight: "600",
    },
    proPriceAmount: {
        fontSize: 28,
        fontWeight: "900",
        color: "#ffffff",
    },

    proFeatureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    proFeatureIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    proFeatureIconHighlight: {
        backgroundColor: "#ffffff",
    },
    proFeatureText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "600",
        flex: 1,
    },
    proFeatureTextHighlight: {
        color: "#ffffff",
        fontWeight: "700",
    },

    proButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    proButtonText: {
        fontSize: 17,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.5,
    },
});
