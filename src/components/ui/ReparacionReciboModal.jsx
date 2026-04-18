import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import {
  buildReparacionReciboHtml,
  formatPrintCurrency,
  formatPrintDateTime,
  openPrintDocument,
} from "../../utils/printDocuments";

function Line({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" gap={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 800 : 600}
        sx={{ textAlign: "right" }}
      >
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}

function ReparacionReciboModal({ open, onClose, recibo, loading = false }) {
  const orden = recibo?.orden || null;
  const productos = Array.isArray(recibo?.productos) ? recibo.productos : [];
  const resumen = recibo?.resumen || {};
  const productosCobrados = productos.filter((p) => p.cobra_al_cliente);

  const imprimir = () => {
    if (!recibo) return;
    openPrintDocument({
      title: `Recibo ORD-${String(orden?.id_reparacion_orden || "0").padStart(5, "0")}`,
      html: buildReparacionReciboHtml(recibo),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>
            Recibo de servicio
          </Typography>
          {orden?.estado_trabajo && (
            <Chip
              size="small"
              label={String(orden.estado_trabajo).replaceAll("_", " ")}
              color="primary"
              variant="outlined"
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={4} spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Cargando recibo...</Typography>
          </Stack>
        ) : !orden ? (
          <Typography color="text.secondary">
            No se pudo cargar el recibo de la orden.
          </Typography>
        ) : (
          <Box
            sx={(theme) => ({
              fontFamily: '"Courier New", Courier, monospace',
              borderRadius: 2,
              p: 2,
              bgcolor:
                theme.palette.mode === "light" ? "#ffffff" : "rgba(255,255,255,0.03)",
              border: `1px dashed ${theme.palette.divider}`,
            })}
          >
            <Stack spacing={0.5} textAlign="center" mb={1.5}>
              <Typography fontWeight={800} variant="subtitle1">
                RECIBO DE SERVICIO
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Taller mecanico
              </Typography>
              {orden.sucursal_nombre && (
                <Typography variant="caption" color="text.secondary">
                  Sucursal: {orden.sucursal_nombre}
                </Typography>
              )}
            </Stack>

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            <Stack spacing={0.5}>
              <Line
                label="Recibo"
                value={`ORD-${String(orden.id_reparacion_orden).padStart(5, "0")}`}
              />
              <Line label="Fecha" value={formatPrintDateTime(orden.fecha)} />
              <Line
                label="Usuario"
                value={orden.usuario_nombre || orden.usuario_username || "-"}
              />
              <Line label="Tecnico" value={orden.tecnico_nombre || "Sin asignar"} />
            </Stack>

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            <Stack spacing={0.5}>
              <Line label="Cliente" value={orden.nombre_cliente || "CONSUMIDOR FINAL"} />
              {orden.placa && <Line label="Placa" value={orden.placa} />}
              {orden.tipo_vehiculo_nombre && (
                <Line label="Vehiculo" value={orden.tipo_vehiculo_nombre} />
              )}
              {orden.kilometraje != null && orden.kilometraje !== "" && (
                <Line label="Km" value={orden.kilometraje} />
              )}
            </Stack>

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              DESCRIPCION
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
              {orden.servicio_descripcion ||
                orden.servicio_nombre ||
                orden.diagnostico_inicial ||
                "Servicio de reparacion"}
            </Typography>
            {orden.observaciones && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.5, whiteSpace: "pre-wrap" }}
              >
                Obs: {orden.observaciones}
              </Typography>
            )}

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            <Stack spacing={0.5}>
              <Line
                label={`1 x ${orden.servicio_nombre || "Servicio"}`}
                value={formatPrintCurrency(resumen.total_servicio)}
              />
              {productosCobrados.map((p) => (
                <Line
                  key={p.id_reparacion_orden_producto}
                  label={`${p.cantidad} x ${p.producto_nombre}`}
                  value={formatPrintCurrency(p.subtotal_cobrado)}
                />
              ))}
            </Stack>

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            {Number(resumen.total_productos || 0) > 0 && (
              <Stack spacing={0.5}>
                <Line
                  label="Servicio"
                  value={formatPrintCurrency(resumen.total_servicio)}
                />
                <Line
                  label="Repuestos"
                  value={formatPrintCurrency(resumen.total_productos)}
                />
              </Stack>
            )}

            <Line label="TOTAL" value={formatPrintCurrency(resumen.total)} strong />

            {Number(resumen.monto_recibido || 0) > 0 && (
              <Stack spacing={0.5} mt={0.5}>
                <Line label="Metodo" value={orden.metodo_pago || "EFECTIVO"} />
                <Line label="Pago" value={formatPrintCurrency(resumen.monto_recibido)} />
                <Line label="Vuelto" value={formatPrintCurrency(resumen.vuelto)} />
              </Stack>
            )}

            <Divider sx={{ my: 1, borderStyle: "dashed" }} />

            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              Gracias por confiar en nuestro taller
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />} color="inherit">
          Cerrar
        </Button>
        <Button
          onClick={imprimir}
          startIcon={<PrintIcon />}
          variant="contained"
          disabled={loading || !orden}
        >
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReparacionReciboModal;
