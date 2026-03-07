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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextInput } from "react-native-paper";
import {
    ArrowLeft,
    TestTube,
    Send,
    User,
    MapPin,
    Leaf,
    Ruler,
    Droplets,
    Calendar,
    FlaskConical,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import { getOrCreateRoom } from "../../services/chatRoomApi";

// ─── Translations ────────────────────────────────────────────────────────────

const content = {
    sinhala: {
        headerTitle: "පස් පරීක්ෂණ ඉල්ලීම",
        headerSubtitle: "ඔබේ භූමිය පිළිබඳ විවරණය",
        intro:
            "පහත ඇති පෝරමය සම්පූර්ණ කරා. ඔබේ කෘෂිකාර්මික නිලධාරියාට ඉල්ලීම යැවෙනු ඇත.",
        sectionPersonal: "🧑‍🌾 පෞද්ගලික තොරතුරු",
        sectionLand: "🌱 ඉඩම් හා ගොවිතැන් තොරතුරු",
        sectionSoil: "🔬 පස් සහ ජල විස්තර",
        fullName: "සම්පූර්ණ නම",
        fullNamePH: "ඔබේ නම ඇතුළත් කරන්න",
        nic: "ජාතික හැඳුනුම්පත් අංකය",
        nicPH: "NIC ඇතුළත් කරන්න",
        phone: "දූරකථන අංකය",
        phonePH: "07XXXXXXXX",
        district: "දිස්ත්‍රික්කය",
        districtPH: "දිස්ත්‍රික්කය ඇතුළත් කරන්න",
        village: "ග්‍රාමය / ප්‍රදේශය",
        villagePH: "ග්‍රාමය ඇතුළත් කරන්න",
        landSize: "ඉඩම් ප්‍රමාණය (අක්කර)",
        landSizePH: "උදා: 2.5",
        cropVariety: "රෝපිත ප්‍රභේදය",
        cropVarietyPH: "උදා: H614D",
        plantingDate: "රෝපිත දිනය",
        plantingDatePH: "YYYY-MM-DD",
        season: "ඍතුව",
        seasonPH: "yala / maha",
        irrigationType: "ජල සපයා ගැනීමේ ක්‍රමය",
        irrigationTypePH: "rain-fed / irrigated",
        previousCrop: "කලින් ගොවිතැන් කළ බෝගය",
        previousCropPH: "කලිනි බෝගය",
        additionalNotes: "වෙනත් සටහන්",
        additionalNotesPH: "අමතර තොරතුරු...",
        submit: "ඉල්ලීම යවන්න",
        submitting: "යවමින්...",
        requiredError: "කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර සම්පූර්ණ කරන්න",
        successTitle: "ඉල්ලීම යැවිණ! ✅",
        successMsg:
            "ඔබේ පස් පරීක්ෂණ ඉල්ලීම ඔබේ දිස්ත්‍රික්කයේ කෘෂිකාර්මික නිලධාරියාට සාර්ථකව යැවිණ.",
        errorTitle: "දෝෂයකි",
        errorMsg: "ඉල්ලීම යවීමේදී දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.",
    },
    english: {
        headerTitle: "Soil Test Request",
        headerSubtitle: "Tell us about your field",
        intro:
            "Fill the form below. Your request will be sent directly to your district Agriculture Officer.",
        sectionPersonal: "🧑‍🌾 Personal Information",
        sectionLand: "🌱 Land & Cultivation Details",
        sectionSoil: "🔬 Soil & Water Details",
        fullName: "Full Name",
        fullNamePH: "Enter your full name",
        nic: "NIC Number",
        nicPH: "Enter NIC",
        phone: "Phone Number",
        phonePH: "07XXXXXXXX",
        district: "District",
        districtPH: "Enter your district",
        village: "Village / Area",
        villagePH: "Enter village",
        landSize: "Land Size (acres)",
        landSizePH: "e.g. 2.5",
        cropVariety: "Crop Variety",
        cropVarietyPH: "e.g. H614D",
        plantingDate: "Planting Date",
        plantingDatePH: "YYYY-MM-DD",
        season: "Season",
        seasonPH: "yala / maha",
        irrigationType: "Irrigation Type",
        irrigationTypePH: "rain-fed / irrigated",
        previousCrop: "Previous Crop",
        previousCropPH: "Previous crop grown",
        additionalNotes: "Additional Notes",
        additionalNotesPH: "Any extra information...",
        submit: "Send Request",
        submitting: "Sending...",
        requiredError: "Please fill in all required fields",
        successTitle: "Request Sent! ✅",
        successMsg:
            "Your soil test request has been sent to your district Agriculture Officer.",
        errorTitle: "Error",
        errorMsg: "Failed to send the request. Please try again.",
    },
    tamil: {
        headerTitle: "மண் பரிசோதனை கோரிக்கை",
        headerSubtitle: "உங்கள் நிலம் பற்றி சொல்லுங்கள்",
        intro:
            "கீழே உள்ள படிவத்தை நிரப்புங்கள். உங்கள் கோரிக்கை மாவட்ட விவசாய அதிகாரிக்கு அனுப்பப்படும்.",
        sectionPersonal: "🧑‍🌾 தனிப்பட்ட தகவல்",
        sectionLand: "🌱 நில & சாகுபடி விவரங்கள்",
        sectionSoil: "🔬 மண் & நீர் விவரங்கள்",
        fullName: "முழு பெயர்",
        fullNamePH: "உங்கள் பெயரை உள்ளிடுங்கள்",
        nic: "தேசிய அடையாள அட்டை எண்",
        nicPH: "NIC உள்ளிடுங்கள்",
        phone: "தொலைபேசி எண்",
        phonePH: "07XXXXXXXX",
        district: "மாவட்டம்",
        districtPH: "மாவட்டத்தை உள்ளிடுங்கள்",
        village: "கிராமம் / பகுதி",
        villagePH: "கிராமத்தை உள்ளிடுங்கள்",
        landSize: "நில அளவு (ஏக்கர்)",
        landSizePH: "எ.கா: 2.5",
        cropVariety: "பயிர் வகை",
        cropVarietyPH: "எ.கா: H614D",
        plantingDate: "நடும் தேதி",
        plantingDatePH: "YYYY-MM-DD",
        season: "பருவம்",
        seasonPH: "yala / maha",
        irrigationType: "நீர்ப்பாசன வகை",
        irrigationTypePH: "மழை / நீர்ப்பாசனம்",
        previousCrop: "முந்தைய பயிர்",
        previousCropPH: "முந்தைய பயிர்",
        additionalNotes: "கூடுதல் குறிப்புகள்",
        additionalNotesPH: "கூடுதல் தகவல்...",
        submit: "கோரிக்கை அனுப்பு",
        submitting: "அனுப்புகிறோம்...",
        requiredError: "அனைத்து தேவையான புலங்களையும் நிரப்பவும்",
        successTitle: "கோரிக்கை அனுப்பப்பட்டது! ✅",
        successMsg:
            "உங்கள் மண் பரிசோதனை கோரிக்கை மாவட்ட விவசாய அதிகாரிக்கு வெற்றிகரமாக அனுப்பப்பட்டது.",
        errorTitle: "பிழை",
        errorMsg: "கோரிக்கையை அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SoilTestRequestScreen() {
    const navigation = useNavigation<any>();
    const { user } = useApp();
    const { language: lang } = useLanguage();
    const language = lang === "sinhala" ? "sinhala" : lang === "tamil" ? "tamil" : "english";
    const t = content[language];

    // ── Form state ──
    const [fullName, setFullName] = useState(user?.full_name || "");
    const [nic, setNic] = useState("");
    const [phone, setPhone] = useState("");
    const [district, setDistrict] = useState(user?.district || "");
    const [village, setVillage] = useState("");
    const [landSize, setLandSize] = useState("");
    const [cropVariety, setCropVariety] = useState("");
    const [plantingDate, setPlantingDate] = useState("");
    const [season, setSeason] = useState("");
    const [irrigationType, setIrrigationType] = useState("");
    const [previousCrop, setPreviousCrop] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validate = () => {
        if (!fullName.trim() || !phone.trim() || !district.trim() || !landSize.trim()) {
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
            village ? `Village    : ${village}` : null,
            ``,
            `🌱 CULTIVATION DETAILS`,
            `Land Size  : ${landSize} acres`,
            cropVariety ? `Crop Variety: ${cropVariety}` : null,
            plantingDate ? `Planted On  : ${plantingDate}` : null,
            season ? `Season      : ${season}` : null,
            irrigationType ? `Irrigation  : ${irrigationType}` : null,
            previousCrop ? `Prev. Crop  : ${previousCrop}` : null,
            ``,
            additionalNotes ? `📋 NOTES\n${additionalNotes}` : null,
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
            const room = await getOrCreateRoom(String(user.id), user.district);
            const roomId = String(room.id);

            navigation.navigate("Chat", {
                roomId: null,
                userId: null,
                prefilledMessage: buildMessage(),
                context: "soil_test_request",
            });

            Alert.alert(t.successTitle, t.successMsg, [
                {
                    text: "OK",
                    onPress: () => { },
                },
            ]);
        } catch (e) {
            console.error("Soil test request error:", e);
            Alert.alert(t.errorTitle, t.errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const InputField = ({
        label,
        value,
        onChange,
        placeholder,
        icon,
        keyboardType = "default" as any,
        multiline = false,
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        placeholder: string;
        icon: any;
        keyboardType?: any;
        multiline?: boolean;
    }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                mode="outlined"
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                style={[styles.input, multiline && { height: 80 }]}
                outlineColor="#d1d5db"
                activeOutlineColor="#6366f1"
                left={<TextInput.Icon icon={() => <>{icon}</>} />}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                {/* ─── Header ───────────────────────────────── */}
                <LinearGradient
                    colors={["#6366f1", "#4f46e5"]}
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
                        <View style={styles.headerIcon}>
                            <TestTube size={28} color="#a5b4fc" />
                        </View>
                        <Text style={styles.headerTitle}>{t.headerTitle}</Text>
                        <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
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
                        <TestTube size={18} color="#6366f1" />
                        <Text style={styles.infoBannerText}>{t.intro}</Text>
                    </View>

                    {/* ── Personal Info ─────────────────────── */}
                    <Text style={styles.sectionHeader}>{t.sectionPersonal}</Text>

                    <InputField
                        label={`${t.fullName} *`}
                        value={fullName}
                        onChange={setFullName}
                        placeholder={t.fullNamePH}
                        icon={<User size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.nic}
                        value={nic}
                        onChange={setNic}
                        placeholder={t.nicPH}
                        icon={<User size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={`${t.phone} *`}
                        value={phone}
                        onChange={setPhone}
                        placeholder={t.phonePH}
                        icon={<User size={18} color="#6366f1" />}
                        keyboardType="phone-pad"
                    />
                    <InputField
                        label={`${t.district} *`}
                        value={district}
                        onChange={setDistrict}
                        placeholder={t.districtPH}
                        icon={<MapPin size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.village}
                        value={village}
                        onChange={setVillage}
                        placeholder={t.villagePH}
                        icon={<MapPin size={18} color="#6366f1" />}
                    />

                    {/* ── Land & Cultivation ────────────────── */}
                    <Text style={styles.sectionHeader}>{t.sectionLand}</Text>

                    <InputField
                        label={`${t.landSize} *`}
                        value={landSize}
                        onChange={setLandSize}
                        placeholder={t.landSizePH}
                        icon={<Ruler size={18} color="#6366f1" />}
                        keyboardType="decimal-pad"
                    />
                    <InputField
                        label={t.cropVariety}
                        value={cropVariety}
                        onChange={setCropVariety}
                        placeholder={t.cropVarietyPH}
                        icon={<Leaf size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.plantingDate}
                        value={plantingDate}
                        onChange={setPlantingDate}
                        placeholder={t.plantingDatePH}
                        icon={<Calendar size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.season}
                        value={season}
                        onChange={setSeason}
                        placeholder={t.seasonPH}
                        icon={<Leaf size={18} color="#6366f1" />}
                    />

                    {/* ── Soil / Water ─────────────────────── */}
                    <Text style={styles.sectionHeader}>{t.sectionSoil}</Text>

                    <InputField
                        label={t.irrigationType}
                        value={irrigationType}
                        onChange={setIrrigationType}
                        placeholder={t.irrigationTypePH}
                        icon={<Droplets size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.previousCrop}
                        value={previousCrop}
                        onChange={setPreviousCrop}
                        placeholder={t.previousCropPH}
                        icon={<FlaskConical size={18} color="#6366f1" />}
                    />
                    <InputField
                        label={t.additionalNotes}
                        value={additionalNotes}
                        onChange={setAdditionalNotes}
                        placeholder={t.additionalNotesPH}
                        icon={<FlaskConical size={18} color="#6366f1" />}
                        multiline
                    />

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
                            colors={["#6366f1", "#4f46e5"]}
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
        backgroundColor: "#f5f3ff",
    },
    header: {
        paddingTop: 56,
        paddingBottom: 28,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 56,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: {
        alignItems: "center",
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
        fontWeight: "500",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 20,
    },
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#ede9fe",
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#c4b5fd",
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        color: "#4c1d95",
        lineHeight: 20,
        fontWeight: "500",
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: "800",
        color: "#4f46e5",
        marginBottom: 12,
        marginTop: 8,
        letterSpacing: 0.3,
    },
    inputGroup: {
        marginBottom: 14,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 6,
    },
    input: {
        backgroundColor: "#ffffff",
        fontSize: 14,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 18,
        paddingBottom: Platform.OS === "ios" ? 32 : 18,
        backgroundColor: "rgba(245,243,255,0.97)",
        borderTopWidth: 1,
        borderTopColor: "#e0e7ff",
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#6366f1",
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
