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

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<PestIdentifyStackParamList>;

interface PestFrequencyItem {
  class_name: string;
  count: number;
}

interface DailySeriesItem {
  date: string;
  detections: number;
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
  const [stats, setStats] = useState<PestFrequencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

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
        setError("Failed to load analysis.");
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(days);
  }, [days, fetchStats]);

  const lineData = useMemo(() => {
    const series = stats?.daily_detection_series || [];
    const last = series.slice(-7);
    return {
      labels: last.map((x) => x.date.slice(5)),
      datasets: [
        {
          data: last.length ? last.map((x) => x.detections) : [0],
          strokeWidth: 2,
        },
      ],
    };
  }, [stats]);

  const barData = useMemo(() => {
    const top = (stats?.top_pests || []).slice(0, 5);
    return {
      labels: top.length ? top.map((x) => x.class_name.slice(0, 8)) : ["No Data"],
      datasets: [{ data: top.length ? top.map((x) => x.count) : [0] }],
    };
  }, [stats]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#10AD79", "#0F9D6B"]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pest Frequency Analysis</Text>
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
              {d} Days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#10AD79" />
          <Text style={styles.loadingText}>Generating analysis report...</Text>
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
              <Text style={styles.summaryLabel}>Total Requests</Text>
            </View>
            <View style={styles.summaryCard}>
              <BarChart3 size={18} color="#10AD79" />
              <Text style={styles.summaryValue}>{stats?.total_detections ?? 0}</Text>
              <Text style={styles.summaryLabel}>Detections</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats?.no_pest_requests ?? 0}</Text>
              <Text style={styles.summaryLabel}>No-Pest Cases</Text>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Daily Detection Trend (Last 7 points)</Text>
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
            <Text style={styles.chartTitle}>Top Pests Distribution</Text>
            <BarChart
              data={barData}
              width={width - 48}
              height={240}
              chartConfig={chartConfig}
              fromZero
              showValuesOnTopOfBars
              style={styles.chart}
            />
          </View>

          <View style={styles.listCard}>
            <Text style={styles.chartTitle}>Detailed Top Pest List</Text>
            {(stats?.top_pests || []).length ? (
              stats?.top_pests.map((p, idx) => (
                <View key={`${p.class_name}-${idx}`} style={styles.listRow}>
                  <Text style={styles.listName}>{idx + 1}. {p.class_name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{p.count}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No detection data in selected window.</Text>
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
