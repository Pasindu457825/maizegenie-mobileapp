import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Speech from "expo-speech";

const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_egg.jpg"),
    description: "Eggs are laid in groups on the underside of leaves, appearing like fish scales.",
    voiceTextEn:
      "Asian Corn Borer eggs are laid in clusters on the underside of maize leaves. The eggs look like overlapping fish scales. Regular inspection of leaves allows farmers to remove egg masses early and prevent larval outbreaks.",
    voiceTextSi:
      "ඇසියන් කොෝන් බෝරර්ගේ බිත්තු පොකුරු ලෙස පත්‍රවල පහල පැත්තට තැබෙනවා. මේ බිත්තු මත්ස්‍ය scales වැනි තද පැල්ලම් ලෙස පෙනෙනවා. පත්‍ර පිරික්සීම ඉක්මනින් කළහොත් බිත්තු ඉවත් කරලා කූඹි හානි අවම කළ හැක."
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_larva.jpg"),
    description:
      "Larvae (caterpillars) bore into stems and cause major damage to the corn plant.",
    voiceTextEn:
      "The larva stage is the most destructive. The caterpillars bore into stems, weaken the plant, and interfere with nutrient flow. This can lead to broken stems and reduced yields. Early detection and control are very important.",
    voiceTextSi:
      "ලාරා අදියරයි වගාවට වැඩිපුරම හානි කරන කාලය. කූඹියෝ බෝංචිය තුළට පතා පවුලේ පෝෂණ ගමන් මාර්ග කඩා දමනවා. මේකෙන් බෝංචි කඩා වැටී යාවූ හානි සහ අස්වැන්න අඩුවීම සිදු වෙනවා. ඉක්මනින් හඳුනාගෙන පාලනය කිරීම අත්‍යවශ්‍යයි."
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_pupa.jpg"),
    description: "Pupation usually takes place inside the stem or in crop debris.",
    voiceTextEn:
      "During the pupa stage, the larva hides inside the stem or in leftover crop debris and begins transforming into an adult moth. No feeding occurs at this time. Good field sanitation helps reduce pest numbers.",
    voiceTextSi:
      "පූපා අදියරේදී කූඹියා බෝංචිය තුළ හෝ වගා අවශේෂ මත සැඟවී අළුත් මදුවන්නෙකු වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදු තබා ගැනීමෙන් පූපා සංඛ්‍යාව අඩු කළ හැක."
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/asiancornborer/asian_adult.jpg"),
    description:
      "Adults are small moths that fly at night and lay eggs to continue the cycle.",
    voiceTextEn:
      "The adult Asian Corn Borer is a small, pale moth that flies at night. It lays clusters of eggs on leaves, restarting the life cycle. Light traps and regular monitoring can help control adult moth populations.",
    voiceTextSi:
      "වැඩිහිටි ඇසියන් කොෝන් බෝරර් මදුවන්නෙක්. රාත්‍රීයේ පියාසර කරලා පත්‍රවලට බිත්තු පොකුරු තැබීමෙන් ජීවිත චක්‍රය නැවත ආරම්භ කරනවා. ආලෝක පෝෂක යන්ත්‍ර හා පරීක්ෂා කිරීම මදුවන්නෝ පාලනයට උපකාරී."
  }
];

export default function AsianCornBorerLifecycleScreen() {
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Asian Corn Borer Lifecycle</Text>

      {stages.map((stage) => (
        <View key={stage.key} style={styles.stageBox}>
          <Image source={stage.image} style={styles.stageImage} />
          <Text style={styles.stageTitle}>{stage.label}</Text>
          <Text style={styles.stageDesc}>{stage.description}</Text>

          <View style={styles.buttonRow}>
            {/* Sinhala Button */}
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
            >
              <Text style={styles.voiceButtonText}>
                {speakingStageKey === stage.key && speakingLang === "si"
                  ? "⏹ Stop Sinhala"
                  : "🔊 Sinhala Voice"}
              </Text>
            </TouchableOpacity>

            {/* English Button */}
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
            >
              <Text style={styles.voiceButtonText}>
                {speakingStageKey === stage.key && speakingLang === "en"
                  ? "⏹ Stop English"
                  : "🔊 English Voice"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginVertical: 16 },
  stageBox: {
    marginBottom: 36,
    alignItems: "center",
    backgroundColor: "#F6F8FC",
    borderRadius: 14,
    padding: 16,
    elevation: 2
  },
  stageImage: { width: 220, height: 160, borderRadius: 12, marginBottom: 10, resizeMode: "cover" },
  stageTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  stageDesc: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 12 },
  buttonRow: { flexDirection: "row", gap: 10 },
  voiceButton: {
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 14,
    marginHorizontal: 2,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "#a7c7e7"
  },
  voiceButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#1e40af"
  },
  voiceButtonText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "bold"
  }
});
