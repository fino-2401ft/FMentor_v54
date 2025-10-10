import { useState, useEffect } from "react";
import { MeetingRepository } from "../repositories/MeetingRepository";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ref, onValue, off } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Meeting } from "../models/Meeting";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useMeetingViewModel = (courseId: string, meetingId?: string) => {
  const { currentUser } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestMeetingId, setLatestMeetingId] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    if (meetingId) {
      const meetingRef = ref(realtimeDB, `meetings/${courseId}/${meetingId}`);
      const listener = onValue(meetingRef, (snapshot) => {
        if (snapshot.exists()) {
          const meetingData = Meeting.fromJSON(snapshot.val());
          setMeeting(meetingData);
          setIsActive(meetingData.isActive());
          setParticipants(meetingData.getParticipants());
          setLatestMeetingId(meetingData.isActive() ? meetingData.getMeetingId() : null);
        } else {
          setMeeting(null);
          setIsActive(false);
          setParticipants([]);
          setLatestMeetingId(null);
        }
        setLoading(false);
      });
      unsubscribe = () => off(meetingRef, 'value', listener);
    } else {
      const meetingsRef = ref(realtimeDB, `meetings/${courseId}`);
      const listener = onValue(meetingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const meetings = snapshot.val();
          const latestMeeting = Object.values(meetings)
            .map((data: any) => Meeting.fromJSON(data))
            .sort((a, b) => b.getStartTime() - a.getStartTime())[0];
          setMeeting(latestMeeting);
          setIsActive(latestMeeting?.isActive() ?? false);
          setParticipants(latestMeeting?.getParticipants() ?? []);
          setLatestMeetingId(latestMeeting?.isActive() ? latestMeeting.getMeetingId() : null);
        } else {
          setMeeting(null);
          setIsActive(false);
          setParticipants([]);
          setLatestMeetingId(null);
        }
        setLoading(false);
      });
      unsubscribe = () => off(meetingsRef, 'value', listener);
    }

    return () => unsubscribe();
  }, [courseId, meetingId]);

  const startMeeting = async (chatGroupId: string) => {
    if (currentUser && currentUser.getRole() === "Mentor") {
      const newMeetingId = await MeetingRepository.createMeeting(courseId, currentUser.getUserId());
      await MeetingRepository.sendMeetingInvite(courseId, newMeetingId, chatGroupId, currentUser.getUserId());
      navigation.navigate("Meeting", { courseId, meetingId: newMeetingId });
    }
  };

  const joinMeeting = async (meetingId: string) => {
    if (currentUser && meetingId) {
      const meetingData = await MeetingRepository.getMeeting(courseId, meetingId);
      if (meetingData && meetingData.isActive()) {
        await MeetingRepository.joinMeeting(courseId, meetingId, currentUser.getUserId());
        navigation.navigate("Meeting", { courseId, meetingId });
      }
    }
  };

  const leaveMeeting = async (meetingId: string) => {
    if (currentUser && meetingId && meeting) {
      await MeetingRepository.leaveMeeting(courseId, meetingId, currentUser.getUserId());
      if (currentUser.getUserId() === meeting.getMentorId()) {
        await MeetingRepository.endMeeting(courseId, meetingId);
      }
      navigation.goBack();
    }
  };

  return { meeting, isActive, participants, loading, latestMeetingId, startMeeting, joinMeeting, leaveMeeting };
};