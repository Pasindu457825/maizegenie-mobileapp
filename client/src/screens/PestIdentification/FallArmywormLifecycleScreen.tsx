import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useLanguage } from "../../context/LanguageContext";

type LangKey = "si" | "en" | "ta";

// Add your narration data here (from previous step)
const stages = [
  {
    key: "egg",
    label: { si: "බිත්තරය", en: "Egg", ta: "முட்டை" },
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_egg.png"),
    description: { 
      si: "බිත්තර පොකුරු ලෙස තබනු ලබන අතර, සාමාන්‍යයෙන් පත්‍ර වල පහළ පැත්තට.", 
      en: "Eggs are laid in clusters, usually on the underside of leaves.",
      ta: "முட்டைகள் பொதுவாக இலைகளின் அடிப்புறத்தில் குவியல்களாக இடப்படுகின்றன." },
    voiceTextEn: "Fall Armyworm eggs are laid in clusters, usually on the underside of maize leaves. These eggs are small, round, and pale in color. Farmers should look closely under leaves and remove egg masses when found to prevent further damage.",
    voiceTextSi: "සේනා දළබුවගේ බිත්තු පොකුරු ලෙස පත්‍ර වල පහල පැත්තට තැබෙනවා. බිත්තු කුඩා, රවුම් හා සුදු පැහැතිව පෙනෙනවා. ගොවියෝ පත්‍ර පහලින් බැලුවොත් බිත්තු පොකුරු හඳුනාගෙන ඉවත් කළ යුතුයි."
  },
  {
    key: "larva",
    label: { si: "කීටයා", en: "Larva", ta: "இருவில்" },
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_larva.png"),
    description: { 
      si: "කීටයින් (කූඹියන්) හානිකර අදියර වන අතර, ශාක පත්‍ර ආහාරයට ගනී.", 
      en: "Larvae (caterpillars) are the damaging stage, feeding on plant leaves.",
      ta: "இருவில் (புழு) நிலைதான் அதிக சேதம் செய்யும்; இது தாவர இலைகளைத் தின்று சேதப்படுத்தும்." },
    voiceTextEn: "The larva, or caterpillar, is the most damaging stage. These larvae feed on maize leaves, creating holes and sometimes attacking the cob. Early detection and control at this stage can help save your crop.",
    voiceTextSi: "ලාරා, එනම් කූඹියා, වැඩිපුර හානි කරන අදියරයි. මේ කූඹියෝ පත්‍ර කමින් ගැටලු ඇති කරනවා, සමහරවිට ඇටයටවත් හානි කරනවා. මෙය ඉක්මනින් හඳුනාගෙන පාලනය කළහොත් වගාව බේරාගන්න පුළුවන්."
  },
  {
    key: "pupa",
    label: { si: "පියුපාව", en: "Pupa", ta: "பூப்பா" },
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_pupa.png"),
    description: { 
      si: "පියුපා අවධිය පසෙහි සිදු වේ. කූඹියා වැඩිහිටියෙකු බවට පරිවර්තනය වේ.", 
      en: "Pupa stage occurs in the soil. The caterpillar transforms into an adult.",
      ta: "பூப்பா நிலை மண்ணில் ஏற்படும்; புழு முழுவயது வண்டாக மாறும்." },
    voiceTextEn: "During the pupa stage, the caterpillar goes underground to change into an adult moth. No feeding or damage happens at this time. Good field hygiene and removing crop debris can reduce pupae numbers.",
    voiceTextSi: "පූපා අදියරේදී කූඹියා බිමට යාමෙන් අළුත් මදුවන්නෙක් වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදුව තබන එක පූපා සංඛ්‍යාව අඩු කරගන්න හොඳ ක්‍රමයක්."
  },
  {
    key: "adult",
    label: { si: "වැඩිහිටියා (මදුවා)", en: "Adult (Moth)", ta: "முழுவயது (வண்டு)" },
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_adult.png"),
    description: { 
      si: "වැඩිහිටියා චක්‍රය නැවත ආරම්භ කිරීමට බිත්තර දමන මදුවෙකි.", 
      en: "The adult is a moth that lays eggs to start the cycle again.",
      ta: "முழுவயது வண்டு முட்டைகள் இடும்; அதனால் வாழ்க்கைச் சுழற்சி மீண்டும் தொடங்கும்." },
    voiceTextEn: "The adult Fall Armyworm is a brownish moth. It flies at night and lays eggs to start the life cycle again. Monitoring adult moths and using light traps can help control their population.",
    voiceTextSi: "වැඩිහිටි සේනා දළබුව මදුවන්නෙක්. රාත්‍රීයේ පියාසර කරලා නැවතත් බිත්තු තබනවා. වැඩිහිටි මදුවන්නෝ පාලනයට ආලෝක පෝෂක යන්ත්‍ර යොදාගන්න හෝ පරීක්ෂා කිරීම හොඳයි."
  }
];

export default function FallArmywormLifecycleScreen() {
  /* 🌐 GLOBAL LANGUAGE */
  const { language: appLang } = useLanguage();
  const language: LangKey =
    appLang === "sinhala" ? "si" : appLang === "tamil" ? "ta" : "en";

  /* 📝 TEXT CONTENT */
  const content = {
    si: {
      headerTitle: "සේනා දළබුව ජීවන චක්‍රය",
      headerSubtitle: "කෘමි සංවර්ධන අදියර තේරුම් ගැනීම",
      voiceLabel: "විස්තරාත්මක තොරතුරු සඳහා සවන් දෙන්න:",
      sinhalaBtn: "සිංහල",
      englishBtn: "English",
      stopBtn: "නවත්වන්න",
    },
    en: {
      headerTitle: "Fall Armyworm Lifecycle",
      headerSubtitle: "Understanding pest development stages",
      voiceLabel: "Listen to detailed information:",
      sinhalaBtn: "සිංහල",
      englishBtn: "English",
      stopBtn: "Stop",
    },
    ta: {
      headerTitle: "பால் ஆர்மிவோர்ம் வாழ்க்கைச் சுழற்சி",
      headerSubtitle: "பூச்சியின் வளர்ச்சி நிலைகளை புரிந்துகொள்ளுங்கள்",
      voiceLabel: "விரிவான தகவலை கேளுங்கள்:",
      sinhalaBtn: "சிங்களம்",
      englishBtn: "English",
      stopBtn: "நிறுத்து",
    },
  };

  // To keep track of which (if any) voice is currently playing
  const [speakingStageKey, setSpeakingStageKey] = useState<string | null>(null);
  const [speakingLang, setSpeakingLang] = useState<"si" | "en" | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Helper: Play the narration
  const playNarration = async (stageKey: string, lang: "si" | "en", text: string) => {
    try {
      await Speech.stop();
      setSpeakingStageKey(stageKey);
      setSpeakingLang(lang);

      if (lang === "si") {
        const voices = await Speech.getAvailableVoicesAsync();
        const hasSinhala = voices.some(
          (v) => (v.language?.toLowerCase().includes("si") || v.language?.toLowerCase().includes("sin"))
        );
        if (!hasSinhala) {
          Alert.alert(
            "Sinhala Voice Not Available",
            "Sinhala voice is not available on this device. Please enable Sinhala Text-to-Speech in your phone's system settings."
          );
          setSpeakingStageKey(null);
          setSpeakingLang(null);
          return;
        }
      }

      Speech.speak(text, {
        language: lang === "si" ? "si-LK" : "en-US",
        rate: 1.0,
        pitch: 1.0,
        onDone: () => {
          setSpeakingStageKey(null);
          setSpeakingLang(null);
        },
        onStopped: () => {
          setSpeakingStageKey(null);
          setSpeakingLang(null);
        },
        onError: () => {
          setSpeakingStageKey(null);
          setSpeakingLang(null);
          Alert.alert("Speech Error", "Unable to start voice playback on this device.");
        }
      });
    } catch (error) {
      console.warn("Failed to play Fall Armyworm lifecycle narration:", error);
      setSpeakingStageKey(null);
      setSpeakingLang(null);
      Alert.alert("Speech Error", "Unable to start voice playback on this device.");
    }
  };

  // Helper: Stop narration
  const stopNarration = () => {
    Speech.stop().catch((error) => {
      console.warn("Failed to stop Fall Armyworm lifecycle narration:", error);
    });
    setSpeakingStageKey(null);
    setSpeakingLang(null);
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={["#10AD79", "#0F9D6B"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{content[language].headerTitle}</Text>
        <Text style={styles.headerSubtitle}>{content[language].headerSubtitle}</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {stages.map((stage, index) => (
          <View key={stage.key} style={styles.stageCard}>
            <View style={styles.cardHeader}>
              <View style={styles.stageNumberContainer}>
                <LinearGradient
                  colors={["#10AD79", "#0F9D6B"]}
                  style={styles.stageNumberGradient}
                >
                  <Text style={styles.stageNumber}>{index + 1}</Text>
                </LinearGradient>
              </View>
              <Text style={styles.stageTitle}>{stage.label[language]}</Text>
            </View>

            <View style={styles.imageContainer}>
              <Image source={stage.image} style={styles.stageImage} />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.stageDesc}>{stage.description[language]}</Text>
              
              <View style={styles.divider} />

              <Text style={styles.voiceLabel}>{content[language].voiceLabel}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    speakingStageKey === stage.key && speakingLang === "si" && styles.voiceButtonActive
                  ]}
                  onPress={() =>
                    speakingStageKey === stage.key && speakingLang === "si"
                      ? stopNarration()
                      : playNarration(stage.key, "si", stage.voiceTextSi)
                  }
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      speakingStageKey === stage.key && speakingLang === "si"
                        ? ["#EF4444", "#DC2626"]
                        : ["#10AD79", "#0F9D6B"]
                    }
                    style={styles.voiceButtonGradient}
                  >
                    <Text style={styles.voiceIcon}>
                      {speakingStageKey === stage.key && speakingLang === "si" ? "⏹" : "🔊"}
                    </Text>
                    <Text style={styles.voiceButtonText}>
                      {speakingStageKey === stage.key && speakingLang === "si" 
                        ? content[language].stopBtn 
                        : content[language].sinhalaBtn}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    speakingStageKey === stage.key && speakingLang === "en" && styles.voiceButtonActive
                  ]}
                  onPress={() =>
                    speakingStageKey === stage.key && speakingLang === "en"
                      ? stopNarration()
                      : playNarration(stage.key, "en", stage.voiceTextEn)
                  }
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      speakingStageKey === stage.key && speakingLang === "en"
                        ? ["#EF4444", "#DC2626"]
                        : ["#10AD79", "#0F9D6B"]
                    }
                    style={styles.voiceButtonGradient}
                  >
                    <Text style={styles.voiceIcon}>
                      {speakingStageKey === stage.key && speakingLang === "en" ? "⏹" : "🔊"}
                    </Text>
                    <Text style={styles.voiceButtonText}>
                      {speakingStageKey === stage.key && speakingLang === "en" 
                        ? content[language].stopBtn 
                        : content[language].englishBtn}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0F2E9",
    textAlign: "center",
    fontWeight: "500",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  stageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  stageNumberContainer: {
    marginRight: 12,
  },
  stageNumberGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10AD79",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stageNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#F9FAFB",
  },
  stageImage: {
    width: 240,
    height: 180,
    borderRadius: 16,
    resizeMode: "cover",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stageDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  voiceLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  voiceButton: {
    flex: 1,
    maxWidth: 150,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#10AD79",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceButtonActive: {
    shadowColor: "#EF4444",
  },
  voiceButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  voiceIcon: {
    fontSize: 16,
  },
  voiceButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footerSpace: {
    height: 20,
  },
});

