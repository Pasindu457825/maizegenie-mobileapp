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
    image: require("../../../assets/pest_lifecycle/bollworm/boll_egg.jpg"),
    description: { 
      si: "බොල්වෝම් බිත්තු ඉතා කුඩා, තනිව පත්‍ර, මල් හෝ පලතුරු මත තබනු ලැබේ.", 
      en: "Bollworm eggs are tiny, laid singly on leaves, buds, or fruits." 
    },
    voiceTextEn: "Bollworm eggs are very small and usually laid singly on leaves, buds, or fruits. They are round and white to yellowish in color. Farmers should closely inspect young leaves and buds to find and remove eggs early.",
    voiceTextSi: "බොල්වෝම් බිත්තු ඉතා කුඩායි. ඒවා තනි තනිව පත්‍ර, මල් කෝෂ හෝ පලතුරු මත තැබෙනවා. බිත්තු සුදු හෝ පීච් පැහැයෙන් පෙනෙනවා. ගොවියෝ තරුණ පත්‍ර හා මල් කොට්ටෙන් බිත්තු හඳුනාගෙන ඉවත් කළ යුතුයි."
  },
  {
    key: "larva",
    label: { si: "කීටයා", en: "Larva" },
    image: require("../../../assets/pest_lifecycle/bollworm/boll_larva.jpg"),
    description: { 
      si: "කීටයා (කූඹියා) පත්‍ර ආහාරයට ගෙන මල් සහ පලතුරු තුළට විදිනවා.", 
      en: "The larva (caterpillar) feeds on leaves and bores into buds and fruits causing major crop damage." 
    },
    voiceTextEn: "The larva is a caterpillar and this stage causes the most crop damage. Larvae feed on leaves, bore into buds, and also attack fruits and pods. Early detection and timely spraying can protect the harvest.",
    voiceTextSi: "ලාරාව කියන්නේ කූඹියෙක්. මේ අදියරේදී වගා බෙහෙවින් හානි වෙනවා. කූඹියෝ පත්‍ර කමින්, මල් කොට්ට බිඳමින්, පලතුරු හා අංශ බලපායි. ඉක්මනින් හඳුනාගෙන අවශ්‍ය පාලන ක්‍රියාවලි සිදු කළ යුතුයි."
  },
  {
    key: "pupa",
    label: { si: "පියුපාව", en: "Pupa" },
    image: require("../../../assets/pest_lifecycle/bollworm/boll_pupa.png"),
    description: { 
      si: "පියුපා අවධිය පසෙහි හෝ ශාක සංශේෂයේ සිදු වේ.", 
      en: "Pupation occurs in the soil or plant debris, where the larva transforms into an adult." 
    },
    voiceTextEn: "During the pupa stage, the caterpillar goes into the soil or plant debris and changes into an adult moth. There is no feeding or crop damage at this time. Keeping the field clean reduces pupae numbers.",
    voiceTextSi: "පූපා අදියරේදී කූඹියා බිමට හෝ වගා අපද්‍රව්‍ය තුළට යාමෙන් වැඩිහිටි මදුවන්නෙක් වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදුව තබන එක පූපා සංඛ්‍යාව අඩු කරයි."
  },
  {
    key: "adult",
    label: { si: "වැඩිහිටියා (මදුවා)", en: "Adult (Moth)" },
    image: require("../../../assets/pest_lifecycle/bollworm/boll_adult.png"),
    description: { 
      si: "වැඩිහිටි මදුවා දුඹුරු පැහැති වන අතර බිත්තර තබයි.", 
      en: "The adult moth is pale brown. It lays eggs and starts the lifecycle again." 
    },
    voiceTextEn: "The adult bollworm is a pale brown moth. It is active at night, flies to new plants, and lays eggs to restart the life cycle. Light traps and regular field monitoring help manage the pest.",
    voiceTextSi: "වැඩිහිටි බොල්වෝම් මදුවන්නෙක්. පැහැදිලි දුඹුරු පැහැයකින් පෙනෙනවා. රාත්‍රියේ සක්‍රීය වෙයි, වගා වත්තේ පියාසර කරලා නැවතත් බිත්තු තබනවා. ආලෝක පෝෂක යන්ත්‍ර හා පරීක්ෂා කිරීම ප්‍රතිලාභදායකයි."
  }
];

export default function BollwormLifecycleScreen() {
  /* 🌐 GLOBAL LANGUAGE */
  const { language: appLang } = useLanguage();
  const language: LangKey = appLang === "sinhala" ? "si" : "en";

  /* 📝 TEXT CONTENT */
  const content = {
    si: {
      headerTitle: "බොල්වෝම් ජීවන චක්‍රය",
      headerSubtitle: "කෘමි සංවර්ධන අදියර තේරුම් ගැනීම",
      voiceLabel: "විස්තරාත්මක තොරතුරු සඳහා සවන් දෙන්න:",
      sinhalaBtn: "සිංහල",
      englishBtn: "English",
      stopBtn: "නවත්වන්න",
    },
    en: {
      headerTitle: "Bollworm Lifecycle",
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