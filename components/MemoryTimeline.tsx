import { ResizeMode, Video } from "expo-av";
import React from "react";
import { FlatList, Image, RefreshControl, StyleSheet } from "react-native";
import { useThemeContext } from "../contexts/ThemeContext";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

type Memory = {
  id: string;
  commentary: string;
  image_uri?: string;
  video_uri?: string;
  created_at: string;
  source: string;
};

type MemoryTimelineProps = {
  memories: Memory[];
  onRefresh: () => void;
  refreshing: boolean;
};

export default function MemoryTimeline({
  memories,
  onRefresh,
  refreshing,
}: MemoryTimelineProps) {
  const { currentTheme } = useThemeContext();
  const cardBg = currentTheme === "dark" ? "#23272a" : "#fff";
  const timelineBg = currentTheme === "dark" ? "#181a1b" : "#f5f5f5";
  const headerColor = currentTheme === "dark" ? "#ECEDEE" : "#333";
  const dateColor = currentTheme === "dark" ? "#aaa" : "#888";
  const commentaryColor = currentTheme === "dark" ? "#ECEDEE" : "#222";

  const renderMemory = ({ item }: { item: Memory }) => (
    <ThemedView style={[styles.memoryCard, { backgroundColor: cardBg }]}>
      {item.video_uri ? (
        <Video
          source={{ uri: item.video_uri }}
          style={styles.memoryImage}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      ) : item.image_uri ? (
        <Image source={{ uri: item.image_uri }} style={styles.memoryImage} />
      ) : null}
      <ThemedView style={styles.memoryContent}>
        <ThemedText style={[styles.memoryDate, { color: dateColor }]}>
          {new Date(item.created_at).toLocaleString()}
        </ThemedText>
        <ThemedText
          style={[styles.memoryCommentary, { color: commentaryColor }]}
        >
          {item.commentary}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ThemedView
      style={[styles.timelineContainer, { backgroundColor: timelineBg }]}
    >
      <ThemedText style={[styles.timelineHeader, { color: headerColor }]}>
        Memories Timeline
      </ThemedText>
      <FlatList
        data={memories}
        renderItem={renderMemory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    flex: 1,
    paddingTop: 16,
  },
  timelineHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  memoryCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  memoryImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  memoryContent: {
    padding: 18,
  },
  memoryDate: {
    fontSize: 13,
    marginBottom: 8,
    fontStyle: "italic",
  },
  memoryCommentary: {
    fontSize: 17,
    lineHeight: 25,
  },
});
