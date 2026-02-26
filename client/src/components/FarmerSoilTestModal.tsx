import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TestTube, X, AlertCircle, CheckCircle2 } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface FarmerSoilTestModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onNoData: () => void;
  language: "si" | "en";
}

const FarmerSoilTestModal: React.FC<FarmerSoilTestModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onNoData,
  language,
}) => {
  const content = {
    si: {
      title: "පස් පරීක්ෂණ වාර්තාව",
      subtitle: "ඔබට පරීක්ෂා කළ පස් වාර්තාවක් තිබේද? ඔබට දැන් පස් වාර්තාවක් උඩුගත කළ හැකිය",
      requiredData: "වාර්තාවේ ඇතුළත් දත්ත:",
      dataItems: [
        {
          title: "පස් pH මට්ටම",
          description: "පස්වල ආම්ලිකතාව හෝ ක්ෂාරතාව මැනීම (0-14 පරාසය)"
        },
        {
          title: "නයිට්‍රජන් (N)",
          description: "පස්වල නයිට්‍රජන් අන්තර්ගතය (ppm වලින්)"
        },
        {
          title: "පොස්පරස් (P)",
          description: "පස්වල පොස්පරස් අන්තර්ගතය (ppm වලින්)"
        },
        {
          title: "පොටෑසියම් (K)",
          description: "පස්වල පොටෑසියම් අන්තර්ගතය (ppm වලින්)"
        },
        {
          title: "සාරවත් දර්ශකය",
          description: "සමස්ත පස් සාරවත්කම මට්ටම (0-1 පරාසය)"
        }
      ],
      question: "පස් වාර්තාව ඔබ සතුව තිබේද?",
      noButton: "නැත",
      yesButton: "ඔව්",
      importance: "මෙම දත්ත නොමැතිව පුරෝකථනය අඩු නිවැරදි වනු ඇත"
    },
    en: {
      title: "Soil Test Report",
      subtitle: "Do you have a tested soil report? You can upload your soil report now to auto-fill the data",
      requiredData: "Report Data Includes:",
      dataItems: [
        {
          title: "Soil pH Level",
          description: "Measure of soil acidity or alkalinity (0-14 range)"
        },
        {
          title: "Nitrogen (N)",
          description: "Soil nitrogen content (in ppm)"
        },
        {
          title: "Phosphorus (P)",
          description: "Soil phosphorus content (in ppm)"
        },
        {
          title: "Potassium (K)",
          description: "Soil potassium content (in ppm)"
        },
        {
          title: "Fertility Index",
          description: "Overall soil fertility level (0-1 range)"
        }
      ],
      question: "Would you like to upload your soil report?",
      noButton: "No",
      yesButton: "Yes",
      importance: "Without this data, predictions will be less accurate"
    }
  };

  const text = content[language];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
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
                  <TestTube color="#FFFFFF" size={32} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>{text.title}</Text>
              <Text style={styles.subtitle}>{text.subtitle}</Text>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Required Data Section */}
              <Text style={styles.requiredDataTitle}>{text.requiredData}</Text>

              {text.dataItems.map((item, index) => (
                <View key={index} style={styles.dataItem}>
                  <View style={styles.dataHeader}>
                    <View style={styles.checkIcon}>
                      <CheckCircle2 color="#10b981" size={18} />
                    </View>
                    <Text style={styles.dataTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.dataDescription}>{item.description}</Text>
                </View>
              ))}

              {/* Warning Box */}
              <View style={styles.warningContainer}>
                <AlertCircle color="#F59E0B" size={20} />
                <Text style={styles.warningText}>{text.importance}</Text>
              </View>

              {/* Question */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{text.question}</Text>
              </View>
            </ScrollView>

            {/* Action Buttons - Fixed at bottom */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.noButton}
                onPress={onNoData}
                activeOpacity={0.7}
              >
                <Text style={styles.noButtonText}>{text.noButton}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.yesButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.yesGradient}
                >
                  <Text style={styles.yesButtonText}>{text.yesButton}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
  },
  modalContainer: {
    width: Platform.OS === 'web' ? '90%' : width - 40,
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' as any,
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
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    maxHeight: Platform.OS === 'ios' ? 260 : 280,
  },
  requiredDataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  dataItem: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dataHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkIcon: {
    marginRight: 8,
  },
  dataTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
    flex: 1,
  },
  dataDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginLeft: 26,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 10,
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
  },
  questionContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065F46",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  noButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  noButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  yesButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  yesGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  yesButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default FarmerSoilTestModal;
