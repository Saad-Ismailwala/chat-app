import { create } from "zustand";

// Function to get the system preference
const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light"; // Default
};

export const useThemeStore = create((set, get) => ({
  // 'theme' can be 'light', 'dark', or 'system'
  theme: localStorage.getItem("chat-theme") || "system",
  setTheme: (newTheme) => {
    localStorage.setItem("chat-theme", newTheme);
    set({ theme: newTheme });
  },
  // Function instead of getter (fix!)
  actualTheme: () => {
    const theme = get().theme;
    if (theme === "system") {
      return getSystemTheme();
    }
    return theme;
  },
}));
