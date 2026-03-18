import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useThemeMode } from "../../hooks/useThemeMode";
import { userHasRole } from "../../utils/roles";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const roleNames = useMemo(() => {
    return Array.isArray(user?.roles)
      ? user.roles.map((role) => String(role?.nombre_rol || "").trim().toUpperCase())
      : [];
  }, [user?.roles]);

  const roleMeta = useMemo(() => {
    if (roleNames.includes("SUPER_ADMIN")) {
      return {
        label: "Modo super admin",
        chipColor: "error",
        accent: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.12))",
        borderColor: "rgba(239,68,68,0.35)",
      };
    }

    if (roleNames.includes("ADMIN")) {
      return {
        label: "Modo administrativo",
        chipColor: "primary",
        accent: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(14,165,233,0.12))",
        borderColor: "rgba(37,99,235,0.3)",
      };
    }

    if (roleNames.includes("CAJERO")) {
      return {
        label: "Modo operativo",
        chipColor: "success",
        accent: "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(16,185,129,0.12))",
        borderColor: "rgba(22,163,74,0.3)",
      };
    }

    return {
      label: "Modo general",
      chipColor: "default",
      accent: "linear-gradient(135deg, rgba(148,163,184,0.18), rgba(100,116,139,0.1))",
      borderColor: "rgba(148,163,184,0.25)",
    };
  }, [roleNames]);

  const headerContent = useMemo(() => {
    const pathname = location.pathname;
    const isAdminView = userHasRole(user, "SUPER_ADMIN", "ADMIN");
    const isCashierView = userHasRole(user, "CAJERO");

    const sections = {
      "/dashboard": {
        title: "Panel administrativo",
        subtitle: "Resumen general del negocio y seguimiento operativo.",
      },
      "/ventas": {
        title: isCashierView ? "Caja y ventas" : "Ventas",
        subtitle: isCashierView
          ? "Cobros, clientes y operaciones del punto de venta."
          : "Gestiona ventas, revisa detalles y controla anulaciones.",
      },
      "/caja": {
        title: "Caja",
        subtitle: "Apertura, movimientos, cierres y control operativo del efectivo.",
      },
      "/productos": {
        title: "Productos",
        subtitle: isAdminView
          ? "Administra catalogo, stock y configuraciones de inventario."
          : "Consulta existencias y disponibilidad del catalogo.",
      },
      "/clientes": {
        title: "Clientes",
        subtitle: isAdminView
          ? "Administra el catalogo y los datos de clientes."
          : "Consulta y registra clientes para las ventas.",
      },
      "/compras": {
        title: "Compras",
        subtitle: "Registra ingresos de inventario y compras a proveedores.",
      },
      "/proveedores": {
        title: "Proveedores",
        subtitle: "Gestiona el catalogo de proveedores y su historial.",
      },
      "/usuarios": {
        title: "Usuarios y roles",
        subtitle: "Configura accesos, roles y permisos del sistema.",
      },
      "/auditoria": {
        title: "Auditoria del sistema",
        subtitle: "Consulta trazabilidad de altas, cambios e inactivaciones.",
      },
    };

    return (
      sections[pathname] || {
        title: "Sistema Punto de Venta",
        subtitle: isCashierView
          ? "Area operativa para atender ventas y clientes."
          : "Gestion general del sistema.",
      }
    );
  }, [location.pathname, user]);

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={2}
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        backgroundImage: roleMeta.accent,
        borderBottom: `1px solid ${roleMeta.borderColor}`,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: { xs: "wrap", md: "nowrap" },
          alignItems: "center",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            label={roleMeta.label}
            size="small"
            color={roleMeta.chipColor}
            sx={{ mb: 1, fontWeight: 700 }}
          />
          <Typography variant="h6" fontWeight="bold">
            {headerContent.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {headerContent.subtitle}
          </Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ ml: "auto" }}
        >
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
