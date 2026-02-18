import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Animated,
    Easing,
    Dimensions,
    Platform,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, Upload, Sparkles, Archive } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface SoilExtractionAnimationProps {
    visible: boolean;
    language: "si" | "en";
    fileName?: string | null;
}

const STEPS = {
    en: [
        { label: "Reading document...", icon: "read" },
        { label: "Extracting soil data...", icon: "extract" },
        { label: "Analyzing values...", icon: "analyze" },
        { label: "Almost done...", icon: "done" },
    ],
    si: [
        { label: "ලේඛනය කියවමින්...", icon: "read" },
        { label: "පස් දත්ත උකහා ගනිමින්...", icon: "extract" },
        { label: "අගයන් විශ්ලේෂණය කරමින්...", icon: "analyze" },
        { label: "අවසන් වෙමින්...", icon: "done" },
    ],
};

const SoilExtractionAnimation: React.FC<SoilExtractionAnimationProps> = ({
    visible,
    language,
    fileName,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnims = useRef(STEPS.en.map(() => new Animated.Value(0))).current;
    const dotAnim = useRef(new Animated.Value(0)).current;

    const steps = STEPS[language];

    useEffect(() => {
        if (!visible) return;

        // Reset
        setCurrentStep(0);
        progressAnim.setValue(0);
        fadeAnims.forEach((a) => a.setValue(0));
        dotAnim.setValue(0);

        // Pulse animation for main icon
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        // Dots animation (for the loading dots indicator)
        const dots = Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(dotAnim, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                }),
            ])
        );
        dots.start();

        // Step progression
        const stepTimers: ReturnType<typeof setTimeout>[] = [];
        steps.forEach((_, index) => {
            const timer = setTimeout(() => {
                setCurrentStep(index);
                Animated.timing(fadeAnims[index], {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }).start();
                Animated.timing(progressAnim, {
                    toValue: (index + 1) / steps.length,
                    duration: 600,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }).start();
            }, index * 1000);
            stepTimers.push(timer);
        });

        return () => {
            pulse.stop();
            dots.stop();
            stepTimers.forEach(clearTimeout);
        };
    }, [visible]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    const renderStepIcon = (iconType: string, isActive: boolean, isDone: boolean) => {
        const color = isDone ? "#10B981" : isActive ? "#047857" : "#D1D5DB";
        const size = 18;

        switch (iconType) {
            case "read":
                return <FileText color={color} size={size} />;
            case "extract":
                return <Archive color={color} size={size} />;
            case "analyze":
                return <Sparkles color={color} size={size} />;
            case "done":
                return isDone || isActive ? (
                    <Text style={{ fontSize: 16, color }}>✓</Text>
                ) : (
                    <Text style={{ fontSize: 16, color }}>✓</Text>
                );
            default:
                return <FileText color={color} size={size} />;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            supportedOrientations={["portrait", "landscape"]}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={["#FFFFFF", "#F0FDF4"]}
                        style={styles.modalContent}
                    >
                        {/* Animated Icon */}
                        <Animated.View
                            style={[
                                styles.iconContainer,
                                { transform: [{ scale: pulseAnim }] },
                            ]}
                        >
                            <LinearGradient
                                colors={["#10B981", "#059669"]}
                                style={styles.iconGradient}
                            >
                                <Upload color="#FFFFFF" size={34} />
                            </LinearGradient>
                        </Animated.View>

                        {/* Activity Indicator */}
                        <ActivityIndicator
                            size="small"
                            color="#10B981"
                            style={{ marginBottom: 8 }}
                        />

                        {/* Title */}
                        <Text style={styles.title}>
                            {language === "si"
                                ? "පස් දත්ත උකහා ගනිමින්"
                                : "Extracting Soil Data"}
                        </Text>

                        {/* File name */}
                        {fileName ? (
                            <Text style={styles.fileName} numberOfLines={1}>
                                {fileName}
                            </Text>
                        ) : null}

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <Animated.View
                                    style={[
                                        styles.progressBarFill,
                                        { width: progressWidth as any },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={["#10B981", "#059669"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={StyleSheet.absoluteFill}
                                    />
                                </Animated.View>
                            </View>
                        </View>

                        {/* Steps */}
                        <View style={styles.stepsContainer}>
                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isDone = index < currentStep;

                                return (
                                    <Animated.View
                                        key={index}
                                        style={[
                                            styles.stepRow,
                                            {
                                                opacity: fadeAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.3, 1],
                                                }),
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.stepIconCircle,
                                                isDone && styles.stepIconCircleDone,
                                                isActive && styles.stepIconCircleActive,
                                            ]}
                                        >
                                            {renderStepIcon(step.icon, isActive, isDone)}
                                        </View>
                                        <Text
                                            style={[
                                                styles.stepLabel,
                                                isDone && styles.stepLabelDone,
                                                isActive && styles.stepLabelActive,
                                            ]}
                                        >
                                            {step.label}
                                        </Text>
                                        {isActive && (
                                            <ActivityIndicator
                                                size="small"
                                                color="#10B981"
                                            />
                                        )}
                                    </Animated.View>
                                );
                            })}
                        </View>

                        {/* Bottom hint */}
                        <Text style={styles.hint}>
                            {language === "si"
                                ? "මෙය තත්පර කිහිපයක් ගතවිය හැක..."
                                : "This may take a few seconds..."}
                        </Text>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: Platform.OS === "web" ? "90%" : width - 48,
        maxWidth: 400,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
    },
    modalContent: {
        padding: 28,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    iconGradient: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
        textAlign: "center",
    },
    fileName: {
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 16,
        maxWidth: "80%",
        textAlign: "center",
    },
    progressBarContainer: {
        width: "100%",
        marginBottom: 24,
    },
    progressBarBg: {
        width: "100%",
        height: 6,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
    },
    stepsContainer: {
        width: "100%",
        gap: 14,
        marginBottom: 20,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    stepIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F3F4F6",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    stepIconCircleActive: {
        backgroundColor: "#D1FAE5",
        borderColor: "#10B981",
    },
    stepIconCircleDone: {
        backgroundColor: "#ECFDF5",
        borderColor: "#10B981",
    },
    stepLabel: {
        fontSize: 14,
        color: "#6B7280",
        fontWeight: "500",
        flex: 1,
    },
    stepLabelActive: {
        color: "#047857",
        fontWeight: "700",
    },
    stepLabelDone: {
        color: "#059669",
        fontWeight: "600",
    },
    hint: {
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        fontStyle: "italic",
    },
});

export default SoilExtractionAnimation;
