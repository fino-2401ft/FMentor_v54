// screens/MessengerScreen.tsx
import React from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useMessengerViewModel, ConversationCard } from "../viewmodels/MessengerViewModel";
import ConversationCardComponent from "../components/ConversationCard"; // Import component từ components
import Header from "../components/Header";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { User } from "../models/User";

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

  const renderConversation = ({ item }: { item: ConversationCard }) => (
    <ConversationCardComponent
      conversationId={item.conversationId}
      name={item.name}
      avatarUrl={item.avatarUrl}
      lastMessage={item.lastMessage}
      lastUpdate={item.lastUpdate}
      isOnline={item.isOnline}
      type={item.type}
    />
  );

  const renderSearchResult = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={async () => {
        const conversationId = await createNewConversation(item.getUserId());
        navigation.navigate("Chat", { conversationId });
      }}
    >
      <Image source={{ uri: item.getAvatarUrl() }} style={styles.avatar} />
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
          <Text style={styles.tabText}>Private Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Course" && styles.activeTab]}
          onPress={() => setActiveTab("Course")}
        >
          <Text style={styles.tabText}>Course Chat</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.conversationId}
          ListEmptyComponent={<Text style={styles.noConversations}>No conversations yet</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
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
  searchResultName: { fontSize: 16, marginLeft: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  tab: { padding: 10 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#007bff" },
  tabText: { fontSize: 16, color: "#007bff" },
  noResults: { textAlign: "center", color: "#666", margin: 10 },
  noConversations: { textAlign: "center", color: "#666", marginTop: 20 },
});

export default MessengerScreen;