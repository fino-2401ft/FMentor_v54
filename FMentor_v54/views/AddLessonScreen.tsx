// src/views/AddLessonScreen.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAddLessonViewModel } from "../viewmodels/AddLessonViewModel";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import Header from "../components/Header";

type AddLessonRouteProp = RouteProp<RootStackParamList, "AddLesson">;

const AddLessonScreen = () => {
  const route = useRoute<AddLessonRouteProp>();
  const navigation = useNavigation<any>();
  const { courseId } = route.params;

  const {
    title,
    content,
    videoUrl,
    loading,
    error,
    setTitle,
    setContent,
    handleUploadVideo,
    handleAddLesson,
  } = useAddLessonViewModel(courseId);

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("❌ Error", "Permission to access media library denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      console.log("Selected video URI:", uri);
      if (!uri) return;

      await handleUploadVideo(uri);
      Alert.alert("✅ Success", "Video uploaded successfully!");
    } catch (e: any) {
      console.error("Video picker error:", e);
      Alert.alert("❌ Error", e.message || "Failed to upload video!");
    }
  };

  const submit = async () => {
    try {
      await handleAddLesson();
      Alert.alert("🎉 Success", "New lesson added!");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Failed to add lesson");
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>Add New Lesson</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Lesson Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Lesson Content"
        multiline
        value={content}
        onChangeText={setContent}
      />
      <TouchableOpacity style={styles.uploadButton} onPress={pickVideo} disabled={loading}>
        <Text style={styles.uploadText}>
          {loading
            ? "Uploading..."
            : videoUrl
              ? "✅ Video Selected"
              : "🎥 Choose Video from Gallery"}
        </Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#1E90FF" />}
      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={loading}>
        <Text style={styles.submitText}>Create Lesson</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E90FF",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  uploadButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadText: { fontSize: 16, color: "#333" },
  submitButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default AddLessonScreen;