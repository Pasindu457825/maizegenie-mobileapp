import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import { supabase } from "../../services/supabaseClient";
import { sendFarmerMessage, getChatHistory } from "../../services/chatApi";
import { useApp } from "../../context/AppContext";

export default function ChatScreen() {
  const { user } = useApp();
  const farmerId = user?.id as string | undefined;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // ---------------------------
  // Load chat history once
  // ---------------------------
  useEffect(() => {
    if (!farmerId) return;

    (async () => {
      const res = await getChatHistory(farmerId);
      setMessages(res.data);
    })();
  }, [farmerId]);

  // ---------------------------------------------------
  // SINGLE realtime listener (the correct one)
  // ---------------------------------------------------
  useEffect(() => {
    if (!farmerId) return;

    const channel = supabase
      .channel(`chat-room-${farmerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `farmer_id=eq.${farmerId}`,
        },
        (payload) => {
          console.log("Realtime:", payload.new);

          setMessages((prev) => {
            const updated = [...prev, payload.new];
            return updated.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 150);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [farmerId]);

  // ---------------------------
  // Send message
  // ---------------------------
  const handleSend = async () => {
    if (!text.trim() || !farmerId) return;

    await sendFarmerMessage(farmerId, text.trim());
    setText("");
  };

  if (!farmerId) {
    return (
      <View style={styles.center}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              item.sender === "farmer" ? styles.me : styles.them,
            ]}
          >
            <Text style={styles.msgText}>{item.message}</Text>
          </View>
        )}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type message..."
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f1f1", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  msgBubble: {
    padding: 10,
    marginVertical: 4,
    maxWidth: "75%",
    borderRadius: 10,
  },
  me: { backgroundColor: "#4CAF50", alignSelf: "flex-end" },
  them: { backgroundColor: "#ddd", alignSelf: "flex-start" },
  msgText: { color: "#000" },
  inputRow: { flexDirection: "row", marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  sendBtn: { backgroundColor: "#4CAF50", padding: 12, borderRadius: 8 },
});
