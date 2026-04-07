import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { userHasRole } from "../../utils/roles";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

const drawerWidth = 240;
const collapsedDrawerWidth = 88;

function Sidebar({
  collapsed = false,
  onToggleCollapse = () => {},
  onCollapse = () => {},
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const drawerBackground =
    theme.palette.mode === "light"
      ? "linear-gradient(180deg, #0f172a 0%, #13213d 48%, #172554 100%)"
      : "linear-gradient(180deg, #08101d 0%, #0f172a 45%, #111827 100%)";

  const menu = [
    {
      text: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN", "LECTURA"),
    },
    {
      text: "Productos",
      path: "/productos",
      icon: <InventoryIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO", "LECTURA"),
    },
    {
      text: "Inventario",
      path: "/inventario",
      icon: <Inventory2Icon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN", "LECTURA"),
    },
    {
      text: "Clientes",
      path: "/clientes",
      icon: <PersonOutlineIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO", "LECTURA"),
    },
    {
      text: "Proveedores",
      path: "/proveedores",
      icon: <LocalShippingIcon />,
      visible: userHasRole(user, "ADMIN", "LECTURA"),
    },
    {
      text: "Ventas",
      path: "/ventas",
      icon: <PointOfSaleIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO", "LECTURA"),
    },
    {
      text: "Caja",
      path: "/caja",
      icon: <AccountBalanceWalletIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"),
    },
    {
      text: "Compras",
      path: "/compras",
      icon: <ShoppingBagIcon />,
      visible: userHasRole(user, "ADMIN", "LECTURA"),
    },
    {
      text: "Usuarios",
      path: "/usuarios",
      icon: <AdminPanelSettingsIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "LECTURA"),
    },
    {
      text: "Auditoria",
      path: "/auditoria",
      icon: <FactCheckIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN", "LECTURA"),
    },
    {
      text: "Servicios",
      path: "/servicios",
      icon: <LocalCarWashIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN", "CAJERO", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"),
    },
  ].filter((item) => item.visible ?? true);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={isMobile ? onMobileClose : undefined}
      ModalProps={isMobile ? { keepMounted: true } : undefined}
      sx={{
        width: isMobile ? drawerWidth : collapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? drawerWidth : collapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: "border-box",
          background: drawerBackground,
          color: "#fff",
          overflowX: "hidden",
          borderRight: `1px solid ${alpha("#ffffff", 0.08)}`,
          boxShadow: "0 24px 48px rgba(2, 6, 23, 0.35)",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 20%)",
          },
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
          borderBottom: `1px solid ${alpha("#ffffff", 0.08)}`,
          minHeight: 78,
        }}
      >
        {(!collapsed || isMobile) && (
          <Typography variant="h6" fontWeight="bold" noWrap>
            POS System
          </Typography>
        )}
        <Tooltip title={collapsed ? "Expandir menu" : "Ocultar menu"}>
          <IconButton
            onClick={isMobile ? onMobileClose : onToggleCollapse}
            sx={{
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.85)",
              width: 42,
              height: 42,
              backgroundColor: "rgba(255,255,255,0.03)",
              animation: collapsed && !isMobile ? "sidebar-float 3.4s ease-in-out infinite" : "none",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Box sx={{ overflow: "auto" }}>
        <List>
          {menu.map((item) => (
            <Tooltip key={item.text} title={collapsed ? item.text : ""} placement="right">
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => {
                  if (isMobile) {
                    onMobileClose();
                    return;
                  }

                  if (!collapsed) onCollapse();
                }}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  px: 2,
                  mx: 1.25,
                  my: 0.5,
                  justifyContent: collapsed && !isMobile ? "center" : "initial",
                  borderRadius: 4,
                  position: "relative",
                  "&.Mui-selected": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 10,
                      bottom: 10,
                      width: 4,
                      borderRadius: 99,
                      backgroundColor: "rgba(255,255,255,0.95)",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.08)",
                    transform:
                      collapsed && !isMobile ? "none" : "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: 0,
                    mr: collapsed && !isMobile ? 0 : 2,
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 600,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
