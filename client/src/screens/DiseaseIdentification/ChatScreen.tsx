import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import { getOrCreateRoom, deleteRoomIfEmpty } from "../../services/chatRoomApi";
import { getChatHistory } from "../../services/chatApi";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useApp } from "../../context/AppContext";

export default function ChatScreen() {
  const { user } = useApp();

  // ❌ if user is missing → prevent undefined errors
  if (!user?.id || !user?.district) {
    return <Text>Error: User not loaded</Text>;
  }

  const farmerId: string = user.id;
  const farmerDistrict: string = user.district;

  const [roomId, setRoomId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const hasSentMessage = useRef(false);

  // Auto-create room
  useEffect(() => {
    async function initRoom() {
      const room = await getOrCreateRoom(farmerId, farmerDistrict);

      // enforce string type
      const newRoomId: string = String(room.id);

      setRoomId(newRoomId);

      const history = await getChatHistory(newRoomId);
      setMessages(history);
    }

    initRoom();

    return () => {
      if (!hasSentMessage.current && roomId) {
        deleteRoomIfEmpty(roomId);
      }
    };
  }, []);

  // WebSocket (safe)
  const { sendMessage } = useChatWebSocket(roomId || null, (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  const handleSend = () => {
    if (!roomId || text.trim().length === 0) return;

    sendMessage(farmerId, text);
    hasSentMessage.current = true;
    setText("");
  };

  if (!roomId) return <Text>Loading chat...</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.msgBubble,
              item.sender_id === farmerId
                ? styles.meBubble
                : styles.otherBubble,
            ]}
          >
            <Text style={styles.msgText}>{item.message}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />

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

  btnText: { color: "#fff", fontWeight: "bold" },
});
