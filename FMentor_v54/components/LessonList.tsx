import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Lesson } from "../models/Lesson";

export default function LessonList({ lessons, onSelectLesson }: { lessons: Lesson[], onSelectLesson: (lessonId: string) => void }) {
    return (
        <FlatList
            data={lessons}
            keyExtractor={(item) => item.getLessonId()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <Text style={styles.title}>{item.getTitle()}</Text>
                    <TouchableOpacity onPress={() => onSelectLesson(item.getLessonId())} style={styles.button}>
                        <Text style={styles.buttonText}>Learn</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    card: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#f9f9f9", marginVertical: 4, borderRadius: 8 },
    title: { fontSize: 16 },
    button: { backgroundColor: "#2196f3", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    buttonText: { color: "#fff" },
});
