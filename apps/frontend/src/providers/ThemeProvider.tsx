import useBrowserTheme from "@/hooks/useBrowserTheme";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

export type SupportedThemes = "light" | "dark";

export const ThemeContext = createContext<{
  userTheme: SupportedThemes;
  toggleTheme?: () => void;
} | null>(null);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("The component must be in the ThemeContext to use it!");
  return context;
};

export default function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<SupportedThemes>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(
        "theme-preference",
      ) as SupportedThemes;
      if (savedTheme) return savedTheme;
    }
    const theme = useBrowserTheme();
    return theme;
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme-preference", theme);
  }, [theme]);

  const value = {
    userTheme: theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
