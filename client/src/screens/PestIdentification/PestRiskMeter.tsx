import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";

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

/* --------------------------  STATIC DATA ------------------------------ */

const pestNames = {
  fallarmyworm: "Fall Armyworm",
  bollworm: "Bollworm",
  asiancornborer: "Asian Corn Borer"
};

const districts = ["Kurunegala", "Anuradhapura", "Ampara"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const riskLevels = {
  High: { color: "#dc2626", label: "High Risk", percentage: 85 },
  Medium: { color: "#f59e0b", label: "Medium Risk", percentage: 50 },
  Low: { color: "#10b981", label: "Low Risk", percentage: 20 },
  Unknown: { color: "#6b7280", label: "Unknown", percentage: 0 }
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

/* --------------------------  MAIN COMPONENT ------------------------------ */

export default function PestRiskMeter() {
  const currentMonth = months[new Date().getMonth()];

  const [pest, setPest] = useState("fallarmyworm");
  const [district, setDistrict] = useState("Kurunegala");
  const [month, setMonth] = useState(currentMonth);
  const [language, setLanguage] = useState("en");

  // Get risk from riskData
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
    const riskNote = riskMessages[risk]?.[language as "en" | "si"] || riskMessages.Unknown.en;  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pest Risk Assessment</Text>
          <Text style={styles.subtitle}>Seasonal Risk Analysis</Text>
        </View>

        {/* Language Toggle */}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, language === "en" && styles.langBtnActive]}
            onPress={() => setLanguage("en")}
          >
            <Text style={[styles.langBtnText, language === "en" && styles.langBtnTextActive]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langBtn, language === "si" && styles.langBtnActive]}
            onPress={() => setLanguage("si")}
          >
            <Text style={[styles.langBtnText, language === "si" && styles.langBtnTextActive]}>
              සිංහල
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selection Card */}
        <View style={styles.card}>
          {/* Pest Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pest Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={pest} 
                onValueChange={(v) => setPest(v)} 
                style={styles.picker}
              >
                {Object.keys(pestNames).map((key) => (
                  <Picker.Item 
                    label={pestNames[key as keyof typeof pestNames]} 
                    value={key} 
                    key={key} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* District Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={district} 
                onValueChange={(v) => setDistrict(v)} 
                style={styles.picker}
              >
                {districts.map((d) => (
                  <Picker.Item label={d} value={d} key={d} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Month Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Month</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={month} 
                onValueChange={(v) => setMonth(v)} 
                style={styles.picker}
              >
                {months.map((m) => (
                  <Picker.Item label={m} value={m} key={m} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Risk Meter */}
        <View style={styles.meterCard}>
          <Text style={styles.meterTitle}>Risk Level</Text>
          
          {/* Circular Progress Meter */}
          <View style={styles.meterContainer}>
            <View style={styles.meterOuter}>
              <View style={[styles.meterFill, { 
                backgroundColor: riskConfig.color,
                height: `${riskConfig.percentage}%`
              }]} />
            </View>
            
            <View style={styles.meterInfo}>
              <Text style={[styles.riskPercentage, { color: riskConfig.color }]}>
                {riskConfig.percentage}%
              </Text>
              <Text style={[styles.riskLabel, { color: riskConfig.color }]}>
                {riskConfig.label}
              </Text>
            </View>
          </View>

          {/* Risk Indicator Bar */}
          <View style={styles.indicatorBar}>
            <View style={[styles.indicator, { backgroundColor: "#10b981" }]}>
              <Text style={styles.indicatorText}>Low</Text>
            </View>
            <View style={[styles.indicator, { backgroundColor: "#f59e0b" }]}>
              <Text style={styles.indicatorText}>Medium</Text>
            </View>
            <View style={[styles.indicator, { backgroundColor: "#dc2626" }]}>
              <Text style={styles.indicatorText}>High</Text>
            </View>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={[styles.recommendationCard, { borderLeftColor: riskConfig.color }]}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.iconCircle, { backgroundColor: riskConfig.color + "20" }]}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
          </View>
          <Text style={styles.recommendationText}>{riskNote}</Text>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* --------------------------  STYLES ------------------------------ */

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  
  content: { 
    padding: 20,
    paddingBottom: 40
  },
  
  header: {
    marginBottom: 24,
    alignItems: "center"
  },
  
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#0f172a",
    marginBottom: 4
  },
  
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500"
  },

  langToggle: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    alignSelf: "center"
  },
  
  langBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 2
  },
  
  langBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  
  langBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14
  },
  
  langBtnTextActive: {
    color: "#0f172a"
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },

  inputGroup: {
    marginBottom: 20
  },

  label: { 
    fontSize: 14, 
    marginBottom: 8, 
    fontWeight: "600",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },

  pickerWrapper: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden"
  },

  picker: {
    height: 50
  },

  meterCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center"
  },

  meterTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 24
  },

  meterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    width: "100%"
  },

  meterOuter: {
    width: 120,
    height: 200,
    backgroundColor: "#f1f5f9",
    borderRadius: 60,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: 3,
    borderColor: "#e2e8f0"
  },

  meterFill: {
    width: "100%",
    borderRadius: 60
  },

  meterInfo: {
    marginLeft: 32,
    alignItems: "flex-start"
  },

  riskPercentage: {
    fontSize: 48,
    fontWeight: "800",
    marginBottom: 4
  },

  riskLabel: {
    fontSize: 18,
    fontWeight: "700"
  },

  indicatorBar: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
    height: 8
  },

  indicator: {
    flex: 1,
    height: "100%"
  },

  indicatorText: {
    display: "none"
  },

  recommendationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },

  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  iconText: {
    fontSize: 20
  },

  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a"
  },

  recommendationText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569"
  },

  footer: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8
  },

  footerText: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500"
  }
});