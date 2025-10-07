import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Course } from "../models/Course";
import { User } from "../models/User";
import { RootStackParamList } from "../navigation/AppNavigator"; // Import RootStackParamList

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const [mentorName, setMentorName] = useState("Loading...");
  const navigation = useNavigation<NavigationProp>(); // Initialize navigation

  useEffect(() => {
    let isMounted = true;
    User.getMentorNameById(course.getMentorId()).then(name => {
      if (isMounted) setMentorName(name);
    });
    return () => { isMounted = false; };
  }, [course]);

  const handlePress = () => {
    navigation.navigate("CourseDetail", { courseId: course.getCourseId() }); // Navigate to CourseDetailScreen
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E2E",
    borderRadius: 12,
    overflow: "hidden",
    width: 180,
    margin: 10,
    height: 240,
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
  },
  star: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CourseCard;