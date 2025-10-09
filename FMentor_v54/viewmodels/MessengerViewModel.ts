import { useState, useEffect } from "react";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { MessageRepository } from "../repositories/MessageRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { Conversation, ConversationType } from "../models/Conversation";
import { User } from "../models/User";
import { get, ref } from "firebase/database";
import { realtimeDB } from "../config/Firebase";

export interface ConversationCard {
  conversationId: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastUpdate: number;
  isOnline: boolean;
  type: ConversationType;
  participants: string[];
}

export const useMessengerViewModel = (userId: string) => {
  const [conversations, setConversations] = useState<ConversationCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"Private" | "Course">("Private");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = ConversationRepository.getConversationsRealtime(userId, async (convs) => {
      const cards = await Promise.all(
        convs.map(async (conv) => {
          const lastMessage = await MessageRepository.getLastMessage(conv.getConversationId());
          let name = "Unknown";
          let avatarUrl = "https://i.pravatar.cc/150?img=1";
          let isOnline = false;

          if (conv.getType() === ConversationType.Private) {
            const otherParticipantId = conv.getParticipants().find((id) => id !== userId);
            if (otherParticipantId) {
              const userSnapshot = await get(ref(realtimeDB, `users/${otherParticipantId}`));
              const userData = userSnapshot.exists() ? userSnapshot.val() : { username: "Unknown", avatarUrl: "", online: false };
              name = userData.username || `User ${otherParticipantId}`;
              avatarUrl = userData.avatarUrl || avatarUrl;
              isOnline = userData.online || false;
            }
          } else if (conv.getType() === ConversationType.CourseChat) {
            const courseData = await CourseRepository.getCourseByChatGroupId(conv.getConversationId());
            if (courseData) {
              name = courseData.courseName || "Unknown Course";
              avatarUrl = courseData.coverImage || avatarUrl;
              const mentorSnapshot = await get(ref(realtimeDB, `users/${courseData.mentorId}`));
              isOnline = mentorSnapshot.exists() ? mentorSnapshot.val().online : false;
            }
          }

          return {
            conversationId: conv.getConversationId(),
            name,
            avatarUrl,
            lastMessage: lastMessage?.getContent()?.startsWith("https://") ? "Has sent a media" : lastMessage?.getContent() || "No messages yet",
            lastUpdate: conv.getLastUpdate() || Date.now(),
            isOnline,
            type: conv.getType(),
            participants: conv.getParticipants(),
          };
        })
      );
      setConversations(cards.filter((card) => card !== null) as ConversationCard[]);
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = await MessageRepository.searchUsers(term);
    setSearchResults(results);
  };

  const createNewConversation = async (targetUserId: string) => {
    const existingConv = conversations.find(
      (conv) =>
        conv.type === ConversationType.Private &&
        conv.participants.includes(targetUserId) &&
        conv.participants.includes(userId)
    );
    if (existingConv) return existingConv.conversationId;
    return await ConversationRepository.createConversation(userId, targetUserId);
  };

  return {
    conversations,
    searchTerm,
    searchResults,
    activeTab,
    loading,
    setActiveTab,
    handleSearch,
    createNewConversation,
  };
};