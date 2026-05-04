import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ArrowLeft, BarChart3, RefreshCw, TrendingUp } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { LineChart, BarChart } from "react-native-chart-kit";
import { PestIdentifyStackParamList } from "src/navigation/PestIdentifyStack";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<PestIdentifyStackParamList>;
type UiLanguage = "si" | "en" | "ta";

interface PestFrequencyItem {
  class_name: string;
  count: number;
}

interface DailySeriesItem {
  date?: string | null;
  detections?: number | null;
}

interface PestFrequencyResponse {
  success: boolean;
  days: number;
  total_requests: number;
  no_pest_requests: number;
  total_detections: number;
  top_pests: PestFrequencyItem[];
  daily_detection_series: DailySeriesItem[];
}

const getApiUrl = () => {
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_API_BASE || "http://192.168.8.125:8000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  }
  return "http://localhost:8000";
};

const API_URL = getApiUrl();

const translations = {
  si: {
    failedLoad: "විශ්ලේෂණය පූරණය කිරීමට අසාර්ථකයි.",
    headerTitle: "කෘමි සංඛ්‍යාත විශ්ලේෂණය",
    days: "දින",
    loading: "විශ්ලේෂණ වාර්තාව සැකසෙමින්...",
    totalRequests: "මුළු ඉල්ලීම්",
    detections: "හඳුනාගැනීම්",
    noPestCases: "කෘමි නොමැති අවස්ථා",
    dailyTrend: "දෛනික හඳුනාගැනීම් ප්‍රවණතාව (අවසාන 7 ලක්ෂ්‍ය)",
    topDistribution: "ප්‍රධාන කෘමි බෙදාහැරීම",
    detailedList: "විස්තරාත්මක ප්‍රධාන කෘමි ලැයිස්තුව",
    noData: "තෝරාගත් කාල පරාසයට හඳුනාගැනීම් දත්ත නොමැත.",
    noChartData: "දත්ත නැත",
  },
  en: {
    failedLoad: "Failed to load analysis.",
    headerTitle: "Pest Frequency Analysis",
    days: "Days",
    loading: "Generating analysis report...",
    totalRequests: "Total Requests",
    detections: "Detections",
    noPestCases: "No-Pest Cases",
    dailyTrend: "Daily Detection Trend (Last 7 points)",
    topDistribution: "Top Pests Distribution",
    detailedList: "Detailed Top Pest List",
    noData: "No detection data in selected window.",
    noChartData: "No Data",
  },
  ta: {
    failedLoad: "பகுப்பாய்வை ஏற்ற முடியவில்லை.",
    headerTitle: "பூச்சி அடிக்கடி நிகழ்வு பகுப்பாய்வு",
    days: "நாட்கள்",
    loading: "பகுப்பாய்வு அறிக்கை உருவாக்கப்படுகிறது...",
    totalRequests: "மொத்த கோரிக்கைகள்",
    detections: "அடையாளங்கள்",
    noPestCases: "பூச்சி இல்லாத நிகழ்வுகள்",
    dailyTrend: "தினசரி கண்டறிதல் போக்கு (கடைசி 7 புள்ளிகள்)",
    topDistribution: "முக்கிய பூச்சிகள் பகிர்வு",
    detailedList: "விரிவான முக்கிய பூச்சி பட்டியல்",
    noData: "தேர்ந்தெடுக்கப்பட்ட காலவரம்பில் கண்டறிதல் தரவு இல்லை.",
    noChartData: "தரவு இல்லை",
  },
} as const;

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(16, 173, 121, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  propsForBackgroundLines: {
    stroke: "#E5E7EB",
    strokeDasharray: "3",
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#0F9D6B",
  },
};

const PestFrequencyAnalysisScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { language: appLang } = useLanguage();
  const language: UiLanguage =
    appLang === "sinhala" ? "si" : appLang === "tamil" ? "ta" : "en";
  const [stats, setStats] = useState<PestFrequencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const content = translations[language];

  const fetchStats = useCallback(async (windowDays: number) => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem("auth_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.get(`${API_URL}/api/pest/frequency?days=${windowDays}&top_n=6`, {
        headers,
        timeout: 15000,
      });

      if (res.data?.success) {
        setStats(res.data as PestFrequencyResponse);
      } else {
        setError(content.failedLoad);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || content.failedLoad);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchStats(days);
  }, [days, fetchStats]);

  const lineData = useMemo(() => {
    const series = Array.isArray(stats?.daily_detection_series)
      ? stats.daily_detection_series
      : [];
    const last = series.slice(-7);
    return {
      labels: last.map((x) =>
        typeof x?.date === "string" && x.date.length >= 5 ? x.date.slice(5) : "--/--"
      ),
      datasets: [
        {
          data: last.length ? last.map((x) => Number(x?.detections ?? 0)) : [0],
          strokeWidth: 2,
        },
      ],
    };
  }, [stats]);

  const barData = useMemo(() => {
    const top = Array.isArray(stats?.top_pests) ? stats.top_pests.slice(0, 5) : [];
    return {
      labels: top.length
        ? top.map((x) =>
            typeof x?.class_name === "string" && x.class_name.trim()
              ? x.class_name.slice(0, 8)
              : "Unknown"
          )
        : [content.noChartData],
      datasets: [{ data: top.length ? top.map((x) => Number(x?.count ?? 0)) : [0] }],
    };
  }, [language, stats]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10AD79", "#0F9D6B"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.headerTitle}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => fetchStats(days)}>
          <RefreshCw color="#FFFFFF" size={18} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.dayTabs}>
        {[7, 30, 90].map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDays(d)}
            style={[styles.dayTab, days === d && styles.dayTabActive]}
          >
            <Text style={[styles.dayTabText, days === d && styles.dayTabTextActive]}>
              {d} {content.days}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10AD79" />
          <Text style={styles.loadingText}>{content.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <TrendingUp size={18} color="#10AD79" />
              <Text style={styles.summaryValue}>{stats?.total_requests ?? 0}</Text>
              <Text style={styles.summaryLabel}>{content.totalRequests}</Text>
            </View>
            <View style={styles.summaryCard}>
              <BarChart3 size={18} color="#10AD79" />
              <Text style={styles.summaryValue}>{stats?.total_detections ?? 0}</Text>
              <Text style={styles.summaryLabel}>{content.detections}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats?.no_pest_requests ?? 0}</Text>
              <Text style={styles.summaryLabel}>{content.noPestCases}</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{content.dailyTrend}</Text>
            <LineChart
              data={lineData}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              withInnerLines
              style={styles.chart}
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>{content.topDistribution}</Text>
            <BarChart
              data={barData}
              width={width - 48}
              height={240}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </View>

          <View style={styles.listCard}>
            <Text style={styles.chartTitle}>{content.detailedList}</Text>
            {Array.isArray(stats?.top_pests) && stats.top_pests.length ? (
              stats.top_pests.map((p, idx) => (
                <View key={`${p.class_name}-${idx}`} style={styles.listRow}>
                  <Text style={styles.listName}>
                    {idx + 1}.{" "}
                    {typeof p?.class_name === "string" && p.class_name.trim()
                      ? p.class_name
                      : "Unknown pest"}
                  </Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{Number(p?.count ?? 0)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>{content.noData}</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  header: {
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  dayTabs: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    backgroundColor: "#FFFFFF",
  },
  dayTabActive: {
    backgroundColor: "#10AD79",
    borderColor: "#10AD79",
  },
  dayTabText: { color: "#065F46", fontWeight: "700" },
  dayTabTextActive: { color: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#047857", fontWeight: "600" },
  errorText: { color: "#B91C1C", fontWeight: "600" },
  scrollBody: { padding: 16, paddingBottom: 28, gap: 14 },
  summaryGrid: { flexDirection: "row", gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
    gap: 4,
  },
  summaryValue: { fontSize: 22, fontWeight: "800", color: "#047857" },
  summaryLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", textAlign: "center" },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  chartTitle: { fontSize: 15, fontWeight: "800", color: "#065F46", marginBottom: 8 },
  chart: { borderRadius: 12 },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECFDF5",
  },
  listName: { flex: 1, color: "#1F2937", fontWeight: "600", marginRight: 10 },
  countBadge: {
    minWidth: 34,
    borderRadius: 14,
    backgroundColor: "#10AD79",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
  },
  countText: { color: "#FFFFFF", fontWeight: "800" },
  emptyText: { color: "#6B7280", fontSize: 13 },
});

export default PestFrequencyAnalysisScreen;

