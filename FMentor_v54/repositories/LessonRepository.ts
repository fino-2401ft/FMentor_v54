import { get, ref, update, query, orderByChild, equalTo } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Lesson } from "../models/Lesson";

export class LessonRepository {
  static async getLessonById(lessonId: string): Promise<Lesson | null> {
    try {
      const lessonRef = ref(realtimeDB, `lessons/${lessonId}`);
      const snapshot = await get(lessonRef);
      if (snapshot.exists()) {
        return Lesson.fromJSON(snapshot.val());
      }
      return null;
    } catch (error) {
      console.error("Error fetching lesson:", error);
      return null;
    }
  }

  static async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    try {
      const lessonsRef = query(ref(realtimeDB, "lessons"), orderByChild("courseId"), equalTo(courseId));
      const snapshot = await get(lessonsRef);
      const lessons: Lesson[] = [];
      if (snapshot.exists()) {
        const lessonsData = snapshot.val();
        for (const id in lessonsData) {
          lessons.push(Lesson.fromJSON(lessonsData[id]));
        }
      }
      return lessons;
    } catch (error) {
      console.error("Error fetching lessons:", error);
      return [];
    }
  }

  static async markLessonCompleted(courseId: string, userId: string, lessonId: string): Promise<number | null> {
    try {
      const enrollmentId = await this.getEnrollmentIdByUserId(courseId, userId);
      if (!enrollmentId) {
        throw new Error("Enrollment not found");
      }

      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      const enrollmentSnapshot = await get(enrollmentRef);
      if (!enrollmentSnapshot.exists()) {
        throw new Error("Enrollment not found");
      }

      const enrollmentData = enrollmentSnapshot.val();
      const completedLessons = enrollmentData.completedLessons || [];
      if (completedLessons.includes(lessonId)) {
        throw new Error("Lesson already completed");
      }

      completedLessons.push(lessonId);
      const lessons = await this.getLessonsByCourseId(courseId);
      const newProgress = (completedLessons.length / lessons.length) * 100;
      await update(enrollmentRef, {
        completedLessons,
        progress: newProgress,
      });

      return newProgress;
    } catch (error) {
      console.error("Error marking lesson completed:", error);
      throw error;
    }
  }

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

  static async getCompletedLessons(courseId: string, userId: string): Promise<string[]> {
    try {
      const enrollmentId = await this.getEnrollmentIdByUserId(courseId, userId);
      if (!enrollmentId) {
        return [];
      }
      const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
      const snapshot = await get(enrollmentRef);
      if (snapshot.exists()) {
        const enrollmentData = snapshot.val();
        return enrollmentData.completedLessons || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
      return [];
    }
  }
}