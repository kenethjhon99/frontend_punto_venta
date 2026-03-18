import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRoute } from "../utils/roles";
import ProtectedRoute from "./ProtectedRoute";

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Productos = lazy(() => import("../pages/Productos"));
const Layout = lazy(() => import("../components/layout/Layout"));
const Ventas = lazy(() => import("../pages/Ventas"));
const Compras = lazy(() => import("../pages/Compras"));
const Proveedores = lazy(() => import("../pages/Proveedores"));
const Clientes = lazy(() => import("../pages/Clientes"));
const Usuarios = lazy(() => import("../pages/Usuarios"));
const Auditoria = lazy(() => import("../pages/Auditoria"));
const Caja = lazy(() => import("../pages/Caja"));

const RouteFallback = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

function AppRouter() {
  const { isAuthenticated, user } = useAuth();
  const homePath = getDefaultRoute(user);

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to={homePath} replace /> : <Login />
            }
          />

          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? homePath : "/login"}
                replace
              />
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO"]}>
                  <Productos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO"]}>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Proveedores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO"]}>
                  <Ventas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caja"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO"]}>
                  <Caja />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Compras />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                  <Auditoria />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
