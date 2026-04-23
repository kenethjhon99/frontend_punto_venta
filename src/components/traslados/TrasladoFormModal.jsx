import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const formatQ = (value) => `Q ${Number(value || 0).toFixed(2)}`;

function TrasladoFormModal({
  open,
  onClose,
  bodegas = [],
  form,
  onFieldChange,
  productos = [],
  onSearchProductos,
  onAddProducto,
  onRemoveProducto,
  onChangeCantidad,
  loadingBodegas = false,
  loadingProductos = false,
  loadingSubmit = false,
  canSubmit = false,
  error = "",
  onSubmit,
}) {
  const detalle = Array.isArray(form?.detalle) ? form.detalle : [];

  return (
    <Dialog open={open} onClose={loadingSubmit ? undefined : onClose} fullWidth maxWidth="lg">
      <DialogTitle>Nuevo traslado de inventario</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Desde"
              value={form?.id_bodega_origen ?? ""}
              onChange={(event) => onFieldChange("id_bodega_origen", event.target.value)}
              disabled={loadingBodegas || loadingSubmit}
            >
              {bodegas.map((bodega) => (
                <MenuItem key={bodega.id_bodega} value={String(bodega.id_bodega)}>
                  {bodega.nombre_visible || bodega.nombre || bodega.bodega_key}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Hacia"
              value={form?.id_bodega_destino ?? ""}
              onChange={(event) => onFieldChange("id_bodega_destino", event.target.value)}
              disabled={loadingBodegas || loadingSubmit}
            >
              {bodegas.map((bodega) => (
                <MenuItem key={bodega.id_bodega} value={String(bodega.id_bodega)}>
                  {bodega.nombre_visible || bodega.nombre || bodega.bodega_key}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Motivo (opcional)"
              value={form?.motivo ?? ""}
              onChange={(event) => onFieldChange("motivo", event.target.value)}
              disabled={loadingSubmit}
            />
            <TextField
              fullWidth
              label="Observaciones (opcional)"
              value={form?.observaciones ?? ""}
              onChange={(event) => onFieldChange("observaciones", event.target.value)}
              disabled={loadingSubmit}
            />
          </Stack>

          <Divider />

          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Productos disponibles
              </Typography>
              <TextField
                fullWidth
                placeholder="Buscar por nombre, codigo o descripcion"
                value={form?.search ?? ""}
                onChange={(event) => onSearchProductos(event.target.value)}
                disabled={loadingSubmit}
                sx={{ mb: 1.5 }}
              />

              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", minHeight: 360 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Exist.</TableCell>
                      <TableCell align="center">Agregar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingProductos ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Stack py={3} alignItems="center">
                            <CircularProgress size={24} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : productos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            No hay productos disponibles en este origen.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      productos.map((producto) => (
                        <TableRow key={producto.id_producto} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {producto.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {producto.codigo_barras || "Sin codigo"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{producto.existencia}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Agregar al traslado">
                              <span>
                                <IconButton
                                  color="primary"
                                  onClick={() => onAddProducto(producto)}
                                  disabled={loadingSubmit}
                                >
                                  <AddCircleOutlineIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Renglones del traslado ({detalle.length})
              </Typography>
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden", minHeight: 360 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cant.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center">Quitar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalle.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" py={3}>
                            Agrega productos desde la columna izquierda.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      detalle.map((item) => (
                        <TableRow key={item.id_producto}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {item.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Existencia origen: {item.existencia}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={item.cantidad}
                              onChange={(event) =>
                                onChangeCantidad(item.id_producto, event.target.value)
                              }
                              inputProps={{
                                min: 1,
                                max: item.existencia,
                                style: { width: 60, textAlign: "center" },
                              }}
                              disabled={loadingSubmit}
                            />
                          </TableCell>
                          <TableCell align="right">{formatQ(item.subtotal)}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => onRemoveProducto(item.id_producto)}
                              disabled={loadingSubmit}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
                mt={1.5}
              >
                <Typography variant="body1" fontWeight={700}>
                  Unidades totales:{" "}
                  {detalle.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  Valor total:{" "}
                  {formatQ(detalle.reduce((acc, item) => acc + Number(item.subtotal || 0), 0))}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loadingSubmit}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!canSubmit || loadingSubmit}
        >
          {loadingSubmit ? "Registrando..." : "Registrar traslado"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrasladoFormModal;
