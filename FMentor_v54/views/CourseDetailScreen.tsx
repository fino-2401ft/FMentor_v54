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
    Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCourseDetailViewModel } from "../viewmodels/CourseDetailViewModel";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Navbar } from "../components/Navbar";
import { ProgressBar, Button } from "react-native-paper";
import { EnrollmentRepository } from "../repositories/EnrollmentRepository";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function CourseDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp>();
    const { courseId } = route.params;
    const { course, mentor, lessons, participants, progress, isMentor, loading, fetchData } =
        useCourseDetailViewModel(courseId);
    const [activeTab, setActiveTab] = useState<"lessons" | "participants">("lessons");
    const [input, setInput] = useState("");
    const [filteredParticipants, setFilteredParticipants] = useState(participants);

    const handleAddMentee = async () => {
        if (!input) {
            Alert.alert("Error", "Please enter a username or ID");
            return;
        }
        try {
            await EnrollmentRepository.addEnrollment(courseId, input);
            Alert.alert("Success", "Mentee added successfully");
            setInput("");
            fetchData();
            setFilteredParticipants(participants);
        } catch (error: any) {
            const message =
                error.message === "Mentee ID or username does not exist"
                    ? "Mentee ID or username does not exist"
                    : error.message === "Mentee already enrolled in this course"
                        ? "Mentee already enrolled in this course"
                        : "Failed to add mentee";
            Alert.alert("Error", message);
        }
    };

    const handleSearchMentee = async () => {
        if (!input) {
            setFilteredParticipants(participants);
            return;
        }
        try {
            const results = await EnrollmentRepository.searchMenteeInCourse(courseId, input);
            if (results.length === 0) {
                Alert.alert("Error", "Mentee has not enrolled course!");
                setFilteredParticipants(participants);
                return;
            }
            setFilteredParticipants(results);
        } catch (error) {
            Alert.alert("Error", "Failed to search mentees");
            setFilteredParticipants(participants);
        }
    };

    const handleRemoveMentee = async (enrollmentId: string) => {
        Alert.alert(
            "Confirm",
            "Are you sure you want to remove this mentee?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await EnrollmentRepository.removeEnrollment(enrollmentId);
                            Alert.alert("Success", "Mentee removed successfully");
                            fetchData();
                            setInput("");
                            setFilteredParticipants(participants);
                        } catch (error) {
                            Alert.alert("Error", "Failed to remove mentee");
                        }
                    },
                },
            ]
        );
    };

    React.useEffect(() => {
        setFilteredParticipants(participants);
    }, [participants]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E90FF" />
            </View>
        );
    }

    if (!course) {
        return (
            <View style={styles.center}>
                <Text>Course not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={{ uri: course.getCoverImage() }} style={styles.cover} />
            <Text style={styles.title}>{course.getCourseName()}</Text>

            {mentor && (
                <View style={styles.mentorContainer}>
                    <Image source={{ uri: mentor.getAvatarUrl() }} style={styles.avatar} />
                    <View>
                        <Text style={styles.mentorName}>{mentor.getUsername()}</Text>
                        {mentor.getExpertise && Array.isArray(mentor.getExpertise()) && (
                            <Text style={styles.expertise}>{mentor.getExpertise().join(", ")}</Text>
                        )}
                    </View>
                </View>
            )}

            {!isMentor && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>Progress: {progress}%</Text>
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
                    <FlatList
                        data={lessons}
                        keyExtractor={(item) => item.getLessonId()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity
                                style={styles.listItem}
                                onPress={() =>
                                    navigation.navigate("LessonDetail", {
                                        lessonId: item.getLessonId(),
                                        courseId: item.getCourseId()
                                    })
                                }
                            >
                                <Text style={styles.lessonTitle}>Lesson {index + 1}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <View>
                        <View style={styles.mentorControls}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter username or ID"
                                value={input}
                                onChangeText={setInput}
                            />
                            <Button mode="contained" onPress={handleSearchMentee} style={[styles.button, styles.searchButton]}>
                                🔍
                            </Button>
                            {isMentor && (
                                <Button mode="contained" onPress={handleAddMentee} style={styles.button}>
                                    Add
                                </Button>
                            )}
                        </View>
                        <FlatList
                            data={filteredParticipants}
                            keyExtractor={(item) => item.enrollmentId}
                            renderItem={({ item, index }) => (
                                <View style={styles.participantItem}>
                                    <Text style={styles.participantIndex}>{index + 1}</Text>
                                    <Image source={{ uri: item.avatarUrl }} style={styles.participantAvatar} />
                                    <Text style={styles.participantUsername}>{item.username}</Text>
                                    {isMentor && (
                                        <Button
                                            mode="outlined"
                                            onPress={() => handleRemoveMentee(item.enrollmentId)}
                                            style={styles.removeButton}
                                            labelStyle={styles.removeButtonText}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </View>
                            )}
                            contentContainerStyle={styles.participantList}
                        />
                    </View>
                )}
            </View>

            <View style={styles.navbarContainer}>
                <Navbar />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cover: {
        width: "100%",
        height: 200,
        resizeMode: "cover",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        margin: 16,
        color: "#333",
    },
    mentorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    mentorName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    expertise: {
        fontSize: 14,
        color: "#666",
    },
    progressContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    progressText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
    },
    tabContainer: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#1E90FF",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333",
    },
    tabContent: {
        flex: 1,
        paddingBottom: 80,
    },
    listItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    lessonTitle: {
        fontSize: 16,
        color: "#333",
    },
    participantItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    participantIndex: {
        width: 30,
        fontSize: 16,
        color: "#333",
        marginRight: 8,
    },
    participantAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    participantUsername: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    mentorControls: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    button: {
        backgroundColor: "#1E90FF",
    },
    searchButton: {
        marginRight: 8,
    },
    removeButton: {
        borderColor: "#FF3B30",
    },
    removeButtonText: {
        color: "#FF3B30",
    },
    participantList: {
        paddingBottom: 80,
    },
    navbarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});