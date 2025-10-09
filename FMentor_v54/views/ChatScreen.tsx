import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Modal, TouchableWithoutFeedback, Keyboard, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useChatViewModel } from "../viewmodels/ChatViewModel";
import { Message, MessageType } from "../models/Message";
import { WebView } from "react-native-webview";
import { useAuth } from "../context/AuthContext";
import { KeyboardAvoidingView } from "react-native";

const FIXED_EMOJIS = ["😀", "😂", "😍", "👍", "👎", "🎉", "❤️", "😢", "😴", "🤔"];

type RouteParams = { conversationId: string };

export const ChatScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { currentUser } = useAuth();
    const { conversationId } = route.params as RouteParams;
    const {
        messages,
        newMessage,
        setNewMessage,
        isEmojiOpen,
        setIsEmojiOpen,
        conversationName,
        conversationAvatar,
        isOnline,
        sendMessage,
        sendMedia,
        setTyping,
        onEmojiSelect,
    } = useChatViewModel(conversationId);
    const [senderAvatars, setSenderAvatars] = useState<{ [key: string]: string }>({});
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const fetchAvatars = async () => {
            const avatars: { [key: string]: string } = {};
            for (const message of messages) {
                if (!senderAvatars[message.getSenderId()] && !avatars[message.getSenderId()]) {
                    const avatar = await message.getSenderAvatarUrl();
                    if (avatar) avatars[message.getSenderId()] = avatar;
                }
            }
            if (Object.keys(avatars).length > 0) {
                setSenderAvatars((prev) => ({ ...prev, ...avatars }));
            }
        };
        fetchAvatars();
    }, [messages]);

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isSentByCurrentUser = item.getSenderId() === currentUser?.getUserId();
        const isLastSentMessage = isSentByCurrentUser && index === messages.filter(m => m.getSenderId() === currentUser?.getUserId()).length - 1;
        const messageStyle = isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage;
        const containerStyle = isSentByCurrentUser ? styles.sentContainer : styles.receivedContainer;
        const senderAvatar = senderAvatars[item.getSenderId()] || "https://i.pravatar.cc/150?img=1";

        return (
            <View style={[styles.messageContainer, containerStyle]}>
                {!isSentByCurrentUser && (
                    <Image source={{ uri: senderAvatar }} style={styles.avatar} />
                )}
                {item.getType() === MessageType.Text ? (
                    <Text style={messageStyle}>{item.getContent()}</Text>
                ) : item.getType() === MessageType.Image ? (
                    <Image source={{ uri: item.getContent() }} style={styles.media} />
                ) : item.getType() === MessageType.Video ? (
                    <WebView
                        source={{ html: `<video width="200" height="200" controls><source src="${item.getContent()}" type="video/mp4"></video>` }}
                        style={styles.media}
                    />
                ) : (
                    <Text style={styles.unknownTypeText}>⚠️ Unknown message type</Text>
                )}
                {isLastSentMessage && (
                    <Text style={styles.seenText}>{item.getSeenBy().length > 1 ? "Seen" : "Sent"}</Text>
                )}
            </View>
        );
    };

    const renderEmoji = ({ item }: { item: string }) => (
        <TouchableOpacity
            onPress={() => onEmojiSelect(item)}
            style={styles.emojiItem}
        >
            <Text style={styles.emojiText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image source={require("../images/icon_back.png")} style={styles.icon} />
                </TouchableOpacity>
                <Image source={{ uri: conversationAvatar }} style={styles.avatarHeader} />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{conversationName}</Text>
                    {isOnline && <View style={styles.onlineDot} />}
                </View>
            </View>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.getMessageId()}
                style={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
                <View style={styles.iconGroup}>
                    <TouchableOpacity onPress={() => setIsEmojiOpen(true)} style={styles.iconButton}>
                        <Image source={require("../images/icon_emoji.png")} style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={sendMedia} style={styles.iconButton}>
                        <Image source={require("../images/icon_image.png")} style={styles.icon} />
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={(text) => {
                        setNewMessage(text);
                        setTyping(text.length > 0);
                    }}
                    placeholder="Type a message..."
                    onSubmitEditing={sendMessage}
                    onFocus={() => Keyboard.isVisible() && flatListRef.current?.scrollToEnd({ animated: true })}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Image source={require("../images/icon_send.png")} style={styles.icon} />
                </TouchableOpacity>
            </View>
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0f2f5" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 12,
        backgroundColor: "transparent",
        borderBottomWidth: 0,
        borderBottomColor: "#ddd",
        marginTop: 35
    },
    backButton: { marginRight: 10 },
    avatarHeader: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#050505" },
    onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#31cc46", marginTop: 4 },
    messageList: { flex: 1, padding: 10 },
    messageContainer: { flexDirection: "row", marginVertical: 5, maxWidth: "80%" },
    sentContainer: { alignSelf: "flex-end", flexDirection: "row-reverse" },
    receivedContainer: { alignSelf: "flex-start" },
    avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
    sentMessage: {
        backgroundColor: "#0084ff",
        color: "#fff",
        padding: 10,
        borderRadius: 15,
        borderBottomRightRadius: 5,
    },
    receivedMessage: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 15,
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    media: { width: 200, height: 200, borderRadius: 10 },
    unknownTypeText: {
        backgroundColor: "#ffcccc",
        padding: 8,
        borderRadius: 10,
        color: "#900",
    },
    seenText: { fontSize: 10, color: "#65676b", alignSelf: "flex-end", marginTop: 2 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        paddingBottom: 30,
        backgroundColor: "transparent",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
    },
    iconGroup: { flexDirection: "row", marginRight: 8 },
    iconButton: { marginRight: 8 },
    input: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 12,
        backgroundColor: "#f0f2f5",
        borderWidth: 0,
    },
    sendButton: { marginLeft: 8 },
    icon: { width: 24, height: 24 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    emojiModal: {
        backgroundColor: "#fff",
        padding: 12,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    emojiGrid: { justifyContent: "space-around" },
    emojiItem: { padding: 10, alignItems: "center" },
    emojiText: { fontSize: 24 },
});

export default ChatScreen;