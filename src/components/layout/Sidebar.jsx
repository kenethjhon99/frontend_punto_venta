import { Link, useLocation } from "react-router-dom";

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

const drawerWidth = 240;

function Sidebar() {
  const location = useLocation();

  const menu = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Productos", path: "/productos", icon: <InventoryIcon /> },
    { text: "Ventas", path: "/ventas", icon: <PointOfSaleIcon /> },
  ];

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