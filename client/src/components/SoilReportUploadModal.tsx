import React, { useState } from "react";
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
    language: "si" | "en" | "ta";
}

const SoilReportUploadModal: React.FC<SoilReportUploadModalProps> = ({
    visible,
    onClose,
    onPickDocument,
    onPickImage,
    language,
}) => {
    const [pdfPressed, setPdfPressed] = useState(false);
    const [photoPressed, setPhotoPressed] = useState(false);

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
            photoTitle: "Take a Photo",
            photoDescription: "Take a photo of your soil test report",
            cancel: "Cancel",
        },
        ta: {
            title: "மண் அறிக்கையை பதிவேற்றவும்",
            subtitle: "மண் பரிசோதனை அறிக்கையை எவ்வாறு பதிவேற்ற விரும்புகிறீர்கள் என்பதை தேர்ந்தெடுக்கவும்",
            pdfTitle: "PDF ஆவணம்",
            pdfDescription: "உங்கள் சாதனத்திலிருந்து சேமிக்கப்பட்ட மண் பரிசோதனை அறிக்கை PDF ஐ தேர்ந்தெடுக்கவும்",
            photoTitle: "புகைப்படம் எடுக்கவும்",
            photoDescription: "உங்கள் மண் பரிசோதனை அறிக்கையின் புகைப்படம் எடுக்கவும்",
            cancel: "ரத்து செய்",
        },
    };

    const text = content[language] ?? content["en"];

    const handlePickDocument = () => {
        onClose();
        setTimeout(() => onPickDocument(), 300);
    };

    const handlePickImage = () => {
        onClose();
        setTimeout(() => onPickImage(), 300);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            supportedOrientations={["portrait", "landscape"]}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={styles.modalContainer}
                    onStartShouldSetResponder={() => true}
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
                            style={[
                                styles.optionCard,
                                pdfPressed && styles.optionCardPressed,
                            ]}
                            onPressIn={() => setPdfPressed(true)}
                            onPressOut={() => setPdfPressed(false)}
                            onPress={handlePickDocument}
                            activeOpacity={0.8}
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
                            style={[
                                styles.optionCard,
                                photoPressed && styles.optionCardPressed,
                            ]}
                            onPressIn={() => setPhotoPressed(true)}
                            onPressOut={() => setPhotoPressed(false)}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
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
                </View>
            </TouchableOpacity>
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
    },
    modalContainer: {
        width: width - 40,
        maxWidth: 500,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        padding: 24,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
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
        color: "#111827",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    optionsContainer: {
        marginBottom: 16,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
    },
    optionCardPressed: {
        backgroundColor: "#F0FDF4",
        borderColor: "#10B981",
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
        fontWeight: "700",
        color: "#111827",
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: "#4B5563",
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
        color: "#4B5563",
    },
});

export default SoilReportUploadModal;
