import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import {
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Database,
  MapPin,
  ChevronDown,
  Edit2,
  Trash2,
  Calendar,
  X,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useLanguage } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";

const DISTRICTS = ["Anuradhapura", "Monaragala", "Tissamaharama"];

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

type Language = "sinhala" | "english" | "tamil";

const AdminPanelScreen = () => {
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();

  const [saving, setSaving] = useState(false);

  // Refs for auto-scrolling to error fields
  const scrollViewRef = useRef<ScrollView | null>(null);
  const priceFieldRef = useRef<View | null>(null);
  const fuelPriceFieldRef = useRef<View | null>(null);
  const taxFieldRef = useRef<View | null>(null);
  const editPriceFieldRef = useRef<View | null>(null);
  const editFuelPriceFieldRef = useRef<View | null>(null);
  const editTaxFieldRef = useRef<View | null>(null);

  // Auto-calculate current and previous week
  const [currentYear, setCurrentYear] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [previousYear, setPreviousYear] = useState("");
  const [previousWeek, setPreviousWeek] = useState("");

  // ── District-wise price fields ──────────────────────────────────────────────
  const [histDistrict, setHistDistrict] = useState("Anuradhapura");
  const [histYear, setHistYear] = useState("");
  const [histWeek, setHistWeek] = useState("");
  const [histPrice, setHistPrice] = useState("");
  const [histFuelPrice, setHistFuelPrice] = useState("");
  const [histImportTax, setHistImportTax] = useState("");
  const [histSaving, setHistSaving] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // Price History & Edit Feature
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    year: "",
    week: "",
    price: "",
    fuel_price: "",
    import_tax: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Validation state for input fields
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [editValidationErrors, setEditValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Handle auto-scroll to error fields in add form
  const scrollToErrorField = (errors: { [key: string]: string }) => {
    if (!scrollViewRef.current) return;

    // Simple scroll to top to show form fields
    scrollViewRef.current.scrollTo({
      y: 0,
      animated: true,
    });
  };

  // Handle auto-scroll to error fields in edit modal
  const scrollToEditErrorField = (errors: { [key: string]: string }) => {
    if (!scrollViewRef.current) return;

    // Simple scroll to top to show form fields
    scrollViewRef.current.scrollTo({
      y: 0,
      animated: true,
    });
  };

  // Calculate ISO week number
  const getISOWeek = (date: Date): number => {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
    return 1 + Math.ceil(dayDiff / 7);
  };

  // Validation functions
  const validatePrice = (value: string, lang: Language = "english"): string => {
    if (!value || value.trim() === "") {
      return language === "sinhala"
        ? "මිල ඇතුළත් කිරීම අවශ්‍යයි"
        : language === "tamil"
          ? "விலை தேவை"
          : "Price is required";
    }
    const price = parseFloat(value);
    if (isNaN(price)) {
      return language === "sinhala"
        ? "අංක පමණක් භාවිතා කළ හැක."
        : language === "tamil"
          ? "எண்களை மட்டும் உள்ளிடவும்"
          : "Only numbers allowed";
    }
    if (price <= 0) {
      return language === "sinhala"
        ? "මිල 0 ට වැඩි විය යුතුය"
        : language === "tamil"
          ? "விலை 0-ஐ விட அதிகமாக இருக்க வேண்டும்"
          : "Price must be greater than 0";
    }
    if (price > 50000) {
      return language === "sinhala"
        ? "මිල ඉතා ඉහළ ය (උපරිම: 1000)"
        : language === "tamil"
          ? "விலை மிக அதிகமாக உள்ளது (அதிகபட்சம்: 1000)"
          : "Price is too high (Max: 1000)";
    }
    return "";
  };

  const validateFuelPrice = (value: string): string => {
    if (!value || value.trim() === "") {
      return language === "sinhala"
        ? "ඉන්ධන මිල අවශ්‍ය ය"
        : language === "tamil"
          ? "எரிபொருள் விலை தேவை"
          : "Fuel price is required";
    }
    const fuel = parseFloat(value);
    if (isNaN(fuel)) {
      return language === "sinhala"
        ? "සංඛ්‍යා පමණක් භාවිතා කළ හැක"
        : language === "tamil"
          ? "எண்கள் மட்டுமே அனுமதி"
          : "Only numbers allowed";
    }
    if (fuel <= 0) {
      return language === "sinhala"
        ? "ඉන්ධන මිල 0 ට වැඩි විය යුතුය"
        : language === "tamil"
          ? "எரிபொருள் விலை 0 ஐ விட அதிகமாக இருக்க வேண்டும்"
          : "Fuel price must be greater than 0";
    }
    if (fuel > 50000) {
      return language === "sinhala"
        ? "ඉන්ධන මිල ඉතා ඉහළ ය"
        : language === "tamil"
          ? "எரிபொருள் விலை மிக அதிகமாக உள்ளது"
          : "Fuel price is too high";
    }
    return "";
  };

  const validateTax = (value: string): string => {
    if (!value || value.trim() === "") {
      return language === "sinhala"
        ? "බදු අවශ්‍ය ය"
        : language === "tamil"
          ? "வரி தேவை"
          : "Tax is required";
    }
    const tax = parseFloat(value);
    if (isNaN(tax)) {
      return language === "sinhala"
        ? "සංඛ්‍යා පමණක් භාවිතා කළ හැක"
        : language === "tamil"
          ? "எண்கள் மட்டுமே அனுமதி"
          : "Only numbers allowed";
    }
    if (tax < 0) {
      return language === "sinhala"
        ? "බදු සෘණ විය නොහැක"
        : language === "tamil"
          ? "வரி எதிர்மறையாக இருக்க முடியாது"
          : "Tax cannot be negative";
    }
    if (tax > 100) {
      return language === "sinhala"
        ? "බදු 100% ට වැඩි නොවිය යුතුය"
        : language === "tamil"
          ? "வரி 100% ஐ விட அதிகமாக இருக்க முடியாது"
          : "Tax cannot exceed 100%";
    }
    return "";
  };

  const validateWeek = (value: string): string => {
    if (!value || value.trim() === "") return "";
    const week = parseInt(value, 10);
    if (isNaN(week)) {
      return language === "sinhala"
        ? "සංඛ්‍යා පමණක් භාවිතා කළ හැක."
        : language === "tamil"
          ? "எண்கள் மட்டுமே அனுமதி"
          : "Only numbers allowed";
    }
    if (week < 1 || week > 52) {
      return language === "sinhala"
        ? "සතිය 1-52 අතර විය යුතුය"
        : language === "tamil"
          ? "வாரம் 1-52 இடையே இருக்க வேண்டும்"
          : "Week must be between 1-52";
    }
    return "";
  };

  // Update validation errors for add form
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    errors["price"] = validatePrice(histPrice);
    errors["fuel_price"] = validateFuelPrice(histFuelPrice);
    errors["tax"] = validateTax(histImportTax);
    setValidationErrors(
      Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== "")),
    );
  }, [histPrice, histFuelPrice, histImportTax]);

  // Update validation errors for edit form
  useEffect(() => {
    const errors: { [key: string]: string } = {};
    errors["price"] = validatePrice(editFormData.price);
    errors["fuel_price"] = validateFuelPrice(editFormData.fuel_price);
    errors["tax"] = validateTax(editFormData.import_tax);
    errors["week"] = validateWeek(editFormData.week);
    setEditValidationErrors(
      Object.fromEntries(Object.entries(errors).filter(([_, v]) => v !== "")),
    );
  }, [editFormData]);

  // Initialize current week and previous week on component mount
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = getISOWeek(now);

    setCurrentYear(year.toString());
    setCurrentWeek(week.toString());

    // Calculate previous week
    let prevWeek = week - 1;
    let prevYear = year;

    if (week === 1) {
      prevWeek = 52;
      prevYear = year - 1;
    }

    setPreviousYear(prevYear.toString());
    setPreviousWeek(prevWeek.toString());

    // Auto-fill form with PREVIOUS week (for entering previous week prices)
    setHistYear(prevYear.toString());
    setHistWeek(prevWeek.toString());
  }, []);

  // all prices are district-specific

  const handleAddHistoricalPrice = async () => {
    // Validate all fields
    const priceError = validatePrice(histPrice);
    const fuelError = validateFuelPrice(histFuelPrice);
    const taxError = validateTax(histImportTax);

    if (priceError || fuelError || taxError) {
      const errors: { [key: string]: string } = {};
      if (priceError) errors["price"] = priceError;
      if (fuelError) errors["fuel_price"] = fuelError;
      if (taxError) errors["tax"] = taxError;
      setValidationErrors(errors);

      // Scroll to the first error field
      scrollToErrorField(errors);

      const errorMessage = Object.values(errors).join("\n");
      Alert.alert(
        language === "sinhala"
          ? "අවලංගු ඇතුල්කිරිමකි."
          : language === "tamil"
            ? "தவறான உள்ளீடு"
            : "Invalid Input",
        errorMessage,
      );
      return;
    }

    if (!histDistrict) {
      Alert.alert(
        language === "sinhala"
          ? "අවශ්‍යයි"
          : language === "tamil"
            ? "தேவை"
            : "Required",
        language === "sinhala"
          ? "කරුණාකර දිස්ත්‍රික්කය තෝරන්න"
          : language === "tamil"
            ? "மாவட்டத்தைத் தேர்ந்தெடுக்கவும்"
            : "Please select a district",
      );
      return;
    }

    const yearNum = parseInt(histYear, 10);
    const weekNum = parseInt(histWeek, 10);
    const priceNum = parseFloat(histPrice);
    const fuelNum = parseFloat(histFuelPrice);
    const taxNum = parseFloat(histImportTax);

    // Validation: All fields are required
    if (
      !histDistrict ||
      !Number.isFinite(yearNum) ||
      !Number.isFinite(weekNum) ||
      weekNum < 1 ||
      weekNum > 52 ||
      !Number.isFinite(priceNum) ||
      priceNum <= 0 ||
      !Number.isFinite(fuelNum) ||
      fuelNum <= 0 ||
      !Number.isFinite(taxNum) ||
      taxNum < 0
    ) {
      Alert.alert(
        language === "sinhala"
          ? "අවශ්‍යයි"
          : language === "tamil"
            ? "தேவை"
            : "Required",
        content[language].histFillAll,
      );
      return;
    }

    setHistSaving(true);
    try {
      // Check if record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("maize_prices")
        .select("id")
        .eq("year", yearNum)
        .eq("week", weekNum)
        .eq("district", histDistrict)
        .single();

      // If record exists, show a message and don't allow duplicate
      if (existingRecord && !checkError) {
        setHistSaving(false);
        const errorMsg =
          language === "sinhala"
            ? "මෙම වසර, දිස්ත්‍රික්කය සහ සතිය සඳහා දත්ත දැනටමත් පද්ධතියට ඇතුළත් කර ඇත."
            : language === "tamil"
              ? "நீங்கள் ஆண்டு, மாவட்டம் மற்றும் வாரம் ஆகியவற்றை ஏற்கனவே சமர්ப்பித்துவிட்டீர்கள்."
              : "You already submitted this year, district, and week.";
        console.warn("[Duplicate Record]", errorMsg);
        // Show error message as validation error for web compatibility
        Alert.alert(
          language === "sinhala"
            ? "දැනටමත් ඉදිරිපත් කර ඇත."
            : language === "tamil"
              ? "ஏற்கனவே சமர்ப்பித்தீர்கள்"
              : "Already Submitted",
          errorMsg,
        );
        return;
      }

      // Save the new record
      const { error } = await supabase.from("maize_prices").insert({
        year: yearNum,
        week: weekNum,
        district: histDistrict,
        price: priceNum,
        fuel_price: fuelNum,
        import_tax: taxNum,
        source: "officer_input",
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Show success message
      const successTitle =
        language === "sinhala"
          ? "සාර්තකයි ✓"
          : language === "tamil"
            ? "வெற்றி ✓"
            : "Success ✓";

      const successMessage =
        language === "sinhala"
          ? "නව මිල වාර්තාව සුරකින ලදී! (වර්ෂය: " +
            yearNum +
            ", සතිය: " +
            weekNum +
            ")"
          : language === "tamil"
            ? "புதிய விலை பதிவு சேமிக்கப்பட்டது! (வருடம்: " +
              yearNum +
              ", வாரம்: " +
              weekNum +
              ")"
            : "New price record saved! (Year: " +
              yearNum +
              ", Week: " +
              weekNum +
              ")";

      Alert.alert(successTitle, successMessage);

      // Clear form
      setHistPrice("");
      setHistFuelPrice("");
      setHistImportTax("");
      setValidationErrors({});

      // Form fields are kept filled for convenient re-entry with small changes
    } catch (err: any) {
      console.error("[maize_prices] insert error:", err);
      Alert.alert(
        language === "sinhala"
          ? "දෝෂයක් සිදුවී ඇත"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        content[language].histError,
      );
    } finally {
      setHistSaving(false);
      fetchPriceHistory(histDistrict); // Refresh history after save
    }
  };

  // Fetch price history for display (latest 3 records per district)
  const fetchPriceHistory = async (district: string) => {
    if (!district) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("maize_prices")
        .select("*")
        .eq("district", district)
        .order("year", { ascending: false })
        .order("week", { ascending: false })
        .limit(3);

      if (error) throw error;
      setPriceHistory(data || []);
    } catch (err: any) {
      console.error("Error fetching price history:", err);
      setPriceHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open edit modal with record data
  const handleEditPrice = (record: any) => {
    setEditingRecord(record);
    setEditFormData({
      year: record.year?.toString() || "",
      week: record.week?.toString() || "",
      price: record.price?.toString() || "",
      fuel_price: record.fuel_price?.toString() || "",
      import_tax: record.import_tax?.toString() || "",
    });
    setShowEditModal(true);
  };

  // Update existing price record
  const handleUpdatePrice = async () => {
    // Validate all fields
    const priceError = validatePrice(editFormData.price);
    const fuelError = validateFuelPrice(editFormData.fuel_price);
    const taxError = validateTax(editFormData.import_tax);
    const weekError = validateWeek(editFormData.week);

    if (priceError || fuelError || taxError || weekError) {
      const errors: { [key: string]: string } = {};
      if (priceError) errors["price"] = priceError;
      if (fuelError) errors["fuel_price"] = fuelError;
      if (taxError) errors["tax"] = taxError;
      if (weekError) errors["week"] = weekError;
      setEditValidationErrors(errors);

      // Scroll to the first error field in edit modal
      scrollToEditErrorField(errors);

      const errorMessage = Object.values(errors).join("\n");
      Alert.alert(
        language === "sinhala"
          ? "අවලංගු ඇතුල්කිරීමකි."
          : language === "tamil"
            ? "தவறான உள்ளீடு"
            : "Invalid Input",
        errorMessage,
      );
      return;
    }

    if (
      !editingRecord ||
      !editFormData.year ||
      !editFormData.week ||
      !editFormData.price
    ) {
      Alert.alert(
        language === "sinhala"
          ? "අවශ්‍යයි"
          : language === "tamil"
            ? "தேவை"
            : "Required",
        content[language].histFillAll,
      );
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.from("maize_prices").upsert(
        {
          year: parseInt(editFormData.year, 10),
          week: parseInt(editFormData.week, 10),
          district: histDistrict,
          price: parseFloat(editFormData.price),
          fuel_price: parseFloat(editFormData.fuel_price) || 0,
          import_tax: parseFloat(editFormData.import_tax) || 0,
          source: "officer_input",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "year,week,district" },
      );

      if (error) throw error;

      const successTitle =
        language === "sinhala"
          ? "සාර්තකයි ✓"
          : language === "tamil"
            ? "வெற்றி ✓"
            : "Success ✓";

      const successMessage =
        language === "sinhala"
          ? "මිල වාර්තාව යාවත්කාලීන කරන ලදී!"
          : language === "tamil"
            ? "விலை பதிவு புதுப்பிக்கப்பட்டது!"
            : "Price record updated successfully!";

      Alert.alert(successTitle, successMessage);
      setShowEditModal(false);
      setEditValidationErrors({});
      fetchPriceHistory(histDistrict); // Refresh history
    } catch (err: any) {
      console.error("[maize_prices] update error:", err);
      Alert.alert(
        language === "sinhala"
          ? "දෝෂයකි"
          : language === "tamil"
            ? "பிழை"
            : "Error",
        content[language].histError,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete price record
  const handleDeletePrice = (record: any) => {
    Alert.alert(
      language === "sinhala"
        ? "මකා දමන්න?"
        : language === "tamil"
          ? "நீக்குறீர்களா?"
          : "Delete?",
      `${record.year} - Week ${record.week}`,
      [
        {
          text:
            language === "sinhala"
              ? "අවලංගු"
              : language === "tamil"
                ? "ரத்து"
                : "Cancel",
          onPress: () => {},
        },
        {
          text:
            language === "sinhala"
              ? "මකා දමන්න"
              : language === "tamil"
                ? "நீக்கு"
                : "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("maize_prices")
                .delete()
                .eq("district", record.district)
                .eq("year", record.year)
                .eq("week", record.week);

              if (error) throw error;
              Alert.alert(
                language === "sinhala"
                  ? "සාර්තකයි ✓"
                  : language === "tamil"
                    ? "வெற்றி ✓"
                    : "Success ✓",
                language === "sinhala"
                  ? "මිල ඉවත් කරන ලදී"
                  : language === "tamil"
                    ? "விலை நீக்கப்பட்டது"
                    : "Price deleted",
              );
              fetchPriceHistory(histDistrict);
            } catch (err: any) {
              console.error("Delete error:", err);
              Alert.alert("Error", "Failed to delete price");
            }
          },
        },
      ],
    );
  };

  // Load price history when district changes
  useEffect(() => {
    fetchPriceHistory(histDistrict);
  }, [histDistrict]);

  // No need to use API for global prices anymore - all prices are district-specific
  const getApiUrl = () => {
    if (Platform.OS === "android") {
      return process.env.EXPO_PUBLIC_API_BASE;
    } else if (Platform.OS === "ios") {
      return "http://localhost:8000";
    } else {
      return "http://localhost:8000";
    }
  };

  const API_URL = getApiUrl();

  // Changed language type keys from "si"/"en" to "sinhala"/"english"
  const content = {
    sinhala: {
      title: "මිල යාවත්කාලීන කිරීම",
      subtitle: "🌽 MaizeGenie",
      welcome: "ස්වාගතයි",
      description: "දිස්ත්‍රික්ක අනුව මිල සහ බද්ද ඇතුළත් කරන්න",
      back: "ආපසු යන්න",
      saving: "සුරකිමින්...",
      // Historical price section
      histTitle: "පෙර සතියේ මිල",
      histDesc: "දිස්ත්‍රික්කයට අනුව මිල, ඉන්ධන සහ බද්ද ඇතුළත් කරන්න",
      histDistrict: "දිස්ත්‍රික්කය",
      histYear: "වර්ෂය",
      histWeek: "සතිය (ISO)",
      histPrice: "මිල (රු/කිලෝ)",
      histFuelPrice: "ඉන්ධන මිල (රු/ලීටර)",
      histImportTax: "ආනයන බද්ද (%)",
      histSave: "මිල සුරකින්න",
      histSaving: "සුරකිමින්...",
      histSuccess: "මිල, ඉන්ධන සහ බද්ද සාර්ථකව සුරකින ලදී!",
      histError: "දත්ත සුරැකීමේදී දෝෂයක් ඇතිවිය",
      histFillAll: "කරුණාකර සියලු තොරතුරු නිවැරදිව පුරවන්න",
      histDuplicate: "මෙම සතිය සඳහා මිල දැනටමත් ඇත. නිවැරදි කරන ලදී.",
      selectDistrict: "දිස්ත්‍රික්කය තෝරන්න",
      historyTitle: "මිල ඉතිහාසය",
      historyDesc: "පෙර ඇතුළු කිරීම නරඹන්න සහ සංස්කරණය කරන්න",
      noHistory: "කිසිදු මිල ඇතුළු කිරීම නොමැත",
      edit: "සංස්කරණය",
      delete: "මකා දมන්න",
      update: "යාවත්කාලීන කරන්න",
      editHistory: "මිල සංස්කරණය",
      autoWeekInfo: "📅 පෙර සතිය ස්වයංක්‍රීය ලෙස පුරවා ඇත (වත්මන් සතිය:",
    },
    english: {
      title: "Price Update",
      subtitle: "🌽 MaizeGenie",
      welcome: "Welcome",
      description: "Record district-wise maize prices with fuel and tax data",
      back: "Go Back",
      // Historical price section
      histTitle: "Previous Week Price",
      histDesc:
        "Record district-wise prices along with fuel price and import tax",
      histDistrict: "District",
      histYear: "Year",
      histWeek: "Week (ISO)",
      histPrice: "Maize Price (Rs/kg)",
      histFuelPrice: "Fuel Price (Rs/liter)",
      histImportTax: "Import Tax (%)",
      histSave: "Save Price Data",
      histSaving: "Saving...",
      histSuccess: "Price data saved successfully!",
      histError: "Error saving price data",
      histFillAll: "Please fill all fields correctly",
      histDuplicate: "Price for this week already existed. Updated.",
      selectDistrict: "Select District",
      historyTitle: "Price History",
      historyDesc: "View and edit previously entered records",
      noHistory: "No price entries yet",
      edit: "Edit",
      delete: "Delete",
      update: "Update Price",
      editHistory: "Edit Price",
      autoWeekInfo: "📅 Previous week is auto-filled (Current week:",
    },
    tamil: {
      title: "விலை பதிவேற்றம்",
      subtitle: "🌽 MaizeGenie",
      welcome: "வரவேற்கிறோம்",
      description:
        "மாவட்ட அடிப்படையில் விலை, எரிபொருள் மற்றும் வரியை பதிவிடுங்கள்",
      back: "பின்னோக்கிச் செல்",
      saving: "சேமிக்கிறது...",
      // Historical price section
      histTitle: "முந்தைய வார விலை",
      histDesc: "மாவட்டவாரியாக விலை, எரிபொருள் மற்றும் வரியை பதிவிடுங்கள்",
      histDistrict: "மாவட்டம்",
      histYear: "ஆண்டு",
      histWeek: "வாரம் (ISO)",
      histPrice: "மக்காச்சோளம் விலை (ரூ/கிலோ)",
      histFuelPrice: "எரிபொருள் விலை (ரூ/லிட்டர்)",
      histImportTax: "இறக்குமதி வரி (%)",
      histSave: "விலை தரவை சேமி",
      histSaving: "சேமிக்கிறது...",
      histSuccess: "விலை தரவு வெற்றிகரமாக சேமிக்கப்பட்டது!",
      histError: "விலை தரவை சேமிக்கும்போது பிழை",
      histFillAll: "அனைத்து தகவல்களையும் சரியாக நிரப்பவும்",
      selectDistrict: "மாவட்டத்தை தேர்ந்தெடுக்கவும்",
      historyTitle: "விலை வரலாறு",
      historyDesc: "முந்தைய பதிவுகளை பார்வையிட்டு திருத்துங்கள்",
      noHistory: "இதுவரை விலை உள்ளீடு இல்லை",
      edit: "திருத்து",
      delete: "நீக்கு",
      update: "விலை புதுப்பிக்கவும்",
      editHistory: "விலை திருத்தம்",
      autoWeekInfo:
        "📅 முந்தைய வாரம் தானாக நிரப்பப்பட்டுள்ளது (தற்போதைய வாரம்:",
    },
  };

  // No need to fetch global prices anymore - all prices are district-specific

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft color="#059669" size={20} />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerSubtitle}>
                {content[language].subtitle}
              </Text>
              <Text style={styles.headerTitle}>{content[language].title}</Text>
            </View>

            <View style={styles.iconBadge}>
              <Sparkles size={18} color="#059669" />
            </View>
          </View>
        </View>

        <Text style={styles.headerDescription}>
          {content[language].description}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <>
          {/* ── District-wise Price Entry ────────────────────────────────── */}
          <View style={[styles.inputCard, styles.histCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLabelRow}>
                <View style={[styles.iconWrapper, styles.iconWrapperBlue]}>
                  <Database color="#3B82F6" size={24} />
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.cardLabel}>
                    {content[language].histTitle}
                  </Text>
                  <Text style={styles.cardSubLabel}>
                    {content[language].histDesc}
                  </Text>
                </View>
              </View>
            </View>

            {/* District selector */}
            <Text style={styles.histFieldLabel}>
              {content[language].histDistrict}
            </Text>
            <TouchableOpacity
              style={styles.districtSelector}
              onPress={() => setShowDistrictPicker(true)}
            >
              <MapPin color="#3B82F6" size={16} />
              <Text style={styles.districtSelectorText}>{histDistrict}</Text>
              <ChevronDown color="#64748B" size={16} />
            </TouchableOpacity>

            {/* Year + Week row (auto-calculated) */}
            <View style={styles.histRow}>
              <View style={styles.histHalf}>
                <Text style={styles.histFieldLabel}>
                  {content[language].histYear}
                </Text>
                <View style={[styles.histInputWrapper, styles.readOnlyWrapper]}>
                  <Text style={styles.readOnlyText}>{histYear}</Text>
                </View>
              </View>
              <View style={styles.histHalf}>
                <Text style={styles.histFieldLabel}>
                  {content[language].histWeek}
                </Text>
                <View style={[styles.histInputWrapper, styles.readOnlyWrapper]}>
                  <Text style={styles.readOnlyText}>{histWeek}</Text>
                </View>
              </View>
            </View>

            {/* Info: These are auto-calculated */}
            <Text style={styles.infoText}>
              {content[language].autoWeekInfo} {currentWeek})
            </Text>

            {/* Price input */}
            <Text style={styles.histFieldLabel}>
              {content[language].histPrice}
            </Text>
            <View ref={priceFieldRef}>
              <View
                style={[
                  styles.inputWrapper,
                  validationErrors["price"] && styles.inputWrapperError,
                ]}
              >
                <Text style={styles.currencySymbol}>රු</Text>
                <TextInput
                  style={styles.input}
                  placeholder="115.00"
                  value={histPrice}
                  onChangeText={setHistPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {validationErrors["price"] && (
                <Text style={styles.errorText}>
                  {validationErrors["price"]}
                </Text>
              )}
            </View>

            {/* Fuel Price + Import Tax row */}
            <View style={styles.histRow}>
              <View style={styles.histHalf}>
                <Text style={styles.histFieldLabel}>
                  {content[language].histFuelPrice}
                </Text>
                <View ref={fuelPriceFieldRef}>
                  <View
                    style={[
                      styles.histInputWrapper,
                      validationErrors["fuel_price"] &&
                        styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.histInput}
                      value={histFuelPrice}
                      onChangeText={setHistFuelPrice}
                      keyboardType="decimal-pad"
                      placeholder="380.00"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {validationErrors["fuel_price"] && (
                    <Text style={styles.errorText}>
                      {validationErrors["fuel_price"]}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.histHalf}>
                <Text style={styles.histFieldLabel}>
                  {content[language].histImportTax}
                </Text>
                <View ref={taxFieldRef}>
                  <View
                    style={[
                      styles.histInputWrapper,
                      validationErrors["tax"] && styles.inputWrapperError,
                    ]}
                  >
                    <TextInput
                      style={styles.histInput}
                      value={histImportTax}
                      onChangeText={setHistImportTax}
                      keyboardType="decimal-pad"
                      maxLength={5}
                      placeholder="25.00"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {validationErrors["tax"] && (
                    <Text style={styles.errorText}>
                      {validationErrors["tax"]}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Save historical price button */}
            <TouchableOpacity
              style={[
                styles.histSaveButton,
                histSaving && styles.buttonDisabled,
              ]}
              onPress={handleAddHistoricalPrice}
              disabled={histSaving}
            >
              {histSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Database color="#FFFFFF" size={18} />
              )}
              <Text style={styles.saveButtonText}>
                {histSaving
                  ? content[language].histSaving
                  : content[language].histSave}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price History Section */}
          <View style={[styles.inputCard, styles.historyCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLabelRow}>
                <View style={[styles.iconWrapper, styles.iconWrapperGreen]}>
                  <Calendar color="#059669" size={24} />
                </View>
                <View style={styles.labelContainer}>
                  <Text style={styles.cardLabel}>
                    {content[language].historyTitle}
                  </Text>
                  <Text style={styles.cardSubLabel}>
                    {content[language].historyDesc}
                  </Text>
                </View>
              </View>
            </View>

            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#059669" size="large" />
                <Text style={styles.loadingText}>Loading history...</Text>
              </View>
            ) : priceHistory.length === 0 ? (
              <Text style={styles.noHistoryText}>
                {content[language].noHistory}
              </Text>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={priceHistory}
                keyExtractor={(item) => `${item.year}-${item.week}`}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <Text style={styles.historyItemDate}>
                        {item.year} - Week {item.week}
                      </Text>
                      <View style={styles.historyItemPrices}>
                        <Text style={styles.historyItemPrice}>
                          Rs. {parseFloat(item.price).toFixed(2)}/kg
                        </Text>
                        <Text style={styles.historyItemSubPrice}>
                          Fuel: Rs.{" "}
                          {parseFloat(item.fuel_price || 0).toFixed(2)} | Tax:{" "}
                          {parseFloat(item.import_tax || 0).toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.historyItemActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditPrice(item)}
                      >
                        <Edit2 color="#FFFFFF" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeletePrice(item)}
                      >
                        <Trash2 color="#FFFFFF" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* District Picker Modal */}
          <Modal
            visible={showDistrictPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDistrictPicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDistrictPicker(false)}
            >
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>
                  {content[language].selectDistrict}
                </Text>
                <FlatList
                  data={DISTRICTS}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.districtOption,
                        item === histDistrict && styles.districtOptionSelected,
                      ]}
                      onPress={() => {
                        setHistDistrict(item);
                        setShowDistrictPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.districtOptionText,
                          item === histDistrict &&
                            styles.districtOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {item === histDistrict && (
                        <CheckCircle color="#059669" size={18} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Edit Price Modal */}
          <Modal
            visible={showEditModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.editModalOverlay}>
              <View style={styles.editModalContent}>
                {/* Header */}
                <View style={styles.editModalHeader}>
                  <Text style={styles.editModalTitle}>
                    {content[language].editHistory}
                  </Text>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <X color="#64748B" size={24} />
                  </TouchableOpacity>
                </View>

                {/* Edit Form */}
                <ScrollView
                  style={styles.editModalForm}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Year */}
                  <View style={styles.editFormGroup}>
                    <Text style={styles.editFormLabel}>
                      {content[language].histYear}
                    </Text>
                    <TextInput
                      style={styles.editFormInput}
                      value={editFormData.year}
                      onChangeText={(text) =>
                        setEditFormData({ ...editFormData, year: text })
                      }
                      keyboardType="number-pad"
                      maxLength={4}
                      editable={false}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Week */}
                  <View style={styles.editFormGroup}>
                    <Text style={styles.editFormLabel}>
                      {content[language].histWeek}
                    </Text>
                    <TextInput
                      style={styles.editFormInput}
                      value={editFormData.week}
                      onChangeText={(text) =>
                        setEditFormData({ ...editFormData, week: text })
                      }
                      keyboardType="number-pad"
                      maxLength={2}
                      editable={false}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>

                  {/* Price */}
                  <View ref={editPriceFieldRef} style={styles.editFormGroup}>
                    <Text style={styles.editFormLabel}>
                      {content[language].histPrice}
                    </Text>
                    <TextInput
                      style={[
                        styles.editFormInput,
                        editValidationErrors["price"] &&
                          styles.editFormInputError,
                      ]}
                      value={editFormData.price}
                      onChangeText={(text) =>
                        setEditFormData({ ...editFormData, price: text })
                      }
                      keyboardType="decimal-pad"
                      placeholder="115.00"
                      placeholderTextColor="#9CA3AF"
                    />
                    {editValidationErrors["price"] && (
                      <Text style={styles.errorText}>
                        {editValidationErrors["price"]}
                      </Text>
                    )}
                  </View>

                  {/* Fuel Price */}
                  <View
                    ref={editFuelPriceFieldRef}
                    style={styles.editFormGroup}
                  >
                    <Text style={styles.editFormLabel}>
                      {content[language].histFuelPrice}
                    </Text>
                    <TextInput
                      style={[
                        styles.editFormInput,
                        editValidationErrors["fuel_price"] &&
                          styles.editFormInputError,
                      ]}
                      value={editFormData.fuel_price}
                      onChangeText={(text) =>
                        setEditFormData({ ...editFormData, fuel_price: text })
                      }
                      keyboardType="decimal-pad"
                      placeholder="380.00"
                      placeholderTextColor="#9CA3AF"
                    />
                    {editValidationErrors["fuel_price"] && (
                      <Text style={styles.errorText}>
                        {editValidationErrors["fuel_price"]}
                      </Text>
                    )}
                  </View>

                  {/* Import Tax */}
                  <View ref={editTaxFieldRef} style={styles.editFormGroup}>
                    <Text style={styles.editFormLabel}>
                      {content[language].histImportTax}
                    </Text>
                    <TextInput
                      style={[
                        styles.editFormInput,
                        editValidationErrors["tax"] &&
                          styles.editFormInputError,
                      ]}
                      value={editFormData.import_tax}
                      onChangeText={(text) =>
                        setEditFormData({ ...editFormData, import_tax: text })
                      }
                      keyboardType="decimal-pad"
                      placeholder="25.00"
                      placeholderTextColor="#9CA3AF"
                    />
                    {editValidationErrors["tax"] && (
                      <Text style={styles.errorText}>
                        {editValidationErrors["tax"]}
                      </Text>
                    )}
                  </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.editModalActions}>
                  <TouchableOpacity
                    style={[
                      styles.editModalButton,
                      styles.editModalCancelButton,
                    ]}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.editModalCancelText}>
                      {language === "sinhala"
                        ? "අවලංගු"
                        : language === "tamil"
                          ? "ரத்து"
                          : "Cancel"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.editModalButton,
                      styles.editModalSaveButton,
                      isUpdating && styles.buttonDisabled,
                    ]}
                    onPress={handleUpdatePrice}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.editModalSaveText}>
                        {content[language].update}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  langButton: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  langText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 1,
  },
  headerDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginTop: 12,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  updateBanner: {
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
  },
  noDataBanner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    justifyContent: "center",
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  updateTextContainer: {
    flex: 1,
  },
  updateLabel: {
    fontSize: 11,
    color: "#047857",
    marginBottom: 2,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  updateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  noDataText: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "600",
    textAlign: "center",
  },
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperGreen: {
    backgroundColor: "#D1FAE5",
  },
  iconWrapperPurple: {
    backgroundColor: "#EDE9FE",
  },
  iconWrapperEmerald: {
    backgroundColor: "#D1FAE5",
  },
  labelContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  cardSubLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
    marginRight: 8,
  },
  percentSymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 16,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    height: 20,
  },
  // ── Historical price card ────────────────────────────
  histCard: {
    borderColor: "#DBEAFE",
    borderWidth: 1.5,
  },
  iconWrapperBlue: {
    backgroundColor: "#DBEAFE",
  },
  histFieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 14,
  },
  districtSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  districtSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  histRow: {
    flexDirection: "row",
    gap: 12,
  },
  histHalf: {
    flex: 1,
  },
  histInputWrapper: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  histInput: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    paddingVertical: 14,
  },
  readOnlyWrapper: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
    justifyContent: "center",
  },
  readOnlyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#059669",
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  infoText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
    marginTop: 8,
    paddingHorizontal: 4,
    fontStyle: "italic",
  },
  histSaveButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // ── District picker modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  districtOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  districtOptionSelected: {
    backgroundColor: "#D1FAE5",
  },
  districtOptionText: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  districtOptionTextSelected: {
    color: "#065F46",
    fontWeight: "700",
  },
  // ── Price History Styles ───────────────────────
  historyCard: {
    borderColor: "#D1FAE5",
    borderWidth: 1.5,
  },
  noHistoryText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    paddingVertical: 24,
    fontStyle: "italic",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  historyItemPrices: {
    gap: 2,
  },
  historyItemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#059669",
  },
  historyItemSubPrice: {
    fontSize: 12,
    color: "#64748B",
  },
  historyItemActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3B82F6",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  // ── Edit Modal Styles ───────
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  editModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  editModalForm: {
    marginBottom: 20,
  },
  editFormGroup: {
    marginBottom: 16,
  },
  editFormLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  editFormInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  editFormInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
  editModalActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 16,
  },
  editModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  editModalCancelButton: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  editModalCancelText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  editModalSaveButton: {
    backgroundColor: "#059669",
  },
  editModalSaveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdminPanelScreen;
