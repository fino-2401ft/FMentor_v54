// components/ConversationCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ConversationType } from "../models/Conversation";
import { RootStackParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ConversationCardProps {
    conversationId: string;
    name: string;
    avatarUrl: string;
    lastMessage: string;
    lastUpdate: number;
    isOnline: boolean;
    type: ConversationType;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
    conversationId,
    name,
    avatarUrl,
    lastMessage,
    lastUpdate,
    isOnline,
    type,
}) => {
    const navigation = useNavigation<NavigationProp>();

    const formattedTime = new Date(lastUpdate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("Chat", { conversationId })}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: avatarUrl || "https://i.pravatar.cc/150?img=1" }}
                    style={styles.avatar}
                />
                <View style={[styles.statusDot, { backgroundColor: isOnline ? "#00ff00" : "#ccc" }]} />
            </View>
            <View style={styles.info}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.time}>{formattedTime}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {lastMessage || "No messages yet"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatarContainer: { position: "relative", marginRight: 10 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: "absolute",
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: "#fff",
    },
    info: { flex: 1 },
    header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
    name: { fontSize: 16, fontWeight: "bold", flex: 1 },
    time: { fontSize: 12, color: "#666" },
    lastMessage: { fontSize: 14, color: "#666" },
});

export default ConversationCard;