import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MessageCircle, Send, Camera, ArrowLeft } from "lucide-react-native";
import { getOrCreateRoom } from "../../services/chatRoomApi";
import { getChatHistory } from "../../services/chatApi";
import { useChatWebSocket } from "../../hooks/useChatWebSocket";
import { useApp } from "../../context/AppContext";
import * as ImagePicker from "expo-image-picker";
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

export default function AgriculturalAdvisoryChatScreen({ route, navigation }: any) {
    const { user } = useApp();

    const prefilledMessage = route?.params?.prefilledMessage ?? null;
    const advisoryContext = route?.params?.context ?? null;
    const advisoryType = route?.params?.advisoryType ?? "general";

    const farmerId = user?.id ?? null;
    const farmerDistrict = user?.district ?? null;

    const [roomId, setRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState("");
    const hasSentMessage = useRef(false);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        async function initChat() {
            if (!farmerId || !farmerDistrict) {
                console.warn("Missing farmer ID or district");
                return;
            }

            const room = await getOrCreateRoom(farmerId, farmerDistrict);
            if (!room) {
                console.error("Failed to create/get room");
                return;
            }

            const newRoomId = String(room.id);
            setRoomId(newRoomId);

            const history = await getChatHistory(newRoomId);
            setMessages(history);
        }

        initChat();
    }, []);

    useEffect(() => {
        if (prefilledMessage && !hasSentMessage.current) {
            setText(prefilledMessage);
        }
    }, [prefilledMessage]);

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

        const imageUrl = await uploadChatImage(uri);
        if (!imageUrl) {
            console.error("Failed to upload image");
            return;
        }

        const senderId = String(farmerId);
        sendImageMessage(senderId, imageUrl);
    };

    const handleSend = () => {
        if (!roomId || !text.trim()) return;

        const senderId = String(farmerId);

        sendTextMessage(senderId, text);
        hasSentMessage.current = true;
        setText("");
    };

    if (!roomId) {
        return (
            <View style={styles.loadingContainer}>
                <MessageCircle size={48} color="#16A34A" />
                <Text style={styles.loadingText}>Connecting to Agricultural Officer...</Text>
            </View>
        );
    }

    const currentUserId = String(farmerId);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={90}
        >
            <LinearGradient colors={["#16A34A", "#15803D"]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <MessageCircle size={24} color="#fff" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Agricultural Officer</Text>
                        <Text style={styles.headerSubtitle}>
                            {advisoryType === "fertilizer" ? "Fertilizer Advisory" : "Yield Prediction"}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                inverted
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.messagesList}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.msgBubble,
                            item.sender_id === currentUserId ? styles.meBubble : styles.otherBubble,
                        ]}
                    >
                        {item.message ? (
                            <Text
                                style={[
                                    styles.msgText,
                                    item.sender_id === currentUserId ? styles.myMsgText : styles.otherMsgText,
                                ]}
                            >
                                {item.message}
                            </Text>
                        ) : null}

                        {item.image_url ? (
                            <Image
                                source={{ uri: item.image_url }}
                                style={styles.messageImage}
                                resizeMode="cover"
                            />
                        ) : null}

                        <Text
                            style={[
                                styles.timeText,
                                item.sender_id === currentUserId ? styles.myTimeText : styles.otherTimeText,
                            ]}
                        >
                            {formatTime(item.created_at)}
                        </Text>
                    </View>
                )}
            />

            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={handlePickImage} style={styles.camBtn}>
                    <Camera size={24} color="#16A34A" />
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Type your message..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={1000}
                />

                <TouchableOpacity
                    style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim()}
                >
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6B7280",
        fontWeight: "500",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backBtn: {
        padding: 8,
        marginRight: 12,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    headerTextContainer: {
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#E5E7EB",
        marginTop: 2,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    msgBubble: {
        maxWidth: "80%",
        padding: 12,
        marginVertical: 4,
        borderRadius: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    meBubble: {
        alignSelf: "flex-end",
        backgroundColor: "#16A34A",
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        alignSelf: "flex-start",
        backgroundColor: "#fff",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    msgText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMsgText: {
        color: "#fff",
    },
    otherMsgText: {
        color: "#1F2937",
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginTop: 8,
    },
    timeText: {
        fontSize: 11,
        marginTop: 6,
    },
    myTimeText: {
        color: "#D1FAE5",
        textAlign: "right",
    },
    otherTimeText: {
        color: "#9CA3AF",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    camBtn: {
        padding: 10,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
    },
    input: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    sendBtn: {
        marginLeft: 8,
        backgroundColor: "#16A34A",
        borderRadius: 24,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    sendBtnDisabled: {
        backgroundColor: "#9CA3AF",
    },
});
