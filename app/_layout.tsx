import { FontAwesome } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, Tabs, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { ThemeProvider, useThemeContext } from "../contexts/ThemeContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const { currentTheme } = useThemeContext();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationThemeProvider
      value={currentTheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={currentTheme === "dark" ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export function AppLayout() {
  const { currentTheme } = useThemeContext();

  return (
    <Tabs key={currentTheme}>
      <Tabs.Screen
        name="camera"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="camera" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="video-camera" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="history" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
