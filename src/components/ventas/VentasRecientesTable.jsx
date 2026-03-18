import {
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const formatFecha = (value) => {
  if (!value) return "-";

  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "-";

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(fecha);
};

function VentasRecientesTable({
  ventas = [],
  loading = false,
  onViewDetail,
  onAnular,
  canAnular = false,
}) {
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Cargando ventas recientes...</Typography>
      </Paper>
    );
  }

  if (!ventas.length) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          Aun no hay ventas recientes para mostrar.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Venta</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Cliente</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Pago</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {ventas.map((venta) => {
            const anulada = venta.estado === "ANULADA";

            return (
              <TableRow key={venta.id_venta} hover>
                <TableCell>
                  <Typography fontWeight={700}>#{venta.id_venta}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {venta.tipo_venta || "-"}
                  </Typography>
                </TableCell>

                <TableCell>{formatFecha(venta.fecha)}</TableCell>

                <TableCell>
                  {venta.cliente_nombre ? (
                    <Stack spacing={0.25}>
                      <Typography fontWeight={600}>{venta.cliente_nombre}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {venta.cliente_codigo || "Sin codigo"}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Consumidor final</Typography>
                  )}
                </TableCell>

                <TableCell>{venta.metodo_pago || "-"}</TableCell>

                <TableCell>
                  <Chip
                    label={venta.estado || "PENDIENTE"}
                    color={anulada ? "error" : "success"}
                    size="small"
                    variant={anulada ? "filled" : "outlined"}
                  />
                </TableCell>

                <TableCell>
                  <Typography fontWeight={700}>Q {Number(venta.total || 0).toFixed(2)}</Typography>
                </TableCell>

                <TableCell align="center">
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1}
                    justifyContent="center"
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onViewDetail(venta)}
                    >
                      Ver detalle
                    </Button>

                    {canAnular && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        disabled={anulada}
                        onClick={() => onAnular(venta)}
                      >
                        {anulada ? "Anulada" : "Anular"}
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VentasRecientesTable;
