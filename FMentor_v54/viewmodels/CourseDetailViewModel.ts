import { useState, useEffect } from "react";
import { CourseRepository } from "../repositories/CourseRepository";
import { EnrollmentRepository, Participant } from "../repositories/EnrollmentRepository"; // lấy Participant ở đây
import { Course } from "../models/Course";
import { Mentor } from "../models/User";
import { Lesson } from "../models/Lesson";
import { get, ref } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { useAuth } from "../context/AuthContext";

export function useCourseDetailViewModel(courseId: string) {
  const { currentUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [progress, setProgress] = useState(0);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch course
      const courseData = await CourseRepository.getCourseById(courseId);
      setCourse(courseData);

      // Check if current user is the mentor
      if (courseData && currentUser) {
        setIsMentor(currentUser.getUserId() === courseData.getMentorId());
      }

      // Fetch mentor
      if (courseData) {
        const mentorData = await CourseRepository.getMentorById(courseData.getMentorId());
        setMentor(mentorData);
      }

      // Fetch lessons
      const lessonsData = await CourseRepository.getLessonsByCourse(courseId);
      setLessons(lessonsData);

      // Fetch participants with progress
      const enrollments = await EnrollmentRepository.getParticipantsByCourse(courseId);
      const userPromises = enrollments.map(async (enrollment) => {
        const userSnapshot = await get(ref(realtimeDB, `users/${enrollment.getMenteeId()}`));
        const userData = userSnapshot.val();
        if (!userData) return null;
        return {
          enrollmentId: enrollment.getEnrollmentId(),
          userId: userData.userId,
          username: userData.username || "Unknown",
          avatarUrl: userData.avatarUrl || "https://i.pravatar.cc/150?img=1",
          progress: enrollment.getProgress(),  
        } as Participant;
      });
      const participantsData = (await Promise.all(userPromises)).filter((p): p is Participant => p !== null);
      setParticipants(participantsData);

      // Fetch progress for current user
      if (currentUser) {
        const progressData = await CourseRepository.getUserProgress(courseId, currentUser.getUserId());
        setProgress(progressData.progress);
      } else {
        setProgress(0);
      }

    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, currentUser]);

  return { course, mentor, lessons, participants, progress, isMentor, loading, fetchData };
}
