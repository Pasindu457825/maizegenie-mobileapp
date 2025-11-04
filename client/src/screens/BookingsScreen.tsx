import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CustomHeader from "../components/CustomHeader";
import BookingCard from "../components/BookingCard";
import { spacing } from "../theme";

export default function BookingsScreen() {
  const items = [
    { id: "B001", title: "Vehicle A - Daily", date: "2025-09-29" },
    { id: "B002", title: "Vehicle B - Hourly", date: "2025-09-30" },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Bookings" />
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((b) => (
          <BookingCard key={b.id} {...b} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing(2) },
});
