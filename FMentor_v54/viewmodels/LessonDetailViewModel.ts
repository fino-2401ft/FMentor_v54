import { useState, useEffect } from "react";
import { LessonRepository } from "../repositories/LessonRepository";
import { Lesson } from "../models/Lesson";

export const useLessonDetailViewModel = (lessonId: string, courseId: string, userId: string) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const lessonData = await LessonRepository.getLessonById(lessonId);
        if (!lessonData) {
          setError("Lesson not found");
          setLoading(false);
          return;
        }
        setLesson(lessonData);

        const lessonsData = await LessonRepository.getLessonsByCourseId(courseId);
        setLessons(lessonsData);

        const enrollmentId = await LessonRepository.getEnrollmentIdByUserId(courseId, userId);
        if (enrollmentId) {
          const enrollmentRef = ref(realtimeDB, `enrollments/${enrollmentId}`);
          const enrollmentSnapshot = await get(enrollmentRef);
          if (enrollmentSnapshot.exists()) {
            const enrollmentData = enrollmentSnapshot.val();
            setIsCompleted((enrollmentData.completedLessons || []).includes(lessonId));
            setProgress(enrollmentData.progress || 0);
          }
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load lesson");
        setLoading(false);
      }
    };
    fetchData();
  }, [lessonId, courseId, userId]);

  const markLessonCompleted = async () => {
    try {
      const newProgress = await LessonRepository.markLessonCompleted(courseId, userId, lessonId);
      if (newProgress !== null) {
        setIsCompleted(true);
        setProgress(newProgress);
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark lesson completed");
    }
  };

    const getPreviousLessonId = (): string | null => {
    const currentIndex = lessons.findIndex((l) => l.getLessonId() === lessonId);
    if (currentIndex > 0) {
        return lessons[currentIndex - 1].getLessonId();
    }
    return null;
    };

  
  const getNextLessonId = (): string | null => {
    const currentIndex = lessons.findIndex((l) => l.getLessonId() === lessonId);
    if (currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1].getLessonId();
    }
    return null;
  };

  return {
    lesson,
    lessons,
    isCompleted,
    progress,
    loading,
    error,
    markLessonCompleted,
    getNextLessonId,
    getPreviousLessonId
  };
};

import { get, ref } from "firebase/database";
import { realtimeDB } from "../config/Firebase";