import { equalTo, get, orderByChild, query, ref, remove, set, update } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Enrollment } from "../models/Enrollment";
import { ConversationRepository } from "./ConversationRepository";
import { ConversationType } from "../models/Conversation";

export class EnrollmentRepository {
  static async getEnrollmentIdByUserId(courseId: string, userId: string): Promise<string | null> {
    try {
      const enrollmentsRef = ref(realtimeDB, "enrollments");
      const snapshot = await get(enrollmentsRef);
      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();
        for (const enrollmentId in enrollmentsData) {
          const enrollment = enrollmentsData[enrollmentId];
          if (enrollment.courseId === courseId && enrollment.menteeId === userId) {
            return enrollmentId;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching enrollment ID:", error);
      return null;
    }
  }

  static async getParticipantsByCourse(courseId: string): Promise<Participant[]> {
    try {
      const enrollmentsRef = query(ref(realtimeDB, "enrollments"), orderByChild("courseId"), equalTo(courseId));
      const snapshot = await get(enrollmentsRef);
      const participants: Participant[] = [];

      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();
        for (const enrollmentId in enrollmentsData) {
          const enrollment = Enrollment.fromJSON(enrollmentsData[enrollmentId]);
          const userSnapshot = await get(ref(realtimeDB, `users/${enrollment.getMenteeId()}`));
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            participants.push({
              enrollmentId: enrollment.getEnrollmentId(),
              userId: enrollment.getMenteeId(),
              username: userData.username || "Unknown",
              avatarUrl: userData.avatarUrl || "https://i.pravatar.cc/150?img=1",
              progress: enrollment.getProgress(),
            });
          }
        }
      }
      return participants;
    } catch (error) {
      console.error("Error fetching participants", error);
      return [];
    }
  }

  static async addEnrollment(courseId: string, menteeId: string): Promise<void> {
    try {
      // Kiểm tra user tồn tại
      const userRef = ref(realtimeDB, `users/${menteeId}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("Mentee ID does not exist");
      }

      // Kiểm tra đã enroll chưa
      const enrollmentsRef = ref(realtimeDB, "enrollments");
      const snapshot = await get(enrollmentsRef);
      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();
        for (const enrollmentId in enrollmentsData) {
          if (
            enrollmentsData[enrollmentId].courseId === courseId &&
            enrollmentsData[enrollmentId].menteeId === menteeId
          ) {
            throw new Error("Mentee already enrolled in this course");
          }
        }
      }

      // Tạo enrollment
      const enrollmentId = `enrollment_${Date.now()}`;
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      await set(enrollmentRef, {
        enrollmentId,
        courseId,
        menteeId,
        enrollmentDate: Date.now(),
        progress: 0,
        completedLessons: [],
      });

      // Thêm mentee vào course chat
      const courseSnap = await get(ref(realtimeDB, `courses/${courseId}`));
      if (!courseSnap.exists()) {
        throw new Error("Course does not exist");
      }
      const courseData = courseSnap.val();
      let chatGroupId = courseData.chatGroupId;

      if (!chatGroupId) {
        // Tạo mới course chat
        chatGroupId = `course_${courseId}_${Date.now()}`;
        const mentorId = courseData.mentorId || menteeId; // Fallback to menteeId if mentorId missing
        await ConversationRepository.createConversation(menteeId, mentorId, ConversationType.CourseChat, chatGroupId);
        await update(ref(realtimeDB, `courses/${courseId}`), { chatGroupId });
      } else {
        // Thêm mentee vào danh sách participants của course chat
        const convRef = ref(realtimeDB, `conversations/${chatGroupId}`);
        const convSnap = await get(convRef);
        if (convSnap.exists()) {
          let participants = convSnap.val().participants || [];
          if (!participants.includes(menteeId)) {
            participants = [...participants, menteeId];
            await update(convRef, { participants });
          }
        } else {
          // Nếu conversation không tồn tại, tạo mới
          const mentorId = courseData.mentorId || menteeId;
          await ConversationRepository.createConversation(menteeId, mentorId, ConversationType.CourseChat, chatGroupId);
        }
      }
    } catch (error) {
      console.error("Error adding enrollment:", error);
      throw error;
    }
  }

  static async removeEnrollment(enrollmentId: string): Promise<void> {
    try {
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      const enrollmentSnap = await get(enrollmentRef);
      if (enrollmentSnap.exists()) {
        const { courseId, menteeId } = enrollmentSnap.val();
        await remove(enrollmentRef);

        const courseSnap = await get(ref(realtimeDB, `courses/${courseId}`));
        if (courseSnap.exists()) {
          const chatGroupId = courseSnap.val().chatGroupId;
          if (chatGroupId) {
            const partsRef = ref(realtimeDB, `conversations/${chatGroupId}/participants`);
            const partsSnap = await get(partsRef);
            let parts = partsSnap.val() || [];
            parts = parts.filter((id: string) => id !== menteeId);
            await set(partsRef, parts);
          }
        }
      }
    } catch (error) {
      console.error("Error removing enrollment:", error);
      throw error;
    }
  }

  static async searchMenteeInCourse(courseId: string, searchTerm: string): Promise<Participant[]> {
    try {
      const enrollmentsRef = ref(realtimeDB, "enrollments");
      const snapshot = await get(enrollmentsRef);
      const participants: Participant[] = [];
      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();
        const userPromises = Object.keys(enrollmentsData)
          .filter((enrollmentId) => enrollmentsData[enrollmentId].courseId === courseId)
          .map(async (enrollmentId) => {
            const enrollment = enrollmentsData[enrollmentId];
            const userSnapshot = await get(ref(realtimeDB, `users/${enrollment.menteeId}`));
            const userData = userSnapshot.val();
            if (!userData) return null;
            return {
              enrollmentId: enrollment.enrollmentId,
              userId: userData.userId,
              username: userData.username || "Unknown",
              avatarUrl: userData.avatarUrl || "https://i.pravatar.cc/150?img=1",
              progress: enrollment.progress ?? 0,
            };
          });
        const participantsData = (await Promise.all(userPromises)).filter((p): p is Participant => p !== null);
        return participantsData.filter(
          (participant) =>
            participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.userId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return participants;
    } catch (error) {
      console.error("Error searching mentees:", error);
      return [];
    }
  }

  static async getProgressByEnrollmentId(enrollmentId: string): Promise<number> {
    try {
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      const snapshot = await get(enrollmentRef);
      if (snapshot.exists()) {
        const enrollment = snapshot.val();
        return enrollment.progress ?? 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching progress by enrollmentId:", error);
      return 0;
    }
  }

  static async getMentorIdByCourse(courseId: string): Promise<string | null> {
    try {
      const courseRef = ref(realtimeDB, `courses/${courseId}`);
      const snapshot = await get(courseRef);
      if (snapshot.exists()) {
        const courseData = snapshot.val();
        return courseData.mentorId || null;
      }
      return null;
    } catch (error) {
      console.error("Error fetching mentorId by course:", error);
      return null;
    }
  }
}

export interface Participant {
  enrollmentId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  progress: number;
}