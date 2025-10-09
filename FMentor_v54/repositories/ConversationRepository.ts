import { ref, onValue, set, get, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Conversation, ConversationType } from "../models/Conversation";
import { CourseRepository } from "./CourseRepository";

export class ConversationRepository {
  static getConversationsRealtime(userId: string, callback: (conversations: Conversation[]) => void) {
    const conversationsRef = ref(realtimeDB, "conversations");
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const conversations = Object.keys(data)
          .map((key) => Conversation.fromJSON(data[key]))
          .filter((conv) => conv.getParticipants().includes(userId))
          .sort((a, b) => b.getLastUpdate() - a.getLastUpdate());
        callback(conversations);
      } else {
        callback([]);
      }
    });
    return () => unsubscribe();
  }

  static async createConversation(userId1: string, userId2: string, type: ConversationType = ConversationType.Private, conversationId?: string): Promise<string> {
    const convId = conversationId || `conv_${Date.now()}`;
    const conversation = new Conversation(
      convId,
      type,
      type === ConversationType.Private ? [userId1, userId2] : [userId1, userId2],
      Date.now()
    );
    await set(ref(realtimeDB, `conversations/${convId}`), conversation.toJSON());
    return convId;
  }

  static async getConversationDetails(conversationId: string): Promise<Conversation | null> {
    const snapshot = await get(ref(realtimeDB, `conversations/${conversationId}`));
    return snapshot.exists() ? Conversation.fromJSON(snapshot.val()) : null;
  }

  static async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
    const conversationRef = ref(realtimeDB, `conversations/${conversationId}`);
    await update(conversationRef, updates);
  }

  static async getConversationInfo(conversationId: string, userId: string): Promise<{ name: string; avatarUrl: string; isOnline: boolean } | null> {
    const snapshot = await get(ref(realtimeDB, `conversations/${conversationId}`));
    if (snapshot.exists()) {
      const convData = snapshot.val();
      if (convData.type === ConversationType.Private) {
        const otherParticipantId = convData.participants.find((id: string) => id !== userId);
        if (otherParticipantId) {
          const userSnapshot = await get(ref(realtimeDB, `users/${otherParticipantId}`));
          if (userSnapshot.exists()) {
            return {
              name: userSnapshot.val().username || "Chat",
              avatarUrl: userSnapshot.val().avatarUrl || "https://i.pravatar.cc/150?img=1",
              isOnline: userSnapshot.val().online || false,
            };
          }
        }
      } else if (convData.type === ConversationType.CourseChat) {
        const courseData = await CourseRepository.getCourseByChatGroupId(conversationId);
        if (courseData) {
          const mentorSnapshot = await get(ref(realtimeDB, `users/${courseData.mentorId}`));
          return {
            name: courseData.courseName || "Group Chat",
            avatarUrl: courseData.coverImage || "https://i.pravatar.cc/150?img=1",
            isOnline: mentorSnapshot.exists() ? mentorSnapshot.val().online : false,
          };
        }
      }
    }
    return null;
  }
}