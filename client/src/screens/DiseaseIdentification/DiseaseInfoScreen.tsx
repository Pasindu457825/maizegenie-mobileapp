import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Leaf,
  AlertCircle,
  Thermometer,
  Droplets,
  Shield,
  Sprout,
  Bug,
  MessageSquare,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import { StackNavigationProp } from "@react-navigation/stack";

// 🌐 LANGUAGE CONTEXT
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

// ------------------ ROUTE TYPE ------------------
type DiseaseInfoRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

interface Props {
  route: DiseaseInfoRouteProp;
}

// ---------- DISEASE DATABASE ----------
const DISEASE_INFO: Record<
  string,
  {
    en: {
      name: string;
      overview: string;
      symptoms: string[];
      causes: string[];
      conditions: string[];
      management: string[];
      prevention: string[];
      severity: "Low" | "Medium" | "High";
      spreadRate: "Slow" | "Moderate" | "Rapid";
    };
    si: {
      name: string;
      overview: string;
      symptoms: string[];
      causes: string[];
      conditions: string[];
      management: string[];
      prevention: string[];
      severity: "අඩු" | "මධ්‍යම" | "ඉහළ";
      spreadRate: "මන්දගාමී" | "මධ්‍යම" | "වේගවත්";
    };
  }
> = {
  common_rust: {
    en: {
      name: "Common Rust",
      overview:
        "Common rust is caused by Puccinia sorghi and spreads rapidly in humid, cool conditions. It affects photosynthesis and reduces yield.",
      symptoms: [
        "Reddish-brown raised pustules on leaves",
        "Yellow halos around lesions",
        "Black hardened spores in late stages",
        "Premature leaf drying",
      ],
      causes: [
        "Wind-borne fungal spores",
        "High humidity environments",
        "Dense crop planting",
        "Contaminated equipment",
      ],
      conditions: [
        "Cool temperatures (16–24°C)",
        "Moist leaf surfaces for 6+ hours",
        "Morning dew persistence",
        "Shaded field conditions",
      ],
      management: [
        "Apply fungicides at first signs",
        "Use rust-resistant maize varieties",
        "Remove severely infected leaves",
        "Increase plant spacing",
      ],
      prevention: [
        "Implement crop rotation every 2-3 years",
        "Avoid overcrowding plants",
        "Destroy infected crop residue",
        "Use certified disease-free seeds",
      ],
      severity: "Medium",
      spreadRate: "Rapid",
    },

    si: {
      name: "සාමාන්‍ය රස්ට්",
      overview:
        "සාමාන්‍ය රස්ට් *Puccinia sorghi* මගින් ඇතිවන අතර තෙත් හා තද සීතල තත්ත්වයන්හි වේගයෙන් පැතිරෙයි. එය පසිරු ක්‍රියාවට බලපා අස්වැන්න අඩු කරයි.",
      symptoms: [
        "පත්‍ර මත රතු-දුඹුරු ඉහපත් පැන්ද",
        "ලක්ෂණ වටා කහ පැහැති දායකතා",
        "අවසන් අවධියේ කළු බීජක",
        "කල්පනාවෙන් පත්‍ර වියළීම",
      ],
      causes: [
        "කාරුවලින් පැතිරෙන සෙවෙලි බීජ",
        "ඉහළ ආර්ද්‍රතා පරිසර",
        "තද spacing වගාව",
        "දූෂිත උපකරණ",
      ],
      conditions: [
        "16–24°C අතර සීතල තත්ත්වයන්",
        "පත්‍ර මත 6+ පැය තෙතමනය",
        "උදේ තෙත්මනය පවතීම",
        "සෙවණැලි පරිසරය",
      ],
      management: [
        "පළමු ලක්ෂණ දකින විට ශාකනාශක යෙදීම",
        "රස්ට්-ප්‍රතිරෝධී මයිස් වර්ග භාවිතය",
        "බරපෑම ඇති පත්‍ර ඉවත් කිරීම",
        "ශාක අතර දුර වැඩි කිරීම",
      ],
      prevention: [
        "සෑම 2-3 වසරකට වරක් බෝග හුවමාරුව කිරීම",
        "ශාක අධික ලෙස එකට නොවැඩීම",
        "ආසාදිත අවශේෂ විනාශ කිරීම",
        "සහතික කළ රෝග-මුදා හරින ලද බීජ භාවිතය",
      ],
      severity: "මධ්‍යම",
      spreadRate: "වේගවත්",
    },
  },

  blight: {
    en: {
      name: "Leaf Blight",
      overview:
        "Leaf blight spreads rapidly and reduces photosynthesis significantly, weakening the plant structure and yield potential.",
      symptoms: [
        "Large irregular brown lesions on leaves",
        "Leaf curling and rapid drying",
        "Dark spreading borders around spots",
        "Complete leaf collapse in severe cases",
      ],
      causes: [
        "Fungal residue from previous crops",
        "Rain splash dispersion",
        "Poor air circulation",
        "Infected planting material",
      ],
      conditions: [
        "Warm weather (25-30°C)",
        "Frequent rainfall or irrigation",
        "Morning dew accumulation",
        "High humidity periods",
      ],
      management: [
        "Improve plant spacing for better airflow",
        "Apply systemic fungicides early",
        "Destroy infected plant residue",
        "Use copper-based fungicides",
      ],
      prevention: [
        "Use certified clean seeds",
        "Implement 3-year crop rotation",
        "Avoid excess nitrogen fertilizer",
        "Remove volunteer plants",
      ],
      severity: "High",
      spreadRate: "Rapid",
    },

    si: {
      name: "පත්‍ර බ්ලයිට්",
      overview:
        "පත්‍ර බ්ලයිට් වේගයෙන් පැතිරිණි. එය පසිරු ක්‍රියාව සැලකිය යුතු ලෙස අඩු කර ශාක ව්‍යුහය හා අස්වැන්න දුර්වල කරයි.",
      symptoms: [
        "පත්‍ර මත විශාල අක්‍රමවත් දුඹුරු පැල්ලම්",
        "පත්‍ර හැරීම හා වේගයෙන් වියළීම",
        "තිත වටා කළු අසිරියක් පැතිරීම",
        "දැඩි අවස්ථාවල පත්‍ර සම්පූර්ණයෙන් බිඳ වැටීම",
      ],
      causes: [
        "පෙර වගාවෙන් සෙවෙලි අවශේෂ",
        "වැසි බිංදු විහිදීම",
        "නරක වාතාශ්‍රය",
        "ආසාදිත රෝපණ ද්‍රව්‍ය",
      ],
      conditions: [
        "උණුසුම් කාලගුණය (25-30°C)",
        "නිතර වැසි හෝ ජල සෙචනය",
        "උදේ තෙත්මනය රැස් වීම",
        "ඉහළ ආර්ද්‍රතා කාල පරිච්ඡේද",
      ],
      management: [
        "හොඳ වාතාශ්‍රය සඳහා ශාක අතර දුර වැඩි කිරීම",
        "කාලයට පෙර ක්‍රමානුකූල ශාකනාශක යෙදීම",
        "ආසාදිත ශාක අවශේෂ විනාශ කිරීම",
        "තඹ මත පදනම් වූ ශාකනාශක භාවිතය",
      ],
      prevention: [
        "සහතික කළ ශුද්ධ බීජ භාවිතා කිරීම",
        "වසර 3 ක බෝග හුවමාරුව ක්‍රියාත්මක කිරීම",
        "අධික නයිට්‍රජන් පොහොර භාවිතයෙන් වැළකී සිටීම",
        "ස්වේච්ඡා ශාක ඉවත් කිරීම",
      ],
      severity: "ඉහළ",
      spreadRate: "වේගවත්",
    },
  },

  gray_leaf_spot: {
    en: {
      name: "Gray Leaf Spot",
      overview:
        "Gray leaf spot severely damages maize leaves, reducing photosynthetic area and causing significant yield losses in susceptible varieties.",
      symptoms: [
        "Long rectangular gray lesions between veins",
        "Parallel lesion patterns along leaf veins",
        "Lower leaves drying and dying first",
        "Lesion enlargement under humid conditions",
      ],
      causes: [
        "Fungal spores in crop debris",
        "High humidity environments",
        "Continuous maize cropping",
        "Susceptible hybrid varieties",
      ],
      conditions: [
        "Humidity consistently above 90%",
        "Warm nights with dew",
        "Dense plant canopy",
        "Poor air movement",
      ],
      management: [
        "Plant resistant hybrid varieties",
        "Apply fungicide before tasseling stage",
        "Destroy infected crop residue post-harvest",
        "Use foliar fungicide applications",
      ],
      prevention: [
        "Seasonal crop rotation with non-host crops",
        "Avoid overhead irrigation methods",
        "Reduce plant canopy density",
        "Monitor fields regularly for early detection",
      ],
      severity: "High",
      spreadRate: "Moderate",
    },

    si: {
      name: "දුඹුරු පත්‍ර රෝගය",
      overview:
        "දුඹුරු පත්‍ර රෝගය මයිස් පත්‍රවලට බරපතල හානියක් කරයි, පසිරු ප්‍රදේශය අඩු කර සංවේදී වර්ගවල අස්වැන්නේ සැලකිය යුතු පාඩු සිදු කරයි.",
      symptoms: [
        "සිරුරු අතර දිගු අළු පැහැති පැල්ලම්",
        "පත්‍ර සිරුරු දිගේ සමන්තර පැටවුම්",
        "පහළ පත්‍ර මුලින් වියළීම හා මරණය",
        "ආර්ද්‍රතා තත්ත්ව යටතේ පැල්ලම් විශාල වීම",
      ],
      causes: [
        "වගා අවශේෂ වල සෙවෙලි බීජ",
        "ඉහළ ආර්ද්‍රතා පරිසර",
        "නිරන්තර මයිස් වගාව",
        "සංවේදී අභිජනන වර්ග",
      ],
      conditions: [
        "90% ට වැඩි නිරන්තර ආර්ද්‍රතාව",
        "තෙත්මනය සහිත උණුසුම් රාත්‍රි",
        "තද ශාක canopy",
        "නරක වාත සංසරණය",
      ],
      management: [
        "ප්‍රතිරෝධී අභිජනන වර්ග රෝපණය කිරීම",
        "Tasseling අවධියට පෙර ශාකනාශක යෙදීම",
        "අස්වැන්නෙන් පසු ආසාදිත වගා අවශේෂ විනාශ කිරීම",
        "පත්‍ර ශාකනාශක යෙදීම් භාවිතය",
      ],
      prevention: [
        "ධර්මිත නොවන බෝග සමඟ සෘතුමය බෝග හුවාරුව",
        "උඩින් ජල සැපයුම් ක්‍රම වලක්වා ගැනීම",
        "ශාක canopy ඝනත්වය අඩු කිරීම",
        "කල්පනා හඳුනාගැනීම සඳහා ක්‍ෂේත්‍ර නිතිපතා නිරීක්ෂණය කිරීම",
      ],
      severity: "ඉහළ",
      spreadRate: "මධ්‍යම",
    },
  },
};

// ------------------ COMPONENT ------------------
export default function DiseaseInfoScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();
  const { predictions } = route.params;

  // 🌐 GLOBAL LANGUAGE (sinhala / english)
  const { language: lang, setLanguage } = useLanguage();
  const language = lang === "sinhala" ? "si" : "en";

  // 🌐 UI TRANSLATIONS
  const content = {
    si: {
      back: "ආපසු",
      contactOfficer: "කෘෂිකාර්මික නිලධාරිය අමතන්න",
      header: "රෝග විස්තර",
      overview: "දළ විස්තරය",
      symptoms: "රෝග ලක්ෂණ",
      causes: "හේතූන්",
      conditions: "හිතකර තත්ත්වයන්",
      management: "කළමනාකරණ නිර්දේශ",
      prevention: "රෝග වැළැක්වීමේ උපදෙස්",
      diseaseInfo: "රෝග තොරතුරු",
      aiAnalysis: "AI විශ්ලේෂණය",
      location: "ස්ථානය",
      status: "තත්ත්වය",
      severityLevel: "දැඩි මට්ටම",
      spreadRate: "පැතිරීමේ වේගය",
      immediateAction: "ක්ෂණික ක්‍රියාමාර්ග",
      monitoring: "සමීක්ෂණය",
      treatment: "ප්‍රතිකර්ම",
      detection: "හඳුනාගැනීම",
      viewChat: "කතාබස් අරඹන්න",
      riskAssessment: "අවදානම් තක්සේරුව",
      lowRisk: "අවදානම අඩු",
      mediumRisk: "මධ්‍යම අවදානම",
      highRisk: "අවදානම ඉහළ",
      slowSpread: "මන්දගාමී",
      moderateSpread: "මධ්‍යම",
      rapidSpread: "වේගවත්",
    },
    en: {
      back: "Back",
      contactOfficer: "Contact Agro Officer",
      header: "Disease Information",
      overview: "Overview",
      symptoms: "Symptoms",
      causes: "Causes",
      conditions: "Favorable Conditions",
      management: "Management Recommendations",
      prevention: "Prevention Tips",
      diseaseInfo: "Disease Information",
      aiAnalysis: "AI Analysis",
      location: "Location",
      status: "Status",
      severityLevel: "Severity Level",
      spreadRate: "Spread Rate",
      immediateAction: "Immediate Action",
      monitoring: "Monitoring",
      treatment: "Treatment",
      detection: "Detection",
      viewChat: "Start Conversation",
      riskAssessment: "Risk Assessment",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",
      slowSpread: "Slow",
      moderateSpread: "Moderate",
      rapidSpread: "Rapid",
    },
  };

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev.includes("low") || sev.includes("අඩු")) return "#10B981";
    if (sev.includes("medium") || sev.includes("මධ්‍යම")) return "#F59E0B";
    return "#EF4444";
  };

  // Get color for spread rate
  const getSpreadColor = (rate: string) => {
    const r = rate.toLowerCase();
    if (r.includes("slow") || r.includes("මන්දගාමී")) return "#10B981";
    if (r.includes("moderate") || r.includes("මධ්‍යම")) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {content[language].diseaseInfo}
          </Text>
          <Text style={styles.headerSubtitle}>
            {content[language].aiAnalysis}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chat Assistant Button */}

        {/* Disease Information */}
        {predictions?.map((p, i) => {
          const key = p.class_name.toLowerCase().replace(/ /g, "_");
          const disease = DISEASE_INFO[key]?.[language];

          if (!disease) return null;

          return (
            <View key={i} style={styles.diseaseCard}>
              {/* Disease Header */}
              <View style={styles.diseaseHeader}>
                <View style={styles.diseaseIconContainer}>
                  <Bug size={24} color="#059669" />
                </View>
                <View style={styles.diseaseTitleContainer}>
                  <Text style={styles.diseaseName}>{disease.name}</Text>
                  <Text style={styles.confidenceText}>
                    {Math.round(p.confidence * 100)}%{" "}
                    {language === "si" ? "නිරවද්‍යතාව" : "Confidence"}
                  </Text>
                </View>
              </View>

              {/* Risk Assessment */}
              <View style={styles.riskContainer}>
                <Text style={styles.riskTitle}>
                  {content[language].riskAssessment}
                </Text>
                <View style={styles.riskBadges}>
                  <View style={styles.riskBadge}>
                    <Thermometer
                      size={14}
                      color={getSeverityColor(disease.severity)}
                    />
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: getSeverityColor(disease.severity) },
                      ]}
                    >
                      {content[language].severityLevel}: {disease.severity}
                    </Text>
                  </View>
                  <View style={styles.riskBadge}>
                    <Sprout
                      size={14}
                      color={getSpreadColor(disease.spreadRate)}
                    />
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: getSpreadColor(disease.spreadRate) },
                      ]}
                    >
                      {content[language].spreadRate}: {disease.spreadRate}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Overview Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={18} color="#059669" />
                  <Text style={styles.sectionTitle}>
                    {content[language].overview}
                  </Text>
                </View>
                <Text style={styles.sectionContent}>{disease.overview}</Text>
              </View>

              {/* Symptoms Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertTriangle size={18} color="#EF4444" />
                  <Text style={styles.sectionTitle}>
                    {content[language].symptoms}
                  </Text>
                </View>
                {disease.symptoms.map((symptom, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View style={styles.listDot} />
                    <Text style={styles.listText}>{symptom}</Text>
                  </View>
                ))}
              </View>

              {/* Causes Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertCircle size={18} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>
                    {content[language].causes}
                  </Text>
                </View>
                {disease.causes.map((cause, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View
                      style={[styles.listDot, { backgroundColor: "#F59E0B" }]}
                    />
                    <Text style={styles.listText}>{cause}</Text>
                  </View>
                ))}
              </View>

              {/* Conditions Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Thermometer size={18} color="#10B981" />
                  <Text style={styles.sectionTitle}>
                    {content[language].conditions}
                  </Text>
                </View>
                {disease.conditions.map((condition, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View
                      style={[styles.listDot, { backgroundColor: "#10B981" }]}
                    />
                    <Text style={styles.listText}>{condition}</Text>
                  </View>
                ))}
              </View>

              {/* Management Section - Highlighted */}
              <View style={[styles.section, styles.managementSection]}>
                <View style={styles.sectionHeader}>
                  <Shield size={18} color="#059669" />
                  <Text style={[styles.sectionTitle, { color: "#059669" }]}>
                    {content[language].management}
                  </Text>
                </View>
                {disease.management.map((action, idx) => (
                  <View
                    key={idx}
                    style={[styles.listItem, styles.managementItem]}
                  >
                    <View
                      style={[styles.listDot, { backgroundColor: "#059669" }]}
                    />
                    <Text style={[styles.listText, styles.managementText]}>
                      {action}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Prevention Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={styles.sectionTitle}>
                    {content[language].prevention}
                  </Text>
                </View>
                {disease.prevention.map((tip, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <View
                      style={[styles.listDot, { backgroundColor: "#10B981" }]}
                    />
                    <Text style={styles.listText}>{tip}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() =>
                    navigation.navigate("Chat", {
                      roomId: null,
                      userId: "",
                    })
                  }
                >
                  <MessageSquare size={18} color="#FFFFFF" />
                  <Text style={styles.contactButtonText}>
                    {content[language].contactOfficer}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#059669",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#D1FAE5",
    opacity: 0.9,
  },
  langButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  langText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  diseaseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  diseaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  diseaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  diseaseTitleContainer: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  riskContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  riskBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  sectionContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  managementSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#059669",
    marginTop: 7,
  },
  listText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  managementItem: {
    marginBottom: 10,
  },
  managementText: {
    fontWeight: "600",
    color: "#059669",
  },
  actionButtons: {
    marginTop: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#059669",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
