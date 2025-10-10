import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useNewsfeedViewModel } from "../viewmodels/NewsfeedViewModel";
import Header from "../components/Header";
import PostCard from "../components/PostCard";
import NavBar from "../components/Navbar";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator } from "react-native-paper";
import { Post } from "../models/Post";

const NewsfeedScreen = () => {
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  const {
    posts,
    loading,
    content,
    setContent,
    mediaUri,
    setMediaUri,
    isPosting,
    isEditing,
    post,
    editPost,
    deletePost,
    selectPostForEdit,
  } = useNewsfeedViewModel();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!currentUser || !content.trim()) return;
    const success = isEditing ? await editPost() : await post();
    if (success) {
      setContent("");
      setMediaUri(undefined);
      setShowCreatePost(false);
    }
  };

  const handleDelete = async (postId: string, authorId: string) => {
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deletePost(postId, authorId);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onEdit={selectPostForEdit}
      onDelete={handleDelete}
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity
        style={styles.mindContainer}
        onPress={() => setShowCreatePost(true)}
      >
        <Text style={styles.mindText}>What's on your mind?</Text>
      </TouchableOpacity>
      {showCreatePost && (
        <View style={styles.createPostContainer}>
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity onPress={pickMedia}>
            <Text style={styles.mediaButton}>Add Media</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? "Posting..." : isEditing ? "Update" : "Post"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowCreatePost(false);
              setContent("");
              setMediaUri(undefined);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={posts.sort((a, b) => b.getTimestamp() - a.getTimestamp())}
        renderItem={renderPost}
        keyExtractor={(item) => item.getPostId()}
        style={styles.postList}
      />

      <NavBar />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  mindContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  mindText: {
    color: "#888",
    fontSize: 16,
  },
  createPostContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    elevation: 2,
  },
  postInput: {
    minHeight: 60,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#F0F0F0",
    marginBottom: 10,
  },
  mediaButton: {
    color: "#1E90FF",
    fontSize: 14,
    marginBottom: 10,
  },
  postButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  postButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF6347",
    fontSize: 14,
  },
  postList: {
    flex: 1,
  },
});

export default NewsfeedScreen;