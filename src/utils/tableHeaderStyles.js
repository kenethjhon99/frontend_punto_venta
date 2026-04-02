import { alpha } from "@mui/material/styles";

export const getTableHeaderRowSx = (theme) => {
  const isLight = theme.palette.mode === "light";

  return {
    background: isLight
      ? "linear-gradient(135deg, rgba(241,245,249,0.98) 0%, rgba(226,232,240,0.98) 100%)"
      : "linear-gradient(135deg, rgba(24,32,48,0.98) 0%, rgba(14,20,34,0.98) 100%)",
    "& .MuiTableCell-root": {
      borderBottom: `1px solid ${alpha(
        isLight ? theme.palette.common.black : theme.palette.common.white,
        isLight ? 0.08 : 0.2
      )}`,
    },
  };
};

export const getTableHeaderCellSx = (theme) => {
  const isLight = theme.palette.mode === "light";

  return {
    fontWeight: 700,
    color: isLight ? alpha("#0f172a", 0.92) : "rgba(241,245,249,0.94)",
    letterSpacing: "0.02em",
    textTransform: "none",
    py: 2.25,
    backgroundColor: "transparent",
  };
};
