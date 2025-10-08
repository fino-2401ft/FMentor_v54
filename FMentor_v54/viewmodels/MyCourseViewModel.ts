// src/viewmodels/MyCourseViewModel.ts
import { useState, useCallback } from "react";
import { Course } from "../models/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export const useMyCourseViewModel = (userId: string, userRole: string) => {
  const [mentorCourses, setMentorCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const loadCourses = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      if (userRole === "Mentor") {
        const [mentor, enrolled, completed] = await Promise.all([
          CourseRepository.getMentoringCourses(userId),
          CourseRepository.getEnrollingCourses(userId),
          CourseRepository.getCompletedCourses(userId),
        ]);
        setMentorCourses(mentor);
        setEnrolledCourses(enrolled);
        setCompletedCourses(completed);
      } else {
        const [enrolled, completed] = await Promise.all([
          CourseRepository.getEnrollingCourses(userId),
          CourseRepository.getCompletedCourses(userId),
        ]);
        setEnrolledCourses(enrolled);
        setCompletedCourses(completed);
        setMentorCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  return {
    mentorCourses,
    enrolledCourses,
    completedCourses,
    loading,
    loadCourses,
  };
};
