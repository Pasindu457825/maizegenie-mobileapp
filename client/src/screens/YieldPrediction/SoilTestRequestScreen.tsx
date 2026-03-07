// SoilTestRequestScreen.tsx
// Pro-only screen: farmer fills in personal + land details & sends to agri officer via chat
import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
    ArrowLeft,
    TestTube,
    Send,
    User,
    MapPin,
    Ruler,
    Droplets,
    FileText,
    Archive,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOrCreateRoom } from "../../services/chatRoomApi";
import CustomDropdown from "../../components/CustomDropdown";
import { DISTRICTS as DISTRICT_LIST, DISTRICTS_SINHALA, LOCATIONS_BY_DISTRICT, LOCATIONS_SINHALA } from "../../constants/locations";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Translations ────────────────────────────────────────────────────────────

const IRRIGATION_TYPES_SI = [
    { label: "වාරිමාර්ග", value: "Irrigated" },
    { label: "වැසි ජලය", value: "Rainfed" },
    { label: "මිශ්‍ර", value: "Mixed" },
];

const IRRIGATION_TYPES_EN = [
    { label: "Irrigated", value: "Irrigated" },
    { label: "Rainfed", value: "Rainfed" },
    { label: "Mixed", value: "Mixed" },
];

const content = {
    si: {
        headerTitle: "පස් පරීක්ෂණ ඉල්ලීම",
        headerSubtitle: "ඔබේ භූමිය පිළිබඳ විවරණය",
        intro:
            "පහත ඇති පෝරමය සම්පූර්ණ කරන්න. ඔබේ කෘෂිකාර්මික නිලධාරියාට ඉල්ලීම යැවෙනු ඇත.",
        sectionPersonal: "🧑‍🌾 පෞද්ගලික තොරතුරු",
        sectionLand: "🌱 ඉඩම් විස්තර",
        fullName: "සම්පූර්ණ නම",
        fullNamePH: "ඔබේ නම ඇතුළත් කරන්න",
        nic: "ජාතික හැඳුනුම්පත් අංකය",
        nicPH: "NIC ඇතුළත් කරන්න",
        phone: "දූරකථන අංකය",
        phonePH: "07XXXXXXXX",
        district: "දිස්ත්‍රික්කය",
        districtPH: "දිස්ත්‍රික්කය තෝරන්න",
        location: "ස්ථානය",
        locationPH: "ස්ථානය තෝරන්න",
        landSize: "ඉඩම් ප්‍රමාණය (අක්කර)",
        landSizePH: "උදා: 2.5",
        irrigationType: "ජල සපයා ගැනීමේ ක්‍රමය",
        irrigationTypePH: "තෝරන්න",
        additionalNotes: "වෙනත් සටහන්",
        additionalNotesPH: "අමතර තොරතුරු ඇතුළත් කරන්න...",
        submit: "ඉල්ලීම යවන්න",
        submitting: "යවමින්...",
        requiredError: "කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර සම්පූර්ණ කරන්න",
        successTitle: "ඉල්ලීම යැවිණ! ✅",
        successMsg:
            "ඔබේ පස් පරීක්ෂණ ඉල්ලීම ඔබේ දිස්ත්‍රික්කයේ කෘෂිකාර්මික නිලධාරියාට සාර්ථකව යැවිණ.",
        errorTitle: "දෝෂයකි",
        errorMsg: "ඉල්ලීම යවීමේදී දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.",
    },
    en: {
        headerTitle: "Soil Test Request",
        headerSubtitle: "Tell us about your field",
        intro:
            "Fill the form below. Your request will be sent directly to your district Agriculture Officer.",
        sectionPersonal: "🧑‍🌾 Personal Information",
        sectionLand: "🌱 Land Details",
        fullName: "Full Name",
        fullNamePH: "Enter your full name",
        nic: "NIC Number",
        nicPH: "Enter NIC",
        phone: "Phone Number",
        phonePH: "07XXXXXXXX",
        district: "District",
        districtPH: "Select district",
        location: "Location",
        locationPH: "Select location",
        landSize: "Land Size (acres)",
        landSizePH: "e.g. 2.5",
        irrigationType: "Irrigation Type",
        irrigationTypePH: "Select",
        additionalNotes: "Additional Notes",
        additionalNotesPH: "Enter any additional information...",
        submit: "Send Request",
        submitting: "Sending...",
        requiredError: "Please fill in all required fields",
        successTitle: "Request Sent! ✅",
        successMsg:
            "Your soil test request has been sent to your district Agriculture Officer.",
        errorTitle: "Error",
        errorMsg: "Failed to send the request. Please try again.",
    },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SoilTestRequestScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { language: lang } = useLanguage();
    const language = lang === "sinhala" ? "si" : lang === "tamil" ? "en" : "en";
    const t = content[language];

    // ── Form state ──
    const [fullName, setFullName] = useState(user?.full_name || "");
    const [nic, setNic] = useState("");
    const [phone, setPhone] = useState("");
    const [district, setDistrict] = useState(user?.district || "");
    const [location, setLocation] = useState("");
    const [landSize, setLandSize] = useState("");
    const [irrigationType, setIrrigationType] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Get districts based on language
    const getDistrictKey = (displayName: string): string => {
        if (language === "si") {
            const entry = Object.entries(DISTRICTS_SINHALA).find(([_, sinhala]) => sinhala === displayName);
            return entry ? entry[0] : displayName;
        }
        return displayName;
    };

    const districts = language === "si" 
        ? Object.values(DISTRICTS_SINHALA)
        : DISTRICT_LIST;
    const districtOptions = Array.isArray(districts) 
        ? districts.map((d: string) => ({ label: d, value: d }))
        : [];
    const irrigationOptions = language === "si" ? IRRIGATION_TYPES_SI : IRRIGATION_TYPES_EN;

    // Get locations based on selected district
    const districtKey = getDistrictKey(district);
    const availableLocations = districtKey && LOCATIONS_BY_DISTRICT[districtKey] 
        ? LOCATIONS_BY_DISTRICT[districtKey] 
        : [];
    
    const locationOptions = availableLocations.map((loc: string) => {
        if (language === "si" && LOCATIONS_SINHALA[districtKey]?.[loc]) {
            return { label: LOCATIONS_SINHALA[districtKey][loc], value: loc };
        }
        return { label: loc, value: loc };
    });

    // Reset location when district changes
    React.useEffect(() => {
        setLocation("");
    }, [district]);

    // Load saved form data on mount (silent load without alert)
    React.useEffect(() => {
        const loadSilently = async () => {
            try {
                const saved = await AsyncStorage.getItem("soilTestRequestForm");
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.fullName) setFullName(data.fullName);
                    if (data.nic) setNic(data.nic);
                    if (data.phone) setPhone(data.phone);
                    if (data.district) setDistrict(data.district);
                    if (data.location) setLocation(data.location);
                    if (data.landSize) setLandSize(data.landSize);
                    if (data.irrigationType) setIrrigationType(data.irrigationType);
                    if (data.additionalNotes) setAdditionalNotes(data.additionalNotes);
                }
            } catch (error) {
                console.error("Error loading form data:", error);
            }
        };
        loadSilently();
    }, []);

    const loadFormData = async () => {
        try {
            const saved = await AsyncStorage.getItem("soilTestRequestForm");
            if (saved) {
                const data = JSON.parse(saved);
                setFullName(data.fullName || user?.full_name || "");
                setNic(data.nic || "");
                setPhone(data.phone || "");
                setDistrict(data.district || user?.district || "");
                setLocation(data.location || "");
                setLandSize(data.landSize || "");
                setIrrigationType(data.irrigationType || "");
                setAdditionalNotes(data.additionalNotes || "");
                
                Alert.alert(
                    language === "si" ? "පෝරමය පූරණය කරන ලදී" : "Form Loaded",
                    language === "si" ? "සුරකින ලද දත්ත පූරණය කරන ලදී" : "Saved data has been loaded"
                );
            } else {
                Alert.alert(
                    language === "si" ? "දත්ත නැත" : "No Data",
                    language === "si" ? "සුරකින ලද පෝරම දත්ත නොමැත" : "No saved form data found"
                );
            }
        } catch (error) {
            console.error("Error loading form data:", error);
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "දත්ත පූරණය කිරීමේදී දෝෂයක් ඇතිවිය" : "Error loading data"
            );
        }
    };

    // Refs for text inputs to prevent keyboard dismissal
    const nicInputRef = React.useRef<TextInput>(null);
    const phoneInputRef = React.useRef<TextInput>(null);
    const landSizeInputRef = React.useRef<TextInput>(null);

    const saveFormData = async () => {
        try {
            const formData = {
                fullName,
                nic,
                phone,
                district,
                location,
                landSize,
                irrigationType,
                additionalNotes,
                timestamp: new Date().toISOString(),
            };
            await AsyncStorage.setItem("soilTestRequestForm", JSON.stringify(formData));
        } catch (error) {
            console.error("Error saving form data:", error);
        }
    };

    const handleManualSave = async () => {
        try {
            await saveFormData();
            Alert.alert(
                language === "si" ? "සුරකින ලදී" : "Saved",
                language === "si" ? "පෝරම දත්ත සාර්ථකව සුරකින ලදී" : "Form data saved successfully"
            );
        } catch (error) {
            Alert.alert(
                language === "si" ? "දෝෂයකි" : "Error",
                language === "si" ? "දත්ත සුරැකීමේදී දෝෂයක් ඇතිවිය" : "Error saving data"
            );
        }
    };

    // Auto-save form data when fields change (debounced)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            saveFormData();
        }, 1000);
        return () => clearTimeout(timer);
    }, [fullName, nic, phone, district, location, landSize, irrigationType, additionalNotes]);


    const validate = () => {
        if (!fullName.trim() || !phone.trim() || !district.trim() || !landSize.trim() || !irrigationType.trim()) {
            Alert.alert(t.errorTitle, t.requiredError);
            return false;
        }
        return true;
    };

    const buildMessage = () => {
        const sep = "\n";
        return [
            `🔬 SOIL TEST REQUEST`,
            `━━━━━━━━━━━━━━━━━━━━━━`,
            ``,
            `🧑‍🌾 FARMER DETAILS`,
            `Name       : ${fullName}`,
            nic ? `NIC        : ${nic}` : null,
            `Phone      : ${phone}`,
            `District   : ${district}`,
            location ? `Location   : ${location}` : null,
            ``,
            `🌱 LAND DETAILS`,
            `Land Size  : ${landSize} acres`,
            `Irrigation : ${irrigationType}`,
            ``,
            additionalNotes ? `📋 ADDITIONAL NOTES\n${additionalNotes}` : null,
            ``,
            `━━━━━━━━━━━━━━━━━━━━━━`,
            `[PRO MEMBER - Soil Test Request]`,
        ]
            .filter(Boolean)
            .join(sep);
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!user?.id || !user?.district) {
            Alert.alert(t.errorTitle, "User data not available. Please refresh and try again.");
            return;
        }

        setSubmitting(true);
        try {
            // Get or create the farmer ↔ officer chat room
            const districtForRoom = getDistrictKey(district) || user.district;
            const room = await getOrCreateRoom(String(user.id), districtForRoom);
            const roomId = String(room.id);

            // Navigate to chat with prefilled message
            navigation.navigate("Chat", {
                roomId: null,
                userId: null,
                prefilledMessage: buildMessage(),
                context: "soil_test_request",
            });

            // Clear saved form data after successful submission
            await AsyncStorage.removeItem("soilTestRequestForm");
        } catch (e) {
            console.error("Soil test request error:", e);
            Alert.alert(t.errorTitle, t.errorMsg);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* ─── Header ───────────────────────────────── */}
                <LinearGradient
                    colors={["#10b981", "#059669"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
                        <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={loadFormData} style={styles.headerIconButton}>
                            <Archive color="#FFFFFF" size={20} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleManualSave} style={styles.headerIconButton}>
                            <Archive color="#FFFFFF" size={20} fill="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* ─── Form ─────────────────────────────────── */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Intro */}
                    <View style={styles.infoBanner}>
                        <TestTube size={18} color="#10b981" />
                        <Text style={styles.infoBannerText}>{t.intro}</Text>
                    </View>

                    {/* ── Personal Info Section ─────────────────────── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.sectionPersonal}</Text>

                        {/* Full Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {t.fullName}<Text style={styles.required}> *</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconContainer}>
                                    <User size={18} color="#10b981" />
                                </View>
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder={t.fullNamePH}
                                    placeholderTextColor="#9CA3AF"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        {/* NIC Number */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t.nic}</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconContainer}>
                                    <User size={18} color="#10b981" />
                                </View>
                                <TextInput
                                    ref={nicInputRef}
                                    value={nic}
                                    onChangeText={setNic}
                                    placeholder={t.nicPH}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="default"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        {/* Phone Number */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {t.phone}<Text style={styles.required}> *</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconContainer}>
                                    <User size={18} color="#10b981" />
                                </View>
                                <TextInput
                                    ref={phoneInputRef}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder={t.phonePH}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="default"
                                    style={styles.input}
                                />
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <CustomDropdown
                                label={t.district}
                                value={district}
                                options={districtOptions}
                                onSelect={setDistrict}
                                placeholder={t.districtPH}
                                required
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <CustomDropdown
                                label={t.location}
                                value={location}
                                options={locationOptions}
                                onSelect={setLocation}
                                placeholder={t.locationPH}
                                disabled={!district || locationOptions.length === 0}
                            />
                        </View>
                    </View>

                    {/* ── Land Data Section ────────────────── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.sectionLand}</Text>

                        {/* Land Size */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {t.landSize}<Text style={styles.required}> *</Text>
                            </Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconContainer}>
                                    <Ruler size={18} color="#10b981" />
                                </View>
                                <TextInput
                                    ref={landSizeInputRef}
                                    value={landSize}
                                    onChangeText={setLandSize}
                                    placeholder={t.landSizePH}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="default"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <CustomDropdown
                                label={t.irrigationType}
                                value={irrigationType}
                                options={irrigationOptions}
                                onSelect={setIrrigationType}
                                placeholder={t.irrigationTypePH}
                                required
                            />
                        </View>

                        {/* Additional Notes */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>{t.additionalNotes}</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconContainer}>
                                    <FileText size={18} color="#10b981" />
                                </View>
                                <TextInput
                                    value={additionalNotes}
                                    onChangeText={setAdditionalNotes}
                                    placeholder={t.additionalNotesPH}
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    style={[styles.input, styles.multilineInput]}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* ─── Submit Button ─────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={["#10b981", "#059669"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.submitButton}
                        >
                            {submitting ? (
                                <>
                                    <ActivityIndicator color="#ffffff" />
                                    <Text style={styles.submitButtonText}>{t.submitting}</Text>
                                </>
                            ) : (
                                <>
                                    <Send size={20} color="#ffffff" />
                                    <Text style={styles.submitButtonText}>{t.submit}</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8F5E9",
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
    },
    headerCenter: {
        flex: 1,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
    },
    headerIconButton: {
        padding: 8,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#D1FAE5",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#D1FAE5",
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        color: "#047857",
        lineHeight: 20,
        fontWeight: "500",
    },
    section: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000000",
        marginBottom: 8,
    },
    required: {
        color: "#EF4444",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: "#000000",
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: "top",
        paddingTop: 14,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 18,
        paddingBottom: Platform.OS === "ios" ? 32 : 18,
        backgroundColor: "rgba(232,245,233,0.97)",
        borderTopWidth: 1,
        borderTopColor: "#D1FAE5",
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    submitButtonText: {
        fontSize: 17,
        fontWeight: "800",
        color: "#ffffff",
        letterSpacing: 0.3,
    },
});
