// PricingModal.tsx - Pricing popup for first-time home screen login
import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    StyleSheet,
    Dimensions,
    ScrollView,
    Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    X,
    Check,
    Crown,
    Sparkles,
    TestTube,
    BarChart3,
    MessageCircle,
    Zap,
} from "lucide-react-native";
import { useLanguage } from "../context/LanguageContext";

const { width, height } = Dimensions.get("window");

interface PricingModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectFree: () => void;
    onSelectPro: () => void;
}

// Translations
const translations = {
    sinhala: {
        title: "MaizeGenie Pro වෙත සාදරයෙන් පිළිගනිමු",
        subtitle: "ඔබේ ගොවිතැනට සුදුසු පැකේජය තෝරන්න",
        free: "නොමිලේ",
        pro: "Pro",
        lifetime: "ජීවිත කාලය සඳහා",
        continueWithFree: "නොමිලේ දිගටම කරගෙන යන්න",
        upgradeToPro: "Pro වෙත උත්ශ්‍රේණි කරන්න",
        mostPopular: "වඩාත් ජනප්‍රිය",
        limitedOffer: "සීමිත දීමනාව",
        saveAmount: "රු. 2,500 ඉතිරි කරන්න",
        originalPrice: "මුල් මිල: රු. 4,999",

        // Free Features
        freeFeature1: "මූලික අස්වැන්න පුරෝකථනය",
        freeFeature2: "පළිබෝධ හඳුනාගැනීම",
        freeFeature3: "කාලගුණ තොරතුරු",
        freeFeature4: "මූලික පෝෂක උපදෙස්",

        // Pro Features
        proFeature1: "AI අස්වැන්න පුරෝකථනය",
        proFeature2: "පස් පරීක්ෂණ ඉල්ලීම 🔬",
        proFeature3: "විශේෂඥ උපදෙස්",
        proFeature4: "ප්‍රමුඛ සහාය",
        proFeature5: "සවිස්තර වාර්තා",
        proFeature6: "දැන්වීම් රහිත",
    },
    english: {
        title: "Welcome to MaizeGenie Pro",
        subtitle: "Choose the perfect plan for your farming journey",
        free: "Free",
        pro: "Pro",
        lifetime: "Lifetime",
        continueWithFree: "Continue with Free",
        upgradeToPro: "Upgrade to Pro",
        mostPopular: "Most Popular",
        limitedOffer: "Limited Offer",
        saveAmount: "Save Rs. 2,500",
        originalPrice: "Original: Rs. 4,999",

        // Free Features
        freeFeature1: "Basic Yield Prediction",
        freeFeature2: "Pest Detection",
        freeFeature3: "Weather Information",
        freeFeature4: "Basic Fertilizer Tips",

        // Pro Features
        proFeature1: "AI Yield Prediction",
        proFeature2: "Soil Test Request 🔬",
        proFeature3: "Expert Consultation",
        proFeature4: "Priority Support",
        proFeature5: "Detailed Reports",
        proFeature6: "Ad-Free Experience",
    },
    // Tamil fallback (uses English until full translations added)
    tamil: {
        title: "MaizeGenie Pro க்கு வரவேற்கிறோம்",
        subtitle: "உங்கள் விவசாயப் பயணத்திற்கு ஏற்ற திட்டத்தைத் தேர்வு செய்யுங்கள்",
        free: "இலவசம்",
        pro: "Pro",
        lifetime: "வாழ்நாள்",
        continueWithFree: "இலவசமாக தொடரவும்",
        upgradeToPro: "Pro க்கு மேம்படுத்து",
        mostPopular: "மிகவும் பிரபலமானது",
        limitedOffer: "வரையறுக்கப்பட்ட சலுகை",
        saveAmount: "ரூ. 2,500 சேமிக்கவும்",
        originalPrice: "அசல் விலை: ரூ. 4,999",
        freeFeature1: "அடிப்படை விளைச்சல் மதிப்பீடு",
        freeFeature2: "பூச்சி கண்டறிதல்",
        freeFeature3: "வானிலை தகவல்",
        freeFeature4: "அடிப்படை உர குறிப்புகள்",
        proFeature1: "AI விளைச்சல் மதிப்பீடு",
        proFeature2: "மண் பரிசோதனை கோரிக்கை 🔬",
        proFeature3: "நிபுணர் ஆலோசனை",
        proFeature4: "முன்னுரிமை ஆதரவு",
        proFeature5: "விரிவான அறிக்கைகள்",
        proFeature6: "விளம்பரமில்லா அனுபவம்",
    },
};

export default function PricingModal({
    visible,
    onClose,
    onSelectFree,
    onSelectPro,
}: PricingModalProps) {
    const { language } = useLanguage();
    const t = translations[language];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(height)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 40,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();

            // Pulse animation for Pro badge
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.03,
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
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(height);
            scaleAnim.setValue(0.9);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={["#f0fdf4", "#dcfce7"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalContent}
                    >
                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            activeOpacity={0.7}
                        >
                            <X size={24} color="#065f46" strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerIcon}>
                                <Sparkles size={32} color="#10b981" strokeWidth={2} />
                            </View>
                            <Text style={styles.title}>{t.title}</Text>
                            <Text style={styles.subtitle}>{t.subtitle}</Text>
                        </View>

                        {/* Pricing Cards */}
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Free Plan Card */}
                            <View style={styles.freeCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.planBadge}>
                                        <Zap size={14} color="#10b981" />
                                        <Text style={styles.planName}>{t.free}</Text>
                                    </View>
                                    <Text style={styles.priceAmount}>රු. 0</Text>
                                </View>

                                <View style={styles.featuresContainer}>
                                    <FeatureItem icon={Check} text={t.freeFeature1} />
                                    <FeatureItem icon={Check} text={t.freeFeature2} />
                                    <FeatureItem icon={Check} text={t.freeFeature3} />
                                    <FeatureItem icon={Check} text={t.freeFeature4} />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={onSelectFree}
                                    style={styles.freeButton}
                                >
                                    <Text style={styles.freeButtonText}>{t.continueWithFree}</Text>
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
                                        <Crown size={12} color="#ffffff" />
                                        <Text style={styles.popularText}>{t.mostPopular}</Text>
                                    </LinearGradient>
                                </View>

                                <View style={styles.cardHeader}>
                                    <View style={styles.proPlanBadge}>
                                        <Sparkles size={14} color="#ffffff" />
                                        <Text style={styles.proPlanName}>{t.pro}</Text>
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <View style={styles.limitedOfferBadge}>
                                            <Text style={styles.limitedOfferText}>{t.limitedOffer}</Text>
                                        </View>
                                        <Text style={styles.originalPrice}>{t.originalPrice}</Text>
                                        <View style={styles.proPrice}>
                                            <Text style={styles.proPriceAmount}>රු. 2,499</Text>
                                            <Text style={styles.proPriceLifetime}>{t.lifetime}</Text>
                                        </View>
                                        <Text style={styles.saveText}>{t.saveAmount}</Text>
                                    </View>
                                </View>

                                <View style={styles.featuresContainer}>
                                    <ProFeatureItem icon={Check} text={t.proFeature1} highlight />
                                    <ProFeatureItem icon={TestTube} text={t.proFeature2} highlight />
                                    <ProFeatureItem icon={MessageCircle} text={t.proFeature3} />
                                    <ProFeatureItem icon={Check} text={t.proFeature4} />
                                    <ProFeatureItem icon={BarChart3} text={t.proFeature5} />
                                    <ProFeatureItem icon={Check} text={t.proFeature6} />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={onSelectPro}
                                >
                                    <LinearGradient
                                        colors={["#10b981", "#059669"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.proButton}
                                    >
                                        <Crown size={18} color="#ffffff" />
                                        <Text style={styles.proButtonText}>{t.upgradeToPro}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        </ScrollView>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Feature Item Component for Free Plan
const FeatureItem = ({ icon: Icon, text }: { icon: any; text: string }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIconContainer}>
            <Icon size={14} color="#10b981" strokeWidth={2.5} />
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
                size={14}
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
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContainer: {
        width: width * 0.92,
        maxHeight: height * 0.85,
        borderRadius: 28,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
        elevation: 20,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },

    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    header: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 20,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#065f46",
        textAlign: "center",
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        color: "#059669",
        textAlign: "center",
        lineHeight: 20,
        fontWeight: "500",
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        gap: 16,
        paddingBottom: 8,
    },

    // Free Card
    freeCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1.5,
        borderColor: "#e5e7eb",
    },
    cardHeader: {
        marginBottom: 16,
    },
    planBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#f0fdf4",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    planName: {
        fontSize: 12,
        fontWeight: "700",
        color: "#10b981",
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: "900",
        color: "#065f46",
    },

    featuresContainer: {
        gap: 10,
        marginBottom: 18,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    featureIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: "#f0fdf4",
        justifyContent: "center",
        alignItems: "center",
    },
    featureText: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "600",
        flex: 1,
    },

    freeButton: {
        height: 48,
        backgroundColor: "#f0fdf4",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#10b981",
    },
    freeButtonText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#10b981",
    },

    // Pro Card
    proCard: {
        backgroundColor: "#065f46",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 2,
        borderColor: "#10b981",
        position: "relative",
    },

    popularBadge: {
        position: "absolute",
        top: -1,
        right: 16,
        zIndex: 10,
    },
    popularBadgeGradient: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    popularText: {
        fontSize: 11,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.3,
    },

    proPlanBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginBottom: 10,
        marginTop: 16,
    },
    proPlanName: {
        fontSize: 12,
        fontWeight: "700",
        color: "#ffffff",
    },

    priceContainer: {
        alignItems: "flex-start",
    },
    limitedOfferBadge: {
        backgroundColor: "#fbbf24",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    limitedOfferText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#065f46",
        letterSpacing: 0.3,
    },

    originalPrice: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.6)",
        textDecorationLine: "line-through",
        marginBottom: 3,
    },
    proPrice: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: 6,
        marginBottom: 3,
    },
    proPriceAmount: {
        fontSize: 36,
        fontWeight: "900",
        color: "#ffffff",
    },
    proPriceLifetime: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.8)",
    },
    saveText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6ee7b7",
    },

    proFeatureItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    proFeatureIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    proFeatureIconHighlight: {
        backgroundColor: "#ffffff",
    },
    proFeatureText: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.9)",
        fontWeight: "600",
        flex: 1,
    },
    proFeatureTextHighlight: {
        color: "#ffffff",
        fontWeight: "700",
    },

    proButton: {
        height: 48,
        borderRadius: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    proButtonText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.3,
    },
});
