import { ref, onValue, set, get, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Message, MessageType } from "../models/Message";
import { User } from "../models/User";
import * as ImagePicker from "expo-image-picker";

export class MessageRepository {
  static getMessagesRealtime(conversationId: string, callback: (messages: Message[]) => void) {
    const messagesRef = ref(realtimeDB, `messages/${conversationId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messages = Object.keys(data)
          .map((key) => Message.fromJSON(data[key]))
          .sort((a, b) => a.getTimestamp() - b.getTimestamp());
        callback(messages);
      } else {
        callback([]);
      }
    });
    return () => unsubscribe();
  }

  static async sendMessage(message: Message): Promise<void> {
    const messageRef = ref(realtimeDB, `messages/${message.getConversationId()}/${message.getMessageId()}`);
    await set(messageRef, message.toJSON());

    // Cách mới: Cập nhật trực tiếp conversation trên Firebase
    const conversationRef = ref(realtimeDB, `conversations/${message.getConversationId()}`);
    await update(conversationRef, {
      lastMessageId: message.getMessageId(),
      lastUpdate: message.getTimestamp(),
    });
  }

  static async markMessageAsSeen(messageId: string, conversationId: string, userId: string): Promise<void> {
    const messageRef = ref(realtimeDB, `messages/${conversationId}/${messageId}`);
    const snapshot = await get(messageRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const seenBy = data.seenBy ? [...new Set([...data.seenBy, userId])] : [userId];
      await update(messageRef, { seenBy });
    }
  }

  static async getLastMessage(conversationId: string): Promise<Message | null> {
    const snapshot = await get(ref(realtimeDB, `conversations/${conversationId}`));
    if (snapshot.exists() && snapshot.val().lastMessageId) {
      const messageSnapshot = await get(ref(realtimeDB, `messages/${conversationId}/${snapshot.val().lastMessageId}`));
      return messageSnapshot.exists() ? Message.fromJSON(messageSnapshot.val()) : null;
    }
    return null;
  }

  static async searchUsers(searchTerm: string): Promise<User[]> {
    const snapshot = await get(ref(realtimeDB, "users"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data)
      .map((key) => User.fromJSON(data[key]))
      .filter((user) =>
        user.getUsername().toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.getUserId().toLowerCase().includes(searchTerm.toLowerCase())
      );
  }

  static async pickAndUploadMedia(): Promise<{ url: string; type: MessageType } | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0].uri) {
      const CLOUD_NAME = "dlkmlhk4k";
      const UPLOAD_PRESET = "ml_default";
      const data = new FormData();
      data.append("file", {
        uri: result.assets[0].uri,
        type: result.assets[0].type === "video" ? "video/mp4" : "image/jpeg",
        name: result.assets[0].type === "video" ? "upload.mp4" : "upload.jpg",
      } as any);
      data.append("upload_preset", UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${result.assets[0].type}/upload`, {
          method: "POST",
          body: data,
          headers: { "Content-Type": "multipart/form-data" },
        });
        const json = await res.json();
        if (json.secure_url) {
          return { url: json.secure_url, type: result.assets[0].type === "video" ? MessageType.Video : MessageType.Image };
        }
        throw new Error(json.error?.message || "Media upload failed");
      } catch (error) {
        console.error("Media upload error:", error);
        return null;
      }
    }
    return null;
  }

  static async setTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const typingRef = ref(realtimeDB, `typing/${conversationId}/${userId}`);
    await set(typingRef, isTyping ? Date.now() : null);
  }

  static getTypingRealtime(conversationId: string, callback: (typingUsers: string[]) => void) {
    const typingRef = ref(realtimeDB, `typing/${conversationId}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const typingUsers = Object.keys(data).filter((key) => data[key] && Date.now() - data[key] < 5000);
        callback(typingUsers);
      } else {
        callback([]);
      }
    });
    return () => unsubscribe();
  }
}