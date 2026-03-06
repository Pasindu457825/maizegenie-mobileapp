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
  Calendar,
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
  generateFertilizerPlan,
  generateCultivationAdvice,
  calculateExpectedYield,
} from "../../utils/fertilizerCalculator";
import type { FertilizerPlan } from "../../utils/fertilizerCalculator";

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "ProvideAdviceScreen">;

const ProvideAdviceScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { requestId } = route.params as { requestId: string };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<AdviceRequest | null>(null);
  const [fertilizerPlan, setFertilizerPlan] = useState<FertilizerPlan | null>(null);
  const [cultivationAdvice, setCultivationAdvice] = useState<any>(null);
  const [expectedYield, setExpectedYield] = useState<any>(null);
  const [language, setLanguage] = useState<'si' | 'en'>('si');

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
    organicFertilizer: language === 'si' ? 'කාබනික පොහොර (විකල්ප)' : 'Organic Fertilizer (Optional)',
    compost: language === 'si' ? 'කොම්පෝස්ට්' : 'Compost',
    totalNutrients: language === 'si' ? 'මුළු පෝෂ්‍ය පදාර්ථ' : 'Total Nutrients',
    expectedYieldImprovement: language === 'si' ? 'අපේක්ෂිත අස්වැන්න වැඩිදියුණු කිරීම' : 'Expected Yield Improvement',
    baseline: language === 'si' ? 'මූලික රේඛාව (පොහොර නොමැතිව)' : 'Baseline (no fertilizer)',
    withFertilizer: language === 'si' ? 'DOA පොහොර සමඟ' : 'With DOA fertilizer',
    improvement: language === 'si' ? 'වැඩිදියුණු කිරීම' : 'Improvement',
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
        const plan = generateFertilizerPlan({
          variety: data.variety,
          land_size_ha: data.land_size_ha,
          planting_date: data.planting_date,
          district: data.district,
          location: data.location,
          irrigation_type: data.irrigation_type,
          rainfall_condition: data.rainfall_condition,
          predicted_yield_kg_ha: data.predicted_yield_kg_ha,
          include_organic: true,
        });
        setFertilizerPlan(plan);

        // Generate cultivation advice
        const advice = generateCultivationAdvice({
          variety: data.variety,
          land_size_ha: data.land_size_ha,
          planting_date: data.planting_date,
          district: data.district,
          predicted_yield_kg_ha: data.predicted_yield_kg_ha,
        });
        setCultivationAdvice(advice);

        // Calculate expected yield improvement
        const yieldCalc = calculateExpectedYield({
          variety: data.variety,
          land_size_ha: data.land_size_ha,
          planting_date: data.planting_date,
          predicted_yield_kg_ha: data.predicted_yield_kg_ha,
        });
        setExpectedYield(yieldCalc);

        // Pre-fill officer response with summary
        setOfficerResponse(
          `Based on your ${data.variety} cultivation on ${data.land_size_ha} hectares, I recommend following the DOA fertilizer program outlined below. This should help you achieve a yield of ${yieldCalc.with_fertilizer} tons/ha (improvement of ${yieldCalc.improvement_percentage}% over baseline).`
        );
      }
    } catch (error: any) {
      console.error("Failed to load request:", error);
      showAlert(t.error, t.loadError);
    } finally {
      setLoading(false);
    }
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

      // Prepare expected yield improvement text
      const yieldText = expectedYield
        ? `Expected yield with fertilizer: ${expectedYield.with_fertilizer} t/ha (${expectedYield.improvement_percentage}% improvement). Optimal yield potential: ${expectedYield.optimal_yield} t/ha with excellent management.`
        : '';

      await updateAdviceRequest(requestId, {
        status: 'completed',
        officer_response: officerResponse,
        officer_notes: officerNotes || undefined,
        fertilizer_plan: fertilizerPlan || undefined,
        cultivation_advice: cultivationText || undefined,
        expected_yield_improvement: yieldText || undefined,
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

            {/* Organic Recommendations */}
            {fertilizerPlan.organic && (
              <View style={styles.organicSection}>
                <Text style={styles.organicTitle}>{t.organicFertilizer}</Text>
                <Text style={styles.organicAmount}>
                  {t.compost}: {fertilizerPlan.organic.compost_tons} tons
                </Text>
                <Text style={styles.organicNote}>{fertilizerPlan.organic.timing}</Text>
              </View>
            )}

            {/* Total Nutrients */}
            <View style={styles.nutrientSummary}>
              <Text style={styles.nutrientTitle}>{t.totalNutrients}:</Text>
              <Text style={styles.nutrientText}>
                N: {fertilizerPlan.total_nutrients.nitrogen_kg} kg |
                P: {fertilizerPlan.total_nutrients.phosphorus_kg} kg |
                K: {fertilizerPlan.total_nutrients.potassium_kg} kg
              </Text>
            </View>
          </View>
        )}

        {/* Expected Yield Improvement */}
        {expectedYield && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <TrendingUp size={20} color="#16A34A" />
              <Text style={styles.cardTitle}>{t.expectedYieldImprovement}</Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>{t.baseline}:</Text>
              <Text style={styles.yieldValue}>{expectedYield.baseline_yield} t/ha</Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>{t.withFertilizer}:</Text>
              <Text style={[styles.yieldValue, styles.yieldHighlight]}>
                {expectedYield.with_fertilizer} t/ha
              </Text>
            </View>
            <View style={styles.yieldRow}>
              <Text style={styles.yieldLabel}>{t.improvement}:</Text>
              <Text style={[styles.yieldValue, styles.yieldImprovement]}>
                +{expectedYield.improvement_percentage}%
              </Text>
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
  yieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  yieldLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  yieldValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  yieldHighlight: {
    color: "#16A34A",
    fontSize: 16,
  },
  yieldImprovement: {
    color: "#16A34A",
    fontSize: 15,
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
