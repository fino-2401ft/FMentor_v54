// src/views/CourseDetailScreen.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCourseDetailViewModel } from "../viewmodels/CourseDetailViewModel";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Navbar } from "../components/Navbar";
import { ProgressBar, Button } from "react-native-paper";
import { Participant } from "../repositories/EnrollmentRepository";
import { Lesson } from "../models/Lesson";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function CourseDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp>();
    const { courseId } = route.params;
    const {
        course,
        mentor,
        lessons,
        filteredParticipants,
        progress,
        isMentor,
        loading,
        editMode,
        input,
        setInput,
        toggleEditMode,
        handleAddMentee,
        handleSearchMentee,
        handleRemoveMentee,
        handleRemoveLesson,
    } = useCourseDetailViewModel(courseId);
    const [activeTab, setActiveTab] = useState<"lessons" | "participants">("lessons");

    if (loading || !course || !mentor) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E90FF" />
            </View>
        );
    }

    const renderLessonItem = ({ item }: { item: Lesson }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate("LessonDetail", { lessonId: item.getLessonId(), courseId })}
        >
            <Text style={styles.lessonTitle}>{item.getTitle()}</Text>
            {editMode && (
                <View style={{ flexDirection: "row", marginTop: 8 }}>
                    <Button
                        mode="outlined"
                        onPress={() => navigation.navigate("EditLesson", { lessonId: item.getLessonId(), courseId })}
                        style={{ marginRight: 8 }}
                    >
                        Edit
                    </Button>
                    <Button mode="outlined" onPress={() => handleRemoveLesson(item.getLessonId())} color="#FF3B30">
                        Delete
                    </Button>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderParticipantItem = ({ item, index }: { item: Participant; index: number }) => (
        <View style={styles.participantItem}>
            <Text style={styles.participantIndex}>{index + 1}.</Text>
            <Image source={{ uri: item.avatarUrl }} style={styles.participantAvatar} />
            <View style={{ flex: 1 }}>
                <Text style={styles.participantUsername}>{item.username}</Text>
                <View style={styles.progressWrapper}>
                    <Text style={styles.progressLabel}>Progress: {item.progress}%</Text>
                    <ProgressBar progress={item.progress / 100} color="#1E90FF" style={styles.participantProgress} />
                </View>
            </View>
            {isMentor && (
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMentee(item.enrollmentId)}
                >
                    <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Image source={{ uri: course.getCoverImage() }} style={styles.cover} />
            <Text style={styles.title}>{course.getCourseName()}</Text>
            <View style={styles.mentorContainer}>
                <Image source={{ uri: mentor.getAvatarUrl() }} style={styles.avatar} />
                <View>
                    <Text style={styles.mentorName}>{mentor.getUsername()}</Text>
                    <Text style={styles.expertise}>{mentor.getExpertise().join(", ")}</Text>
                </View>
                {isMentor && !editMode && (
                    <Button mode="outlined" onPress={toggleEditMode} style={{ marginLeft: "auto" }}>
                        Edit
                    </Button>
                )}
                {isMentor && editMode && (
                    <Button mode="outlined" onPress={toggleEditMode} style={{ marginLeft: "auto" }}>
                        Exit Edit
                    </Button>
                )}
            </View>
            {!isMentor && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Your Progress: {progress}%</Text>
                    <ProgressBar progress={progress / 100} color="#1E90FF" style={styles.progressBar} />
                </View>
            )}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "lessons" && styles.activeTab]}
                    onPress={() => setActiveTab("lessons")}
                >
                    <Text style={styles.tabText}>Lessons</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "participants" && styles.activeTab]}
                    onPress={() => setActiveTab("participants")}
                >
                    <Text style={styles.tabText}>Participants</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tabContent}>
                {activeTab === "lessons" ? (
                    <>
                        {editMode && (
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate("AddLesson", { courseId })}
                                style={{ margin: 16 }}
                            >
                                Add Lesson
                            </Button>
                        )}
                        <FlatList
                            data={lessons}
                            keyExtractor={(item) => item.getLessonId()}
                            renderItem={renderLessonItem}
                            style={styles.participantList}
                            ListEmptyComponent={<Text style={styles.emptyText}>No lessons available</Text>}
                        />
                    </>
                ) : (
                    <>
                        {isMentor && (
                            <View style={styles.mentorControls}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username or ID"
                                    value={input}
                                    onChangeText={setInput}
                                />
                                <Button mode="contained" onPress={handleAddMentee} style={styles.button}>
                                    Add by ID
                                </Button>
                                <Button mode="outlined" onPress={handleSearchMentee} style={styles.searchButton}>
                                    Search
                                </Button>
                            </View>
                        )}
                        <FlatList
                            data={filteredParticipants}
                            keyExtractor={(item) => item.userId}
                            renderItem={renderParticipantItem}
                            style={styles.participantList}
                            ListEmptyComponent={<Text style={styles.emptyText}>No participants enrolled</Text>}
                        />
                    </>
                )}
            </View>
            <View style={styles.navbarContainer}>
                <Navbar />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    cover: { width: "100%", height: 200, resizeMode: "cover" },
    title: { fontSize: 24, fontWeight: "bold", margin: 16, color: "#333" },
    mentorContainer: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 16 },
    avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    mentorName: { fontSize: 18, fontWeight: "bold", color: "#333" },
    expertise: { fontSize: 14, color: "#666" },
    progressContainer: { marginHorizontal: 16, marginBottom: 16 },
    progressText: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    progressBar: { height: 10, borderRadius: 5 },
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#1E90FF" },
    tabText: { fontSize: 16, fontWeight: "500", color: "#333" },
    tabContent: { flex: 1, paddingBottom: 80 },
    listItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
    lessonTitle: { fontSize: 16, color: "#333" },
    participantItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    participantIndex: { width: 30, fontSize: 16, color: "#333", marginRight: 8 },
    participantAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    participantUsername: { fontSize: 16, color: "#000000ff", fontWeight: "bold" },
    progressWrapper: { marginTop: 4 },
    progressLabel: { fontSize: 12, color: "#666", marginBottom: 2 },
    participantProgress: { height: 8, borderRadius: 4, width: 200 },
    mentorControls: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    input: { flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 8, borderRadius: 4, marginRight: 8 },
    button: { backgroundColor: "#1E90FF" },
    searchButton: { marginRight: 8, marginLeft: 10, padding: 0 },
    removeButton: {
        borderWidth: 1,
        borderColor: "red",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red"
    },
    removeButtonText: {
        color: "#ffffffff",
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center", // Ensure text is centered
    },
    participantList: { paddingBottom: 80 },
    navbarContainer: { position: "absolute", bottom: 0, left: 0, right: 0 },
    emptyText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
});