import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { User } from "../models/User";

export default function ParticipantList({ participants, isMentor, onRemove }: { participants: User[], isMentor: boolean, onRemove: (userId: string) => void }) {
    return (
        <FlatList
            data={participants}
            keyExtractor={(item) => item.getUserId()}
            renderItem={({ item }) => (
                <View style={styles.row}>
                    <Image source={{ uri: item.getAvatarUrl() }} style={styles.avatar} />
                    <Text style={styles.name}>{item.getUsername()}</Text>
                    {isMentor && (
                        <TouchableOpacity onPress={() => onRemove(item.getUserId())} style={styles.removeBtn}>
                            <Text style={{ color: "#fff" }}>X</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    name: { flex: 1, fontSize: 16 },
    removeBtn: { backgroundColor: "#e53935", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
});
