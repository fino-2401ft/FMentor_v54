import { View, Text, StyleSheet } from "react-native";

export default function ProgressBar({ progress }: { progress: number }) {
    return (
        <View style={{ marginVertical: 12 }}>
            <Text>Progress: {progress}%</Text>
            <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    barBackground: {
        width: "100%",
        height: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
        marginTop: 4,
    },
    barFill: {
        height: 10,
        backgroundColor: "#4caf50",
        borderRadius: 5,
    },
});
