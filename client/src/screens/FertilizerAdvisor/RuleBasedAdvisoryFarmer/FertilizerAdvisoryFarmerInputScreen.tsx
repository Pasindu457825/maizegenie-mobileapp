import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, MessageSquare, Send, AlertCircle, CloudRain, Calendar, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useApp } from "../../../context/AppContext";
import { useLanguage } from "../../../context/LanguageContext";

const getApiUrl = () => {
    if (Platform.OS === "android") {
        return process.env.EXPO_PUBLIC_API_BASE;
    }
    return "http://localhost:8000";
};

const API_URL = getApiUrl();

type Language = "si" | "en";

const content = {
    si: {
        title: "පොහොර උපදේශ",
        subtitle: "නීති පදනම් සහායක",
        mainLabel: "ඔබගේ වගා තත්ත්වය ඔබේ වචන වලින් කියන්න",
        plantingDateLabel: "වගා කළ දිනය",
        plantingDatePlaceholder: "YYYY-MM-DD",
        plantingStageLabel: "වත්මන් වර්ධන අවධිය",
        plantingStageAuto: "ස්වයංක්‍රීයව ගණනය කරන ලදී",
        rainfallLabel: "වර්ෂාපතන තත්ත්වය",
        rainfallPlaceholder: "වර්ෂාපතන තත්ත්වය තෝරන්න",
        rainfallLow: "අඩු වර්ෂාපතනය / වැස්ස නැහැ",
        rainfallHigh: "අධික වර්ෂාපතනය / වැහි වැඩි",
        soilLabel: "පස තත්ත්වය",
        soilPlaceholder: "පස තත්ත්වය තෝරන්න",
        soilDry: "වියළි පස",
        soilWet: "තෙත් / ජලයෙන් පිරුණු පස",
        selectDate: "දිනය තෝරන්න",
        cancel: "අවලංගු කරන්න",
        keywordsHelper: "වචන උපකාර:",
        getAdvice: "උපදෙස් ලබා ගන්න",
        gettingAdvice: "උපදෙස් ලබා ගනිමින්...",
        howItWorks: "මෙය ක්‍රියා කරන්නේ කෙසේද?",
        howItWorksDesc:
            "ඔබේ වචන වලින් කියන්න. පද්ධතිය ඔබේ භාෂාව (සිංහල/English) අනුව ගැළපෙන පොහොර උපදේශ ලබා දෙයි.",
        details: "විස්තර",
        detailsDesc: "මෙම පද්ධතිය පිළිගන්නේ පෙනෙන දෘශ්‍යමාන ලක්ෂණ පමණි:\n• කොළ කහ/පැහැති වීම\n• දම් පාට කොළ\n• කොළ අග පිළිස්සීම/වියළීම\n• පැළ දුර්වල වීම\n• වර්ධනය අඩු වීම\n• අධික වැසි/වැස්ස අඩු\n• වියලි පස/තෙත් පස",
        exampleRotate1: "කොළ කහ. පැළ දුර්වල. වියලි පස.",
        exampleRotate2: "කොළ අග පිළිස්ස. වර්ධනය අඩු.",
        exampleRotate3: "දම්පාට කොළ. වැහි වැඩි.",
        plantingDateTooOld: "වගා කළ දිනය දින 130කට වඩා පැරණි විය නොහැක. කරුණාකර වලංගු දිනයක් ඇතුළත් කරන්න.",
        growthStages: "වර්ධන අදියර",
        growthStagesTitle: "වර්ධන අදියර (වගා කළ දින මත පදනම්ව)",
        days: "දින",
        stageEnglish: "අදියර (ඉංග්‍රීසි)",
        stageSinhala: "අදියර (සිංහල)",
        seedlingStage: "Seedling stage",
        seedlingStageSi: "පැළ අවධිය/බීජ අංකුර අවස්ථාව",
        vegetativeStage: "Vegetative stage",
        vegetativeStageSi: "ශාක වර්ධක අවධිය",
        kneeHeightStage: "Knee-height stage",
        kneeHeightStageSi: "දණහිසට උස අවධිය",
        tasselingStage: "Tasseling/Flowering stage",
        tasselingStageSi: "මල් පිපීමේ අවධිය",
        grainFillingStage: "Grain filling stage",
        grainFillingStageSi: "ධාන්‍ය පිරෙන අවධිය",
        harvestTime: "Harvest time",
        harvestTimeSi: "අස්වනු නෙළීමේ කාලය",
    },
    en: {
        title: "Fertilizer Advisory",
        subtitle: "Rule-Based Assistant",
        mainLabel: "Describe your crop condition in your own words",
        plantingDateLabel: "Planting Date",
        plantingDatePlaceholder: "YYYY-MM-DD",
        plantingStageLabel: "Current Growth Stage",
        plantingStageAuto: "Auto-calculated",
        rainfallLabel: "Rainfall Condition",
        rainfallPlaceholder: "Select rainfall condition",
        rainfallLow: "Low Rainfall / No Rain",
        rainfallHigh: "Heavy Rainfall / Too Much Rain",
        soilLabel: "Soil Condition",
        soilPlaceholder: "Select soil condition",
        soilDry: "Dry Soil",
        soilWet: "Wet / Waterlogged Soil",
        selectDate: "Select Date",
        cancel: "Cancel",
        keywordsHelper: "Keywords Helper:",
        getAdvice: "Get Advice",
        gettingAdvice: "Getting Advice...",
        howItWorks: "How it works?",
        howItWorksDesc:
            "Describe in your own words. The system uses your selected language (Sinhala/English) to provide fertilizer advice.",
        details: "Details",
        detailsDesc: "This system only detects these visible signs:\n• Yellow/pale leaves\n• Purple leaves\n• Leaf tip/edge burn\n• Weak plants\n• Stunted/slow growth\n• Heavy rain/low rainfall\n• Dry soil/wet soil",
        exampleRotate1: "yellow leaves. weak plants. dry soil.",
        exampleRotate2: "leaf edge burn. slow growth.",
        exampleRotate3: "purple leaves. heavy rain.",
        plantingDateTooOld: "Planting date cannot be more than 130 days old. Please enter a valid date.",
        growthStages: "Growth Stages",
        growthStagesTitle: "Growth Stages (Based on Days After Planting)",
        days: "Days",
        stageEnglish: "Stage (English)",
        stageSinhala: "Stage (Sinhala)",
        seedlingStage: "Seedling stage",
        seedlingStageSi: "පැළ අවධිය/බීජ අංකුර අවස්ථාව",
        vegetativeStage: "Vegetative stage",
        vegetativeStageSi: "ශාක වර්ධක අවධිය",
        kneeHeightStage: "Knee-height stage",
        kneeHeightStageSi: "දණහිසට උස අවධිය",
        tasselingStage: "Tasseling/Flowering stage",
        tasselingStageSi: "මල් පිපීමේ අවධිය",
        grainFillingStage: "Grain filling stage",
        grainFillingStageSi: "ධාන්‍ය පිරෙන අවධිය",
        harvestTime: "Harvest time",
        harvestTimeSi: "අස්වනු නෙළීමේ කාලය",
    },
};

export default function RuleBasedAdvisoryInputScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { language: lang } = useLanguage();
    const language: Language = lang === "sinhala" ? "si" : "en";
    const [inputText, setInputText] = useState("");
    const [plantingDate, setPlantingDate] = useState<string>("");
    const [plantingStage, setPlantingStage] = useState<string>("");
    const [rainfallCondition, setRainfallCondition] = useState<string>("");
    const [rainfallValue, setRainfallValue] = useState<string>(""); // Backend value: "low" or "high"
    const [soilCondition, setSoilCondition] = useState<string>("");
    const [soilValue, setSoilValue] = useState<string>(""); // Backend value: "dry" or "wet"
    const [showRainfallPicker, setShowRainfallPicker] = useState(false);
    const [showSoilPicker, setShowSoilPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [showGrowthStages, setShowGrowthStages] = useState(false);

    useEffect(() => {
        if (!user || user.role !== "farmer") {
            Alert.alert(
                language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
                language === "si"
                    ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි."
                    : "This feature is only available for farmers.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        }
    }, [user, language, navigation]);

    if (!user || user.role !== "farmer") {
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
                            <Text style={styles.headerTitle}>
                                {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.accessDeniedContainer}>
                    <AlertCircle color="#ef4444" size={64} />
                    <Text style={styles.accessDeniedTitle}>
                        {language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied"}
                    </Text>
                    <Text style={styles.accessDeniedText}>
                        {language === "si"
                            ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි. කරුණාකර ගොවි ගිණුමකින් පුරනය වන්න."
                            : "This feature is only available for farmers. Please log in with a farmer account."}
                    </Text>
                    <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>{language === "si" ? "ආපසු යන්න" : "Go Back"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const t = content[language];

    // Calculate planting stage based on planting date
    useEffect(() => {
        if (plantingDate) {
            try {
                const today = new Date();
                const plantDate = new Date(plantingDate);
                const diffTime = today.getTime() - plantDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                let stage = "";
                if (diffDays < 0) {
                    stage = language === "si" ? "අනාගත වගාව" : "Future planting";
                } else if (diffDays <= 10) {
                    stage = language === "si" ? "ප්‍රාථමික අවධිය (දින 0-10)" : "Seedling stage (Days 0-10)";
                } else if (diffDays <= 25) {
                    stage = language === "si" ? "ශාක වර්ධන අවධිය (දින 10-25)" : "Vegetative stage (Days 10-25)";
                } else if (diffDays <= 52) {
                    stage = language === "si" ? "දණහිස උස අවධිය (දින 25-52)" : "Knee-height stage (Days 25-52)";
                } else if (diffDays <= 75) {
                    stage = language === "si" ? "මල් පිපීමේ අවධිය (දින 52-75)" : "Tasseling/Flowering stage (Days 52-75)";
                } else if (diffDays <= 110) {
                    stage = language === "si" ? "ධාන්‍ය පිරවීමේ අවධිය (දින 75-110)" : "Grain filling stage (Days 75-110)";
                } else {
                    stage = language === "si" ? "අස්වනු නෙලීමේ කාලය (දින 110+)" : "Harvest time (Days 110+)";
                }

                setPlantingStage(stage);
            } catch (error) {
                console.error('Error calculating planting stage:', error);
                setPlantingStage("");
            }
        } else {
            setPlantingStage("");
        }
    }, [plantingDate, language]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getRotatingPlaceholder = () => {
        const examples = [t.exampleRotate1, t.exampleRotate2, t.exampleRotate3];
        return examples[placeholderIndex];
    };

    const handleQuickTag = (tag: string) => {
        if (inputText && !inputText.includes(tag)) setInputText(inputText + " " + tag);
        else if (!inputText) setInputText(tag);
    };

    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "කරුණාකර ඔබේ වගා තත්ත්වය විස්තර කරන්න" : "Please describe your crop condition"
            );
            return;
        }

        // Validate planting date is not more than 130 days old
        if (plantingDate) {
            try {
                const today = new Date();
                const plantDate = new Date(plantingDate);
                const diffTime = today.getTime() - plantDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 130) {
                    Alert.alert(
                        language === "si" ? "දෝෂයකි" : "Error",
                        t.plantingDateTooOld
                    );
                    return;
                }
            } catch (error) {
                console.error('Error validating planting date:', error);
            }
        }

        setLoading(true);

        try {
            const payload = {
                farmer_input: inputText.trim(),
                planting_date: plantingDate || null,
                planting_stage: plantingStage || null,
                rainfall_condition: rainfallValue || null, // Send backend value: "low" or "high"
                soil_condition: soilValue || null, // Send backend value: "dry" or "wet"
                language, // IMPORTANT: backend respects this
            };

            const response = await fetch(`${API_URL}/api/v1/rule-based-advisory/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                navigation.navigate("RuleBasedAdvisoryResultsScreen", {
                    data: { 
                        ...result, 
                        farmer_input: inputText.trim(),
                        planting_date: plantingDate || null,
                        planting_stage: plantingStage || null,
                        rainfall_condition: rainfallCondition || null
                    },
                    language,
                });
            } else {
                Alert.alert(language === "si" ? "දෝෂයකි" : "Error", result.detail || "Analysis failed");
            }
        } catch (error) {
            console.error("Analysis error:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "විශ්ලේෂණය අසාර්ථක විය" : "Analysis failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
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
                <View style={styles.infoCard}>
                    <MessageSquare color="#10b981" size={24} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>{t.howItWorks}</Text>
                        <Text style={styles.infoDesc}>{t.howItWorksDesc}</Text>
                        <TouchableOpacity 
                            style={styles.detailsButton} 
                            onPress={() => setShowDetails(!showDetails)}
                        >
                            <Text style={styles.detailsButtonText}>{t.details}</Text>
                            <Text style={styles.detailsArrow}>{showDetails ? "▲" : "▼"}</Text>
                        </TouchableOpacity>
                        {showDetails && (
                            <View style={styles.detailsContent}>
                                <Text style={styles.detailsText}>{t.detailsDesc}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.inputSection}>
                    <View style={styles.labelWithIcon}>
                        <MessageSquare color="#10b981" size={20} />
                        <Text style={styles.mainLabel}>{t.mainLabel}</Text>
                    </View>

                    <TextInput
                        style={styles.textInputLarge}
                        placeholder={getRotatingPlaceholder()}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={8}
                        value={inputText}
                        onChangeText={setInputText}
                        textAlignVertical="top"
                    />
                </View>

                {/* Planting Date Field */}
                <View style={styles.inputSection}>
                    <Text style={styles.dateLabel}>
                        {t.plantingDateLabel}
                    </Text>
                    <View style={styles.dateInputContainer}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder={t.plantingDatePlaceholder}
                            value={plantingDate}
                            onChangeText={setPlantingDate}
                            placeholderTextColor="#9CA3AF"
                            maxLength={10}
                        />
                        <TouchableOpacity 
                            style={styles.calendarButton} 
                            onPress={() => {
                                // Show date picker with max date as today
                                setShowDatePicker(true);
                            }}
                        >
                            <Calendar color="#10b981" size={20} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>Format: YYYY-MM-DD (Max: Today)</Text>
                </View>

                {/* Planting Stage Display (Auto-calculated) */}
                {plantingStage && (
                    <View style={styles.inputSection}>
                        <Text style={styles.stageLabel}>{t.plantingStageLabel}</Text>
                        <View style={styles.stageCard}>
                            <Text style={styles.stageText}>{plantingStage}</Text>
                            <Text style={styles.stageAutoText}>{t.plantingStageAuto}</Text>
                        </View>
                    </View>
                )}

                {/* Growth Stages - Collapsible */}
                <View style={styles.inputSection}>
                    <TouchableOpacity 
                        style={styles.growthStagesToggle}
                        onPress={() => setShowGrowthStages(!showGrowthStages)}
                        activeOpacity={0.7}
                    >
                        <TrendingUp size={18} color="#10b981" />
                        <Text style={styles.growthStagesToggleText}>{t.growthStages}</Text>
                        <Text style={styles.growthStagesToggleIcon}>{showGrowthStages ? '▼' : '▶'}</Text>
                    </TouchableOpacity>

                    {showGrowthStages && (
                        <View style={styles.growthStagesTable}>
                            <Text style={styles.growthStagesTitle}>{t.growthStagesTitle}</Text>
                            
                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, styles.tableDaysColumn]}>{t.days}</Text>
                                <Text style={[styles.tableHeaderCell, styles.tableStageColumn]}>{t.stageEnglish}</Text>
                                <Text style={[styles.tableHeaderCell, styles.tableStageColumn]}>{t.stageSinhala}</Text>
                            </View>

                            {/* Table Rows */}
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>0-10</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.seedlingStage}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.seedlingStageSi}</Text>
                            </View>

                            <View style={[styles.tableRow, styles.tableRowAlt]}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>10-25</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.vegetativeStage}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.vegetativeStageSi}</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>25-52</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.kneeHeightStage}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.kneeHeightStageSi}</Text>
                            </View>

                            <View style={[styles.tableRow, styles.tableRowAlt]}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>52-75</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.tasselingStage}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.tasselingStageSi}</Text>
                            </View>

                            <View style={styles.tableRow}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>75-110</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.grainFillingStage}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.grainFillingStageSi}</Text>
                            </View>

                            <View style={[styles.tableRow, styles.tableRowAlt]}>
                                <Text style={[styles.tableCell, styles.tableDaysColumn]}>110+</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.harvestTime}</Text>
                                <Text style={[styles.tableCell, styles.tableStageColumn]}>{t.harvestTimeSi}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Rainfall Condition Field */}
                <View style={styles.inputSection}>
                    <View style={styles.labelWithIcon}>
                        <CloudRain color="#10b981" size={20} />
                        <Text style={styles.mainLabel}>{t.rainfallLabel}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.selectInput}
                        onPress={() => setShowRainfallPicker(true)}
                    >
                        <Text style={[styles.selectInputText, !rainfallCondition && styles.placeholderText]}>
                            {rainfallCondition || t.rainfallPlaceholder}
                        </Text>
                        <CloudRain color="#10b981" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Soil Condition Field */}
                <View style={styles.inputSection}>
                    <View style={styles.labelWithIcon}>
                        <Text style={{ fontSize: 18 }}>🌱</Text>
                        <Text style={styles.mainLabel}>{t.soilLabel}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.selectInput}
                        onPress={() => setShowSoilPicker(true)}
                    >
                        <Text style={[styles.selectInputText, !soilCondition && styles.placeholderText]}>
                            {soilCondition || t.soilPlaceholder}
                        </Text>
                        <Text style={{ fontSize: 18 }}>🌱</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.quickTagsSection}>
                    <Text style={styles.quickTagsTitle}>{t.keywordsHelper}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {/* Symptom tags - match backend keywords exactly - NO emojis */}
                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "කොළ කහ" : "yellow leaves")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "කොළ කහ" : "Yellow leaves"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "දම්පාට" : "purple leaves")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "දම්පාට" : "Purple leaves"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "කොළ අග පිළිස්ස" : "leaf edge burn")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "කොළ අග පිළිස්ස" : "Edge burn"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "පැළ දුර්වල" : "weak plants")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "පැළ දුර්වල" : "Weak plants"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "වර්ධනය අඩු" : "slow growth")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "වර්ධනය අඩු" : "Slow growth"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "වියලි පස" : "dry soil")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "වියලි පස" : "Dry soil"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.quickTag} onPress={() => handleQuickTag(language === "si" ? "වැහි වැඩි" : "heavy rain")}>
                            <Text style={styles.quickTagText}>{language === "si" ? "වැහි වැඩි" : "Heavy rain"}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <TouchableOpacity style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]} onPress={handleAnalyze} disabled={loading}>
                    <LinearGradient
                        colors={loading ? ["#9CA3AF", "#6B7280"] : ["#10b981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.analyzeButtonGradient}
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color="#ffffff" size="small" />
                                <Text style={styles.analyzeButtonText}>{t.gettingAdvice}</Text>
                            </>
                        ) : (
                            <>
                                <Send color="#ffffff" size={20} />
                                <Text style={styles.analyzeButtonText}>{t.getAdvice}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DateTimePicker
                    value={plantingDate ? (() => {
                        try {
                            const parts = plantingDate.split('-');
                            const year = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1;
                            const day = parseInt(parts[2], 10);
                            const date = new Date(year, month, day);
                            return !isNaN(date.getTime()) ? date : new Date();
                        } catch {
                            return new Date();
                        }
                    })() : new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                        if (Platform.OS === "android") {
                            setShowDatePicker(false);
                        }
                        
                        if (event.type === "dismissed") {
                            setShowDatePicker(false);
                            return;
                        }
                        
                        if (selectedDate) {
                            const year = selectedDate.getFullYear();
                            const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
                            const day = String(selectedDate.getDate()).padStart(2, "0");
                            const formattedDate = `${year}-${month}-${day}`;
                            setPlantingDate(formattedDate);
                            
                            if (Platform.OS === "ios") {
                                setShowDatePicker(false);
                            }
                        }
                    }}
                    maximumDate={new Date()}
                    minimumDate={(() => {
                        const minDate = new Date();
                        minDate.setDate(minDate.getDate() - 130);
                        return minDate;
                    })()}
                />
            )}

            {/* Rainfall Picker Modal */}
            {/* Rainfall Picker Modal - 2 options only */}
            <Modal
                visible={showRainfallPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRainfallPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.rainfallLabel}</Text>
                        <TouchableOpacity
                            style={styles.rainfallOption}
                            onPress={() => {
                                setRainfallCondition(t.rainfallLow);
                                setRainfallValue("low");
                                setShowRainfallPicker(false);
                            }}
                        >
                            <CloudRain size={20} color="#F59E0B" />
                            <Text style={styles.rainfallOptionText}>{t.rainfallLow}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rainfallOption}
                            onPress={() => {
                                setRainfallCondition(t.rainfallHigh);
                                setRainfallValue("high");
                                setShowRainfallPicker(false);
                            }}
                        >
                            <CloudRain size={20} color="#3B82F6" />
                            <Text style={styles.rainfallOptionText}>{t.rainfallHigh}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowRainfallPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>{t.cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Soil Condition Picker Modal */}
            <Modal
                visible={showSoilPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSoilPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t.soilLabel}</Text>
                        <TouchableOpacity
                            style={styles.rainfallOption}
                            onPress={() => {
                                setSoilCondition(t.soilDry);
                                setSoilValue("dry");
                                setShowSoilPicker(false);
                            }}
                        >
                            <Text style={{ fontSize: 20 }}>🏜️</Text>
                            <Text style={styles.rainfallOptionText}>{t.soilDry}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rainfallOption}
                            onPress={() => {
                                setSoilCondition(t.soilWet);
                                setSoilValue("wet");
                                setShowSoilPicker(false);
                            }}
                        >
                            <Text style={{ fontSize: 20 }}>💧</Text>
                            <Text style={styles.rainfallOptionText}>{t.soilWet}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCancelButton}
                            onPress={() => setShowSoilPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>{t.cancel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    langButton: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    langText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    scrollContainer: { flex: 1 },
    scrollContent: { padding: 16 },
    infoCard: {
        backgroundColor: "#ECFDF5",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    infoTextContainer: { flex: 1, marginLeft: 12 },
    infoTitle: { fontSize: 16, fontWeight: "700", color: "#065F46", marginBottom: 4 },
    infoDesc: { fontSize: 13, color: "#047857", lineHeight: 18 },
    detailsButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingVertical: 4,
    },
    detailsButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#10b981",
        marginRight: 4,
    },
    detailsArrow: {
        fontSize: 10,
        color: "#10b981",
    },
    detailsContent: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#A7F3D0",
    },
    detailsText: {
        fontSize: 12,
        color: "#065F46",
        lineHeight: 20,
    },
    inputSection: { marginBottom: 24 },
    labelWithIcon: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
    mainLabel: { fontSize: 16, fontWeight: "700", color: "#1F2937", flex: 1 },
    textInputLarge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        fontSize: 16,
        color: "#1F2937",
        borderWidth: 2,
        borderColor: "#10b981",
        minHeight: 180,
        lineHeight: 24,
    },
    quickTagsSection: { marginBottom: 20 },
    quickTagsTitle: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginBottom: 12 },
    quickTag: {
        backgroundColor: "#F3F4F6",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    quickTagIcon: { fontSize: 16 },
    quickTagText: { fontSize: 13, color: "#374151", fontWeight: "500" },
    analyzeButton: {
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    analyzeButtonDisabled: { opacity: 0.7 },
    analyzeButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
    analyzeButtonText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },

    selectInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#10b981",
    },
    selectInputText: {
        fontSize: 16,
        color: "#1F2937",
        flex: 1,
    },
    placeholderText: {
        color: "#9CA3AF",
    },

    stageLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    stageCard: {
        backgroundColor: "#ECFDF5",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#10b981",
        borderLeftWidth: 4,
    },
    stageText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#047857",
        marginBottom: 4,
    },
    stageAutoText: {
        fontSize: 12,
        color: "#059669",
        fontStyle: "italic",
    },

    dateLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    dateInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        paddingHorizontal: 16,
    },
    dateInput: {
        flex: 1,
        fontSize: 16,
        color: "#1F2937",
        paddingVertical: 14,
    },
    calendarButton: {
        padding: 8,
    },
    helperText: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 24,
        width: "85%",
        maxHeight: "70%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F2937",
        marginBottom: 16,
        textAlign: "center",
    },
    rainfallOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        marginBottom: 12,
        gap: 12,
    },
    rainfallOptionText: {
        fontSize: 16,
        color: "#1F2937",
        fontWeight: "600",
    },
    modalCancelButton: {
        marginTop: 16,
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#EF4444",
        alignItems: "center",
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
    },

    accessDeniedContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
    accessDeniedTitle: { fontSize: 24, fontWeight: "700", color: "#1F2937", marginTop: 24, marginBottom: 12, textAlign: "center" },
    accessDeniedText: { fontSize: 16, color: "#6B7280", textAlign: "center", lineHeight: 24, marginBottom: 32 },
    backButtonLarge: { backgroundColor: "#10b981", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12 },
    backButtonText: { fontSize: 16, fontWeight: "700", color: "#ffffff" },

    // Growth Stages Table Styles
    growthStagesToggle: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    growthStagesToggleText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        color: "#10b981",
    },
    growthStagesToggleIcon: {
        fontSize: 12,
        color: "#10b981",
        fontWeight: "700",
    },
    growthStagesTable: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    growthStagesTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 12,
        textAlign: "center",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#10b981",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    tableHeaderCell: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
        textAlign: "center",
    },
    tableDaysColumn: {
        width: "20%",
    },
    tableStageColumn: {
        width: "40%",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    tableRowAlt: {
        backgroundColor: "#F9FAFB",
    },
    tableCell: {
        fontSize: 11,
        color: "#374151",
        textAlign: "center",
    },
});
