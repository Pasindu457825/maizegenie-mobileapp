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
import { ArrowLeft, Wheat, Ruler, Weight, RefreshCw, History, Archive } from "lucide-react-native";
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
        if (!seedVariety) {
            Alert.alert(t.errTitle, t.errVariety);
            return false;
        }

        const plantHeight = parseFloat(plantHeightCm);
        if (!plantHeightCm || isNaN(plantHeight) || plantHeight < 50 || plantHeight > 400) {
            Alert.alert(t.errTitle, t.errPlantHeight);
            return false;
        }

        const cobHeight = parseFloat(cobHeightCm);
        if (!cobHeightCm || isNaN(cobHeight) || cobHeight < 20 || cobHeight > 300) {
            Alert.alert(t.errTitle, t.errCobHeight);
            return false;
        }

        if (cobHeight >= plantHeight) {
            Alert.alert(t.errTitle, t.errCobHeightLarge);
            return false;
        }

        const cobWeight = parseFloat(cobWetWeightG);
        if (!cobWetWeightG || isNaN(cobWeight) || cobWeight < 50 || cobWeight > 500) {
            Alert.alert(t.errTitle, t.errCobWeight);
            return false;
        }

        const cobLength = parseFloat(cobLengthCm);
        if (!cobLengthCm || isNaN(cobLength) || cobLength < 5 || cobLength > 35) {
            Alert.alert(t.errTitle, t.errCobLength);
            return false;
        }

        const seedRows = parseInt(numSeedRows);
        if (!numSeedRows || isNaN(seedRows) || seedRows < 8 || seedRows > 24) {
            Alert.alert(t.errTitle, t.errSeedRows);
            return false;
        }

        if (plotAreaM2) {
            const plotArea = parseFloat(plotAreaM2);
            if (isNaN(plotArea) || plotArea < 1 || plotArea > 10000) {
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
            const requestData = {
                seed_variety: seedVariety,
                cob_height_cm: parseFloat(cobHeightCm),
                plant_height_cm: parseFloat(plantHeightCm),
                cob_wet_weight_g: parseFloat(cobWetWeightG),
                cob_length_cm: parseFloat(cobLengthCm),
                num_seed_rows: parseInt(numSeedRows),
                plot_area_m2: plotAreaM2 ? parseFloat(plotAreaM2) : undefined,
            };

            const result = await wetYieldPredictionService.predictWetYield(requestData);

            navigation.navigate("WetWeightPredictionResults", {
                data: result,
                meta: {
                    trial_name: trialName || undefined,
                    field_block_id: fieldBlockId || undefined,
                    replicate_number: replicateNumber || undefined,
                    plot_number: plotNumber ? parseInt(plotNumber) : undefined,
                    plot_area_m2: plotAreaM2 ? parseFloat(plotAreaM2) : undefined,
                    seed_variety: seedVariety,
                },
            });
        } catch (error: any) {
            Alert.alert(t.errPredictTitle, error.message || t.errPredictTitle);
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
                                        onChangeText={setPlotNumber}
                                        placeholder={t.placeholderPlotNumber}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#9CA3AF"
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
                                    onChangeText={setPlantHeightCm}
                                    placeholder={t.placeholder220}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
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
                                    onChangeText={setCobHeightCm}
                                    placeholder={t.placeholder110}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
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
                                    onChangeText={setCobWetWeightG}
                                    placeholder={t.placeholder190}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
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
                                        onChangeText={setCobLengthCm}
                                        placeholder={t.placeholder155}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#9CA3AF"
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
                                        onChangeText={setNumSeedRows}
                                        placeholder={t.placeholder14}
                                        keyboardType="number-pad"
                                        placeholderTextColor="#9CA3AF"
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
                                    onChangeText={setPlotAreaM2}
                                    placeholder={t.placeholder10}
                                    keyboardType="decimal-pad"
                                    placeholderTextColor="#9CA3AF"
                                />
                                <Text style={styles.helperText}>{t.helperPlotArea}</Text>
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
        gap: 12,
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
