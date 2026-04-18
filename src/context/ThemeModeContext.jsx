import { useMemo, useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ThemeModeContext from "./theme-mode-context";

const buildTheme = (mode) => {
  const isLight = mode === "light";
  const primaryMain = isLight ? "#2563eb" : "#60a5fa";
  const secondaryMain = isLight ? "#0f766e" : "#34d399";
  const backgroundDefault = isLight ? "#edf4ff" : "#060d16";
  const backgroundPaper = isLight ? alpha("#ffffff", 0.9) : alpha("#0f172a", 0.92);
  const dividerColor = alpha(isLight ? "#0f172a" : "#e2e8f0", isLight ? 0.1 : 0.12);
  const textPrimary = isLight ? "#0f172a" : "#f8fafc";
  const textSecondary = isLight ? "#475569" : "#94a3b8";

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
      },
      secondary: {
        main: secondaryMain,
      },
      success: {
        main: "#22c55e",
      },
      warning: {
        main: "#f59e0b",
      },
      error: {
        main: "#ef4444",
      },
      info: {
        main: "#0ea5e9",
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: dividerColor,
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily:
        "'Trebuchet MS', 'Segoe UI Variable Text', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      // Sube el size base de 14px (default MUI) a 15px -> aplica a body1/body2/caption
      fontSize: 15,
      htmlFontSize: 16,
      h1: { fontWeight: 800, fontSize: "clamp(2rem, 1.5rem + 1vw, 2.6rem)", letterSpacing: "-0.03em" },
      h2: { fontWeight: 800, fontSize: "clamp(1.75rem, 1.3rem + 0.9vw, 2.25rem)", letterSpacing: "-0.03em" },
      h3: { fontWeight: 800, fontSize: "clamp(1.5rem, 1.2rem + 0.7vw, 1.9rem)", letterSpacing: "-0.03em" },
      h4: {
        fontWeight: 800,
        fontSize: "clamp(1.35rem, 1.1rem + 0.55vw, 1.7rem)",
        letterSpacing: "-0.03em",
      },
      h5: {
        fontWeight: 800,
        fontSize: "clamp(1.15rem, 1rem + 0.4vw, 1.4rem)",
        letterSpacing: "-0.025em",
      },
      h6: {
        fontWeight: 800,
        fontSize: "1.1rem",
        letterSpacing: "-0.02em",
      },
      subtitle1: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.55 },
      subtitle2: { fontSize: "0.92rem", fontWeight: 600, lineHeight: 1.5 },
      body1: { fontSize: "1rem", lineHeight: 1.6 },
      body2: { fontSize: "0.92rem", lineHeight: 1.55 },
      caption: { fontSize: "0.8rem", lineHeight: 1.4 },
      overline: { fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.09em" },
      button: {
        fontWeight: 700,
        fontSize: "0.95rem",
        letterSpacing: "0.01em",
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            colorScheme: mode,
          },
          html: {
            scrollBehavior: "smooth",
          },
          body: {
            backgroundColor: backgroundDefault,
            backgroundImage: isLight
              ? `
                radial-gradient(circle at 12% 12%, rgba(37,99,235,0.16), transparent 24%),
                radial-gradient(circle at 88% 14%, rgba(14,165,233,0.13), transparent 22%),
                radial-gradient(circle at 52% 100%, rgba(15,118,110,0.08), transparent 22%),
                linear-gradient(180deg, #f9fcff 0%, #eef4ff 54%, #eaf1ff 100%),
                repeating-linear-gradient(
                  135deg,
                  rgba(255,255,255,0.18) 0px,
                  rgba(255,255,255,0.18) 1px,
                  transparent 1px,
                  transparent 16px
                )
              `
              : `
                radial-gradient(circle at 14% 10%, rgba(37,99,235,0.24), transparent 22%),
                radial-gradient(circle at 84% 12%, rgba(16,185,129,0.14), transparent 18%),
                radial-gradient(circle at 50% 100%, rgba(168,85,247,0.10), transparent 24%),
                linear-gradient(180deg, #060d16 0%, #09101b 42%, #0b1321 100%),
                repeating-linear-gradient(
                  135deg,
                  rgba(255,255,255,0.02) 0px,
                  rgba(255,255,255,0.02) 1px,
                  transparent 1px,
                  transparent 18px
                )
              `,
            backgroundAttachment: "fixed",
            backgroundBlendMode: "screen, screen, normal, normal, normal",
            color: textPrimary,
            transition:
              "background-color 220ms ease, background-image 220ms ease, color 220ms ease",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
          a: {
            color: "inherit",
            textDecoration: "none",
          },
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: `${alpha(primaryMain, isLight ? 0.3 : 0.5)} transparent`,
          },
          "::-webkit-scrollbar": {
            width: "10px",
            height: "10px",
          },
          "::-webkit-scrollbar-track": {
            background: alpha(isLight ? "#94a3b8" : "#0f172a", isLight ? 0.08 : 0.2),
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(primaryMain, isLight ? 0.28 : 0.42),
            borderRadius: "999px",
            border: `2px solid ${alpha(backgroundDefault, 0.9)}`,
          },
          "::selection": {
            backgroundColor: alpha(primaryMain, 0.2),
          },
          "@keyframes app-shell-fade": {
            from: {
              opacity: 0,
              transform: "translateY(10px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
          "@keyframes sidebar-float": {
            from: {
              transform: "translateY(0px)",
            },
            "50%": {
              transform: "translateY(-3px)",
            },
            to: {
              transform: "translateY(0px)",
            },
          },
          "@keyframes aurora-drift": {
            "0%": {
              transform: "translate3d(0px, 0px, 0) scale(1)",
            },
            "50%": {
              transform: "translate3d(12px, -14px, 0) scale(1.05)",
            },
            "100%": {
              transform: "translate3d(0px, 0px, 0) scale(1)",
            },
          },
          "@keyframes glow-pulse": {
            "0%, 100%": {
              opacity: 0.75,
            },
            "50%": {
              opacity: 1,
            },
          },
          "@keyframes sheen-slide": {
            from: {
              transform: "translateX(-120%)",
            },
            to: {
              transform: "translateX(120%)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${dividerColor}`,
            boxShadow: isLight
              ? `0 18px 40px ${alpha("#0f172a", 0.08)}`
              : "0 20px 42px rgba(0, 0, 0, 0.35)",
            transition:
              "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(18px)",
            boxShadow: isLight
              ? `0 10px 28px ${alpha("#0f172a", 0.08)}`
              : "0 12px 28px rgba(0, 0, 0, 0.25)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            backdropFilter: "blur(12px)",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontSize: "1rem",
            backgroundColor: isLight
              ? alpha("#ffffff", 0.8)
              : alpha("#0f172a", 0.28),
            transition:
              "background-color 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
            "&:hover": {
              backgroundColor: isLight
                ? alpha("#ffffff", 0.95)
                : alpha("#0f172a", 0.4),
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha(primaryMain, 0.12)}`,
            },
          },
          notchedOutline: {
            borderColor: dividerColor,
          },
          input: {
            paddingTop: 15,
            paddingBottom: 15,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: "1rem" },
          shrink: { fontSize: "0.95rem" },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { fontSize: "0.95rem", paddingTop: 12, paddingBottom: 12 },
          head: { fontSize: "0.82rem" },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 16,
            paddingInline: "1.1rem",
            minHeight: 40,
            fontSize: "0.95rem",
            transition:
              "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
            "&:hover": { transform: "translateY(-1px)" },
          },
          sizeLarge: { minHeight: 48, fontSize: "1.05rem" },
          containedPrimary: {
            background: `linear-gradient(135deg, ${primaryMain} 0%, ${
              isLight ? "#1d4ed8" : "#3b82f6"
            } 100%)`,
            boxShadow: `0 14px 26px ${alpha(primaryMain, isLight ? 0.22 : 0.18)}`,
          },
          outlined: { borderColor: alpha(primaryMain, 0.42) },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 28,
            overflow: "hidden",
            backgroundColor: isLight
              ? alpha("#ffffff", 0.88)
              : alpha("#111827", 0.92),
            boxShadow: isLight
              ? `0 18px 36px ${alpha("#0f172a", 0.08)}`
              : "0 16px 36px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition:
              "background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 26,
            overflow: "hidden",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            overflow: "hidden",
          },
        },
      },
    },
  });

  theme.customLayout = {
    shellGlow: isLight
      ? `
          radial-gradient(circle at 12% 8%, rgba(37,99,235,0.12), transparent 24%),
          radial-gradient(circle at 88% 16%, rgba(14,165,233,0.10), transparent 22%),
          radial-gradient(circle at 50% 100%, rgba(15,118,110,0.10), transparent 26%)
        `
      : `
          radial-gradient(circle at 12% 10%, rgba(59,130,246,0.16), transparent 22%),
          radial-gradient(circle at 88% 14%, rgba(52,211,153,0.12), transparent 18%),
          radial-gradient(circle at 55% 100%, rgba(168,85,247,0.10), transparent 24%)
        `,
    shellPattern: isLight
      ? "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 28%, rgba(37,99,235,0.03) 100%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 28%, rgba(59,130,246,0.05) 100%)",
    contentOverlay: isLight
      ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 28%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 28%)",
    orbPrimary: `radial-gradient(circle at center, ${alpha(primaryMain, isLight ? 0.22 : 0.2)} 0%, transparent 70%)`,
    orbSecondary: `radial-gradient(circle at center, ${alpha(
      secondaryMain,
      isLight ? 0.18 : 0.16
    )} 0%, transparent 72%)`,
    orbAccent: `radial-gradient(circle at center, ${alpha(
      theme.palette.warning.main,
      isLight ? 0.14 : 0.12
    )} 0%, transparent 72%)`,
  };

  return theme;
};

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light");

  const toggleTheme = () => {
    setMode((currentMode) => {
      const nextMode = currentMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
