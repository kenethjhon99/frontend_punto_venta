import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
import PrintIcon from "@mui/icons-material/Print";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import { openPrintDocument } from "../utils/printDocuments";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import {
  getSectionPanelSx,
  getSummaryCardSx,
} from "../utils/summaryCardStyles";
import {
  cobrarCreditosDeEmpleado,
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
  CANCELADO: "default",
};

const criticidadColor = {
  VENCIDO: "error",
  POR_VENCER: "warning",
  VIGENTE: "default",
};

const criticidadLabel = {
  VENCIDO: "Vencido",
  POR_VENCER: "Por vencer",
  VIGENTE: "Vigente",
};

const getSaldoPendiente = (credito) =>
  Number(
    credito?.saldo_pendiente ??
      (String(credito?.estado || "").toUpperCase() === "PENDIENTE"
        ? credito?.monto
        : 0)
  );

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildReciboCreditoEmpleadoHtml = (recibo) => {
  const empleado = recibo?.empleado || {};
  const creditos = Array.isArray(recibo?.creditos) ? recibo.creditos : [];
  const resumen = recibo?.resumen || {};
  const cobrador = recibo?.cobrador || {};
  const fecha = resumen.cobrado_en ? new Date(resumen.cobrado_en) : new Date();
  const fechaTexto = Number.isNaN(fecha.getTime())
    ? new Date().toLocaleString("es-GT")
    : fecha.toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" });

  const rows = creditos
    .map(
      (credito) => `
        <tr>
          <td>#${escapeHtml(credito.id_credito_empleado)}</td>
          <td>${escapeHtml(credito.venta_numero_comprobante || credito.id_venta || "-")}</td>
          <td>${escapeHtml(formatFecha(credito.fecha_credito))}</td>
          <td>${escapeHtml(formatFecha(credito.fecha_cobro))}</td>
          <td class="right">${escapeHtml(formatQ(credito.monto))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Recibo credito empleado</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 18px; color: #111827; }
          .receipt { max-width: 420px; margin: 0 auto; }
          .center { text-align: center; }
          .title { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
          .subtitle { color: #4b5563; font-size: 12px; margin-bottom: 12px; }
          .box { border: 1px solid #d1d5db; border-radius: 12px; padding: 10px; margin: 10px 0; }
          .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
          .value { font-weight: 800; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 7px 4px; text-align: left; }
          th { font-size: 10px; text-transform: uppercase; color: #6b7280; }
          .right { text-align: right; }
          .total { font-size: 22px; font-weight: 900; text-align: right; margin-top: 12px; }
          .footer { margin-top: 20px; font-size: 11px; color: #6b7280; text-align: center; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">
            <div class="title">Recibo de cobro a empleado</div>
            <div class="subtitle">Creditos descontados del pago del empleado</div>
          </div>
          <div class="box">
            <div class="label">Empleado</div>
            <div class="value">${escapeHtml(empleado.nombre || "-")}</div>
            <div>${escapeHtml(empleado.cargo || "-")} · ${escapeHtml(empleado.tipo_pago || "-")}</div>
          </div>
          <div class="box">
            <div class="label">Fecha de cobro</div>
            <div class="value">${escapeHtml(fechaTexto)}</div>
            <div>Cobrado por: ${escapeHtml(cobrador.nombre || cobrador.username || "-")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Credito</th>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Cobro</th>
                <th class="right">Monto</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="total">Total: ${escapeHtml(formatQ(resumen.total_cobrado))}</div>
          ${
            resumen.nota
              ? `<div class="box"><div class="label">Nota</div><div>${escapeHtml(resumen.nota)}</div></div>`
              : ""
          }
          <div class="footer">Firma empleado: __________________________</div>
        </div>
      </body>
    </html>
  `;
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
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroCriticidad, setFiltroCriticidad] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState("");
  const [creditosSeleccionados, setCreditosSeleccionados] = useState([]);
  const [notaCobroEmpleado, setNotaCobroEmpleado] = useState("");
  const [loadingCobroEmpleado, setLoadingCobroEmpleado] = useState(false);

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
        limit: 200,
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

  const empleadosConCredito = useMemo(() => {
    const map = new Map();
    creditos.forEach((credito) => {
      if (!credito.id_empleado) return;
      const key = String(credito.id_empleado);
      const current = map.get(key) || {
        id_empleado: credito.id_empleado,
        nombre: credito.empleado_nombre || "Empleado",
        cargo: credito.empleado_cargo || "-",
        tipo_pago: credito.empleado_tipo_pago || "-",
        total_pendiente: 0,
        pendientes: 0,
      };
      if (credito.estado === "PENDIENTE") {
        current.total_pendiente += getSaldoPendiente(credito);
        current.pendientes += 1;
      }
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) =>
      String(a.nombre).localeCompare(String(b.nombre), "es")
    );
  }, [creditos]);

  const creditosEmpleadoPendientes = useMemo(
    () =>
      creditos
        .filter(
          (credito) =>
            String(credito.id_empleado) === String(empleadoSeleccionadoId) &&
            credito.estado === "PENDIENTE"
        )
        .sort(
          (a, b) =>
            new Date(a.fecha_cobro || 0).getTime() -
              new Date(b.fecha_cobro || 0).getTime() ||
            Number(a.id_credito_empleado) - Number(b.id_credito_empleado)
        ),
    [creditos, empleadoSeleccionadoId]
  );

  const historialEmpleado = useMemo(
    () =>
      creditos
        .filter(
          (credito) =>
            String(credito.id_empleado) === String(empleadoSeleccionadoId) &&
            credito.estado !== "PENDIENTE"
        )
        .sort(
          (a, b) =>
            new Date(b.cobrado_en || b.updated_at || b.fecha_credito || 0).getTime() -
            new Date(a.cobrado_en || a.updated_at || a.fecha_credito || 0).getTime()
        )
        .slice(0, 8),
    [creditos, empleadoSeleccionadoId]
  );

  const empleadoSeleccionado = useMemo(
    () =>
      empleadosConCredito.find(
        (empleado) => String(empleado.id_empleado) === String(empleadoSeleccionadoId)
      ) || null,
    [empleadosConCredito, empleadoSeleccionadoId]
  );

  useEffect(() => {
    const idsPendientes = creditosEmpleadoPendientes.map(
      (credito) => credito.id_credito_empleado
    );
    setCreditosSeleccionados(idsPendientes);
  }, [creditosEmpleadoPendientes]);

  const totalSeleccionado = useMemo(
    () =>
      creditosEmpleadoPendientes
        .filter((credito) =>
          creditosSeleccionados.includes(credito.id_credito_empleado)
        )
        .reduce((acc, credito) => acc + getSaldoPendiente(credito), 0),
    [creditosEmpleadoPendientes, creditosSeleccionados]
  );

  const resumen = useMemo(() => {
    const total = creditos.reduce(
      (acc, c) =>
        c.estado === "PENDIENTE" ? acc + getSaldoPendiente(c) : acc,
      0
    );
    const vencidos = creditos.filter(
      (c) => c.estado === "PENDIENTE" && c.criticidad === "VENCIDO"
    ).length;
    const hoy = creditos.filter(
      (c) => c.estado === "PENDIENTE" && c.criticidad === "POR_VENCER"
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

  const toggleCreditoSeleccionado = (idCredito) => {
    setCreditosSeleccionados((prev) =>
      prev.includes(idCredito)
        ? prev.filter((id) => id !== idCredito)
        : [...prev, idCredito]
    );
  };

  const toggleTodosEmpleado = (checked) => {
    setCreditosSeleccionados(
      checked
        ? creditosEmpleadoPendientes.map((credito) => credito.id_credito_empleado)
        : []
    );
  };

  const imprimirReciboEmpleado = (recibo) => {
    openPrintDocument({
      title: "Recibo credito empleado",
      html: buildReciboCreditoEmpleadoHtml(recibo),
      width: 460,
      height: 760,
    });
  };

  const cobrarEmpleadoSeleccionado = async () => {
    if (!empleadoSeleccionadoId || creditosSeleccionados.length === 0) return;
    try {
      setLoadingCobroEmpleado(true);
      setError("");
      setSuccess("");
      const response = await cobrarCreditosDeEmpleado(empleadoSeleccionadoId, {
        ids_credito: creditosSeleccionados,
        nota: notaCobroEmpleado || null,
      });
      const recibo = response.recibo;
      setSuccess(
        `Cobro registrado para ${recibo?.empleado?.nombre || "empleado"} por ${formatQ(
          recibo?.resumen?.total_cobrado
        )}.`
      );
      setNotaCobroEmpleado("");
      imprimirReciboEmpleado(recibo);
      await Promise.all([cargarCreditos(), cargarNomina()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cobrar al empleado");
    } finally {
      setLoadingCobroEmpleado(false);
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
        `Credito #${creditoSeleccionado.id_credito_empleado} cancelado correctamente.`
      );
      cerrarDialogs();
      await Promise.all([cargarCreditos(), cargarNomina()]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cancelar el credito");
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
            Por vencer
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
                        <MenuItem value="CANCELADO">Cancelado</MenuItem>
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
                        <MenuItem value="POR_VENCER">Por vencer</MenuItem>
                        <MenuItem value="VIGENTE">Vigentes</MenuItem>
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

              <Paper
                variant="outlined"
                sx={(t) =>
                  getSectionPanelSx(t, { p: 2.5, radius: 3, accent: "warning" })
                }
              >
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        Cobro por empleado
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Filtra por empleado, marca los creditos a cobrar y genera
                        recibo del descuento aplicado.
                      </Typography>
                    </Box>
                    <FormControl sx={{ minWidth: { xs: "100%", md: 320 } }} size="small">
                      <InputLabel id="empleado-cobro-label">Empleado</InputLabel>
                      <Select
                        labelId="empleado-cobro-label"
                        label="Empleado"
                        value={empleadoSeleccionadoId}
                        onChange={(event) => {
                          setEmpleadoSeleccionadoId(event.target.value);
                          setNotaCobroEmpleado("");
                        }}
                      >
                        <MenuItem value="">Seleccionar empleado</MenuItem>
                        {empleadosConCredito.map((empleado) => (
                          <MenuItem
                            key={empleado.id_empleado}
                            value={String(empleado.id_empleado)}
                          >
                            {empleado.nombre} · {empleado.pendientes} pendiente(s) ·{" "}
                            {formatQ(empleado.total_pendiente)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {empleadoSeleccionado ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Empleado
                            </Typography>
                            <Typography fontWeight={800}>
                              {empleadoSeleccionado.nombre}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                              <Chip size="small" label={empleadoSeleccionado.cargo} />
                              <Chip
                                size="small"
                                label={empleadoSeleccionado.tipo_pago}
                                variant="outlined"
                              />
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total pendiente del empleado
                            </Typography>
                            <Typography variant="h5" fontWeight={900} color="warning.main">
                              {formatQ(empleadoSeleccionado.total_pendiente)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {empleadoSeleccionado.pendientes} credito(s) pendiente(s)
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Total seleccionado a cobrar
                            </Typography>
                            <Typography variant="h5" fontWeight={900} color="success.main">
                              {formatQ(totalSeleccionado)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {creditosSeleccionados.length} credito(s) marcado(s)
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
                            <Box sx={{ px: 2, py: 1.5 }}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Checkbox
                                  size="small"
                                  checked={
                                    creditosEmpleadoPendientes.length > 0 &&
                                    creditosSeleccionados.length ===
                                      creditosEmpleadoPendientes.length
                                  }
                                  indeterminate={
                                    creditosSeleccionados.length > 0 &&
                                    creditosSeleccionados.length <
                                      creditosEmpleadoPendientes.length
                                  }
                                  onChange={(event) =>
                                    toggleTodosEmpleado(event.target.checked)
                                  }
                                />
                                <Typography fontWeight={800}>
                                  Pendientes a cobrar
                                </Typography>
                              </Stack>
                            </Box>
                            {creditosEmpleadoPendientes.length === 0 ? (
                              <Alert severity="success" sx={{ borderRadius: 0 }}>
                                Este empleado no tiene creditos pendientes.
                              </Alert>
                            ) : (
                              <TableContainer sx={{ maxHeight: 260 }}>
                                <Table size="small" stickyHeader>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell />
                                      <TableCell>Credito</TableCell>
                                      <TableCell>Venta</TableCell>
                                      <TableCell>Fecha cobro</TableCell>
                                      <TableCell align="right">Saldo</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {creditosEmpleadoPendientes.map((credito) => (
                                      <TableRow key={credito.id_credito_empleado} hover>
                                        <TableCell padding="checkbox">
                                          <Checkbox
                                            size="small"
                                            checked={creditosSeleccionados.includes(
                                              credito.id_credito_empleado
                                            )}
                                            onChange={() =>
                                              toggleCreditoSeleccionado(
                                                credito.id_credito_empleado
                                              )
                                            }
                                          />
                                        </TableCell>
                                        <TableCell>#{credito.id_credito_empleado}</TableCell>
                                        <TableCell>
                                          {credito.venta_numero_comprobante ||
                                            `Venta #${credito.id_venta}`}
                                        </TableCell>
                                        <TableCell>
                                          {formatFecha(
                                            credito.fecha_cobro_estimada ??
                                              credito.fecha_cobro
                                          )}
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography fontWeight={800}>
                                            {formatQ(getSaldoPendiente(credito))}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Stack spacing={2}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="Nota para recibo (opcional)"
                              value={notaCobroEmpleado}
                              onChange={(event) =>
                                setNotaCobroEmpleado(event.target.value.slice(0, 250))
                              }
                              helperText={`${notaCobroEmpleado.length} / 250 caracteres`}
                            />
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={<PrintIcon />}
                              disabled={
                                !canOperar ||
                                loadingCobroEmpleado ||
                                creditosSeleccionados.length === 0
                              }
                              onClick={cobrarEmpleadoSeleccionado}
                            >
                              {loadingCobroEmpleado
                                ? "Cobrando..."
                                : "Cobrar e imprimir recibo"}
                            </Button>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                              <Typography fontWeight={800} mb={1}>
                                Historial reciente
                              </Typography>
                              {historialEmpleado.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  Aun no hay cobros o cancelaciones para este empleado.
                                </Typography>
                              ) : (
                                <Stack spacing={1}>
                                  {historialEmpleado.map((credito) => (
                                    <Stack
                                      key={credito.id_credito_empleado}
                                      direction="row"
                                      justifyContent="space-between"
                                      spacing={1}
                                    >
                                      <Box>
                                        <Typography variant="body2" fontWeight={700}>
                                          #{credito.id_credito_empleado} · {credito.estado}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatFecha(
                                            credito.cobrado_en ?? credito.updated_at
                                          )}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" fontWeight={800}>
                                        {formatQ(credito.monto)}
                                      </Typography>
                                    </Stack>
                                  ))}
                                </Stack>
                              )}
                            </Paper>
                          </Stack>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <Alert severity="info">
                      Selecciona un empleado para ver su total pendiente,
                      historial y recibo de cobro.
                    </Alert>
                  )}
                </Stack>
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
                              label={c.empleado_cargo || c.cargo || "-"}
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
                                getSaldoPendiente(c) > 0
                                  ? "warning.main"
                                  : "text.secondary"
                              }
                            >
                              {formatQ(getSaldoPendiente(c))}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatFecha(c.fecha_credito)}</TableCell>
                          <TableCell>
                            {formatFecha(
                              c.fecha_cobro_estimada ?? c.fecha_cobro
                            )}
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
                              {formatFecha(
                                row.fecha_cobro_estimada ?? row.fecha_cobro
                              )}
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
                {formatQ(getSaldoPendiente(creditoSeleccionado))}
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
          Cancelar credito #{creditoSeleccionado?.id_credito_empleado}
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
                Saldo a cancelar
              </Typography>
              <Typography variant="h6" fontWeight={800} color="info.main">
                {formatQ(getSaldoPendiente(creditoSeleccionado))}
              </Typography>
            </Box>
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              label="Motivo de la cancelacion"
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
            {loadingAccion ? <CircularProgress size={18} /> : "Cancelar credito"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreditosEmpleado;
