import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from "react-native";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Leaf,
  TrendingUp,
  Info,
  Package,
  MessageCircle,
  Calendar,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type Language = "si" | "en";

const content = {
  si: {
    title: "පොහොර උපදේශ",
    subtitle: "විශ්ලේෂණ ප්‍රතිඵල",
    observation: "නිරීක්ෂණය",
    cause: "හේතුව",
    reasoning: "විශ්ලේෂණය",
    advice: "උපදේශ",
    recommendations: "නිර්දේශිත පොහොර",
    warnings: "අවවාද",
    applyToday: "අද යෙදීම",
    canApply: "අද පොහොර යෙදීම සුදුසුයි",
    cannotApply: "අද පොහොර යෙදීම නිර්දේශ නොකරයි",
    detectedIssues: "හඳුනාගත් කරුණු",
    fertilizer: "පොහොර",
    amount: "ප්‍රමාණය",
    timing: "කාලය",
    priority: "ප්‍රමුඛතාවය",
    high: "ඉහළ",
    medium: "මධ්‍යම",
    low: "අඩු",
    newAnalysis: "නව විශ්ලේෂණයක්",
    yourInput: "ඔබේ ආදානය",
    officialSource: "මූලාශ්‍ර ආධාරකය: DOA/CIC (Rule-Based)",
    contactOfficer: "කෘෂිකර්ම නිලධාරියෙකුගෙන් උපදෙස් ලබා ගන්න",
    contactOfficerDesc: "ඔබේ ප්‍රතිඵල සහ තොරතුරු නිලධාරියෙකු සමඟ බෙදා ගන්න",
    fertilizerSchedule: "පොහොර කාලසටහන",
    plantingDate: "වගා කළ දිනය",
    basalApplication: "Basal Application",
    basalLabel: "මූලික පොහොර යෙදීම",
    atPlanting: "වගා කිරීමේදී",
    topDress1: "Top Dress 1",
    topDress1Label: "පළමු ඉහළ පොහොර යෙදීම",
    nearDay25: "දින 25 ආසන්නයේ",
    topDress2: "Top Dress 2",
    topDress2Label: "දෙවන ඉහළ පොහොර යෙදීම",
    nearDay52: "දින 52 ආසන්නයේ",
    scheduleInfo: "පොහොර යෙදීමේ තොරතුරු",
    closeInfo: "වසන්න",
    infoTitle: "🌽 බඩ ඉරිඟු පොහොර යෙදීමේ අදියර",
    basalInfoTitle: "1️⃣ Basal Application",
    basalInfoSubtitle: "👉 මූලික පොහොර යෙදීම / මුල් පොහොර යෙදීම",
    basalInfoDate: "📅 දින 0 – බීජ වපුරන වෙලාවේ",
    basalInfoMeaning: "🔹 අර්ථය (farmer-friendly):",
    basalInfoDesc: "බඩ ඉරිඟු බීජ වපුරන වෙලාවේදී, පසට මුලින්ම යෙදෙන පොහොරයි.",
    basalInfoFertilizers: "🔹 සාමාන්‍යයෙන් යෙදෙන්නේ:",
    basalInfoList: "• TSP\n• MOP\n• (අවශ්‍ය නම්) සුළු Urea ප්‍රමාණයක්",
    basalInfoReason: "🎯 හේතුව:",
    basalInfoReasonDesc: "• මුල් වර්ධනය හොඳ කරගැනීම\n• ශාකය ශක්තිමත්ව පටන් ගැනීම",
    topDress1InfoTitle: "2️⃣ Top Dressing 1",
    topDress1InfoSubtitle: "👉 පළමු ඉහළ පොහොර යෙදීම",
    topDress1InfoDate: "📅 දින 25 – බීජ වපුරලා සති 3–4කට පසු",
    topDress1InfoMeaning: "🔹 අර්ථය:",
    topDress1InfoDesc: "බඩ ඉරිඟු පැළ හොඳට වර්ධනය වෙන්න පටන් ගන්න වෙලාවේදී, ඉහළින් යෙදෙන පොහොරයි.",
    topDress1InfoFertilizers: "🔹 සාමාන්‍යයෙන් යෙදෙන්නේ:",
    topDress1InfoList: "• Urea (නයිට්‍රජන් පොහොර)",
    topDress1InfoReason: "🎯 හේතුව:",
    topDress1InfoReasonDesc: "• කොළ හා කඳ වර්ධනය වැඩි කිරීම\n• හොඳ අස්වැන්නකට මූලික වශයෙන් වැදගත් අදියර",
    topDress2InfoTitle: "3️⃣ Top Dressing 2",
    topDress2InfoSubtitle: "👉 දෙවන ඉහළ පොහොර යෙදීම",
    topDress2InfoDate: "📅 දින 52 – බීජ වපුරලා සති 7–8කට පසු",
    topDress2InfoMeaning: "🔹 අර්ථය:",
    topDress2InfoDesc: "මල් දැමීමට සහ කරලිය හොඳින් පුරවීමට පෙර, දෙවන වරට ඉහළින් යෙදෙන පොහොරයි.",
    topDress2InfoFertilizers: "🔹 සාමාන්‍යයෙන් යෙදෙන්නේ:",
    topDress2InfoList: "• Urea (නයිට්‍රජන් පොහොර)",
    topDress2InfoReason: "🎯 හේතුව:",
    topDress2InfoReasonDesc: "• කරලිය හොඳට පුරවීම\n• අස්වැන්න වැඩි කරගැනීම",
  },
  en: {
    title: "Fertilizer Advisory",
    subtitle: "Analysis Results",
    observation: "Observation",
    cause: "Cause",
    reasoning: "Analysis",
    advice: "Advice",
    recommendations: "Recommended Fertilizers",
    warnings: "Warnings",
    applyToday: "Apply Today",
    canApply: "Safe to apply fertilizer today",
    cannotApply: "Not recommended to apply fertilizer today",
    detectedIssues: "Detected Items",
    fertilizer: "Fertilizer",
    amount: "Amount",
    timing: "Timing",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    newAnalysis: "New Analysis",
    yourInput: "Your Input",
    officialSource: "Reference: DOA/CIC (Rule-Based)",
    contactOfficer: "Get Advice from Agricultural Officer",
    contactOfficerDesc: "Share your results and get personalized guidance",
    fertilizerSchedule: "Fertilizer Schedule",
    plantingDate: "Planting Date",
    basalApplication: "Basal Application",
    basalLabel: "Basal Fertilizer Application",
    atPlanting: "At Planting",
    topDress1: "Top Dress 1",
    topDress1Label: "First Top Dressing",
    nearDay25: "Near Day 25",
    topDress2: "Top Dress 2",
    topDress2Label: "Second Top Dressing",
    nearDay52: "Near Day 52",
    scheduleInfo: "Fertilizer Application Info",
    closeInfo: "Close",
    infoTitle: "🌽 Maize Fertilizer Application Stages",
    basalInfoTitle: "1️⃣ Basal Application",
    basalInfoSubtitle: "👉 Base Fertilizer Application / Initial Fertilizer",
    basalInfoDate: "📅 Day 0 – At Planting Time",
    basalInfoMeaning: "🔹 Meaning (farmer-friendly):",
    basalInfoDesc: "The first fertilizer applied to the soil when planting maize seeds.",
    basalInfoFertilizers: "🔹 Usually Applied:",
    basalInfoList: "• TSP\n• MOP\n• (If needed) Small amount of Urea",
    basalInfoReason: "🎯 Purpose:",
    basalInfoReasonDesc: "• Improve initial growth\n• Help plants start strong",
    topDress1InfoTitle: "2️⃣ Top Dressing 1",
    topDress1InfoSubtitle: "👉 First Top Dressing Application",
    topDress1InfoDate: "📅 Day 25 – 3-4 weeks after planting",
    topDress1InfoMeaning: "🔹 Meaning:",
    topDress1InfoDesc: "Fertilizer applied from above when maize plants start growing well.",
    topDress1InfoFertilizers: "🔹 Usually Applied:",
    topDress1InfoList: "• Urea (Nitrogen fertilizer)",
    topDress1InfoReason: "🎯 Purpose:",
    topDress1InfoReasonDesc: "• Increase leaf and stem growth\n• Critical stage for good harvest",
    topDress2InfoTitle: "3️⃣ Top Dressing 2",
    topDress2InfoSubtitle: "👉 Second Top Dressing Application",
    topDress2InfoDate: "📅 Day 52 – 7-8 weeks after planting",
    topDress2InfoMeaning: "🔹 Meaning:",
    topDress2InfoDesc: "Second fertilizer applied from above before flowering and grain filling.",
    topDress2InfoFertilizers: "🔹 Usually Applied:",
    topDress2InfoList: "• Urea (Nitrogen fertilizer)",
    topDress2InfoReason: "🎯 Purpose:",
    topDress2InfoReasonDesc: "• Fill grains properly\n• Increase yield",
  },
};

export default function RuleBasedAdvisoryResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const { data, language: lang } = route.params as {
    data: any;
    language: Language;
  };

  const { language: contextLang } = useLanguage();
  const language: Language = contextLang === "sinhala" ? "si" : "en";
  const t = content[language];

  const [showInfoModal, setShowInfoModal] = useState(false);

  const canApplyToday = data.apply_today === true;

  // Calculate fertilizer application dates based on planting date
  // Using DOA guidelines from cornKnowledgeBase.ts
  const fertilizerDates = useMemo(() => {
    const plantingDateStr = data.planting_date || data.plantingDate;
    if (!plantingDateStr) {
      console.log('No planting date found in data:', data);
      return null;
    }

    try {
      const plantingDate = new Date(plantingDateStr);
      
      // DOA Fertilizer Schedule (from cornKnowledgeBase.ts):
      // Basal: At planting (day 0)
      // Top Dress 1: 3-4 weeks after planting (day 25)
      // Top Dress 2: 7-8 weeks after planting (day 52)
      
      const basalDate = new Date(plantingDate); // Day 0
      
      const topDress1Date = new Date(plantingDate);
      topDress1Date.setDate(topDress1Date.getDate() + 25); // 25 days after planting
      
      // Calculate date range for Top Dress 1 (±4 days)
      const topDress1Start = new Date(topDress1Date);
      topDress1Start.setDate(topDress1Start.getDate() - 4);
      const topDress1End = new Date(topDress1Date);
      topDress1End.setDate(topDress1End.getDate() + 4);
      
      const topDress2Date = new Date(plantingDate);
      topDress2Date.setDate(topDress2Date.getDate() + 52); // 52 days after planting
      
      // Calculate date range for Top Dress 2 (±4 days)
      const topDress2Start = new Date(topDress2Date);
      topDress2Start.setDate(topDress2Start.getDate() - 4);
      const topDress2End = new Date(topDress2Date);
      topDress2End.setDate(topDress2End.getDate() + 4);
      
      return {
        planting: plantingDate.toLocaleDateString(),
        basal: { date: basalDate.toLocaleDateString(), days: 0 },
        topDress1: { 
          dateStart: topDress1Start.toLocaleDateString(),
          dateEnd: topDress1End.toLocaleDateString(),
          days: 25 
        },
        topDress2: { 
          dateStart: topDress2Start.toLocaleDateString(),
          dateEnd: topDress2End.toLocaleDateString(),
          days: 52 
        },
      };
    } catch (error) {
      console.error('Error parsing planting date:', error);
      return null;
    }
  }, [data.planting_date, data.plantingDate]);

  const handleContactOfficer = () => {
    // Prepare context message to share with officer
    const contextMessage = language === "si"
      ? `🌾 පොහොර උපදේශ ප්‍රතිඵල\n\n📝 මගේ ආදානය:\n${data.farmer_input || data.input_text}\n\n💡 ලැබුණු නිර්දේශ:\n${data.advice}\n\n⚠️ අවවාද: ${data.warnings?.length || 0}\n✅ අද යෙදීම: ${canApplyToday ? "සුදුසුයි" : "නිර්දේශ නොකරයි"}\n\nකරුණාකර මට වැඩිදුර උපදෙස් දෙන්න.`
      : `🌾 Fertilizer Advisory Results\n\n📝 My Input:\n${data.farmer_input || data.input_text}\n\n💡 Recommendations Received:\n${data.advice}\n\n⚠️ Warnings: ${data.warnings?.length || 0}\n✅ Apply Today: ${canApplyToday ? "Yes" : "No"}\n\nPlease provide me with further guidance.`;

    // Navigate to main Chat screen with pre-filled message
    navigation.navigate("Chat" as never, {
      prefilledMessage: contextMessage,
      context: "fertilizer_advisory",
    } as never);
  };

  const getPriorityColor = (priority: string) => {
    const p = (priority || "").toLowerCase();
    if (p === "high") return "#EF4444";
    if (p === "medium") return "#F59E0B";
    if (p === "low") return "#10B981";
    return "#6B7280";
  };

  const getSeverityColor = (severity: string) => {
    const s = (severity || "").toLowerCase();
    if (s === "high") return "#EF4444";
    if (s === "medium") return "#F59E0B";
    if (s === "low") return "#3B82F6";
    return "#6B7280";
  };

  const priorityLabel = (p: string) => {
    const v = (p || "").toLowerCase();
    if (v === "high") return t.high;
    if (v === "medium") return t.medium;
    if (v === "low") return t.low;
    return p;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.title}</Text>
            <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Farmer Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>{t.yourInput}</Text>
          <Text style={styles.inputText}>{data.farmer_input || data.input_text}</Text>
        </View>

        {/* Apply Today */}
        <View style={[styles.applyCard, canApplyToday ? styles.applyCardGreen : styles.applyCardRed]}>
          {canApplyToday ? <CheckCircle color="#10B981" size={24} /> : <XCircle color="#EF4444" size={24} />}
          <View style={styles.applyTextContainer}>
            <Text style={styles.applyTitle}>{t.applyToday}</Text>
            <Text style={[styles.applyText, canApplyToday ? styles.applyTextGreen : styles.applyTextRed]}>
              {canApplyToday ? t.canApply : t.cannotApply}
            </Text>
          </View>
        </View>

        {/* WHY sections */}
        {data.observation ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#3b82f6" }]}>
            <View style={styles.reasoningHeader}>
              <AlertCircle color="#3b82f6" size={20} />
              <Text style={styles.reasoningTitle}>{t.observation}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.observation}</Text>
          </View>
        ) : null}

        {data.cause ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#f59e0b" }]}>
            <View style={styles.reasoningHeader}>
              <Info color="#f59e0b" size={20} />
              <Text style={styles.reasoningTitle}>{t.cause}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.cause}</Text>
          </View>
        ) : null}

        {data.reasoning ? (
          <View style={[styles.reasoningCard, { borderLeftColor: "#8b5cf6" }]}>
            <View style={styles.reasoningHeader}>
              <TrendingUp color="#8b5cf6" size={20} />
              <Text style={styles.reasoningTitle}>{t.reasoning}</Text>
            </View>
            <Text style={styles.reasoningText}>{data.reasoning}</Text>
          </View>
        ) : null}

        {/* Advice */}
        <View style={styles.adviceCard}>
          <View style={styles.sectionHeader}>
            <Leaf color="#10B981" size={20} />
            <Text style={styles.sectionTitle}>{t.advice}</Text>
          </View>
          <Text style={styles.adviceText}>{data.advice}</Text>
        </View>

        {/* Backend Recommendations */}
        {canApplyToday &&
          Array.isArray(data.recommendations) &&
          data.recommendations.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Package color="#10B981" size={20} />
              <Text style={styles.sectionTitle}>{t.recommendations}</Text>
            </View>

            {data.recommendations.map((rec: any, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recName}>{rec.fertilizer}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(rec.priority) }]}>
                  <Text style={styles.priorityText}>{priorityLabel(rec.priority)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.amount}</Text>
                <Text style={styles.detailValue}>{rec.amount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t.timing}</Text>
                <Text style={styles.detailValue}>{rec.timing}</Text>
              </View>

              {rec.reason ? <Text style={styles.reasonLine}>{rec.reason}</Text> : null}
            </View>
            ))}
          </View>
        ) : null}

        {/* Fertilizer Schedule - Moved below recommendations */}
        {fertilizerDates && (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <View style={styles.scheduleHeaderLeft}>
                <Calendar size={24} color="#10b981" />
                <Text style={styles.scheduleTitle}>{t.fertilizerSchedule}</Text>
              </View>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setShowInfoModal(true)}
              >
                <View style={styles.infoIconCircle}>
                  <Info size={16} color="#10b981" />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Planting Date - Centered */}
            <View style={styles.plantingDateContainer}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.plantingDateContent}>
                <Text style={styles.plantingDateLabel}>{t.plantingDate}</Text>
                <Text style={styles.plantingDateValue}>{fertilizerDates.planting}</Text>
              </View>
            </View>

            <View style={styles.scheduleDivider} />

            {/* Basal Application */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#DBEAFE" }]}>
                <Text style={styles.scheduleNumber}>1</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.basalApplication}</Text>
                <Text style={styles.scheduleLabel}>{t.basalLabel}</Text>
                <Text style={styles.scheduleDate}>{fertilizerDates.basal.date}</Text>
                <Text style={styles.scheduleDays}>{t.atPlanting}</Text>
              </View>
            </View>

            {/* Top Dress 1 */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Text style={styles.scheduleNumber}>2</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.topDress1}</Text>
                <Text style={styles.scheduleLabel}>{t.topDress1Label}</Text>
                <Text style={styles.scheduleDateRange}>
                  {fertilizerDates.topDress1.dateStart} - {fertilizerDates.topDress1.dateEnd}
                </Text>
                <Text style={styles.scheduleDays}>{t.nearDay25}</Text>
              </View>
            </View>

            {/* Top Dress 2 */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <Text style={styles.scheduleNumber}>3</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.topDress2}</Text>
                <Text style={styles.scheduleLabel}>{t.topDress2Label}</Text>
                <Text style={styles.scheduleDateRange}>
                  {fertilizerDates.topDress2.dateStart} - {fertilizerDates.topDress2.dateEnd}
                </Text>
                <Text style={styles.scheduleDays}>{t.nearDay52}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View style={styles.infoModalOverlay}>
            <View style={styles.infoModalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.infoModalTitle}>{t.infoTitle}</Text>
                
                {/* Basal Application Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>{t.basalInfoTitle}</Text>
                  <Text style={styles.infoSectionSubtitle}>{t.basalInfoSubtitle}</Text>
                  <Text style={styles.infoSectionDate}>{t.basalInfoDate}</Text>
                  <Text style={styles.infoSectionHeading}>{t.basalInfoMeaning}</Text>
                  <Text style={styles.infoSectionText}>{t.basalInfoDesc}</Text>
                  <Text style={styles.infoSectionHeading}>{t.basalInfoFertilizers}</Text>
                  <Text style={styles.infoSectionText}>{t.basalInfoList}</Text>
                  <Text style={styles.infoSectionHeading}>{t.basalInfoReason}</Text>
                  <Text style={styles.infoSectionText}>{t.basalInfoReasonDesc}</Text>
                </View>

                {/* Top Dress 1 Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>{t.topDress1InfoTitle}</Text>
                  <Text style={styles.infoSectionSubtitle}>{t.topDress1InfoSubtitle}</Text>
                  <Text style={styles.infoSectionDate}>{t.topDress1InfoDate}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress1InfoMeaning}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress1InfoDesc}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress1InfoFertilizers}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress1InfoList}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress1InfoReason}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress1InfoReasonDesc}</Text>
                </View>

                {/* Top Dress 2 Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoSectionTitle}>{t.topDress2InfoTitle}</Text>
                  <Text style={styles.infoSectionSubtitle}>{t.topDress2InfoSubtitle}</Text>
                  <Text style={styles.infoSectionDate}>{t.topDress2InfoDate}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress2InfoMeaning}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress2InfoDesc}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress2InfoFertilizers}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress2InfoList}</Text>
                  <Text style={styles.infoSectionHeading}>{t.topDress2InfoReason}</Text>
                  <Text style={styles.infoSectionText}>{t.topDress2InfoReasonDesc}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.closeInfoButton}
                  onPress={() => setShowInfoModal(false)}
                >
                  <Text style={styles.closeInfoButtonText}>{t.closeInfo}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Warnings */}
        {Array.isArray(data.warnings) && data.warnings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle color="#F59E0B" size={20} />
              <Text style={styles.sectionTitle}>{t.warnings}</Text>
            </View>

            {data.warnings.map((warning: any, index: number) => (
              <View key={index} style={[styles.warningCard, { borderLeftColor: getSeverityColor(warning.severity) }]}>
                <Text style={styles.warningText}>
                  {language === "si" ? warning.message_si : warning.message_en}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Detected issues (from backend, not from knowledge base) */}
        {/* {Array.isArray(data.detected_issues) && data.detected_issues.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.issuesTitle}>{t.detectedIssues}</Text>
            <View style={styles.issuesContainer}>
              {data.detected_issues.map((it: string, idx: number) => (
                <View key={idx} style={styles.issueChip}>
                  <AlertTriangle color="#DC2626" size={14} />
                  <Text style={styles.issueText}>{it}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null} */}

        {/* Source badge */}
        <View style={styles.sourceCard}>
          <Info color="#3b82f6" size={16} />
          <Text style={styles.sourceText}>{t.officialSource}</Text>
        </View>

        <TouchableOpacity style={styles.contactOfficerButton} onPress={handleContactOfficer}>
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactOfficerGradient}
          >
            <MessageCircle color="#ffffff" size={20} />
            <View style={styles.contactOfficerTextContainer}>
              <Text style={styles.contactOfficerButtonText}>{t.contactOfficer}</Text>
              <Text style={styles.contactOfficerButtonDesc}>{t.contactOfficerDesc}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.newAnalysisButton} onPress={() => navigation.goBack()}>
          <Text style={styles.newAnalysisButtonText}>{t.newAnalysis}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "#D1FAE5" },
  langButton: { backgroundColor: "rgba(255, 255, 255, 0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  langText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },

  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16 },

  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scheduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  infoButton: {
    padding: 4,
  },
  infoIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  plantingDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  plantingDateContent: {
    marginLeft: 12,
    alignItems: "center",
  },
  plantingDateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  plantingDateValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  scheduleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  scheduleNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleStage: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scheduleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  scheduleDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  scheduleDateRange: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  scheduleDays: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },

  infoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  infoModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    maxHeight: "80%",
    width: "100%",
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  infoSectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    marginBottom: 8,
  },
  infoSectionDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  infoSectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
    marginBottom: 4,
  },
  infoSectionText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
    marginBottom: 8,
  },
  closeInfoButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  closeInfoButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  inputCard: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 8 },
  inputText: { fontSize: 14, color: "#1F2937", lineHeight: 20 },

  applyCard: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 16, borderWidth: 2 },
  applyCardGreen: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
  applyCardRed: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  applyTextContainer: { flex: 1, marginLeft: 12 },
  applyTitle: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 2 },
  applyText: { fontSize: 15, fontWeight: "700" },
  applyTextGreen: { color: "#059669" },
  applyTextRed: { color: "#DC2626" },

  adviceCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", marginLeft: 8 },
  adviceText: { fontSize: 14, color: "#374151", lineHeight: 22 },

  section: { marginBottom: 16 },

  recommendationCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  recommendationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  recName: { fontSize: 15, fontWeight: "800", color: "#111827", flex: 1, paddingRight: 10 },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  priorityText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailLabel: { fontSize: 13, color: "#6B7280" },
  detailValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
  reasonLine: { marginTop: 6, fontSize: 13, color: "#374151", lineHeight: 18 },

  warningCard: { backgroundColor: "#FFFBEB", borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4 },
  warningText: { fontSize: 14, color: "#92400E", lineHeight: 20 },

  issuesTitle: { fontSize: 14, fontWeight: "600", color: "#6B7280", marginBottom: 12 },
  issuesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  issueChip: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  issueText: { fontSize: 13, color: "#991B1B", fontWeight: "700" },

  reasoningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderLeftWidth: 4,
  },
  reasoningHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  reasoningTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginLeft: 8 },
  reasoningText: { fontSize: 14, color: "#374151", lineHeight: 22 },

  sourceCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  sourceText: { fontSize: 12, color: "#1E40AF", fontWeight: "700", marginLeft: 8 },

  contactOfficerButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactOfficerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  contactOfficerTextContainer: { flex: 1 },
  contactOfficerButtonText: { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 2 },
  contactOfficerButtonDesc: { fontSize: 12, color: "#DBEAFE" },

  newAnalysisButton: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 2, borderColor: "#10B981" },
  newAnalysisButtonText: { fontSize: 16, fontWeight: "700", color: "#10B981" },
});
