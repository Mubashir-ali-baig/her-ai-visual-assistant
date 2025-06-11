import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { Video, ResizeMode } from "expo-av";

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
  const renderMemory = ({ item }: { item: Memory }) => (
    <View style={styles.memoryCard}>
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
      <View style={styles.memoryContent}>
        <Text style={styles.memoryDate}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text style={styles.memoryCommentary}>{item.commentary}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.timelineHeader}>Memories Timeline</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  timelineContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 16,
  },
  timelineHeader: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  memoryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#0a7ea4",
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
    color: "#888",
    marginBottom: 8,
    fontStyle: "italic",
  },
  memoryCommentary: {
    fontSize: 17,
    color: "#222",
    lineHeight: 25,
  },
});
