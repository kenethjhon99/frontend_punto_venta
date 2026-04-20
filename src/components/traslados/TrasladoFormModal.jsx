import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { getBodegas, getStockBodega } from "../../services/trasladoService";

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

function TrasladoFormModal({ open, onClose, onSubmit, loading }) {
  const [bodegas, setBodegas] = useState([]);
  const [idOrigen, setIdOrigen] = useState("");
  const [idDestino, setIdDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [stockOrigen, setStockOrigen] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [errorStock, setErrorStock] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // mapa id_producto -> { producto, cantidad }
  const [items, setItems] = useState(new Map());

  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setIdOrigen("");
    setIdDestino("");
    setMotivo("");
    setObservaciones("");
    setBusqueda("");
    setItems(new Map());
    setStockOrigen([]);
    setError("");
    setErrorStock("");
  }, []);

  useEffect(() => {
    if (!open) return;
    reset();
    (async () => {
      try {
        const data = await getBodegas();
        const list = Array.isArray(data?.data) ? data.data : [];
        setBodegas(list);

        // defaults: GENERAL -> TIENDA si existen
        const general = list.find((b) =>
          String(b.nombre || "").trim().toUpperCase() === "GENERAL"
        );
        const tienda = list.find((b) =>
          String(b.nombre || "").trim().toUpperCase() === "TIENDA"
        );
        if (general) setIdOrigen(general.id_bodega);
        if (tienda) setIdDestino(tienda.id_bodega);
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.error || "No se pudieron cargar las bodegas");
      }
    })();
  }, [open, reset]);

  // cargar stock cada vez que cambia el origen
  useEffect(() => {
    if (!idOrigen) {
      setStockOrigen([]);
      return;
    }
    (async () => {
      try {
        setLoadingStock(true);
        setErrorStock("");
        const data = await getStockBodega(idOrigen);
        setStockOrigen(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error(e);
        setErrorStock(e.response?.data?.error || "No se pudo cargar el stock de la bodega");
        setStockOrigen([]);
      } finally {
        setLoadingStock(false);
      }
    })();
  }, [idOrigen]);

  const productosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let base = stockOrigen.filter((p) => Number(p.existencia) > 0);
    if (q) {
      base = base.filter(
        (p) =>
          String(p.nombre || "").toLowerCase().includes(q) ||
          String(p.codigo_barras || "").toLowerCase().includes(q)
      );
    }
    return base.slice(0, 50);
  }, [stockOrigen, busqueda]);

  const stockPorId = useMemo(() => {
    const m = new Map();
    stockOrigen.forEach((p) => m.set(p.id_producto, p));
    return m;
  }, [stockOrigen]);

  const itemsArr = useMemo(() => Array.from(items.values()), [items]);
  const totalUnidades = itemsArr.reduce((a, it) => a + Number(it.cantidad || 0), 0);
  const totalValorizado = itemsArr.reduce(
    (a, it) => a + Number(it.cantidad || 0) * Number(it.producto?.precio_compra || 0),
    0
  );

  const agregarItem = (producto) => {
    setItems((prev) => {
      const next = new Map(prev);
      const current = next.get(producto.id_producto);
      const existencia = Number(producto.existencia || 0);
      const nuevaCant = (current?.cantidad || 0) + 1;
      if (nuevaCant > existencia) return prev;
      next.set(producto.id_producto, { producto, cantidad: nuevaCant });
      return next;
    });
  };

  const cambiarCantidad = (idProducto, valor) => {
    setItems((prev) => {
      const next = new Map(prev);
      const current = next.get(idProducto);
      if (!current) return prev;
      const num = Math.max(0, Math.floor(Number(valor) || 0));
      const existencia = Number(stockPorId.get(idProducto)?.existencia || 0);
      const cant = Math.min(num, existencia);
      if (cant === 0) {
        next.delete(idProducto);
      } else {
        next.set(idProducto, { ...current, cantidad: cant });
      }
      return next;
    });
  };

  const quitarItem = (idProducto) => {
    setItems((prev) => {
      const next = new Map(prev);
      next.delete(idProducto);
      return next;
    });
  };

  const swapBodegas = () => {
    setIdOrigen(idDestino);
    setIdDestino(idOrigen);
    setItems(new Map());
  };

  const enviar = () => {
    setError("");
    if (!idOrigen || !idDestino) {
      setError("Debes seleccionar bodega de origen y destino");
      return;
    }
    if (Number(idOrigen) === Number(idDestino)) {
      setError("La bodega de origen y destino deben ser diferentes");
      return;
    }
    if (itemsArr.length === 0) {
      setError("Agrega al menos un producto al traslado");
      return;
    }

    const payload = {
      id_bodega_origen: Number(idOrigen),
      id_bodega_destino: Number(idDestino),
      motivo: motivo.trim() || null,
      observaciones: observaciones.trim() || null,
      items: itemsArr.map((it) => ({
        id_producto: it.producto.id_producto,
        cantidad: it.cantidad,
      })),
    };

    onSubmit(payload);
  };

  const bodegasDestino = useMemo(
    () => bodegas.filter((b) => b.id_bodega !== Number(idOrigen)),
    [bodegas, idOrigen]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Nuevo traslado de inventario</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            <TextField
              select
              label="Bodega origen"
              value={idOrigen}
              onChange={(e) => {
                setIdOrigen(e.target.value);
                setItems(new Map());
              }}
              fullWidth
              disabled={loading}
            >
              {bodegas.map((b) => (
                <MenuItem key={b.id_bodega} value={b.id_bodega}>
                  {b.nombre}
                  {b.sucursal_nombre ? ` — ${b.sucursal_nombre}` : ""}
                </MenuItem>
              ))}
            </TextField>

            <IconButton
              color="primary"
              onClick={swapBodegas}
              disabled={!idOrigen || !idDestino || loading}
              title="Intercambiar origen y destino"
            >
              <SwapHorizIcon />
            </IconButton>

            <TextField
              select
              label="Bodega destino"
              value={idDestino}
              onChange={(e) => setIdDestino(e.target.value)}
              fullWidth
              disabled={loading}
            >
              {bodegasDestino.map((b) => (
                <MenuItem key={b.id_bodega} value={b.id_bodega}>
                  {b.nombre}
                  {b.sucursal_nombre ? ` — ${b.sucursal_nombre}` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Motivo (opcional)"
              placeholder="Ej. Abastecimiento diario"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 200 }}
              disabled={loading}
            />
            <TextField
              label="Observaciones (opcional)"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 500 }}
              disabled={loading}
            />
          </Stack>

          <Divider />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Box flex={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Productos en origen
                </Typography>
                {loadingStock && <CircularProgress size={20} />}
              </Stack>

              <TextField
                placeholder="Buscar por nombre o codigo"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                fullWidth
                size="small"
                sx={{ mb: 1 }}
                disabled={!idOrigen || loading}
              />

              {errorStock && <Alert severity="error" sx={{ mb: 1 }}>{errorStock}</Alert>}

              <Box
                sx={{
                  maxHeight: 320,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Exist.</TableCell>
                      <TableCell align="center">Agregar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productosFiltrados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            {idOrigen
                              ? loadingStock
                                ? "Cargando..."
                                : "Sin productos con existencia"
                              : "Selecciona una bodega de origen"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      productosFiltrados.map((p) => (
                        <TableRow key={p.id_producto} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {p.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {p.codigo_barras}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip size="small" label={p.existencia} />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => agregarItem(p)}
                              disabled={loading}
                            >
                              <AddCircleOutlineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Renglones del traslado ({itemsArr.length})
              </Typography>
              <Box
                sx={{
                  maxHeight: 320,
                  overflow: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center" sx={{ width: 110 }}>Cant.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center" sx={{ width: 50 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itemsArr.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Agrega productos desde la columna izquierda
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      itemsArr.map((it) => {
                        const prod = it.producto;
                        const costo = Number(prod.precio_compra || 0);
                        const sub = costo * it.cantidad;
                        const maxCant = Number(stockPorId.get(prod.id_producto)?.existencia || 0);
                        return (
                          <TableRow key={prod.id_producto}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {prod.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatQ(costo)} c/u · max {maxCant}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                type="number"
                                size="small"
                                value={it.cantidad}
                                onChange={(e) => cambiarCantidad(prod.id_producto, e.target.value)}
                                inputProps={{ min: 0, max: maxCant, step: 1 }}
                                sx={{ width: 90 }}
                                disabled={loading}
                              />
                            </TableCell>
                            <TableCell align="right">{formatQ(sub)}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => quitarItem(prod.id_producto)}
                                disabled={loading}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Box>

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Unidades totales: <b>{totalUnidades}</b>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor total: <b>{formatQ(totalValorizado)}</b>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={enviar}
          disabled={loading || itemsArr.length === 0}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? "Registrando..." : "Registrar traslado"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrasladoFormModal;
