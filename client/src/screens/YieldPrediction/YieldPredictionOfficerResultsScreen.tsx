import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { YieldPredictionStackParamList } from "../../navigation/YieldPredictionStack";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield,
  Leaf,
  Package,
  Info,
  MapPin,
  Calendar,
  Sprout,
  Download,
  FileText,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

type NavProp = StackNavigationProp<
  YieldPredictionStackParamList,
  "YieldPredictionOfficerResultsScreen"
>;

const YieldPredictionOfficerResultsScreenEnhanced = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { data } = route.params as {
    data: any;
  };

  const { language: lang } = useLanguage();
  const language: "si" | "en" = lang === "sinhala" ? "si" : "en";
  
  const [downloadingReport, setDownloadingReport] = useState(false);
  
  // Get API URL based on platform
  const getApiUrl = () => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      return process.env.EXPO_PUBLIC_API_BASE || 'http://192.168.8.117:8000';
    }
    return 'http://localhost:8000';
  };
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const content = {
    si: {
      title: "අස්වැන්න පුරෝකථනය",
      subtitle: "නිලධාරී විශ්ලේෂණය",
      predictedYield: "පුරෝකථනය කළ අස්වැන්න",
      yieldComparison: "අස්වැන්න සැසඳීම",
      npkLevels: "NPK මට්ටම්",
      environmentalFactors: "පාරිසරික සාධක",
      soilHealth: "පස් සෞඛ්‍යය",
      impactFactors: "බලපෑම් සාධක",
      recommendations: "නිර්දේශ",
      predictionMethod: "පුරෝකථන ක්‍රමය",
      mlModel: "ML මාදිලිය",
      ruleBased: "නීති පදනම්",
      confidence: "විශ්වාසය",
      back: "ආපසු",
    },
    en: {
      title: "Yield Prediction",
      subtitle: "Officer Analysis",
      predictedYield: "Predicted Yield",
      yieldComparison: "Yield Comparison",
      npkLevels: "NPK Levels",
      environmentalFactors: "Environmental Factors",
      soilHealth: "Soil Health",
      impactFactors: "Impact Factors",
      recommendations: "Recommendations",
      predictionMethod: "Prediction Method",
      mlModel: "ML Model",
      ruleBased: "Rule-Based",
      confidence: "Confidence",
      back: "Back",
    },
  };

  // Extract data
  const prediction = data?.prediction || {};
  const predictedYield = prediction.predicted_yield || 0;
  const predictedYieldTonnes = (predictedYield / 1000).toFixed(3); // Convert kg/ha to t/ha
  const yieldCategory = prediction.yield_category || "Medium";
  const confidenceScore = prediction.confidence_score || 0;
  const predictionMethod = prediction.prediction_method || "rule_based";
  const modelVersion = predictionMethod === "ml_model" ? "XGBoost v2.0" : "Rule-Based";
  
  // State for comparison table and impact factor filter
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [impactFilter, setImpactFilter] = useState<'all' | 'positive' | 'negative'>('all');
  
  // Download report function for React Native
  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    
    try {
      // Get the original request data from route params
      const requestData = (route.params as any)?.requestData;
      
      if (!requestData) {
        Alert.alert(
          language === "si" ? "දෝෂයකි" : "Error",
          language === "si" 
            ? "වාර්තාව බාගත කිරීමට අවශ්‍ය දත්ත නොමැත"
            : "Required data not available for report generation"
        );
        setDownloadingReport(false);
        return;
      }
      
      // Generate filename
      const district = requestData?.soil_profile?.district || 'Unknown';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `MaizeGenie_YieldReport_${district}_${timestamp}.pdf`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      const apiUrl = getApiUrl();
      
      // Use XMLHttpRequest for better React Native compatibility
      const downloadPDF = () => {
        return new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${apiUrl}/api/v1/yield-prediction/officer/report`);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'arraybuffer';
          
          xhr.onload = async () => {
            if (xhr.status === 200) {
              try {
                // Convert array buffer to base64
                const arrayBuffer = xhr.response;
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                const chunkSize = 0x8000; // Process in chunks to avoid stack overflow
                for (let i = 0; i < bytes.length; i += chunkSize) {
                  const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
                  binary += String.fromCharCode.apply(null, Array.from(chunk));
                }
                
                // Use base64 encoding that works in React Native
                const base64 = binary.split('').map(char => {
                  return char.charCodeAt(0).toString(16).padStart(2, '0');
                }).join('');
                
                // Actually, let's use a simpler approach - write the buffer directly
                // Convert to base64 using a library-free method
                const base64String = arrayBufferToBase64(arrayBuffer);
                
                await FileSystem.writeAsStringAsync(fileUri, base64String, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                
                resolve();
              } catch (error) {
                reject(error);
              }
            } else {
              reject(new Error(`Report generation failed: ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => reject(new Error('Network request failed'));
          xhr.send(JSON.stringify(requestData));
        });
      };
      
      // Helper function to convert ArrayBuffer to base64
      const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        // Use Buffer if available, otherwise manual conversion
        if (typeof Buffer !== 'undefined') {
          return Buffer.from(binary, 'binary').toString('base64');
        }
        // Fallback for environments without Buffer
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let result = '';
        let i = 0;
        while (i < binary.length) {
          const a = binary.charCodeAt(i++);
          const b = i < binary.length ? binary.charCodeAt(i++) : 0;
          const c = i < binary.length ? binary.charCodeAt(i++) : 0;
          
          const bitmap = (a << 16) | (b << 8) | c;
          result += chars[(bitmap >> 18) & 63];
          result += chars[(bitmap >> 12) & 63];
          result += i - 2 < binary.length ? chars[(bitmap >> 6) & 63] : '=';
          result += i - 1 < binary.length ? chars[bitmap & 63] : '=';
        }
        return result;
      };
      
      await downloadPDF();
      
      // Step 4: Share the file
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: language === "si" ? "වාර්තාව බෙදාගන්න" : "Share Report",
          UTI: 'com.adobe.pdf',
        });
        
        Alert.alert(
          language === "si" ? "සාර්ථකයි" : "Success",
          language === "si" 
            ? "වාර්තාව සාර්ථකව ජනනය කරන ලදී"
            : "Report generated successfully"
        );
      } else {
        Alert.alert(
          language === "si" ? "සාර්ථකයි" : "Success",
          language === "si" 
            ? `වාර්තාව සුරකින ලදී: ${fileUri}`
            : `Report saved to: ${fileUri}`
        );
      }
      
    } catch (error) {
      console.error('Report download error:', error);
      Alert.alert(
        language === "si" ? "දෝෂයකි" : "Error",
        language === "si" 
          ? "වාර්තාව බාගත කිරීමේදී දෝෂයක් ඇතිවිය"
          : "Failed to download report. Please try again."
      );
    } finally {
      setDownloadingReport(false);
    }
  };
  
  const analysisData = data?.analysis_data || {};
  const impactFactors = data?.impact_factors || [];
  const recommendations = data?.recommendations || [];
  const officerInsights = data?.officer_insights || {};
  const inputSummary = data?.input_summary || {};

  // Chart configurations - Multi-color
  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black text
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 11,
      fill: "#000000", // Black labels
    },
  };

  // Yield Comparison Chart Data - Only Predicted vs Optimal District
  const yieldComparison = analysisData.yield_comparison || {};
  const yieldComparisonData = {
    labels: ["Predicted", "Optimal\nDistrict"],
    datasets: [
      {
        data: [
          (yieldComparison.predicted || predictedYield || 0) / 1000, // Convert to t/ha
          (yieldComparison.district_optimal || yieldComparison.district_average || 0) / 1000, // Convert to t/ha
        ],
      },
    ],
  };

  // NPK Levels Chart Data - Side by side bars
  const npkLevels = analysisData.npk_levels || {};
  const npkData = {
    labels: ["N (ppm)", "P (ppm)", "K (ppm)"],
    datasets: [
      {
        data: [
          npkLevels.nitrogen || 0,
          npkLevels.phosphorus || 0,
          npkLevels.potassium || 0,
        ],
      },
    ],
  };
  
  const npkOptimalData = {
    labels: ["N (ppm)", "P (ppm)", "K (ppm)"],
    datasets: [
      {
        data: [
          npkLevels.optimal_nitrogen || 0,
          npkLevels.optimal_phosphorus || 0,
          npkLevels.optimal_potassium || 0,
        ],
      },
    ],
  };

  // Environmental Factors Progress Data with ideal ranges
  const envFactors = analysisData.environmental_factors || {};
  const idealRanges = envFactors.ideal_ranges || {};
  
  // Calculate percentage based on ideal range
  const calculateEnvPercentage = (value: number, ideal: any) => {
    if (!ideal || !ideal.min || !ideal.max) return 0.5;
    const mid = (ideal.min + ideal.max) / 2;
    const range = ideal.max - ideal.min;
    const deviation = Math.abs(value - mid);
    const percentage = Math.max(0, Math.min(1, 1 - (deviation / range)));
    return percentage;
  };
  
  const envProgressData = {
    labels: ["Temp", "Humidity", "Rainfall", "Sunshine"],
    data: [
      calculateEnvPercentage(envFactors.temperature || 28, idealRanges.temperature),
      calculateEnvPercentage(envFactors.humidity || 75, idealRanges.humidity),
      calculateEnvPercentage(envFactors.rainfall_30d || 150, idealRanges.rainfall_30d),
      calculateEnvPercentage(envFactors.sunshine || 8, idealRanges.sunshine),
    ],
  };

  // Soil Health Data
  const soilHealth = analysisData.soil_health || {};
  const soilHealthData = {
    labels: ["pH", "Fertility", "N", "P", "K"],
    data: [
      (soilHealth.ph || 0) / 14,
      soilHealth.fertility_index || 0,
      soilHealth.n_status === "High" ? 1 : soilHealth.n_status === "Medium" ? 0.6 : 0.3,
      soilHealth.p_status === "High" ? 1 : soilHealth.p_status === "Medium" ? 0.6 : 0.3,
      soilHealth.k_status === "High" ? 1 : soilHealth.k_status === "Medium" ? 0.6 : 0.3,
    ],
  };

  const getCategoryColor = (category: string) => {
    const c = category?.toLowerCase() || "";
    if (c === "high") return "#10B981";
    if (c === "medium") return "#F59E0B";
    return "#EF4444";
  };

  const getMethodIcon = () => {
    return predictionMethod === "ml_model" ? (
      <Zap color="#10B981" size={20} />
    ) : (
      <Shield color="#3B82F6" size={20} />
    );
  };

  const getMethodColor = () => {
    return predictionMethod === "ml_model" ? "#10B981" : "#3B82F6";
  };

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#10b981", "#059669"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#ffffff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{content[language].title}</Text>
            <Text style={styles.headerSubtitle}>{content[language].subtitle}</Text>
          </View>
          <TouchableOpacity 
            onPress={handleDownloadReport} 
            style={styles.downloadButton}
            disabled={downloadingReport}
          >
            {downloadingReport ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Download color="#ffffff" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Predicted Yield Card */}
          <View style={styles.yieldCard}>
            
            <Text style={styles.yieldLabel}>
              {content[language].predictedYield}
            </Text>
            <Text style={styles.yieldValue}>{predictedYieldTonnes}</Text>
            <Text style={styles.yieldUnit}>t/ha</Text>
            <Text style={styles.yieldSecondaryUnit}>({predictedYield.toFixed(0)} kg/ha)</Text>
            
            <View style={styles.categoryBadge}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: getCategoryColor(yieldCategory) },
                ]}
              />
              <Text style={styles.categoryText}>{yieldCategory}</Text>
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>
                {content[language].confidence}:
              </Text>
              <Text style={styles.confidenceValue}>
                {(confidenceScore * 100).toFixed(0)}%
              </Text>
              <TouchableOpacity 
                style={styles.infoIcon}
                onPress={() => {
                  Alert.alert(
                    language === "si" ? "විශ්වාසය ගණනය කිරීම" : "Confidence Calculation",
                    language === "si" 
                      ? `විශ්වාසය ප්‍රතිශතය මෙම කරුණු මත පදනම් වේ:\n\n• ආදාන දත්ත සම්පූර්ණත්වය (${(confidenceScore * 40).toFixed(0)}%)\n• මාදිලියේ ස්ථායීතාව (${(confidenceScore * 35).toFixed(0)}%)\n• ඓතිහාසික නිරවද්‍යතාව (${(confidenceScore * 25).toFixed(0)}%)\n\nඉහළ විශ්වාසය = වඩා විශ්වසනීය පුරෝකථනය`
                      : `Confidence percentage is based on:\n\n• Input data completeness (${(confidenceScore * 40).toFixed(0)}%)\n• Model stability (${(confidenceScore * 35).toFixed(0)}%)\n• Historical accuracy (${(confidenceScore * 25).toFixed(0)}%)\n\nHigher confidence = More reliable prediction`,
                    [{ text: "OK" }]
                  );
                }}
              >
                <Info color="#6B7280" size={16} />
              </TouchableOpacity>
            </View>
            
            {/* Model Version Badge - moved below confidence */}
            <View style={styles.methodBadgeContainer}>
              <View style={styles.methodBadge}>
                <Text style={styles.methodBadgeText}>
                  {predictionMethod === "ml_model" 
                    ? (language === "si" ? "ML මාදිලිය" : "ML Model")
                    : (language === "si" ? "නීති පදනම්" : "Rule-Based")}
                </Text>
              </View>
              <Text style={styles.modelVersionUnderBadge}>{modelVersion}</Text>
            </View>
            
            {/* Input Summary Chips */}
            <View style={styles.inputChipsContainer}>
              <View style={styles.inputChip}>
                <MapPin color="#10B981" size={14} />
                <Text style={styles.inputChipText}>{inputSummary.district || "N/A"}</Text>
              </View>
              <View style={styles.inputChip}>
                <Sprout color="#10B981" size={14} />
                <Text style={styles.inputChipText}>{inputSummary.variety || "N/A"}</Text>
              </View>
              <View style={styles.inputChip}>
                <Activity color="#10B981" size={14} />
                <Text style={styles.inputChipText}>{inputSummary.season || "N/A"}</Text>
              </View>
              <View style={styles.inputChip}>
                <Calendar color="#10B981" size={14} />
                <Text style={styles.inputChipText}>
                  {inputSummary.planting_date ? inputSummary.planting_date.split("T")[0] : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {/* Yield Comparison Chart - Predicted vs Optimal District */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <BarChart3 color="#10B981" size={22} />
              </View>
              <Text style={styles.sectionTitle}>
                {content[language].yieldComparison}
              </Text>
            </View>
            <View style={styles.chartCard}>
              <BarChart
                data={yieldComparisonData}
                width={screenWidth - 64}
                height={240}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  barPercentage: 0.6,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                }}
                style={styles.chart}
                showValuesOnTopOfBars
                fromZero
              />
              <View style={styles.comparisonNote}>
                <Text style={styles.comparisonNoteText}>
                  {language === "si" 
                    ? "ඔබේ පුරෝකථනය සහ දිස්ත්‍රික්කයේ ප්‍රශස්ත අස්වැන්න"
                    : "Your Prediction vs Optimal District Yield"}
                </Text>
                <TouchableOpacity 
                  style={styles.seeMoreButton}
                  onPress={() => setShowComparisonTable(!showComparisonTable)}
                >
                  <Text style={styles.seeMoreText}>
                    {showComparisonTable 
                      ? (language === "si" ? "අඩු කරන්න" : "See Less")
                      : (language === "si" ? "තව බලන්න" : "See More")}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Comparison Table */}
              {showComparisonTable && (
                <View style={styles.comparisonTable}>
                  <Text style={styles.tableTitle}>
                    {language === "si" 
                      ? "ආදාන කරුණු සහ ප්‍රශස්ත දිස්ත්‍රික් කරුණු සංසන්දනය"
                      : "Input Factors vs Optimal District Factors"}
                  </Text>
                  
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      {language === "si" ? "කාරකය" : "Factor"}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      {language === "si" ? "ඔබේ ආදානය" : "Your Input"}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableHeader]}>
                      {language === "si" ? "ප්‍රශස්ත දිස්ත්‍රික්" : "Optimal District"}
                    </Text>
                  </View>
                  
                  {/* District */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "දිස්ත්‍රික්කය" : "District"}
                    </Text>
                    <Text style={styles.tableCell}>{inputSummary.district || "N/A"}</Text>
                    <Text style={styles.tableCell}>{inputSummary.district || "N/A"}</Text>
                  </View>
                  
                  {/* Variety */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "ප්‍රභේදය" : "Variety"}
                    </Text>
                    <Text style={styles.tableCell}>{inputSummary.variety || "N/A"}</Text>
                    <Text style={styles.tableCell}>Jet 999 / Pacific 808</Text>
                  </View>
                  
                  {/* Season */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "කන්නය" : "Season"}
                    </Text>
                    <Text style={styles.tableCell}>{inputSummary.season || "N/A"}</Text>
                    <Text style={styles.tableCell}>Maha</Text>
                  </View>
                  
                  {/* Soil Fertility */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "පස් සාරවත්භාවය" : "Soil Fertility"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {soilHealth.fertility_index ? `${(soilHealth.fertility_index * 100).toFixed(0)}%` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>≥70%</Text>
                  </View>
                  
                  {/* NPK Levels */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "නයිට්‍රජන් (N)" : "Nitrogen (N)"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {npkLevels.nitrogen ? `${npkLevels.nitrogen} ppm` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>≥80 ppm</Text>
                  </View>
                  
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "පොස්පරස් (P)" : "Phosphorus (P)"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {npkLevels.phosphorus ? `${npkLevels.phosphorus} ppm` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>≥40 ppm</Text>
                  </View>
                  
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "පොටෑසියම් (K)" : "Potassium (K)"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {npkLevels.potassium ? `${npkLevels.potassium} ppm` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>≥200 ppm</Text>
                  </View>
                  
                  {/* Temperature */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "උෂ්ණත්වය" : "Temperature"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {envFactors.temperature ? `${envFactors.temperature}°C` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>26-30°C</Text>
                  </View>
                  
                  {/* Rainfall */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>
                      {language === "si" ? "වර්ෂාපතනය (30d)" : "Rainfall (30d)"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {envFactors.rainfall_30d ? `${envFactors.rainfall_30d} mm` : "N/A"}
                    </Text>
                    <Text style={styles.tableCell}>80-150 mm</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* NPK Levels Chart - Current vs Optimal Side by Side */}
          {npkLevels.nitrogen && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].npkLevels}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <Text style={styles.chartSubtitle}>Current Levels</Text>
                <BarChart
                  data={npkData}
                  width={screenWidth - 64}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for current
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
                <Text style={styles.chartSubtitle}>Optimal Levels</Text>
                <BarChart
                  data={npkOptimalData}
                  width={screenWidth - 64}
                  height={180}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Orange for optimal
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  style={styles.chart}
                  showValuesOnTopOfBars
                  fromZero
                />
                {npkLevels.interpretation && (
                  <View style={styles.interpretationBox}>
                    <Info color="#3B82F6" size={16} />
                    <Text style={styles.interpretationText}>{npkLevels.interpretation}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Environmental Factors */}
          {envFactors.temperature && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].environmentalFactors}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <ProgressChart
                  data={envProgressData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1, index = 0) => {
                      const colors = [
                        `rgba(239, 68, 68, ${opacity})`,   // Red for temp
                        `rgba(59, 130, 246, ${opacity})`,  // Blue for humidity
                        `rgba(34, 197, 94, ${opacity})`,   // Green for rainfall
                        `rgba(245, 158, 11, ${opacity})`,  // Orange for sunshine
                      ];
                      return colors[index] || colors[0];
                    },
                  }}
                  style={styles.chart}
                  hideLegend={false}
                />
                <Text style={styles.envSubtitle}>
                  {language === "si" 
                    ? "පරමාදර්ශී බෝග වර්ධන පරාසය සමඟ සසඳන ලදී"
                    : "Compared to ideal maize growth range"}
                </Text>
                <View style={styles.envDetails}>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Temperature:</Text>
                    <Text style={styles.envValue}>{envFactors.temperature}°C</Text>
                    <Text style={styles.envIdeal}>
                      (Ideal: {idealRanges.temperature?.min}-{idealRanges.temperature?.max}{idealRanges.temperature?.unit})
                    </Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Humidity:</Text>
                    <Text style={styles.envValue}>{envFactors.humidity}%</Text>
                    <Text style={styles.envIdeal}>
                      (Ideal: {idealRanges.humidity?.min}-{idealRanges.humidity?.max}{idealRanges.humidity?.unit})
                    </Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Rainfall (30d):</Text>
                    <Text style={styles.envValue}>{envFactors.rainfall_30d}mm</Text>
                    <Text style={styles.envIdeal}>
                      (Ideal: {idealRanges.rainfall_30d?.min}-{idealRanges.rainfall_30d?.max}{idealRanges.rainfall_30d?.unit})
                    </Text>
                  </View>
                  <View style={styles.envItem}>
                    <Text style={styles.envLabel}>Sunshine:</Text>
                    <Text style={styles.envValue}>{envFactors.sunshine}hrs</Text>
                    <Text style={styles.envIdeal}>
                      (Ideal: {idealRanges.sunshine?.min}-{idealRanges.sunshine?.max}{idealRanges.sunshine?.unit})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Soil Health */}
          {soilHealth.ph && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].soilHealth}
                </Text>
              </View>
              <View style={styles.chartCard}>
                <ProgressChart
                  data={soilHealthData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1, index = 0) => {
                      const colors = [
                        `rgba(168, 85, 247, ${opacity})`,  // Purple for pH
                        `rgba(236, 72, 153, ${opacity})`,  // Pink for fertility
                        `rgba(34, 197, 94, ${opacity})`,   // Green for N
                        `rgba(59, 130, 246, ${opacity})`,  // Blue for P
                        `rgba(245, 158, 11, ${opacity})`,  // Orange for K
                      ];
                      return colors[index] || colors[0];
                    },
                  }}
                  style={styles.chart}
                  hideLegend={false}
                />
                <View style={styles.soilDetails}>
                  <View style={styles.soilRow}>
                    <Text style={styles.soilText}>pH: {soilHealth.ph}</Text>
                    <Text style={styles.soilInterpretation}>({soilHealth.ph_interpretation})</Text>
                  </View>
                  <Text style={styles.soilText}>
                    Fertility: {(soilHealth.fertility_index * 100).toFixed(0)}%
                  </Text>
                  <View style={styles.npkStatusRow}>
                    <Text style={styles.soilText}>N: {soilHealth.n_status} ({npkLevels.nitrogen} ppm)</Text>
                  </View>
                  <View style={styles.npkStatusRow}>
                    <Text style={styles.soilText}>P: {soilHealth.p_status} ({npkLevels.phosphorus} ppm)</Text>
                  </View>
                  <View style={styles.npkStatusRow}>
                    <Text style={styles.soilText}>K: {soilHealth.k_status} ({npkLevels.potassium} ppm)</Text>
                  </View>
                </View>
                {soilHealth.limiting_factor && (
                  <View style={styles.limitingFactorBadge}>
                    <AlertCircle color="#EF4444" size={16} />
                    <Text style={styles.limitingFactorText}>
                      Main constraint: {soilHealth.limiting_factor}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Impact Factors */}
          {impactFactors.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Activity color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].impactFactors}
                </Text>
              </View>
              
              {/* Filter Buttons */}
              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[styles.filterButton, impactFilter === 'all' && styles.filterButtonActive]}
                  onPress={() => setImpactFilter('all')}
                >
                  <Text style={[styles.filterButtonText, impactFilter === 'all' && styles.filterButtonTextActive]}>
                    {language === "si" ? "සියල්ල" : "All"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, impactFilter === 'positive' && styles.filterButtonActive]}
                  onPress={() => setImpactFilter('positive')}
                >
                  <Text style={[styles.filterButtonText, impactFilter === 'positive' && styles.filterButtonTextActive]}>
                    {language === "si" ? "ධනාත්මක" : "Positive"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterButton, impactFilter === 'negative' && styles.filterButtonActive]}
                  onPress={() => setImpactFilter('negative')}
                >
                  <Text style={[styles.filterButtonText, impactFilter === 'negative' && styles.filterButtonTextActive]}>
                    {language === "si" ? "ඍණාත්මක" : "Negative"}
                  </Text>
                </TouchableOpacity>
              </View>

              {impactFactors
                .filter((factor: any) => {
                  if (impactFilter === 'positive') return (factor.impact_percentage || 0) >= 0;
                  if (impactFilter === 'negative') return (factor.impact_percentage || 0) < 0;
                  return true;
                })
                .sort((a: any, b: any) => Math.abs(b.impact_percentage || 0) - Math.abs(a.impact_percentage || 0))
                .map((factor: any, index: number) => (
                <View key={index} style={[
                  styles.factorCard,
                  { borderLeftColor: (factor.impact_percentage || 0) >= 0 ? "#10B981" : "#EF4444" }
                ]}>
                  <View style={styles.factorHeader}>
                    <View style={styles.factorNameContainer}>
                      <Text style={styles.factorName}>{factor.factor}</Text>
                      <View style={[
                        styles.sourceTag,
                        { backgroundColor: factor.source === 'ml_model' ? '#DBEAFE' : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.sourceTagText,
                          { color: factor.source === 'ml_model' ? '#1E40AF' : '#92400E' }
                        ]}>
                          {factor.source === 'ml_model' 
                            ? (language === "si" ? "ML මාදිලිය" : "ML Model")
                            : (language === "si" ? "නීති ගුණකය" : "Rule multiplier")}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.factorImpact,
                        {
                          color:
                            (factor.impact_percentage || 0) >= 0
                              ? "#10B981"
                              : "#EF4444",
                        },
                      ]}
                    >
                      {factor.impact_percentage > 0 ? "+" : ""}
                      {factor.impact_percentage?.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.factorDescription}>
                    {factor.description}
                  </Text>
                  
                  {/* Show dual bars if suggestion exists */}
                  {factor.suggested_value ? (
                    <View style={styles.suggestionContainer}>
                      {/* Current value bar (grey/red) */}
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>
                          {language === "si" ? "වත්මන්" : "Current"}:
                        </Text>
                        <View style={styles.factorBarContainer}>
                          <View
                            style={[
                              styles.factorBar,
                              {
                                width: `${Math.min(Math.abs(factor.impact_percentage || 0), 100)}%`,
                                backgroundColor: "#9CA3AF",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barValue}>{factor.impact_percentage?.toFixed(1)}%</Text>
                      </View>
                      
                      {/* Suggested value bar (green) */}
                      <View style={styles.barRow}>
                        <Text style={styles.barLabel}>
                          {language === "si" ? "යෝජිත" : "Suggested"}:
                        </Text>
                        <View style={styles.factorBarContainer}>
                          <View
                            style={[
                              styles.factorBar,
                              {
                                width: `${Math.min(Math.abs(factor.suggested_impact || 0), 100)}%`,
                                backgroundColor: "#10B981",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.barValue}>+{factor.suggested_impact?.toFixed(1)}%</Text>
                      </View>
                      
                      {/* Improvement indicator */}
                      <View style={styles.improvementBadge}>
                        <Text style={styles.improvementText}>
                          {language === "si" ? "වැඩිදියුණු කිරීම" : "Improvement"}: +{factor.difference?.toFixed(1)}%
                        </Text>
                      </View>
                      
                      {/* Suggested value display */}
                      <View style={styles.suggestedValueBox}>
                        <Text style={styles.suggestedValueLabel}>
                          {language === "si" ? "යෝජිත" : "Suggested"}:
                        </Text>
                        <Text style={styles.suggestedValueText}>{factor.suggested_value}</Text>
                      </View>
                    </View>
                  ) : (
                    /* Standard single bar */
                    <View style={styles.factorBarContainer}>
                      <View
                        style={[
                          styles.factorBar,
                          {
                            width: `${Math.min(Math.abs(factor.impact_percentage || 0), 100)}%`,
                            backgroundColor:
                              (factor.impact_percentage || 0) >= 0
                                ? "#10B981"
                                : "#EF4444",
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <AlertCircle color="#10B981" size={20} />
                </View>
                <Text style={styles.sectionTitle}>
                  {content[language].recommendations}
                </Text>
              </View>

              {recommendations.map((rec: any, index: number) => (
                <View key={index} style={styles.recommendationCard}>
                  <View style={styles.recommendationHeader}>
                    <CheckCircle color="#10B981" size={18} />
                    <Text style={styles.recommendationTitle}>
                      {language === "si" ? rec.title_si : rec.title_en}
                    </Text>
                  </View>
                  <Text style={styles.recommendationText}>
                    {language === "si" ? rec.description_si : rec.description_en}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          rec.priority === "high"
                            ? "#FEE2E2"
                            : rec.priority === "medium"
                            ? "#FEF3C7"
                            : "#DBEAFE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        {
                          color:
                            rec.priority === "high"
                              ? "#EF4444"
                              : rec.priority === "medium"
                              ? "#F59E0B"
                              : "#3B82F6",
                        },
                      ]}
                    >
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
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
    padding: 8,
  },
  downloadButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#D1FAE5",
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  yieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  yieldHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yieldIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  methodText: {
    fontSize: 12,
    fontWeight: "600",
  },
  yieldLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  yieldValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 4,
  },
  yieldUnit: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
    marginBottom: 4,
  },
  yieldSecondaryUnit: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  infoIcon: {
    marginLeft: 4,
  },
  methodBadgeContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  methodBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  methodBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065F46",
  },
  modelVersionUnderBadge: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  inputChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  inputChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  inputChipText: {
    fontSize: 11,
    color: "#065F46",
    fontWeight: "600",
  },
  chartSection: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  comparisonNote: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  comparisonNoteText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    flex: 1,
  },
  seeMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#10B981",
    borderRadius: 8,
    marginLeft: 8,
  },
  seeMoreText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  comparisonTable: {
    marginTop: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    paddingHorizontal: 4,
  },
  tableHeader: {
    fontWeight: "700",
    color: "#374151",
    backgroundColor: "#F3F4F6",
    paddingVertical: 6,
  },
  chartSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    marginTop: 12,
    marginBottom: 4,
  },
  interpretationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  interpretationText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  envDetails: {
    marginTop: 12,
    gap: 8,
  },
  envItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  envLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  envValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#065F46",
  },
  envIdeal: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  envSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  soilDetails: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  soilText: {
    fontSize: 12,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soilRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  soilInterpretation: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600",
  },
  npkStatusRow: {
    marginTop: 4,
  },
  limitingFactorBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  limitingFactorText: {
    flex: 1,
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  factorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  factorNameContainer: {
    flex: 1,
    marginRight: 8,
  },
  factorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  sourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  sourceTagText: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  factorImpact: {
    fontSize: 16,
    fontWeight: "700",
  },
  factorDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 18,
  },
  factorBarContainer: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  factorBar: {
    height: "100%",
    borderRadius: 3,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
    flex: 1,
  },
  recommendationText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  suggestionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    width: 70,
  },
  barValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    width: 50,
    textAlign: "right",
  },
  improvementBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  improvementText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#065F46",
  },
  suggestedValueBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#10B981",
    gap: 8,
  },
  suggestedValueLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  suggestedValueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    flex: 1,
  },
});

export default YieldPredictionOfficerResultsScreenEnhanced;
