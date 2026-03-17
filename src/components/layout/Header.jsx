import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useThemeMode } from "../../context/ThemeModeContext";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  IconButton,
} from "@mui/material";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{ backgroundColor: "background.paper", color: "text.primary" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          Sistema Punto de Venta
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          <Box textAlign="right">
            <Typography variant="body2" fontWeight="bold">
              {user?.nombre || user?.username || "Usuario"}
            </Typography>

            <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="flex-end">
              {user?.roles?.map((r) => (
                <Chip
                  key={r.nombre_rol}
                  label={r.nombre_rol}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          <Avatar>
            {user?.nombre?.[0] || user?.username?.[0] || "U"}
          </Avatar>

          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={cerrarSesion}
          >
            Salir
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;