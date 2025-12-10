import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { getOfficerRooms } from "../../services/officerApi";

export default function OfficerRoomsScreen({ route, navigation }: any) {
  const [rooms, setRooms] = useState<any[]>([]);
  const officerId = route?.params?.officerId;

  useEffect(() => {
    if (!officerId) return;
    loadRooms();
  }, [officerId]);

  async function loadRooms() {
    try {
      const data = await getOfficerRooms(officerId);
      setRooms(data || []);
    } catch (err) {
      console.log("Failed to load officer rooms:", err);
    }
  }

  const openRoom = (room: any) => {
    navigation.navigate("Chat", {
      roomId: room.id,
      userId: officerId,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Active Farmer Chats</Text>

      {rooms.length === 0 ? (
        <Text style={{ color: "#666", marginTop: 20 }}>
          No active chats assigned to you.
        </Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => String(item.id)} // FIXED
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => openRoom(item)}
            >
              <Text style={styles.roomTitle}>Farmer: {item.farmer_id}</Text>
              <Text style={styles.roomDistrict}>District: {item.district}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  roomCard: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },

  roomTitle: { fontSize: 16, fontWeight: "600" },
  roomDistrict: { marginTop: 4, color: "#555" },
});
