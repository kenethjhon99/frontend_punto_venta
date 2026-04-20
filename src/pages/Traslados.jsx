import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import {
  anularTraslado,
  crearTraslado,
  getBodegas,
  getTrasladoById,
  getTraslados,
} from "../services/trasladoService";
import TrasladoFormModal from "../components/traslados/TrasladoFormModal";
import TrasladoDetalleModal from "../components/traslados/TrasladoDetalleModal";
import TrasladoAnulacionModal from "../components/traslados/TrasladoAnulacionModal";

const formatFecha = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("es-GT");
  } catch {
    return String(v);
  }
};

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

const estadoColor = (estado) => {
  const e = String(estado || "").toUpperCase();
  if (e === "ANULADO") return "error";
  if (e === "EN_TRANSITO") return "warning";
  return "success";
};

const getBucketLabel = (bodega) => bodega?.nombre_visible || bodega?.nombre || "-";

function Traslados() {
  const { user } = useAuth();
  const canManage = useMemo(() => userHasRole(user, "ADMIN"), [user]);

  const [bodegas, setBodegas] = useState([]);
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    estado: "",
    id_bodega_origen: "",
    id_bodega_destino: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ totalRows: 0, totalPages: 0 });
  const [loadingLista, setLoadingLista] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [detalleData, setDetalleData] = useState(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [anulacionOpen, setAnulacionOpen] = useState(false);
  const [anulacionTarget, setAnulacionTarget] = useState(null);
  const [loadingAnular, setLoadingAnular] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBodegas();
        setBodegas(Array.isArray(res?.data) ? res.data : []);
      } catch (e) {
        console.error("[traslados] error cargando catalogos de origen/destino", e);
      }
    })();
  }, []);

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
      if (filters.id_bodega_origen) params.id_bodega_origen = filters.id_bodega_origen;
      if (filters.id_bodega_destino) params.id_bodega_destino = filters.id_bodega_destino;

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

  const confirmarCrear = async (payload) => {
    try {
      setLoadingCrear(true);
      setError("");
      setSuccess("");
      const res = await crearTraslado(payload);
      const t = res?.traslado;
      setSuccess(`Traslado ${t ? `#${t.id_traslado}` : ""} registrado correctamente.`);
      setFormOpen(false);
      setPage(1);
      await cargar();
    } catch (e) {
      console.error("[traslados] error registrando traslado", e);
      setError(e.response?.data?.error || "No se pudo registrar el traslado");
    } finally {
      setLoadingCrear(false);
    }
  };

  const confirmarAnular = async (motivo) => {
    if (!anulacionTarget) return;
    try {
      setLoadingAnular(true);
      setError("");
      setSuccess("");
      await anularTraslado(anulacionTarget.id_traslado, { motivo });
      setSuccess(`Traslado #${anulacionTarget.id_traslado} anulado correctamente.`);
      setAnulacionOpen(false);
      setAnulacionTarget(null);
      await cargar();
    } catch (e) {
      console.error("[traslados] error anulando traslado", e);
      setError(e.response?.data?.error || "No se pudo anular el traslado");
    } finally {
      setLoadingAnular(false);
    }
  };

  const limpiarFiltros = () => {
    setFilters({
      desde: "",
      hasta: "",
      estado: "",
      id_bodega_origen: "",
      id_bodega_destino: "",
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
              Traslados
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            {canManage
              ? "Mueve inventario entre General y Productos Taller. Cada traslado genera 2 movimientos de stock trazables."
              : "Modo solo lectura: puedes consultar traslados registrados."}
          </Typography>
        </Box>

        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Nuevo traslado
          </Button>
        )}
      </Stack>

      {!canManage && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Este perfil puede consultar traslados pero no crearlos ni anularlos.
        </Alert>
      )}

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
          <TextField
            select
            label="Desde"
            value={filters.id_bodega_origen}
            onChange={(e) => {
              setFilters((f) => ({ ...f, id_bodega_origen: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {bodegas.map((b) => (
              <MenuItem key={b.id_bodega} value={b.id_bodega}>
                {getBodegaLabel(b)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Hasta"
            value={filters.id_bodega_destino}
            onChange={(e) => {
              setFilters((f) => ({ ...f, id_bodega_destino: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 180 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {bodegas.map((b) => (
              <MenuItem key={b.id_bodega} value={b.id_bodega}>
                {getBodegaLabel(b)}
              </MenuItem>
            ))}
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
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
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
                    <TableCell>{t.bodega_origen_nombre}</TableCell>
                    <TableCell>{t.bodega_destino_nombre}</TableCell>
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
                      {canManage && String(t.estado || "").toUpperCase() !== "ANULADO" && (
                        <Tooltip title="Anular">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setAnulacionTarget(t);
                              setAnulacionOpen(true);
                            }}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {canManage && (
        <TrasladoFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={confirmarCrear}
          loading={loadingCrear}
        />
      )}

      <TrasladoDetalleModal
        open={detalleOpen}
        onClose={() => {
          setDetalleOpen(false);
          setDetalleData(null);
        }}
        data={detalleData}
        loading={loadingDetalle}
      />

      {canManage && (
        <TrasladoAnulacionModal
          open={anulacionOpen}
          onClose={() => {
            setAnulacionOpen(false);
            setAnulacionTarget(null);
          }}
          onConfirm={confirmarAnular}
          traslado={anulacionTarget}
          loading={loadingAnular}
        />
      )}
    </Box>
  );
}

export default Traslados;
