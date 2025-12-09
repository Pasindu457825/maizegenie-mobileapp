import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import { getOrCreateRoom } from "../../services/chatRoomApi";
import { getChatHistory } from "../../services/chatApi";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useApp } from "../../context/AppContext";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { uploadChatImage } from "../../services/chatUploadApi";

function formatTime(timestamp: string | number | Date | undefined) {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

export default function ChatScreen({ route, navigation }: any) {
  const { user } = useApp();

  // Params for officer mode
  const incomingRoomId = route?.params?.roomId ?? null;
  const incomingUserId = route?.params?.userId ?? null;

  const isOfficer = !!incomingRoomId;

  // --- farmer values (safe) ---
  const farmerId = user?.id ?? null;
  const farmerDistrict = user?.district ?? null;

  const [roomId, setRoomId] = useState<string | null>(incomingRoomId);
  const [messages, setMessages] = useState<any[]>([]);

  const [text, setText] = useState("");
  const hasSentMessage = useRef(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    async function initChat() {
      // OFFICER → joins existing room
      if (isOfficer && incomingRoomId) {
        setRoomId(incomingRoomId);
        const history = await getChatHistory(incomingRoomId);
        setMessages(history);
        return;
      }

      // FARMER → user must exist
      if (!farmerId || !farmerDistrict) {
        console.log("Farmer user not loaded yet");
        return;
      }

      const room = await getOrCreateRoom(farmerId, farmerDistrict);
      const newRoomId = String(room.id);
      setRoomId(newRoomId);

      const history = await getChatHistory(newRoomId);
      setMessages(history);
    }

    initChat();
  }, []);

  // WebSocket
  const { sendTextMessage, sendImageMessage } = useChatWebSocket(
    roomId,
    (msg) => {
      setMessages((prev) => [...prev, msg]);
    }
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;

    // 1️⃣ Upload to Supabase
    const imageUrl = await uploadChatImage(uri);

    // 2️⃣ Send via WebSocket
    const senderId = isOfficer ? String(incomingUserId) : String(farmerId);
    sendImageMessage(senderId, imageUrl);
  };

  const handleSend = () => {
    if (!roomId || !text.trim()) return;

    // Prevent TS error → ensure string always
    const senderId = isOfficer ? String(incomingUserId) : String(farmerId);

    sendTextMessage(senderId, text);
    hasSentMessage.current = true;
    setText("");
  };

  if (!roomId) return <Text>Loading chat...</Text>;

  // Prevent TS error → always a string
  const currentUserId = isOfficer ? String(incomingUserId) : String(farmerId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()} // show latest at bottom
        inverted // render from bottom to top
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              item.sender_id === currentUserId
                ? styles.meBubble
                : styles.otherBubble,
            ]}
          >
            {item.message ? (
              <Text style={styles.msgText}>{item.message}</Text>
            ) : null}

            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 10,
                  marginTop: 5,
                }}
                resizeMode="cover"
              />
            ) : null}

            {/* TIME LIKE WHATSAPP */}
            <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        {/* Camera Button */}
        <TouchableOpacity onPress={handlePickImage} style={styles.camBtn}>
          <Text style={{ color: "#fff", fontSize: 20 }}>📸</Text>
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />

        {/* Send Button */}
        <TouchableOpacity style={styles.btn} onPress={handleSend}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- styles ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },

  msgBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },

  meBubble: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },

  otherBubble: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },

  msgText: { fontSize: 16 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    padding: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },

  btn: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  camBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },

  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },

  btnText: { color: "#fff", fontWeight: "bold" },
});
