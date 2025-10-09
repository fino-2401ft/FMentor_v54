// screens/ChatScreen.tsx
import React from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useChatViewModel } from "../viewmodels/ChatViewModel";
import { Message, MessageType } from "../models/Message";
import { WebView } from "react-native-webview";

// Danh sách emoji cố định
const FIXED_EMOJIS = [
    "😀", "😂", "😍", "👍", "👎", "🎉", "❤️", "😢", "😴", "🤔",
];

type RouteParams = {
    conversationId: string;
};

const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { conversationId } = route.params as RouteParams;

    const {
        messages,
        newMessage,
        setNewMessage,
        isEmojiOpen,
        setIsEmojiOpen,
        conversationName,
        isOnline,
        sendMessage,
        sendMedia,
        onEmojiSelect,
    } = useChatViewModel(conversationId);

    // 🔍 Log tổng quan mỗi lần render
    console.log("🔄 ChatScreen render:");
    console.log("🧵 conversationId:", conversationId);
    console.log("💬 conversationName:", conversationName);
    console.log("📶 isOnline:", isOnline);
    console.log("🧾 messages count:", messages?.length);

    const renderMessage = ({ item }: { item: Message }) => {
        // Ghi log từng message
        console.log("📩 Rendering message:", {
            id: item.getMessageId?.(),
            type: item.getType?.(),
            content: item.getContent?.(),
            sender: item.getSenderId?.(),
        });

        const isSentByCurrentUser = item.getSenderId() === "currentUserId"; // tùy chỉnh lại nếu có userId thực tế
        const messageStyle = isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage;

        const safeContent = String(item.getContent?.() ?? ""); // đảm bảo luôn là string
        const messageType = item.getType?.();

        return (
            <View style={[styles.messageContainer, isSentByCurrentUser && styles.sentContainer]}>
                {messageType === MessageType.Text ? (
                    <Text style={messageStyle}>{safeContent}</Text>
                ) : messageType === MessageType.Image ? (
                    <Image source={{ uri: safeContent }} style={styles.media} />
                ) : messageType === MessageType.Video ? (
                    <WebView
                        source={{
                            html: `<video width="200" height="200" controls><source src="${safeContent}" type="video/mp4"></video>`,
                        }}
                        style={styles.media}
                    />
                ) : (
                    <Text style={styles.unknownTypeText}>⚠️ Unknown message type</Text>
                )}
            </View>
        );
    };

    const renderEmoji = ({ item }: { item: string }) => (
        <TouchableOpacity
            onPress={() => {
                console.log("😀 Emoji selected:", item);
                onEmojiSelect(item);
                setIsEmojiOpen(false);
            }}
            style={styles.emojiItem}
        >
            <Text style={styles.emojiText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require("../images/icon_back.png")} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{String(conversationName || "Chat")}</Text>
                <View
                    style={[
                        styles.statusDot,
                        { backgroundColor: isOnline ? "#00ff00" : "#ccc" },
                    ]}
                />
                <Text style={styles.statusText}>{isOnline ? "Online" : "Offline"}</Text>
            </View>

            {/* Danh sách tin nhắn */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => String(item.getMessageId?.() ?? Math.random().toString())}
                style={styles.messageList}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={() => setIsEmojiOpen(true)}>
                    <Image source={require("../images/icon_emoji.png")} style={styles.icon} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={(text) => {
                        console.log("⌨️ Typing:", text);
                        setNewMessage(text);
                    }}
                    placeholder="Type a message..."
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMedia}>
                    <Image source={require("../images/icon_image.png")} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={sendMessage}>
                    <Image source={require("../images/icon_send.png")} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* Emoji Modal */}
            <Modal
                visible={isEmojiOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsEmojiOpen(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsEmojiOpen(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.emojiModal}>
                            <FlatList
                                data={FIXED_EMOJIS}
                                renderItem={renderEmoji}
                                keyExtractor={(item) => item}
                                numColumns={5}
                                contentContainerStyle={styles.emojiGrid}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0f2f5" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10, flex: 1 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 5 },
    statusText: { fontSize: 12, color: "#666", marginLeft: 5 },
    messageList: { flex: 1, padding: 10 },
    messageContainer: { maxWidth: "70%", marginVertical: 5 },
    sentContainer: { alignSelf: "flex-end" },
    receivedMessage: {
        backgroundColor: "#e9ecef",
        padding: 10,
        borderRadius: 10,
        borderTopLeftRadius: 0,
    },
    sentMessage: {
        backgroundColor: "#0084ff",
        color: "#fff",
        padding: 10,
        borderRadius: 10,
        borderTopRightRadius: 0,
    },
    media: { width: 200, height: 200, borderRadius: 10 },
    unknownTypeText: {
        backgroundColor: "#ffcccc",
        padding: 8,
        borderRadius: 10,
        color: "#900",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 10,
        marginHorizontal: 5,
    },
    icon: { width: 24, height: 24, marginHorizontal: 5 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    emojiModal: {
        backgroundColor: "#fff",
        padding: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    emojiGrid: { justifyContent: "space-around" },
    emojiItem: { padding: 5, alignItems: "center" },
    emojiText: { fontSize: 24 },
});

export default ChatScreen;
