// src/views/MyCourseScreen.tsx
import React, { useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMyCourseViewModel } from "../viewmodels/MyCourseViewModel";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CourseRepository } from "../repositories/CourseRepository";
import CourseCard from "../components/CourseCard";
import Header from "../components/Header";
import Navbar from "../components/Navbar";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MyCourseScreen: React.FC = () => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <View style={styles.center}>
                <Text>Loading user...</Text>
            </View>
        );
    }

    const navigation = useNavigation<NavigationProp>();

    const {
        mentorCourses,
        enrolledCourses,
        completedCourses,
        loading,
        loadCourses,
    } = useMyCourseViewModel(currentUser.getUserId(), currentUser.getRole());

    useEffect(() => {
        loadCourses();
    }, [loadCourses]);

    const handleAddCourse = () => {
        navigation.navigate("AddCourse");
    };

    const handleRemoveCourse = async (courseId: string) => {
        await CourseRepository.removeCourse(courseId);
        loadCourses();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const isMentor = currentUser.getRole() === "Mentor";

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <Header />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My Courses</Text>
                    {isMentor && (
                        <TouchableOpacity
                            onPress={handleAddCourse}
                            style={styles.addButton}
                        >
                            <Text style={styles.addText}>+ Add Course</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Nếu là Mentor hiển thị cả 3 danh sách */}
                {isMentor ? (
                    <>
                        {/* Khóa học mà mentor dạy */}
                        {mentorCourses.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Courses You Are Teaching</Text>
                                <FlatList
                                    horizontal
                                    data={mentorCourses}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.getCourseId()}
                                    renderItem={({ item }) => (
                                        <View style={{ marginRight: 10 }}>
                                            <CourseCard course={item} />
                                            <TouchableOpacity
                                                onPress={() => handleRemoveCourse(item.getCourseId())}
                                                style={styles.removeBtn}
                                                activeOpacity={0.7}
                                            >
                                                <Image
                                                    source={require("../images/bin.png")}
                                                    style={styles.removeIcon}
                                                    resizeMode="contain"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {/* Các khóa đã enroll */}
                        {enrolledCourses.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Enrolling Courses</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={enrolledCourses}
                                    keyExtractor={(item) => item.getCourseId()}
                                    renderItem={({ item }) => (
                                        <View style={{ marginRight: 10 }}>
                                            <CourseCard course={item} />
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {/* Các khóa đã hoàn thành */}
                        {completedCourses.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Completed Courses</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={completedCourses}
                                    keyExtractor={(item) => item.getCourseId()}
                                    renderItem={({ item }) => (
                                        <View style={{ marginRight: 10 }}>
                                            <CourseCard course={item} />
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                    </>
                ) : (
                    // Nếu là Mentee thì chỉ hiển thị enrolled và completed
                    <>
                        {enrolledCourses.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Enrolled Courses</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={enrolledCourses}
                                    keyExtractor={(item) => item.getCourseId()}
                                    renderItem={({ item }) => (
                                        <View style={{ marginRight: 10 }}>
                                            <CourseCard course={item} />
                                        </View>
                                    )}
                                />
                            </View>
                        )}

                        {completedCourses.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Completed Courses</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={completedCourses}
                                    keyExtractor={(item) => item.getCourseId()}
                                    renderItem={({ item }) => (
                                        <View style={{ marginRight: 10 }}>
                                            <CourseCard course={item} />
                                        </View>
                                    )}
                                />
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* 🔹 Navbar luôn nằm dưới cùng màn hình */}
            <View style={styles.navbarContainer}>
                <Navbar />
            </View>
        </View>
    );
};

export default MyCourseScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 10,
    },
    title: { fontSize: 22, fontWeight: "700" },
    addButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    addText: { color: "#fff", fontWeight: "bold" },
    section: { marginTop: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
    removeBtn: {
        backgroundColor: "#E53935",
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 4,
        alignItems: "center",
        alignSelf: "center",
    },
    removeText: { color: "#fff", fontWeight: "600" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    navbarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1E1E2E",
        paddingVertical: 10,
        alignItems: "center",
    },
    removeIcon: {
        width: 18,
        height: 18,
        tintColor: "#fff",
    },
});
