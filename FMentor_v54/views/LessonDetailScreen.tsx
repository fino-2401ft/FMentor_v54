import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    ViewStyle,
    TextStyle,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import Navbar from "../components/Navbar";
import { Button } from "react-native-paper";
import WebView from "react-native-webview";
import { useLessonDetailViewModel } from "../viewmodels/LessonDetailViewModel";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Styles {
    container: ViewStyle;
    center: ViewStyle;
    scrollContent: ViewStyle;
    lessonTitle: TextStyle;
    lessonContent: TextStyle;
    videoContainer: ViewStyle;
    video: ViewStyle;
    section: ViewStyle;
    sectionTitle: TextStyle;
    actionBar: ViewStyle;
    button: ViewStyle;
    returnButton: ViewStyle;
    returnButtonText: TextStyle;
    completeButton: ViewStyle;
    completeButtonDisabled: ViewStyle;
    nextButton: ViewStyle;
    buttonText: TextStyle;
    errorText: TextStyle;
    navbarContainer: ViewStyle;
}

export default function LessonDetailScreen() {
    const { currentUser } = useAuth();
    const userId = currentUser?.getUserId() || "defaultUserId";

    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp>();
    const { lessonId, courseId } = route.params;

    const {
        lesson,
        isCompleted,
        loading,
        error,
        markLessonCompleted,
        getNextLessonId,
        getPreviousLessonId
    } = useLessonDetailViewModel(lessonId, courseId, userId);

    const handleCompleteLesson = async () => {
        try {
            const success = await markLessonCompleted();
            if (success) {
                Alert.alert("Success", "Lesson marked as completed");
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to mark lesson completed");
        }
    };

    const handlePreviousLesson = () => {
        const prevLessonId = getPreviousLessonId(); // gọi từ ViewModel
        if (prevLessonId) {
            navigation.navigate("LessonDetail", { lessonId: prevLessonId, courseId });
        } else {
            Alert.alert("Info", "This is the first lesson in the course");
        }
    };

    const handleNextLesson = () => {
        const nextLessonId = getNextLessonId();
        if (nextLessonId) {
            navigation.navigate("LessonDetail", { lessonId: nextLessonId, courseId });
        } else {
            Alert.alert("Info", "This is the last lesson in the course");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E90FF" />
            </View>
        );
    }

    if (error || !lesson) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error || "Lesson not found"}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header />

            {/* Nội dung */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Lesson Title */}
                <Text style={styles.lessonTitle}>{lesson.getTitle()}</Text>

                {/* Section 1: Online Lecture */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Online Lecture 🎥</Text>
                    {lesson.getVideoUrl() && (
                        <View style={styles.videoContainer}>
                            <WebView
                                source={{ uri: lesson.getVideoUrl()! }}
                                style={styles.video}
                                allowsFullscreenVideo
                                javaScriptEnabled
                                mediaPlaybackRequiresUserAction={false}
                            />
                        </View>
                    )}
                </View>

                {/* Section 2: Content */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Content 📖</Text>
                    <Text style={styles.lessonContent}>{lesson.getContent()}</Text>
                </View>
            </ScrollView>

            {/* Sticky Buttons */}
            <View style={styles.actionBar}>
                <Button
                    mode="contained"
                    onPress={handlePreviousLesson}
                    style={[styles.button, styles.returnButton]}
                    labelStyle={[styles.buttonText, styles.returnButtonText]}
                >
                    Previous
                </Button>

                <Button
                    mode="contained"
                    onPress={handleCompleteLesson}
                    style={[
                        styles.button,
                        isCompleted ? styles.completeButtonDisabled : styles.completeButton,
                    ]}
                    labelStyle={styles.buttonText}
                    disabled={isCompleted}
                >
                    {isCompleted ? "Done" : "Complete"}
                </Button>
                <Button
                    mode="contained"
                    onPress={handleNextLesson}
                    style={[styles.button, styles.nextButton]}
                    labelStyle={styles.buttonText}
                >
                    Next
                </Button>
            </View>

            {/* Navbar */}
            <View style={styles.navbarContainer}>
                <Navbar />
            </View>
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120, // để chừa chỗ cho actionBar + Navbar
    },
    lessonTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E90FF",
        marginBottom: 16,
        textAlign: "center",
    },
    section: {
        marginBottom: 20,
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        color: "#1E90FF",
    },
    lessonContent: {
        fontSize: 16,
        color: "#333",
        lineHeight: 24,
        textAlign: "justify",
    },
    videoContainer: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    video: {
        flex: 1,
    },
    actionBar: {
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#fff",
        zIndex: 10,
    },
    button: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    returnButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#1E90FF",
    },
    returnButtonText: {
        color: "#1E90FF",
    },
    completeButton: {
        backgroundColor: "#1E90FF",
    },
    completeButtonDisabled: {
        backgroundColor: "#CCCCCC",
    },
    nextButton: {
        backgroundColor: "#1E90FF",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    errorText: {
        fontSize: 18,
        color: "#333",
    },
    navbarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
});
