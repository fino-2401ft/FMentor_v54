import { ConversationType } from "./Conversation";

enum CallStatus {
  Ongoing = "Ongoing",
  Ended = "Ended",
  Missed = "Missed",
}

// Call class
export class Call {
  callId: string;
  conversationId?: string;
  courseId?: string;
  type: ConversationType;
  participants: string[];
  startTime: number;
  endTime?: number;
  agoraChannel: string;
  status: CallStatus;

  constructor(
    callId: string,
    type: ConversationType,
    participants: string[],
    startTime: number,
    agoraChannel: string,
    status: CallStatus = CallStatus.Ongoing,
    conversationId?: string,
    courseId?: string,
    endTime?: number
  ) {
    this.callId = callId;
    this.conversationId = conversationId;
    this.courseId = courseId;
    this.type = type;
    this.participants = participants;
    this.startTime = startTime;
    this.endTime = endTime;
    this.agoraChannel = agoraChannel;
    this.status = status;
  }
}