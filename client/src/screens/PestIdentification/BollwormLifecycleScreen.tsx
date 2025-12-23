import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Speech from "expo-speech";

const stages = [
  {
    key: "egg",
    label: "Egg",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_egg.jpg"),
    description: "Bollworm eggs are tiny, laid singly on leaves, buds, or fruits.",
    voiceTextEn: "Bollworm eggs are very small and usually laid singly on leaves, buds, or fruits. They are round and white to yellowish in color. Farmers should closely inspect young leaves and buds to find and remove eggs early.",
    voiceTextSi: "බොල්වෝම් බිත්තු ඉතා කුඩායි. ඒවා තනි තනිව පත්‍ර, මල් කෝෂ හෝ පලතුරු මත තැබෙනවා. බිත්තු සුදු හෝ පීච් පැහැයෙන් පෙනෙනවා. ගොවියෝ තරුණ පත්‍ර හා මල් කොට්ටෙන් බිත්තු හඳුනාගෙන ඉවත් කළ යුතුයි."
  },
  {
    key: "larva",
    label: "Larva",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_larva.jpg"),
    description: "The larva (caterpillar) feeds on leaves and bores into buds and fruits causing major crop damage.",
    voiceTextEn: "The larva is a caterpillar and this stage causes the most crop damage. Larvae feed on leaves, bore into buds, and also attack fruits and pods. Early detection and timely spraying can protect the harvest.",
    voiceTextSi: "ලාරාව කියන්නේ කූඹියෙක්. මේ අදියරේදී වගා බෙහෙවින් හානි වෙනවා. කූඹියෝ පත්‍ර කමින්, මල් කොට්ට බිඳමින්, පලතුරු හා අංශ බලපායි. ඉක්මනින් හඳුනාගෙන අවශ්‍ය පාලන ක්‍රියාවලි සිදු කළ යුතුයි."
  },
  {
    key: "pupa",
    label: "Pupa",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_pupa.png"),
    description: "Pupation occurs in the soil or plant debris, where the larva transforms into an adult.",
    voiceTextEn: "During the pupa stage, the caterpillar goes into the soil or plant debris and changes into an adult moth. There is no feeding or crop damage at this time. Keeping the field clean reduces pupae numbers.",
    voiceTextSi: "පූපා අදියරේදී කූඹියා බිමට හෝ වගා අපද්‍රව්‍ය තුළට යාමෙන් වැඩිහිටි මදුවන්නෙක් වෙන්න වෙනස් වෙනවා. මේ අවධියේ කෑම හෝ හානි සිදුවෙන්නේ නෑ. වගා බිම පිරිසිදුව තබන එක පූපා සංඛ්‍යාව අඩු කරයි."
  },
  {
    key: "adult",
    label: "Adult (Moth)",
    image: require("../../../assets/pest_lifecycle/bollworm/boll_adult.png"),
    description: "The adult moth is pale brown. It lays eggs and starts the lifecycle again.",
    voiceTextEn: "The adult bollworm is a pale brown moth. It is active at night, flies to new plants, and lays eggs to restart the life cycle. Light traps and regular field monitoring help manage the pest.",
    voiceTextSi: "වැඩිහිටි බොල්වෝම් මදුවන්නෙක්. පැහැදිලි දුඹුරු පැහැයකින් පෙනෙනවා. රාත්‍රියේ සක්‍රීය වෙයි, වගා වත්තේ පියාසර කරලා නැවතත් බිත්තු තබනවා. ආලෝක පෝෂක යන්ත්‍ර හා පරීක්ෂා කිරීම ප්‍රතිලාභදායකයි."
  }
];

export default function BollwormLifecycleScreen() {
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bollworm Lifecycle</Text>
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
