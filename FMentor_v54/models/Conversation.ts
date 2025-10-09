export enum ConversationType {
  Private = "Private",
  CourseChat = "CourseChat",
}

export class Conversation {
  private conversationId: string;
  private type: ConversationType;
  private participants: string[];
  private lastUpdate: number;
  private lastMessageId: string;

  constructor(
    conversationId: string,
    type: ConversationType,
    participants: string[],
    lastUpdate: number,
    lastMessageId: string = ""
  ) {
    this.conversationId = conversationId;
    this.type = type;
    this.participants = participants;
    this.lastUpdate = lastUpdate;
    this.lastMessageId = lastMessageId;
  }

  getConversationId(): string { return this.conversationId; }
  getType(): ConversationType { return this.type; }
  getParticipants(): string[] { return this.participants; }
  getLastUpdate(): number { return this.lastUpdate; }
  getLastMessageId(): string { return this.lastMessageId; }

  setConversationId(id: string): void { this.conversationId = id; }
  setType(type: ConversationType): void { this.type = type; }
  setParticipants(participants: string[]): void { this.participants = participants; }
  setLastUpdate(lastUpdate: number): void { this.lastUpdate = lastUpdate; }
  setLastMessageId(lastMessageId: string): void { this.lastMessageId = lastMessageId; }

  toJSON(): object {
    return {
      conversationId: this.conversationId,
      type: this.type,
      participants: this.participants,
      lastUpdate: this.lastUpdate,
      lastMessageId: this.lastMessageId,
    };
  }

  static fromJSON(data: any): Conversation {
    return new Conversation(
      data.conversationId,
      data.type,
      data.participants || [],
      data.lastUpdate || 0,
      data.lastMessageId || ""
    );
  }
}