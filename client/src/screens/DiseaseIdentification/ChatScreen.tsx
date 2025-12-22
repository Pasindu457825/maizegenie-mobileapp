import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
} from "lucide-react-native";
import { getOrCreateRoom } from "../../services/chatRoomApi";
import { getChatHistory } from "../../services/chatApi";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useApp } from "../../context/AppContext";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { uploadChatImage } from "../../services/chatUploadApi";

const { width, height } = Dimensions.get("window");

function formatTime(timestamp: string | number | Date | undefined) {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

function formatDate(timestamp: string | number | Date | undefined) {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
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

  // Farmer values
  const farmerId = user?.id ?? null;
  const farmerDistrict = user?.district ?? null;

  const [roomId, setRoomId] = useState<string | null>(incomingRoomId);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [dateGroups, setDateGroups] = useState<Record<string, any[]>>({});
  const flatListRef = useRef<FlatList>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Group messages by date
  useEffect(() => {
    const grouped: Record<string, any[]> = {};
    // Sort messages by timestamp (oldest to newest)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    sortedMessages.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    setDateGroups(grouped);
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      // OFFICER → joins existing room
      if (isOfficer && incomingRoomId) {
        setRoomId(incomingRoomId);
        const history = await getChatHistory(incomingRoomId);
        // Sort history to show oldest first (for normal scrolling)
        setMessages(history.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ));
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
      // Sort history to show oldest first (for normal scrolling)
      setMessages(history.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));
    }

    initChat();
  }, []);

  // WebSocket
  const { sendTextMessage, sendImageMessage } = useChatWebSocket(
    roomId,
    (msg: any) => {
      setMessages((prev) => {
        const newMessages = [...prev, msg];
        // Keep messages sorted by timestamp
        return newMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
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
    setText("");
  };

  if (!roomId) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#10B981", "#0faa76ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>🌾</Text>
          <Text style={styles.loadingTitle}>Loading Chat...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Prevent TS error → always a string
  const currentUserId = isOfficer ? String(incomingUserId) : String(farmerId);
  const chatTitle = isOfficer ? "Farmer Chat" : "Agriculture Officer";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <LinearGradient
        colors={["#10B981", "#0faa76ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{chatTitle}</Text>
            <Text style={styles.headerSubtitle}>
              {isOfficer ? "Active now" : "Agriculture Support"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Phone size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Video size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <MoreVertical size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages - REMOVED 'inverted' prop */}
      <Animated.View
        style={[
          styles.chatContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={Object.entries(dateGroups)}
          keyExtractor={([date]) => date}
          // REMOVED: inverted  ← This is the key change
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when content size changes
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          renderItem={({ item: [date, messages] }) => (
            <View style={styles.dateSection}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{date}</Text>
              </View>
              {messages.map((message: any) => {
                const isMe = message.sender_id === currentUserId;
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageWrapper,
                      isMe
                        ? styles.messageWrapperMe
                        : styles.messageWrapperOther,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isMe ? ["#10B981", "#059669"] : ["#ffffff", "#f9fafb"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.messageBubble,
                        isMe
                          ? styles.messageBubbleMe
                          : styles.messageBubbleOther,
                      ]}
                    >
                      {message.image_url && (
                        <View style={styles.imageContainer}>
                          <Image
                            source={{ uri: message.image_url }}
                            style={styles.messageImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}

                      {message.message && (
                        <Text
                          style={[
                            styles.messageText,
                            isMe
                              ? styles.messageTextMe
                              : styles.messageTextOther,
                          ]}
                        >
                          {message.message}
                        </Text>
                      )}

                      <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>
                          {formatTime(message.created_at)}
                        </Text>
                        {isMe && (
                          <View style={styles.messageStatus}>
                            <Check
                              size={12}
                              color={isMe ? "#ffffff" : "#9ca3af"}
                            />
                            <CheckCheck
                              size={12}
                              color={isMe ? "#ffffff" : "#9ca3af"}
                            />
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          )}
        />
      </Animated.View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <LinearGradient
          colors={["#ffffff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inputWrapper}
        >
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.cameraButton}
          >
            <ImageIcon size={22} color="#10B981" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            multiline
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim()}
            style={[
              styles.sendButton,
              !text.trim() && styles.sendButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <Send size={20} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingGradient: {
    width: width * 0.8,
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loadingText: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 20,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateBadge: {
    alignSelf: "center",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  messageWrapper: {
    marginBottom: 8,
    maxWidth: "80%",
  },
  messageWrapperMe: {
    alignSelf: "flex-end",
  },
  messageWrapperOther: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#ffffff",
    fontWeight: "500",
  },
  messageTextOther: {
    color: "#1f2937",
    fontWeight: "500",
  },
  imageContainer: {
    marginBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    opacity: 0.8,
  },
  messageStatus: {
    flexDirection: "row",
    gap: 2,
  },
  statusText: {
    fontSize: 11,
    opacity: 0.8,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 100,
    color: "#1f2937",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});