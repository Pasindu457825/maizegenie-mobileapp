import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { Leaf, User, Briefcase } from "lucide-react-native";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionLoadingScreen"
>;

const YieldPredictionLoadingScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [language, setLanguage] = useState<"si" | "en">("si");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "ඔබේ භූමිකාව තෝරන්න",
      farmer: "ගොවියා",
      officer: "කෘෂිකර්ම නිලධාරී",
      farmerDesc: "සරල අස්වැන්න පුරෝකථනය",
      officerDesc: "සවිස්තරාත්මක විශ්ලේෂණය සහ පොහොර නිර්දේශ",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Select Your Role",
      farmer: "Farmer",
      officer: "Agricultural Officer",
      farmerDesc: "Simple yield prediction",
      officerDesc: "Detailed analysis & fertilizer recommendations",
    },
  };

  const handleRoleSelect = (role: "farmer" | "officer") => {
    if (role === "farmer") {
      navigation.navigate("YieldPredictionFormScreen", { role, language });
    } else {
      navigation.navigate("YieldPredictionOfficerFormScreen", { language });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setLanguage((prev) => (prev === "si" ? "en" : "si"))}
        >
          <Text style={styles.langText}>
            {language === "si" ? "EN" : "සිං"}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Leaf color="#10B981" size={64} />
          </View>
          <View style={[styles.pulseRing, styles.pulseRing1]} />
          <View style={[styles.pulseRing, styles.pulseRing2]} />
        </View>

        {/* Role Selection Cards */}
        <View style={styles.roleContainer}>
          {/* Farmer Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect("farmer")}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconCircle}>
              <User color="#10B981" size={32} />
            </View>
            <Text style={styles.roleTitle}>{content[language].farmer}</Text>
            <Text style={styles.roleDesc}>{content[language].farmerDesc}</Text>
            <View style={styles.roleArrow}>
              <Text style={styles.roleArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Officer Card */}
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect("officer")}
            activeOpacity={0.7}
          >
            <View style={styles.roleIconCircle}>
              <Briefcase color="#10B981" size={32} />
            </View>
            <Text style={styles.roleTitle}>{content[language].officer}</Text>
            <Text style={styles.roleDesc}>{content[language].officerDesc}</Text>
            <View style={styles.roleArrow}>
              <Text style={styles.roleArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  langButton: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  langText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#10B981",
    opacity: 0.3,
  },
  pulseRing1: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  pulseRing2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.2,
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  roleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
  },
  roleDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  roleArrow: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  roleArrowText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
});

export default YieldPredictionLoadingScreen;
