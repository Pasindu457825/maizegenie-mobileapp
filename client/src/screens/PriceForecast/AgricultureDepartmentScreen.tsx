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
import { useNavigation } from "@react-navigation/native";
import useUniversalLocation from "../../utils/useUniversalLocation";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";
import { useLanguage } from "../../context/LanguageContext";

// Dynamic API URL using .env + Platform detection
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // Real Android Device → Uses .env
    return process.env.EXPO_PUBLIC_API_BASE;
  } else if (Platform.OS === "ios") {
    // iOS simulator
    return "http://localhost:8000";
  } else {
    // Expo Web fallback
    return "http://localhost:8000";
  }
};

const API_URL = getApiUrl();

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

type LanguageType = "si" | "en" | "ta";

// Translations
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
  ta: {
    locating: "உங்கள் இடத்தை கண்டறிகிறது...",
    centerType: "மைய வகை:",
    allCenters: "அனைத்தும்",
    districtOffice: "மாவட்ட அலுவலகம்",
    headOffice: "தலைமை அலுவலகம்",
    researchInstitute: "ஆராய்ச்சி நிறுவனம்",
    extensionCenter: "விரிவாக்க மையம்",
    cicOffice: "CIC அலுவலகம்",
    searchRadius: "தேடல் ஆரம்:",
    loading: "மையங்களை ஏற்றுகிறது...",
    noResults: "மையங்கள் எதுவும் கிடைக்கவில்லை",
    noResultsSub: "தயவுசெய்து தேடல் ஆரத்தை அதிகரிக்கவும்",
    retry: "மீண்டும் முயற்சிக்கவும்",
    foundCenters: "கண்டறியப்பட்ட மையங்கள்:",
    sortedByDistance:
      "உங்கள் இடத்திலிருந்து தூரத்தின் அடிப்படையில் வரிசைப்படுத்தப்பட்டது",
    services: "சேவைகள்:",
    hours: "நேரம்",
    call: "அழைப்பு",
    email: "மின்னஞ்சல்",
    directions: "வழிகாட்டுதல்",
    callConfirm: "தொலைபேசி அழைப்பு",
    callConfirmSub: "இந்த எண்ணை அழைக்கவா?",
    cancel: "ரத்து செய்",
    emailError: "பிழை",
    emailErrorMessage: "மின்னஞ்சல் பயன்பாட்டை திறக்க முடியவில்லை",
    source: "* தரவு மூலம்: இலங்கை வேளாண் திணைக்களம்",
    tip: "குறிப்பு",
    tipDescription:
      "அருகில் உள்ள வேளாண் மையத்தைக் கண்டறிந்து சேவை கிடைக்கிறதா என்று உறுதிப்படுத்த அழைக்கவும்.",
    title: "வேளாண் திணைக்களம்",
    subtitle: "இலங்கை",
  },
};

// ─── Overpass API helper ────────────────────────────────────────────────────
/** HTTP status codes that are safe to retry (transient server-side errors). */
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

/**
 * Retries a fetch on transient HTTP errors (429, 502, 503, 504) using
 * exponential back-off.  AbortError is re-thrown immediately so deliberate
 * cancellations are never retried.
 *
 * Back-off schedule (baseDelay = 2 000 ms, retries = 3):
 *   attempt 1 fail → wait 2 s → attempt 2
 *   attempt 2 fail → wait 4 s → attempt 3
 *   attempt 3 fail → wait 8 s → throw
 */
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelay = 2000,
): Promise<Response> => {
  try {
    const res = await fetch(url, options);

    if (RETRYABLE_STATUSES.has(res.status)) {
      if (retries === 0) {
        throw new Error(`Overpass API error: HTTP ${res.status}`);
      }
      // Use a longer wait for gateway errors vs. rate-limit errors
      const delay = baseDelay * Math.pow(2, 3 - retries); // 2 s → 4 s → 8 s
      await new Promise<void>((r) => setTimeout(r, delay));
      return fetchWithRetry(url, options, retries - 1, baseDelay);
    }

    return res;
  } catch (err: unknown) {
    // Never retry a deliberate cancellation
    if (err instanceof Error && err.name === "AbortError") throw err;
    if (retries === 0) throw err;
    const delay = baseDelay * Math.pow(2, 3 - retries);
    await new Promise<void>((r) => setTimeout(r, delay));
    return fetchWithRetry(url, options, retries - 1, baseDelay);
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const AgricultureDepartmentScreen = () => {
  const navigation = useNavigation();
  const { language: lang } = useLanguage();

  //  Ensure language is properly tracked
  const language: LanguageType = useMemo(() => {
    return lang === "sinhala" ? "si" : lang === "tamil" ? "ta" : "en";
  }, [lang]);

  //  Get translations based on language
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

  // ─── Request-management refs ──────────────────────────────────────────────
  /** Debounce timer — cleared on every dep change, fired after 2 s of quiet. */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** True while a network request is in flight; prevents duplicate calls. */
  const isRequestInFlightRef = useRef<boolean>(false);
  /**
   * In-memory cache keyed by `"<lat>_<lon>_<radiusKm>"`.  Stores the raw
   * (unfiltered) list so type-filter changes never need a new network call.
   */
  const requestCacheRef = useRef<Map<string, AgricultureDepartment[]>>(
    new Map(),
  );
  /** AbortController for the currently in-flight fetch — cancelled on re-try. */
  const abortControllerRef = useRef<AbortController | null>(null);
  // ─────────────────────────────────────────────────────────────────────────

  const fetchAgriOfficesFromOSM = async (
    signal: AbortSignal,
  ): Promise<AgricultureDepartment[]> => {
    if (!latitude || !longitude) return [];

    const radiusMeters = searchRadius * 1000;

    const delta = searchRadius / 111; // approx km → lat/lon

    // Scale the Overpass server-side timeout with the search area so large
    // radii (25–50 km) don't cause a 504 before the query finishes.
    const overpassTimeout = Math.min(20 + searchRadius, 90); // 25 s … 90 s

    const query = `
[out:json][timeout:${overpassTimeout}];
(
  node["name"~"govijan|agrarian|fertilizer|cic|agriculture|agri|කෘෂි|ගොවි|සේවා",i]
    (${latitude - delta},${longitude - delta},${latitude + delta},${
      longitude + delta
    });
  way["name"~"govijan|agrarian|fertilizer|cic|agriculture|agri|කෘෂි|ගොවි|සේවා",i]
    (${latitude - delta},${longitude - delta},${latitude + delta},${
      longitude + delta
    });
);
out center tags;
`;

    const res = await fetchWithRetry(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
        signal,
      },
    );

    const json = await res.json();

    const results: AgricultureDepartment[] = [];

    for (const [index, el] of json.elements.entries()) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;

      if (typeof lat !== "number" || typeof lon !== "number") continue;

      const tags = el.tags || {};
      const name = (tags.name || "").toLowerCase();

      //  Global blacklist — always skip regardless of any other matching
      const GLOBAL_BLACKLIST = [
        "bank",
        "finance",
        "insurance",
        "cicra",
        "hotel",
        "bakery",
        "restaurant",
        "guest house",
        "lodge",
        "road",
        "street",
        "mawatha",
        "campus",
        "university",
        "school",
        "college",
        "training",
        "academy",
      ];
      if (GLOBAL_BLACKLIST.some((w) => name.includes(w))) continue;

      //  Tag-based gate — must have at least one recognised official tag
      const isTaggedOfficial =
        tags.office === "government" ||
        tags.office === "agriculture" ||
        tags.shop === "agricultural" ||
        tags.shop === "fertilizer" ||
        tags.amenity === "agricultural_supplies";

      let officeType: string | null = null;

      //  CIC Office — word-boundary "cic" + whitelist to exclude CICRA and similar
      const CIC_WHITELIST = [
        "cic agri",
        "cic seeds",
        "cic fertilizer",
        "cic agribusiness",
        "cic holdings",
      ];
      const hasCicWord = /\bcic\b/.test(name);
      if (hasCicWord && CIC_WHITELIST.some((w) => name.includes(w))) {
        officeType = "CIC Office";
      }

      //  Research Institute
      if (
        !officeType &&
        (name.includes("research") || name.includes("පර්යේෂණ"))
      ) {
        officeType = "Research Institute";
      }

      //  Extension Center
      if (!officeType && (name.includes("extension") || name.includes("සහය"))) {
        officeType = "Extension Center";
      }

      //  Head Office
      if (
        !officeType &&
        (name.includes("head office") || name.includes("headquarters"))
      ) {
        officeType = "Head Office";
      }

      //  District Office — requires BOTH a matching keyword AND a recognised OSM tag
      if (!officeType) {
        const AGRI_KEYWORDS = [
          "agriculture",
          "agricultural",
          "agri",
          "agrarian",
          "fertilizer",
          "seed",
          "maize",
          "corn",
          "කෘෂි",
          "ගොවි",
          "මක",
          "govijan",
          "සේවා",
        ];
        const hasAgriKeyword = AGRI_KEYWORDS.some((w) => name.includes(w));
        if (hasAgriKeyword && isTaggedOfficial) officeType = "District Office";
      }

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

  const loadDepartments = async (forceRefresh = false): Promise<void> => {
    if (!latitude || !longitude) return;

    // ── 1. Prevent duplicate parallel requests (unless user explicitly refreshes)
    if (!forceRefresh && isRequestInFlightRef.current) return;

    // ── 2. Build a stable cache key (4 decimal places ≈ ~11 m precision)
    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}_${searchRadius}`;

    // ── 3. Serve from in-memory cache when available (skip on force-refresh)
    if (!forceRefresh && requestCacheRef.current.has(cacheKey)) {
      const cachedRaw = requestCacheRef.current.get(cacheKey)!;
      const filtered =
        selectedType === "all"
          ? cachedRaw
          : cachedRaw.filter((d) => d.type === selectedType);
      setDepartments(filtered);
      setRefreshing(false);
      return;
    }

    // ── 4. Cancel any still-running request before starting a new one
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    isRequestInFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const liveData = await fetchAgriOfficesFromOSM(
        abortControllerRef.current.signal,
      );

      // Cache the raw (unfiltered) results so type changes never re-fetch
      requestCacheRef.current.set(cacheKey, liveData);

      const filtered =
        selectedType === "all"
          ? liveData
          : liveData.filter((d) => d.type === selectedType);

      setDepartments(filtered);

      // Persist to disk as offline fallback
      await AsyncStorage.setItem(
        "deptCache",
        JSON.stringify({ data: filtered, ts: Date.now() }),
      );
    } catch (err: unknown) {
      // Silently ignore deliberate cancellations — a new request is already queued
      if (err instanceof Error && err.name === "AbortError") return;

      const diskCache = await AsyncStorage.getItem("deptCache");
      if (diskCache) {
        setDepartments(JSON.parse(diskCache).data);
      } else {
        setDepartments([]);
      }
    } finally {
      isRequestInFlightRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Pass forceRefresh=true to bypass in-memory cache and the in-flight guard
    loadDepartments(true);
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
    if (!latitude || !longitude) return;

    // Clear any previously scheduled call
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // Wait 2 s of quiet before hitting the Overpass API — this collapses rapid
    // changes to radius / type / location into a single network request.
    debounceTimerRef.current = setTimeout(() => {
      loadDepartments();
    }, 2000);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [latitude, longitude, searchRadius, selectedType]);

  if (locationLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0faa76" />
        <Text style={styles.loadingText}>{t.locating}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0faa76" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
        {/* Right spacer keeps title centred */}
        <View style={styles.backButton} />
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
          <ActivityIndicator size="large" color="#0faa76" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : departments.length === 0 ? (
        <View style={styles.center}>
          <Entypo name="location" size={60} color="#9ca3af" />
          <Text style={styles.noResults}>{t.noResults}</Text>
          <Text style={styles.noResultsSub}>{t.noResultsSub}</Text>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => loadDepartments()}
          >
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
              colors={["#0faa76"]}
              tintColor="#0faa76"
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
                    <FontAwesome5 name="building" size={20} color="#0faa76" />
                  ) : item.type === "Research Institute" ? (
                    <FontAwesome5 name="flask" size={20} color="#0faa76" />
                  ) : (
                    <FontAwesome5 name="landmark" size={20} color="#0faa76" />
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0faa76",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
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
    backgroundColor: "#10B981",
    borderColor: "#0faa76",
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
    backgroundColor: "#10B981",
    borderColor: "#0faa76",
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
    backgroundColor: "#10B981",
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
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d1fae5",
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
    color: "#10B981",
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
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0faa76",
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default AgricultureDepartmentScreen;
