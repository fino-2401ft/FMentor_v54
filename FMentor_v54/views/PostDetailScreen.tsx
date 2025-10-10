import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { CommentRepository } from "../repositories/CommentRepository";
import { PostRepository } from "../repositories/PostRepository";
import { Comment } from "../models/Comment";
import { Post } from "../models/Post";
import { User } from "../models/User";
import PostCard from "../components/PostCard";
import { ActivityIndicator } from "react-native-paper"; 
import { useNewsfeedViewModel } from "../viewmodels/NewsfeedViewModel";
import Header from "../components/Header";

const PostDetailScreen = () => {
    const route = useRoute();
    const { postId } = route.params as { postId: string };
    const { currentUser } = useAuth();
    const navigation = useNavigation();
    const { deletePost, selectPostForEdit } = useNewsfeedViewModel();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentAuthors, setCommentAuthors] = useState<{ [key: string]: User }>({});

    useEffect(() => {
        const unsubscribePost = PostRepository.listenToPost(postId, setPost);
        const unsubscribeComments = CommentRepository.listenToComments(postId, (newComments) => {
            setComments(newComments);
            newComments.forEach(async (comment) => {
                if (!commentAuthors[comment.getAuthorId()]) {
                    const user = await User.getUserById(comment.getAuthorId());
                    if (user) {
                        setCommentAuthors((prev) => ({ ...prev, [comment.getAuthorId()]: user }));
                    }
                }
            });
        });
        return () => {
            unsubscribePost();
            unsubscribeComments();
        };
    }, [postId]);

    const handleAddComment = async () => {
        if (!currentUser || !newComment.trim()) return;
        try {
            await CommentRepository.createComment(postId, currentUser.getUserId(), newComment.trim());
            setNewComment("");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const handleDeleteComment = async (commentId: string, authorId: string) => {
        Alert.alert("Delete Comment", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        await CommentRepository.deleteComment(postId, commentId, authorId);
                    } catch (error: any) {
                        Alert.alert("Error", error.message);
                    }
                },
            },
        ]);
    };

    const handleDeletePost = async (postId: string, authorId: string) => {
        Alert.alert("Delete Post", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete",
                onPress: async () => {
                    try {
                        await deletePost(postId, authorId);
                        navigation.goBack();
                    } catch (error: any) {
                        Alert.alert("Error", error.message);
                    }
                },
            },
        ]);
    };

    const renderComment = ({ item }: { item: Comment }) => {
        const author = commentAuthors[item.getAuthorId()];
        const isOwnComment = item.getAuthorId() === currentUser?.getUserId();

        return (
            <View style={styles.commentContainer}>
                <View style={styles.commentHeader}>
                    {author?.getAvatarUrl() ? (
                        <Image source={{ uri: author.getAvatarUrl() }} style={styles.commentAvatar} />
                    ) : (
                        <View style={styles.commentAvatarPlaceholder} />
                    )}
                    <View style={styles.commentContent}>
                        <Text style={styles.commentAuthor}>{author?.getUsername() || "Unknown"}</Text>
                        <Text style={styles.commentText}>{item.getContent()}</Text>
                    </View>
                </View>
                {isOwnComment && (
                    <TouchableOpacity
                        style={styles.deleteCommentButton}
                        onPress={() => handleDeleteComment(item.getCommentId(), item.getAuthorId())}
                    >
                        <Text style={styles.deleteCommentText}>Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (!post) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#1E90FF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header />
            <PostCard
                post={post}
                onEdit={selectPostForEdit}
                onDelete={handleDeletePost}
            />
            <View style={styles.commentInputContainer}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                />
                <TouchableOpacity style={styles.commentSubmitButton} onPress={handleAddComment}>
                    <Text style={styles.commentSubmitText}>Post</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.getCommentId()}
                style={styles.commentList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    commentInputContainer: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#FFFFFF",
        margin: 10,
        borderRadius: 10,
        elevation: 2,
    },
    commentInput: {
        flex: 1,
        minHeight: 40,
        padding: 10,
        backgroundColor: "#F0F0F0",
        borderRadius: 10,
        marginRight: 10,
    },
    commentSubmitButton: {
        backgroundColor: "#1E90FF",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    commentSubmitText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    commentList: {
        flex: 1,
    },
    commentContainer: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        alignItems: "center",
    },
    commentHeader: {
        flex: 1,
        flexDirection: "row",
    },
    commentAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    commentAvatarPlaceholder: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#CCC",
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentAuthor: {
        fontWeight: "bold",
        fontSize: 14,
    },
    commentText: {
        fontSize: 14,
        color: "#333",
    },
    deleteCommentButton: {
        padding: 5,
    },
    deleteCommentText: {
        color: "#FF6347",
        fontSize: 14,
    },
});

export default PostDetailScreen;
