import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as FileSystem from "expo-file-system";

// Get environment variables with fallbacks
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

// Memory helper functions
export const saveMemory = async (
  userId: string,
  commentary: string,
  imageUri?: string,
  videoUri?: string,
  source: string = "OpenAI"
) => {
  const { data, error } = await supabase
    .from("memories")
    .insert([
      {
        user_id: userId,
        commentary,
        image_uri: imageUri,
        video_uri: videoUri,
        source,
      },
    ])
    .select();
  return { data, error };
};

export const getMemories = async (userId: string) => {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

export const uploadImageToSupabase = async (
  localUri: string,
  userId: string
) => {
  // Fetch the file as a blob
  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileName = `${userId}_${Date.now()}.jpg`;

  console.log("Image file name", fileName);

  // Convert blob to ArrayBuffer using FileReader
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("her-bucket")
    .upload(fileName, arrayBuffer, {
      contentType: "image/jpg",
      upsert: true,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from("her-bucket")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

export const uploadVideoToSupabase = async (
  localUri: string,
  userId: string
) => {
  // Fetch the file as a blob
  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileName = `${userId}_${Date.now()}.mp4`;

  // Convert blob to ArrayBuffer using FileReader
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("her-bucket")
    .upload(fileName, arrayBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) throw error;

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from("her-bucket")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
