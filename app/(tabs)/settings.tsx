import React, { useState, useEffect } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import * as Speech from "expo-speech";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

const VOICE_KEY = "@her_selected_voice";
const FRAME_COUNT_KEY = "@her_video_frame_count";

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(
    undefined
  );
  const [frameCount, setFrameCount] = useState(3);
  const { signOut } = useAuth();

  useEffect(() => {
    (async () => {
      const availableVoices = await Speech.getAvailableVoicesAsync();
      setVoices(availableVoices);
      if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].identifier);
      }
      // Load frame count from storage
      const storedFrameCount = await AsyncStorage.getItem(FRAME_COUNT_KEY);
      if (storedFrameCount) setFrameCount(Number(storedFrameCount));
    })();
  }, []);

  useEffect(() => {
    if (selectedVoice) {
      AsyncStorage.setItem(VOICE_KEY, selectedVoice);
    }
    AsyncStorage.setItem(FRAME_COUNT_KEY, String(frameCount));
  }, [selectedVoice, frameCount]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.settingRow}>
        <Text>Enable Notifications</Text>
        <Switch value={isEnabled} onValueChange={setIsEnabled} />
      </View>
      <View style={styles.settingRow}>
        <Text>Volume</Text>
        <Slider
          style={{ width: 150 }}
          minimumValue={0}
          maximumValue={100}
          value={sliderValue}
          onValueChange={setSliderValue}
        />
        <Text>{sliderValue}</Text>
      </View>
      <View style={styles.settingRow}>
        <Text>Voice</Text>
        <Picker
          selectedValue={selectedVoice}
          style={{ width: 180 }}
          onValueChange={(itemValue) => setSelectedVoice(itemValue)}
        >
          {voices.map((voice) => (
            <Picker.Item
              key={voice.identifier}
              label={voice.name || voice.identifier}
              value={voice.identifier}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.settingRow}>
        <Text>Video Analysis Frame Count</Text>
        <Slider
          style={{ width: 150 }}
          minimumValue={3}
          maximumValue={10}
          step={1}
          value={frameCount}
          onValueChange={setFrameCount}
        />
        <Text>{frameCount}</Text>
      </View>
      <Text style={styles.note}>More settings coming soon...</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  note: {
    marginTop: 32,
    color: "#888",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
