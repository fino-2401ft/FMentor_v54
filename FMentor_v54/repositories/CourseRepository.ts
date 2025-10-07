import { ref, get, onValue } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Course } from "../models/Course";
import { Lesson } from "../models/Lesson";
import { Enrollment } from "../models/Enrollment";
import { User, Mentor } from "../models/User";

export class CourseRepository {
  static getCoursesRealtime(callback: (courses: Course[]) => void) {
    const coursesRef = ref(realtimeDB, "courses");

    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const courses: Course[] = Object.keys(data).map((key) =>
          Course.fromJSON(data[key])
        );
        callback(courses);
      } else {
        callback([]);
      }
    });

    return () => unsubscribe();
  }

  static async getCourseById(courseId: string): Promise<Course | null> {
    const snapshot = await get(ref(realtimeDB, `courses/${courseId}`));
    return snapshot.exists() ? Course.fromJSON(snapshot.val()) : null;
  }

  static async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const snapshot = await get(ref(realtimeDB, "lessons"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data)
      .map((key) => Lesson.fromJSON(data[key]))
      .filter((lesson) => lesson.getCourseId() === courseId);
  }

  static async getParticipantsByCourse(courseId: string): Promise<Enrollment[]> {
    const snapshot = await get(ref(realtimeDB, "enrollments"));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data)
      .map((key) => Enrollment.fromJSON(data[key]))
      .filter((enrollment) => enrollment.getCourseId() === courseId);
  }

  static async getMentorById(mentorId: string): Promise<Mentor | null> {
    try {
      const userRef = ref(realtimeDB, `users/${mentorId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.role === "Mentor") {
          return Mentor.fromJSON(data);
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching mentor:", error);
      return null;
    }
  }


  static async getUserProgress(courseId: string, menteeId: string): Promise<{ progress: number; completedLessons: string[] }> {
    const snapshot = await get(ref(realtimeDB, "enrollments"));
    if (!snapshot.exists()) return { progress: 0, completedLessons: [] };
    const data = snapshot.val();
    const enrollment = Object.keys(data)
      .map((key) => Enrollment.fromJSON(data[key]))
      .find((enrollment) => enrollment.getCourseId() === courseId && enrollment.getMenteeId() === menteeId);
    
    if (!enrollment) return { progress: 0, completedLessons: [] };

    const lessons = await this.getLessonsByCourse(courseId);
    const totalLessons = lessons.length;
    const completedLessons = (enrollment as any).completedLessons || [];
    const progress = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

    return { progress, completedLessons };
  }
}