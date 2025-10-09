import { useState, useEffect } from "react";
import { MessageRepository } from "../repositories/MessageRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { Message, MessageType } from "../models/Message";
import { useAuth } from "../context/AuthContext";

export const useChatViewModel = (conversationId: string) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [conversationName, setConversationName] = useState("Chat");
  const [conversationAvatar, setConversationAvatar] = useState("https://i.pravatar.cc/150?img=1");
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const fetchConversationInfo = async () => {
      const info = await ConversationRepository.getConversationInfo(conversationId, currentUser?.getUserId() || "");
      if (info) {
        setConversationName(info.name);
        setConversationAvatar(info.avatarUrl);
        setIsOnline(info.isOnline);
      }
    };
    fetchConversationInfo();
  }, [conversationId, currentUser]);

  useEffect(() => {
    const unsubscribe = MessageRepository.getMessagesRealtime(conversationId, (msgs) => {
      setMessages(msgs);
      if (msgs.length > 0 && currentUser) {
        const lastMessage = msgs[msgs.length - 1];
        if (lastMessage.getSenderId() !== currentUser.getUserId()) {
          MessageRepository.markMessageAsSeen(lastMessage.getMessageId(), conversationId, currentUser.getUserId());
        }
      }
    });
    return unsubscribe;
  }, [conversationId, currentUser]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    const message = new Message(
      `msg_${Date.now()}`,
      conversationId,
      currentUser?.getUserId() || "",
      newMessage,
      MessageType.Text,
      Date.now(),
      [currentUser?.getUserId() || ""]
    );
    await MessageRepository.sendMessage(message);
    setNewMessage("");
  };

  const sendMedia = async () => {
    const result = await MessageRepository.pickAndUploadMedia();
    if (result) {
      const message = new Message(
        `msg_${Date.now()}`,
        conversationId,
        currentUser?.getUserId() || "",
        result.url,
        result.type,
        Date.now(),
        [currentUser?.getUserId() || ""]
      );
      await MessageRepository.sendMessage(message);
    }
  };

  const setTyping = async (isTyping: boolean) => {
    if (currentUser) {
      await MessageRepository.setTyping(conversationId, currentUser.getUserId(), isTyping);
    }
  };

  const onEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setIsEmojiOpen(false);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isEmojiOpen,
    setIsEmojiOpen,
    conversationName,
    conversationAvatar,
    isOnline,
    sendMessage,
    sendMedia,
    setTyping,
    onEmojiSelect,
  };
};