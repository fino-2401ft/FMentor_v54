import { View, Text, Image, StyleSheet } from "react-native";

export default function CourseHeader({ title, coverImage }: { title: string; coverImage: string }) {
    return (
        <View>
            <Image source={{ uri: coverImage }} style={styles.image} />
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    image: { width: "100%", height: 180, borderRadius: 8 },
    title: { fontSize: 22, fontWeight: "bold", marginVertical: 8, textAlign: "center" },
});
