// src/viewmodels/EditLessonViewModel.ts
import { useState, useEffect } from "react";
import { Lesson } from "../models/Lesson";
import { LessonRepository } from "../repositories/LessonRepository";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";

export function useEditLessonViewModel(lessonId: string, courseId: string) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const lesson = await LessonRepository.getLessonById(lessonId);
        if (lesson) {
          setTitle(lesson.getTitle());
          setContent(lesson.getContent());
          setVideoUrl(lesson.getVideoUrl() ?? null);
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch lesson");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleUploadVideo = async (fileUri: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = await CloudinaryUtils.uploadVideo(fileUri);
      setVideoUrl(url);
      return url;
    } catch (e: any) {
      setError(e.message || "Failed to upload video");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async () => {
    if (!title.trim() || !content.trim()) {
      const errMsg = "Please fill all fields";
      setError(errMsg);
      throw new Error(errMsg);
    }

    try {
      setLoading(true);
      setError(null);
      const updatedLesson = new Lesson(lessonId, courseId, title, content, videoUrl || "");
      await LessonRepository.updateLesson(updatedLesson);
      setTitle("");
      setContent("");
      setVideoUrl(null);
    } catch (e: any) {
      setError(e.message || "Failed to update lesson");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    title,
    content,
    videoUrl,
    loading,
    error,
    setTitle,
    setContent,
    handleUploadVideo,
    handleUpdateLesson,
  };
}