import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabaseNew as supabase } from "@lib/supabase_new";

type Feedback = {
  id: string;
  pest_type: string;
  message: string;
  created_at: string;
};

// ✅ Universal helper function to get user (works with ANY Supabase version)
async function getUserSafely() {
  try {
    // Method 1: Direct user() call (Supabase v1)
    if (typeof (supabase.auth as any).user === 'function') {
      return (supabase.auth as any).user();
    }

    // Method 2: session().user (Supabase v1)
    if (typeof (supabase.auth as any).session === 'function') {
      const session = (supabase.auth as any).session();
      return session?.user ?? null;
    }

    // Method 3: Direct property access
    if ((supabase.auth as any).currentUser) {
      return (supabase.auth as any).currentUser;
    }

    // Method 4: getUser() (Supabase v2)
    if (typeof (supabase.auth as any).getUser === 'function') {
      const { data } = await (supabase.auth as any).getUser();
      return data?.user ?? null;
    }

    // Method 5: getSession() (Supabase v2)
    if (typeof (supabase.auth as any).getSession === 'function') {
      const { data } = await (supabase.auth as any).getSession();
      return data?.session?.user ?? null;
    }

    console.error("No auth method found. Available methods:", Object.keys(supabase.auth));
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}

export default function OfficerFeedbackScreen() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [reply, setReply] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 🔹 Load pending feedback
  const loadPending = async () => {
    const { data, error } = await supabase
      .from("pest_feedback")
      .select("id, pest_type, message, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) setFeedbacks(data);
  };

  useEffect(() => {
    loadPending();
  }, []);

  // 🔹 Approve + reply
  const approveAndReply = async () => {
    if (!selectedId || !reply) {
      Alert.alert("Missing", "Reply is required");
      return;
    }

    try {
      // ✅ Get user using universal method
      const user = await getUserSafely();

      if (!user) {
        Alert.alert("Error", "User not logged in. Please login again.");
        return;
      }

      // 1️⃣ Save reply
      const { error: replyError } = await supabase.from("pest_officer_replies").insert({
        feedback_id: selectedId,
        officer_id: user.id,
        reply,
      });

      if (replyError) {
        Alert.alert("Error", replyError.message);
        return;
      }

      // 2️⃣ Approve feedback
      const { error: updateError } = await supabase
        .from("pest_feedback")
        .update({ status: "approved" })
        .eq("id", selectedId);

      if (updateError) {
        Alert.alert("Error", updateError.message);
        return;
      }

      Alert.alert("Success", "Feedback approved");
      setReply("");
      setSelectedId(null);
      loadPending();
    } catch (err) {
      console.error("Approve error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Pest Feedback</Text>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.pest}>{item.pest_type}</Text>
            <Text>{item.message}</Text>

            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => setSelectedId(item.id)}
            >
              <Text style={styles.selectText}>Reply & Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {selectedId && (
        <View style={styles.replyBox}>
          <Text style={styles.replyTitle}>Officer Reply</Text>
          <TextInput
            placeholder="Enter advice / control method"
            value={reply}
            onChangeText={setReply}
            style={styles.input}
            multiline
          />
          <TouchableOpacity style={styles.approveBtn} onPress={approveAndReply}>
            <Text style={styles.approveText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  pest: { fontWeight: "bold", marginBottom: 4 },
  selectBtn: {
    marginTop: 6,
    backgroundColor: "#2563EB",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selectText: { color: "#FFF", fontWeight: "600" },
  replyBox: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  replyTitle: { fontWeight: "bold", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  approveBtn: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  approveText: { color: "#FFF", fontWeight: "bold" },
});