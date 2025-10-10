import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import RegisterController from "../context/Register";
import { RootStackParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterView = () => {
    const { loading } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const { username, setUsername, email, setEmail, password, setPassword, rePassword, setRePassword, avatarUri, setAvatarUri, handleRegister } = RegisterController();
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access gallery is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Your Account</Text>
            {loading && <ActivityIndicator size="large" color="#1E90FF" />}
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>Choose Avatar</Text>
                    </View>
                )}
            </TouchableOpacity>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#A9A9A9"
                />
            </View>
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
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Re-password"
                    value={rePassword}
                    onChangeText={setRePassword}
                    secureTextEntry={!showRePassword}
                    placeholderTextColor="#A9A9A9"
                />
                <TouchableOpacity
                    style={styles.showButton}
                    onPress={() => setShowRePassword(!showRePassword)}
                >
                    <Text style={styles.showButtonText}>{showRePassword ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate("Login")}
                disabled={loading}
            >
                <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
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
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1E90FF",
        marginBottom: 20,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#4682B4",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#4682B4",
    },
    avatarPlaceholderText: {
        color: "#4682B4",
        fontSize: 14,
        fontWeight: "500",
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

export default RegisterView;