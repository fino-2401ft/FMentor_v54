import { View, Text, Image, StyleSheet } from "react-native";
import { Mentor, User } from "../models/User";

export default function MentorInfo({ mentor }: { mentor: Mentor }) {
    return (
        <View style={styles.container}>
            <Image source={{ uri: mentor.getAvatarUrl() }} style={styles.avatar} />
            <View>
                <Text style={styles.name}>{mentor.getUsername()}</Text>
                <Text>{mentor.getEmail()}</Text>
                <Text style={styles.expertise}>Chuyên môn: {mentor.getExpertise()?.join(", ")}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
    name: { fontSize: 16, fontWeight: "bold" },
    expertise: { fontStyle: "italic", color: "#666" },
});
