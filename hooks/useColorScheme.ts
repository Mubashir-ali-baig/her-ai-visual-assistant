import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

export function useColorScheme() {
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(
    "system"
  );
  const systemColorScheme = useRNColorScheme();

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem("theme-mode").then((savedTheme) => {
      if (savedTheme) {
        setThemeMode(savedTheme as "light" | "dark" | "system");
      }
    });
  }, []);

  // Return the appropriate color scheme based on the theme mode
  if (themeMode === "system") {
    return systemColorScheme;
  }
  return themeMode;
}
