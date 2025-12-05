import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api";

const ChatScreen = ({ route }: any) => {
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const ws = useRef<WebSocket | null>(null);

  // Logged user data
  const farmer_id = route?.params?.userId || "TEMP_ID";
  const farmer_district = route?.params?.district || "Monaragala";

  /** 🔹 1. Load or create chat room */
  const loadRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/chat/get-room`, {
        farmer_id,
        district: farmer_district,
      });

      if (res.data.room) {
        setRoom(res.data.room);
      } else {
        console.log("Room creation error:", res.data);
      }
    } catch (err) {
      console.log("Chat room error", err);
    }
  };

  /** 🔹 2. Load previous messages */
  const loadHistory = async (room_id: string) => {
    try {
      const res = await axios.get(`${API_BASE}/chat/messages/${room_id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log("Message history error:", err);
    }
  };

  /** 🔹 3. Connect WebSocket */
  const connectWebSocket = (room_id: string) => {
    const wsUrl = API_BASE.replace("http", "ws") + `/chat/ws/${room_id}`;

    console.log("🔌 Connecting WebSocket:", wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      setMessages((prev) => [...prev, msg]);
    };

    ws.current.onerror = (err) => {
      console.log("❌ WebSocket Error:", err);
    };

    ws.current.onclose = () => {
      console.log("⚠ WebSocket closed. Reconnecting…");
      setTimeout(() => connectWebSocket(room_id), 2000);
    };
  };

  /** 🔹 4. Send message through WebSocket */
  const sendMessage = () => {
    if (!message.trim() || !ws.current) return;

    ws.current.send(
      JSON.stringify({
        sender_id: farmer_id,
        message,
      })
    );

    setMessage("");
  };

  /** 🔹 5. Run on first load */
  useEffect(() => {
    loadRoom();
  }, []);

  /** 🔹 6. After room loads → fetch history + connect WebSocket */
  useEffect(() => {
    if (!room) return;

    loadHistory(room.id);
    connectWebSocket(room.id);
  }, [room]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with Agriculture Officer</Text>

      {!room ? (
        <Text style={styles.loadingText}>Connecting to officer…</Text>
      ) : (
        <>
          {/* Chat messages */}
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender_id === farmer_id
                    ? styles.rightBubble
                    : styles.leftBubble,
                ]}
              >
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            )}
          />

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type message…"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E3F2FD", padding: 15 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#0D47A1",
    textAlign: "center",
  },
  loadingText: { fontSize: 16, textAlign: "center", marginTop: 25 },

  messageBubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 15,
    maxWidth: "75%",
  },
  leftBubble: {
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  rightBubble: {
    backgroundColor: "#1565C0",
    alignSelf: "flex-end",
  },
  messageText: { color: "#000" },

  inputRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 25,
  },
  sendBtn: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 25,
  },
  sendText: { color: "#fff", fontWeight: "bold" },
});

export default ChatScreen;
