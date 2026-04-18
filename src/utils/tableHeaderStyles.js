import { alpha } from "@mui/material/styles";

export const getTableContainerSx = (theme) => {
  const isLight = theme.palette.mode === "light";
  const borderColor = alpha(
    isLight ? theme.palette.common.black : theme.palette.common.white,
    isLight ? 0.08 : 0.1
  );

  return {
    borderRadius: 4,
    overflow: "hidden",
    border: `1px solid ${borderColor}`,
    background: isLight
      ? `
          linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(241,246,255,0.74) 100%),
          radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 34%)
        `
      : `
          linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(11,18,31,0.9) 100%),
          radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 32%)
        `,
    boxShadow: isLight
      ? `0 20px 42px ${alpha("#0f172a", 0.1)}`
      : "0 22px 42px rgba(2,6,23,0.28)",
    backdropFilter: "blur(16px)",
  };
};

export const getTableHeaderRowSx = (theme) => {
  const isLight = theme.palette.mode === "light";
  const baseBorder = alpha(
    isLight ? theme.palette.common.black : theme.palette.common.white,
    isLight ? 0.08 : 0.12
  );

  return {
    background: isLight
      ? `
          linear-gradient(135deg, rgba(29,42,68,0.84) 0%, rgba(22,33,55,0.82) 50%, rgba(14,24,43,0.84) 100%),
          radial-gradient(circle at top right, rgba(59,130,246,0.22), transparent 34%),
          radial-gradient(circle at bottom left, rgba(20,184,166,0.14), transparent 30%)
        `
      : `
          linear-gradient(135deg, rgba(17,27,46,0.94) 0%, rgba(10,18,33,0.94) 56%, rgba(7,12,22,0.94) 100%),
          radial-gradient(circle at top right, rgba(56,189,248,0.2), transparent 34%),
          radial-gradient(circle at bottom left, rgba(99,102,241,0.12), transparent 30%)
        `,
    boxShadow: isLight
      ? `inset 0 -1px 0 ${alpha("#ffffff", 0.06)}, 0 10px 20px ${alpha("#0f172a", 0.08)}`
      : `inset 0 -1px 0 ${baseBorder}, 0 8px 18px rgba(0, 0, 0, 0.18)`,
    backdropFilter: "blur(18px)",
    "& .MuiTableCell-root": {
      borderBottom: `1px solid ${baseBorder}`,
      backgroundColor: "transparent !important",
    },
  };
};

export const getTableHeaderCellSx = (theme) => {
  const isLight = theme.palette.mode === "light";

  return {
    fontWeight: 800,
    color: "rgba(248,250,252,0.96)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontSize: "0.85rem",
    py: 2.1,
    backgroundColor: "transparent !important",
    whiteSpace: "nowrap",
    textShadow: isLight
      ? "0 1px 0 rgba(15,23,42,0.18)"
      : "0 1px 0 rgba(0,0,0,0.28)",
    "&.MuiTableCell-head": {
      backgroundColor: "transparent !important",
    },
  };
};
