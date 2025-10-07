import React from "react";
import { View, StyleSheet } from "react-native";
import Header from "./Header";
import NavBar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.content}>{children}</View>
            <NavBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { flex: 1, padding: 10 },
});
