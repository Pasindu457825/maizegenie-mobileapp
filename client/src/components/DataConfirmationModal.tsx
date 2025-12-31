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
import { CheckCircle2, X } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface DataConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  language: "si" | "en";
}

const DataConfirmationModal: React.FC<DataConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  language,
}) => {
  const content = {
    si: {
      title: "දත්ත තහවුරු කිරීම",
      subtitle: "අස්වැන්න පුරෝකථනය සඳහා ඔබ පහත දත්ත එකතු කර තිබේද?",
      checklist: [
        {
          title: "ස්ථාන සහ පස් දත්ත",
          items: ["pH මට්ටම", "NPK මට්ටම් (නයිට්‍රජන්, පොස්පරස්, පොටෑසියම්)", "පස් තත්ත්වය"]
        },
        {
          title: "දේශගුණික දත්ත",
          items: ["වර්ෂාපතනය (30 දින සහ කන්නය)", "උෂ්ණත්වය (සාමාන්‍ය සහ උපරිම)", "ආර්ද්‍රතාවය සහ හිරු එළිය"]
        },
        {
          title: "වගා තොරතුරු",
          items: ["බීජ ප්‍රභේදය", "වගා කළ දිනය සහ කන්නය", "ක්ෂේත්‍ර ප්‍රමාණය", "පොහොර දිනයන්"]
        },
        {
          title: "පොහොර සහ වාරිමාර්ග",
          items: ["පොහොර දිනයන්", "වාරිමාර්ග ක්‍රමය"]
        }
      ],
      question: "දිගටම කරගෙන යාමට සූදානම්ද?",
      cancel: "අවලංගු කරන්න",
      proceed: "ඔව්"
    },
    en: {
      title: "Data Confirmation",
      subtitle: "Have you collected the following data for yield prediction?",
      checklist: [
        {
          title: "Location & Soil Data",
          items: ["pH levels", "NPK levels (Nitrogen, Phosphorus, Potassium)", "Soil condition"]
        },
        {
          title: "Climate Data",
          items: ["Rainfall (30-day and seasonal)", "Temperature (average and maximum)", "Humidity and sunshine hours"]
        },
        {
          title: "Cultivation Information",
          items: ["Seed variety", "Planting date and season", "Field size", "Fertilizer application dates"]
        },
        {
          title: "Irrigation",
          items: ["Irrigation type"]
        }
      ],
      question: "Ready to proceed?",
      cancel: "Cancel",
      proceed: "Yes"
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
                  <CheckCircle2 color="#FFFFFF" size={32} />
                </LinearGradient>
              </View>
              <Text style={styles.title}>{text.title}</Text>
              <Text style={styles.subtitle}>{text.subtitle}</Text>
            </View>

            {/* Checklist */}
            <ScrollView 
              style={styles.checklistContainer}
              showsVerticalScrollIndicator={false}
            >
              {text.checklist.map((section, index) => (
                <View key={index} style={styles.checklistSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.checkIcon}>
                      <CheckCircle2 color="#10b981" size={20} />
                    </View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  {section.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.checklistItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.itemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>

            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{text.question}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{text.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.proceedButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.proceedGradient}
                >
                  <Text style={styles.proceedButtonText}>{text.proceed}</Text>
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
    maxHeight: "85%",
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
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
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
  checklistContainer: {
    maxHeight: 280,
    marginBottom: 16,
  },
  checklistSection: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    flex: 1,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 28,
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
    marginTop: 7,
    marginRight: 10,
  },
  itemText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
    lineHeight: 20,
  },
  questionContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#92400E",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
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
  proceedButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  proceedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default DataConfirmationModal;
