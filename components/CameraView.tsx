import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as Speech from "expo-speech";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import { LLMService } from "../services/llmService";
import { uploadImageToSupabase } from "../services/supabase";

type Memory = {
  id: string;
  commentary: string;
  image_uri?: string;
  created_at: string;
  source: string;
  user_id?: string;
};

interface CameraViewProps {
  onMemoryCaptured?: (memory: Memory) => void;
  userId?: string;
}

export default function CameraViewComponent({
  onMemoryCaptured,
  userId,
}: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef(null);
  const baseZoom = useRef(0);
  const [uploading, setUploading] = useState(false);
  const [narrating, setNarrating] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const navigation = useNavigation();

  const switchCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handlePinchGesture = (event: any) => {
    if (
      event.nativeEvent.state === State.ACTIVE ||
      event.nativeEvent.state === State.BEGAN
    ) {
      let newZoom = baseZoom.current * event.nativeEvent.scale;
      newZoom = Math.max(0, Math.min(newZoom, 1));
      setZoom(newZoom);
    } else if (event.nativeEvent.state === State.END) {
      baseZoom.current = zoom;
    }
  };

  const onPinchGestureEvent = (event: any) => {
    let newZoom = baseZoom.current * event.nativeEvent.scale;
    newZoom = Math.max(0, Math.min(newZoom, 1));
    setZoom(newZoom);
  };

  const reloadApp = () => {
    navigation.reset({ index: 0, routes: [{ name: "(tabs)" }] });
  };

  const captureImage = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      setUploading(true);
      console.log("[Camera] Starting image capture...");
      // @ts-ignore
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      console.log("[Camera] Image captured. Manipulating image...");
      // Resize/compress the image before further processing
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512 } }], // Resize to 512px width
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      setUploading(false);
      setAnalysing(true);
      if (manipulated.base64) {
        const llmService = LLMService.getInstance();
        console.log("[Camera] Sending image to LLM...");
        const response = await llmService.analyzeImage(manipulated.base64);
        setAnalysing(false);
        if (response && response.commentary) {
          setNarrating(true);
          await new Promise<void>((resolve, reject) => {
            Speech.speak(response.commentary, {
              rate: 1.0,
              onDone: () => resolve(),
              onStopped: () => resolve(),
              onError: () => reject(new Error("Speech error")),
            });
          });
          setNarrating(false);
        } else {
          setNarrating(false);
          reloadApp();
          return;
        }
        // Now upload to Supabase
        if (manipulated.uri && userId) {
          console.log("[Camera] Uploading image to Supabase...");
          setUploading(true);
          let publicImageUrl = await uploadImageToSupabase(
            manipulated.uri,
            userId
          );
          console.log(
            "[Camera] Image uploaded successfully to bucket:",
            publicImageUrl
          );
          setUploading(false);
          const memory: Memory = {
            id: Date.now().toString(),
            user_id: userId,
            commentary: response.commentary,
            image_uri: publicImageUrl,
            created_at: new Date().toISOString(),
            source: "OpenAI",
          };
          onMemoryCaptured?.(memory);
        }
      }
    } catch (error) {
      setUploading(false);
      setNarrating(false);
      setAnalysing(false);
      reloadApp();
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
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
              ? "Analysing Image..."
              : narrating
              ? "Speaking..."
              : uploading
              ? "Uploading..."
              : ""}
          </Text>
        </View>
      )}
      <PinchGestureHandler
        onGestureEvent={onPinchGestureEvent}
        onHandlerStateChange={handlePinchGesture}
      >
        <View style={{ flex: 1 }}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            zoom={zoom}
          />
        </View>
      </PinchGestureHandler>
      <TouchableOpacity style={styles.switchButton} onPress={switchCamera}>
        <Ionicons name="camera-reverse" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.captureButton} onPress={captureImage}>
        <Ionicons name="camera" size={32} color="white" />
      </TouchableOpacity>
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
  zoomControls: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
  },
  zoomButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 4,
  },
  zoomButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  zoomText: {
    color: "white",
    fontSize: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  text: {
    fontSize: 14,
    color: "black",
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
