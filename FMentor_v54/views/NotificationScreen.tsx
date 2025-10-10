import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { NotificationViewModel } from "../viewmodels/NotificationViewModel";
import { Notification } from "../models/Notification";
import { ActivityIndicator } from "react-native-paper";
import { User } from "../models/User";
import { PostRepository } from "../repositories/PostRepository";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator"; // Giả sử đường dẫn đúng
import Header from "../components/Header";
import Navbar from "../components/Navbar";


const NotificationScreen = () => {
    const { notifications, loading, markAsRead } = NotificationViewModel();
    const [notificationAuthors, setNotificationAuthors] = useState<{ [key: string]: User }>({});
    const [posts, setPosts] = useState<{ [key: string]: any }>({}); // Lưu trữ bài đăng tạm thời
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    useEffect(() => {
        const fetchAuthors = async () => {
            const authors: { [key: string]: User } = {};
            const unsubscribeFunctions: (() => void)[] = [];

            for (const notification of notifications) {
                const unsubscribe = PostRepository.listenToPost(notification.getPostId(), (post) => {
                    if (post) {
                        setPosts((prev) => ({ ...prev, [notification.getPostId()]: post }));
                        if (!authors[post.getAuthorId()]) {
                            User.getUserById(post.getAuthorId()).then((user) => {
                                if (user) {
                                    setNotificationAuthors((prev) => ({ ...prev, [post.getAuthorId()]: user }));
                                }
                            });
                        }
                    }
                });
                unsubscribeFunctions.push(unsubscribe);
            }

            return () => unsubscribeFunctions.forEach((unsub) => unsub());
        };
        fetchAuthors();
    }, [notifications]);

    const handleNotificationPress = (item: Notification) => {
        if (!item.isRead()) {
            markAsRead(item.getNotificationId());
        }
        navigation.navigate("PostDetail", { postId: item.getPostId() });
    };

    const renderNotification = ({ item }: { item: Notification }) => {
        const post = posts[item.getPostId()];
        const author = post ? notificationAuthors[post.getAuthorId()] : notificationAuthors[item.getUserId()];
        const notificationText = item.getType() === "Like"
            ? `${author?.getUsername() || "Someone"} liked your post`
            : `${author?.getUsername() || "Someone"} commented on your post`;

        return (
            <TouchableOpacity
                style={styles.notificationContainer}
                onPress={() => handleNotificationPress(item)}
            >
                <Text style={[styles.notificationText, item.isRead() && styles.readNotification]}>
                    {notificationText}
                </Text>
                <Text style={styles.timestamp}>{new Date(item.getTimestamp()).toLocaleString()}</Text>
            </TouchableOpacity>
        );
    };

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
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.getNotificationId()}
                style={styles.notificationList}
            />
            <Navbar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    notificationList: {
        flex: 1,
    },
    notificationContainer: {
        backgroundColor: "#FFFFFF",
        margin: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
    },
    notificationText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    readNotification: {
        fontWeight: "normal",
        color: "#666",
    },
    timestamp: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
    },
});

export default NotificationScreen;