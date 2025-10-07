// views/HomeScreen.tsx
import React, { useState } from "react";
import {
    View, FlatList, ActivityIndicator, StyleSheet,
    TextInput, TouchableOpacity, Text, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Course } from "../models/Course";
import CourseCard from "../components/CourseCard";
import HackerNewsScreen from "../components/HackerNewsScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useCourseViewModel } from "../viewmodels/CourseViewModel";

export default function HomeScreen() {
    const { courses, loading } = useCourseViewModel();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCourses = courses.filter(
        (course) =>
            course.getCourseName().toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.getCourseId().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chunkArray = (arr: Course[], size: number) => {
        const result: Course[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    };
    const groupedData = chunkArray(filteredCourses, 4);

    if (loading) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <Header />

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by ID or Name..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.searchButton}>
                            <Ionicons name="search" size={20} color="#000000ff" />
                        </TouchableOpacity>
                    </View>

                    {/* Courses Section */}
                    <Text style={styles.sectionTitle}>Courses</Text>
                    <FlatList
                        data={groupedData}
                        keyExtractor={(_, index) => `${index}`}
                        renderItem={({ item }) => (
                            <View style={styles.groupContainer}>
                                <View style={styles.column}>
                                    {item[0] && <CourseCard key={item[0].getCourseId()} course={item[0]} />}
                                    {item[1] && <CourseCard key={item[1].getCourseId()} course={item[1]} />}
                                </View>
                                <View style={styles.column}>
                                    {item[2] && <CourseCard key={item[2].getCourseId()} course={item[2]} />}
                                    {item[3] && <CourseCard key={item[3].getCourseId()} course={item[3]} />}
                                </View>
                            </View>
                        )}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ListHeaderComponent={<View style={{ width: 10 }} />}
                        ListFooterComponent={<View style={{ width: 10 }} />}
                    />

                    {/* News Section */}
                    <Text style={styles.sectionTitle}>News</Text>
                    <FlatList
                        data={[1]}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={() => (
                            <View style={styles.newsWrapper}>
                                <HackerNewsScreen />
                            </View>
                        )}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                    />
                </ScrollView>

                <Navbar />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        marginHorizontal: 16,
        marginVertical: 10,
        borderRadius: 25,
        paddingHorizontal: 12,
        height: 40,
    },
    searchInput: { flex: 1, fontSize: 16 },
    searchButton: {
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        color: "#333",
    },
    groupContainer: {
        flexDirection: "row",
        marginRight: 16,
    },
    column: {
        flexDirection: "column",
        justifyContent: "space-between",
        marginHorizontal: 4,
    },
    newsWrapper: {
        width: 400,
        marginHorizontal: 10,
    },
});
