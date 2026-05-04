// PaymentScreen.tsx - PayHere Payment Gateway Integration UI
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Crown,
  CreditCard,
  Shield,
  CheckCircle,
  Lock,
  Sparkles,
} from "lucide-react-native";
import { TextInput } from "react-native-paper";
import { useLanguage } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";
import {
  BillingCycle,
  confirmCheckout,
  createCheckout,
} from "../../services/subscriptionApi";

// Translations
const translations = {
  sinhala: {
    title: "ගෙවීම් තොරතුරු",
    subtitle: "ඔබේ Pro සාමාජිකත්වය සක්‍රිය කරන්න",

    // Order Summary
    orderSummary: "ඇණවුම් සාරාංශය",
    planName: "MaizeGenie Pro - ජීවිත කාලය",
    originalPrice: "මුල් මිල",
    discount: "වට්ටම (50%)",
    totalAmount: "මුළු මුදල",

    // Payment Methods
    paymentMethod: "ගෙවීම් ක්‍රමය",
    creditCard: "ක්‍රෙඩිට් / ඩෙබිට් කාඩ්පත",
    bankTransfer: "බැංකු මාරු කිරීම",
    mobileBanking: "ජංගම බැංකු",

    // Card Details
    cardNumber: "කාඩ්පත් අංකය",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    cardHolder: "කාඩ්පත් හිමිකරුගේ නම",
    cardHolderPlaceholder: "ඔබේ නම ඇතුළත් කරන්න",
    expiryDate: "කල් ඉකුත් වන දිනය",
    expiryPlaceholder: "MM/YY",
    cvv: "CVV",
    cvvPlaceholder: "123",

    // Security
    securePayment: "ආරක්ෂිත ගෙවීම",
    secureText: "ඔබේ ගෙවීම් තොරතුරු SSL සංකේතනය මගින් ආරක්ෂා කර ඇත",

    // Features Reminder
    featuresTitle: "Pro සමඟ ඔබට ලැබෙන දේ",
    feature1: "පස් පරීක්ෂණ ඉල්ලීම",
    feature2: "AI අස්වැන්න පුරෝකථනය",
    feature3: "විශේෂඥ උපදෙස්",
    feature4: "සවිස්තර වාර්තා",
    feature5: "ජීවිත කාල ප්‍රවේශය",

    // Buttons
    payNow: "දැන් ගෙවන්න",
    processing: "සැකසෙමින්...",
    cancel: "අවලංගු කරන්න",

    // Messages
    successTitle: "ගෙවීම සාර්ථකයි!",
    successMessage: "ඔබේ Pro සාමාජිකත්වය සක්‍රිය කර ඇත. සියලුම විශේෂාංග භුක්ති විඳින්න!",
    errorTitle: "ගෙවීම අසාර්ථකයි",
    errorMessage: "ගෙවීම සැකසීමේදී දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.",
    validationError: "කරුණාකර සියලුම ක්ෂේත්‍ර නිවැරදිව පුරවන්න",
  },
  english: {
    title: "Payment Information",
    subtitle: "Activate your Pro membership",

    // Order Summary
    orderSummary: "Order Summary",
    planName: "MaizeGenie Pro - Lifetime",
    originalPrice: "Original Price",
    discount: "Discount (50%)",
    totalAmount: "Total Amount",

    // Payment Methods
    paymentMethod: "Payment Method",
    creditCard: "Credit / Debit Card",
    bankTransfer: "Bank Transfer",
    mobileBanking: "Mobile Banking",

    // Card Details
    cardNumber: "Card Number",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    cardHolder: "Cardholder Name",
    cardHolderPlaceholder: "Enter your name",
    expiryDate: "Expiry Date",
    expiryPlaceholder: "MM/YY",
    cvv: "CVV",
    cvvPlaceholder: "123",

    // Security
    securePayment: "Secure Payment",
    secureText: "Your payment information is protected with SSL encryption",

    // Features Reminder
    featuresTitle: "What You Get with Pro",
    feature1: "Soil Test Request",
    feature2: "AI Yield Prediction",
    feature3: "Expert Consultation",
    feature4: "Detailed Reports",
    feature5: "Lifetime Access",

    // Buttons
    payNow: "Pay Now",
    processing: "Processing...",
    cancel: "Cancel",

    // Messages
    successTitle: "Payment Successful!",
    successMessage: "Your Pro membership has been activated. Enjoy all premium features!",
    errorTitle: "Payment Failed",
    errorMessage: "An error occurred while processing payment. Please try again.",
    validationError: "Please fill in all fields correctly",
  },
  tamil: {
    title: "கொடுப்பனவு தகவல்கள்",
    subtitle: "உங்கள் Pro உறுப்பினரை செயல்படுத்துங்கள்",

    // Order Summary
    orderSummary: "ஆர்டர் சுருக்கம்",
    planName: "MaizeGenie Pro - வாழ்நாள்",
    originalPrice: "அசல் விலை",
    discount: "தள்ளுபடி (50%)",
    totalAmount: "மொத்த தொகை",

    // Payment Methods
    paymentMethod: "கொடுப்பனவு முறை",
    creditCard: "கிரெடிட் / டெபிட் கார்டு",
    bankTransfer: "வங்கி பரிமாற்றம்",
    mobileBanking: "மொபைல் வங்கி",

    // Card Details
    cardNumber: "கார்டு எண்",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    cardHolder: "கார்டு உரிமையாளர் பெயர்",
    cardHolderPlaceholder: "உங்கள் பெயரை உள்ளிடுங்கள்",
    expiryDate: "காலாவதி தேதி",
    expiryPlaceholder: "MM/YY",
    cvv: "CVV",
    cvvPlaceholder: "123",

    // Security
    securePayment: "பாதுகாப்பான கொடுப்பனவு",
    secureText: "உங்கள் கொடுப்பனவு தகவல்கள் SSL குறியாக்கத்தால் பாதுகாக்கப்படுகின்றன",

    // Features Reminder
    featuresTitle: "Pro உடன் உங்களுக்கு கிடைப்பவை",
    feature1: "மண் பரிசோதனை கோரிக்கை",
    feature2: "AI விளைச்சல் கணிப்பு",
    feature3: "நிபுணர் ஆலோசனை",
    feature4: "விரிவான அறிக்கைகள்",
    feature5: "வாழ்நாள் அணுகல்",

    // Buttons
    payNow: "இப்போது செலுத்தவும்",
    processing: "செயலாக்கம்...",
    cancel: "ரத்து செய்",

    // Messages
    successTitle: "கொடுப்பனவு வெற்றி!",
    successMessage: "உங்கள் Pro உறுப்பினர் செயல்படுத்தப்பட்டது. அனைத்து சிறப்பம்சங்களையும் அனுபவிக்கவும்!",
    errorTitle: "கொடுப்பனவு தோல்வி",
    errorMessage: "கொடுப்பனவு செயலாக்கத்தில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
    validationError: "அனைத்து புலங்களையும் சரியாக நிரப்பவும்",
  },
} as Record<string, any>;

export default function PaymentScreen({ navigation, route }: any) {
  const { refreshProfile, setDiseaseModel } = useApp();
  const { language } = useLanguage();
  const t = translations[language];

  const {
    plan = "pro_monthly",
    amount = 300,
    billingCycle: routeBillingCycle,
  } = route.params || {};
  const billingCycle: BillingCycle =
    routeBillingCycle || (amount >= 2000 ? "annual" : "monthly");

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const originalPrice = amount;
  const discount = 0;
  const totalAmount = amount;

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      const cleanedCard = cardNumber.replace(/\s/g, "");
      if (cleanedCard.length !== 16) {
        Alert.alert(t.errorTitle, "Please enter a valid 16-digit card number");
        return false;
      }
      if (!cardHolder.trim()) {
        Alert.alert(t.errorTitle, "Please enter cardholder name");
        return false;
      }
      if (expiryDate.length !== 5) {
        Alert.alert(t.errorTitle, "Please enter valid expiry date (MM/YY)");
        return false;
      }
      if (cvv.length !== 3) {
        Alert.alert(t.errorTitle, "Please enter valid CVV (3 digits)");
        return false;
      }
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const checkout = await createCheckout(billingCycle as BillingCycle);

      const confirmed = await confirmCheckout({
        order_id: checkout.order_id,
        billing_cycle: billingCycle as BillingCycle,
        card_number: cardNumber.replace(/\s/g, ""),
        card_holder: cardHolder.trim(),
        expiry_date: expiryDate,
        cvv,
      });

      if (!confirmed.success) {
        Alert.alert(t.errorTitle, t.errorMessage);
        return;
      }

      await refreshProfile();
      await setDiseaseModel("roboflow");

      navigation.replace("PaymentSuccess", {
        orderId: checkout.order_id,
        amount: totalAmount,
        plan,
      });
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert(
        t.errorTitle,
        error instanceof Error ? error.message : t.errorMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f0fdf4", "#dcfce7", "#bbf7d0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#065f46" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <Crown size={28} color="#fbbf24" strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>{t.title}</Text>
          <Text style={styles.headerSubtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>{t.orderSummary}</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.planName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t.originalPrice}</Text>
            <Text style={styles.summaryValue}>රු. {originalPrice.toLocaleString()}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>{t.discount}</Text>
            <Text style={styles.discountValue}>- රු. {discount.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{t.totalAmount}</Text>
            <Text style={styles.totalValue}>රු. {totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.paymentMethod}</Text>

          <TouchableOpacity
            style={[
              styles.methodOption,
              paymentMethod === "card" && styles.methodOptionSelected,
            ]}
            onPress={() => setPaymentMethod("card")}
          >
            <CreditCard size={24} color={paymentMethod === "card" ? "#10b981" : "#6b7280"} />
            <Text
              style={[
                styles.methodText,
                paymentMethod === "card" && styles.methodTextSelected,
              ]}
            >
              {t.creditCard}
            </Text>
            {paymentMethod === "card" && <CheckCircle size={20} color="#10b981" />}
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        {paymentMethod === "card" && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.cardNumber}</Text>
              <TextInput
                mode="outlined"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                placeholder={t.cardNumberPlaceholder}
                keyboardType="number-pad"
                maxLength={19}
                style={styles.input}
                outlineColor="#d1d5db"
                activeOutlineColor="#10b981"
                left={<TextInput.Icon icon="credit-card" color="#10b981" />}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.cardHolder}</Text>
              <TextInput
                mode="outlined"
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder={t.cardHolderPlaceholder}
                autoCapitalize="words"
                style={styles.input}
                outlineColor="#d1d5db"
                activeOutlineColor="#10b981"
                left={<TextInput.Icon icon="account" color="#10b981" />}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t.expiryDate}</Text>
                <TextInput
                  mode="outlined"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  placeholder={t.expiryPlaceholder}
                  keyboardType="number-pad"
                  maxLength={5}
                  style={styles.input}
                  outlineColor="#d1d5db"
                  activeOutlineColor="#10b981"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t.cvv}</Text>
                <TextInput
                  mode="outlined"
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder={t.cvvPlaceholder}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                  style={styles.input}
                  outlineColor="#d1d5db"
                  activeOutlineColor="#10b981"
                />
              </View>
            </View>
          </View>
        )}

        {/* Security Badge */}
        <View style={styles.securityCard}>
          <Shield size={20} color="#059669" />
          <View style={styles.securityTextContainer}>
            <Text style={styles.securityTitle}>{t.securePayment}</Text>
            <Text style={styles.securityText}>{t.secureText}</Text>
          </View>
          <Lock size={18} color="#059669" />
        </View>

        {/* Features Reminder */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>{t.featuresTitle}</Text>
          <View style={styles.featuresList}>
            <FeatureItem text={t.feature1} />
            <FeatureItem text={t.feature2} />
            <FeatureItem text={t.feature3} />
            <FeatureItem text={t.feature4} />
            <FeatureItem text={t.feature5} />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePayment}
          disabled={loading}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.payButton}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#ffffff" />
                <Text style={styles.payButtonText}>{t.processing}</Text>
              </>
            ) : (
              <>
                <Lock size={20} color="#ffffff" />
                <Text style={styles.payButtonText}>
                  {t.payNow} - රු. {totalAmount.toLocaleString()}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Feature Item Component
const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <CheckCircle size={16} color="#10b981" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
    fontWeight: "500",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "700",
  },
  discountLabel: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  discountValue: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "700",
  },
  totalLabel: {
    fontSize: 16,
    color: "#065f46",
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 20,
    color: "#065f46",
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  section: {
    marginBottom: 20,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  methodOptionSelected: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  methodText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  methodTextSelected: {
    color: "#065f46",
    fontWeight: "700",
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },

  securityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    gap: 12,
    marginBottom: 20,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 2,
  },
  securityText: {
    fontSize: 11,
    color: "#059669",
    lineHeight: 16,
  },

  featuresCard: {
    backgroundColor: "#065f46",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  payButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
});
