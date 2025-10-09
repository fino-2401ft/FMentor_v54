import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useMessengerViewModel, ConversationCard } from "../viewmodels/MessengerViewModel";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { User } from "../models/User";
import { ConversationType } from "../models/Conversation";
import { MessageRepository } from "../repositories/MessageRepository";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MessengerScreen = () => {
    const { currentUser } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const {
        conversations,
        searchTerm,
        searchResults,
        activeTab,
        loading,
        setActiveTab,
        handleSearch,
        createNewConversation,
    } = useMessengerViewModel(currentUser?.getUserId() || "");

    const markLastMessageAsSeen = async (conversationId: string) => {
        const lastMessage = await MessageRepository.getLastMessage(conversationId);
        if (lastMessage && lastMessage.getSenderId() !== currentUser?.getUserId()) {
            await MessageRepository.markMessageAsSeen(lastMessage.getMessageId(), conversationId, currentUser?.getUserId() || "");
        }
    };

    const renderConversation = ({ item }: { item: ConversationCard }) => (
        <TouchableOpacity
            style={styles.conversationCard}
            onPress={async () => {
                await markLastMessageAsSeen(item.conversationId);
                navigation.navigate("Chat", { conversationId: item.conversationId });
            }}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                {item.isOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>{item.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderSearchResult = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.searchResult}
            onPress={async () => {
                const existingConv = conversations.find(
                    (conv) =>
                        conv.type === ConversationType.Private &&
                        conv.participants.includes(item.getUserId()) &&
                        conv.participants.includes(currentUser?.getUserId() || "")
                );
                if (existingConv) {
                    await markLastMessageAsSeen(existingConv.conversationId);
                    navigation.navigate("Chat", { conversationId: existingConv.conversationId });
                } else {
                    const conversationId = await createNewConversation(item.getUserId());
                    navigation.navigate("Chat", { conversationId });
                }
            }}
        >
            <Image source={{ uri: item.getAvatarUrl() || "https://i.pravatar.cc/150?img=1" }} style={styles.avatar} />
            <Text style={styles.searchResultName}>{item.getUsername()}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header />
            <TextInput
                style={styles.searchBar}
                placeholder="Search by username or ID"
                value={searchTerm}
                onChangeText={handleSearch}
            />
            {searchResults.length > 0 && (
                <FlatList
                    data={searchResults}
                    renderItem={renderSearchResult}
                    keyExtractor={(item) => item.getUserId()}
                    style={styles.searchResults}
                />
            )}
            {searchTerm.length > 0 && searchResults.length === 0 && (
                <Text style={styles.noResults}>No users found</Text>
            )}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Private" && styles.activeTab]}
                    onPress={() => setActiveTab("Private")}
                >
                    <Text style={[styles.tabText, activeTab === "Private" && styles.activeTabText]}>Private Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "Course" && styles.activeTab]}
                    onPress={() => setActiveTab("Course")}
                >
                    <Text style={[styles.tabText, activeTab === "Course" && styles.activeTabText]}>Course Chat</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0084ff" />
            ) : (
                <FlatList
                    data={conversations.filter((conv) => activeTab === "Private" ? conv.type === ConversationType.Private : conv.type === ConversationType.CourseChat)}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.conversationId}
                    ListEmptyComponent={<Text style={styles.noConversations}>No {activeTab.toLowerCase()} conversations yet</Text>}
                />
            )}
            <Navbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    searchBar: {
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f2f5",
        margin: 10,
        paddingHorizontal: 15,
    },
    searchResults: { maxHeight: 200, marginHorizontal: 10 },
    searchResult: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchResultName: { fontSize: 16, marginLeft: 10, color: "#050505" },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarContainer: { position: "relative", marginRight: 10 },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#31cc46",
        position: "absolute",
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: "#fff",
    },
    tabContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
    tab: { paddingVertical: 10, paddingHorizontal: 20 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#0084ff" },
    tabText: { fontSize: 16, color: "#65676b" },
    activeTabText: { color: "#0084ff", fontWeight: "bold" },
    noResults: { textAlign: "center", color: "#65676b", margin: 10 },
    noConversations: { textAlign: "center", color: "#65676b", marginTop: 20 },
    conversationCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    conversationInfo: { flex: 1, marginLeft: 10 },
    conversationName: { fontSize: 16, fontWeight: "bold", color: "#050505" },
    lastMessage: { fontSize: 14, color: "#65676b", marginTop: 2 },
});

export default MessengerScreen;