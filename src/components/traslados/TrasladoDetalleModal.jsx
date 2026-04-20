import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
} from "@mui/material";
import CallMadeIcon from "@mui/icons-material/CallMade";
import CallReceivedIcon from "@mui/icons-material/CallReceived";

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

const formatFecha = (v) => {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString("es-GT");
  } catch {
    return String(v);
  }
};

const estadoColor = (estado) => {
  const e = String(estado || "").toUpperCase();
  if (e === "ANULADO") return "error";
  if (e === "EN_TRANSITO") return "warning";
  return "success";
};

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right" }}>
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}

function TrasladoDetalleModal({ open, onClose, data, loading }) {
  const t = data?.traslado;
  const detalles = data?.detalles || [];
  const movimientos = data?.movimientos || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {t ? `Traslado ${t.folio || `#${t.id_traslado}`}` : "Detalle de traslado"}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        ) : !t ? (
          <Alert severity="info">Sin datos de traslado</Alert>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Origen
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {t.bodega_origen_nombre}
                </Typography>
                {t.sucursal_origen_nombre && (
                  <Typography variant="caption" color="text.secondary">
                    {t.sucursal_origen_nombre}
                  </Typography>
                )}
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Destino
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {t.bodega_destino_nombre}
                </Typography>
                {t.sucursal_destino_nombre && (
                  <Typography variant="caption" color="text.secondary">
                    {t.sucursal_destino_nombre}
                  </Typography>
                )}
              </Box>
              <Box flex={1} textAlign="right">
                <Chip
                  label={String(t.estado || "").replace("_", " ")}
                  color={estadoColor(t.estado)}
                  size="small"
                />
              </Box>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Box flex={1}>
                <InfoRow label="Folio" value={t.folio} />
                <InfoRow label="Fecha" value={formatFecha(t.fecha)} />
                <InfoRow label="Creado por" value={t.usuario_nombre || t.usuario_username} />
                <InfoRow label="Total items" value={t.total_items} />
                <InfoRow label="Total unidades" value={t.total_unidades} />
                <InfoRow label="Valor total" value={formatQ(t.total_valorizado)} />
              </Box>
              <Box flex={1}>
                {t.motivo && <InfoRow label="Motivo" value={t.motivo} />}
                {t.observaciones && <InfoRow label="Observaciones" value={t.observaciones} />}
                {String(t.estado || "").toUpperCase() === "ANULADO" && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Anulacion
                    </Typography>
                    <InfoRow label="Fecha" value={formatFecha(t.anulada_en)} />
                    <InfoRow
                      label="Anulado por"
                      value={t.anulada_por_nombre || t.anulada_por_username}
                    />
                    {t.motivo_anulacion && (
                      <InfoRow label="Motivo anulacion" value={t.motivo_anulacion} />
                    )}
                  </>
                )}
              </Box>
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold">
              Productos trasladados
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Costo unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Sin renglones
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  detalles.map((d) => (
                    <TableRow key={d.id_traslado_detalle}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {d.producto_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {d.codigo_barras}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{d.cantidad}</TableCell>
                      <TableCell align="right">{formatQ(d.costo_unitario)}</TableCell>
                      <TableCell align="right">{formatQ(d.subtotal)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Divider />

            <Typography variant="subtitle1" fontWeight="bold">
              Movimientos de stock generados
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Bodega</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell align="right">Cant.</TableCell>
                  <TableCell align="right">Antes</TableCell>
                  <TableCell align="right">Despues</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        Sin movimientos
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientos.map((m) => (
                    <TableRow key={m.id_movimiento}>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={
                            m.tipo === "ENTRADA" ? (
                              <CallReceivedIcon fontSize="small" />
                            ) : (
                              <CallMadeIcon fontSize="small" />
                            )
                          }
                          label={m.tipo}
                          color={m.tipo === "ENTRADA" ? "success" : "warning"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{m.bodega_nombre}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{m.motivo}</Typography>
                      </TableCell>
                      <TableCell align="right">{m.cantidad}</TableCell>
                      <TableCell align="right">{m.existencia_antes}</TableCell>
                      <TableCell align="right">{m.existencia_despues}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrasladoDetalleModal;
