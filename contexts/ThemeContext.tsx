import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";

const ThemeContext = createContext<{
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentTheme: "light" | "dark";
}>({
  themeMode: "system",
  setThemeMode: () => {},
  currentTheme: "light",
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("theme-mode").then((savedTheme) => {
      if (savedTheme) setThemeMode(savedTheme as ThemeMode);
    });
  }, []);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    AsyncStorage.setItem("theme-mode", mode);
  };

  const currentTheme =
    themeMode === "system" ? systemColorScheme || "light" : themeMode;

  return (
    <ThemeContext.Provider
      value={{ themeMode, setThemeMode: handleSetThemeMode, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
