import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemeColors } from "@/types";

export const lightColors: ThemeColors = {
  bg: "#f1f5f9", surface: "#ffffff", border: "#e2e8f0", text: "#1e293b", textMuted: "#64748b",
  primary: "#6366f1", primaryLight: "#eef2ff", success: "#10b981", danger: "#ef4444",
};

export const darkColors: ThemeColors = {
  bg: "#0f172a", surface: "#1e293b", border: "#334155", text: "#f8fafc", textMuted: "#94a3b8",
  primary: "#818cf8", primaryLight: "#312e81", success: "#34d399", danger: "#f87171",
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("@todo_app_theme_mode").then((val) => {
      if (val !== null) setIsDarkMode(val === "dark");
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem("@todo_app_theme_mode", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors: isDarkMode ? darkColors : lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
