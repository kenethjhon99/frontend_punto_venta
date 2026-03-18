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

const drawerWidth = 240;

function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const menu = [
    {
      text: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN"),
    },
    {
      text: "Productos",
      path: "/productos",
      icon: <InventoryIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO"),
    },
    {
      text: "Clientes",
      path: "/clientes",
      icon: <PersonOutlineIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO"),
    },
    {
      text: "Proveedores",
      path: "/proveedores",
      icon: <LocalShippingIcon />,
      visible: userHasRole(user, "ADMIN"),
    },
    {
      text: "Ventas",
      path: "/ventas",
      icon: <PointOfSaleIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO"),
    },
    {
      text: "Caja",
      path: "/caja",
      icon: <AccountBalanceWalletIcon />,
      visible: userHasRole(user, "ADMIN", "CAJERO"),
    },
    {
      text: "Compras",
      path: "/compras",
      icon: <ShoppingBagIcon />,
      visible: userHasRole(user, "ADMIN"),
    },
    {
      text: "Usuarios",
      path: "/usuarios",
      icon: <AdminPanelSettingsIcon />,
      visible: userHasRole(user, "SUPER_ADMIN"),
    },
    {
      text: "Auditoria",
      path: "/auditoria",
      icon: <FactCheckIcon />,
      visible: userHasRole(user, "SUPER_ADMIN", "ADMIN"),
    },
  ].filter((item) => item.visible ?? true);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#111827",
          color: "#fff",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" fontWeight="bold">
          POS System
        </Typography>
      </Toolbar>

      <Box sx={{ overflow: "auto" }}>
        <List>
          {menu.map((item) => (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#1d4ed8",
                },
                "&:hover": {
                  backgroundColor: "#374151",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
