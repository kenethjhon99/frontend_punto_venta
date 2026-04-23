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
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import { getFilterPanelSx } from "../utils/filterPanelStyles";
import {
  crearTraslado,
  getStockTrasladoOrigen,
  getTrasladoBodegas,
  getTrasladoById,
  getTraslados,
} from "../services/trasladoService";
import TrasladoDetalleModal from "../components/traslados/TrasladoDetalleModal";
import TrasladoFormModal from "../components/traslados/TrasladoFormModal";
import { getTrasladoSideLabel } from "../utils/trasladoLabels";
import { isReadOnlyUser, userHasRole } from "../utils/roles";
import { useAuth } from "../hooks/useAuth";

const formatFecha = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("es-GT");
  } catch {
    return String(value);
  }
};

const formatQ = (value) => `Q ${Number(value || 0).toFixed(2)}`;

const estadoColor = (estado) => {
  const normalized = String(estado || "").trim().toUpperCase();
  if (normalized === "ANULADO") return "error";
  if (normalized === "EN_TRANSITO") return "warning";
  return "success";
};

const EMPTY_FORM = {
  id_bodega_origen: "",
  id_bodega_destino: "",
  motivo: "",
  observaciones: "",
  search: "",
  detalle: [],
};

function Traslados() {
  const { user } = useAuth();
  const canCreateTraslados = useMemo(
    () => userHasRole(user, "ADMIN", "ENCARGADO_SERVICIOS") && !isReadOnlyUser(user),
    [user]
  );

  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    estado: "",
    id_bodega_origen: "",
    id_bodega_destino: "",
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [bodegas, setBodegas] = useState([]);
  const [traslados, setTraslados] = useState([]);
  const [meta, setMeta] = useState({ totalRows: 0, totalPages: 0 });
  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingBodegas, setLoadingBodegas] = useState(false);
  const [error, setError] = useState("");

  const [detalleData, setDetalleData] = useState(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [productosOrigen, setProductosOrigen] = useState([]);
  const [loadingProductosOrigen, setLoadingProductosOrigen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState("");

  const cargarBodegas = useCallback(async () => {
    try {
      setLoadingBodegas(true);
      const response = await getTrasladoBodegas();
      setBodegas(Array.isArray(response?.data) ? response.data : []);
    } catch (e) {
      console.error("[traslados] error cargando bodegas", e);
      setBodegas([]);
      setError(e.response?.data?.error || "No se pudieron cargar las bodegas logicas.");
    } finally {
      setLoadingBodegas(false);
    }
  }, []);

  const cargarTraslados = useCallback(async () => {
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
      setTraslados(Array.isArray(res?.data) ? res.data : []);
      setMeta({
        totalRows: Number(res?.meta?.totalRows || 0),
        totalPages: Number(res?.meta?.totalPages || 0),
      });
    } catch (e) {
      console.error("[traslados] error cargando listado", e);
      setError(e.response?.data?.error || "No se pudieron cargar los traslados.");
    } finally {
      setLoadingLista(false);
    }
  }, [filters, limit, page]);

  const cargarProductosOrigen = useCallback(async (idBodega, search = "") => {
    if (!idBodega) {
      setProductosOrigen([]);
      return;
    }

    try {
      setLoadingProductosOrigen(true);
      setSubmitError("");
      const res = await getStockTrasladoOrigen(idBodega, {
        q: search || undefined,
      });
      setProductosOrigen(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      console.error("[traslados] error cargando productos origen", e);
      setProductosOrigen([]);
      setSubmitError(
        e.response?.data?.error || "No se pudo cargar el inventario del origen."
      );
    } finally {
      setLoadingProductosOrigen(false);
    }
  }, []);

  useEffect(() => {
    cargarBodegas();
  }, [cargarBodegas]);

  useEffect(() => {
    cargarTraslados();
  }, [cargarTraslados]);

  useEffect(() => {
    if (!formOpen) return;
    cargarProductosOrigen(form.id_bodega_origen, form.search);
  }, [cargarProductosOrigen, form.id_bodega_origen, form.search, formOpen]);

  const abrirDetalle = async (idTraslado) => {
    try {
      setLoadingDetalle(true);
      setDetalleOpen(true);
      setDetalleData(null);
      const res = await getTrasladoById(idTraslado);
      setDetalleData(res);
    } catch (e) {
      console.error("[traslados] error cargando detalle", e);
      setError(e.response?.data?.error || "No se pudo cargar el detalle.");
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
      id_bodega_origen: "",
      id_bodega_destino: "",
    });
    setPage(1);
  };

  const abrirFormulario = () => {
    setSuccess("");
    setSubmitError("");
    setForm(EMPTY_FORM);
    setProductosOrigen([]);
    setFormOpen(true);
  };

  const cerrarFormulario = () => {
    if (loadingSubmit) return;
    setFormOpen(false);
    setSubmitError("");
    setForm(EMPTY_FORM);
    setProductosOrigen([]);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => {
      if (field === "id_bodega_origen") {
        return {
          ...prev,
          id_bodega_origen: value,
          detalle: [],
          search: "",
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSearchProductos = (value) => {
    setForm((prev) => ({ ...prev, search: value }));
  };

  const handleAddProducto = (producto) => {
    setForm((prev) => {
      const yaExiste = prev.detalle.some(
        (item) => Number(item.id_producto) === Number(producto.id_producto)
      );
      if (yaExiste) return prev;

      return {
        ...prev,
        detalle: [
          ...prev.detalle,
          {
            id_producto: Number(producto.id_producto),
            nombre: producto.nombre,
            codigo_barras: producto.codigo_barras || "",
            existencia: Number(producto.existencia || 0),
            cantidad: 1,
            costo_unitario: Number(producto.precio_compra || 0),
            subtotal: Number(producto.precio_compra || 0),
          },
        ],
      };
    });
  };

  const handleRemoveProducto = (idProducto) => {
    setForm((prev) => ({
      ...prev,
      detalle: prev.detalle.filter(
        (item) => Number(item.id_producto) !== Number(idProducto)
      ),
    }));
  };

  const handleChangeCantidad = (idProducto, nextValue) => {
    const cantidad = Number(nextValue);

    setForm((prev) => ({
      ...prev,
      detalle: prev.detalle.map((item) => {
        if (Number(item.id_producto) !== Number(idProducto)) return item;
        const max = Number(item.existencia || 0);
        const safe = Math.max(1, Math.min(Number.isFinite(cantidad) ? cantidad : 1, max));
        return {
          ...item,
          cantidad: safe,
          subtotal: Number((safe * Number(item.costo_unitario || 0)).toFixed(2)),
        };
      }),
    }));
  };

  const canSubmit = useMemo(() => {
    return (
      Boolean(form.id_bodega_origen) &&
      Boolean(form.id_bodega_destino) &&
      String(form.id_bodega_origen) !== String(form.id_bodega_destino) &&
      Array.isArray(form.detalle) &&
      form.detalle.length > 0 &&
      form.detalle.every(
        (item) =>
          Number(item.cantidad) > 0 &&
          Number(item.cantidad) <= Number(item.existencia || 0)
      )
    );
  }, [form]);

  const registrarTraslado = async () => {
    try {
      setLoadingSubmit(true);
      setSubmitError("");
      setError("");
      setSuccess("");

      const payload = {
        id_bodega_origen: Number(form.id_bodega_origen),
        id_bodega_destino: Number(form.id_bodega_destino),
        motivo: form.motivo?.trim() || null,
        observaciones: form.observaciones?.trim() || null,
        detalle: form.detalle.map((item) => ({
          id_producto: Number(item.id_producto),
          cantidad: Number(item.cantidad),
        })),
      };

      await crearTraslado(payload);
      setSuccess("Traslado registrado correctamente.");
      cerrarFormulario();
      await Promise.all([cargarTraslados(), cargarBodegas()]);
    } catch (e) {
      console.error("[traslados] error creando traslado", e);
      setSubmitError(e.response?.data?.error || "No se pudo registrar el traslado.");
    } finally {
      setLoadingSubmit(false);
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
            <SwapHorizIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Traslados
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Mueve inventario entre las 2 bodegas logicas activas: General y
            Tienda / Productos Taller.
          </Typography>
        </Box>

        {canCreateTraslados && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirFormulario}
          >
            Nuevo traslado
          </Button>
        )}
      </Stack>

      {!canCreateTraslados && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Tu rol puede consultar el historial de traslados, pero no registrar movimientos nuevos.
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>
          {success}
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
              setFilters((prev) => ({ ...prev, desde: e.target.value }));
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
              setFilters((prev) => ({ ...prev, hasta: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 160 } }}
          />

          <TextField
            select
            label="Estado"
            value={filters.estado}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, estado: e.target.value }));
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
            label="Origen"
            value={filters.id_bodega_origen}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, id_bodega_origen: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {bodegas.map((bodega) => (
              <MenuItem key={bodega.id_bodega} value={String(bodega.id_bodega)}>
                {bodega.nombre_visible || bodega.nombre || bodega.bodega_key}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Destino"
            value={filters.id_bodega_destino}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, id_bodega_destino: e.target.value }));
              setPage(1);
            }}
            sx={{ minWidth: { xs: "100%", md: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            {bodegas.map((bodega) => (
              <MenuItem key={bodega.id_bodega} value={String(bodega.id_bodega)}>
                {bodega.nombre_visible || bodega.nombre || bodega.bodega_key}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarTraslados}
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
              {loadingLista || loadingBodegas ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Stack py={4} alignItems="center">
                      <CircularProgress />
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : traslados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="text.secondary" py={3}>
                      No hay traslados que coincidan con los filtros.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                traslados.map((traslado) => (
                  <TableRow key={traslado.id_traslado} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {traslado.folio}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatFecha(traslado.fecha)}</TableCell>
                    <TableCell>{getTrasladoSideLabel(traslado, "origen")}</TableCell>
                    <TableCell>{getTrasladoSideLabel(traslado, "destino")}</TableCell>
                    <TableCell align="right">{traslado.total_items}</TableCell>
                    <TableCell align="right">{traslado.total_unidades}</TableCell>
                    <TableCell align="right">{formatQ(traslado.total_valorizado)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={String(traslado.estado || "").replace("_", " ")}
                        color={estadoColor(traslado.estado)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {traslado.usuario_nombre || traslado.usuario_username || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle">
                        <IconButton
                          size="small"
                          onClick={() => abrirDetalle(traslado.id_traslado)}
                        >
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
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Stack>
        )}
      </Paper>

      <TrasladoFormModal
        open={formOpen}
        onClose={cerrarFormulario}
        bodegas={bodegas}
        form={form}
        onFieldChange={handleFieldChange}
        productos={productosOrigen}
        onSearchProductos={handleSearchProductos}
        onAddProducto={handleAddProducto}
        onRemoveProducto={handleRemoveProducto}
        onChangeCantidad={handleChangeCantidad}
        loadingBodegas={loadingBodegas}
        loadingProductos={loadingProductosOrigen}
        loadingSubmit={loadingSubmit}
        canSubmit={canSubmit}
        error={submitError}
        onSubmit={registrarTraslado}
      />

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
