import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Box } from "@mui/material";

function Layout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1 }}>
        <Header />

        <Box
          component="main"
          sx={{
            p: 3,
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