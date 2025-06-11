import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import MemoryTimeline from "../../components/MemoryTimeline";
import { useAuth } from "../../contexts/AuthContext";
import { getMemories } from "../../services/supabase";

type Memory = {
  id: string;
  commentary: string;
  image_uri?: string;
  created_at: string;
  source: string;
};

export default function MemoriesScreen() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadMemories = async () => {
    if (!user) return;
    try {
      const { data, error } = await getMemories(user.id);
      if (error) throw error;
      setMemories(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMemories();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MemoryTimeline
        memories={memories}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
  },
});
