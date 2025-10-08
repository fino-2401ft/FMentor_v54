// src/viewmodels/CourseDetailViewModel.ts
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { CourseRepository } from "../repositories/CourseRepository";
import { EnrollmentRepository, Participant } from "../repositories/EnrollmentRepository";
import { LessonRepository } from "../repositories/LessonRepository";
import { Course } from "../models/Course";
import { Mentor } from "../models/User";
import { Lesson } from "../models/Lesson";
import { useAuth } from "../context/AuthContext";

export function useCourseDetailViewModel(courseId: string) {
  const { currentUser } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [progress, setProgress] = useState(0);
  const [isMentor, setIsMentor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [input, setInput] = useState("");

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

      // Fetch participants
      const participantsData = await EnrollmentRepository.getParticipantsByCourse(courseId);
      console.log("Participants fetched:", participantsData); // Debug log
      setParticipants(participantsData);
      setFilteredParticipants(participantsData);

      // Fetch user progress
      if (currentUser) {
        const progressData = await CourseRepository.getUserProgress(courseId, currentUser.getUserId());
        setProgress(progressData.progress);
      } else {
        setProgress(0);
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      Alert.alert("Error", "Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId, currentUser]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleAddMentee = async () => {
    if (!input) {
      Alert.alert("Error", "Please enter a username or ID");
      return;
    }
    try {
      await EnrollmentRepository.addEnrollment(courseId, input);
      Alert.alert("Success", "Mentee added successfully");
      setInput("");
      await fetchData();
    } catch (error: any) {
      const message =
        error.message === "Mentee ID or username does not exist"
          ? "Mentee ID or username does not exist"
          : error.message === "Mentee already enrolled in this course"
            ? "Mentee already enrolled in this course"
            : "Failed to add mentee";
      Alert.alert("Error", message);
    }
  };

  const handleSearchMentee = async () => {
    if (!input) {
      setFilteredParticipants(participants);
      return;
    }
    try {
      const results = await EnrollmentRepository.searchMenteeInCourse(courseId, input);
      if (results.length === 0) {
        Alert.alert("Error", "No mentee found");
      }
      setFilteredParticipants(results);
    } catch (error) {
      Alert.alert("Error", "Failed to search mentee");
    }
  };

  const handleRemoveMentee = async (enrollmentId: string) => {
    Alert.alert("Confirm", "Remove this mentee?", [
      { text: "Cancel" },
      {
        text: "Remove",
        onPress: async () => {
          try {
            await EnrollmentRepository.removeEnrollment(enrollmentId);
            await fetchData();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to remove mentee");
          }
        },
      },
    ]);
  };

  const handleRemoveLesson = async (lessonId: string) => {
    Alert.alert("Confirm", "Delete this lesson?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await LessonRepository.removeLesson(lessonId);
            await fetchData();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete lesson");
          }
        },
      },
    ]);
  };

  return {
    course,
    mentor,
    lessons,
    participants,
    filteredParticipants,
    progress,
    isMentor,
    loading,
    editMode,
    input,
    setInput,
    fetchData,
    toggleEditMode,
    handleAddMentee,
    handleSearchMentee,
    handleRemoveMentee,
    handleRemoveLesson,
  };
}