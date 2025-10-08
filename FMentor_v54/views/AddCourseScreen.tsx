// src/views/AddCourseScreen.tsx
import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { useAddCourseViewModel } from "../viewmodels/AddCourseViewModel";
import Header from "../components/Header";

const AddCourseScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const vm = useAddCourseViewModel(currentUser?.getUserId() || "");

    const pickImage = async () => {
        // dùng API phù hợp expo-image-picker@17 (SDK54)
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            try {
                await vm.handleUploadImage(uri);
            } catch (err: any) {
                Alert.alert("Error", err.message || "Upload failed");
            }
        }
    };

    const onSubmit = async () => {
        try {
            await vm.handleAddCourse();
            Alert.alert("Success", "Course created successfully!");
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to create course");
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <Text style={styles.title}>CREATE A NEW COURSE</Text>

            <TextInput
                style={styles.input}
                placeholder="Course name"
                value={vm.courseName}
                onChangeText={vm.setCourseName}
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {vm.coverImage ? (
                    <Image source={{ uri: vm.coverImage }} style={styles.preview} />
                ) : (
                    <Text style={styles.pickText}>+ Choose Cover Image</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, vm.loading && { opacity: 0.6 }]}
                disabled={vm.loading}
                onPress={onSubmit}
            >
                <Text style={styles.buttonText}>
                    {vm.loading ? "Uploading..." : "Create Course"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddCourseScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 20,
        color: "#007BFF",
        marginTop: 60,
        alignSelf: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    imagePicker: {
        height: 180,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#bbb",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    preview: { width: "100%", height: "100%", borderRadius: 10 },
    pickText: { color: "#555" },
    button: {
        backgroundColor: "#007BFF",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
