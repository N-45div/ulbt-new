import React, { createContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false, // Default to light mode
  toggleDarkMode: () => {}, // No-op function as default
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) return false;

    try {
      const parsedTheme = JSON.parse(savedTheme);
      if (typeof parsedTheme === "boolean") {
        return parsedTheme;
      }
    } catch (e) {
      if (savedTheme === "dark") return true;
      if (savedTheme === "light") return false;
    }

    return false;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.body.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};