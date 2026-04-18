import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import {
  buildOrdenCompraHtml,
  formatPrintCurrency,
  openPrintDocument,
} from "../../utils/printDocuments";

const pad5 = (n) => String(Number(n) || 0).padStart(5, "0");

const formatFechaLarga = (value) => {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(d);
};

function Campo({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function OrdenCompraModal({ open, onClose, compraData, loading = false, tasaIva = 0.12 }) {
  const compra = compraData?.compra || null;
  const detalles = Array.isArray(compraData?.detalles) ? compraData.detalles : [];
  const detallesActivos = detalles.filter(
    (d) => Number(d.cantidad || 0) - Number(d.cantidad_anulada || 0) > 0
  );

  let subtotalSinIva = 0;
  let totalIva = 0;
  const filas = detallesActivos.map((d) => {
    const cantidad = Number(d.cantidad || 0) - Number(d.cantidad_anulada || 0);
    const precioConIva = Number(d.precio_compra || 0);
    const precioSinIva = tasaIva > 0 ? precioConIva / (1 + tasaIva) : precioConIva;
    const subtotal = precioSinIva * cantidad;
    const total = precioConIva * cantidad;
    subtotalSinIva += subtotal;
    totalIva += total - subtotal;
    return { d, cantidad, precioConIva, precioSinIva, subtotal, total };
  });

  const totalFinal = Number(compra?.total ?? subtotalSinIva + totalIva);
  const diasCredito = Number(compra?.dias_credito || 0);
  const terminoPago =
    compra?.termino_pago ||
    (diasCredito > 0 ? `CREDITO ${diasCredito} DIAS` : "CONTADO");

  const imprimir = () => {
    if (!compraData) return;
    openPrintDocument({
      title: `Orden de compra OC-${pad5(compra?.id_compra)}`,
      html: buildOrdenCompraHtml(compraData, { tasa_iva: tasaIva }),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>
            Orden de compra {compra ? `OC-${pad5(compra.id_compra)}` : ""}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" py={4} spacing={2}>
            <CircularProgress />
            <Typography color="text.secondary">Cargando orden...</Typography>
          </Stack>
        ) : !compra ? (
          <Typography color="text.secondary">
            No se pudo cargar la orden de compra.
          </Typography>
        ) : (
          <Stack spacing={2.5}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                border: "3px double",
                borderColor: "text.primary",
                pb: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {compra.sucursal_nombre || "Empresa"}
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {compra.sucursal_nombre || "POS System"}
                </Typography>
                {compra.sucursal_direccion && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {compra.sucursal_direccion}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h6" fontWeight={800} letterSpacing={2}>
                  ORDEN DE COMPRA
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{
                    display: "inline-block",
                    mt: 0.5,
                    px: 1.5,
                    py: 0.5,
                    border: "1.5px solid",
                    borderColor: "text.primary",
                    borderRadius: 1,
                  }}
                >
                  No. OC-{pad5(compra.id_compra)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  Emitida: {formatFechaLarga(compra.fecha || compra.fecha_compra)}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    Proveedor
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {compra.proveedor_nombre || "-"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.7}>
                    {compra.proveedor_nit && <Campo label="NIT" value={compra.proveedor_nit} />}
                    {compra.proveedor_direccion && <Campo label="Direccion" value={compra.proveedor_direccion} />}
                    {compra.proveedor_telefono_empresa && <Campo label="Telefono" value={compra.proveedor_telefono_empresa} />}
                    {compra.proveedor_nombre_viajero && <Campo label="Viajero" value={compra.proveedor_nombre_viajero} />}
                    {compra.proveedor_telefono_viajero && <Campo label="Tel. viajero" value={compra.proveedor_telefono_viajero} />}
                    {compra.proveedor_correo && <Campo label="Correo" value={compra.proveedor_correo} />}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    Comprador
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {compra.sucursal_nombre || "POS System"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.7}>
                    {compra.sucursal_direccion && <Campo label="Direccion" value={compra.sucursal_direccion} />}
                    {compra.sucursal_telefono && <Campo label="Telefono" value={compra.sucursal_telefono} />}
                    {compra.sucursal_correo && <Campo label="Correo" value={compra.sucursal_correo} />}
                    <Campo label="Recibe" value={compra.usuario_nombre || compra.usuario_username} />
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={1.5}>
              <Grid item xs={6} md={3}><Campo label="Fecha" value={formatFechaLarga(compra.fecha || compra.fecha_compra)} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Moneda" value={compra.moneda || "GTQ"} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Termino" value={terminoPago} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Dias credito" value={diasCredito > 0 ? `Credito ${diasCredito} dias` : "Contado"} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Fecha limite pago" value={formatFechaLarga(compra.fecha_limite_pago)} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Documento" value={compra.no_documento || "-"} /></Grid>
              <Grid item xs={6} md={3}><Campo label="Tipo" value={compra.tipo_documento || "FACTURA"} /></Grid>
            </Grid>

            <Box sx={{ border: "1px solid", borderColor: "text.primary", borderRadius: 1, overflow: "hidden" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Descripcion", "Cant.", "P/U sin IVA", "P/U con IVA", "Subtotal", "Total"].map((h) => (
                      <Box
                        key={h}
                        component="th"
                        sx={{
                          bgcolor: "text.primary",
                          color: "background.paper",
                          p: 1,
                          textAlign: h === "Descripcion" ? "left" : "right",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 ? (
                    <tr>
                      <Box component="td" colSpan={6} sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                        Sin productos
                      </Box>
                    </tr>
                  ) : (
                    filas.map(({ d, cantidad, precioSinIva, precioConIva, subtotal, total }) => (
                      <tr key={d.id_detalle_compra}>
                        <Box component="td" sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
                          <Typography variant="body2" fontWeight={600}>{d.producto_nombre}</Typography>
                          {d.codigo_barras && (
                            <Typography variant="caption" color="text.secondary">
                              Codigo: {d.codigo_barras}
                            </Typography>
                          )}
                        </Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right", borderBottom: 1, borderColor: "divider" }}>{cantidad}</Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right", borderBottom: 1, borderColor: "divider" }}>{formatPrintCurrency(precioSinIva)}</Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right", borderBottom: 1, borderColor: "divider" }}>{formatPrintCurrency(precioConIva)}</Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right", borderBottom: 1, borderColor: "divider" }}>{formatPrintCurrency(subtotal)}</Box>
                        <Box component="td" sx={{ p: 1, textAlign: "right", borderBottom: 1, borderColor: "divider" }}>{formatPrintCurrency(total)}</Box>
                      </tr>
                    ))
                  )}
                </tbody>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    Observaciones y condiciones
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                    {compra.observaciones || "Sin observaciones adicionales."}
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    <strong>Condicion de pago: </strong>
                    {diasCredito > 0
                      ? `Credito ${diasCredito} dias. Fecha limite: ${formatFechaLarga(compra.fecha_limite_pago)}.`
                      : "Contado."}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" fontWeight={700}>{formatPrintCurrency(subtotalSinIva)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">IVA ({Math.round(tasaIva * 100)}%)</Typography>
                      <Typography variant="body2" fontWeight={700}>{formatPrintCurrency(totalIva)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ bgcolor: "text.primary", color: "background.paper", p: 1, borderRadius: 1 }}
                    >
                      <Typography variant="subtitle1" fontWeight={800}>TOTAL {compra.moneda || "GTQ"}</Typography>
                      <Typography variant="subtitle1" fontWeight={800}>{formatPrintCurrency(totalFinal)}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={3} mt={0.5}>
              {[
                { titulo: "Elaborado por", nombre: compra.usuario_nombre || compra.usuario_username || "Usuario", cargo: "Compras" },
                { titulo: "Autorizado por", nombre: "Nombre y firma", cargo: "Gerencia / Administracion" },
                { titulo: "Recibido proveedor", nombre: compra.proveedor_nombre_viajero || compra.proveedor_nombre, cargo: "Sello y firma" },
              ].map((f) => (
                <Grid key={f.titulo} item xs={12} md={4}>
                  <Box sx={{ pt: 5, borderTop: "1px solid", borderColor: "text.primary", textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={700}>{f.titulo}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{f.nombre}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{f.cargo}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Stack>
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
          disabled={loading || !compra}
        >
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OrdenCompraModal;
