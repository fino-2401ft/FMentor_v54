// views/LoginView.tsx
import React from "react";
import {
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import LoginController from "../controllers/LoginController";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const LoginView = () => {
    const { loading } = useAuth() as { loading: boolean };
    const navigation = useNavigation<NavigationProp>();
    const { email, setEmail, password, setPassword, handleLogin } = LoginController();

    const onLoginPress = async () => {
        try {
            const success = await handleLogin();
            if (!success) {
                Alert.alert("Login failed", "Wrong credentials!");
            }
        } catch (error: any) {
            console.error("Login error:", error.message);
            Alert.alert("Login error", error.message);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                {loading && <ActivityIndicator size="large" color="#1E90FF" />}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Button
                    title="Login"
                    onPress={onLoginPress}
                    color="#1E90FF"
                    disabled={loading}
                />
                <Button
                    title="Go to Register"
                    onPress={() => navigation.navigate("Register")}
                    color="#4682B4"
                    disabled={loading}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    input: {
        width: "80%",
        height: 50,
        borderColor: "#4682B4",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: "#F0F8FF",
    },
});

export default LoginView;
