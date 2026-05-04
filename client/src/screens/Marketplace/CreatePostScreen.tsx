import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type {
  PriceForecastStackParamList,
  PostDraft,
  ForecastData,
} from "../../navigation/PriceForecastStack";
import { ArrowLeft, Package } from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

type NavProp = StackNavigationProp<
  PriceForecastStackParamList,
  "CreatePostScreen"
>;

interface RouteParams {
  bestPrice: number;
  formData: ForecastData;
}

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

const CreatePostScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { language: globalLang } = useLanguage();
  const language =
    globalLang === "sinhala" ? "si" : globalLang === "tamil" ? "ta" : "en";

  const { bestPrice, formData } = route.params as RouteParams;

  const [quantity, setQuantity] = useState<string>(
    (formData?.expectedYield * formData?.farmArea || 0).toFixed(0),
  );
  const [price, setPrice] = useState<string>(bestPrice.toFixed(2));
  const [seedVariety, setSeedVariety] = useState<string>(
    formData?.seedVariety || "",
  );
  const [errors, setErrors] = useState<{
    quantity?: string;
    seedVariety?: string;
    price?: string;
  }>({});

 const content = {
  si: {
    title: "අස්වනු විකිණීම",
    subtitle: "අස්වනු විස්තර ඇතුළත් කරන්න",
    quantity: "ප්‍රමාණය (කි.ග්‍රෑ)",
    seedVariety: "බීජ ප්‍රභේදය",
    pricePerKg: "මිල (කි.ග්‍රෑම් එකකට)",
    district: "දිස්ත්‍රික්කය",
    week: "සතිය",
    next: "ඉදිරියට යන්න",
    cancel: "අවලංගු කරන්න",
    enterQuantity: "ප්‍රමාණය ඇතුළත් කරන්න",
    enterPrice: "මිල ඇතුළත් කරන්න",
    enterVariety: "බීජ ප්‍රභේදය ඇතුළත් කරන්න",
  },

  en: {
    title: "Post Harvest",
    subtitle: "Enter harvest details",
    quantity: "Quantity (kg)",
    seedVariety: "Seed Variety",
    pricePerKg: "Price (per kg)",
    district: "District",
    week: "Week",
    next: "Next",
    cancel: "Cancel",
    enterQuantity: "Enter quantity",
    enterPrice: "Enter price",
    enterVariety: "Enter seed variety",
  },

  ta: {
    title: "அறுவடை விற்பனை",
    subtitle: "அறுவடை விவரங்களை உள்ளிடவும்",
    quantity: "அளவு (கி.கி.)",
    seedVariety: "விதை வகை",
    pricePerKg: "விலை (ஒரு கிலோக்கு)",
    district: "மாவட்டம்",
    week: "வாரம்",
    next: "அடுத்து செல்லவும்",
    cancel: "ரத்து செய்க",
    enterQuantity: "அளவை உள்ளிடவும்",
    enterPrice: "விலையை உள்ளிடவும்",
    enterVariety: "விதை வகையை உள்ளிடவும்",
  },
};

  const getValidationMessages = () => {
  if (language === "si") {
    return {
      quantityRequired: "ප්‍රමාණය අවශ්‍යයි",
      quantityInvalid: "ප්‍රමාණය 0 ට වැඩි සංඛ්‍යාවක් විය යුතුය",
      quantityTooHigh: "ප්‍රමාණය ඉතා ඉහළයි",

      varietyRequired: "බීජ ප්‍රභේදය අවශ්‍යයි",
      varietyTooShort: "බීජ ප්‍රභේදය පැහැදිලිව ඇතුළත් කරන්න",

      priceRequired: "මිල අවශ්‍යයි",
      priceInvalid: "මිල 0 ට වැඩි සංඛ්‍යාවක් විය යුතුය",
      priceTooHigh: "මිල ඉතා ඉහළයි",
    };
  }

  if (language === "ta") {
    return {
      quantityRequired: "அளவு தேவை",
      quantityInvalid: "அளவு 0-ஐ விட அதிகமான எண்ணாக இருக்க வேண்டும்",
      quantityTooHigh: "அளவு மிகவும் அதிகமாக உள்ளது",

      varietyRequired: "விதை வகை தேவை",
      varietyTooShort: "விதை வகையை தெளிவாக உள்ளிடவும்",

      priceRequired: "விலை தேவை",
      priceInvalid: "விலை 0-ஐ விட அதிகமான எண்ணாக இருக்க வேண்டும்",
      priceTooHigh: "விலை மிகவும் அதிகமாக உள்ளது",
    };
  }

  return {
    quantityRequired: "Quantity is required",
    quantityInvalid: "Quantity must be a number greater than 0",
    quantityTooHigh: "Quantity is too high",

    varietyRequired: "Seed variety is required",
    varietyTooShort: "Enter a clearer seed variety",

    priceRequired: "Price is required",
    priceInvalid: "Price must be a number greater than 0",
    priceTooHigh: "Price is too high",
  };
};

  const validateForm = () => {
    const messages = getValidationMessages();
    const nextErrors: {
      quantity?: string;
      seedVariety?: string;
      price?: string;
    } = {};
    const trimmedVariety = seedVariety.trim();
    const quantityValue = Number(quantity);
    const priceValue = Number(price);

    if (!quantity.trim()) {
      nextErrors.quantity = messages.quantityRequired;
    } else if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      nextErrors.quantity = messages.quantityInvalid;
    } else if (quantityValue > 1000000) {
      nextErrors.quantity = messages.quantityTooHigh;
    }

    if (!trimmedVariety) {
      nextErrors.seedVariety = messages.varietyRequired;
    } else if (trimmedVariety.length < 2) {
      nextErrors.seedVariety = messages.varietyTooShort;
    }

    if (!price.trim()) {
      nextErrors.price = messages.priceRequired;
    } else if (!Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = messages.priceInvalid;
    } else if (priceValue > 100000) {
      nextErrors.price = messages.priceTooHigh;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    const postDraft: PostDraft = {
      seedVariety: seedVariety.trim(),
      pricePerKg: parseFloat(price),
      quantityKg: parseFloat(quantity),
      district: formData?.district || "Anuradhapura",
      week: parseInt(formData?.week, 10) || 1,
      season: formData?.season || "Maha",
    };

    console.log(
      "[CreatePostScreen] formData.week:",
      formData?.week,
      "| postDraft.week:",
      postDraft.week,
    );

    navigation.navigate("PostReviewScreen", { postDraft });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="#047857" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{content[language].title}</Text>
          <Text style={styles.headerSubtitle}>
            {content[language].subtitle}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.formCard}>
          {/* Quantity Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].quantity}</Text>
            <TextInput
              style={[styles.input, errors.quantity && styles.inputError]}
              placeholder={content[language].enterQuantity}
              placeholderTextColor="#9CA3AF"
              value={quantity}
              onChangeText={(value) => {
                setQuantity(value);
                if (errors.quantity) {
                  setErrors((current) => ({ ...current, quantity: undefined }));
                }
              }}
              keyboardType="decimal-pad"
            />
            {errors.quantity ? (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            ) : null}
          </View>

          {/* Seed Variety Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].seedVariety}</Text>
            <TextInput
              style={[styles.input, errors.seedVariety && styles.inputError]}
              placeholder={content[language].enterVariety}
              placeholderTextColor="#9CA3AF"
              value={seedVariety}
              onChangeText={(value) => {
                setSeedVariety(value);
                if (errors.seedVariety) {
                  setErrors((current) => ({
                    ...current,
                    seedVariety: undefined,
                  }));
                }
              }}
            />
            {errors.seedVariety ? (
              <Text style={styles.errorText}>{errors.seedVariety}</Text>
            ) : null}
          </View>

          {/* Price Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].pricePerKg}</Text>
            <TextInput
              style={[styles.input, errors.price && styles.inputError]}
              placeholder={content[language].enterPrice}
              placeholderTextColor="#9CA3AF"
              value={price}
              onChangeText={(value) => {
                setPrice(value);
                if (errors.price) {
                  setErrors((current) => ({ ...current, price: undefined }));
                }
              }}
              keyboardType="decimal-pad"
            />
            {errors.price ? (
              <Text style={styles.errorText}>{errors.price}</Text>
            ) : null}
          </View>

          {/* District Display */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].district}</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {formData?.district || "Anuradhapura"}
              </Text>
            </View>
          </View>

          {/* Week Display */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{content[language].week}</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{formData?.week || 1}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>
            {content[language].cancel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Package color="#FFFFFF" size={20} />
          <Text style={styles.primaryButtonText}>{content[language].next}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#047857",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 2,
  },
  readOnlyInput: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#047857",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CreatePostScreen;
