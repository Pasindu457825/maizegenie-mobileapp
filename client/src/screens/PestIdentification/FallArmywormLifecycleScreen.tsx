import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Speech from "expo-speech";

// Add your narration data here (from previous step)
const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_egg.png"),
    description: "Eggs are laid in clusters, usually on the underside of leaves.",
    voiceTextEn: "Fall Armyworm eggs are laid in clusters, usually on the underside of maize leaves. These eggs are small, round, and pale in color. Farmers should look closely under leaves and remove egg masses when found to prevent further damage.",
    voiceTextSi: "පොලි ගොලුවාගේ බිත්තු පොකුරු ලෙස පත්‍ර වල පහල පැත්තට තැබෙනවා. බිත්තු කුඩා, රවුම් හා සුදු පැහැතිව පෙනෙනවා. ගොවියෝ පත්‍ර පහලින් බැලුවොත් බිත්තු පොකුරු හඳුනාගෙන ඉවත් කළ යුතුයි."
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_larva.png"),
    description: "Larvae (caterpillars) are the damaging stage, feeding on plant leaves.",
    voiceTextEn: "The larva, or caterpillar, is the most damaging stage. These larvae feed on maize leaves, creating holes and sometimes attacking the cob. Early detection and control at this stage can help save your crop.",
    voiceTextSi: "ලාරා, එනම් කූඹියා, වැඩිපුර හානි කරන අදියරයි. මේ කූඹියෝ පත්‍ර කමින් ගැටලු ඇති කරනවා, සමහරවිට ඇටයටවත් හානි කරනවා. මෙය ඉක්මනින් හඳුනාගෙන පාලනය කළහොත් වගාව බේරාගන්න පුළුවන්."
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_pupa.png"),
    description: "Pupa stage occurs in the soil. The caterpillar transforms into an adult.",
    voiceTextEn: "During the pupa stage, the caterpillar goes underground to change into an adult moth. No feeding or damage happens at this time. Good field hygiene and removing crop debris can reduce pupae numbers.",
    voiceTextSi: "පූපා අදියරේදී කූඹියා බිමට යාමෙන් අළුත් මදුවන්නෙක් වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදුව තබන එක පූපා සංඛ්‍යාව අඩු කරගන්න හොඳ ක්‍රමයක්."
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/fallarmyworm/fall_adult.png"),
    description: "The adult is a moth that lays eggs to start the cycle again.",
    voiceTextEn: "The adult Fall Armyworm is a brownish moth. It flies at night and lays eggs to start the life cycle again. Monitoring adult moths and using light traps can help control their population.",
    voiceTextSi: "වැඩිහිටි පොලි ගොලුවා මදුවන්නෙක්. රාත්‍රීයේ පියාසර කරලා නැවතත් බිත්තු තබනවා. වැඩිහිටි මදුවන්නෝ පාලනයට ආලෝක පෝෂක යන්ත්‍ර යොදාගන්න හෝ පරීක්ෂා කිරීම හොඳයි."
  }
];

export default function FallArmywormLifecycleScreen() {
  // To keep track of which (if any) voice is currently playing
  const [speakingStageKey, setSpeakingStageKey] = useState<string | null>(null);
  const [speakingLang, setSpeakingLang] = useState<"si" | "en" | null>(null);

  // Helper: Play the narration
  const playNarration = async (stageKey: string, lang: "si" | "en", text: string) => {
    // Stop any ongoing speech first
    Speech.stop();
    setSpeakingStageKey(stageKey);
    setSpeakingLang(lang);

    // Check if Sinhala TTS is available (for Sinhala only)
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

    // Speak
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

  // Helper: Stop narration
  const stopNarration = () => {
    Speech.stop();
    setSpeakingStageKey(null);
    setSpeakingLang(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fall Armyworm Lifecycle</Text>
      {stages.map((stage) => (
        <View key={stage.key} style={styles.stageBox}>
          <Image source={stage.image} style={styles.stageImage} />
          <Text style={styles.stageTitle}>{stage.label}</Text>
          <Text style={styles.stageDesc}>{stage.description}</Text>
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
            >
              <Text style={styles.voiceButtonText}>
                {speakingStageKey === stage.key && speakingLang === "si" ? "⏹ Stop Sinhala" : "🔊 Sinhala Voice"}
              </Text>
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
            >
              <Text style={styles.voiceButtonText}>
                {speakingStageKey === stage.key && speakingLang === "en" ? "⏹ Stop English" : "🔊 English Voice"}
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
  stageBox: { marginBottom: 36, alignItems: "center", backgroundColor: "#F6F8FC", borderRadius: 14, padding: 16, elevation: 2 },
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
