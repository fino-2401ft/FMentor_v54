import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import WebView from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { useMeetingViewModel } from "../viewmodels/MeetingViewModel";
import { useAuth } from "../context/AuthContext";
import { User } from "../models/User";
import Constants from 'expo-constants';
import { ref, get } from "firebase/database";
import { realtimeDB } from "../config/Firebase";
import { Camera } from "expo-camera";

const UserRepository = {
    async getUserById(userId: string): Promise<User | null> {
        const userRef = ref(realtimeDB, `users/${userId}`);
        const snapshot = await get(userRef);
        return snapshot.exists() ? User.fromJSON(snapshot.val()) : null;
    }
};

const MeetingScreen: React.FC = () => {
    const route = useRoute();
    const { courseId, meetingId } = route.params as { courseId: string; meetingId: string };
    const { currentUser } = useAuth();
    const { meeting, isActive, participants, loading, leaveMeeting } = useMeetingViewModel(courseId, meetingId);
    const [userNames, setUserNames] = useState<{ [userId: string]: string }>({});
    const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);

    const requestPermissions = async () => {
        try {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: micStatus } = await Camera.requestMicrophonePermissionsAsync();
            if (cameraStatus === "granted" && micStatus === "granted") {
                console.log("Camera and microphone permissions granted");
                setHasPermissions(true);
            } else {
                console.log("Camera or microphone permission denied");
                Alert.alert("Permission Denied", "Camera and microphone permissions are required for video calls.");
                setHasPermissions(false);
            }
        } catch (error) {
            console.error("Error requesting permissions:", error);
            Alert.alert("Permission Error", "Failed to request camera/microphone permissions.");
            setHasPermissions(false);
        }
    };

    useEffect(() => {
        requestPermissions();

        console.log("Current User ID:", currentUser?.getUserId());
        console.log("Meeting Mentor ID:", meeting?.getMentorId());
        console.log("Is Mentor:", currentUser?.getUserId() === meeting?.getMentorId());

        const fetchNames = async () => {
            const names: { [userId: string]: string } = {};
            for (const userId of participants) {
                const user = await UserRepository.getUserById(userId);
                names[userId] = user?.getUsername() || "Unknown";
            }
            setUserNames(names);
        };
        fetchNames();
    }, [participants, currentUser, meeting]);

    if (loading || hasPermissions === null) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1E90FF" />
                <Text>Loading meeting...</Text>
            </View>
        );
    }

    if (!hasPermissions) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Camera and microphone permissions are required.</Text>
                <Button title="Try Again" onPress={requestPermissions} />
            </View>
        );
    }

    if (!isActive || !meeting || meeting.getMeetingId() !== meetingId) {
        return <Text style={styles.errorText}>Meeting has ended</Text>;
    }

    const isMentor = currentUser?.getUserId() === meeting.getMentorId();
    const channelName = `meeting_${meetingId}`;
    const agoraAppId = Constants.expoConfig?.extra?.agoraAppId || "04d490cc39a8474e96901735ec2e362e";

    console.log("Agora App ID:", agoraAppId);
    console.log("Channel Name:", channelName);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://webcdn.agora.io/agora-rtc-sdk/4.24.2/AgoraRTC_N.js"></script>
      <style>
        #mentorVideo { 
          width: 100%; 
          height: 300px; 
          background-color: #000; 
          position: relative;
          z-index: 1;
        }
        #errorMessage {
          color: red;
          font-size: 16px;
          text-align: center;
          display: none;
        }
      </style>
    </head>
    <body>
      <div id="mentorVideo"></div>
      <div id="errorMessage"></div>
      <script>
        // Kiểm tra hỗ trợ WebRTC
        const isWebRTCSupported = !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
        console.log("WebRTC supported:", isWebRTCSupported);
        if (!isWebRTCSupported) {
          document.getElementById("errorMessage").style.display = "block";
          document.getElementById("errorMessage").innerText = "WebRTC is not supported on this device.";
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "AgoraError",
            details: { message: "WebRTC is not supported on this device", code: "WEBRTC_NOT_SUPPORTED", name: "WebRTCError" }
          }));
        }

        const appId = "${agoraAppId}";
        const channel = "${channelName}";
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
        let localStream;

        async function join() {
          try {
            console.log("Attempting to join channel with App ID:", appId);
            const uid = await client.join(appId, channel, null, null);
            console.log("Joined channel successfully, UID:", uid);
            const videoEnabled = ${isMentor};
            console.log("Video enabled:", videoEnabled);

            try {
              const [audioTrack, videoTrack] = await Promise.all([
                videoEnabled ? AgoraRTC.createMicrophoneAudioTrack() : null,
                videoEnabled ? AgoraRTC.createCameraVideoTrack() : null
              ]);
              localStream = { audioTrack, videoTrack };
              console.log("Local tracks created:", { audioTrack: !!audioTrack, videoTrack: !!videoTrack });

              if (videoEnabled && videoTrack) {
                try {
                  videoTrack.play("mentorVideo", { fit: "contain" });
                  console.log("Playing local video in mentorVideo div");
                } catch (playError) {
                  console.error("Video play error:", playError);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "AgoraError",
                    details: { 
                      message: playError.message || "Failed to play video",
                      code: playError.code || "PLAY_ERROR",
                      name: playError.name || "VideoPlayError"
                    }
                  }));
                  return;
                }
              }
              const tracks = [audioTrack, videoTrack].filter(track => track);
              await client.publish(tracks);
              console.log("Tracks published");
            } catch (initError) {
              const errorDetails = {
                message: initError.message || "Unknown track creation error",
                code: initError.code || "UNKNOWN",
                name: initError.name || "UnknownError"
              };
              console.error("Track creation error:", errorDetails);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "AgoraError",
                details: errorDetails
              }));
              return;
            }
          } catch (error) {
            const errorDetails = {
              message: error.message || "Unknown join error",
              code: error.code || "UNKNOWN",
              name: error.name || "UnknownError"
            };
            console.error("Error in join:", errorDetails);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "AgoraError",
              details: errorDetails
            }));
          }
        }

        client.on("user-published", async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
            console.log("Subscribed to user:", user.uid, "mediaType:", mediaType);
            if (mediaType === "video" && user.videoTrack) {
              try {
                user.videoTrack.play("mentorVideo", { fit: "contain" });
                console.log("Playing remote video in mentorVideo div");
              } catch (playError) {
                console.error("Remote video play error:", playError);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: "AgoraError",
                  details: { 
                    message: playError.message || "Failed to play remote video",
                    code: playError.code || "REMOTE_PLAY_ERROR",
                    name: playError.name || "RemoteVideoPlayError"
                  }
                }));
              }
            }
            if (mediaType === "audio" && user.audioTrack) {
              user.audioTrack.play();
              console.log("Playing remote audio");
            }
          } catch (error) {
            const errorDetails = {
              message: error.message || "Unknown subscribe error",
              code: error.code || "UNKNOWN",
              name: error.name || "UnknownError"
            };
            console.error("Error in user-published:", errorDetails);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "AgoraError",
              details: errorDetails
            }));
          }
        });

        client.on("error", (error) => {
          const errorDetails = {
            message: error.message || "Unknown client error",
            code: error.code || "UNKNOWN",
            name: error.name || "UnknownError"
          };
          console.error("Client error:", errorDetails);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "AgoraError",
            details: errorDetails
          }));
        });

        join();
      </script>
    </body>
    </html>
  `;

    const handleWebViewMessage = (event: any) => {
        const message = event.nativeEvent.data;
        if (typeof message === "string") {
            try {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.type === "AgoraError") {
                    const error = parsedMessage.details;
                    console.log("Received Agora Error:", error);
                    Alert.alert("Agora Error", error.message || "Failed to initialize video stream");
                }
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError, "Original message:", message);
                Alert.alert("Agora Error", "Failed to initialize video stream: Invalid error format");
            }
        } else {
            console.log("Non-string message received:", message);
        }
    };

    return (
        <View style={styles.container}>
            <WebView
                source={{ html }}
                style={styles.webview}
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowsCameraAccess
                allowsMicrophoneAccess
                originWhitelist={['*']}
                onMessage={handleWebViewMessage}
            />
            <Text style={styles.participantsTitle}>Participants:</Text>
            <FlatList
                data={participants}
                keyExtractor={id => id}
                renderItem={({ item }) => <Text style={styles.participant}>{userNames[item]}</Text>}
            />
            <Button
                title={isMentor ? "End Meeting" : "Leave Meeting"}
                onPress={() => leaveMeeting(meetingId)}
                color={isMentor ? "#FF4444" : "#1E90FF"}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    webview: { height: 300, marginBottom: 16, backgroundColor: "#000" },
    participantsTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 8 },
    participant: { fontSize: 16, paddingVertical: 4 },
    errorText: { fontSize: 18, color: "red", textAlign: "center", marginTop: 20 },
});

export default MeetingScreen;