// repositories/MessageRepository.ts
import { ref, onValue, set, get, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Message, MessageType } from "../models/Message";
import { ConversationRepository } from "./ConversationRepository";
import { User } from "../models/User";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";
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

    const conversationRef = ref(realtimeDB, `conversations/${message.getConversationId()}`);
    await update(conversationRef, {
      lastMessageId: message.getMessageId(),
      lastUpdate: message.getTimestamp(),
    });
  }

  static async markMessageAsSeen(messageId: string, conversationId: string): Promise<void> {
    const messageRef = ref(realtimeDB, `messages/${conversationId}/${messageId}`);
    await update(messageRef, { seen: true });
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

  static async pickAndUploadImage(fileUri: string): Promise<string | null> {
    const CLOUD_NAME = "dlkmlhk4k"; 
    const UPLOAD_PRESET = "ml_default"; 
    const data = new FormData();
    data.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const json = await res.json();
      if (json.secure_url) return json.secure_url;
      throw new Error(json.error?.message || "Image upload failed");
    } catch (error) {
      console.error("Image upload error:", error);
      throw new Error("Network request failed: Could not upload image");
    }
  }

  static async pickAndUploadVideo(fileUri: string): Promise<string | null> {
    const CLOUD_NAME = "dlkmlhk4k"; 
    const UPLOAD_PRESET = "ml_default"; 
    const data = new FormData();
    data.append("file", {
      uri: fileUri,
      type: "video/mp4",
      name: "lesson_video.mp4",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      const json = await res.json();
      if (json.secure_url) return json.secure_url;
      throw new Error(json.error?.message || "Video upload failed");
    } catch (error) {
      console.error("Video upload error:", error);
      throw new Error("Network request failed: Could not upload video");
    }
  }
}