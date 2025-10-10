
import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNewsfeedViewModel } from "../viewmodels/NewsfeedViewModel";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator"; // Import RootStackParamList

interface PostCardProps {
    post: Post;
    onEdit: (post: Post) => void;
    onDelete: (postId: string, authorId: string) => void;
}

const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
    const { currentUser } = useAuth();
    const { likePost, unlikePost } = useNewsfeedViewModel();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const isLiked = post.getLikes().includes(currentUser?.getUserId() || "");
    const isOwnPost = post.getAuthorId() === currentUser?.getUserId();
    const [author, setAuthor] = useState<User | null>(null);

    useEffect(() => {
        const fetchAuthor = async () => {
            const user = await User.getUserById(post.getAuthorId());
            setAuthor(user);
        };
        fetchAuthor();
    }, [post.getAuthorId()]);

    const handleLike = () => {
        if (isLiked) {
            unlikePost(post.getPostId());
        } else {
            likePost(post.getPostId());
        }
    };

    const handleComment = () => {
        navigation.navigate("PostDetail", { postId: post.getPostId() });
    };

    const timeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.authorInfo}>
                    {author?.getAvatarUrl() ? (
                        <Image source={{ uri: author.getAvatarUrl() }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder} />
                    )}
                    <View>
                        <Text style={styles.authorName}>{author?.getUsername() || "Unknown"}</Text>
                        <Text style={styles.timestamp}>{timeAgo(post.getTimestamp())}</Text>
                    </View>
                </View>
                {isOwnPost && (
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => onEdit(post)}>
                            <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(post.getPostId(), post.getAuthorId())}>
                            <Text style={styles.actionText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <Text style={styles.content}>{post.getContent()}</Text>
            {post.getMediaUrl() && (
                <Image source={{ uri: post.getMediaUrl() }} style={styles.media} resizeMode="cover" />
            )}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
                    <Image
                        source={isLiked ? require("../images/icon_redheart.png") : require("../images/icon_heart.png")}
                        style={styles.heartIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.likeCount}>{post.getLikes().length}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.commentButton} onPress={handleComment}>
                    <Image
                        source={require("../images/icon_comment.png")}
                        style={styles.commentIcon}
                        resizeMode="contain"
                    />
                    <Text style={styles.commentCount}>{post.getComments().length}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    authorInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#CCC",
        marginRight: 10,
    },
    authorName: {
        fontWeight: "bold",
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        color: "#888",
    },
    actions: {
        flexDirection: "row",
    },
    actionText: {
        color: "#1E90FF",
        fontSize: 14,
        marginLeft: 10,
    },
    content: {
        fontSize: 16,
        marginBottom: 10,
    },
    media: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    likeButton: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },
    heartIcon: {
        width: 20,
        height: 20,
    },
    likeCount: {
        marginLeft: 5,
        fontSize: 14,
        color: "#333",
    },
    commentButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    commentIcon: {
        width: 20,
        height: 20,
        tintColor: "#888",
    },
    commentCount: {
        marginLeft: 5,
        fontSize: 14,
        color: "#333",
    },
});

export default PostCard;
