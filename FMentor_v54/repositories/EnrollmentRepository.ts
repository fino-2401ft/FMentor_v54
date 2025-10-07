import { get, ref, remove, set } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Enrollment } from "../models/Enrollment";

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

  static async getParticipantsByCourse(courseId: string): Promise<Enrollment[]> {
    try {
      const enrollmentsRef = ref(realtimeDB, "enrollments");
      const snapshot = await get(enrollmentsRef);
      const enrollments: Enrollment[] = [];
      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();
        for (const enrollmentId in enrollmentsData) {
          const enrollment = enrollmentsData[enrollmentId];
          if (enrollment.courseId === courseId) {
            enrollments.push(
              new Enrollment(
                enrollment.enrollmentId,
                enrollment.courseId,
                enrollment.menteeId,
                enrollment.enrollmentDate,
                enrollment.progress,
                enrollment.completedLessons || []
              )
            );
          }
        }
      }
      return enrollments;
    } catch (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
  }

static async addEnrollment(courseId: string, menteeId: string): Promise<void> {
    try {
      // Kiểm tra menteeId tồn tại trong users
      const userRef = ref(realtimeDB, `users/${menteeId}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("Mentee ID does not exist");
      }

      // Kiểm tra mentee đã đăng ký khóa học chưa
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

      // Thêm enrollment mới
      const enrollmentId = `enrollment_${Date.now()}`;
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      await set(enrollmentRef, {
        enrollmentId,
        courseId,
        menteeId,
        enrollmentDate: Date.now(),
        progress: 0,
        completedLessons: []
      });
      console.log(`Added enrollment ${enrollmentId} for mentee ${menteeId} in course ${courseId}`);
    } catch (error) {
      console.error("Error adding enrollment:", error);
      throw error;
    }
  }

  static async removeEnrollment(enrollmentId: string): Promise<void> {
    try {
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      await remove(enrollmentRef);
      console.log(`Removed enrollment ${enrollmentId}`);
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
            if (!userData) {
              return null;
            }
            return {
              enrollmentId: enrollment.enrollmentId,
              userId: userData.userId,
              username: userData.username || "Unknown",
              avatarUrl: userData.avatarUrl || "https://i.pravatar.cc/150?img=1",
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

  static async getParticipantsWithProgress(courseId: string): Promise<Participant[]> {
    try {
      const enrollmentsRef = ref(realtimeDB, "enrollments");
      const snapshot = await get(enrollmentsRef);
      const participants: Participant[] = [];

      if (snapshot.exists()) {
        const enrollmentsData = snapshot.val();

        for (const enrollmentId in enrollmentsData) {
          const enrollment = enrollmentsData[enrollmentId];

          if (enrollment.courseId === courseId) {
            // lấy thông tin user
            const userSnap = await get(ref(realtimeDB, `users/${enrollment.menteeId}`));
            if (!userSnap.exists()) continue;
            const userData = userSnap.val();

            participants.push({
              enrollmentId: enrollment.enrollmentId,
              userId: userData.userId,
              username: userData.username || "Unknown",
              avatarUrl: userData.avatarUrl || "https://i.pravatar.cc/150?img=1",
              progress: enrollment.progress || 0, // lấy từ enrollment
            });
          }
        }
      }

      return participants;
    } catch (error) {
      console.error("Error fetching participants with progress:", error);
      return [];
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