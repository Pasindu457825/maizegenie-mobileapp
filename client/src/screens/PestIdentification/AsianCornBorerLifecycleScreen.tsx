import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useLanguage } from "../../context/LanguageContext";

type LangKey = "si" | "en";

const stages = [
  {
    key: "egg",
    label: { si: "බිත්තරය", en: "Egg" },
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_egg.jpg"),
    description: { 
      si: "බිත්තර පොකුරු ලෙස පත්‍ර පහළ පැත්තට තබනු ලබන අතර මත්ස්‍ය කොරල් මෙන් පෙනේ.", 
      en: "Eggs are laid in groups on the underside of leaves, appearing like fish scales." 
    },
    voiceTextEn:
      "Asian Corn Borer eggs are laid in clusters on the underside of maize leaves. The eggs look like overlapping fish scales. Regular inspection of leaves allows farmers to remove egg masses early and prevent larval outbreaks.",
    voiceTextSi:
      "ඇසියන් කොෝන් බෝරර්ගේ බිත්තු පොකුරු ලෙස පත්‍රවල පහල පැත්තට තැබෙනවා. මේ බිත්තු මත්ස්‍ය scales වැනි තද පැල්ලම් ලෙස පෙනෙනවා. පත්‍ර පිරික්සීම ඉක්මනින් කළහොත් බිත්තු ඉවත් කරලා කූඹි හානි අවම කළ හැක."
  },
  {
    key: "larva",
    label: { si: "කීටයා", en: "Larva" },
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_larva.jpg"),
    description: { 
      si: "කීටයින් (කූඹියන්) කඳට විදිමින් ප්‍රධාන හානි කරනවා.", 
      en: "Larvae (caterpillars) bore into stems and cause major damage to the corn plant." 
    },
    voiceTextEn:
      "The larva stage is the most destructive. The caterpillars bore into stems, weaken the plant, and interfere with nutrient flow. This can lead to broken stems and reduced yields. Early detection and control are very important.",
    voiceTextSi:
      "ලාරා අදියරයි වගාවට වැඩිපුරම හානි කරන කාලය. කූඹියෝ බෝංචිය තුළට පතා පවුලේ පෝෂණ ගමන් මාර්ග කඩා දමනවා. මේකෙන් බෝංචි කඩා වැටී යාවූ හානි සහ අස්වැන්න අඩුවීම සිදු වෙනවා. ඉක්මනින් හඳුනාගෙන පාලනය කිරීම අත්‍යවශ්‍යයි."
  },
  {
    key: "pupa",
    label: { si: "පියුපාව", en: "Pupa" },
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_pupa.jpg"),
    description: { 
      si: "පියුපා අවධිය සාමාන්‍යයෙන් කඳ තුළ හෝ වගා අපද්‍රව්‍යයේ සිදුවේ.", 
      en: "Pupation usually takes place inside the stem or in crop debris." 
    },
    voiceTextEn:
      "During the pupa stage, the larva hides inside the stem or in leftover crop debris and begins transforming into an adult moth. No feeding occurs at this time. Good field sanitation helps reduce pest numbers.",
    voiceTextSi:
      "පූපා අදියරේදී කූඹියා බෝංචිය තුළ හෝ වගා අවශේෂ මත සැඟවී අළුත් මදුවන්නෙකු වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදු තබා ගැනීමෙන් පූපා සංඛ්‍යාව අඩු කළ හැක."
  },
  {
    key: "adult",
    label: { si: "වැඩිහිටියා (මදුවා)", en: "Adult (Moth)" },
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_adult.jpg"),
    description: { 
      si: "වැඩිහිටියෝ කුඩා මදුවන් වන අතර රාත්‍රියේ පියාසර කරති.", 
      en: "Adults are small moths that fly at night and lay eggs to continue the cycle." 
    },
    voiceTextEn:
      "The adult Asian Corn Borer is a small, pale moth that flies at night. It lays clusters of eggs on leaves, restarting the life cycle. Light traps and regular monitoring can help control adult moth populations.",
    voiceTextSi:
      "වැඩිහිටි ඇසියන් කොෝන් බෝරර් මදුවන්නෙක්. රාත්‍රීයේ පියාසර කරලා පත්‍රවලට බිත්තු පොකුරු තැබීමෙන් ජීවිත චක්‍රය නැවත ආරම්භ කරනවා. ආලෝක පෝෂක යන්ත්‍ර හා පරීක්ෂා කිරීම මදුවන්නෝ පාලනයට උපකාරී."
  }
];

export default function AsianCornBorerLifecycleScreen() {
  /* 🌐 GLOBAL LANGUAGE */
  const { language: appLang } = useLanguage();
  const language: LangKey = appLang === "sinhala" ? "si" : "en";

  /* 📝 TEXT CONTENT */
  const content = {
    si: {
      headerTitle: "ඇසියන් කෝන් බෝරර් ජීවන චක්‍රය",
      headerSubtitle: "කෘමි සංවර්ධන අදියර තේරුම් ගැනීම",
      voiceLabel: "විස්තරාත්මක තොරතුරු සඳහා සවන් දෙන්න:",
      sinhalaBtn: "සිංහල",
      englishBtn: "English",
      stopBtn: "නවත්වන්න",
    },
    en: {
      headerTitle: "Asian Corn Borer Lifecycle",
      headerSubtitle: "Understanding pest development stages",
      voiceLabel: "Listen to detailed information:",
      sinhalaBtn: "සිංහල",
      englishBtn: "English",
      stopBtn: "Stop",
    },
  };

  const [speakingStageKey, setSpeakingStageKey] = useState<string | null>(null);
  const [speakingLang, setSpeakingLang] = useState<"si" | "en" | null>(null);

  const playNarration = async (stageKey: string, lang: "si" | "en", text: string) => {
    Speech.stop();
    setSpeakingStageKey(stageKey);
    setSpeakingLang(lang);

    if (lang === "si") {
      const voices = await Speech.getAvailableVoicesAsync();
      const hasSinhala = voices.some(
        (v) => v.language?.toLowerCase().includes("si") || v.language?.toLowerCase().includes("sin")
      );
      if (!hasSinhala) {
        Alert.alert(
          "Sinhala Voice Not Available",
          "Sinhala voice is not available on this device. Please enable Sinhala Text‑to‑Speech in your phone settings."
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
      }
    });
  };

  const stopNarration = () => {
    Speech.stop();
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