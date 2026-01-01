import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldCheck,
  Sprout,
  Droplets,
  Leaf,
  Bug,
  Package,
  Tractor,
  Info,
  ChevronDown,
} from "lucide-react-native";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLanguage } from "../../context/LanguageContext";
import { PRO_ADVISOR_CATEGORIES, AdvisorCategory } from "../../data/proAdvisor";
import { PriceForecastStackParamList } from "../../navigation/PriceForecastStack";

/* ---------------- ANDROID ANIMATION ENABLE ---------------- */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ---------------- TYPES ---------------- */

type FollowRouteProp = RouteProp<
  PriceForecastStackParamList,
  "ProAdvisorFollowScreen"
>;

type FollowNavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "ProAdvisorFollowScreen"
>;

type Language = "si" | "en";

/* ---------------- ICON MAP ---------------- */

const ICON_MAP: Record<string, any> = {
  disease_pest_damage: AlertTriangle,
  disease_risk: ShieldCheck,
  soil_preparation: Sprout,
  seed_planting: Sprout,
  fertilizer_management: Leaf,
  water_management: Droplets,
  weed_management: Bug,
  harvesting: Package,
  machinery_usage: Tractor,
  agro_economic_impact: Info,
};

/* ---------------- SCREEN ---------------- */

const ProAdvisorFollowScreen: React.FC = () => {
  const route = useRoute<FollowRouteProp>();
  const navigation = useNavigation<FollowNavProp>();
  const { formData } = route.params;

  const { language: globalLang } = useLanguage();
  const language: Language = globalLang === "sinhala" ? "si" : "en";

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#065F46" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {language === "si"
            ? "බඩ ඉරිඟු වගා මාර්ගෝපදේශය"
            : "Corn Cultivation Guide"}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {PRO_ADVISOR_CATEGORIES.map((category: AdvisorCategory) => {
          const Icon = ICON_MAP[category.id] ?? AlertTriangle;
          const isOpen = expandedId === category.id;
          const localizedSections = category.sections[language];

          return (
            <View key={category.id} style={styles.categoryBlock}>
              {/* Category Header */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleExpand(category.id)}
                style={styles.card}
              >
                <View style={styles.iconWrap}>
                  <Icon size={22} color="#FFFFFF" />
                </View>

                <Text style={styles.cardTitle}>{category.title[language]}</Text>

                <ChevronDown
                  size={20}
                  color="#065F46"
                  style={{
                    transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>

              {/* Expanded Content */}
              {/* Expanded Content */}
              {isOpen &&
                localizedSections.map((section, idx) => (
                  <View key={idx} style={styles.subCard}>
                    <Text style={styles.subTitle}>{section.title}</Text>

                    {/* Simple points */}
                    {section.points?.map((point, i) => (
                      <Text key={i} style={styles.bullet}>
                        • {point}
                      </Text>
                    ))}

                    {/* Nested subsections (FULL Sinhala content) */}
                    {section.subsections?.map((sub, sIdx) => (
                      <View key={sIdx} style={{ marginTop: 10 }}>
                        <Text
                          style={{
                            fontSize: 13.5,
                            fontWeight: "700",
                            color: "#065F46",
                            marginBottom: 4,
                          }}
                        >
                          {sub.title}
                        </Text>

                        {sub.blocks.map((block, bIdx) => (
                          <View key={bIdx} style={{ marginBottom: 8 }}>
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: "#047857",
                                marginBottom: 2,
                              }}
                            >
                              {block.heading}
                            </Text>

                            {block.points.map((p, pIdx) => (
                              <Text key={pIdx} style={styles.bullet}>
                                • {p}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ProAdvisorFollowScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#065F46",
  },

  content: {
    padding: 16,
  },

  categoryBlock: {
    marginBottom: 16,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#065F46",
  },

  subCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  subTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    color: "#047857",
  },

  bullet: {
    fontSize: 13.5,
    color: "#374151",
    lineHeight: 22,
  },
});
