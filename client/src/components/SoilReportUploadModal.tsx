import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, FileText, Camera, Upload } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface SoilReportUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onPickDocument: () => void;
    onPickImage: () => void;
    language: "si" | "en";
}

const SoilReportUploadModal: React.FC<SoilReportUploadModalProps> = ({
    visible,
    onClose,
    onPickDocument,
    onPickImage,
    language,
}) => {
    const content = {
        si: {
            title: "පස් වාර්තාව උඩුගත කරන්න",
            subtitle: "ඔබට අවශ්‍ය උඩුගත කිරීමේ ක්‍රමය තෝරන්න",
            pdfTitle: "PDF ලේඛනය",
            pdfDescription: "ගබඩා කර ඇති පස් පරීක්ෂණ PDF වාර්තාවක් තෝරන්න",
            photoTitle: "ඡායාරූපයක් ගන්න",
            photoDescription: "පස් පරීක්ෂණ වාර්තාවේ ඡායාරූපයක් ගන්න",
            cancel: "අවලංගු කරන්න",
        },
        en: {
            title: "Upload Soil Report",
            subtitle: "Choose how you'd like to upload your soil test report",
            pdfTitle: "PDF Document",
            pdfDescription: "Select a saved soil test report PDF from your device",
            photoTitle: "Take Photo",
            photoDescription: "Take a photo of your soil test report",
            cancel: "Cancel",
        },
    };

    const text = content[language];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            supportedOrientations={["portrait", "landscape"]}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={["#FFFFFF", "#F9FAFB"]}
                        style={styles.modalContent}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <X color="#6B7280" size={24} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <LinearGradient
                                    colors={["#10b981", "#059669"]}
                                    style={styles.iconGradient}
                                >
                                    <Upload color="#FFFFFF" size={28} />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>{text.title}</Text>
                            <Text style={styles.subtitle}>{text.subtitle}</Text>
                        </View>

                        {/* Upload Options */}
                        <View style={styles.optionsContainer}>
                            {/* PDF Option */}
                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={() => {
                                    onClose();
                                    setTimeout(() => onPickDocument(), 300);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionIconContainer}>
                                    <LinearGradient
                                        colors={["#3B82F6", "#2563EB"]}
                                        style={styles.optionIconGradient}
                                    >
                                        <FileText color="#FFFFFF" size={24} />
                                    </LinearGradient>
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>{text.pdfTitle}</Text>
                                    <Text style={styles.optionDescription}>
                                        {text.pdfDescription}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Photo Option */}
                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={() => {
                                    onClose();
                                    setTimeout(() => onPickImage(), 300);
                                }}
                                activeOpacity={0.7}
                            >
                                <View style={styles.optionIconContainer}>
                                    <LinearGradient
                                        colors={["#F59E0B", "#D97706"]}
                                        style={styles.optionIconGradient}
                                    >
                                        <Camera color="#FFFFFF" size={24} />
                                    </LinearGradient>
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>{text.photoTitle}</Text>
                                    <Text style={styles.optionDescription}>
                                        {text.photoDescription}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            
                            <Text style={styles.cancelButtonText}>{text.cancel}</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        ...Platform.select({
            web: {
                position: "fixed" as any,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            },
        }),
    },
    modalContainer: {
        width: Platform.OS === "web" ? "90%" : width - 40,
        maxWidth: 500,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        ...Platform.select({
            web: {
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)" as any,
            },
        }),
    },
    modalContent: {
        padding: 24,
        paddingBottom: 20,
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 12,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconGradient: {
        width: "100%",
        height: "100%",
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    optionIconContainer: {
        marginRight: 14,
    },
    optionIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1F2937",
        marginBottom: 3,
    },
    optionDescription: {
        fontSize: 13,
        color: "#6B7280",
        lineHeight: 18,
    },
    cancelButton: {
        paddingVertical: 13,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
});

export default SoilReportUploadModal;
