// viewmodels/CourseViewModel.ts
import { useState, useEffect } from "react";
import { Course } from "../models/Course";
import { CourseRepository } from "../repositories/CourseRepository";

export const useCourseViewModel = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = CourseRepository.getCoursesRealtime((data: Course[]) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { courses, loading };
};
