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
      visible: userHasRole(user, "ADMIN", "CAJERO", "ENCARGADO_SERVICIOS", "LECTURA"),
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
          backgroundColor: "#111827",
          color: "#fff",
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
        },
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: collapsed ? "center" : "space-between", gap: 1 }}>
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
                  justifyContent: collapsed && !isMobile ? "center" : "initial",
                  "&.Mui-selected": {
                    backgroundColor: "#1d4ed8",
                  },
                  "&:hover": {
                    backgroundColor: "#374151",
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
                {(!collapsed || isMobile) && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
