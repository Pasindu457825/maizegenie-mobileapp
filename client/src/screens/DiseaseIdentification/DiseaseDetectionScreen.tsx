import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { API_BASE } from "../../services/api";

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
}

// ======== DYNAMIC API CONFIG =========
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // Change this IP to your PC IP
    return "http://192.168.8.125:8000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000";
  } else {
    return "http://localhost:8000"; // Web fallback
  }
};
const API_URL = getApiUrl();

const DiseaseDetectionScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setResult(null);
      setError(null);
    }
  };

  const uploadAndDetect = async () => {
    if (!imageUri) {
      Alert.alert("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log("🌿 Connecting to:", `${API_URL}/api/disease/identify`);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, "leaf.jpg");
      } else {
        formData.append("file", {
          uri: imageUri,
          name: "leaf.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await axios.post(
       `${API_BASE}/api/disease/identify?conf=0.25&return_image=false`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      console.log("Response:", res.data);

      if (res.data.success) {
        setResult(res.data.predictions);
        if (!res.data.predictions || res.data.predictions.length === 0) {
          setError("No disease detected in the image");
        }
      } else {
        setError("Detection failed");
      }
    } catch (err: any) {
      console.error("Error:", err);
      let msg = "Failed to connect to server!";
      if (err.response?.data?.detail) msg = err.response.data.detail;
      else if (err.message) msg = err.message;
      setError(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌾 Disease Detection</Text>
      <Text style={styles.apiInfo}>API: {API_URL}/api/disease/identify</Text>

      <Button title="Select Leaf Image" onPress={pickImage} color="#2E8B57" />

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="contain"
        />
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#16A34A"
          style={{ marginVertical: 20 }}
        />
      ) : (
        imageUri && (
          <Button
            title="Detect Disease"
            onPress={uploadAndDetect}
            color="#16A34A"
          />
        )
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {result && result.length > 0 && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>✅ Detection Results</Text>
          {result.map((r, i) => (
            <Text key={i} style={styles.resultText}>
              {r.class_name} — {Math.round(r.confidence * 100)}%
            </Text>
          ))}
        </View>
      )}

      {result && result[0]?.class_name === "No disease detected" && (
        <View style={styles.resultBox}>
          <Text style={styles.healthyText}>🌿 No disease detected!</Text>
          <Text style={styles.subText}>
            Your crop appears healthy and free of diseases.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default DiseaseDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F8FAF9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 8,
  },
  apiInfo: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  preview: {
    width: 280,
    height: 280,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A7F3D0",
    marginVertical: 16,
  },
  errorBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    width: "100%",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  resultBox: {
    marginTop: 25,
    padding: 20,
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    width: "100%",
    borderWidth: 2,
    borderColor: "#86EFAC",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#14532D",
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#14532D",
    marginVertical: 2,
  },
  healthyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: "#059669",
    textAlign: "center",
  },
});
