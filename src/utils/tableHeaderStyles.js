import { alpha } from "@mui/material/styles";

export const getTableHeaderRowSx = (theme) => {
  const isLight = theme.palette.mode === "light";
  const baseBorder = alpha(
    isLight ? theme.palette.common.black : theme.palette.common.white,
    isLight ? 0.08 : 0.12
  );

  return {
    background: isLight
      ? `
          linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.98) 54%, rgba(226,232,240,0.98) 100%),
          radial-gradient(circle at top right, rgba(37,99,235,0.12), transparent 36%)
        `
      : `
          linear-gradient(135deg, rgba(20,28,45,0.98) 0%, rgba(11,18,32,0.98) 56%, rgba(8,13,23,0.98) 100%),
          radial-gradient(circle at top right, rgba(56,189,248,0.14), transparent 34%)
        `,
    boxShadow: isLight
      ? `inset 0 -1px 0 ${baseBorder}, 0 8px 18px ${alpha("#0f172a", 0.04)}`
      : `inset 0 -1px 0 ${baseBorder}, 0 8px 18px rgba(0, 0, 0, 0.18)`,
    "& .MuiTableCell-root": {
      borderBottom: `1px solid ${baseBorder}`,
    },
  };
};

export const getTableHeaderCellSx = (theme) => {
  const isLight = theme.palette.mode === "light";

  return {
    fontWeight: 800,
    color: isLight ? alpha("#0f172a", 0.94) : "rgba(248,250,252,0.96)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: "0.76rem",
    py: 2.1,
    backgroundColor: "transparent",
    whiteSpace: "nowrap",
    textShadow: isLight ? "none" : "0 1px 0 rgba(0,0,0,0.28)",
  };
};
