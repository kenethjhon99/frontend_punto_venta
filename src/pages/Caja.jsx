import { useEffect, useState } from "react";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PaidIcon from "@mui/icons-material/Paid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import {
  abrirCaja,
  cerrarCaja,
  getCajaResumen,
  getCajaSesionActiva,
  getCajaSesiones,
  registrarMovimientoCaja,
} from "../services/cajaService";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildCajaPrintHtml = ({ sesion, resumen, movimientos }) => {
  const movimientosHtml = (movimientos || [])
    .map(
      (movimiento) => `
        <tr>
          <td>${escapeHtml(formatDateTime(movimiento.fecha))}</td>
          <td>${escapeHtml(movimiento.tipo)}</td>
          <td>${escapeHtml(movimiento.categoria || "Sin categoria")}</td>
          <td>${escapeHtml(movimiento.descripcion || "Sin descripcion")}</td>
          <td>${escapeHtml(movimiento.nombre || movimiento.username || "Usuario")}</td>
          <td style="text-align:right;">${escapeHtml(formatCurrency(movimiento.monto))}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Corte de caja #${escapeHtml(sesion.id_caja_sesion)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111827;
            margin: 24px;
          }
          h1, h2 {
            margin: 0 0 8px;
          }
          .meta, .notes {
            color: #4b5563;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 18px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 12px;
          }
          .label {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .value {
            font-size: 18px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 12px;
            vertical-align: top;
          }
          th {
            background: #f3f4f6;
            text-align: left;
          }
          .empty {
            color: #6b7280;
            font-style: italic;
          }
          @media print {
            body {
              margin: 12px;
            }
          }
        </style>
      </head>
      <body>
        <h1>Corte de caja</h1>
        <div class="meta">
          <div><strong>Sesion:</strong> #${escapeHtml(sesion.id_caja_sesion)}</div>
          <div><strong>Usuario:</strong> ${escapeHtml(sesion.nombre || sesion.username || "Usuario")}</div>
          <div><strong>Estado:</strong> ${escapeHtml(sesion.estado)}</div>
          <div><strong>Fecha apertura:</strong> ${escapeHtml(formatDateTime(sesion.fecha_apertura))}</div>
          <div><strong>Fecha cierre:</strong> ${escapeHtml(sesion.fecha_cierre ? formatDateTime(sesion.fecha_cierre) : "Pendiente")}</div>
          <div><strong>Generado:</strong> ${escapeHtml(formatDateTime(new Date().toISOString()))}</div>
        </div>

        <div class="summary">
          <div class="card"><div class="label">Apertura</div><div class="value">${escapeHtml(formatCurrency(resumen.monto_apertura))}</div></div>
          <div class="card"><div class="label">Ventas en efectivo</div><div class="value">${escapeHtml(formatCurrency(resumen.total_efectivo))}</div></div>
          <div class="card"><div class="label">Ingresos manuales</div><div class="value">${escapeHtml(formatCurrency(resumen.ingresos_manuales))}</div></div>
          <div class="card"><div class="label">Egresos manuales</div><div class="value">${escapeHtml(formatCurrency(resumen.egresos_manuales))}</div></div>
          <div class="card"><div class="label">Cierre calculado</div><div class="value">${escapeHtml(formatCurrency(resumen.cierre_calculado))}</div></div>
          <div class="card"><div class="label">Cierre reportado</div><div class="value">${escapeHtml(formatCurrency(resumen.monto_cierre_reportado || 0))}</div></div>
          <div class="card"><div class="label">Diferencia</div><div class="value">${escapeHtml(formatCurrency(resumen.diferencia || 0))}</div></div>
          <div class="card"><div class="label">Ventas registradas</div><div class="value">${escapeHtml(resumen.ventas_cantidad || 0)}</div></div>
        </div>

        <div class="notes">
          <div><strong>Observaciones apertura:</strong> ${escapeHtml(sesion.observaciones_apertura || "Sin observaciones")}</div>
          <div><strong>Observaciones cierre:</strong> ${escapeHtml(sesion.observaciones_cierre || "Sin observaciones")}</div>
        </div>

        <h2>Movimientos manuales</h2>
        ${
          movimientosHtml
            ? `
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Descripcion</th>
                <th>Usuario</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>${movimientosHtml}</tbody>
          </table>
        `
            : '<div class="empty">No hay movimientos manuales registrados en esta sesion.</div>'
        }
      </body>
    </html>
  `;
};

function Caja() {
  const { user } = useAuth();
  const [sesionActiva, setSesionActiva] = useState(null);
  const [resumenActivo, setResumenActivo] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [selectedSesion, setSelectedSesion] = useState(null);
  const [selectedResumen, setSelectedResumen] = useState(null);
  const [selectedMovimientos, setSelectedMovimientos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ totalRows: 0 });
  const [apertura, setApertura] = useState({
    monto_apertura: "0.00",
    observaciones_apertura: "",
  });
  const [movimiento, setMovimiento] = useState({
    tipo: "INGRESO",
    categoria: "",
    monto: "",
    descripcion: "",
  });
  const [cierre, setCierre] = useState({
    monto_cierre_reportado: "",
    observaciones_cierre: "",
  });

  const canSeeAllSessions = userHasRole(user, "ADMIN");

  const cargarSesiones = async (nextPage = page, nextRowsPerPage = rowsPerPage, nextEstado = estadoFiltro) => {
    const response = await getCajaSesiones({
      page: nextPage + 1,
      limit: nextRowsPerPage,
      estado: nextEstado !== "TODOS" ? nextEstado : undefined,
    });

    setSesiones(Array.isArray(response?.data) ? response.data : []);
    setMeta({ totalRows: Number(response?.meta?.totalRows || 0) });
  };

  const cargarCaja = async () => {
    try {
      setLoading(true);
      setError("");

      const activaResponse = await getCajaSesionActiva();
      setSesionActiva(activaResponse?.sesion || null);
      setResumenActivo(activaResponse?.resumen || null);
      setMovimientos(Array.isArray(activaResponse?.movimientos) ? activaResponse.movimientos : []);

      await cargarSesiones(0, rowsPerPage, estadoFiltro);
      setPage(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cargar el modulo de caja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCaja();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;

    const cargar = async () => {
      try {
        await cargarSesiones(page, rowsPerPage, estadoFiltro);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "No se pudo actualizar el historial de caja");
      }
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, estadoFiltro]);

  const refrescarSesionSeleccionada = async (idSesion) => {
    const response = await getCajaResumen(idSesion);
    setSelectedSesion(response?.sesion || null);
    setSelectedResumen(response?.resumen || null);
    setSelectedMovimientos(Array.isArray(response?.movimientos) ? response.movimientos : []);
  };

  const handleAbrirCaja = async () => {
    try {
      setLoadingAction(true);
      setError("");
      setSuccess("");

      const response = await abrirCaja(apertura);
      setSesionActiva(response?.sesion || null);
      setResumenActivo(response?.resumen || null);
      setMovimientos(Array.isArray(response?.movimientos) ? response.movimientos : []);
      setApertura({ monto_apertura: "0.00", observaciones_apertura: "" });
      setSuccess("Caja abierta correctamente.");
      await cargarSesiones(0, rowsPerPage, estadoFiltro);
      setPage(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo abrir la caja");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRegistrarMovimiento = async () => {
    if (!sesionActiva?.id_caja_sesion) return;

    try {
      setLoadingAction(true);
      setError("");
      setSuccess("");

      const response = await registrarMovimientoCaja(sesionActiva.id_caja_sesion, movimiento);
      setResumenActivo(response?.resumen || null);
      setMovimientos(Array.isArray(response?.movimientos) ? response.movimientos : []);
      setMovimiento({
        tipo: "INGRESO",
        categoria: "",
        monto: "",
        descripcion: "",
      });
      setSuccess("Movimiento de caja registrado correctamente.");
      await cargarSesiones(page, rowsPerPage, estadoFiltro);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo registrar el movimiento");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!sesionActiva?.id_caja_sesion) return;

    try {
      setLoadingAction(true);
      setError("");
      setSuccess("");

      const response = await cerrarCaja(sesionActiva.id_caja_sesion, cierre);
      setSesionActiva(null);
      setResumenActivo(null);
      setMovimientos([]);
      setSelectedSesion(response?.sesion || null);
      setSelectedResumen(response?.resumen || null);
      setSelectedMovimientos(Array.isArray(response?.movimientos) ? response.movimientos : []);
      setCierre({ monto_cierre_reportado: "", observaciones_cierre: "" });
      setSuccess("Caja cerrada correctamente.");
      await cargarSesiones(0, rowsPerPage, estadoFiltro);
      setPage(0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cerrar la caja");
    } finally {
      setLoadingAction(false);
    }
  };

  const verResumenSesion = async (idSesion) => {
    try {
      setLoadingAction(true);
      setError("");
      await refrescarSesionSeleccionada(idSesion);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo cargar el resumen de la sesion");
    } finally {
      setLoadingAction(false);
    }
  };

  const renderSummaryCards = (resumen) => {
    if (!resumen) return null;

    const cards = [
      { label: "Apertura", value: formatCurrency(resumen.monto_apertura), color: "primary.main" },
      { label: "Ventas en efectivo", value: formatCurrency(resumen.total_efectivo), color: "success.main" },
      { label: "Ingresos manuales", value: formatCurrency(resumen.ingresos_manuales), color: "info.main" },
      { label: "Egresos manuales", value: formatCurrency(resumen.egresos_manuales), color: "warning.main" },
      { label: "Cierre calculado", value: formatCurrency(resumen.cierre_calculado), color: "secondary.main" },
      { label: "Ventas registradas", value: String(resumen.ventas_cantidad || 0), color: "text.primary" },
    ];

    return (
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} lg={4} key={card.label}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: "100%" }}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {card.label}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={card.color}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const exportarPdf = async () => {
    const sesionObjetivo = selectedSesion || sesionActiva;
    const resumenObjetivo = selectedResumen || resumenActivo;
    const movimientosObjetivoBase = selectedSesion ? selectedMovimientos : movimientos;

    if (!sesionObjetivo || !resumenObjetivo) {
      setError("No hay una sesion de caja disponible para exportar.");
      return;
    }

    try {
      setExportingPdf(true);
      setError("");

      const response = await getCajaResumen(sesionObjetivo.id_caja_sesion);
      const movimientosObjetivo = Array.isArray(response?.movimientos)
        ? response.movimientos
        : movimientosObjetivoBase;
      const sesionPdf = response?.sesion || sesionObjetivo;
      const resumenPdf = response?.resumen || resumenObjetivo;

      const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
      if (!printWindow) {
        setError("Tu navegador bloqueo la ventana emergente para generar el PDF.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(
        buildCajaPrintHtml({
          sesion: sesionPdf,
          resumen: resumenPdf,
          movimientos: movimientosObjetivo,
        })
      );
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo generar el PDF del corte de caja");
    } finally {
      setExportingPdf(false);
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
            <AccountBalanceWalletIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Caja
            </Typography>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            Abre caja, registra ingresos o egresos y cierra con diferencia controlada.
          </Typography>
        </Box>

        <Chip
          color={sesionActiva ? "success" : "default"}
          icon={sesionActiva ? <LockOpenIcon /> : <LockIcon />}
          label={sesionActiva ? "Caja abierta" : "Caja cerrada"}
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="flex-end"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
      >
        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={exportarPdf}
          disabled={loading || loadingAction || exportingPdf || (!sesionActiva && !selectedSesion)}
        >
          {exportingPdf ? "Generando PDF..." : "Exportar corte PDF"}
        </Button>
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

      {loading ? (
        <Paper elevation={2} sx={{ p: 5, borderRadius: 3 }}>
          <Typography color="text.secondary">Cargando modulo de caja...</Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {!sesionActiva ? (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <LockOpenIcon color="success" />
                <Typography variant="h6" fontWeight="bold">
                  Apertura de caja
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monto de apertura"
                    value={apertura.monto_apertura}
                    onChange={(event) =>
                      setApertura((prev) => ({ ...prev, monto_apertura: event.target.value }))
                    }
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Observaciones de apertura"
                    placeholder="Ej. fondo inicial de caja, cambio disponible"
                    value={apertura.observaciones_apertura}
                    onChange={(event) =>
                      setApertura((prev) => ({ ...prev, observaciones_apertura: event.target.value }))
                    }
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="success"
                onClick={handleAbrirCaja}
                disabled={loadingAction}
                sx={{ mt: 3 }}
              >
                {loadingAction ? "Abriendo..." : "Abrir caja"}
              </Button>
            </Paper>
          ) : (
            <>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Sesion activa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Abierta el {formatDateTime(sesionActiva.fecha_apertura)} por {sesionActiva.nombre || sesionActiva.username}
                    </Typography>
                  </Box>

                  <Chip
                    icon={<PaidIcon />}
                    label={`Apertura ${formatCurrency(sesionActiva.monto_apertura)}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                {renderSummaryCards(resumenActivo)}
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={12} lg={7}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <ReceiptLongIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Movimientos manuales
                      </Typography>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Select
                          fullWidth
                          value={movimiento.tipo}
                          onChange={(event) =>
                            setMovimiento((prev) => ({ ...prev, tipo: event.target.value }))
                          }
                        >
                          <MenuItem value="INGRESO">Ingreso</MenuItem>
                          <MenuItem value="EGRESO">Egreso</MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Categoria"
                          value={movimiento.categoria}
                          onChange={(event) =>
                            setMovimiento((prev) => ({ ...prev, categoria: event.target.value }))
                          }
                          placeholder="Ej. retiro, gasto"
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Monto"
                          value={movimiento.monto}
                          onChange={(event) =>
                            setMovimiento((prev) => ({ ...prev, monto: event.target.value }))
                          }
                          inputProps={{ min: 0, step: "0.01" }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Descripcion"
                          value={movimiento.descripcion}
                          onChange={(event) =>
                            setMovimiento((prev) => ({ ...prev, descripcion: event.target.value }))
                          }
                          placeholder="Motivo del movimiento"
                        />
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      onClick={handleRegistrarMovimiento}
                      disabled={loadingAction}
                      sx={{ mt: 2.5 }}
                    >
                      {loadingAction ? "Guardando..." : "Registrar movimiento"}
                    </Button>

                    <Divider sx={{ my: 3 }} />

                    <Stack spacing={1.5}>
                      {movimientos.length === 0 ? (
                        <Typography color="text.secondary">
                          Todavia no hay movimientos manuales registrados en esta caja.
                        </Typography>
                      ) : (
                        movimientos.map((item) => (
                          <Paper key={item.id_caja_movimiento} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Box>
                                <Typography fontWeight="bold">
                                  {item.tipo} {item.categoria ? `| ${item.categoria}` : ""}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.descripcion || "Sin descripcion"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(item.fecha)} | {item.nombre || item.username}
                                </Typography>
                              </Box>

                              <Typography
                                fontWeight="bold"
                                color={item.tipo === "INGRESO" ? "success.main" : "error.main"}
                              >
                                {item.tipo === "INGRESO" ? "+" : "-"} {formatCurrency(item.monto)}
                              </Typography>
                            </Stack>
                          </Paper>
                        ))
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={5}>
                  <Paper elevation={3} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                      <LockIcon color="warning" />
                      <Typography variant="h6" fontWeight="bold">
                        Cierre de caja
                      </Typography>
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Monto contado al cierre"
                        value={cierre.monto_cierre_reportado}
                        onChange={(event) =>
                          setCierre((prev) => ({ ...prev, monto_cierre_reportado: event.target.value }))
                        }
                        inputProps={{ min: 0, step: "0.01" }}
                      />

                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Observaciones de cierre"
                        value={cierre.observaciones_cierre}
                        onChange={(event) =>
                          setCierre((prev) => ({ ...prev, observaciones_cierre: event.target.value }))
                        }
                        placeholder="Ej. diferencia explicada, retiro final, entrega de turno"
                      />

                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          Cierre esperado segun sistema
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {formatCurrency(resumenActivo?.cierre_calculado)}
                        </Typography>
                      </Paper>

                      <Button
                        variant="contained"
                        color="warning"
                        onClick={handleCerrarCaja}
                        disabled={loadingAction}
                      >
                        {loadingAction ? "Cerrando..." : "Cerrar caja"}
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
              mb={2}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Historial de sesiones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {canSeeAllSessions
                    ? "Como administrador puedes consultar sesiones de caja registradas."
                    : "Aqui puedes revisar tus aperturas y cierres anteriores."}
                </Typography>
              </Box>

              <Select
                value={estadoFiltro}
                onChange={(event) => {
                  setEstadoFiltro(event.target.value);
                  setPage(0);
                }}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
              >
                <MenuItem value="TODOS">Todos</MenuItem>
                <MenuItem value="ABIERTA">Abiertas</MenuItem>
                <MenuItem value="CERRADA">Cerradas</MenuItem>
              </Select>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Fecha apertura</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Monto apertura</TableCell>
                    <TableCell>Cierre calculado</TableCell>
                    <TableCell>Diferencia</TableCell>
                    <TableCell>Accion</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sesiones.map((sesion) => (
                    <TableRow key={sesion.id_caja_sesion} hover>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {sesion.nombre || sesion.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sesion.username}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDateTime(sesion.fecha_apertura)}</TableCell>
                      <TableCell>
                        <Chip
                          label={sesion.estado}
                          color={sesion.estado === "ABIERTA" ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(sesion.monto_apertura)}</TableCell>
                      <TableCell>
                        {sesion.monto_cierre_calculado != null
                          ? formatCurrency(sesion.monto_cierre_calculado)
                          : "Pendiente"}
                      </TableCell>
                      <TableCell>
                        {sesion.diferencia != null ? formatCurrency(sesion.diferencia) : "Pendiente"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => verResumenSesion(sesion.id_caja_sesion)}
                          disabled={loadingAction}
                        >
                          Ver resumen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={meta.totalRows}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(Number(event.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[8, 12, 20]}
              labelRowsPerPage="Filas por pagina"
            />
          </Paper>

          {selectedSesion && selectedResumen && (
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Resumen de sesion #{selectedSesion.id_caja_sesion}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {formatDateTime(selectedSesion.fecha_apertura)}
                {selectedSesion.fecha_cierre
                  ? ` a ${formatDateTime(selectedSesion.fecha_cierre)}`
                  : " - Caja aun abierta"}
              </Typography>

              {renderSummaryCards(selectedResumen)}
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default Caja;
