export enum MessageType {
  Text = "Text",
  Image = "Image",
  Video = "Video",
}

export class Message {
  private messageId: string;
  private conversationId: string;
  private senderId: string;
  private content: string;
  private type: MessageType;
  private timestamp: number;
  private seenBy: string[];

  constructor(
    messageId: string,
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType,
    timestamp: number,
    seenBy: string[] = []
  ) {
    this.messageId = messageId;
    this.conversationId = conversationId;
    this.senderId = senderId;
    this.content = content || "";
    this.type = type;
    this.timestamp = timestamp;
    this.seenBy = seenBy;
  }

  getMessageId(): string { return this.messageId; }
  getConversationId(): string { return this.conversationId; }
  getSenderId(): string { return this.senderId; }
  getContent(): string { return this.content; }
  getType(): MessageType { return this.type; }
  getTimestamp(): number { return this.timestamp; }
  getSeenBy(): string[] { return this.seenBy; }

  setMessageId(messageId: string): void { this.messageId = messageId; }
  setConversationId(conversationId: string): void { this.conversationId = conversationId; }
  setSenderId(senderId: string): void { this.senderId = senderId; }
  setContent(content: string): void { this.content = content; }
  setType(type: MessageType): void { this.type = type; }
  setTimestamp(timestamp: number): void { this.timestamp = timestamp; }
  setSeenBy(seenBy: string[]): void { this.seenBy = seenBy; }

  async getSenderAvatarUrl(): Promise<string | undefined> {
    try {
      const { get, ref } = await import("firebase/database");
      const { realtimeDB } = await import("../config/Firebase");
      const userRef = ref(realtimeDB, `users/${this.senderId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.avatarUrl || undefined;
      }
      return undefined;
    } catch (error) {
      console.error("Error fetching sender avatar:", error);
      return undefined;
    }
  }

  toJSON(): object {
    return {
      messageId: this.messageId,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp,
      seenBy: this.seenBy,
    };
  }

  static fromJSON(data: any): Message {
    return new Message(
      data.messageId,
      data.conversationId,
      data.senderId,
      data.content || "",
      data.type,
      data.timestamp,
      data.seenBy || []
    );
  }
}