import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import LoginController from "../context/Login";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LoginView = () => {
    const { loading } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const { email, setEmail, password, setPassword, handleLogin } = LoginController();
    const [showPassword, setShowPassword] = useState(false);

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
                <Image
                    source={require("../images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {loading && <ActivityIndicator size="large" color="#1E90FF" />}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#A9A9A9"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#A9A9A9"
                    />
                    <TouchableOpacity
                        style={styles.showButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => Alert.alert("Forgot Password", "This feature is not implemented yet.")}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={onLoginPress}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate("Register")}
                    disabled={loading}
                >
                    <Text style={styles.secondaryButtonText}>Create an Account</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    inputContainer: {
        width: "85%",
        marginBottom: 15,
        position: "relative",
    },
    input: {
        height: 50,
        borderColor: "#E0E0E0",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: "#FFFFFF",
        fontSize: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    showButton: {
        position: "absolute",
        right: 10,
        top: 15,
    },
    showButtonText: {
        color: "#4682B4",
        fontSize: 14,
        fontWeight: "500",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginRight: "15%",
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: "#4682B4",
        fontSize: 14,
        fontWeight: "500",
    },
    button: {
        width: "85%",
        backgroundColor: "#1E90FF",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonDisabled: {
        backgroundColor: "#A9A9A9",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        width: "85%",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#4682B4",
    },
    secondaryButtonText: {
        color: "#4682B4",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default LoginView;