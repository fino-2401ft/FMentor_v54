// src/viewmodels/AddCourseViewModel.ts
import { useState } from "react";
import { Course } from "../models/Course";
import { CourseRepository } from "../repositories/CourseRepository";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";

export const useAddCourseViewModel = (currentUserId: string) => {
  const [courseName, setCourseName] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>(""); // coverImage: url từ cloudinary
  const [loading, setLoading] = useState<boolean>(false);

  const handleUploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const uploadedUrl = await CloudinaryUtils.uploadImage(uri);
      setCoverImage(uploadedUrl);
      return uploadedUrl;
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseName || !coverImage) {
      throw new Error("Vui lòng nhập tên khóa học và chọn ảnh bìa.");
    }

    const courseId = `course_${Date.now()}`;
    const chatGroupId = `chat_${Date.now()}`;
    const likeCount = 0;
    const mentorId = currentUserId; // **chính xác: gán user id ở đây**

    const newCourse = new Course(
      courseId,
      courseName,
      mentorId,
      chatGroupId,
      likeCount,
      coverImage
    );

    await CourseRepository.addCourse(newCourse);
    return newCourse;
  };

  return {
    courseName,
    setCourseName,
    coverImage,
    loading,
    handleUploadImage,
    handleAddCourse,
  };
};
