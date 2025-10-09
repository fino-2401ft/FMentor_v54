// viewmodels/useChatViewModel.ts
import { useState, useEffect, useCallback } from "react";
import { MessageRepository } from "../repositories/MessageRepository";
import { ConversationRepository } from "../repositories/ConversationRepository";
import { Message, MessageType } from "../models/Message";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";

export const useChatViewModel = (conversationId: string) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [conversationName, setConversationName] = useState("Chat");
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = MessageRepository.getMessagesRealtime(conversationId, (msgs) => {
      setMessages(msgs);
    });

    const fetchConversationDetails = async () => {
      const details = await ConversationRepository.getConversationInfo(conversationId, currentUser?.getUserId() || "");
      if (details) {
        setConversationName(details.name);
        setIsOnline(details.isOnline);
      }
    };
    fetchConversationDetails();

    return unsubscribe;
  }, [conversationId, currentUser?.getUserId]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() && !isEmojiOpen) return;

    const messageId = `msg_${Date.now()}`;
    const message = new Message(
      messageId,
      conversationId,
      currentUser?.getUserId() || "",
      newMessage,
      MessageType.Text,
      Date.now(),
      false
    );
    await MessageRepository.sendMessage(message);
    setNewMessage("");
    setIsEmojiOpen(false);
  }, [newMessage, isEmojiOpen, conversationId, currentUser?.getUserId]);

  const sendMedia = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Cho phép chọn cả ảnh và video
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      let url: string | null = null;
      if (result.assets[0].type === "video") {
        url = await MessageRepository.pickAndUploadVideo(result.assets[0].uri);
      } else {
        url = await MessageRepository.pickAndUploadImage(result.assets[0].uri);
      }
      if (url) {
        const messageId = `msg_${Date.now()}`;
        const messageType = result.assets[0].type === "video" ? MessageType.Video : MessageType.Image;
        const message = new Message(
          messageId,
          conversationId,
          currentUser?.getUserId() || "",
          url,
          messageType,
          Date.now(),
          false
        );
        await MessageRepository.sendMessage(message);
      }
    }
  }, [conversationId, currentUser?.getUserId]);

  const onEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isEmojiOpen,
    setIsEmojiOpen,
    conversationName,
    isOnline,
    sendMessage,
    sendMedia,
    onEmojiSelect,
  };
};