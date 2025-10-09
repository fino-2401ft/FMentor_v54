import { ref, onValue, set, get, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Conversation, ConversationType } from "../models/Conversation";

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

  static async createConversation(userId1: string, userId2: string): Promise<string> {
    const conversationId = `conv_${Date.now()}`;
    const conversation = new Conversation(
      conversationId,
      ConversationType.Private,
      [userId1, userId2],
      Date.now()
    );
    await set(ref(realtimeDB, `conversations/${conversationId}`), conversation.toJSON());
    return conversationId;
  }

  static async getConversationDetails(conversationId: string): Promise<Conversation | null> {
    const snapshot = await get(ref(realtimeDB, `conversations/${conversationId}`));
    return snapshot.exists() ? Conversation.fromJSON(snapshot.val()) : null;
  }

  static async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<void> {
    const conversationRef = ref(realtimeDB, `conversations/${conversationId}`);
    await update(conversationRef, updates);
  }

  // Thêm hàm lấy thông tin tên và trạng thái online
  static async getConversationInfo(conversationId: string, userId: string): Promise<{ name: string; isOnline: boolean } | null> {
    const snapshot = await get(ref(realtimeDB, `conversations/${conversationId}`));
    if (snapshot.exists()) {
      const convData = snapshot.val();
      const participants = convData.participants;
      const otherParticipantId = participants.find((id: string) => id !== userId);
      if (otherParticipantId) {
        const userSnapshot = await get(ref(realtimeDB, `users/${otherParticipantId}`));
        if (userSnapshot.exists()) {
          return {
            name: userSnapshot.val().username || "Chat",
            isOnline: userSnapshot.val().online || false,
          };
        }
      } else {
        const courseData = await get(ref(realtimeDB, `courses`)).then((snap) => {
          const courses = snap.val();
          for (let id in courses) {
            if (courses[id].chatGroupId === conversationId) {
              return courses[id];
            }
          }
          return null;
        });
        if (courseData) {
          const mentorSnapshot = await get(ref(realtimeDB, `users/${courseData.mentorId}`));
          return {
            name: courseData.courseName || "Group Chat",
            isOnline: mentorSnapshot.exists() ? mentorSnapshot.val().online : false,
          };
        }
      }
    }
    return null;
  }
}