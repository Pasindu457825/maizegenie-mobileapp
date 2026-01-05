import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";
import { useLanguage } from "../../context/LanguageContext";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  MapPin,
  Calendar,
  Activity
} from "lucide-react-native";

const riskData = {
  fallarmyworm: {
    Kurunegala: {
      January: "High",
      February: "High",
      March: "Medium",
      April: "Low",
      May: "Low",
      June: "Low",
      July: "Low",
      August: "Low",
      September: "Low",
      October: "Medium",
      November: "High",
      December: "High"
    },
    Anuradhapura: {
      January: "High",
      February: "High",
      March: "Medium",
      April: "Low",
      May: "Low",
      June: "Low",
      July: "Low",
      August: "Low",
      September: "Low",
      October: "Medium",
      November: "High",
      December: "High"
    },
    Ampara: {
      January: "Medium",
      February: "Medium",
      March: "Low",
      April: "Low",
      May: "Low",
      June: "Low",
      July: "Low",
      August: "Low",
      September: "Low",
      October: "High",
      November: "High",
      December: "High"
    }
  },

  bollworm: {
    Kurunegala: {
      January: "Medium",
      February: "High",
      March: "High",
      April: "Medium",
      May: "Low",
      June: "Low",
      July: "Low",
      August: "Medium",
      September: "High",
      October: "High",
      November: "Medium",
      December: "Medium"
    },
    Anuradhapura: {
      January: "Medium",
      February: "Medium",
      March: "High",
      April: "High",
      May: "Medium",
      June: "Low",
      July: "Low",
      August: "Medium",
      September: "High",
      October: "High",
      November: "Medium",
      December: "Medium"
    },
    Ampara: {
      January: "Low",
      February: "Low",
      March: "Medium",
      April: "High",
      May: "High",
      June: "Medium",
      July: "Low",
      August: "Medium",
      September: "High",
      October: "Medium",
      November: "Low",
      December: "Low"
    }
  },

  asiancornborer: {
    Kurunegala: {
      January: "Medium",
      February: "High",
      March: "High",
      April: "Medium",
      May: "Medium",
      June: "Low",
      July: "Low",
      August: "Low",
      September: "Medium",
      October: "High",
      November: "High",
      December: "Medium"
    },
    Anuradhapura: {
      January: "Medium",
      February: "Medium",
      March: "High",
      April: "High",
      May: "Medium",
      June: "Low",
      July: "Low",
      August: "Low",
      September: "Medium",
      October: "High",
      November: "High",
      December: "Medium"
    },
    Ampara: {
      January: "Low",
      February: "Medium",
      March: "Medium",
      April: "High",
      May: "High",
      June: "Medium",
      July: "Low",
      August: "Low",
      September: "Medium",
      October: "High",
      November: "High",
      December: "Medium"
    }
  }
};

const pestNames = {
  fallarmyworm: { en: "Fall Armyworm", si: "හමුදා පණුවා" },
  bollworm: { en: "Bollworm", si: "බෝල් පණුවා" },
  asiancornborer: { en: "Asian Corn Borer", si: "ආසියානු ඉරිඟු සිදුරු පණුවා" }
};

const districts = {
  Kurunegala: { en: "Kurunegala", si: "කුරුණෑගල" },
  Anuradhapura: { en: "Anuradhapura", si: "අනුරාධපුරය" },
  Ampara: { en: "Ampara", si: "අම්පාර" }
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthTranslations = {
  January: { en: "January", si: "ජනවාරි" },
  February: { en: "February", si: "පෙබරවාරි" },
  March: { en: "March", si: "මාර්තු" },
  April: { en: "April", si: "අප්‍රේල්" },
  May: { en: "May", si: "මැයි" },
  June: { en: "June", si: "ජූනි" },
  July: { en: "July", si: "ජූලි" },
  August: { en: "August", si: "අගෝස්තු" },
  September: { en: "September", si: "සැප්තැම්බර්" },
  October: { en: "October", si: "ඔක්තෝබර්" },
  November: { en: "November", si: "නොවැම්බර්" },
  December: { en: "December", si: "දෙසැම්බර්" }
};

const riskLevels = {
  High: { 
    color: "#ef4444", 
    label: { en: "High Risk", si: "ඉහළ අවදානම" }, 
    percentage: 85 
  },
  Medium: { 
    color: "#f59e0b", 
    label: { en: "Medium Risk", si: "මධ්‍යම අවදානම" }, 
    percentage: 50 
  },
  Low: { 
    color: "#10b981", 
    label: { en: "Low Risk", si: "අඩු අවදානම" }, 
    percentage: 20 
  },
  Unknown: { 
    color: "#6b7280", 
    label: { en: "Unknown", si: "නොදනී" }, 
    percentage: 0 
  }
};

const riskMessages = {
  High: {
    en: "High risk detected! Monitor your field frequently and implement control measures immediately.",
    si: "ඉහළ අවදානම! වගාව නිතර පරීක්ෂා කරන්න හා පාලනය ඉක්මනින් අරඹන්න."
  },
  Medium: {
    en: "Medium risk level. Regular monitoring recommended. Apply controls if pest activity increases.",
    si: "මධ්‍යම අවදානම. වගාව පරීක්ෂා කර අවශ්‍යනම් පාලනය කරන්න."
  },
  Low: {
    en: "Low risk level. Continue routine monitoring and maintain preventive measures.",
    si: "අඩු අවදානම. සාමාන්‍ය පරිදි පරීක්ෂා කරන්න."
  },
  Unknown: {
    en: "No data available for this selection. Please try different parameters.",
    si: "මෙම තේරීම සඳහා දත්ත නොමැත."
  }
};

const labels = {
  title: { en: "Pest Risk Assessment", si: "කෘමි අවදානම් තක්සේරුව" },
  subtitle: { en: "Real-time Risk Analysis", si: "තත්‍ය කාලීන අවදානම් විශ්ලේෂණය" },
  pestType: { en: "Pest Type", si: "කෘමි වර්ගය" },
  district: { en: "District", si: "දිස්ත්‍රික්කය" },
  month: { en: "Month", si: "මාසය" },
  riskLevel: { en: "Current Risk Level", si: "වර්තමාන අවදානම් මට්ටම" },
  recommendation: { en: "Recommendation", si: "නිර්දේශය" },
  lastUpdated: { en: "Last updated", si: "අවසන් යාවත්කාලීන" },
  low: { en: "Low", si: "අඩු" },
  medium: { en: "Medium", si: "මධ්‍යම" },
  high: { en: "High", si: "ඉහළ" },
  selectParameters: { en: "Select Parameters", si: "පරාමිති තෝරන්න" }
};

// Speedometer Gauge Component
const SpeedometerGauge = ({ percentage, color }: { percentage: number; color: string }) => {
  const size = 280;
  const strokeWidth = 25;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  
  // Calculate angle (from -120° to 120°, total 240°)
  const startAngle = -120;
  const endAngle = 120;
  const totalAngle = endAngle - startAngle;
  const currentAngle = startAngle + (totalAngle * percentage) / 100;
  
  // Convert to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  // Calculate needle endpoint
  const needleLength = radius - 10;
  const needleX = center + needleLength * Math.cos(toRad(currentAngle - 90));
  const needleY = center + needleLength * Math.sin(toRad(currentAngle - 90));
  
  // Create arc path for gauge background
  const createArcPath = (start: number, end: number, r: number) => {
    const startRad = toRad(start - 90);
    const endRad = toRad(end - 90);
    const x1 = center + r * Math.cos(startRad);
    const y1 = center + r * Math.sin(startRad);
    const x2 = center + r * Math.cos(endRad);
    const y2 = center + r * Math.sin(endRad);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <Svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      {/* Background arc - gray */}
      <Path
        d={createArcPath(startAngle, endAngle, radius)}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Colored segments */}
      {/* Low (green) - 0-33% */}
      <Path
        d={createArcPath(startAngle, startAngle + totalAngle * 0.33, radius)}
        stroke="#10b981"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
      
      {/* Medium (orange) - 33-66% */}
      <Path
        d={createArcPath(startAngle + totalAngle * 0.33, startAngle + totalAngle * 0.66, radius)}
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
      
      {/* High (red) - 66-100% */}
      <Path
        d={createArcPath(startAngle + totalAngle * 0.66, endAngle, radius)}
        stroke="#ef4444"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
      
      {/* Active arc showing current value */}
      <Path
        d={createArcPath(startAngle, currentAngle, radius)}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Tick marks */}
      {[0, 20, 40, 60, 80, 100].map((tick) => {
        const angle = startAngle + (totalAngle * tick) / 100;
        const innerR = radius - strokeWidth / 2 - 5;
        const outerR = radius - strokeWidth / 2 + 5;
        const x1 = center + innerR * Math.cos(toRad(angle - 90));
        const y1 = center + innerR * Math.sin(toRad(angle - 90));
        const x2 = center + outerR * Math.cos(toRad(angle - 90));
        const y2 = center + outerR * Math.sin(toRad(angle - 90));
        
        return (
          <G key={tick}>
            <Path
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              stroke="#94a3b8"
              strokeWidth={2}
            />
          </G>
        );
      })}
      
      {/* Center hub */}
      <Circle cx={center} cy={center} r={15} fill="#1f2937" />
      <Circle cx={center} cy={center} r={10} fill={color} />
      
      {/* Needle */}
      <Path
        d={`M ${center} ${center} L ${needleX} ${needleY}`}
        stroke="#1f2937"
        strokeWidth={4}
        strokeLinecap="round"
      />
      
      {/* Needle tip circle */}
      <Circle cx={needleX} cy={needleY} r={6} fill={color} />
    </Svg>
  );
};

export default function PestRiskMeter() {
  const currentMonth = months[new Date().getMonth()];

  const [pest, setPest] = useState("fallarmyworm");
  const [district, setDistrict] = useState("Kurunegala");
  const [month, setMonth] = useState(currentMonth);

  const { language: appLang } = useLanguage();
  const language = appLang === "sinhala" ? "si" : "en";

  const getRisk = (): "High" | "Medium" | "Low" | "Unknown" => {
    try {
      const pestData = riskData[pest as keyof typeof riskData];
      if (!pestData) return "Unknown";
      const districtData = pestData[district as keyof typeof pestData];
      if (!districtData) return "Unknown";
      const monthRisk = districtData[month as keyof typeof districtData];
      return (monthRisk as "High" | "Medium" | "Low") || "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const risk = getRisk();
  const riskConfig = riskLevels[risk];
  const riskNote = riskMessages[risk]?.[language] || riskMessages.Unknown.en;

  const getRiskIcon = () => {
    switch (risk) {
      case "High":
        return <AlertTriangle size={24} color="#ffffff" />;
      case "Medium":
        return <TrendingUp size={24} color="#ffffff" />;
      case "Low":
        return <CheckCircle size={24} color="#ffffff" />;
      default:
        return <Info size={24} color="#ffffff" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Modern Gradient Header */}
      <LinearGradient
        colors={["#10ad79", "#0f9d6b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Activity size={32} color="#ffffff" strokeWidth={2.5} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{labels.title[language]}</Text>
            <Text style={styles.subtitle}>{labels.subtitle[language]}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Selection Card */}
        <View style={styles.selectionCard}>
          <View style={styles.selectionHeader}>
            <View style={styles.selectionIconContainer}>
              <Info size={20} color="#10ad79" />
            </View>
            <Text style={styles.selectionTitle}>{labels.selectParameters[language]}</Text>
          </View>

          {/* Pest Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{labels.pestType[language]}</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={pest} 
                onValueChange={(v) => setPest(v)} 
                style={styles.picker}
              >
                {Object.keys(pestNames).map((key) => (
                  <Picker.Item 
                    label={pestNames[key as keyof typeof pestNames][language]} 
                    value={key} 
                    key={key} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* District Picker */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <MapPin size={16} color="#10ad79" />
              <Text style={styles.label}>{labels.district[language]}</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={district} 
                onValueChange={(v) => setDistrict(v)} 
                style={styles.picker}
              >
                {Object.keys(districts).map((key) => (
                  <Picker.Item 
                    label={districts[key as keyof typeof districts][language]} 
                    value={key} 
                    key={key} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Month Picker */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Calendar size={16} color="#10ad79" />
              <Text style={styles.label}>{labels.month[language]}</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={month} 
                onValueChange={(v) => setMonth(v)} 
                style={styles.picker}
              >
                {months.map((m) => (
                  <Picker.Item 
                    label={monthTranslations[m as keyof typeof monthTranslations][language]} 
                    value={m} 
                    key={m} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Risk Meter Card with Speedometer */}
        <View style={styles.meterCard}>
          <Text style={styles.meterTitle}>{labels.riskLevel[language]}</Text>
          
          {/* Speedometer Gauge */}
          <View style={styles.gaugeContainer}>
            <SpeedometerGauge 
              percentage={riskConfig.percentage} 
              color={riskConfig.color}
            />
            
            {/* Center Display */}
            <View style={styles.centerDisplay}>
              <Text style={[styles.percentageText, { color: riskConfig.color }]}>
                {riskConfig.percentage}%
              </Text>
              <Text style={styles.riskLabelText}>
                {riskConfig.label[language]}
              </Text>
            </View>
          </View>

          {/* Risk Level Indicators */}
          <View style={styles.indicatorsRow}>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: "#10b981" }]} />
              <Text style={styles.indicatorLabel}>{labels.low[language]}</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: "#f59e0b" }]} />
              <Text style={styles.indicatorLabel}>{labels.medium[language]}</Text>
            </View>
            <View style={styles.indicatorItem}>
              <View style={[styles.indicatorDot, { backgroundColor: "#ef4444" }]} />
              <Text style={styles.indicatorLabel}>{labels.high[language]}</Text>
            </View>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={[styles.recommendationCard, { borderLeftColor: riskConfig.color }]}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.iconCircle, { backgroundColor: riskConfig.color }]}>
              {getRiskIcon()}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.recommendationTitle}>
                {labels.recommendation[language]}
              </Text>
              <Text style={[styles.riskBadge, { color: riskConfig.color }]}>
                {riskConfig.label[language]}
              </Text>
            </View>
          </View>
          <Text style={styles.recommendationText}>{riskNote}</Text>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {labels.lastUpdated[language]}: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafb" 
  },

  // Header Styles
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },

  scrollView: {
    flex: 1,
  },

  content: { 
    padding: 20,
    paddingBottom: 40
  },

  // Selection Card
  selectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  selectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  selectionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#e8f8f2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  selectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },

  inputGroup: {
    marginBottom: 16
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  label: { 
    fontSize: 14, 
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },

  pickerWrapper: {
    backgroundColor: "#f8fafb",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e8f8f2",
    overflow: "hidden"
  },

  picker: {
    height: 50,
  },

  // Meter Card
  meterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center"
  },

  meterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center"
  },

  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },

  centerDisplay: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },

  percentageText: {
    fontSize: 48,
    fontWeight: "800",
    marginBottom: 40,
  },

  riskLabelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },

  indicatorsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },

  indicatorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  indicatorLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },

  // Recommendation Card
  recommendationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },

  riskBadge: {
    fontSize: 13,
    fontWeight: "700",
  },

  recommendationText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },

  footerText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  }
});