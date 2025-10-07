// components/Header.tsx
import React from "react";
import { View, Image, StyleSheet, SafeAreaView } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { User } from "../models/User";

const Header: React.FC = () => {
  const { currentUser } = useAuth() as { currentUser: User | null };
  const navigation = useNavigation();

  const avatarUrl = currentUser?.getAvatarUrl() || "https://i.pravatar.cc/150?img=1";

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.logoGroup}>
          <Image
            source={require("../images/logo.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
          <Image
            source={require("../images/appname.png")}
            style={{ width: 100, height: 40, marginLeft: 4 }}
            resizeMode="contain"
          />
        </View>
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 60,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Header;