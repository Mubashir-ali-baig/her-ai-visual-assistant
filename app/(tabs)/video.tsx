import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Audio } from "expo-av";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { LLMService } from "../../services/llmService";
import { saveMemory, uploadVideoToSupabase } from "../../services/supabase";

export default function VideoScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [frameCount, setFrameCount] = useState(3);
  const [showFrameCountModal, setShowFrameCountModal] = useState(false);
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused();
  const isWeb = Platform.OS === "web";
  const [uploading, setUploading] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [analysing, setAnalysing] = useState(false);

  const switchCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    console.log("[Video] Start 10s video capture pressed");
    setIsRecording(true);
    try {
      // @ts-ignore
      const video = await cameraRef.current.recordAsync({
        maxDuration: 10,
        quality: "480p",
      });
      setIsRecording(false);
      if (video?.uri) {
        await handleVideoAnalysis(video.uri);
      }
    } catch (e) {
      setIsRecording(false);
      console.error("Video recording error:", e);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      // @ts-ignore
      await cameraRef.current.stopRecording();
    }
  };

  // Utility to get video duration using expo-av's Audio.Sound
  const getVideoDuration = async (videoUri: string): Promise<number> => {
    const { sound } = await Audio.Sound.createAsync({ uri: videoUri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    if (status && "durationMillis" in status && status.durationMillis) {
      return status.durationMillis;
    }
    throw new Error("Could not get video duration");
  };

  // Extract N frames from the video and convert to base64
  const extractFramesAsBase64 = async (videoUri: string, frameCount = 3) => {
    const duration = await getVideoDuration(videoUri);
    if (!duration) throw new Error("Could not determine video duration");
    const interval = duration / (frameCount + 1);
    const frames: string[] = [];
    for (let i = 1; i <= frameCount; i++) {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: Math.floor(interval * i),
        });
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        frames.push(base64);
      } catch (err) {
        console.error(`[Video] Error extracting frame ${i}:`, err);
      }
    }
    return frames;
  };

  const handleVideoAnalysis = async (videoUri: string) => {
    setUploading(true);
    setIsLoading(true);
    try {
      setUploading(false);
      setAnalysing(true);
      const frames = await extractFramesAsBase64(videoUri, frameCount);
      if (frames.length === 0)
        throw new Error("No frames extracted from video");
      const response = await LLMService.getInstance().analyzeVideoFrames(
        frames
      );
      setAnalysing(false);
      setNarrating(true);
      await new Promise((resolve, reject) => {
        Speech.speak(response.commentary, {
          rate: 1.0,
          onDone: resolve,
          onStopped: resolve,
          onError: reject,
        });
      });
      setNarrating(false);
      setUploading(true);
      // Upload video and save memory
      if (user && videoUri) {
        const videoUrl = await uploadVideoToSupabase(videoUri, user.id);
        await saveMemory(
          user.id,
          response.commentary,
          undefined, // no image
          videoUrl,
          response.source || "OpenAI"
        );
      }
      setUploading(false);
    } catch (e) {
      setUploading(false);
      setNarrating(false);
      setAnalysing(false);
      console.error("Video LLM error:", e);
      let errorMessage = "";
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === "string") {
        errorMessage = e;
      } else {
        errorMessage = JSON.stringify(e);
      }
      alert("Error saving video memory: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            requestPermission();
          }}
          style={{
            backgroundColor: "#007AFF",
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
          }}
        >
          <Text
            style={{ color: "white", fontWeight: "bold", textAlign: "center" }}
          >
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(uploading || narrating || analysing) && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.statusText}>
            {analysing
              ? "Analysing moment..."
              : narrating
              ? "Speaking..."
              : uploading
              ? "Uploading..."
              : ""}
          </Text>
        </View>
      )}
      {isWeb ? (
        <Text>Camera is not supported on web.</Text>
      ) : (
        isFocused && (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            mode="video"
            facing={facing}
          />
        )
      )}
      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          switchCamera();
        }}
      >
        <Ionicons name="camera-reverse" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.captureButton}
        onPress={async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          if (isRecording) {
            await stopRecording();
          } else {
            await startRecording();
          }
        }}
        disabled={isLoading}
      >
        <Ionicons
          name={isRecording ? "videocam-off" : "videocam"}
          size={32}
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.frameCountButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowFrameCountModal(true);
        }}
      >
        <Text style={styles.frameCountText}>{frameCount} Frames</Text>
      </TouchableOpacity>
      <Modal
        visible={showFrameCountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFrameCountModal(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowFrameCountModal(false);
          }}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Frame Count</Text>
            <ScrollView style={styles.scrollView}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => (
                <TouchableOpacity
                  key={count}
                  style={styles.frameCountOption}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setFrameCount(count);
                    setShowFrameCountModal(false);
                  }}
                >
                  <Text style={styles.frameCountOptionText}>
                    {count} Frames
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  switchButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 30,
  },
  frameCountButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  frameCountText: {
    color: "white",
    fontSize: 14,
  },
  loadingIndicator: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  frameCountOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  frameCountOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  scrollView: {
    maxHeight: 200, // Adjust as needed
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  statusText: {
    color: "white",
    fontSize: 18,
    marginTop: 16,
    fontWeight: "bold",
  },
});
