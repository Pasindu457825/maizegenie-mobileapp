import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

interface Prediction {
  class_id: number;
  class_name: string;
  confidence: number;
}

// Dynamic API URL based on platform
const getApiUrl = () => {
  if (Platform.OS === "android") {
    // For REAL Android device, use your computer's IP
    return process.env.EXPO_PUBLIC_API_BASE ;

    // For Android emulator, use:
    // return "http://10.0.2.2:8000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:8000"; // iOS simulator
  } else {
    return "http://localhost:8000"; // Web
  }
};

const API_URL = getApiUrl();

const PestDetectScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<Prediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setError(null);
      setResult(null);
    }
  };

  const uploadAndDetect = async () => {
    if (!imageUri) {
      alert("Please select an image first");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Connecting to:", `${API_URL}/api/pest/identify`);
      console.log("Image URI:", imageUri);

      // For web, we need to convert the image to a Blob
      let formData = new FormData();

      if (Platform.OS === "web") {
        // Web: fetch the image and convert to blob
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append("file", blob, "pest.jpg");
      } else {
        // Mobile: use the standard format
        formData.append("file", {
          uri: imageUri,
          name: "pest.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await axios.post(
        `${API_URL}/api/pest/identify?conf=0.4&return_image=false`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("Response:", res.data);

      if (res.data.success) {
        setResult(res.data.predictions);
        if (!res.data.predictions || res.data.predictions.length === 0) {
          setError("No pests detected in the image");
        }
      } else {
        setError("Detection failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      console.error("Error response:", err.response?.data);

      let errorMsg = "Failed to connect to server!";

      if (err.response?.data) {
        // If there's a response, try to extract the error message
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      alert(
        `Error: ${errorMsg}\n\nMake sure your FastAPI server is running on port 8000`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌽 Pest Identification</Text>

      <Text style={styles.apiInfo}>API: {API_URL}</Text>

      <Button title="Pick Image" onPress={pickImage} />

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
          color="#4CAF50"
          style={{ margin: 20 }}
        />
      ) : (
        imageUri && (
          <Button
            title="Detect Pest"
            onPress={uploadAndDetect}
            color="#4CAF50"
          />
        )
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {result && result.length > 0 ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Detection Result:</Text>
          {result.map((p, i) => (
            <Text key={i} style={styles.resultText}>
              {p.class_name} — {Math.round(p.confidence * 100)}%
            </Text>
          ))}
        </View>
      ) : result && result.length === 0 ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>No pests detected</Text>
        </View>
      ) : null}
    </View>
  );
};

export default PestDetectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  apiInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  preview: {
    width: 250,
    height: 250,
    marginVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    width: "100%",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2e7d32",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 3,
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    width: "100%",
  },
  errorText: {
    fontSize: 14,
    color: "#c62828",
  },
});
