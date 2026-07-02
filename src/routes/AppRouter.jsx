import { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRoute } from "../utils/roles";
import ProtectedRoute from "./ProtectedRoute";
import RouteErrorBoundary from "../components/ui/RouteErrorBoundary";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const Login = lazyWithRetry(() => import("../pages/Login"), "login");
const Dashboard = lazyWithRetry(() => import("../pages/Dashboard"), "dashboard");
const Productos = lazyWithRetry(() => import("../pages/Productos"), "productos");
const Inventario = lazyWithRetry(() => import("../pages/Inventario"), "inventario");
const Layout = lazyWithRetry(() => import("../components/layout/Layout"), "layout");
const Ventas = lazyWithRetry(() => import("../pages/Ventas"), "ventas");
const Compras = lazyWithRetry(() => import("../pages/Compras"), "compras");
const Proveedores = lazyWithRetry(() => import("../pages/Proveedores"), "proveedores");
const Clientes = lazyWithRetry(() => import("../pages/Clientes"), "clientes");
const Usuarios = lazyWithRetry(() => import("../pages/Usuarios"), "usuarios");
const Empleados = lazyWithRetry(() => import("../pages/Empleados"), "empleados");
const Auditoria = lazyWithRetry(() => import("../pages/Auditoria"), "auditoria");
const Caja = lazyWithRetry(() => import("../pages/Caja"), "caja");
const Servicios = lazyWithRetry(() => import("../pages/Servicios"), "servicios");
const Traslados = lazyWithRetry(() => import("../pages/Traslados"), "traslados");
const CreditosEmpleado = lazyWithRetry(
  () => import("../pages/CreditosEmpleado"),
  "creditos-empleado"
);
const ServiciosTienda = lazyWithRetry(
  () => import("../pages/ServiciosTienda"),
  "servicios-tienda"
);
const CarWashAutolavado = lazyWithRetry(
  () => import("../pages/CarWashAutolavado"),
  "carwash-autolavado"
);
const CarWashReparacion = lazyWithRetry(
  () => import("../pages/CarWashReparacion"),
  "carwash-reparacion"
);
const Zgas = lazyWithRetry(() => import("../pages/Zgas"), "zgas");

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
      <RouteErrorBoundary>
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
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/productos"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO", "LECTURA"]}>
                  <Productos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <Inventario />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO", "LECTURA"]}>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedores"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "LECTURA"]}>
                  <Proveedores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO", "LECTURA"]}>
                  <Ventas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/caja"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "CAJERO", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"]}>
                  <Caja />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compras"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "LECTURA"]}>
                  <Compras />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "LECTURA"]}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/empleados"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <Empleados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <Auditoria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"]}>
                  <Servicios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/traslados"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <Traslados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creditos-empleado"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "LECTURA"]}>
                  <CreditosEmpleado />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicios/tienda"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"]}>
                  <ServiciosTienda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carwash/autolavado"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "ENCARGADO_SERVICIOS", "LECTURA"]}>
                  <CarWashAutolavado />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carwash/reparacion"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "MECANICO", "ENCARGADO_SERVICIOS", "LECTURA"]}>
                  <CarWashReparacion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/zgas"
              element={
                <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "CAJERO", "CAJERA", "LECTURA"]}>
                  <Zgas />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}

export default AppRouter;
