import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { ArrowLeft, Wheat, Ruler, Weight, RefreshCw, History, Archive, CheckCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomDropdown from "../../components/CustomDropdown";
import { wetYieldPredictionService } from "../../services/wetYieldPredictionService";
import { SEED_VARIETIES } from "../../types/wetYieldPrediction";
import { useLanguage } from "../../context/LanguageContext";

const FORM_STORAGE_KEY = "@wet_yield_form_draft";

function detectSeason(): string {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const season = month >= 5 && month <= 10 ? "Yala" : "Maha";
    return `${season} ${year}`;
}

function buildSeasonOptions(): { label: string; value: string }[] {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month >= 5 && month <= 10) {
        return [
            { label: `Yala ${year}`, value: `Yala ${year}` },
            { label: `Maha ${year}`, value: `Maha ${year}` },
        ];
    } else {
        return [
            { label: `Maha ${year}`, value: `Maha ${year}` },
            { label: `Yala ${year}`, value: `Yala ${year}` },
        ];
    }
}

type NavProp = StackNavigationProp<YieldPredictionStackParamList, "WetWeightPredictionForm">;

const T = {
    si: {
        title: "තෙත් බර අස්වැන්න පුරෝකථනය",
        subtitle: "පාලිත ක්ෂේත්‍ර අස්වැන්න (Kg/m²)",
        sectionTrial: "අත්හදා බැලීමේ තොරතුරු",
        labelTrialName: "අත්හදා / සෘතු නාමය",
        placeholderTrialName: "උදා: මහ 2025",
        labelFieldBlock: "ක්ෂේත්‍ර කොටස් ID",
        placeholderFieldBlock: "උදා: Field 01",
        labelReplicate: "පුනරාවර්තන අංකය",
        labelPlotNumber: "කුඩා ඉඩම් අංකය",
        placeholderPlotNumber: "උදා: 1",
        sectionVariety: "බීජ ප්‍රභේදය",
        labelVariety: "බීජ ප්‍රභේදය",
        placeholderVariety: "ප්‍රභේදය තෝරන්න",
        sectionPlant: "ශාක මිනුම්",
        labelPlantHeight: "ශාක උස (cm)",
        helperPlantHeight: "සාමාන්‍ය පරාසය: 150–300 cm",
        labelCobHeight: "මිදුළු උස (cm)",
        helperCobHeight: "බිමේ සිට මිදුළු පාදය දක්වා",
        sectionCob: "මිදුළු විස්තර",
        labelCobWeight: "මිදුළු තෙත් බර (ග්‍රෑම්)",
        helperCobWeight: "බීජ සහිත නැතිකළ මිදුළු බර",
        labelCobLength: "මිදුළු දිග (cm)",
        helperCobLength: "ඉහළ සිට පාදය දක්වා",
        labelSeedRows: "බීජ පේළි ගණන",
        helperSeedRows: "මිදුළු වටා ඇති කර්නල් පේළි",
        sectionPlot: "කුඩා ඉඩම් මිනුම්",
        labelPlotArea: "කුඩා ඉඩම් විශාලත්වය (m²)",
        helperPlotArea: "මුළු අස්වැන්න ගනන් කිරීමට",
        submitBtn: "තෙත් බර පුරෝකථනය",
        submitting: "පුරෝකථනය කරමින්...",
        errVariety: "කරුණාකර බීජ ප්‍රභේදය තෝරන්න",
        errPlantHeight: "ශාක උස 50–400 cm අතර විය යුතුය",
        errCobHeight: "මිදුළු උස 20–300 cm අතර විය යුතුය",
        errCobHeightLarge: "මිදුළු උස ශාක උසට වඩා අඩු විය යුතුය",
        errCobWeight: "මිදුළු බර 50–500 ග්‍රෑම් අතර විය යුතුය",
        errCobLength: "මිදුළු දිග 5–35 cm අතර විය යුතුය",
        errSeedRows: "බීජ පේළි ගණන 8–24 අතර විය යුතුය",
        errPlotArea: "කුඩා ඉඩම් විශාලත්වය 1–10000 m² අතර විය යුතුය",
        errTitle: "වලංගුකරණ දෝෂය",
        errPredictTitle: "පුරෝකථන දෝෂය",
        placeholder220: "උදා: 220",
        placeholder110: "උදා: 110",
        placeholder190: "උදා: 190",
        placeholder155: "උදා: 15.5",
        placeholder14: "උදා: 14",
        placeholder10: "උදා: 10",
        confirmTitle: "අවශ්‍ය පරාමිති තහවුරු කිරීම",
        confirmMessage: "මා සතුව පහත නියත පරිසර/පාංශු දත්ත ඇත:\n\n",
        confirmCheckbox: "තහවුරු කරමි",
        sectionAgriPractices: "කෘෂිකාර්මික ක්‍රියාවලි",
        sectionSoilParams: "පාංශු පරාමිති",
        sectionWeatherClimate: "කාලගුණ/දේශගුණ දත්ත",
        paramPlantingDate: "රෝපණ දිනය",
        paramFirstFert: "පළමු පොහොර යෙදීමේ දිනය",
        paramSecondFert: "දෙවන පොහොර යෙදීමේ දිනය",
        paramIrrigation: "ජල සම්පාදන ක්‍රමය",
        paramSoilType: "පස් වර්ගය",
        paramSoilCondition: "පස් තත්ත්වය",
        paramSoilPH: "පස් pH අගය",
        paramNitrogen: "පස් නයිට්‍රජන් (N)",
        paramPhosphorus: "පස් පොස්පරස් (P)",
        paramPotassium: "පස් පොටෑසියම් (K)",
        paramFertilityIndex: "පස් සාරවත් දර්ශකය",
        paramNStatus: "N තත්ත්ව පන්තිය",
        paramPStatus: "P තත්ත්ව පන්තිය",
        paramKStatus: "K තත්ත්ව පන්තිය",
        paramRainfallCondition: "වර්ෂාපතන තත්ත්වය",
        paramRainfall30d: "30 දින වර්ෂාපතනය (mm)",
        paramSeasonalRainfall: "සෘතුමය වර්ෂාපතනය (mm)",
        paramAvgTemp: "සාමාන්‍ය උෂ්ණත්වය (°C)",
        paramMaxTemp: "උපරිම උෂ්ණත්වය (°C)",
        paramHumidity: "සාමාන්‍ය ආර්ද්‍රතාවය (%)",
        paramSunshine: "හිරු එළිය පැය ගණන",
        errConfirmParams: "කරුණාකර ඔබ සතුව අවශ්‍ය පරාමිති ඇති බව තහවුරු කරන්න",
    },
    en: {
        title: "Wet Weight Prediction",
        subtitle: "Controlled Field Yield (Kg/m²)",
        sectionTrial: "Trial Information",
        labelTrialName: "Trial / Season Name",
        placeholderTrialName: "e.g., Maha 2025",
        labelFieldBlock: "Field Block ID",
        placeholderFieldBlock: "e.g., Field 01",
        labelReplicate: "Replicate Number",
        labelPlotNumber: "Plot Number",
        placeholderPlotNumber: "e.g., 1",
        sectionVariety: "Seed Variety",
        labelVariety: "Seed Variety",
        placeholderVariety: "Select variety",
        sectionPlant: "Plant Measurements",
        labelPlantHeight: "Plant Height (cm)",
        helperPlantHeight: "Typical range: 150–300 cm",
        labelCobHeight: "Cob Height from Ground (cm)",
        helperCobHeight: "Measure from ground to base of cob",
        sectionCob: "Cob Details",
        labelCobWeight: "Cob Wet Weight (grams)",
        helperCobWeight: "Weight of fresh cob with kernels",
        labelCobLength: "Cob Length (cm)",
        helperCobLength: "Length from tip to base",
        labelSeedRows: "Number of Seed Rows",
        helperSeedRows: "Count rows of kernels around cob",
        sectionPlot: "Plot Dimensions",
        labelPlotArea: "Plot Area (m²)",
        helperPlotArea: "Enables total yield calculation",
        submitBtn: "Predict Wet Yield",
        submitting: "Predicting...",
        errVariety: "Please select a seed variety",
        errPlantHeight: "Plant height must be between 50–400 cm",
        errCobHeight: "Cob height must be between 20–300 cm",
        errCobHeightLarge: "Cob height must be less than plant height",
        errCobWeight: "Cob wet weight must be between 50–500 grams",
        errCobLength: "Cob length must be between 5–35 cm",
        errSeedRows: "Number of seed rows must be between 8–24",
        errPlotArea: "Plot area must be between 1–10000 m²",
        errTitle: "Validation Error",
        errPredictTitle: "Prediction Error",
        placeholder220: "e.g., 220",
        placeholder110: "e.g., 110",
        placeholder190: "e.g., 190",
        placeholder155: "e.g., 15.5",
        placeholder14: "e.g., 14",
        placeholder10: "e.g., 10",
        confirmTitle: "Required Parameters Confirmation",
        confirmMessage: "I have the following constant environmental/soil data:\n\n",
        confirmCheckbox: "I confirm",
        sectionAgriPractices: "Agricultural Practices",
        sectionSoilParams: "Soil Parameters",
        sectionWeatherClimate: "Weather/Climate Data",
        paramPlantingDate: "Planting Date",
        paramFirstFert: "First Fertilizer Application Date",
        paramSecondFert: "Second Fertilizer Application Date",
        paramIrrigation: "Irrigation Type",
        paramSoilType: "Soil Type",
        paramSoilCondition: "Soil Condition",
        paramSoilPH: "Soil pH Value",
        paramNitrogen: "Soil Nitrogen (N)",
        paramPhosphorus: "Soil Phosphorus (P)",
        paramPotassium: "Soil Potassium (K)",
        paramFertilityIndex: "Soil Fertility Index",
        paramNStatus: "N Status Class",
        paramPStatus: "P Status Class",
        paramKStatus: "K Status Class",
        paramRainfallCondition: "Rainfall Condition",
        paramRainfall30d: "30-day Rainfall (mm)",
        paramSeasonalRainfall: "Seasonal Rainfall (mm)",
        paramAvgTemp: "Average Temperature (°C)",
        paramMaxTemp: "Maximum Temperature (°C)",
        paramHumidity: "Average Humidity (%)",
        paramSunshine: "Sunshine Hours",
        errConfirmParams: "Please confirm that you have the required parameters",
    },
};

const REPLICATE_OPTIONS = [
    { label: "R1", value: "R1" },
    { label: "R2", value: "R2" },
    { label: "R3", value: "R3" },
    { label: "R4", value: "R4" },
    { label: "R5", value: "R5" },
];

const WetWeightPredictionFormScreen = () => {
    const navigation = useNavigation<NavProp>();
    const { language: lang } = useLanguage();
    const t = lang === "sinhala" ? T.si : T.en;

    const seasonOptions = buildSeasonOptions();
    const defaultSeason = detectSeason();

    const [trialName, setTrialName] = useState(defaultSeason);
    const [fieldBlockId, setFieldBlockId] = useState("");
    const [replicateNumber, setReplicateNumber] = useState("");
    const [plotNumber, setPlotNumber] = useState("");
    const [seedVariety, setSeedVariety] = useState("");
    const [cobHeightCm, setCobHeightCm] = useState("");
    const [plantHeightCm, setPlantHeightCm] = useState("");
    const [cobWetWeightG, setCobWetWeightG] = useState("");
    const [cobLengthCm, setCobLengthCm] = useState("");
    const [numSeedRows, setNumSeedRows] = useState("");
    const [plotAreaM2, setPlotAreaM2] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [hasConfirmedParams, setHasConfirmedParams] = useState(false);
    const [showParamDetails, setShowParamDetails] = useState(false);

    const varietyOptions = SEED_VARIETIES.map(v => ({
        label: v.name,
        value: v.name,
    }));

    const loadDraft = useCallback(async () => {
        try {
            const raw = await AsyncStorage.getItem(FORM_STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved.trialName !== undefined) setTrialName(saved.trialName);
                if (saved.fieldBlockId !== undefined) setFieldBlockId(saved.fieldBlockId);
                if (saved.replicateNumber !== undefined) setReplicateNumber(saved.replicateNumber);
                if (saved.plotNumber !== undefined) setPlotNumber(saved.plotNumber);
                if (saved.seedVariety !== undefined) setSeedVariety(saved.seedVariety);
                if (saved.plantHeightCm !== undefined) setPlantHeightCm(saved.plantHeightCm);
                if (saved.cobHeightCm !== undefined) setCobHeightCm(saved.cobHeightCm);
                if (saved.cobWetWeightG !== undefined) setCobWetWeightG(saved.cobWetWeightG);
                if (saved.cobLengthCm !== undefined) setCobLengthCm(saved.cobLengthCm);
                if (saved.numSeedRows !== undefined) setNumSeedRows(saved.numSeedRows);
                if (saved.plotAreaM2 !== undefined) setPlotAreaM2(saved.plotAreaM2);
            }
        } catch (_) {}
        setDraftLoaded(true);
    }, []);

    const saveDraft = useCallback(async (
        fields: Record<string, string>
    ) => {
        try {
            await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(fields));
        } catch (_) {}
    }, []);

    useEffect(() => { loadDraft(); }, [loadDraft]);

    useEffect(() => {
        if (!draftLoaded) return;
        saveDraft({ trialName, fieldBlockId, replicateNumber, plotNumber, seedVariety, plantHeightCm, cobHeightCm, cobWetWeightG, cobLengthCm, numSeedRows, plotAreaM2 });
    }, [draftLoaded, trialName, fieldBlockId, replicateNumber, plotNumber, seedVariety, plantHeightCm, cobHeightCm, cobWetWeightG, cobLengthCm, numSeedRows, plotAreaM2]);

    const clearDraft = async () => {
        try { await AsyncStorage.removeItem(FORM_STORAGE_KEY); } catch (_) {}
    };

    const validateForm = (): boolean => {
        if (!hasConfirmedParams) {
            Alert.alert(t.errTitle, t.errConfirmParams);
            return false;
        }

        if (!seedVariety || seedVariety.trim() === "") {
            Alert.alert(t.errTitle, t.errVariety);
            return false;
        }

        if (!plantHeightCm || plantHeightCm.trim() === "") {
            Alert.alert(t.errTitle, t.errPlantHeight);
            return false;
        }
        const plantHeight = parseFloat(plantHeightCm.trim());
        if (isNaN(plantHeight) || !isFinite(plantHeight) || plantHeight < 50 || plantHeight > 400) {
            Alert.alert(t.errTitle, t.errPlantHeight);
            return false;
        }

        if (!cobHeightCm || cobHeightCm.trim() === "") {
            Alert.alert(t.errTitle, t.errCobHeight);
            return false;
        }
        const cobHeight = parseFloat(cobHeightCm.trim());
        if (isNaN(cobHeight) || !isFinite(cobHeight) || cobHeight < 20 || cobHeight > 300) {
            Alert.alert(t.errTitle, t.errCobHeight);
            return false;
        }

        if (cobHeight >= plantHeight) {
            Alert.alert(t.errTitle, t.errCobHeightLarge);
            return false;
        }

        if (!cobWetWeightG || cobWetWeightG.trim() === "") {
            Alert.alert(t.errTitle, t.errCobWeight);
            return false;
        }
        const cobWeight = parseFloat(cobWetWeightG.trim());
        if (isNaN(cobWeight) || !isFinite(cobWeight) || cobWeight < 50 || cobWeight > 500) {
            Alert.alert(t.errTitle, t.errCobWeight);
            return false;
        }

        if (!cobLengthCm || cobLengthCm.trim() === "") {
            Alert.alert(t.errTitle, t.errCobLength);
            return false;
        }
        const cobLength = parseFloat(cobLengthCm.trim());
        if (isNaN(cobLength) || !isFinite(cobLength) || cobLength < 5 || cobLength > 35) {
            Alert.alert(t.errTitle, t.errCobLength);
            return false;
        }

        if (!numSeedRows || numSeedRows.trim() === "") {
            Alert.alert(t.errTitle, t.errSeedRows);
            return false;
        }
        const seedRows = parseInt(numSeedRows.trim(), 10);
        if (isNaN(seedRows) || !isFinite(seedRows) || seedRows < 8 || seedRows > 24) {
            Alert.alert(t.errTitle, t.errSeedRows);
            return false;
        }

        if (plotAreaM2 && plotAreaM2.trim() !== "") {
            const plotArea = parseFloat(plotAreaM2.trim());
            if (isNaN(plotArea) || !isFinite(plotArea) || plotArea < 1 || plotArea > 10000) {
                Alert.alert(t.errTitle, t.errPlotArea);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await clearDraft();
            
            const plotAreaValue = plotAreaM2 && plotAreaM2.trim() !== "" ? parseFloat(plotAreaM2.trim()) : undefined;
            const plotNumberValue = plotNumber && plotNumber.trim() !== "" ? parseInt(plotNumber.trim(), 10) : undefined;
            
            if (plotNumberValue !== undefined && (isNaN(plotNumberValue) || !isFinite(plotNumberValue))) {
                Alert.alert(t.errTitle, "Invalid plot number");
                return;
            }
            
            const requestData = {
                seed_variety: seedVariety.trim(),
                cob_height_cm: parseFloat(cobHeightCm.trim()),
                plant_height_cm: parseFloat(plantHeightCm.trim()),
                cob_wet_weight_g: parseFloat(cobWetWeightG.trim()),
                cob_length_cm: parseFloat(cobLengthCm.trim()),
                num_seed_rows: parseInt(numSeedRows.trim(), 10),
                plot_area_m2: plotAreaValue,
            };

            const result = await wetYieldPredictionService.predictWetYield(requestData);

            navigation.navigate("WetWeightPredictionResults", {
                data: result,
                meta: {
                    trial_name: trialName && trialName.trim() !== "" ? trialName.trim() : undefined,
                    field_block_id: fieldBlockId && fieldBlockId.trim() !== "" ? fieldBlockId.trim() : undefined,
                    replicate_number: replicateNumber && replicateNumber.trim() !== "" ? replicateNumber.trim() : undefined,
                    plot_number: plotNumberValue,
                    plot_area_m2: plotAreaValue,
                    seed_variety: seedVariety.trim(),
                },
            });
        } catch (error: any) {
            const errorMessage = error?.message || error?.toString() || t.errPredictTitle;
            Alert.alert(t.errPredictTitle, errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#10B981", "#0faa76ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{t.title}</Text>
                        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={styles.headerIconButton}
                            onPress={async () => { await loadDraft(); }}
                        >
                            <Archive size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerIconButton}
                            onPress={async () => {
                                await saveDraft({ trialName, fieldBlockId, replicateNumber, plotNumber, seedVariety, plantHeightCm, cobHeightCm, cobWetWeightG, cobLengthCm, numSeedRows, plotAreaM2 });
                            }}
                        >
                            <Archive size={20} color="#FFFFFF" fill="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Trial History slim bar */}
            <View style={styles.actionToolbar}>
                <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={() => navigation.navigate("WetWeightTrialHistory" as any)}
                >
                    <History size={16} color="#10B981" />
                    <Text style={styles.toolbarBtnText}>View History</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.formContainer}>

                        {/* Required Parameters Confirmation */}
                        <View style={[styles.sectionCard, styles.confirmCard]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconBg, { backgroundColor: hasConfirmedParams ? "#D1FAE5" : "#FEF3C7" }]}>
                                    <CheckCircle size={20} color={hasConfirmedParams ? "#10B981" : "#F59E0B"} />
                                </View>
                                <Text style={styles.sectionTitle}>{t.confirmTitle}</Text>
                            </View>

                            <Text style={styles.confirmMessage}>{t.confirmMessage}</Text>

                            {/* Checkbox */}
                            <TouchableOpacity
                                style={styles.checkboxRow}
                                onPress={() => setHasConfirmedParams(!hasConfirmedParams)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, hasConfirmedParams && styles.checkboxChecked]}>
                                    {hasConfirmedParams && <CheckCircle size={18} color="#10B981" />}
                                </View>
                                <Text style={[styles.checkboxLabel, hasConfirmedParams && styles.checkboxLabelChecked]}>
                                    {t.confirmCheckbox}
                                </Text>
                            </TouchableOpacity>

                            {/* Toggle parameter details */}
                            <TouchableOpacity
                                style={styles.toggleDetailsBtn}
                                onPress={() => setShowParamDetails(!showParamDetails)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.toggleDetailsText}>
                                    {showParamDetails ? "Hide" : "Show"} Parameter List
                                </Text>
                                {showParamDetails ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
                            </TouchableOpacity>

                            {/* Collapsible parameter sections */}
                            {showParamDetails && (
                                <View style={styles.paramSections}>
                                    {/* Agricultural Practices */}
                                    <View style={styles.paramSection}>
                                        <Text style={styles.paramSectionTitle}>{t.sectionAgriPractices}</Text>
                                        <View style={styles.paramList}>
                                            <Text style={styles.paramItem}>• {t.paramPlantingDate}</Text>
                                            <Text style={styles.paramItem}>• {t.paramFirstFert}</Text>
                                            <Text style={styles.paramItem}>• {t.paramSecondFert}</Text>
                                            <Text style={styles.paramItem}>• {t.paramIrrigation}</Text>
                                        </View>
                                    </View>

                                    {/* Soil Parameters */}
                                    <View style={styles.paramSection}>
                                        <Text style={styles.paramSectionTitle}>{t.sectionSoilParams}</Text>
                                        <View style={styles.paramList}>
                                            <Text style={styles.paramItem}>• {t.paramSoilType}</Text>
                                            <Text style={styles.paramItem}>• {t.paramSoilCondition}</Text>
                                            <Text style={styles.paramItem}>• {t.paramSoilPH}</Text>
                                            <Text style={styles.paramItem}>• {t.paramNitrogen}</Text>
                                            <Text style={styles.paramItem}>• {t.paramPhosphorus}</Text>
                                            <Text style={styles.paramItem}>• {t.paramPotassium}</Text>
                                            <Text style={styles.paramItem}>• {t.paramFertilityIndex}</Text>
                                            <Text style={styles.paramItem}>• {t.paramNStatus}</Text>
                                            <Text style={styles.paramItem}>• {t.paramPStatus}</Text>
                                            <Text style={styles.paramItem}>• {t.paramKStatus}</Text>
                                        </View>
                                    </View>

                                    {/* Weather/Climate Data */}
                                    <View style={styles.paramSection}>
                                        <Text style={styles.paramSectionTitle}>{t.sectionWeatherClimate}</Text>
                                        <View style={styles.paramList}>
                                            <Text style={styles.paramItem}>• {t.paramRainfallCondition}</Text>
                                            <Text style={styles.paramItem}>• {t.paramRainfall30d}</Text>
                                            <Text style={styles.paramItem}>• {t.paramSeasonalRainfall}</Text>
                                            <Text style={styles.paramItem}>• {t.paramAvgTemp}</Text>
                                            <Text style={styles.paramItem}>• {t.paramMaxTemp}</Text>
                                            <Text style={styles.paramItem}>• {t.paramHumidity}</Text>
                                            <Text style={styles.paramItem}>• {t.paramSunshine}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Form sections - disabled until checkbox is checked */}
                        <View 
                            style={!hasConfirmedParams && styles.disabledOverlay}
                            pointerEvents={hasConfirmedParams ? "auto" : "none"}
                        >
                        {/* Section: Trial Information */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBg}>
                                    <Ionicons name="clipboard-outline" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>{t.sectionTrial}</Text>
                            </View>

                            {/* Season selector chips */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t.labelTrialName}</Text>
                                <View style={styles.seasonChips}>
                                    {seasonOptions.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.seasonChip,
                                                trialName === opt.value && styles.seasonChipActive,
                                            ]}
                                            onPress={() => setTrialName(opt.value)}
                                        >
                                            <Text
                                                style={[
                                                    styles.seasonChipText,
                                                    trialName === opt.value && styles.seasonChipTextActive,
                                                ]}
                                            >
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, styles.inputHalf]}>
                                    <Text style={styles.label}>{t.labelFieldBlock}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={fieldBlockId}
                                        onChangeText={setFieldBlockId}
                                        placeholder={t.placeholderFieldBlock}
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.inputHalf]}>
                                    <Text style={styles.label}>{t.labelPlotNumber}</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={plotNumber}
                                        onChangeText={(text) => {
                                            const sanitized = text.replace(/[^0-9]/g, '');
                                            setPlotNumber(sanitized);
                                        }}
                                        placeholder={t.placeholderPlotNumber}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#9CA3AF"
                                        maxLength={4}
                                    />
                                </View>
                            </View>

                            <CustomDropdown
                                label={t.labelReplicate}
                                placeholder="R1"
                                value={replicateNumber}
                                onSelect={setReplicateNumber}
                                options={REPLICATE_OPTIONS}
                            />
                        </View>

                        {/* Section: Variety */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBg}>
                                    <Wheat size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>{t.sectionVariety}</Text>
                            </View>
                            <CustomDropdown
                                label={t.labelVariety}
                                placeholder={t.placeholderVariety}
                                value={seedVariety}
                                onSelect={setSeedVariety}
                                options={varietyOptions}
                                required
                            />
                        </View>

                        {/* Section: Plant */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBg}>
                                    <Ruler size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>{t.sectionPlant}</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t.labelPlantHeight} <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={plantHeightCm}
                                    onChangeText={(text) => {
                                        const sanitized = text.replace(/[^0-9.]/g, '');
                                        if (sanitized.split('.').length <= 2) {
                                            setPlantHeightCm(sanitized);
                                        }
                                    }}
                                    placeholder={t.placeholder220}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={6}
                                />
                                <Text style={styles.helperText}>{t.helperPlantHeight}</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t.labelCobHeight} <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={cobHeightCm}
                                    onChangeText={(text) => {
                                        const sanitized = text.replace(/[^0-9.]/g, '');
                                        if (sanitized.split('.').length <= 2) {
                                            setCobHeightCm(sanitized);
                                        }
                                    }}
                                    placeholder={t.placeholder110}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={6}
                                />
                                <Text style={styles.helperText}>{t.helperCobHeight}</Text>
                            </View>
                        </View>

                        {/* Section: Cob */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBg}>
                                    <Weight size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>{t.sectionCob}</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>
                                    {t.labelCobWeight} <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={cobWetWeightG}
                                    onChangeText={(text) => {
                                        const sanitized = text.replace(/[^0-9.]/g, '');
                                        if (sanitized.split('.').length <= 2) {
                                            setCobWetWeightG(sanitized);
                                        }
                                    }}
                                    placeholder={t.placeholder190}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={6}
                                />
                                <Text style={styles.helperText}>{t.helperCobWeight}</Text>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={[styles.inputGroup, styles.inputHalf]}>
                                    <Text style={styles.label}>
                                        {t.labelCobLength} <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={cobLengthCm}
                                        onChangeText={(text) => {
                                            const sanitized = text.replace(/[^0-9.]/g, '');
                                            if (sanitized.split('.').length <= 2) {
                                                setCobLengthCm(sanitized);
                                            }
                                        }}
                                        placeholder={t.placeholder155}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#9CA3AF"
                                        maxLength={5}
                                    />
                                    <Text style={styles.helperText}>{t.helperCobLength}</Text>
                                </View>

                                <View style={[styles.inputGroup, styles.inputHalf]}>
                                    <Text style={styles.label}>
                                        {t.labelSeedRows} <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        value={numSeedRows}
                                        onChangeText={(text) => {
                                            const sanitized = text.replace(/[^0-9]/g, '');
                                            setNumSeedRows(sanitized);
                                        }}
                                        placeholder={t.placeholder14}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#9CA3AF"
                                        maxLength={2}
                                    />
                                    <Text style={styles.helperText}>{t.helperSeedRows}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Section: Plot Dimensions */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBg}>
                                    <Ionicons name="resize-outline" size={20} color="#10B981" />
                                </View>
                                <Text style={styles.sectionTitle}>{t.sectionPlot}</Text>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>{t.labelPlotArea}</Text>
                                <TextInput
                                    style={styles.input}
                                    value={plotAreaM2}
                                    onChangeText={(text) => {
                                        const sanitized = text.replace(/[^0-9.]/g, '');
                                        if (sanitized.split('.').length <= 2 && parseFloat(sanitized) >= 0 && parseFloat(sanitized) <= 10000) {
                                            setPlotAreaM2(sanitized);
                                        }
                                    }}
                                    placeholder={t.placeholder10}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={8}
                                />
                                <Text style={styles.helperText}>{t.helperPlotArea}</Text>
                            </View>
                        </View>
                        </View>

                        <View style={styles.bottomPadding} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <LinearGradient
                        colors={isSubmitting ? ["#9CA3AF", "#6B7280"] : ["#10B981", "#0faa76ff"]}
                        style={styles.submitGradient}
                    >
                        <Ionicons name="stats-chart-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.submitText}>
                            {isSubmitting ? t.submitting : t.submitBtn}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0FDF4",
    },
    header: {
        paddingTop: 52,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: 16,
        gap: 16,
    },
    sectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    confirmCard: {
        borderWidth: 2,
        borderColor: "#FEF3C7",
    },
    confirmMessage: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 12,
        lineHeight: 18,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: "#F9FAFB",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    checkboxChecked: {
        borderColor: "#10B981",
        backgroundColor: "#D1FAE5",
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7280",
    },
    checkboxLabelChecked: {
        color: "#065F46",
    },
    toggleDetailsBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        gap: 6,
    },
    toggleDetailsText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    paramSections: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    paramSection: {
        marginBottom: 16,
    },
    paramSectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#10B981",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    paramList: {
        paddingLeft: 8,
    },
    paramItem: {
        fontSize: 12,
        color: "#4B5563",
        marginBottom: 4,
        lineHeight: 18,
    },
    disabledOverlay: {
        opacity: 0.5,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        gap: 10,
    },
    sectionIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#D1FAE5",
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#065F46",
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: "row",
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 6,
    },
    required: {
        color: "#DC2626",
    },
    input: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: "#1F2937",
    },
    helperText: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 4,
    },
    bottomPadding: {
        height: 8,
    },
    footer: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#A7F3D0",
    },
    submitButton: {
        borderRadius: 14,
        overflow: "hidden",
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        gap: 8,
    },
    submitText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
    },
    clearDraftBtn: {
        padding: 6,
        marginLeft: 4,
    },
    headerActions: {
        flexDirection: "row",
        gap: 6,
    },
    headerIconButton: {
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
    },
    actionToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    toolbarBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        backgroundColor: "#F0FDF4",
    },
    toolbarBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#065F46",
    },
    seasonChips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 2,
    },
    seasonChip: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        backgroundColor: "#F0FDF4",
    },
    seasonChipActive: {
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },
    seasonChipText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#065F46",
    },
    seasonChipTextActive: {
        color: "#FFFFFF",
    },
});

export default WetWeightPredictionFormScreen;
