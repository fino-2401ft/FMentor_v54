// components/MessageInput.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onSend: (text: string) => void;
  onLike?: () => void;
};

export default function MessageInput({ onSend, onLike }: Props) {
  const [text, setText] = useState("");
  const isEmpty = text.trim().length === 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#666" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Aa"
          value={text}
          onChangeText={setText}
        />
        {isEmpty ? (
          <TouchableOpacity onPress={onLike}>
            <Ionicons name="thumbs-up" size={24} color="#1877F2" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              onSend(text);
              setText("");
            }}
          >
            <Ionicons name="send" size={24} color="#1877F2" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
});
