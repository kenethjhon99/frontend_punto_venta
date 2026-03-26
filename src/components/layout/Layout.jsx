import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";

const drawerWidth = 240;
const collapsedDrawerWidth = 88;

function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onCollapse={() => setSidebarCollapsed(true)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          width: isMobile
            ? "100%"
            : `calc(100% - ${sidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`,
        }}
      >
        <Header
          showMobileMenuButton={isMobile}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />

        <Box
          component="main"
          sx={{
            p: { xs: 2, md: 3 },
            bgcolor: "background.default",
            color: "text.primary",
            minHeight: "100vh",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
