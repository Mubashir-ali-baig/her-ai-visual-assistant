import AsyncStorage from "@react-native-async-storage/async-storage";
import { Memory } from "../types";

const MEMORIES_KEY = "@her_memories";

export class MemoryManager {
  private static instance: MemoryManager;

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  async saveMemory(memory: Memory): Promise<void> {
    try {
      const existingMemories = await this.getMemories();
      const updatedMemories = [...existingMemories, memory];
      await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updatedMemories));
    } catch (error) {
      console.error("Error saving memory:", error);
      throw error;
    }
  }

  async getMemories(): Promise<Memory[]> {
    try {
      const memories = await AsyncStorage.getItem(MEMORIES_KEY);
      return memories ? JSON.parse(memories) : [];
    } catch (error) {
      console.error("Error getting memories:", error);
      return [];
    }
  }

  async clearMemories(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MEMORIES_KEY);
    } catch (error) {
      console.error("Error clearing memories:", error);
      throw error;
    }
  }
}
