// PricingModal.tsx - Enhanced pricing popup matching Pro Advisor design
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
    Target,
    Leaf,
    TrendingUp,
    Award,
    Shield,
    Calendar,
    Clock,
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
        title: "Pro Advisor වෙත සාදරයෙන් පිළිගනිමු",
        subtitle: "ඔබේ ගොවිතැනට සුදුසු පැකේජය තෝරන්න",
        free: "නොමිලේ",
        pro: "Pro Advisor",
        lifetime: "ජීවිත කාලය සඳහා",
        continueWithFree: "නොමිලේ දිගටම කරගෙන යන්න",
        upgradeToPro: "Pro Advisor වෙත උත්ශ්‍රේණි කරන්න",
        mostPopular: "වඩාත් ජනප්‍රිය",
        limitedOffer: "සීමිත දීමනාව",
        saveAmount: "රු. 2,500 ඉතිරි කරන්න",
        originalPrice: "මුල් මිල: රු. 4,999",
        perfectFor: "හොඳම සඳහා",
        beginnerFarmers: "නවක ගොවීන්",
        seriousFarmers: "වෘත්තීය ගොවීන්",
        whatsIncluded: "ඇතුළත් දේ",
        proAdvantages: "Pro විශේෂාංග",

        // Free Features
        freeFeature1: "මූලික අස්වැන්න පුරෝකථනය",
        freeFeature2: "පළිබෝධ හඳුනාගැනීම",
        freeFeature3: "කාලගුණ තොරතුරු",
        freeFeature4: "මූලික පෝෂක උපදෙස්",
        freeFeature5: "ප්‍රජා සහයෝගය",

        // Pro Features
        proFeature1: "🎯 සම්පූර්ණ වගා සැලසුම",
        proFeature2: "📊 සවිස්තර ගබඩා උපදෙස්",
        proFeature3: "⏱️ වගා කාලසටහන",
        proFeature4: "✓ සූදානම් පරීක්ෂාව",
        proFeature5: "💰 මුදල් සැලසුම් මාර්ගෝපදේශය",
        proFeature6: "🌱 බීජ සහ පොහොර විශේෂඥ උපදෙස්",
        proFeature7: "💧 ජල කළමනාකරණ සැලසුම",
        proFeature8: "⚠️ අවදානම් සහ අවස්ථා විශ්ලේෂණය",
        proFeature9: "📈 වෙළඳපොළ උපාය මාර්ග",
        proFeature10: "🔬 පස් පරීක්ෂණ ඉල්ලීම",
        proFeature11: "👨‍🌾 පළමු වතාවට වගා කරන්නන් සඳහා විශේෂ මාර්ගෝපදේශය",
        proFeature12: "🎓 ස්ටෙප්-බයි-ස්ටෙප් ක්‍රියා සටහන්",
    },
    english: {
        title: "Welcome to Pro Advisor",
        subtitle: "Choose the perfect plan for your farming success",
        free: "Free",
        pro: "Pro Advisor",
        lifetime: "Lifetime",
        continueWithFree: "Continue with Free",
        upgradeToPro: "Upgrade to Pro Advisor",
        mostPopular: "Most Popular",
        limitedOffer: "Limited Offer",
        saveAmount: "Save Rs. 2,500",
        originalPrice: "Original: Rs. 4,999",
        perfectFor: "Perfect For",
        beginnerFarmers: "Beginner Farmers",
        seriousFarmers: "Professional Farmers",
        whatsIncluded: "What's Included",
        proAdvantages: "Pro Advantages",

        // Free Features
        freeFeature1: "Basic Yield Prediction",
        freeFeature2: "Pest Detection",
        freeFeature3: "Weather Information",
        freeFeature4: "Basic Fertilizer Tips",
        freeFeature5: "Community Support",

        // Pro Features
        proFeature1: "🎯 Complete Cultivation Plan",
        proFeature2: "📊 Detailed Storage Guidance",
        proFeature3: "⏱️ Cultivation Timeline",
        proFeature4: "✓ Readiness Check",
        proFeature5: "💰 Financial Planning Guide",
        proFeature6: "🌱 Seed & Fertilizer Expert Advice",
        proFeature7: "💧 Water Management Plan",
        proFeature8: "⚠️ Risk & Opportunity Analysis",
        proFeature9: "📈 Market Strategies",
        proFeature10: "🔬 Soil Test Request",
        proFeature11: "👨‍🌾 First-time Farmer Guidance",
        proFeature12: "🎓 Step-by-Step Action Plans",
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
    const shimmerAnim = useRef(new Animated.Value(0)).current;

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

            // Shimmer animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 2000,
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

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

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
                        colors={["#F0FDF4", "#ECFDF5"]}
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
                            <X size={24} color="#065F46" strokeWidth={2.5} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerIcon}>
                                <LinearGradient
                                    colors={["#10B981", "#059669"]}
                                    style={styles.headerIconGradient}
                                >
                                    <Target size={32} color="#FFFFFF" strokeWidth={2.5} />
                                </LinearGradient>
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
                                <View style={styles.cardTop}>
                                    <View style={styles.planBadge}>
                                        <Zap size={16} color="#10B981" />
                                        <Text style={styles.planName}>{t.free}</Text>
                                    </View>
                                    <View style={styles.perfectForBadge}>
                                        <Text style={styles.perfectForText}>{t.perfectFor}</Text>
                                        <Text style={styles.perfectForSubtext}>{t.beginnerFarmers}</Text>
                                    </View>
                                </View>

                                <View style={styles.priceSection}>
                                    <Text style={styles.priceAmount}>රු. 0</Text>
                                    <Text style={styles.priceSubtext}>{t.whatsIncluded}</Text>
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
                                        colors={["#FBBF24", "#F59E0B"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.popularBadgeGradient}
                                    >
                                        <Crown size={14} color="#FFFFFF" />
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

                                <View style={styles.cardTop}>
                                    <View style={styles.proPlanBadge}>
                                        <Target size={18} color="#FFFFFF" strokeWidth={2.5} />
                                        <Text style={styles.proPlanName}>{t.pro}</Text>
                                    </View>
                                    <View style={styles.perfectForBadgeLight}>
                                        <Text style={styles.perfectForTextLight}>{t.perfectFor}</Text>
                                        <Text style={styles.perfectForSubtextLight}>{t.seriousFarmers}</Text>
                                    </View>
                                </View>

                                <View style={styles.priceSection}>
                                    <View style={styles.limitedOfferBadge}>
                                        <Clock size={12} color="#065F46" />
                                        <Text style={styles.limitedOfferText}>{t.limitedOffer}</Text>
                                    </View>
                                    <Text style={styles.originalPrice}>{t.originalPrice}</Text>
                                    <View style={styles.proPrice}>
                                        <Text style={styles.proPriceAmount}>රු. 2,499</Text>
                                        <View style={styles.lifetimeBadge}>
                                            <Shield size={14} color="#6EE7B7" />
                                            <Text style={styles.proPriceLifetime}>{t.lifetime}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.saveBadge}>
                                        <Award size={14} color="#6EE7B7" />
                                        <Text style={styles.saveText}>{t.saveAmount}</Text>
                                    </View>
                                </View>

                                <View style={styles.proAdvantagesHeader}>
                                    <Sparkles size={18} color="#6EE7B7" />
                                    <Text style={styles.proAdvantagesText}>{t.proAdvantages}</Text>
                                </View>

                                <View style={styles.featuresContainer}>
                                    <ProFeatureItem text={t.proFeature1} highlight />
                                    <ProFeatureItem text={t.proFeature2} highlight />
                                    <ProFeatureItem text={t.proFeature3} highlight />
                                    <ProFeatureItem text={t.proFeature4} />
                                    <ProFeatureItem text={t.proFeature5} />
                                    <ProFeatureItem text={t.proFeature6} />
                                    <ProFeatureItem text={t.proFeature7} />
                                    <ProFeatureItem text={t.proFeature8} />
                                    <ProFeatureItem text={t.proFeature9} />
                                    <ProFeatureItem text={t.proFeature10} highlight />
                                    <ProFeatureItem text={t.proFeature11} highlight />
                                    <ProFeatureItem text={t.proFeature12} />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={onSelectPro}
                                >
                                    <LinearGradient
                                        colors={["#10B981", "#059669"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.proButton}
                                    >
                                        <Crown size={20} color="#FFFFFF" />
                                        <Text style={styles.proButtonText}>{t.upgradeToPro}</Text>
                                        <TrendingUp size={18} color="#FFFFFF" />
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
            <Icon size={16} color="#10B981" strokeWidth={2.5} />
        </View>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

// Feature Item Component for Pro Plan
const ProFeatureItem = ({
    text,
    highlight = false,
}: {
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
            <Check
                size={14}
                color={highlight ? "#10B981" : "#FFFFFF"}
                strokeWidth={3}
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
        backgroundColor: "rgba(0, 0, 0, 0.65)",
    },
    modalContainer: {
        width: width * 0.94,
        maxHeight: height * 0.88,
        borderRadius: 28,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.35,
        shadowRadius: 35,
        elevation: 25,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },

    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 2,
        borderColor: "#D1FAE5",
    },

    header: {
        alignItems: "center",
        marginTop: 12,
        marginBottom: 24,
    },
    headerIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        marginBottom: 16,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        overflow: "hidden",
    },
    headerIconGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 26,
        fontWeight: "900",
        color: "#065F46",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        color: "#059669",
        textAlign: "center",
        lineHeight: 20,
        fontWeight: "600",
    },

    scrollView: {
        flex: 1,
    },
    scrollContent: {
        gap: 20,
        paddingBottom: 12,
    },

    // Free Card
    freeCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    cardTop: {
        marginBottom: 16,
    },
    planBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#F0FDF4",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: "#D1FAE5",
    },
    planName: {
        fontSize: 13,
        fontWeight: "800",
        color: "#10B981",
        letterSpacing: 0.3,
    },
    perfectForBadge: {
        backgroundColor: "#F9FAFB",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    perfectForText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    perfectForSubtext: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginTop: 2,
    },

    priceSection: {
        marginBottom: 20,
    },
    priceAmount: {
        fontSize: 42,
        fontWeight: "900",
        color: "#065F46",
        marginBottom: 4,
    },
    priceSubtext: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },

    featuresContainer: {
        gap: 12,
        marginBottom: 20,
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
        backgroundColor: "#F0FDF4",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#D1FAE5",
    },
    featureText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "600",
        flex: 1,
        lineHeight: 20,
    },

    freeButton: {
        height: 52,
        backgroundColor: "#F0FDF4",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#10B981",
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    freeButtonText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#10B981",
        letterSpacing: 0.3,
    },

    // Pro Card
    proCard: {
        backgroundColor: "#065F46",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 2,
        borderColor: "#10B981",
        position: "relative",
        overflow: "hidden",
    },

    shimmer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        width: 100,
    },

    popularBadge: {
        position: "absolute",
        top: -1,
        right: 20,
        zIndex: 10,
    },
    popularBadgeGradient: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    popularText: {
        fontSize: 12,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },

    proPlanBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    proPlanName: {
        fontSize: 14,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },
    perfectForBadgeLight: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
    },
    perfectForTextLight: {
        fontSize: 10,
        fontWeight: "700",
        color: "rgba(255, 255, 255, 0.7)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    perfectForSubtextLight: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 2,
    },

    limitedOfferBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "#FBBF24",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 8,
        alignSelf: "flex-start",
    },
    limitedOfferText: {
        fontSize: 11,
        fontWeight: "900",
        color: "#065F46",
        letterSpacing: 0.5,
    },

    originalPrice: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.6)",
        textDecorationLine: "line-through",
        marginBottom: 6,
        fontWeight: "600",
    },
    proPrice: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    proPriceAmount: {
        fontSize: 42,
        fontWeight: "900",
        color: "#FFFFFF",
    },
    lifetimeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(110, 231, 183, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.3)",
    },
    proPriceLifetime: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6EE7B7",
        letterSpacing: 0.3,
    },
    saveBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(110, 231, 183, 0.2)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(110, 231, 183, 0.3)",
    },
    saveText: {
        fontSize: 13,
        fontWeight: "800",
        color: "#6EE7B7",
        letterSpacing: 0.3,
    },

    proAdvantagesHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 20,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.15)",
    },
    proAdvantagesText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },

    proFeatureItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingVertical: 2,
    },
    proFeatureIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 7,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    proFeatureIconHighlight: {
        backgroundColor: "#FFFFFF",
        borderColor: "#10B981",
    },
    proFeatureText: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.95)",
        fontWeight: "600",
        flex: 1,
        lineHeight: 22,
    },
    proFeatureTextHighlight: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    proButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
        marginTop: 4,
    },
    proButtonText: {
        fontSize: 16,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
});