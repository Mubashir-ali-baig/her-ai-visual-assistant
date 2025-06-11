import React from "react";
import { StyleSheet, View, Alert } from "react-native";
import CameraViewComponent from "../../components/CameraView";
import { useAuth } from "../../contexts/AuthContext";
import { saveMemory } from "../../services/supabase";

type Memory = {
  id: string;
  commentary: string;
  image_uri?: string;
  created_at: string;
  source: string;
  user_id?: string;
};

export default function CameraScreen() {
  const { user } = useAuth();

  const handleMemoryCaptured = async (memory: Memory) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save memories");
      return;
    }

    try {
      const { error } = await saveMemory(
        user.id,
        memory.commentary,
        memory.image_uri
      );
      if (error) throw error;
      Alert.alert("Success", "Memory saved successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraViewComponent
        onMemoryCaptured={handleMemoryCaptured}
        userId={user?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
