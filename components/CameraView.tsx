import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import { LLMService } from "../services/llmService";
import { uploadImageToSupabase } from "../services/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons } from "@expo/vector-icons";

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
  const cameraRef = useRef(null);

  const switchCamera = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const captureImage = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      // @ts-ignore
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

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

      if (manipulated.base64) {
        const llmService = LLMService.getInstance();

        const response = await llmService.analyzeImage(manipulated.base64);
        console.log("LLM responded");
        // Play the commentary as audio with the same voice as in video mode
        Speech.speak(response.commentary, { rate: 1.0 });

        // Upload image to Supabase Storage and get public URL
        let publicImageUrl = undefined;
        if (manipulated.uri && userId) {
          console.log("Uploading image to Supabase");
          publicImageUrl = await uploadImageToSupabase(manipulated.uri, userId);
        }

        console.log("Image uploaded successfully to bucket");

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
    } catch (error) {
      console.error("Error capturing image:", error);
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
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
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
});
