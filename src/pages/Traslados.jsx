import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import {
  getTrasladoById,
  getTraslados,
} from "../services/trasladoService";
import TrasladoDetalleModal from "../components/traslados/TrasladoDetalleModal";
import { getTrasladoSideLabel } from "../utils/trasladoLabels";

const formatFecha = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("es-GT");
  } catch {
    return String(v);
  }
};

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

const asText = (value) => {
  const text = String(value ?? "").trim();
  return text || "";
};

const CATALOGO_LABELS = {
  GENERAL: "General",
  PRINCIPAL: "General",
  TIENDA: "Tienda",
  TIENDA_TALLER: "Tienda",
  PRODUCTOS_TALLER: "Productos Taller",
  SERVICIOS: "Productos Taller",
  TALLER: "Productos Taller",
};

const getCatalogLabel = (value) => {
  const key = String(value ?? "").trim().toUpperCase();
  return CATALOGO_LABELS[key] || "";
};

const getListadoSideLabel = (traslado, side) => {
  if (!traslado || typeof traslado !== "object") return "-";

  const label = getTrasladoSideLabel(traslado, side);
  if (label && label !== "-") return label;

  if (side === "origen") {
    return (
      getCatalogLabel(traslado.catalogo_origen) ||
      getCatalogLabel(traslado.origen_bucket_key) ||
      getCatalogLabel(traslado.modulo_origen) ||
      asText(traslado.origen_nombre_visible) ||
      asText(traslado.bodega_origen_nombre_visible) ||
      asText(traslado.nombre_origen_visible) ||
      getCatalogLabel(traslado.bodega_origen_nombre) ||
      getCatalogLabel(traslado.origen_nombre) ||
      asText(traslado.bodega_origen_nombre) ||
      asText(traslado.origen_nombre) ||
      "-"
    );
  }

  return (
    getCatalogLabel(traslado.catalogo_destino) ||
    getCatalogLabel(traslado.destino_bucket_key) ||
    getCatalogLabel(traslado.modulo_destino) ||
    asText(traslado.destino_nombre_visible) ||
    asText(traslado.bodega_destino_nombre_visible) ||
    asText(traslado.nombre_destino_visible) ||
    getCatalogLabel(traslado.bodega_destino_nombre) ||
    getCatalogLabel(traslado.destino_nombre) ||
    asText(traslado.bodega_destino_nombre) ||
    asText(traslado.destino_nombre) ||
    "-"
  );
};

const estadoColor = (estado) => {
  const e = String(estado || "").toUpperCase();
  if (e === "ANULADO") return "error";
  if (e === "EN_TRANSITO") return "warning";
  return "success";
};

function Traslados() {
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    estado: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ totalRows: 0, totalPages: 0 });
  const [loadingLista, setLoadingLista] = useState(false);
  const [error, setError] = useState("");

  const [detalleData, setDetalleData] = useState(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLoadingLista(true);
      setError("");

      const params = {
        page,
        limit,
        sortBy: "fecha",
        sortDir: "desc",
      };

      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      if (filters.estado) params.estado = filters.estado;

      const res = await getTraslados(params);
      setData(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        totalRows: res?.meta?.totalRows || 0,
        totalPages: res?.meta?.totalPages || 0,
      });
    } catch (e) {
      console.error("[traslados] error cargando listado", e);
      setError(e.response?.data?.error || "No se pudieron cargar los traslados");
    } finally {
      setLoadingLista(false);
    }
  }, [filters, limit, page]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirDetalle = async (id_traslado) => {
    try {
      setLoadingDetalle(true);
      setDetalleOpen(true);
      setDetalleData(null);
      const res = await getTrasladoById(id_traslado);
      setDetalleData(res);
    } catch (e) {
      console.error("[traslados] error cargando detalle", e);
      setError(e.response?.data?.error || "No se pudo cargar el detalle");
      setDetalleOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const limpiarFiltros = () => {
    setFilters({
      desde: "",
      hasta: "",
      estado: "",
    });
    setPage(1);
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
            <SwapHorizIcon color="primary" />
              <Typography variant="h4" fontWeight="bold">
              Traslados (historico)
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Consulta traslados historicos entre catalogos como General, Tienda y Productos Taller.
            Esta vista es solo lectura.
          </Typography>
        </Box>
      </Stack>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Los traslados activos ya no usan multiples bodegas. Esta vista conserva
        el historico para consulta y muestra el origen/destino con nombres de catalogo.
      </Alert>

      <Paper elevation={2} sx={(theme) => getFilterPanelSx(theme, { mb: 3 })}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            label="Desde"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.desde}
            onChange={(e) => {
              setFilters((f) => ({ ...f, desde: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 160 } }}
          />
          <TextField
            label="Hasta"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={filters.hasta}
            onChange={(e) => {
              setFilters((f) => ({ ...f, hasta: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 160 } }}
          />
          <TextField
            select
            label="Estado"
            value={filters.estado}
            onChange={(e) => {
              setFilters((f) => ({ ...f, estado: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 160 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="RECIBIDO">Recibido</MenuItem>
            <MenuItem value="EN_TRANSITO">En transito</MenuItem>
            <MenuItem value="ANULADO">Anulado</MenuItem>
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargar}
              disabled={loadingLista}
            >
              Actualizar
            </Button>
            <Button onClick={limpiarFiltros} disabled={loadingLista}>
              Limpiar
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Desde</TableCell>
                <TableCell>Hasta</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Unidades</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingLista ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Stack alignItems="center" py={4}>
                      <CircularProgress />
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="text.secondary" py={3}>
                      No hay traslados que coincidan con los filtros
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((t) => (
                  <TableRow key={t.id_traslado} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {t.folio}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatFecha(t.fecha)}</TableCell>
                    <TableCell>{getListadoSideLabel(t, "origen")}</TableCell>
                    <TableCell>{getListadoSideLabel(t, "destino")}</TableCell>
                    <TableCell align="right">{t.total_items}</TableCell>
                    <TableCell align="right">{t.total_unidades}</TableCell>
                    <TableCell align="right">{formatQ(t.total_valorizado)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={String(t.estado || "").replace("_", " ")}
                        color={estadoColor(t.estado)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {t.usuario_nombre || t.usuario_username}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => abrirDetalle(t.id_traslado)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {meta.totalPages > 1 && (
          <Stack alignItems="center" p={2}>
            <Pagination
              count={meta.totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              disabled={loadingLista}
            />
          </Stack>
        )}
      </Paper>

      <TrasladoDetalleModal
        open={detalleOpen}
        onClose={() => {
          setDetalleOpen(false);
          setDetalleData(null);
        }}
        data={detalleData}
        loading={loadingDetalle}
      />
    </Box>
  );
}

export default Traslados;
