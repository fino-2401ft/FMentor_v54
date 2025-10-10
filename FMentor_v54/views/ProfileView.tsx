import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { ProfileViewModel } from "../viewmodels/ProfileViewModel";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import * as ImagePicker from "expo-image-picker";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { transparent } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProfileView = () => {
    const { currentUser, loading } = useAuth();
    const navigation = useNavigation<NavigationProp>();
    const {
        username,
        setUsername,
        avatarUri,
        setAvatarUri,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        reNewPassword,
        setReNewPassword,
        isUpdating,
        error,
        updateProfile,
        logout,
    } = ProfileViewModel();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showReNewPassword, setShowReNewPassword] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Permission to access gallery is required!");
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

    const onUpdatePress = async () => {
        const success = await updateProfile();
        if (success) {
            Alert.alert("Success", "Profile updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setReNewPassword("");
        } else if (error) {
            Alert.alert("Error", error);
        }
    };

    const onLogoutPress = async () => {
        Alert.alert("Log out", "Are you sure you want to log out?", [
            { text: "Cancel" },
            {
                text: "Log out",
                onPress: async () => {
                    const success = await logout();
                    if (!success && error) {
                        Alert.alert("Error", error);
                    }
                },
            },
        ]);
    };

    if (loading || !currentUser) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <ActivityIndicator size="large" color="#1E90FF" />
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Image
                    source={require("../images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                {isUpdating && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1E90FF" />
                        <Text style={styles.loadingText}>Saving...</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                    {avatarUri ? (
                        <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>Choose Avatar</Text>
                        </View>
                    )}
                    <Text style={styles.changeAvatarText}>Change Avatar</Text>
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
                        style={[styles.input, styles.disabledInput]}
                        value={currentUser.getEmail()}
                        editable={false}
                        placeholderTextColor="#A9A9A9"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry={!showCurrentPassword}
                        placeholderTextColor="#A9A9A9"
                    />
                    <TouchableOpacity
                        style={styles.showButton}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        <Text style={styles.showButtonText}>{showCurrentPassword ? "Hide" : "Show"}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholderTextColor="#A9A9A9"
                    />
                    <TouchableOpacity
                        style={styles.showButton}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                        <Text style={styles.showButtonText}>{showNewPassword ? "Hide" : "Show"}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Re-enter New Password"
                        value={reNewPassword}
                        onChangeText={setReNewPassword}
                        secureTextEntry={!showReNewPassword}
                        placeholderTextColor="#A9A9A9"
                    />
                    <TouchableOpacity
                        style={styles.showButton}
                        onPress={() => setShowReNewPassword(!showReNewPassword)}
                    >
                        <Text style={styles.showButtonText}>{showReNewPassword ? "Hide" : "Show"}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.button, isUpdating && styles.buttonDisabled]}
                    onPress={onUpdatePress}
                    disabled={isUpdating}
                >
                    <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={onLogoutPress}
                    disabled={isUpdating}
                >
                    <Text style={styles.logoutButtonText}>Log out</Text>
                </TouchableOpacity>
                <Navbar />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#1E90FF",
    },
    avatarContainer: {
        marginBottom: 20,
        alignItems: "center",
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
    changeAvatarText: {
        color: "#4682B4",
        fontSize: 14,
        fontWeight: "500",
        marginTop: 10,
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
    disabledInput: {
        backgroundColor: "#F0F0F0",
        color: "#A9A9A9",
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
    logoutButton: {
        width: "85%",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FF6347",
    },
    logoutButtonText: {
        color: "#FF6347",
        fontSize: 16,
        fontWeight: "600",
    },

});

export default ProfileView;