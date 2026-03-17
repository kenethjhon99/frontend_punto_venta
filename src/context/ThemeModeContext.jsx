import { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const ThemeModeContext = createContext();

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(
    localStorage.getItem("themeMode") || "light"
  );

  const toggleTheme = () => {
    const nuevoModo = mode === "light" ? "dark" : "light";
    setMode(nuevoModo);
    localStorage.setItem("themeMode", nuevoModo);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#1976d2",
          },
          background: {
            default: mode === "light" ? "#f3f4f6" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}