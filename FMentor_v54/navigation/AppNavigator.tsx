// navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../views/LoginView";
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
import ChatScreen from "../views/ChatScreen";


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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {currentUser ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                        <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
                        <Stack.Screen name="MyCourses" component={MyCourseScreen} />
                        <Stack.Screen name="AddCourse" component={AddCourseScreen} options={{ title: "Add Course" }} />
                        <Stack.Screen name="AddLesson" component={AddLessonScreen} />
                        <Stack.Screen name="EditLesson" component={EditLessonScreen} />
                        <Stack.Screen name="Messenger" component={MessengerScreen} />
                        <Stack.Screen name="Chat" component={ChatScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;