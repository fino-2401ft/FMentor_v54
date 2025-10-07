export enum ConversationType {
  Private = "Private",
  CourseChat = "CourseChat",
}

export class Conversation {
  private conversationId: string;
  private type: ConversationType;
  private participants: string[];
  private lastMessageId?: string;
  private lastUpdate: number;

  constructor(
    conversationId: string,
    type: ConversationType,
    participants: string[],
    lastUpdate: number,      // Required, đặt trước
    lastMessageId?: string   // Optional, đặt sau
  ) {
    this.conversationId = conversationId;
    this.type = type;
    this.participants = participants;
    this.lastUpdate = lastUpdate;
    this.lastMessageId = lastMessageId;
  }

  // Getters
  getConversationId(): string {
    return this.conversationId;
  }

  getType(): ConversationType {
    return this.type;
  }

  getParticipants(): string[] {
    return this.participants;
  }

  getLastMessageId(): string | undefined {
    return this.lastMessageId;
  }

  getLastUpdate(): number {
    return this.lastUpdate;
  }

  // Setters
  setConversationId(conversationId: string): void {
    this.conversationId = conversationId;
  }

  setType(type: ConversationType): void {
    this.type = type;
  }

  setParticipants(participants: string[]): void {
    this.participants = participants;
  }

  setLastMessageId(lastMessageId: string | undefined): void {
    this.lastMessageId = lastMessageId;
  }

  setLastUpdate(lastUpdate: number): void {
    this.lastUpdate = lastUpdate;
  }

  toJSON(): object {
    return {
      conversationId: this.conversationId,
      type: this.type,
      participants: this.participants,
      lastMessageId: this.lastMessageId,
      lastUpdate: this.lastUpdate,
    };
  }

  static fromJSON(data: any): Conversation {
    return new Conversation(
      data.conversationId,
      data.type,
      data.participants,
      data.lastUpdate,
      data.lastMessageId
    );
  }
}