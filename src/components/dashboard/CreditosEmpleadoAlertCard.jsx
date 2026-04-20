import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
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
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getSectionPanelSx } from "../../utils/summaryCardStyles";
import { useCreditoEmpleadoAlertas } from "../../hooks/useCreditoEmpleadoAlertas";

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

const formatFecha = (raw) => {
  if (!raw) return "-";
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "short",
  });
};

const criticidadColor = {
  VENCIDO: "error",
  HOY: "warning",
  PROXIMO: "info",
  FUTURO: "default",
};

const criticidadLabel = {
  VENCIDO: "Vencido",
  HOY: "Hoy",
  PROXIMO: "Proximo",
  FUTURO: "Futuro",
};

function CreditosEmpleadoAlertCard() {
  const { resumen, top, loading, error, puedeVer } = useCreditoEmpleadoAlertas();

  if (!puedeVer) return null;

  const vencidos = Number(resumen?.vencidos || 0);
  const porVencer = Number(resumen?.por_vencer || 0);
  const saldoTotal = Number(resumen?.saldo_total_pendiente || 0);
  const noHayCreditos =
    !loading && vencidos === 0 && porVencer === 0 && (!top || top.length === 0);

  const accent =
    vencidos > 0 ? "error" : porVencer > 0 ? "warning" : "info";

  return (
    <Paper
      elevation={2}
      sx={(theme) =>
        getSectionPanelSx(theme, { p: 3, radius: 3, accent })
      }
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
        mb={2}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <PaidOutlinedIcon color="warning" />
          <Box>
            <Typography variant="h6" fontWeight="bold" lineHeight={1.1}>
              Creditos a empleados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alertas de creditos por cobrar en el proximo pago.
            </Typography>
          </Box>
        </Stack>

        <Button
          component={RouterLink}
          to="/creditos-empleado"
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon fontSize="small" />}
        >
          Ver todos
        </Button>
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        mb={2}
      >
        <Chip
          size="small"
          color="error"
          variant={vencidos > 0 ? "filled" : "outlined"}
          icon={<WarningAmberIcon fontSize="small" />}
          label={`Vencidos: ${vencidos}`}
        />
        <Chip
          size="small"
          color="warning"
          variant={porVencer > 0 ? "filled" : "outlined"}
          label={`Por vencer (3 dias): ${porVencer}`}
        />
        <Chip
          size="small"
          color="default"
          variant="outlined"
          label={`Saldo total: ${formatQ(saldoTotal)}`}
        />
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      {loading && (!top || top.length === 0) ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : noHayCreditos ? (
        <Alert severity="success" variant="outlined">
          No hay creditos a empleados pendientes.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Empleado</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell>Cobro</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(top || []).slice(0, 5).map((c) => (
                <TableRow key={c.id_credito_empleado} hover>
                  <TableCell>{c.empleado_nombre || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={c.empleado_cargo || c.cargo || "-"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      fontWeight={700}
                      color={
                        Number(c.saldo_pendiente || 0) > 0
                          ? "warning.main"
                          : "text.secondary"
                      }
                    >
                      {formatQ(c.saldo_pendiente)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatFecha(c.fecha_cobro_estimada)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={criticidadColor[c.criticidad] || "default"}
                      label={criticidadLabel[c.criticidad] || c.criticidad || "-"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default CreditosEmpleadoAlertCard;
