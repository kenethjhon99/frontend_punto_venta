import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import HeartBrokenIcon from "@mui/icons-material/HeartBroken";
import RefreshIcon from "@mui/icons-material/Refresh";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import {
  getSectionPanelSx,
  getSummaryCardSx,
} from "../utils/summaryCardStyles";
import {
  cobrarCreditoEmpleado,
  condonarCreditoEmpleado,
  getCreditosEmpleado,
  getNominaProxima,
} from "../services/creditoEmpleadoService";

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

const formatFecha = (raw) => {
  if (!raw) return "-";
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const estadoColor = {
  PENDIENTE: "warning",
  COBRADO: "success",
  CONDONADO: "info",
  ANULADO: "default",
};

const criticidadColor = {
  VENCIDO: "error",
  HOY: "warning",
  PROXIMO: "info",
  FUTURO: "default",
};

const criticidadLabel = {
  VENCIDO: "Vencido",
  HOY: "Hoy",
  PROXIMO: "Proximo",
  FUTURO: "Futuro",
};

function CreditosEmpleado() {
  const { user } = useAuth();
  const canOperar = useMemo(
    () => userHasRole(user, "SUPER_ADMIN", "ADMIN"),
    [user]
  );

  const [tab, setTab] = useState(0);

  // === Creditos ===
  const [creditos, setCreditos] = useState([]);
  const [loadingCreditos, setLoadingCreditos] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [filtroCriticidad, setFiltroCriticidad] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");

  // === Nomina ===
  const [nomina, setNomina] = useState([]);
  const [loadingNomina, setLoadingNomina] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // === Dialogs ===
  const [cobrarOpen, setCobrarOpen] = useState(false);
  const [condonarOpen, setCondonarOpen] = useState(false);
  const [creditoSeleccionado, setCreditoSeleccionado] = useState(null);
  const [notaCobro, setNotaCobro] = useState("");
  const [motivoCondonar, setMotivoCondonar] = useState("");
  const [loadingAccion, setLoadingAccion] = useState(false);

  const cargarCreditos = useCallback(async () => {
    try {
      setLoadingCreditos(true);
      setError("");
      const resp = await getCreditosEmpleado({
        estado: filtroEstado !== "TODOS" ? filtroEstado : undefined,
        criticidad:
          filtroCriticidad !== "TODOS" ? filtroCriticidad : undefined,
      });
      setCreditos(Array.isArray(resp?.data) ? resp.data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "No se pudieron cargar los creditos"
      );
    } finally {
      setLoadingCreditos(false);
    }
  }, [filtroEstado, filtroCriticidad]);

  const cargarNomina = useCallback(async () => {
    try {
      setLoadingNomina(true);
      const resp = await getNominaProxima();
      setNomina(Array.isArray(resp?.data) ? resp.data : []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "No se pudo cargar la nomina proxima"
      );
    } finally {
      setLoadingNomina(false);
    }
  }, []);

  useEffect(() => {
    cargarCreditos();
  }, [cargarCreditos]);

  useEffect(() => {
    cargarNomina();
  }, [cargarNomina]);

  const creditosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    if (!texto) return creditos;
    return creditos.filter((c) =>
      String(c.empleado_nombre || "")
        .toLowerCase()
        .includes(texto)
    );
  }, [creditos, busqueda]);

  const resumen = useMemo(() => {
    const total = creditos.reduce(
      (acc, c) =>
        c.estado === "PENDIENTE" ? acc + Number(c.saldo_pendiente || 0) : acc,
      0
    );
    const vencidos = creditos.filter(
      (c) => c.estado === "PENDIENTE" && c.criticidad === "VENCIDO"
    ).length;
    const hoy = creditos.filter(
      (c) => c.estado === "PENDIENTE" && c.criticidad === "HOY"
    ).length;
    return { total, vencidos, hoy, n: creditos.length };
  }, [creditos]);

  const abrirCobrar = (credito) => {
    setCreditoSeleccionado(credito);
    setNotaCobro("");
    setCobrarOpen(true);
  };

  const abrirCondonar = (credito) => {
    setCreditoSeleccionado(credito);
    setMotivoCondonar("");
    setCondonarOpen(true);
  };

  const cerrarDialogs = () => {
    if (loadingAccion) return;
    setCobrarOpen(false);
    setCondonarOpen(false);
    setCreditoSeleccionado(null);
  };

  const confirmarCobrar = async () => {
    if (!creditoSeleccionado) return;
    try {
      setLoadingAccion(true);
      setError("");
      setSuccess("");
      await cobrarCreditoEmpleado(creditoSeleccionado.id_credito_empleado, {
        nota: notaCobro || null,
      });
      setSuccess(
        `Credito #${creditoSeleccionado.id_credito_empleado} marcado como cobrado.`
      );
      cerrarDialogs();
      await Promise.all([cargarCreditos(), cargarNomina()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cobrar el credito");
    } finally {
      setLoadingAccion(false);
    }
  };

  const confirmarCondonar = async () => {
    if (!creditoSeleccionado) return;
    if (!motivoCondonar.trim() || motivoCondonar.trim().length < 5) {
      setError("El motivo de condonacion es obligatorio (minimo 5 caracteres).");
      return;
    }
    try {
      setLoadingAccion(true);
      setError("");
      setSuccess("");
      await condonarCreditoEmpleado(creditoSeleccionado.id_credito_empleado, {
        motivo: motivoCondonar.trim(),
      });
      setSuccess(
        `Credito #${creditoSeleccionado.id_credito_empleado} condonado correctamente.`
      );
      cerrarDialogs();
      await Promise.all([cargarCreditos(), cargarNomina()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo condonar el credito");
    } finally {
      setLoadingAccion(false);
    }
  };

  const refrescar = () => {
    if (tab === 0) cargarCreditos();
    else cargarNomina();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          ...getSummaryCardSx(theme, "warning", { minHeight: 0 }),
          mb: 3,
        })}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="overline"
              color="warning.main"
              sx={{ fontWeight: 800, letterSpacing: "0.16em" }}
            >
              Cuentas por cobrar a empleados
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              Creditos a empleados
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Controla las ventas otorgadas a credito que se descontaran del
              proximo pago del empleado.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={refrescar}
            startIcon={<RefreshIcon />}
            sx={{ minWidth: 150 }}
          >
            Refrescar
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          mb: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        <Paper
          variant="outlined"
          sx={(t) =>
            getSummaryCardSx(t, "warning", { compact: true, minHeight: 110 })
          }
        >
          <Typography variant="body2" color="text.secondary">
            Saldo total pendiente
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatQ(resumen.total)}
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={(t) =>
            getSummaryCardSx(t, "error", { compact: true, minHeight: 110 })
          }
        >
          <Typography variant="body2" color="text.secondary">
            Vencidos
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {resumen.vencidos}
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={(t) =>
            getSummaryCardSx(t, "info", { compact: true, minHeight: 110 })
          }
        >
          <Typography variant="body2" color="text.secondary">
            Se cobran hoy
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {resumen.hoy}
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={3}
        sx={(t) => getSectionPanelSx(t, { p: 0, radius: 4, accent: "warning" })}
      >
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Tab
            icon={<BadgeOutlinedIcon />}
            iconPosition="start"
            label="Creditos"
          />
          <Tab
            icon={<PaidOutlinedIcon />}
            iconPosition="start"
            label="Nomina proxima"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <>
              <Paper
                variant="outlined"
                sx={(t) => getFilterPanelSx(t, { compact: true, mb: 2 })}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="estado-filter-label">Estado</InputLabel>
                      <Select
                        labelId="estado-filter-label"
                        value={filtroEstado}
                        label="Estado"
                        onChange={(e) => setFiltroEstado(e.target.value)}
                      >
                        <MenuItem value="TODOS">Todos</MenuItem>
                        <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                        <MenuItem value="COBRADO">Cobrado</MenuItem>
                        <MenuItem value="CONDONADO">Condonado</MenuItem>
                        <MenuItem value="ANULADO">Anulado</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="criticidad-filter-label">
                        Criticidad
                      </InputLabel>
                      <Select
                        labelId="criticidad-filter-label"
                        value={filtroCriticidad}
                        label="Criticidad"
                        onChange={(e) => setFiltroCriticidad(e.target.value)}
                      >
                        <MenuItem value="TODOS">Todas</MenuItem>
                        <MenuItem value="VENCIDO">Vencidos</MenuItem>
                        <MenuItem value="HOY">Hoy</MenuItem>
                        <MenuItem value="PROXIMO">Proximos</MenuItem>
                        <MenuItem value="FUTURO">Futuros</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Buscar por empleado"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Nombre del empleado..."
                    />
                  </Grid>
                </Grid>
              </Paper>

              {loadingCreditos ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : creditosFiltrados.length === 0 ? (
                <Alert severity="info">
                  No hay creditos que coincidan con los filtros seleccionados.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Empleado</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell>Fecha credito</TableCell>
                        <TableCell>Fecha cobro</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Criticidad</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {creditosFiltrados.map((c) => (
                        <TableRow key={c.id_credito_empleado} hover>
                          <TableCell>#{c.id_credito_empleado}</TableCell>
                          <TableCell>{c.empleado_nombre || "-"}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={c.cargo || "-"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatQ(c.monto)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight={700}
                              color={
                                Number(c.saldo_pendiente || 0) > 0
                                  ? "warning.main"
                                  : "text.secondary"
                              }
                            >
                              {formatQ(c.saldo_pendiente)}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatFecha(c.fecha_credito)}</TableCell>
                          <TableCell>
                            {formatFecha(c.fecha_cobro_estimada)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={c.estado}
                              color={estadoColor[c.estado] || "default"}
                            />
                          </TableCell>
                          <TableCell>
                            {c.estado === "PENDIENTE" && c.criticidad ? (
                              <Chip
                                size="small"
                                label={
                                  criticidadLabel[c.criticidad] || c.criticidad
                                }
                                color={
                                  criticidadColor[c.criticidad] || "default"
                                }
                                icon={
                                  c.criticidad === "VENCIDO" ? (
                                    <WarningAmberIcon fontSize="small" />
                                  ) : undefined
                                }
                              />
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {canOperar && c.estado === "PENDIENTE" ? (
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="flex-end"
                              >
                                <Tooltip title="Marcar como cobrado">
                                  <IconButton
                                    color="success"
                                    size="small"
                                    onClick={() => abrirCobrar(c)}
                                  >
                                    <DoneAllIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Condonar">
                                  <IconButton
                                    color="info"
                                    size="small"
                                    onClick={() => abrirCondonar(c)}
                                  >
                                    <HeartBrokenIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {tab === 1 && (
            <>
              {loadingNomina ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : nomina.length === 0 ? (
                <Alert severity="info">
                  No hay empleados activos para mostrar.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Empleado</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell>Tipo pago</TableCell>
                        <TableCell align="right">Creditos pendientes</TableCell>
                        <TableCell align="right">#</TableCell>
                        <TableCell>Proximo pago</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {nomina.map((row) => {
                        const pendientes = Number(
                          row.total_creditos_pendientes || 0
                        );
                        return (
                          <TableRow key={row.id_empleado} hover>
                            <TableCell>{row.nombre}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.cargo}
                                color={
                                  row.cargo === "CARWASH"
                                    ? "info"
                                    : "secondary"
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.tipo_pago}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {pendientes > 0 ? (
                                <Typography
                                  fontWeight={700}
                                  color="warning.main"
                                >
                                  - {formatQ(pendientes)}
                                </Typography>
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  -
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {row.num_creditos_pendientes || 0}
                            </TableCell>
                            <TableCell>
                              {formatFecha(row.fecha_cobro_estimada)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog cobrar */}
      <Dialog open={cobrarOpen} onClose={cerrarDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cobrar credito #{creditoSeleccionado?.id_credito_empleado}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta accion marca el credito como cobrado (descontado del pago del
            empleado).
          </Alert>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Empleado
              </Typography>
              <Typography fontWeight={700}>
                {creditoSeleccionado?.empleado_nombre}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Saldo a cobrar
              </Typography>
              <Typography variant="h6" fontWeight={800} color="warning.main">
                {formatQ(creditoSeleccionado?.saldo_pendiente)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Nota (opcional)"
              value={notaCobro}
              onChange={(e) => setNotaCobro(e.target.value.slice(0, 250))}
              helperText={`${notaCobro.length} / 250 caracteres`}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={cerrarDialogs} disabled={loadingAccion}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmarCobrar}
            disabled={loadingAccion}
            startIcon={<DoneAllIcon />}
          >
            {loadingAccion ? <CircularProgress size={18} /> : "Cobrar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog condonar */}
      <Dialog
        open={condonarOpen}
        onClose={cerrarDialogs}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Condonar credito #{creditoSeleccionado?.id_credito_empleado}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            La condonacion registra el credito como perdonado (no se cobra). Esta
            accion es auditable y requiere motivo.
          </Alert>
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Empleado
              </Typography>
              <Typography fontWeight={700}>
                {creditoSeleccionado?.empleado_nombre}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Saldo a condonar
              </Typography>
              <Typography variant="h6" fontWeight={800} color="info.main">
                {formatQ(creditoSeleccionado?.saldo_pendiente)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              label="Motivo de la condonacion"
              value={motivoCondonar}
              onChange={(e) => setMotivoCondonar(e.target.value.slice(0, 250))}
              helperText={`${motivoCondonar.length} / 250 caracteres (minimo 5)`}
              error={
                motivoCondonar.length > 0 && motivoCondonar.trim().length < 5
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={cerrarDialogs} disabled={loadingAccion}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={confirmarCondonar}
            disabled={loadingAccion || motivoCondonar.trim().length < 5}
            startIcon={<HeartBrokenIcon />}
          >
            {loadingAccion ? <CircularProgress size={18} /> : "Condonar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreditosEmpleado;
