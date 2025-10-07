import React from "react";
import { View, Text, StyleSheet } from "react-native";
import dayjs from "dayjs";

type Props = {
    me: boolean;
    text: string;
    time: number;
    seen?: boolean;
};

export default function MessageBubble({ me, text, time, seen }: Props) {
    return (
        <View style={[styles.bubble, me ? styles.me : styles.other]}>
            <Text style={[styles.text, me ? styles.textMe : styles.textOther]}>
                {text}
            </Text>
            <View style={styles.meta}>
                <Text style={styles.time}>
                    {dayjs(time).format("HH:mm")}
                </Text>
                {me && <Text style={styles.seen}>{seen ? "✓✓" : "✓"}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: {
        maxWidth: "80%",
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginVertical: 4,
    },
    me: { alignSelf: "flex-end", backgroundColor: "#1877F2" },
    other: { alignSelf: "flex-start", backgroundColor: "#E4E6EB" },
    text: { fontSize: 16 },
    textMe: { color: "#fff" },
    textOther: { color: "#050505" },
    meta: {
        flexDirection: "row",
        gap: 6,
        alignSelf: "flex-end",
        marginTop: 4,
    },
    time: { fontSize: 10, color: "#fff", opacity: 0.8 },
    seen: { fontSize: 10, color: "#fff", opacity: 0.9 },
});
