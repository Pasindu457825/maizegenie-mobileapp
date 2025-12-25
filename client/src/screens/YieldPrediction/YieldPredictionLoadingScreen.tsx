import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import { Leaf, Users, Package, ArrowLeft, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import DataConfirmationModal from "../../components/DataConfirmationModal";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionLoadingScreen"
>;

const YieldPredictionLoadingScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: lang } = useLanguage();
  const language: "si" | "en" = lang === "sinhala" ? "si" : "en";
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const { user } = useApp();

  // Role-based authentication using Supabase user data
  const isFarmer = user?.role === "farmer";
  const isOfficer = user?.role === "officer";

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
      title: "අස්වැන්න පුරෝකථනය සහ පොහොර උපදේශන",
      subtitle: "",
      servicesTitle: "අපගේ සේවාවන්",
      startTitle: "පුරෝකථනය ආරම්භ කරන්න",
      startDesc: "ඔබේ අස්වැන්න පහසුවෙන් පුරෝකථනය කරන්න",
      fertilizerTitle: "පොහොර උපදේශ",
      fertilizerDesc: "පුද්ගලාරෝපිත පොහොර නිර්දේශ ලබා ගන්න",
      fertilizerRecommendation: "පොහොර නිර්දේශ",
      fertilizerRecommendationDesc: "ගොවීන්ට පොහොර උපදේශ ලබා දෙන්න",
      farmerRequests: "ගොවි ඉල්ලීම්",
      farmerRequestsDesc: "ඉදිරි දිනවල",
      comingSoon: "ඉදිරි දිනවල",
    },
    en: {
      title: "Yield Prediction and Fertilizer Advisory",
      subtitle: "",
      servicesTitle: "Our Services",
      startTitle: "Start Prediction",
      startDesc: "Get your yield prediction quickly",
      fertilizerTitle: "Fertilizer Advices",
      fertilizerDesc: "Get personalized fertilizer recommendations",
      fertilizerRecommendation: "Fertilizer Recommendation",
      fertilizerRecommendationDesc: "Provide fertilizer advice to farmers",
      farmerRequests: "Farmer Requests",
      farmerRequestsDesc: "Coming soon",
      comingSoon: "Coming soon",
    },
  };

  const showOfficerDataConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmProceed = () => {
    setShowConfirmationModal(false);
    navigation.navigate("YieldPredictionOfficerFormScreen", { language });
  };

  const handleRoleSelect = (role: "farmer" | "officer") => {
    // Verify user role matches the selected action
    if (!user) {
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si" 
          ? "කරුණාකර පළමුව පුරනය වන්න"
          : "Please log in first"
      );
      return;
    }

    if (role === "farmer" && user.role !== "farmer") {
      Alert.alert(
        language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
        language === "si" 
          ? "මෙම විශේෂාංගය ගොවීන් සඳහා පමණි"
          : "This feature is only available for farmers"
      );
      return;
    }

    if (role === "officer" && user.role !== "officer") {
      Alert.alert(
        language === "si" ? "ප්‍රවේශය වසා ඇත" : "Access Denied",
        language === "si" 
          ? "මෙම විශේෂාංගය නිලධාරීන් සඳහා පමණි"
          : "This feature is only available for officers"
      );
      return;
    }

    if (role === "farmer") {
      navigation.navigate("YieldPredictionFormScreen", { role, language });
    } else {
      // Show data confirmation checklist for officers
      showOfficerDataConfirmation();
    }
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert(
      language === "si" ? "ඉදිරි දිනවල" : "Coming soon",
      language === "si"
        ? `${feature} මොඩියුලය ඉක්මනින් ලබා දෙනු ඇත.`
        : `${feature} will be available soon.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{content[language].title}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Decorative Corn Icon */}
          <View style={styles.iconSection}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconCircle}
              >
                <Text style={styles.cornIcon}>🌽</Text>
              </LinearGradient>
              <View style={[styles.iconRing, styles.iconRing1]} />
              <View style={[styles.iconRing, styles.iconRing2]} />
              <View style={[styles.iconRing, styles.iconRing3]} />
            </View>
            <Text style={styles.servicesTitle}>{content[language].servicesTitle}</Text>
          </View>

          {/* Action Cards */}
          <View style={styles.roleContainer}>
          {isFarmer ? (
            <>
              {/* Card 1: Start Prediction */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelect("farmer")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#ECFDF5", "#D1FAE5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleIconCircle}>
                    <Leaf color="#10b981" size={32} />
                  </View>
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>
                      {content[language].startTitle}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {content[language].startDesc}
                    </Text>
                  </View>
                  <View style={styles.roleArrow}>
                    <Text style={styles.roleArrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 2: Fertilizer Advices */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => navigation.navigate("FertilizerAdvisorLanding")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#EFF6FF", "#DBEAFE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCardGradient}
                >
                  <View style={[styles.roleIconCircle, { backgroundColor: "#DBEAFE" }]}>
                    <Package color="#3b82f6" size={32} />
                  </View>
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>
                      {content[language].fertilizerTitle}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {content[language].fertilizerDesc}
                    </Text>
                  </View>
                  <View style={styles.roleArrow}>
                    <Text style={styles.roleArrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Card 1: Start Prediction */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelect("officer")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#ECFDF5", "#D1FAE5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleIconCircle}>
                    <Leaf color="#10b981" size={32} />
                  </View>
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>
                      {content[language].startTitle}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {content[language].startDesc}
                    </Text>
                  </View>
                  <View style={styles.roleArrow}>
                    <Text style={styles.roleArrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Card 2: Fertilizer Recommendation */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => navigation.navigate("FertilizerAdvisorOfficerLanding")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#EFF6FF", "#DBEAFE"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.roleCardGradient}
                >
                  <View style={[styles.roleIconCircle, { backgroundColor: "#DBEAFE" }]}>
                    <Package color="#3b82f6" size={32} />
                  </View>
                  <View style={styles.roleContent}>
                    <Text style={styles.roleTitle}>
                      {content[language].fertilizerRecommendation}
                    </Text>
                    <Text style={styles.roleDesc}>
                      {content[language].fertilizerRecommendationDesc}
                    </Text>
                  </View>
                  <View style={styles.roleArrow}>
                    <Text style={styles.roleArrowText}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
        </Animated.View>
      </ScrollView>

      {/* Data Confirmation Modal */}
      <DataConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmProceed}
        language={language}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
    lineHeight: 22,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
    justifyContent: "center",
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: -10,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 20,
    letterSpacing: 0.3,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 3,
  },
  cornIcon: {
    fontSize: 56,
  },
  iconRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: "#10b981",
  },
  iconRing1: {
    width: 130,
    height: 130,
    opacity: 0.25,
    borderColor: "#34d399",
  },
  iconRing2: {
    width: 155,
    height: 155,
    opacity: 0.15,
    borderColor: "#6ee7b7",
  },
  iconRing3: {
    width: 180,
    height: 180,
    opacity: 0.08,
    borderColor: "#a7f3d0",
  },
  roleContainer: {
    gap: 20,
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  roleCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 4,
  },
  roleCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 26,
    minHeight: 130,
  },
  roleIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  roleContent: {
    flex: 1,
    paddingRight: 8,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  roleDesc: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  roleArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  roleArrowText: {
    fontSize: 20,
    color: "#1F2937",
    fontWeight: "700",
  },
});

export default YieldPredictionLoadingScreen;
