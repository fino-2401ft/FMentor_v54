// navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "../views/LoginView";
import RegisterScreen from "../views/RegisterView";
import HomeScreen from "../views/HomeScreen";
import CourseDetailScreen from "../views/CourseDetailScreen";
import LessonDetailScreen from "../views/LessonDetailScreen"; // Thêm import
import { useAuth } from "../context/AuthContext";

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    CourseDetail: { courseId: string };
    LessonDetail: { lessonId: string; courseId: string }; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return null; // hoặc hiển thị LoadingScreen
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {currentUser ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
                        <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
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