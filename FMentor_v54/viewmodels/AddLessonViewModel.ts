import { useState } from "react";
import { Lesson } from "../models/Lesson";
import { LessonRepository } from "../repositories/LessonRepository";
import { CloudinaryUtils } from "../utils/CloudinaryUtils";
import uuid from "react-native-uuid";

export function useAddLessonViewModel(courseId: string) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUploadVideo = async (fileUri: string) => {
    try {
      setLoading(true);
      const url = await CloudinaryUtils.uploadVideo(fileUri);
      setVideoUrl(url);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async () => {
    if (!title.trim() || !content.trim()) {
      throw new Error("Please fill all fields");
    }

    const lessonId = uuid.v4().toString();
    const newLesson = new Lesson(lessonId, courseId, title, content, videoUrl || "");

    await LessonRepository.addLesson(newLesson);
    setTitle("");
    setContent("");
    setVideoUrl(null);
  };

  return {
    title,
    content,
    videoUrl,
    loading,
    setTitle,
    setContent,
    handleUploadVideo,
    handleAddLesson,
  };
}
