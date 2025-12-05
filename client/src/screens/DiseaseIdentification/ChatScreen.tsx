import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { API_BASE } from "../../services/api"; // FIXED import

const ChatScreen = ({ route }: any) => {
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // TODO: Replace with logged-in user details
  const farmer_id = route?.params?.userId || "REPLACE_USER_ID";
  const farmer_district = route?.params?.district || "Monaragala";

  // 1️⃣ Get or create chat room
  const loadRoom = async () => {
    try {
      const res = await axios.post(`${API_BASE}/chat/get-room`, {
        farmer_id,
        district: farmer_district,
      });

      if (res.data.room) {
        setRoom(res.data.room);
      } else {
        console.log("No room:", res.data);
      }
    } catch (err) {
      console.log("🔥 Error loading room:", err);
    }
  };

  // 2️⃣ Fetch messages for room
  const loadMessages = useCallback(async () => {
    if (!room) return;

    try {
      const res = await axios.get(`${API_BASE}/chat/messages/${room.id}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.log("🔥 Message fetch error:", err);
    }
  }, [room]);

  // 3️⃣ Send a message
  const sendMessage = async () => {
    if (!message.trim() || !room) return;

    try {
      await axios.post(`${API_BASE}/chat/send`, {
        room_id: room.id,
        sender_id: farmer_id,
        message,
      });

      setMessage("");
      loadMessages(); // Refresh after sending
    } catch (err) {
      console.log("🔥 Send error:", err);
    }
  };

  // Load room on mount
  useEffect(() => {
    loadRoom();
  }, []);

  // Poll messages every 2 seconds
  useEffect(() => {
    if (!room) return;

    loadMessages();
    const interval = setInterval(loadMessages, 2000);

    return () => clearInterval(interval);
  }, [room, loadMessages]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat With Agriculture Officer</Text>

      {!room ? (
        <Text style={styles.loadingText}>Connecting to officer...</Text>
      ) : (
        <>
          {/* Chat messages */}
          <FlatList
            data={messages}
            keyExtractor={(item) => String(item.id)}
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

          {/* Message input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message..."
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
  },
  loadingText: { fontSize: 16, textAlign: "center", marginTop: 25 },

  messageBubble: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 15,
    maxWidth: "75%",
  },
  leftBubble: {
    backgroundColor: "#FFFFFF",
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
