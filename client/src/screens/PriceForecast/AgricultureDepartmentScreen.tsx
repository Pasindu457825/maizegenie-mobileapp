import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useUniversalLocation from "../../utils/useUniversalLocation";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import { useLanguage } from "../../context/LanguageContext";

type AgricultureDepartment = {
  id: string;
  name: string;
  type: string;
  category: string;
  distance: string | number;
  lat: number;
  lon: number;
  address: string;
  phone?: string;
  email?: string;
  services?: string[];
  hours?: string;
};

type LanguageType = "si" | "en";

// ✨ Translations
const translations: Record<
  LanguageType,
  {
    locating: string;
    centerType: string;
    allCenters: string;
    districtOffice: string;
    headOffice: string;
    researchInstitute: string;
    extensionCenter: string;
    cicOffice: string;
    searchRadius: string;
    loading: string;
    noResults: string;
    noResultsSub: string;
    retry: string;
    foundCenters: string;
    sortedByDistance: string;
    services: string;
    hours: string;
    call: string;
    email: string;
    directions: string;
    callConfirm: string;
    callConfirmSub: string;
    cancel: string;
    emailError: string;
    emailErrorMessage: string;
    source: string;
    tip: string;
    tipDescription: string;
    title: string;
    subtitle: string;
  }
> = {
  si: {
    locating: "ස්ථානය හඳුනාගනිමින්...",
    centerType: "මධ්‍යස්ථාන වර්ගය:",
    allCenters: "සියල්ල",
    districtOffice: "දිස්ත්‍රික් කාර්යාල",
    headOffice: "මූලස්ථානය",
    researchInstitute: "පර්යේෂණ ආයතන",
    extensionCenter: "සහය මධ්‍යස්ථාන",
    cicOffice: "CIC කාර්යාල",
    searchRadius: "සෙවුම් අරය:",
    loading: "මධ්‍යස්ථාන ලබා ගනිමින්...",
    noResults: "මධ්‍යස්ථාන හමු නොවීය",
    noResultsSub: "කරුණාකර සෙවුම් අරය වැඩි කරන්න",
    retry: "නැවත උත්සාහ කරන්න",
    foundCenters: "සොයාගත් මධ්‍යස්ථාන:",
    sortedByDistance: "ඔබගේ ස්ථානයෙන් දුර අනුව ලැයිස්තුගත කර ඇත",
    services: "සේවා:",
    hours: "කාර්ය කාලය",
    call: "ඇමතුම",
    email: "ඊ-තැපැල්",
    directions: "මාර්ගය",
    callConfirm: "දුරකථන ඇමතුම",
    callConfirmSub: "අංකයට ඇමතීමට අවශ්‍යද?",
    cancel: "අවලංගු කරන්න",
    emailError: "දෝෂය",
    emailErrorMessage: "ඊ-තැපැල් යෙදුම විවෘත කිරීමට නොහැකි විය",
    source: "තොරතුරු: ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුව",
    tip: "උපදෙස්",
    tipDescription:
      "නිවසට සමීපම මධ්‍යස්ථානය සොයා ගෙන දුරකථන ඇමතුමකින් සේවා වලංගු කර ගන්න.",
    title: "කෘෂිකර්ම දෙපාර්තමේන්තුව",
    subtitle: "ශ්‍රී ලංකාව",
  },
  en: {
    locating: "Locating you...",
    centerType: "Center Type:",
    allCenters: "All",
    districtOffice: "District Office",
    headOffice: "Head Office",
    researchInstitute: "Research Institute",
    extensionCenter: "Extension Center",
    cicOffice: "CIC Office",
    searchRadius: "Search Radius:",
    loading: "Loading centers...",
    noResults: "No centers found",
    noResultsSub: "Please increase search radius",
    retry: "Retry",
    foundCenters: "Centers found:",
    sortedByDistance: "Sorted by distance from your location",
    services: "Services:",
    hours: "Hours",
    call: "Call",
    email: "Email",
    directions: "Directions",
    callConfirm: "Phone Call",
    callConfirmSub: "Call this number?",
    cancel: "Cancel",
    emailError: "Error",
    emailErrorMessage: "Unable to open email application",
    source: "* Data Source: Sri Lanka Agriculture Department",
    tip: "Tip",
    tipDescription:
      "Find the nearest agriculture center and call to confirm service availability.",
    title: "Agriculture Department",
    subtitle: "Sri Lanka",
  },
};

const AgricultureDepartmentScreen = () => {
  const { language: lang } = useLanguage();

  // ✅ Ensure language is properly tracked
  const language: LanguageType = useMemo(() => {
    return lang === "sinhala" ? "si" : "en";
  }, [lang]);

  // ✅ Get translations based on language
  const t = useMemo(() => translations[language], [language]);

  const {
    latitude,
    longitude,
    isLoading: locationLoading,
    error: locationError,
  } = useUniversalLocation("en");

  const [departments, setDepartments] = useState<AgricultureDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState(5); // Larger radius for departments
  const [selectedType, setSelectedType] = useState("all");

  const fetchAgriOfficesFromOSM = async (): Promise<
    AgricultureDepartment[]
  > => {
    if (!latitude || !longitude) return [];

    const radiusMeters = searchRadius * 1000;

    const delta = searchRadius / 111; // approx km → lat/lon

    const query = `
[out:json][timeout:25];
(
  node["name"~"govijan|agrarian|seva|fertilizer|cic|agriculture|agri|කෘෂි|ගොවි|සේවා",i]
    (${latitude - delta},${longitude - delta},${latitude + delta},${
      longitude + delta
    });
  way["name"~"govijan|agrarian|seva|fertilizer|cic|agriculture|agri|කෘෂි|ගොවි|සේවා",i]
    (${latitude - delta},${longitude - delta},${latitude + delta},${
      longitude + delta
    });
);
out center tags;
`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    const json = await res.json();

    const results: AgricultureDepartment[] = [];

    for (const [index, el] of json.elements.entries()) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;

      if (typeof lat !== "number" || typeof lon !== "number") continue;

      const tags = el.tags || {};
      const name = (tags.name || "").toLowerCase();

      // ❌ Skip banks / finance
      if (
        name.includes("bank") ||
        name.includes("finance") ||
        name.includes("insurance")
      ) {
        continue;
      }

      let officeType: string | null = null;

      if (name.includes("cic")) officeType = "CIC Office";
      else if (name.includes("research") || name.includes("පර්යේෂණ"))
        officeType = "Research Institute";
      else if (name.includes("extension") || name.includes("සහය"))
        officeType = "Extension Center";
      else if (name.includes("head")) officeType = "Head Office";
      else if (
        name.includes("agriculture") ||
        name.includes("agri") ||
        name.includes("කෘෂි")
      )
        officeType = "District Office";

      if (!officeType || !ALLOWED_TYPES.includes(officeType)) continue;

      const distKm = parseFloat(
        calculateDistance(latitude, longitude, lat, lon),
      );

      if (isNaN(distKm) || distKm > searchRadius) continue;
      const phone =
        tags.phone ||
        tags["contact:phone"] ||
        tags.mobile ||
        tags["contact:mobile"];

      results.push({
        id: `${el.id}_${index}`,
        name: tags.name || "Agriculture Office",
        type: officeType,
        category: "Live",
        lat: el.lat,
        lon: el.lon,
        address:
          tags["addr:city"] ||
          tags["addr:district"] ||
          tags["addr:full"] ||
          "Sri Lanka",
        phone,
        email: tags.email || tags["contact:email"],
        distance: distKm.toFixed(1),
      });
    }
    console.log(
      "OSM elements:",
      json.elements.length,
      "Filtered:",
      results.length,
      "Radius:",
      searchRadius,
    );

    return results;
  };

  const departmentTypes = useMemo(
    () => [
      { id: "all", label: t.allCenters },
      { id: "District Office", label: t.districtOffice },
      { id: "Head Office", label: t.headOffice },
      { id: "Research Institute", label: t.researchInstitute },
      { id: "Extension Center", label: t.extensionCenter },
      { id: "CIC Office", label: t.cicOffice },
    ],
    [t],
  );

  const ALLOWED_TYPES = [
    "District Office",
    "Head Office",
    "Research Institute",
    "Extension Center",
    "CIC Office",
  ];

  // Calculate distance
  const calculateDistance = (
    lat1: number | null,
    lon1: number | null,
    lat2: number | null,
    lon2: number | null,
  ): string => {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return "N/A";
    }

    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  const loadDepartments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const liveData = await fetchAgriOfficesFromOSM();

      const filtered =
        selectedType === "all"
          ? liveData
          : liveData.filter((d) => d.type === selectedType);

      setDepartments(filtered);

      // optional cache
      await AsyncStorage.setItem(
        "deptCache",
        JSON.stringify({ data: filtered, ts: Date.now() }),
      );
    } catch (err) {
      const cached = await AsyncStorage.getItem("deptCache");
      if (cached) {
        setDepartments(JSON.parse(cached).data);
      } else {
        setDepartments([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDepartments();
  };

  const openInMaps = (lat: number, lon: number, name: string): void => {
    const url = Platform.select({
      ios: `maps://?q=${encodeURIComponent(name)}&ll=${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${encodeURIComponent(name)}`,
      default: `https://maps.google.com/?q=${lat},${lon}`,
    });

    Linking.openURL(url ?? "").catch(() => {
      const googleUrl = `https://maps.google.com/?q=${lat},${lon}&query=${encodeURIComponent(
        name,
      )}`;
      Linking.openURL(googleUrl);
    });
  };

  const makePhoneCall = (phoneNumber?: string): void => {
    if (!phoneNumber) return;

    Alert.alert(t.callConfirm, `${phoneNumber} ${t.callConfirmSub}`, [
      { text: t.cancel, style: "cancel" },
      {
        text: t.call,
        onPress: () => Linking.openURL(`tel:${phoneNumber}`),
      },
    ]);
  };

  const openEmail = (email?: string): void => {
    if (!email) return;

    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert(t.emailError, t.emailErrorMessage);
    });
  };

  useEffect(() => {
    if (latitude && longitude) {
      loadDepartments();
    }
  }, [latitude, longitude, searchRadius, selectedType]);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d5016" />
        <Text style={styles.loadingText}>{t.locating}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FontAwesome5 name="landmark" size={24} color="#2d5016" />
        <Text style={styles.headerTitle}>{t.title}</Text>
        <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Type Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>{t.centerType}</Text>
          <FlatList
            horizontal
            data={departmentTypes}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  selectedType === item.id && styles.typeBtnActive,
                ]}
                onPress={() => setSelectedType(item.id)}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    selectedType === item.id && styles.typeBtnTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.typeList}
          />
        </View>

        {/* Radius Control */}
        <View style={styles.radiusControl}>
          <Text style={styles.controlLabel}>{t.searchRadius}</Text>
          <View style={styles.radiusButtons}>
            {[5, 10, 25, 50].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  styles.radiusBtn,
                  searchRadius === radius && styles.radiusBtnActive,
                ]}
                onPress={() => setSearchRadius(radius)}
              >
                <Text
                  style={[
                    styles.radiusBtnText,
                    searchRadius === radius && styles.radiusBtnTextActive,
                  ]}
                >
                  {radius} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2d5016" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : departments.length === 0 ? (
        <View style={styles.center}>
          <Entypo name="location" size={60} color="#9ca3af" />
          <Text style={styles.noResults}>{t.noResults}</Text>
          <Text style={styles.noResultsSub}>{t.noResultsSub}</Text>

          <TouchableOpacity style={styles.retryBtn} onPress={loadDepartments}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryBtnText}>{t.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2d5016"]}
              tintColor="#2d5016"
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.resultsCount}>
                {t.foundCenters} {departments.length}
              </Text>
              {latitude && longitude && (
                <Text style={styles.locationNote}>{t.sortedByDistance}</Text>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.departmentCard}>
              <View style={styles.deptHeader}>
                <View style={styles.deptIcon}>
                  {item.type === "Head Office" ? (
                    <FontAwesome5 name="building" size={20} color="#2d5016" />
                  ) : item.type === "Research Institute" ? (
                    <FontAwesome5 name="flask" size={20} color="#2d5016" />
                  ) : (
                    <FontAwesome5 name="landmark" size={20} color="#2d5016" />
                  )}
                </View>
                <View style={styles.deptInfo}>
                  <Text style={styles.deptName}>{item.name}</Text>
                  <View style={styles.deptMeta}>
                    <Text style={styles.deptType}>{item.type}</Text>
                    {item.distance !== "N/A" && (
                      <Text style={styles.deptDistance}>
                        • {item.distance} km
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.deptDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="place" size={14} color="#6b7280" />
                  <Text style={styles.detailText}>{item.address}</Text>
                </View>

                {item.services && (
                  <View style={styles.servicesRow}>
                    <MaterialIcons name="list" size={14} color="#6b7280" />
                    <Text style={styles.servicesText}>
                      {t.services} {item.services.join(", ")}
                    </Text>
                  </View>
                )}

                {item.hours && (
                  <View style={styles.detailRow}>
                    <MaterialIcons
                      name="access-time"
                      size={14}
                      color="#6b7280"
                    />
                    <Text style={styles.detailText}>{item.hours}</Text>
                  </View>
                )}

                <View style={styles.actionRow}>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.phoneBtn}
                      onPress={() => makePhoneCall(item.phone)}
                    >
                      <MaterialIcons name="phone" size={14} color="#fff" />
                      <Text style={styles.actionBtnText}>{t.call}</Text>
                    </TouchableOpacity>
                  )}

                  {item.email && (
                    <TouchableOpacity
                      style={styles.emailBtn}
                      onPress={() => openEmail(item.email)}
                    >
                      <MaterialIcons name="email" size={14} color="#fff" />
                      <Text style={styles.actionBtnText}>{t.email}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.directionsBtn}
                    onPress={() => openInMaps(item.lat, item.lon, item.name)}
                  >
                    <MaterialIcons name="directions" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>{t.directions}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerNote}>* {t.source}</Text>
              <Text style={styles.footerTip}>{t.tip}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d5016",
    marginTop: 10,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  controls: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  typeList: {
    paddingBottom: 4,
  },
  typeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  typeBtnActive: {
    backgroundColor: "#2d5016",
    borderColor: "#225015",
  },
  typeBtnText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  radiusControl: {
    marginTop: 8,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  radiusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radiusBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  radiusBtnActive: {
    backgroundColor: "#2d5016",
    borderColor: "#225015",
  },
  radiusBtnText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  radiusBtnTextActive: {
    color: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#4b5563",
    marginTop: 12,
    fontWeight: "500",
  },
  noResults: {
    fontSize: 20,
    color: "#4b5563",
    marginTop: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  noResultsSub: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d5016",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listHeader: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  locationNote: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  departmentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  deptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  deptIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  deptMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  deptType: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  deptDistance: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  deptDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
    flex: 1,
  },
  servicesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  servicesText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  phoneBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  emailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2d5016",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    paddingTop: 30,
    alignItems: "center",
  },
  footerNote: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 12,
  },
  footerTip: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 18,
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
});

export default AgricultureDepartmentScreen;
