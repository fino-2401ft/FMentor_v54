import { ref, set, get, onValue, off, update, push } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Meeting } from "../models/Meeting";
import { Message, MessageType } from "../models/Message";
import { MessageRepository } from "./MessageRepository"; 

export class MeetingRepository {
  static async createMeeting(courseId: string, mentorId: string): Promise<string> {
    const meetingId = push(ref(realtimeDB, `meetings/${courseId}`)).key || `meeting_${Date.now()}`;
    const meeting = new Meeting(meetingId, courseId, mentorId);
    const meetingRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}`);
    await set(meetingRef, meeting.toJSON());
    return meetingId;
  }

  static async getMeeting(courseId: string, meetingId: string): Promise<Meeting | null> {
    const meetingRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}`);
    const snapshot = await get(meetingRef);
    return snapshot.exists() ? Meeting.fromJSON(snapshot.val()) : null;
  }

  static async joinMeeting(courseId: string, meetingId: string, userId: string): Promise<void> {
    const participantRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}/participants/${userId}`);
    await set(participantRef, true);
  }

  static async leaveMeeting(courseId: string, meetingId: string, userId: string): Promise<void> {
    const participantRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}/participants/${userId}`);
    await set(participantRef, null);
  }

  static async endMeeting(courseId: string, meetingId: string): Promise<void> {
    const meetingRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}`);
    await update(meetingRef, { active: false, participants: null });
  }

  static listenToMeeting(courseId: string, meetingId: string, callback: (meeting: Meeting | null) => void): () => void {
    const meetingRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}`);
    const listener = onValue(meetingRef, (snapshot) => {
      callback(snapshot.exists() ? Meeting.fromJSON(snapshot.val()) : null);
    });
    return () => off(meetingRef, 'value', listener);
  }

  static async sendMeetingInvite(courseId: string, meetingId: string, chatGroupId: string, mentorId: string): Promise<void> {
    const content = JSON.stringify({
      text: "Mentor has created a meeting, join now..",
      meetingId,
      courseId
    });
    const message = new Message(
      `msg_${Date.now()}`,
      chatGroupId,
      mentorId,
      content,
      MessageType.MeetingInvite,
      Date.now(),
      []
    );
    await MessageRepository.sendMessage(message);
  }
}