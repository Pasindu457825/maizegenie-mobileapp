import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, User, MapPin, Calendar, Droplets, TrendingUp, MessageSquare, Sprout, CheckCircle2, Lightbulb, Volume2, VolumeX, Leaf } from "lucide-react-native";
import * as Speech from "expo-speech";
import { getAdviceRequest } from "../../services/adviceRequestApi";
import type { AdviceRequest } from "../../services/adviceRequestApi";
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "ViewAdviceRequestDetailsScreen">;

const ViewAdviceRequestDetailsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };
  const { language: globalLang } = useLanguage();
  type Lang = 'si' | 'en' | 'ta';
  const language: Lang = globalLang === 'sinhala' ? 'si' : globalLang === 'tamil' ? 'ta' : 'en';
  const si = language === 'si';
  const ta = language === 'ta';

  const t = {
    headerTitle: si ? 'ඉල්ලීම් විස්තර' : ta ? 'கோரிக்கை விவரங்கள்' : 'Request Details',
    loading: si ? 'ඉල්ලීම් විස්තර පූරණය වෙමින්...' : ta ? 'கோரிக்கை விவரங்கள் ஏற்றப்படுகிறது...' : 'Loading request details...',
    notFound: si ? 'ඉල්ලීම හමු නොවීය' : ta ? 'கோரிக்கை கிடைக்கவில்லை' : 'Request not found',
    goBack: si ? 'ආපසු යන්න' : ta ? 'திரும்பிச் செல்' : 'Go Back',
    error: si ? 'දෝෂයකි' : ta ? 'பிழை' : 'Error',
    loadError: si ? 'ඉල්ලීම් විස්තර පූරණය කිරීමට අසමත් විය.' : ta ? 'கோரிக்கை விவரங்களை ஏற்ற முடியவில்லை.' : 'Failed to load request details. Please try again.',
    yieldEnhancement: si ? 'අස්වැන්න වැඩි කිරීම' : ta ? 'விளைச்சல் மேம்பாடு' : 'Yield Enhancement',
    seedVariety: si ? 'බීජ ප්‍රභේදය තෝරාගැනීම' : ta ? 'விதை வகை தேர்வு' : 'Seed Variety Selection',
    both: si ? 'අස්වැන්න + බීජ ප්‍රභේදය' : ta ? 'விளைச்சல் + விதை வகை' : 'Both (Yield & Seed)',
    created: si ? 'සාදන ලද දිනය' : ta ? 'உருவாக்கிய தேதி' : 'Created',
    farmerMessage: si ? 'ගොවියාගේ පණිවිඩය' : ta ? 'விவசாயியின் செய்தி' : "Farmer's Message",
    predictionDetails: si ? 'අනාවැකි විස්තර' : ta ? 'கணிப்பு விவரங்கள்' : 'Prediction Details',
    predictedYield: si ? 'අනාවැකි අස්වැන්න' : ta ? 'கணிக்கப்பட்ட விளைச்சல்' : 'Predicted Yield',
    variety: si ? 'ප්‍රභේදය' : ta ? 'வகை' : 'Variety',
    landSize: si ? 'ඉඩම් ප්‍රමාණය' : ta ? 'நில அளவு' : 'Land Size',
    locationDetails: si ? 'ස්ථාන විස්තර' : ta ? 'இட விவரங்கள்' : 'Location Details',
    district: si ? 'දිස්ත්‍රික්කය' : ta ? 'மாவட்டம்' : 'District',
    location: si ? 'ස්ථානය' : ta ? 'இடம்' : 'Location',
    fieldConditions: si ? 'කෙත් තත්ත්වයන්' : ta ? 'வயல் நிலைமைகள்' : 'Field Conditions',
    irrigationType: si ? 'වාරිමාර්ග වර්ගය' : ta ? 'நீர்ப்பாசன வகை' : 'Irrigation Type',
    rainfallCondition: si ? 'වර්ෂාපතන තත්ත්වය' : ta ? 'மழை நிலை' : 'Rainfall Condition',
    plantingDate: si ? 'බීජ සිටුවීමේ දිනය' : ta ? 'நடவு தேதி' : 'Planting Date',
    officerResponse: si ? 'නිලධාරියාගේ ප්‍රතිචාරය' : ta ? 'அதிகாரியின் பதில்' : "Officer's Response",
    responded: si ? 'ප්‍රතිචාර දිනය' : ta ? 'பதிலளித்த தேதி' : 'Responded',
    fertilizerPlan: si ? 'පොහොර සැලැස්ම' : ta ? 'உர திட்டம்' : 'Fertilizer Plan',
    basalApplication: si ? 'මූලික යෙදීම' : ta ? 'அடிப்படை உரம்' : 'Basal Application',
    firstTopDressing: si ? 'පළමු ඉහළ පොහොර යෙදීම' : ta ? 'முதல் மேல் உரம்' : 'First Top Dressing',
    secondTopDressing: si ? 'දෙවන ඉහළ පොහොර යෙදීම' : ta ? 'இரண்டாம் மேல் உரம்' : 'Second Top Dressing',
    cultivationAdvice: si ? 'වගා උපදෙස්' : ta ? 'பயிர் ஆலோசனை' : 'Cultivation Advice',
    officerNotes: si ? 'නිලධාරියාගේ සටහන්' : ta ? 'அதிகாரியின் குறிப்புகள்' : "Officer's Notes",
    irrigated: si ? 'වාරිමාර්ග' : ta ? 'நீர்ப்பாசனம்' : 'Irrigated',
    rainfed: si ? 'වැසි ජලය මත' : ta ? 'மழை நீர்' : 'Rainfed',
    high: si ? 'ඉහළ' : ta ? 'உயர்ந்த' : 'High',
    medium: si ? 'මධ්‍යම' : ta ? 'மத்தியம்' : 'Medium',
    low: si ? 'අඩු' : ta ? 'குறைவு' : 'Low',
    // TTS translations
    speakAdvice: si ? '🔊 උපදෙස් කියවන්න' : ta ? '🔊 ஆலோசனையை கேளுங்கள்' : '🔊 Listen to Advice',
    stopSpeaking: si ? '⏹️ නවතන්න' : ta ? '⏹️ நிறுத்தவும்' : '⏹️ Stop',
    voiceNotAvailable: si ? 'කටහඬ නොමැත' : ta ? 'குரல் இல்லை' : 'Voice Not Available',
    voiceNotAvailableMsg: si ? 'මෙම උපකරණයේ සිංහල කටහඬ නොමැත. කරුණාකර දුරකථනයේ පද්ධති සැකසුම් වලින් Text-to-Speech සක්‍රීය කරන්න.'
      : ta ? 'இந்த சாதனத்தில் தமிழ் குரல் கிடைக்கவில்லை. தயவுசெய்து தொலைபேசி அமைப்புகளில் Text-to-Speech செயல்படுத்தவும்.'
      : 'Voice is not available on this device. Please enable Text-to-Speech in your phone system settings.',
    // Calendar translations
    fertilizerSchedule: si ? 'පොහොර කාලසටහන' : ta ? 'உர அட்டவணை' : 'Fertilizer Schedule',
    addToCalendar: si ? 'Google Calendar එකට එක් කරන්න' : ta ? 'Google Calendar இல் சேர்க்கவும்' : 'Add to Google Calendar',
    noPlantingDateAlert: si ? 'වගා කළ දිනයක් නැත' : ta ? 'நடவு தேதி இல்லை' : 'No Planting Date',
    noPlantingDateMsg: si ? 'Calendar එකට එක් කිරීමට වගා කළ දිනය අවශ්‍යයි.' : ta ? 'Calendar இல் சேர்க்க நடவு தேதி தேவை.' : 'Planting date is required to add to calendar.',
    calendarError: si ? 'Calendar එකට එක් කිරීමේදී දෝෂයක් ඇතිවිය.' : ta ? 'Calendar இல் சேர்க்கும்போது பிழை ஏற்பட்டது.' : 'An error occurred while adding to calendar.',
    atPlanting: si ? 'වගා කිරීමේදී' : ta ? 'நடவு செய்யும்போது' : 'At Planting',
    nearDay25: si ? 'දින 25 ආසන්නයේ' : ta ? 'நாள் 25 அருகில்' : 'Near Day 25',
    nearDay52: si ? 'දින 52 ආසන්නයේ' : ta ? 'நாள் 52 அருகில்' : 'Near Day 52',
    topDress1Label: si ? 'පළමු ඉහළ පොහොර යෙදීම' : ta ? 'முதல் மேல் உரம் பயன்பாடு' : 'First Top Dressing',
    topDress2Label: si ? 'දෙවන ඉහළ පොහොර යෙදීම' : ta ? 'இரண்டாம் மேல் உரம் பயன்பாடு' : 'Second Top Dressing',
  };

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<AdviceRequest | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadRequestDetails();
    return () => { Speech.stop(); };
  }, [requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdviceRequest(requestId);
      setRequest(data);
    } catch (error: any) {
      console.error("Failed to load request details:", error);
      Alert.alert(t.error, t.loadError);
    } finally {
      setLoading(false);
    }
  };

  // ── Text-to-Speech ──────────────────────────────────────────
  const generateSpeechText = (): string => {
    if (!request?.officer_response) return "";
    let text = request.officer_response;
    if (request.cultivation_advice) {
      text += ". " + request.cultivation_advice;
    }
    return text;
  };

  const speakAdvice = async () => {
    try {
      await Speech.stop();
      setIsSpeaking(true);
      const text = generateSpeechText();
      if (!text) { setIsSpeaking(false); return; }

      // Check voice availability for non-English languages
      if (language === "si" || language === "ta") {
        const voices = await Speech.getAvailableVoicesAsync();
        const langCode = language === "si" ? "si" : "ta";
        const hasVoice = voices.some(
          (v) => v.language?.toLowerCase().includes(langCode)
        );
        if (!hasVoice) {
          Alert.alert(t.voiceNotAvailable, t.voiceNotAvailableMsg);
          setIsSpeaking(false);
          return;
        }
      }

      const speechLang = language === "si" ? "si-LK" : language === "ta" ? "ta-IN" : "en-US";
      await Speech.speak(text, {
        pitch: 1,
        rate: language === "en" ? 0.9 : 0.85,
        language: speechLang,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.log("Speech error:", err);
      setIsSpeaking(false);
    }
  };

  const stopSpeech = async () => {
    try { await Speech.stop(); } catch (err) { console.log("Stop speech error:", err); }
    setIsSpeaking(false);
  };

  // ── Calendar Reminder helpers ───────────────────────────────
  const formatCalDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
  };

  const buildGoogleCalendarURL = (title: string, details: string, start: Date, end: Date) => {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(details)}&dates=${formatCalDate(start)}/${formatCalDate(end)}`;
  };

  const addTopDressToCalendar = async (daysAfter: number, label: string, detailMsg: string) => {
    const plantingDateStr = request?.planting_date;
    if (!plantingDateStr) {
      Alert.alert(t.noPlantingDateAlert, t.noPlantingDateMsg);
      return;
    }
    try {
      const plantingDate = new Date(plantingDateStr);
      const targetDate = new Date(plantingDate);
      targetDate.setDate(targetDate.getDate() + daysAfter);
      const startDate = new Date(targetDate);
      startDate.setDate(startDate.getDate() - 2);
      const endDate = new Date(targetDate);
      endDate.setDate(endDate.getDate() + 2);
      const url = buildGoogleCalendarURL(label, detailMsg, startDate, endDate);
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error adding to calendar:", error);
      Alert.alert(t.error, t.calendarError);
    }
  };

  // Calculate fertilizer schedule dates from planting_date
  const fertilizerDates = useMemo(() => {
    if (!request?.planting_date) return null;
    try {
      const plantingDate = new Date(request.planting_date);
      const basalDate = new Date(plantingDate);
      const td1Date = new Date(plantingDate);
      td1Date.setDate(td1Date.getDate() + 25);
      const td1Start = new Date(td1Date); td1Start.setDate(td1Start.getDate() - 2);
      const td1End = new Date(td1Date); td1End.setDate(td1End.getDate() + 2);
      const td2Date = new Date(plantingDate);
      td2Date.setDate(td2Date.getDate() + 52);
      const td2Start = new Date(td2Date); td2Start.setDate(td2Start.getDate() - 2);
      const td2End = new Date(td2Date); td2End.setDate(td2End.getDate() + 2);
      return {
        planting: plantingDate.toLocaleDateString(),
        basal: basalDate.toLocaleDateString(),
        topDress1: { start: td1Start.toLocaleDateString(), end: td1End.toLocaleDateString() },
        topDress2: { start: td2Start.toLocaleDateString(), end: td2End.toLocaleDateString() },
      };
    } catch { return null; }
  }, [request?.planting_date]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "completed":
        return "#10B981";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "normal":
        return "#3B82F6";
      case "low":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t.notFound}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{t.goBack}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(request.status) }]} />
              <Text style={styles.statusText}>{request.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.requestType}>
            {request.request_type === "yield_enhancement"
              ? t.yieldEnhancement
              : request.request_type === "seed_variety"
              ? t.seedVariety
              : t.both}
          </Text>
          <Text style={styles.createdAt}>{t.created}: {formatDate(request.created_at)}</Text>
        </View>

        {/* Farmer Message */}
        {request.farmer_message && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MessageSquare size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>{t.farmerMessage}</Text>
            </View>
            <Text style={styles.messageText}>{request.farmer_message}</Text>
          </View>
        )}

        {/* Prediction Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>{t.predictionDetails}</Text>
          </View>
          
          {request.predicted_yield_kg_ha && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.predictedYield}:</Text>
              <Text style={styles.detailValue}>{request.predicted_yield_kg_ha.toFixed(2)} kg/ha</Text>
            </View>
          )}

          {request.variety && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.variety}:</Text>
              <Text style={styles.detailValue}>{request.variety}</Text>
            </View>
          )}

          {request.land_size_ha && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.landSize}:</Text>
              <Text style={styles.detailValue}>{request.land_size_ha.toFixed(2)} ha</Text>
            </View>
          )}
        </View>

        {/* Location Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>{t.locationDetails}</Text>
          </View>

          {request.district && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.district}:</Text>
              <Text style={styles.detailValue}>{request.district}</Text>
            </View>
          )}

          {request.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.location}:</Text>
              <Text style={styles.detailValue}>{request.location}</Text>
            </View>
          )}
        </View>

        {/* Field Conditions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Droplets size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>{t.fieldConditions}</Text>
          </View>

          {request.irrigation_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.irrigationType}:</Text>
              <Text style={styles.detailValue}>{request.irrigation_type}</Text>
            </View>
          )}

          {request.rainfall_condition && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.rainfallCondition}:</Text>
              <Text style={styles.detailValue}>{request.rainfall_condition}</Text>
            </View>
          )}

          {request.planting_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t.plantingDate}:</Text>
              <Text style={styles.detailValue}>{request.planting_date}</Text>
            </View>
          )}
        </View>

        {/* Divider - Officer's Response Section */}
        {request.officer_response && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.officerResponse}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Officer Response */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>{t.officerResponse}</Text>
            </View>
            <Text style={styles.messageText}>{request.officer_response}</Text>
            {request.responded_at && (
              <Text style={styles.timestamp}>{t.responded}: {formatDate(request.responded_at)}</Text>
            )}
          </View>

          {/* TTS Button */}
          <TouchableOpacity
            style={[styles.ttsButton, isSpeaking && styles.ttsButtonActive]}
            onPress={isSpeaking ? stopSpeech : speakAdvice}
            activeOpacity={0.8}
          >
            {isSpeaking ? (
              <VolumeX color="#ffffff" size={20} />
            ) : (
              <Volume2 color="#ffffff" size={20} />
            )}
            <Text style={styles.ttsButtonText}>
              {isSpeaking ? t.stopSpeaking : t.speakAdvice}
            </Text>
          </TouchableOpacity>
          </>
        )}

        {/* Fertilizer Plan */}
        {request.fertilizer_plan && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle2 size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>{t.fertilizerPlan}</Text>
            </View>

            {/* Basal Application */}
            {request.fertilizer_plan.basal && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>{t.basalApplication}</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.basal.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>TSP: {request.fertilizer_plan.basal.tsp_kg} kg</Text>
                  <Text style={styles.fertilizerAmount}>MOP: {request.fertilizer_plan.basal.mop_kg} kg</Text>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.basal.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.basal.timing}</Text>
              </View>
            )}

            {/* First Top Dressing */}
            {request.fertilizer_plan.top_dress_1 && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>{t.firstTopDressing}</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.top_dress_1.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.top_dress_1.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.top_dress_1.timing}</Text>
              </View>
            )}

            {/* Second Top Dressing */}
            {request.fertilizer_plan.top_dress_2 && (
              <View style={styles.fertilizerSection}>
                <Text style={styles.fertilizerStage}>{t.secondTopDressing}</Text>
                <Text style={styles.fertilizerDate}>{request.fertilizer_plan.top_dress_2.date}</Text>
                <View style={styles.fertilizerAmounts}>
                  <Text style={styles.fertilizerAmount}>Urea: {request.fertilizer_plan.top_dress_2.urea_kg} kg</Text>
                </View>
                <Text style={styles.fertilizerNote}>{request.fertilizer_plan.top_dress_2.timing}</Text>
              </View>
            )}

          </View>
        )}

        {/* Fertilizer Calendar Schedule */}
        {fertilizerDates && request.fertilizer_plan && (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Leaf size={20} color="#10b981" />
              <Text style={styles.scheduleTitle}>{t.fertilizerSchedule}</Text>
            </View>

            {/* Planting Date */}
            <View style={styles.plantingDateContainer}>
              <Calendar size={20} color="#6B7280" />
              <View style={styles.plantingDateContent}>
                <Text style={styles.plantingDateLabel}>{t.plantingDate}</Text>
                <Text style={styles.plantingDateValue}>{fertilizerDates.planting}</Text>
              </View>
            </View>

            <View style={styles.scheduleDivider} />

            {/* Basal */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#DBEAFE" }]}>
                <Text style={styles.scheduleNumber}>1</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.basalApplication}</Text>
                <Text style={styles.scheduleDate}>{fertilizerDates.basal}</Text>
                <Text style={styles.scheduleDays}>{t.atPlanting}</Text>
              </View>
            </View>

            {/* Top Dress 1 */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Text style={styles.scheduleNumber}>2</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.firstTopDressing}</Text>
                <Text style={styles.scheduleDateRange}>
                  {fertilizerDates.topDress1.start} - {fertilizerDates.topDress1.end}
                </Text>
                <Text style={styles.scheduleDays}>{t.nearDay25}</Text>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => addTopDressToCalendar(
                    25,
                    `Top Dress 1 - ${t.topDress1Label}`,
                    si ? 'බඩ ඉරිඟු වගාව සඳහා පළමු ඉහළ පොහොර යෙදීම (Urea)'
                      : ta ? 'சோள பயிருக்கு முதல் மேல் உரம் (Urea)'
                      : 'First top dressing for maize (Urea)'
                  )}
                  activeOpacity={0.8}
                >
                  <Calendar size={14} color="#10b981" />
                  <Text style={styles.calendarButtonText}>{t.addToCalendar}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Top Dress 2 */}
            <View style={styles.scheduleItem}>
              <View style={[styles.scheduleIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <Text style={styles.scheduleNumber}>3</Text>
              </View>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleStage}>{t.secondTopDressing}</Text>
                <Text style={styles.scheduleDateRange}>
                  {fertilizerDates.topDress2.start} - {fertilizerDates.topDress2.end}
                </Text>
                <Text style={styles.scheduleDays}>{t.nearDay52}</Text>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={() => addTopDressToCalendar(
                    52,
                    `Top Dress 2 - ${t.topDress2Label}`,
                    si ? 'බඩ ඉරිඟු වගාව සඳහා දෙවන ඉහළ පොහොර යෙදීම (Urea)'
                      : ta ? 'சோள பயிருக்கு இரண்டாம் மேல் உரம் (Urea)'
                      : 'Second top dressing for maize (Urea)'
                  )}
                  activeOpacity={0.8}
                >
                  <Calendar size={14} color="#10b981" />
                  <Text style={styles.calendarButtonText}>{t.addToCalendar}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Cultivation Advice */}
        {request.cultivation_advice && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lightbulb size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>{t.cultivationAdvice}</Text>
            </View>
            <Text style={styles.messageText}>{request.cultivation_advice}</Text>
          </View>
        )}


        {/* Officer Notes */}
        {request.officer_notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.officerNotes}</Text>
            </View>
            <Text style={styles.messageText}>{request.officer_notes}</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#10b981",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  requestType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 8,
  },
  createdAt: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 8,
  },
  messageText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },
  fertilizerSection: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  fertilizerStage: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#15803D",
    marginBottom: 4,
  },
  fertilizerDate: {
    fontSize: 13,
    color: "#16A34A",
    marginBottom: 8,
  },
  fertilizerAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  fertilizerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  fertilizerNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  organicSection: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  organicTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 4,
  },
  organicAmount: {
    fontSize: 14,
    color: "#78350F",
    marginBottom: 4,
  },
  organicNote: {
    fontSize: 12,
    color: "#92400E",
    fontStyle: "italic",
  },
  nutrientSummary: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  nutrientTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
  },
  nutrientText: {
    fontSize: 13,
    color: "#1E3A8A",
  },
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#10B981",
  },
  dividerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginHorizontal: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // TTS Button
  ttsButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ttsButtonActive: {
    backgroundColor: "#EF4444",
  },
  ttsButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Calendar Schedule
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
    marginBottom: 16,
    gap: 8,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
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
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#10b981",
    alignSelf: "flex-start",
  },
  calendarButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
});

export default ViewAdviceRequestDetailsScreen;
