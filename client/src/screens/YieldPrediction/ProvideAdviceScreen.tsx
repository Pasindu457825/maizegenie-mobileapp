import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Sprout,
  TrendingUp,
  MapPin,
  Send,
  Lightbulb,
  CheckCircle2,
} from "lucide-react-native";
import { getAdviceRequest, updateAdviceRequest } from "../../services/adviceRequestApi";
import type { AdviceRequest } from "../../services/adviceRequestApi";
import {
  generateFertilizerPlanAsync,
  generateCultivationAdvice,
  translateFertilizerPlan,
} from "../../utils/fertilizerCalculator";
import type { FertilizerPlan } from "../../utils/fertilizerCalculator";
import { CORN_VARIETIES } from "../../constants/cornKnowledgeBase";
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "ProvideAdviceScreen">;

const ProvideAdviceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };
  const { language: globalLang } = useLanguage();
  const language: 'si' | 'en' = globalLang === 'sinhala' ? 'si' : 'en';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<AdviceRequest | null>(null);
  const [fertilizerPlan, setFertilizerPlan] = useState<FertilizerPlan | null>(null);
  const [cultivationAdvice, setCultivationAdvice] = useState<any>(null);

  // Editable fields
  const [officerResponse, setOfficerResponse] = useState("");
  const [officerNotes, setOfficerNotes] = useState("");
  const [customAdvice, setCustomAdvice] = useState("");

  // Translations
  const t = {
    title: language === 'si' ? 'උපදේශ ලබා දෙන්න' : 'Provide Advice',
    farmerRequest: language === 'si' ? 'ගොවියාගේ ඉල්ලීම' : "Farmer's Request",
    variety: language === 'si' ? 'ප්‍රභේදය' : 'Variety',
    land: language === 'si' ? 'ඉඩම' : 'Land',
    message: language === 'si' ? 'පණිවිඩය' : 'Message',
    recommendedPlan: language === 'si' ? 'නිර්දේශිත පොහොර සැලැස්ම' : 'Recommended Fertilizer Plan',
    basalApplication: language === 'si' ? 'මූලික යෙදීම' : 'Basal Application',
    firstTopDressing: language === 'si' ? 'පළමු ඉහළ පොහොර යෙදීම' : 'First Top Dressing',
    secondTopDressing: language === 'si' ? 'දෙවන ඉහළ පොහොර යෙදීම' : 'Second Top Dressing',
    cultivationTips: language === 'si' ? 'වගා උපදෙස්' : 'Cultivation Tips',
    yourResponse: language === 'si' ? 'ගොවියාට ඔබේ ප්‍රතිචාරය' : 'Your Response to Farmer',
    required: language === 'si' ? 'අවශ්‍යයි' : 'Required',
    additionalAdvice: language === 'si' ? 'අතිරේක වගා උපදෙස් (විකල්ප)' : 'Additional Cultivation Advice (Optional)',
    additionalAdvicePlaceholder: language === 'si' ? 'මෙම ගොවියාගේ තත්ත්වය සඳහා විශේෂිත උපදෙස් එක් කරන්න...' : 'Add any specific advice for this farmer\'s situation...',
    internalNotes: language === 'si' ? 'අභ්‍යන්තර සටහන් (විකල්ප)' : 'Internal Notes (Optional)',
    internalNotesPlaceholder: language === 'si' ? 'අභ්‍යන්තර සටහන් (ගොවියාට නොපෙනේ)...' : 'Internal notes (not visible to farmer)...',
    sendAdvice: language === 'si' ? 'ගොවියාට උපදෙස් යවන්න' : 'Send Advice to Farmer',
    sending: language === 'si' ? 'යවමින්...' : 'Sending...',
    loading: language === 'si' ? 'පොහොර සැලැස්ම උත්පාදනය කරමින්...' : 'Generating fertilizer plan...',
    requestNotFound: language === 'si' ? 'ඉල්ලීම හමු නොවීය' : 'Request not found',
    goBack: language === 'si' ? 'ආපසු යන්න' : 'Go Back',
    requiredFieldError: language === 'si' ? 'අවශ්‍ය ක්ෂේත්‍රය' : 'Required Field',
    provideResponseError: language === 'si' ? 'කරුණාකර ගොවියාට ප්‍රතිචාරයක් ලබා දෙන්න.' : 'Please provide a response to the farmer.',
    success: language === 'si' ? 'සාර්ථකයි' : 'Success',
    adviceSentSuccess: language === 'si' ? 'ගොවියාට උපදෙස් සාර්ථකව යවන ලදී!' : 'Advice has been sent to the farmer successfully!',
    error: language === 'si' ? 'දෝෂයකි' : 'Error',
    submitError: language === 'si' ? 'උපදෙස් යැවීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Failed to submit advice. Please try again.',
    loadError: language === 'si' ? 'ඉල්ලීම් විස්තර පූරණය කිරීමට අසමත් විය. කරුණාකර නැවත උත්සාහ කරන්න.' : 'Failed to load request details. Please try again.',
  };

  useEffect(() => {
    loadRequestAndGeneratePlan();
  }, [requestId]);

  const loadRequestAndGeneratePlan = async () => {
    try {
      setLoading(true);
      const data = await getAdviceRequest(requestId);
      setRequest(data);

      // Generate fertilizer plan if we have the required data
      if (data.variety && data.land_size_ha && data.planting_date) {
        // Use async version that fetches from Supabase first, falls back to hardcoded
        const plan = await generateFertilizerPlanAsync({
          variety: data.variety,
          land_size_ha: data.land_size_ha,
          planting_date: data.planting_date,
          district: data.district,
          location: data.location,
          irrigation_type: data.irrigation_type,
          rainfall_condition: data.rainfall_condition,
          predicted_yield_kg_ha: data.predicted_yield_kg_ha,
          include_organic: false,
        });
        // Translate fertilizer plan timings to Sinhala if needed
        const translatedPlan = translateFertilizerPlan(plan, language);
        setFertilizerPlan(translatedPlan);

        // Generate cultivation advice (in selected language)
        const advice = generateCultivationAdvice({
          variety: data.variety,
          land_size_ha: data.land_size_ha,
          planting_date: data.planting_date,
          district: data.district,
          predicted_yield_kg_ha: data.predicted_yield_kg_ha,
          language: language,
        });
        setCultivationAdvice(advice);

        // Build purpose-driven officer response based on request_type
        const responseText = buildOfficerResponse(data);
        setOfficerResponse(responseText);
      }
    } catch (error: any) {
      console.error("Failed to load request:", error);
      showAlert(t.error, t.loadError);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Build a purpose-driven officer response based on request_type.
   * - yield_enhancement: If yield is already good → maintain advice; if not → enhancement advice
   * - seed_variety: Recommend only the single best variety; if farmer already uses it → confirm
   * - both: Combine both
   */
  const buildOfficerResponse = (data: AdviceRequest): string => {
    const variety = data.variety || 'Unknown';
    const landHa = data.land_size_ha || 0;
    const predictedYieldKgHa = data.predicted_yield_kg_ha;
    const requestType = data.request_type;
    const varietyInfo = CORN_VARIETIES[variety];
    const si = language === 'si';

    const parts: string[] = [];

    // ── Yield Enhancement Section ──
    if (requestType === 'yield_enhancement' || requestType === 'both') {
      let yieldSection = si
        ? `ඔබ ඔබේ අස්වැන්න වැඩි කර ගැනීම සඳහා උපදෙස් ඉල්ලා ඇත.`
        : `You requested advice to enhance your yield.`;

      if (predictedYieldKgHa && varietyInfo) {
        const predictedTonHa = predictedYieldKgHa / 1000;
        const avgPotential = varietyInfo.yieldPotential.average;
        const maxPotential = varietyInfo.yieldPotential.max;
        const totalPredicted = (predictedTonHa * landHa).toFixed(2);

        yieldSection += si
          ? `\n\n📊 ඔබේ පෙර අනාවැකි අස්වැන්න: ${predictedTonHa.toFixed(2)} ටොන්/හෙක්ටයාරයට (මුළු: ${totalPredicted} ටොන්, හෙක්ටයාර ${landHa} සඳහා).`
          : `\n\n📊 Your previous predicted yield: ${predictedTonHa.toFixed(2)} tons/ha (total: ${totalPredicted} tons for ${landHa} ha).`;

        if (predictedTonHa >= avgPotential) {
          // Yield is already good → maintain advice
          yieldSection += si
            ? `\n\n✅ ඔබේ අස්වැන්න දැනටමත් හොඳ මට්ටමක පවතී! ${variety} ප්‍රභේදයේ සාමාන්‍ය අස්වැන්න ${avgPotential} ටොන්/හෙක්ටයාරයට වන අතර ඔබේ අනාවැකි අස්වැන්න ඊට වඩා වැඩිය.`
            : `\n\n✅ Your yield is already at a good level! The average potential for ${variety} is ${avgPotential} tons/ha, and your predicted yield exceeds that.`;
          yieldSection += si
            ? `\n\n🌱 ඔබේ වර්තමාන අස්වැන්න පවත්වා ගැනීම සඳහා පහත පොහොර සැලැස්ම අනුගමනය කරන්න. නිසි කළමනාකරණයෙන් උපරිම අස්වැන්න ${maxPotential} ටොන්/හෙක්ටයාරයට දක්වා ලඟා විය හැකිය.`
            : `\n\n🌱 To maintain your current yield, follow the fertilizer plan below. With proper management, you can reach up to ${maxPotential} tons/ha.`;
        } else {
          // Yield needs improvement → enhancement advice
          const gapTonHa = (avgPotential - predictedTonHa).toFixed(2);
          yieldSection += si
            ? `\n\n⬆️ ඔබේ අස්වැන්න තවත් වැඩි කර ගත හැකිය. ${variety} ප්‍රභේදයේ සාමාන්‍ය අස්වැන්න ${avgPotential} ටොන්/හෙක්ටයාරයට වන අතර ඔබේ අනාවැකි අස්වැන්නට වඩා ${gapTonHa} ටොන් වැඩිය.`
            : `\n\n⬆️ Your yield can be improved further. The average potential for ${variety} is ${avgPotential} tons/ha, which is ${gapTonHa} tons more than your predicted yield.`;
          yieldSection += si
            ? `\n\n🌱 පහත පොහොර සැලැස්ම නිවැරදිව යෙදීමෙන් ඔබට ඔබේ අස්වැන්න ${avgPotential}-${maxPotential} ටොන්/හෙක්ටයාරයට දක්වා වැඩි කර ගත හැකිය. කරුණාකර පොහොර සැලැස්ම ප්‍රවේශමෙන් අනුගමනය කරන්න.`
            : `\n\n🌱 By correctly applying the fertilizer plan below, you can enhance your yield to ${avgPotential}-${maxPotential} tons/ha. Please follow the fertilizer schedule carefully.`;
        }
      } else {
        yieldSection += si
          ? `\n\nපහත කෘෂි දෙපාර්තමේන්තු පොහොර සැලැස්ම ඔබේ ${variety} වගාව සඳහා හෙක්ටයාර ${landHa} ඉඩමේ නිර්දේශ කර ඇත. කරුණාකර යෙදීමේ වේලාවන් ප්‍රවේශමෙන් අනුගමනය කරන්න.`
          : `\n\nThe DOA fertilizer plan below is recommended for your ${variety} cultivation on ${landHa} ha. Please follow the application timings carefully.`;
      }
      parts.push(yieldSection);
    }

    // ── Seed Variety Section ──
    if (requestType === 'seed_variety' || requestType === 'both') {
      let seedSection = si
        ? `ඔබ හොඳම බීජ ප්‍රභේදය තෝරා ගැනීම සඳහා උපදෙස් ඉල්ලා ඇත.`
        : `You requested advice to choose the best seed variety.`;

      if (varietyInfo) {
        // Find the single best variety by average yield potential (excluding local)
        const allVarieties = Object.entries(CORN_VARIETIES)
          .filter(([_, v]) => v.type !== 'local')
          .sort((a, b) => b[1].yieldPotential.average - a[1].yieldPotential.average);
        const bestVariety = allVarieties[0];

        if (bestVariety[0] === variety) {
          // Farmer already using the best variety
          seedSection += si
            ? `\n\n✅ ඔබේ තෝරා ගැනීම නිවැරදිය! ${variety} යනු ශ්‍රී ලංකාවේ ඉහළම අස්වැන්නක් ලබා දෙන ප්‍රභේදයයි (සාමාන්‍ය අස්වැන්න: ${varietyInfo.yieldPotential.average} ටොන්/හෙක්ටයාරයට). ඔබ දැනටමත් හොඳම ප්‍රභේදය භාවිතා කරයි.`
            : `\n\n✅ Your choice is correct! ${variety} is the highest-yielding variety in Sri Lanka (avg yield: ${varietyInfo.yieldPotential.average} tons/ha). You are already using the best variety.`;
        } else {
          // Recommend only the single best variety
          const best = bestVariety[1];
          seedSection += si
            ? `\n\nඔබේ වර්තමාන ප්‍රභේදය ${variety} වන අතර එහි සාමාන්‍ය අස්වැන්න ${varietyInfo.yieldPotential.average} ටොන්/හෙක්ටයාරයට වේ.`
            : `\n\nYour current variety is ${variety} with an average yield of ${varietyInfo.yieldPotential.average} tons/ha.`;

          seedSection += si
            ? `\n\n🏆 නිර්දේශිත හොඳම ප්‍රභේදය: ${bestVariety[0]}\n  • සාමාන්‍ය අස්වැන්න: ${best.yieldPotential.average} ටොන්/හෙක්ටයාරයට\n  • අස්වැන්න පරාසය: ${best.yieldPotential.min}-${best.yieldPotential.max} ටොන්/හෙක්ටයාරයට\n  • වර්ධන කාලය: දින ${best.growthDuration}`
            : `\n\n🏆 Recommended best variety: ${bestVariety[0]}\n  • Average yield: ${best.yieldPotential.average} tons/ha\n  • Yield range: ${best.yieldPotential.min}-${best.yieldPotential.max} tons/ha\n  • Growth duration: ${best.growthDuration} days`;

          seedSection += si
            ? `\n\n💡 ${bestVariety[0]} ප්‍රභේදයට මාරු වීමෙන් ඔබේ අස්වැන්න ${(best.yieldPotential.average - varietyInfo.yieldPotential.average).toFixed(1)} ටොන්/හෙක්ටයාරයට කින් වැඩි කර ගත හැකිය.`
            : `\n\n💡 By switching to ${bestVariety[0]}, you could increase your yield by ${(best.yieldPotential.average - varietyInfo.yieldPotential.average).toFixed(1)} tons/ha.`;
        }
      } else {
        seedSection += si
          ? `\n\nඔබේ ප්‍රභේදය "${variety}" අපගේ දත්ත සමුදායේ හමු නොවීය. කරුණාකර ඔබේ කෘෂි නිලධාරියා අමතන්න.`
          : `\n\nYour variety "${variety}" was not found in our database. Please contact your agriculture officer.`;
      }
      parts.push(seedSection);
    }

    // Fallback if no request type matched
    if (parts.length === 0) {
      return si
        ? `ඔබේ ${variety} වගාව හෙක්ටයාර ${landHa} ඉඩමේ සඳහා කෘෂි දෙපාර්තමේන්තු පොහොර සැලැස්ම පහත දැක්වේ.`
        : `The DOA fertilizer plan for your ${variety} cultivation on ${landHa} ha is shown below.`;
    }

    return parts.join('\n\n─────────────────────\n\n');
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmitAdvice = async () => {
    if (!officerResponse.trim()) {
      showAlert(t.requiredFieldError, t.provideResponseError);
      return;
    }

    try {
      setSubmitting(true);

      // Prepare cultivation advice text
      const cultivationText = customAdvice.trim() ||
        (cultivationAdvice ? [
          ...cultivationAdvice.variety_specific,
          ...cultivationAdvice.general_tips,
          ...cultivationAdvice.yield_improvement,
        ].join('\n• ') : '');

      await updateAdviceRequest(requestId, {
        status: 'completed',
        officer_response: officerResponse,
        officer_notes: officerNotes || undefined,
        fertilizer_plan: fertilizerPlan || undefined,
        cultivation_advice: cultivationText || undefined,
      });

      showAlert(
        t.success,
        t.adviceSentSuccess
      );

      navigation.goBack();
    } catch (error: any) {
      console.error("Failed to submit advice:", error);
      showAlert(t.error, t.submitError);
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.errorText}>{t.requestNotFound}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{t.goBack}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Farmer Request Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.farmerRequest}</Text>

          {/* Request Type Badge */}
          <View style={styles.requestTypeBadge}>
            <Text style={styles.requestTypeText}>
              {request.request_type === 'yield_enhancement'
                ? (language === 'si' ? '📈 අස්වැන්න වැඩි කිරීම' : '📈 Yield Enhancement')
                : request.request_type === 'seed_variety'
                ? (language === 'si' ? '🌱 හොඳම බීජ ප්‍රභේදය' : '🌱 Best Seed Variety')
                : (language === 'si' ? '📈🌱 අස්වැන්න + බීජ ප්‍රභේදය' : '📈🌱 Yield + Seed Variety')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Sprout size={16} color="#6B7280" />
            <Text style={styles.summaryText}>{t.variety}: {request.variety || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.summaryText}>
              {request.district || 'N/A'} - {request.location || 'N/A'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <TrendingUp size={16} color="#6B7280" />
            <Text style={styles.summaryText}>
              {t.land}: {request.land_size_ha?.toFixed(2) || 'N/A'} ha
            </Text>
          </View>
          {request.predicted_yield_kg_ha && (
            <View style={styles.predictedYieldBox}>
              <Text style={styles.predictedYieldLabel}>
                {language === 'si' ? '📊 පෙර අනාවැකි අස්වැන්න' : '📊 Previous Predicted Yield'}
              </Text>
              <Text style={styles.predictedYieldValue}>
                {(request.predicted_yield_kg_ha / 1000).toFixed(2)} t/ha ({request.predicted_yield_kg_ha.toFixed(0)} kg/ha)
              </Text>
            </View>
          )}
          {request.farmer_message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageLabel}>{t.message}:</Text>
              <Text style={styles.messageText}>{request.farmer_message}</Text>
            </View>
          )}
        </View>

        {/* Fertilizer Plan */}
        {fertilizerPlan && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <CheckCircle2 size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>{t.recommendedPlan}</Text>
            </View>

            {/* Basal Application */}
            <View style={styles.fertilizerSection}>
              <Text style={styles.fertilizerStage}>{t.basalApplication}</Text>
              <Text style={styles.fertilizerDate}>{fertilizerPlan.basal.date}</Text>
              <View style={styles.fertilizerAmounts}>
                <Text style={styles.fertilizerAmount}>TSP: {fertilizerPlan.basal.tsp_kg} kg</Text>
                <Text style={styles.fertilizerAmount}>MOP: {fertilizerPlan.basal.mop_kg} kg</Text>
                <Text style={styles.fertilizerAmount}>Urea: {fertilizerPlan.basal.urea_kg} kg</Text>
              </View>
              <Text style={styles.fertilizerNote}>{fertilizerPlan.basal.timing}</Text>
            </View>

            {/* First Top Dressing */}
            <View style={styles.fertilizerSection}>
              <Text style={styles.fertilizerStage}>{t.firstTopDressing}</Text>
              <Text style={styles.fertilizerDate}>{fertilizerPlan.top_dress_1.date}</Text>
              <View style={styles.fertilizerAmounts}>
                <Text style={styles.fertilizerAmount}>Urea: {fertilizerPlan.top_dress_1.urea_kg} kg</Text>
              </View>
              <Text style={styles.fertilizerNote}>{fertilizerPlan.top_dress_1.timing}</Text>
            </View>

            {/* Second Top Dressing */}
            <View style={styles.fertilizerSection}>
              <Text style={styles.fertilizerStage}>{t.secondTopDressing}</Text>
              <Text style={styles.fertilizerDate}>{fertilizerPlan.top_dress_2.date}</Text>
              <View style={styles.fertilizerAmounts}>
                <Text style={styles.fertilizerAmount}>Urea: {fertilizerPlan.top_dress_2.urea_kg} kg</Text>
              </View>
              <Text style={styles.fertilizerNote}>{fertilizerPlan.top_dress_2.timing}</Text>
            </View>

          </View>
        )}

        {/* Cultivation Tips */}
        {cultivationAdvice && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Lightbulb size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>{t.cultivationTips}</Text>
            </View>
            {cultivationAdvice.variety_specific.slice(0, 3).map((tip: string, index: number) => (
              <Text key={index} style={styles.tipText}>• {tip}</Text>
            ))}
          </View>
        )}

        {/* Officer Response (Editable) */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>{t.yourResponse} *</Text>
          <TextInput
            style={styles.textArea}
            value={officerResponse}
            onChangeText={setOfficerResponse}
            placeholder={t.yourResponse}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Custom Cultivation Advice (Optional) */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>{t.additionalAdvice}</Text>
          <TextInput
            style={styles.textArea}
            value={customAdvice}
            onChangeText={setCustomAdvice}
            placeholder={t.additionalAdvicePlaceholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Officer Notes (Internal) */}
        <View style={styles.card}>
          <Text style={styles.inputLabel}>{t.internalNotes}</Text>
          <TextInput
            style={styles.textArea}
            value={officerNotes}
            onChangeText={setOfficerNotes}
            placeholder={t.internalNotesPlaceholder}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitAdvice}
          disabled={submitting}
        >
          <LinearGradient
            colors={submitting ? ["#9CA3AF", "#6B7280"] : ["#16A34A", "#15803D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t.sending}</Text>
              </>
            ) : (
              <>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>{t.sendAdvice}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  messageBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
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
  requestTypeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  requestTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
  },
  predictedYieldBox: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  predictedYieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 2,
  },
  predictedYieldValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#78350F",
  },
  tipText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});

export default ProvideAdviceScreen;
