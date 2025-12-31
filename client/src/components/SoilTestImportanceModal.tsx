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
import { Lightbulb, X, CheckCircle2, Phone } from "lucide-react-native";

const { width } = Dimensions.get("window");

interface SoilTestImportanceModalProps {
  visible: boolean;
  onClose: () => void;
  onRequestSoilTest: () => void;
  language: "si" | "en";
}

const SoilTestImportanceModal: React.FC<SoilTestImportanceModalProps> = ({
  visible,
  onClose,
  onRequestSoilTest,
  language,
}) => {
  const content = {
    si: {
      title: "පස් පරීක්ෂණයේ වැදගත්කම",
      subtitle: "ඔබේ ගොවිතැනේ සාර්ථකත්වය සඳහා පස් පරීක්ෂණය ඉතා වැදගත්!",
      benefits: "ප්‍රතිලාභ:",
      benefitsList: [
        {
          title: "නිවැරදි අස්වැන්න පුරෝකථනය",
          description: "ඔබේ ඉඩමේ නිශ්චිත තත්ත්වයන් මත පදනම් වූ නිවැරදි අස්වැන්න ඇස්තමේන්තු ලබා ගන්න"
        },
        {
          title: "සුදුසු පොහොර නිර්දේශ",
          description: "ඔබේ පස්වල අවශ්‍යතා අනුව නිවැරදි පොහොර වර්ග සහ ප්‍රමාණ තීරණය කරන්න"
        },
        {
          title: "වියදම් ඉතිරි කිරීම",
          description: "අනවශ්‍ය පොහොර භාවිතය වළක්වා මුදල් ඉතිරි කර ගන්න"
        },
        {
          title: "වැඩි අස්වැන්නක්",
          description: "ප්‍රශස්ත පස් කළමනාකරණයෙන් වැඩි අස්වැන්නක් ලබා ගන්න"
        }
      ],
      contactTitle: "පස් පරීක්ෂණයක් ලබා ගන්නේ කෙසේද?",
      contactDescription: "ඔබේ ආසන්නතම කෘෂිකර්ම නිලධාරියා හෝ කෘෂිකර්ම දෙපාර්තමේන්තුව සම්බන්ධ කර ගෙන පස් පරීක්ෂණයක් ඉල්ලන්න.\n\nපස් සාම්පල පරීක්ෂණ කිරීම සඳහා අයදුම් සිදු කර ගත හැක:\n\n• කෘෂිකර්ම බෝග පර්යේෂණ හා සංවර්ධන ආයතනය, මැල්ලවපිටිය – 025 – 2249132\n\n• දේශීය බෝග පර්යේෂණ හා සංවර්ධන ආයතනය, ගන්නොරුව – 081 – 2388011\n\n• මාළු හා ගොල් බෝග පර්යේෂණ හා සංවර්ධන මධ්‍යස්ථානය, අම්බලන්ගොඩ – 047 – 2228204\n\n• ප්‍රාදේශීය කෘෂිකර්ම පර්යේෂණ හා සංවර්ධන මධ්‍යස්ථානය, අරලගන්විල – 027 – 5671054",
      warning: "පස් පරීක්ෂණ දත්ත නොමැතිව, අස්වැන්න පුරෝකථනය අඩු නිවැරදි වන අතර පොහොර නිර්දේශ සාමාන්‍ය මට්ටමේ පමණක් වනු ඇත.",
      requestButton: "පස් පරීක්ෂණයක් අපගේ App එක හරහා ඉල්ලුම් කරන්න"
    },
    en: {
      title: "Importance of Soil Testing",
      subtitle: "Soil testing is crucial for your farming success!",
      benefits: "Benefits:",
      benefitsList: [
        {
          title: "Accurate Yield Prediction",
          description: "Get precise yield estimates based on your land's specific conditions"
        },
        {
          title: "Proper Fertilizer Recommendations",
          description: "Determine the right fertilizer types and amounts based on your soil needs"
        },
        {
          title: "Cost Savings",
          description: "Save money by avoiding unnecessary fertilizer usage"
        },
        {
          title: "Higher Yields",
          description: "Achieve better harvests through optimal soil management"
        }
      ],
      contactTitle: "How to Get a Soil Test?",
      contactDescription: "Contact your nearest agricultural officer or the Department of Agriculture to request a soil test.\n\nYou can apply for soil sample testing at:\n\n• Field Crops Research & Development Institute, Maha Illuppallama – 025 – 2249132\n\n• Regional Rice Research & Development Center, Gonnoruwa – 081 – 2388011\n\n• Grain Legumes & Oil Crops Research & Development Center, Angunakolapelessa – 047 – 2228204\n\n• Regional Agricultural Research & Development Center, Aralaganwila – 027 – 5671054",
      warning: "Without soil test data, yield predictions will be less accurate and fertilizer recommendations will be generic.",
      requestButton: "Request a soil test through our App"
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
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.iconGradient}
                >
                  <Lightbulb color="#FFFFFF" size={32} />
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
              {/* Benefits Section */}
              <Text style={styles.benefitsTitle}>{text.benefits}</Text>
              
              {text.benefitsList.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <View style={styles.benefitHeader}>
                    <View style={styles.checkIcon}>
                      <CheckCircle2 color="#10b981" size={18} />
                    </View>
                    <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  </View>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              ))}

              {/* Contact Section */}
              <View style={styles.contactSection}>
                <View style={styles.contactHeader}>
                  <Phone color="#3B82F6" size={20} />
                  <Text style={styles.contactTitle}>{text.contactTitle}</Text>
                </View>
                <Text style={styles.contactDescription}>{text.contactDescription}</Text>
              </View>

              {/* Warning Box */}
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{text.warning}</Text>
              </View>
            </ScrollView>

            {/* Action Button - Fixed at bottom */}
            <TouchableOpacity
              style={styles.requestButton}
              onPress={onRequestSoilTest}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.requestGradient}
              >
                <Text style={styles.requestButtonText}>{text.requestButton}</Text>
              </LinearGradient>
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
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    shadowColor: "#F59E0B",
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
  scrollContainer: {
    maxHeight: 280,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  benefitItem: {
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  benefitHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkIcon: {
    marginRight: 8,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#10b981",
    flex: 1,
  },
  benefitDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginLeft: 26,
  },
  contactSection: {
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginTop: 14,
    marginBottom: 4,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E40AF",
    flex: 1,
  },
  contactDescription: {
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  warningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  requestButton: {
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  requestGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default SoilTestImportanceModal;
