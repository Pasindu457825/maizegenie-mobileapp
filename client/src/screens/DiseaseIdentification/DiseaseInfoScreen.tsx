import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { DiseaseIdentifyStackParamList } from "../../navigation/DiseaseIdentifyStack";
import { StackNavigationProp } from "@react-navigation/stack";

// 🌐 LANGUAGE CONTEXT
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

// ------------------ ROUTE TYPE ------------------
type DiseaseInfoRouteProp = RouteProp<
  DiseaseIdentifyStackParamList,
  "DiseaseInfo"
>;

interface Props {
  route: DiseaseInfoRouteProp;
}

// ---------- DISEASE DATABASE ----------
const DISEASE_INFO: Record<
  string,
  {
    en: {
      name: string;
      overview: string;
      symptoms: string[];
      causes: string[];
      conditions: string[];
      management: string[];
      prevention: string[];
    };
    si: {
      name: string;
      overview: string;
      symptoms: string[];
      causes: string[];
      conditions: string[];
      management: string[];
      prevention: string[];
    };
  }
> = {
  common_rust: {
    en: {
      name: "Common Rust",
      overview:
        "Common rust is caused by Puccinia sorghi and spreads rapidly in humid, cool conditions.",
      symptoms: [
        "Reddish-brown raised pustules",
        "Yellow areas around lesions",
        "Black hardened spores in late stage",
      ],
      causes: ["Wind-borne spores", "High humidity", "Dense planting"],
      conditions: [
        "Cool temperatures (16–24°C)",
        "Moist leaf surfaces",
        "Shaded fields",
      ],
      management: [
        "Early fungicide application",
        "Use resistant maize varieties",
        "Remove severely infected leaves",
      ],
      prevention: [
        "Rotate crops",
        "Avoid overcrowding",
        "Destroy leftover infected debris",
      ],
    },

    si: {
      name: "සාමාන්‍ය රස්ට්",
      overview:
        "සාමාන්‍ය රස්ට් *Puccinia sorghi* මගින් ඇතිවන අතර තෙත් හා තද සීතල තත්ත්වයන්හි වේගයෙන් පැතිරෙයි.",
      symptoms: [
        "ඉහපත් වූ රතු-දුඹුරු පැන්ද",
        "ලක්ෂණ වටා කහ පැහැති දායකතා",
        "අවසන් අවධියේ කළු බීජක",
      ],
      causes: ["කாற்றින් පැතිරෙන බීජ", "උච්ච ආර්ද්‍රතාව", "තද spacing"],
      conditions: [
        "16–24°C අතර සීතල තත්ත්වයන්",
        "පත්‍ර මත තෙතමනය",
        "සෙවණැලි පරිසරය",
      ],
      management: [
        "කාලයට පෙර ශාකනාශක යෙදීම",
        "රෝග-ප්‍රතිරෝධී වර්ග පාවිච්චිය",
        "බරපෑම ඇති පත්‍ර ඉවත් කිරීම",
      ],
      prevention: [
        "බෝග හුවමාරුව",
        "අධික පැළ spacing නොකිරීම",
        "රෝගී අවශේෂ විනාශ කිරීම",
      ],
    },
  },

  blight: {
    en: {
      name: "Leaf Blight",
      overview:
        "Leaf blight spreads rapidly and reduces photosynthesis, weakening the plant.",
      symptoms: [
        "Large irregular brown lesions",
        "Leaf curling and drying",
        "Dark spreading borders",
      ],
      causes: ["Fungal residue", "Rain splash", "Poor airflow"],
      conditions: ["Warm weather", "Frequent rainfall", "Morning dew"],
      management: [
        "Improve spacing",
        "Apply fungicides early",
        "Destroy infected residue",
      ],
      prevention: ["Use clean seeds", "Rotate crops", "Avoid excess nitrogen"],
    },

    si: {
      name: "පත්‍ර බ්ලයිට්",
      overview:
        "පත්‍ර බ්ලයිට් වේගයෙන් පැතිරිණි. එය ශාකයේ පසිරු ක්‍රියාව අඩු කර ශාකය දුර්වල කරයි.",
      symptoms: [
        "විශාල අක්‍රමවත් දුඹුරු පැල්ලම්",
        "පත්‍ර වියළීම හා හැරීම",
        "කළු අසිරියක් පැතිරීම",
      ],
      causes: ["සෙවෙලි residue", "වැසි බිංදු විහිදීම", "අඩු වාතාශ්‍රය"],
      conditions: ["උණුසුම් කාලගුණය", "නිතර වැසි", "උදේ තෙත්මනය"],
      management: [
        "Spacing වැඩි කිරීම",
        "කාලයට පෙර ශාකනාශක යෙදීම",
        "අවශ්‍ය residue ඉවත් කිරීම",
      ],
      prevention: [
        "ශුද්ධ බීජ භාවිතා කිරීම",
        "බෝග හුවමාරුව",
        "අධික නයිට්‍රජන් හරාවීම",
      ],
    },
  },

  gray_leaf_spot: {
    en: {
      name: "Gray Leaf Spot",
      overview:
        "Gray leaf spot severely damages maize leaves and reduces yield significantly.",
      symptoms: [
        "Long rectangular gray lesions",
        "Parallel lesion patterns",
        "Lower leaf drying first",
      ],
      causes: ["Spores in debris", "High humidity", "Continuous cropping"],
      conditions: ["Humidity above 90%", "Warm nights", "Dense canopy"],
      management: [
        "Use resistant hybrids",
        "Apply fungicide before tasseling",
        "Destroy crop residue",
      ],
      prevention: [
        "Seasonal crop rotation",
        "Avoid overhead irrigation",
        "Reduce canopy density",
      ],
    },

    si: {
      name: "දුඹුරු පත්‍ර රෝගය",
      overview:
        "දුඹුරු පත්‍ර රෝගය මයිස් ශාකයට බරපතල හානියක් කිරීම සහ අස්වැන්න අඩු කිරීමේ ප්‍රධාන හේතුවකි.",
      symptoms: [
        "දිගු අළු පැහැති පැල්ලම්",
        "සමන්තර පැටවුම්",
        "පහළ පත්‍ර මුලින් වියළීම",
      ],
      causes: ["අවශේෂ වල බීජ", "උච්ච ආර්ද්‍රතාව", "නිරන්තර වගාව"],
      conditions: ["90% ට වැඩි ආර්ද්‍රතාව", "උණුසුම් රාත්‍රි", "තද canopy"],
      management: [
        "ප්‍රතිරෝධී වර්ග භාවිතා කිරීම",
        "Tasseling පෙර ශාකනාශක යෙදීම",
        "වගා අවශේෂ විනාශ කිරීම",
      ],
      prevention: [
        "සෑම වසරකම බෝග හුවමාරුව",
        "උඩින් ජලසෙචනය නොකිරීම",
        "canopy thinning",
      ],
    },
  },
};

// ------------------ COMPONENT ------------------
export default function DiseaseInfoScreen({ route }: Props) {
  const navigation = useNavigation<NavProp>();
  const { predictions } = route.params;

  // 🌐 GLOBAL LANGUAGE (sinhala / english)
  const { language: lang } = useLanguage();
  const language = lang === "sinhala" ? "si" : "en";

  // 🌐 UI TRANSLATIONS
  const content = {
    si: {
      back: "ආපසු",
      contactOfficer: "කෘෂිකාර්මික නිලධාරිය අමතන්න",
      header: "රෝග විස්තර",
      overview: "දළ විස්තරය",
      symptoms: "රෝග ලක්ෂණ",
      causes: "හේතූන්",
      conditions: "හිතකර තත්ත්වයන්",
      management: "කළ යුතු කළමනාකරණ ක්‍රියාමාර්ග",
      prevention: "රෝග වැළැක්වීම",
    },
    en: {
      back: "Back",
      contactOfficer: "Contact Agro Officer",
      header: "Disease Information",
      overview: "Overview",
      symptoms: "Symptoms",
      causes: "Causes",
      conditions: "Favorable Conditions",
      management: "Management Recommendations",
      prevention: "Prevention Tips",
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#1565C0" />
        <Text style={styles.backText}>{content[language].back}</Text>
      </TouchableOpacity>

      {/* CONTACT AGRO OFFICER BUTTON */}
      <TouchableOpacity
        style={styles.contactBtn}
        onPress={() =>
          navigation.navigate("Chat", {
            roomId: null,
            userId: "",
          })
        }
      >
        <Text style={styles.contactBtnText}>
          {content[language].contactOfficer}
        </Text>
      </TouchableOpacity>

      <Text style={styles.header}>{content[language].header}</Text>

      {predictions?.map((p, i) => {
        const key = p.class_name.toLowerCase().replace(/ /g, "_");
        const d = DISEASE_INFO[key]?.[language];

        if (!d) return null;

        return (
          <View key={i} style={styles.card}>
            <Text style={styles.diseaseTitle}>{d.name}</Text>

            {/* Overview */}
            <Text style={styles.sectionLabel}>
              {content[language].overview}
            </Text>
            <Text style={styles.sectionText}>{d.overview}</Text>

            {/* Symptoms */}
            <Text style={styles.sectionLabel}>
              {content[language].symptoms}
            </Text>
            {d.symptoms.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Causes */}
            <Text style={styles.sectionLabel}>{content[language].causes}</Text>
            {d.causes.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Favorable Conditions */}
            <Text style={styles.sectionLabel}>
              {content[language].conditions}
            </Text>
            {d.conditions.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}

            {/* Management */}
            <Text style={[styles.sectionLabel, { color: "#B91C1C" }]}>
              {content[language].management}
            </Text>
            {d.management.map((s, idx) => (
              <Text key={idx} style={styles.managementItem}>
                • {s}
              </Text>
            ))}

            {/* Prevention */}
            <Text style={styles.sectionLabel}>
              {content[language].prevention}
            </Text>
            {d.prevention.map((s, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {s}
              </Text>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8FBFE", flex: 1 },

  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: "#1565C0",
    fontWeight: "700",
  },

  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1565C0",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginBottom: 20,
  },

  diseaseTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D47A1",
    marginBottom: 14,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1565C0",
    marginTop: 12,
    marginBottom: 6,
  },

  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 6,
  },

  listItem: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 4,
    paddingVertical: 2,
  },

  managementItem: {
    fontSize: 14,
    color: "#B91C1C",
    fontWeight: "600",
    lineHeight: 20,
    marginLeft: 4,
    paddingVertical: 2,
  },

  contactBtn: {
    backgroundColor: "#0D8A43",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },

  contactBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
