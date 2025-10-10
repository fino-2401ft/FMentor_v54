import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import RegisterScreen from "../views/RegisterView";
import HomeScreen from "../views/HomeScreen";
import CourseDetailScreen from "../views/CourseDetailScreen";
import LessonDetailScreen from "../views/LessonDetailScreen";
import { useAuth } from "../context/AuthContext";
import MyCourseScreen from "../views/MyCourseScreen";
import AddCourseScreen from "../views/AddCourseScreen";
import AddLessonScreen from "../views/AddLessonScreen";
import EditLessonScreen from "../views/EditLessonScreen";
import MessengerScreen from "../views/MessengerScreen";
import MeetingScreen from "../views/MeetingScreen";
import { ChatScreen } from "../views/ChatScreen";
import LoginView from "../views/LoginView";
import ProfileView from "../views/ProfileView";
import NewsfeedScreen from "../views/NewsfeedScreen";
import PostDetailScreen from "../views/PostDetailScreen";
import NotificationScreen from "../views/NotificationScreen";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    CourseDetail: { courseId: string };
    LessonDetail: { lessonId: string; courseId: string };
    MyCourses: undefined;
    AddCourse: undefined;
    AddLesson: { courseId: string };
    EditLesson: { lessonId: string; courseId: string };
    Messenger: undefined;
    Chat: { conversationId: string };
    Meeting: { courseId: string; meetingId: string };
    Profile: undefined;
    Newsfeed: undefined;
    PostDetail: { postId: string };
    Notification: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E90FF" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {currentUser ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Newsfeed" component={NewsfeedScreen} />
                        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                        <Stack.Screen name="Notification" component={NotificationScreen} />
                        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                        <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
                        <Stack.Screen name="MyCourses" component={MyCourseScreen} />
                        <Stack.Screen name="AddCourse" component={AddCourseScreen} options={{ title: "Add Course" }} />
                        <Stack.Screen name="AddLesson" component={AddLessonScreen} />
                        <Stack.Screen name="EditLesson" component={EditLessonScreen} />
                        <Stack.Screen name="Messenger" component={MessengerScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                        <Stack.Screen name="Meeting" component={MeetingScreen} />
                        <Stack.Screen name="Profile" component={ProfileView} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginView} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F6FA",
    },
});

export default AppNavigator;