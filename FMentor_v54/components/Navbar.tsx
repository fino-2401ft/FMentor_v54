// components/Navbar.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

type NavProp = StackNavigationProp<RootStackParamList>;

export const Navbar = () => {
    const [active, setActive] = useState<number>(0);
    const navigation = useNavigation<NavProp>();

    const icons = [
        require("../images/icon_home.png"),
        require("../images/icon_course.png"),
        require("../images/icon_messenger.png"),
        require("../images/icon_user.png"),
    ];

    const handlePress = (index: number) => {
        setActive(index);
        if (index === 0) navigation.navigate("Home");
        // else if (index === 2) navigation.navigate("MessengerMain");
        // Thêm điều hướng cho các index khác nếu cần
    };

    return (
        <View style={styles.container}>
            {icons.map((icon, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.tabButton}
                    onPress={() => handlePress(index)}
                >
                    <Image
                        source={icon}
                        style={[
                            styles.icon,
                            { tintColor: active === index ? "#007AFF" : "#888" },
                        ]}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 70,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 10,
        paddingTop: 5,
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
    },
    icon: {
        width: 28,
        height: 28,
    },
});

export default Navbar;