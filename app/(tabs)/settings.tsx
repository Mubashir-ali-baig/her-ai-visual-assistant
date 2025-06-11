import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeContext } from "../../contexts/ThemeContext";

const VOICE_KEY = "@her_selected_voice";
const FRAME_COUNT_KEY = "@her_video_frame_count";

type ThemeMode = "light" | "dark" | "system";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { themeMode, setThemeMode, currentTheme } = useThemeContext();
  const [selectedVoice, setSelectedVoice] = useState("en-US");
  const [frameCount, setFrameCount] = useState(3);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("theme-mode").then((savedTheme) => {
      if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
      }
    });
    AsyncStorage.getItem(VOICE_KEY).then((savedVoice) => {
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    });
    AsyncStorage.getItem(FRAME_COUNT_KEY).then((savedFrameCount) => {
      if (savedFrameCount) {
        setFrameCount(parseInt(savedFrameCount));
      }
    });
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  // Theme-aware border color
  const borderColor = currentTheme === "dark" ? "#333" : "#eee";

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.header}>
          Settings
        </ThemedText>

        <ThemedView
          style={[styles.section, { borderBottomColor: borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Appearance
          </ThemedText>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleThemeChange("light")}
          >
            <ThemedText>Light Theme</ThemedText>
            {themeMode === "light" && (
              <Ionicons name="checkmark" size={24} color="#0a7ea4" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleThemeChange("dark")}
          >
            <ThemedText>Dark Theme</ThemedText>
            {themeMode === "dark" && (
              <Ionicons name="checkmark" size={24} color="#0a7ea4" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => handleThemeChange("system")}
          >
            <ThemedText>System Default</ThemedText>
            {themeMode === "system" && (
              <Ionicons name="checkmark" size={24} color="#0a7ea4" />
            )}
          </TouchableOpacity>
        </ThemedView>

        <ThemedView
          style={[styles.section, { borderBottomColor: borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Voice Settings
          </ThemedText>
          <ThemedView style={styles.settingRow}>
            <ThemedText>Voice Speed</ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={2}
              value={1}
              minimumTrackTintColor="#0a7ea4"
              maximumTrackTintColor="#000000"
            />
          </ThemedView>
        </ThemedView>

        <ThemedView
          style={[styles.section, { borderBottomColor: borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Video Settings
          </ThemedText>
          <ThemedView style={styles.settingRow}>
            <ThemedText>Frame Count: {frameCount}</ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={frameCount}
              onValueChange={setFrameCount}
              minimumTrackTintColor="#0a7ea4"
              maximumTrackTintColor="#000000"
            />
          </ThemedView>
        </ThemedView>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  slider: {
    width: 200,
    height: 40,
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
