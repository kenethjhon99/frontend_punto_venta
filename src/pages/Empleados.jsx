import { useCallback, useEffect, useMemo, useState } from "react";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmpleadoTable from "../components/empleados/EmpleadoTable";
import EmpleadoFormModal from "../components/ui/EmpleadoFormModal";
import { useAuth } from "../hooks/useAuth";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import { userHasRole } from "../utils/roles";
import {
  activarEmpleado,
  crearEmpleado,
  desactivarEmpleado,
  editarEmpleado,
  getEmpleados,
} from "../services/empleadoService";

const normalizarEmpleados = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function Empleados() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("TODOS");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [modalOpen, setModalOpen] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingGuardar, setLoadingGuardar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageEmpleados = useMemo(
    () => userHasRole(user, "SUPER_ADMIN", "ADMIN"),
    [user]
  );

  const cargarEmpleados = useCallback(async () => {
    try {
      setLoadingLista(true);
      setError("");
      const data = await getEmpleados({ incluirInactivos: true });
      setEmpleados(normalizarEmpleados(data));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los empleados");
    } finally {
      setLoadingLista(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  const empleadosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return empleados.filter((empleado) => {
      const coincideTexto =
        !texto ||
        String(empleado.nombre || "").toLowerCase().includes(texto) ||
        String(empleado.cargo || "").toLowerCase().includes(texto) ||
        String(empleado.tipo_pago || "").toLowerCase().includes(texto);

      const coincideCargo =
        cargoFiltro === "TODOS" || empleado.cargo === cargoFiltro;

      const coincideEstado =
        estadoFiltro === "TODOS" ||
        (estadoFiltro === "ACTIVOS" && empleado.activo) ||
        (estadoFiltro === "INACTIVOS" && !empleado.activo);

      return coincideTexto && coincideCargo && coincideEstado;
    });
  }, [empleados, busqueda, cargoFiltro, estadoFiltro]);

  const resumen = useMemo(() => {
    return empleados.reduce(
      (acc, empleado) => {
        acc.total += 1;
        if (empleado.activo) acc.activos += 1;
        if (empleado.cargo === "CARWASH") acc.carwash += 1;
        if (empleado.cargo === "VENDEDOR") acc.vendedores += 1;
        return acc;
      },
      { total: 0, activos: 0, carwash: 0, vendedores: 0 }
    );
  }, [empleados]);

  const abrirNuevo = () => {
    setEmpleadoEditando(null);
    setModalOpen(true);
  };

  const abrirEditar = (empleado) => {
    setEmpleadoEditando(empleado);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEmpleadoEditando(null);
  };

  const guardarEmpleado = async (formData) => {
    try {
      setLoadingGuardar(true);
      setError("");
      setSuccess("");

      if (empleadoEditando) {
        await editarEmpleado(empleadoEditando.id_empleado, formData);
        setSuccess("Empleado actualizado correctamente.");
      } else {
        await crearEmpleado(formData);
        setSuccess("Empleado creado correctamente.");
      }

      await cargarEmpleados();
      cerrarModal();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo guardar el empleado");
    } finally {
      setLoadingGuardar(false);
    }
  };

  const toggleActivoEmpleado = async (empleado) => {
    const accion = empleado.activo ? "desactivar" : "activar";
    const confirmar = window.confirm(
      `Deseas ${accion} el empleado "${empleado.nombre}"?`
    );

    if (!confirmar) return;

    try {
      setError("");
      setSuccess("");

      if (empleado.activo) {
        await desactivarEmpleado(empleado.id_empleado);
        setSuccess("Empleado desactivado correctamente.");
      } else {
        await activarEmpleado(empleado.id_empleado);
        setSuccess("Empleado activado correctamente.");
      }

      await cargarEmpleados();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo actualizar el empleado");
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <BadgeOutlinedIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Empleados
            </Typography>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            Gestiona al personal operativo de carwash y vendedores con sus reglas de pago.
          </Typography>
        </Box>

        {canManageEmpleados && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirNuevo}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Nuevo empleado
          </Button>
        )}
      </Stack>

      {!canManageEmpleados && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Puedes consultar el listado de empleados, pero solo administracion puede crear, editar o desactivar.
        </Alert>
      )}

      <Paper elevation={2} sx={(theme) => getFilterPanelSx(theme, { mb: 3 })}>
        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", xl: "center" }}
        >
          <TextField
            fullWidth
            label="Buscar empleado"
            placeholder="Buscar por nombre, cargo o tipo de pago"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
          <Select
            value={cargoFiltro}
            onChange={(event) => setCargoFiltro(event.target.value)}
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="TODOS">Todos los cargos</MenuItem>
            <MenuItem value="CARWASH">CARWASH</MenuItem>
            <MenuItem value="VENDEDOR">VENDEDOR</MenuItem>
          </Select>
          <Select
            value={estadoFiltro}
            onChange={(event) => setEstadoFiltro(event.target.value)}
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="TODOS">Todos los estados</MenuItem>
            <MenuItem value="ACTIVOS">Activos</MenuItem>
            <MenuItem value="INACTIVOS">Inactivos</MenuItem>
          </Select>
        </Stack>
      </Paper>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        mb={3}
      >
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, minWidth: 180 }}>
          <Typography variant="overline" color="text.secondary">
            Total empleados
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {resumen.total}
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, minWidth: 180 }}>
          <Typography variant="overline" color="text.secondary">
            Activos
          </Typography>
          <Typography variant="h4" fontWeight={800} color="success.main">
            {resumen.activos}
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, minWidth: 180 }}>
          <Typography variant="overline" color="text.secondary">
            Carwash
          </Typography>
          <Typography variant="h4" fontWeight={800} color="primary.main">
            {resumen.carwash}
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3, minWidth: 180 }}>
          <Typography variant="overline" color="text.secondary">
            Vendedores
          </Typography>
          <Typography variant="h4" fontWeight={800} color="secondary.main">
            {resumen.vendedores}
          </Typography>
        </Paper>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {loadingLista ? (
        <Paper
          elevation={2}
          sx={{
            p: 5,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">Cargando empleados...</Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <EmpleadoTable
            empleados={empleadosFiltrados}
            onEdit={abrirEditar}
            onToggleActivo={toggleActivoEmpleado}
            canManage={canManageEmpleados}
          />
        </Paper>
      )}

      {canManageEmpleados && (
        <EmpleadoFormModal
          key={`${empleadoEditando?.id_empleado ?? "new"}-${modalOpen ? "open" : "closed"}`}
          open={modalOpen}
          onClose={cerrarModal}
          onSave={guardarEmpleado}
          loading={loadingGuardar}
          empleadoEditando={empleadoEditando}
        />
      )}
    </Box>
  );
}

export default Empleados;
