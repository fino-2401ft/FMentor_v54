import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Course } from "../models/Course";
import { User } from "../models/User";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Button } from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { EnrollmentRepository } from "../repositories/EnrollmentRepository";

interface CourseCardProps {
  course: Course;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [mentorName, setMentorName] = useState("Loading...");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useAuth();
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Lấy tên mentor
    User.getMentorNameById(course.getMentorId()).then((name) => {
      if (isMounted) setMentorName(name);
    });

    // Check mentor
    if (currentUser && course.getMentorId() === currentUser.getUserId()) {
      setIsMentor(true);
    }

    // Check enrollment nếu không phải mentor
    const checkEnrollment = async () => {
      if (currentUser && !isMentor) {
        const enrollmentId = await EnrollmentRepository.getEnrollmentIdByUserId(
          course.getCourseId(),
          currentUser.getUserId()
        );
        if (isMounted) setIsEnrolled(!!enrollmentId);
      }
    };
    checkEnrollment();

    return () => {
      isMounted = false;
    };
  }, [course, currentUser]);

  const handleJoin = async () => {
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in to join this course.");
      return;
    }
    try {
      await EnrollmentRepository.addEnrollment(course.getCourseId(), currentUser.getUserId());
      Alert.alert("Success", "You have joined the course!");
      setIsEnrolled(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join course");
    }
  };

  const handleLearn = () => {
    navigation.navigate("CourseDetail", { courseId: course.getCourseId() });
  };

  const handleManage = () => {
    navigation.navigate("CourseDetail", { courseId: course.getCourseId() });
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: course.getCoverImage() }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.getCourseName()}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {mentorName}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.star}>⭐ {course.getLikeCount()}</Text>

          {/* Nếu là mentor → Manage, ngược lại Join/Learn */}
          {isMentor ? (
            <Button
              mode="contained"
              style={styles.actionButton}
              labelStyle={{ fontSize: 12, fontWeight: "bold" }}
              onPress={handleManage}
            >
              Manage
            </Button>
          ) : (
            <Button
              mode="contained"
              style={styles.actionButton}
              labelStyle={{ fontSize: 12, fontWeight: "bold" }}
              onPress={isEnrolled ? handleLearn : handleJoin}
            >
              {isEnrolled ? "Learn" : "Join"}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    overflow: "hidden",
    width: 180,
    margin: 10,
    height: 260,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#bbb",
    fontSize: 14,
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  star: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#504848ff",
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

export default CourseCard;
