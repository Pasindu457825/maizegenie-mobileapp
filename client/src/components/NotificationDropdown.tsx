import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";

interface NotificationDropdownProps {
  visible: boolean;
  onClose: () => void;
  messages: string[];
}

export const NotificationDropdown = ({
  visible,
  onClose,
  messages,
}: NotificationDropdownProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(-20);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      {/* Overlay with fade animation */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Dropdown Container with slide animation */}
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header with gradient effect */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconBadge}>
              <Text style={styles.bellIcon}>🔔</Text>
            </View>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🔕</Text>
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                We'll notify you when something arrives
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <TouchableOpacity
                key={index}
                style={styles.messageBox}
                activeOpacity={0.7}
              >
                <View style={styles.messageIndicator} />
                <View style={styles.messageContent}>
                  <View style={styles.messageIconContainer}>
                    <Text style={styles.messageIcon}>💬</Text>
                  </View>
                  <View style={styles.messageTextContainer}>
                    <Text style={styles.messageText}>{msg}</Text>
                    <Text style={styles.messageTime}>Just now</Text>
                  </View>
                  <View style={styles.unreadDot} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Footer */}
        {messages.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 50,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  container: {
    position: "absolute",
    top: 70,
    right: 15,
    width: 320,
    maxHeight: 500,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 25,
    overflow: "hidden",
  },

  header: {
    backgroundColor: "#047857",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBadge: {
    width: 38,
    height: 38,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  bellIcon: {
    fontSize: 18,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeIcon: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  scrollView: {
    maxHeight: 380,
  },

  scrollContent: {
    padding: 12,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },

  emptyIconContainer: {
    width: 70,
    height: 70,
    backgroundColor: "#F3F4F6",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyIcon: {
    fontSize: 32,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },

  messageBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 14,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  messageIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#10B981",
  },

  messageContent: {
    flexDirection: "row",
    padding: 14,
    paddingLeft: 16,
    alignItems: "flex-start",
    gap: 10,
  },

  messageIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  messageIcon: {
    fontSize: 16,
  },

  messageTextContainer: {
    flex: 1,
  },

  messageText: {
    color: "#1F2937",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },

  messageTime: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: "#10B981",
    borderRadius: 4,
    marginTop: 6,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
  },

  markAllButton: {
    alignItems: "center",
    paddingVertical: 4,
  },

  markAllText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "600",
  },
});