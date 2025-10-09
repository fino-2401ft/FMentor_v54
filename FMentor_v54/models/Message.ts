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
  private seen: boolean;

  constructor(
    messageId: string,
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType,
    timestamp: number,
    seen: boolean
  ) {
    this.messageId = messageId;
    this.conversationId = conversationId;
    this.senderId = senderId;
    this.content = content;
    this.type = type;
    this.timestamp = timestamp;
    this.seen = seen;
  }

  // Getters
  getMessageId(): string {
    return this.messageId;
  }

  getConversationId(): string {
    return this.conversationId;
  }

  getSenderId(): string {
    return this.senderId;
  }

  getContent(): string {
    return this.content;
  }

  getType(): MessageType {
    return this.type;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  getSeen(): boolean {
    return this.seen;
  }

  // Setters
  setMessageId(messageId: string): void {
    this.messageId = messageId;
  }

  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }

  setSenderId(senderId: string): void {
    this.senderId = senderId;
  }

  setContent(content: string): void {
    this.content = content;
  }

  setType(type: MessageType): void {
    this.type = type;
  }

  setTimestamp(timestamp: number): void {
    this.timestamp = timestamp;
  }

  setSeen(seen: boolean): void {
    this.seen = seen;
  }

  toJSON(): object {
    return {
      messageId: this.messageId,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp,
      seen: this.seen,
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
      data.seen
    );
  }
}