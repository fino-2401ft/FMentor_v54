// viewmodels/useMessengerViewModel.ts
import { useState, useEffect } from "react";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { MessageRepository } from "../repositories/MessageRepository";
import { Conversation, ConversationType } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { CourseRepository } from "../repositories/CourseRepository";
import { EnrollmentRepository } from "../repositories/EnrollmentRepository";
import { get, ref } from "firebase/database";
import { realtimeDB } from "../config/Firebase";

// Thêm export cho interface ConversationCard
export interface ConversationCard {
  conversationId: string;
  name: string;
  avatarUrl: string;
  lastMessage: string;
  lastUpdate: number;
  isOnline: boolean;
  type: ConversationType;
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
            const userSnapshot = await get(ref(realtimeDB, `users/${otherParticipantId}`));
            const userData = userSnapshot.exists() ? userSnapshot.val() : { username: "Unknown", avatarUrl: "", online: false };
            name = userData.username;
            avatarUrl = userData.avatarUrl || avatarUrl;
            isOnline = userData.online || false;
          } else if (conv.getType() === ConversationType.CourseChat) {
            const courseData = await CourseRepository.getCourseByChatGroupId(conv.getConversationId());
            if (courseData) {
              name = courseData.courseName;
              avatarUrl = courseData.coverImage;

              const isMentor = courseData.mentorId === userId;
              const enrollments = await EnrollmentRepository.getParticipantsByCourse(courseData.courseId);
              const isEnrolled = enrollments.some((enrollment) => enrollment.userId === userId);

              if (isMentor || isEnrolled) {
                const mentorSnapshot = await get(ref(realtimeDB, `users/${courseData.mentorId}`));
                isOnline = mentorSnapshot.exists() ? mentorSnapshot.val().online : false;
              } else {
                return null;
              }
            }
          }

          return {
            conversationId: conv.getConversationId(),
            name: name || "Unknown",
            avatarUrl: avatarUrl || "https://i.pravatar.cc/150?img=1",
            lastMessage: lastMessage?.getContent() || "",
            lastUpdate: conv.getLastUpdate(),
            isOnline,
            type: conv.getType(),
          };
        })
      );
      setConversations(cards.filter((card) => card !== null));
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
      (conv) => conv.type === ConversationType.Private && conv.conversationId.includes(targetUserId) && conv.conversationId.includes(userId)
    );
    if (existingConv) return existingConv.conversationId;
    return await ConversationRepository.createConversation(userId, targetUserId);
  };

  const filteredConversations = conversations.filter(
    (conv) => activeTab === "Private" 
      ? conv.type === ConversationType.Private 
      : conv.type === ConversationType.CourseChat
  );

  return {
    conversations: filteredConversations,
    searchTerm,
    searchResults,
    activeTab,
    loading,
    setActiveTab,
    handleSearch,
    createNewConversation,
  };
};