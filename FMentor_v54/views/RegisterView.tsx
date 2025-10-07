// views/RegisterView.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import RegisterController from "../controllers/RegisterController";
import { RootStackParamList } from "../navigation/AppNavigator"; 
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RegisterView = () => {
    const { loading } = useAuth();
    const navigation = useNavigation<NavigationProp>(); 
    const { username, setUsername, email, setEmail, password, setPassword, rePassword, setRePassword, handleRegister } = RegisterController();
    const [showPassword, setShowPassword] = useState(false); 
    const [showRePassword, setShowRePassword] = useState(false); 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            {loading && <ActivityIndicator size="large" color="#1E90FF" />}
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword} 
                />
                <Button
                    title={showPassword ? "Hide" : "Show"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#4682B4"
                />
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-password"
                    value={rePassword}
                    onChangeText={setRePassword}
                    secureTextEntry={!showRePassword} // Toggle hiển thị Re-password
                />
                <Button
                    title={showRePassword ? "Hide" : "Show"}
                    onPress={() => setShowRePassword(!showRePassword)}
                    color="#4682B4"
                />
            </View>
            <Button title="Register" onPress={handleRegister} color="#1E90FF" disabled={loading} />
            <Button
                title="Go to Login"
                onPress={() => navigation.navigate("Login")}
                color="#4682B4"
                disabled={loading}
            />
        </View>
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
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1E90FF",
        marginBottom: 20,
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
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "80%",
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        borderColor: "#4682B4",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: "#F0F8FF",
    },
});

export default RegisterView;