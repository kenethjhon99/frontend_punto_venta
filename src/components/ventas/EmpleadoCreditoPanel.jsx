import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { getEmpleados } from "../../services/empleadoService";
import { getNominaProxima } from "../../services/creditoEmpleadoService";
import {
  calcularFechaCobro,
  etiquetaDiaPago,
  formatFechaCobro,
} from "../../utils/fechaCobro";

const formatQ = (n) => `Q ${Number(n || 0).toFixed(2)}`;

function EmpleadoCreditoPanel({
  empleadoId,
  onEmpleadoChange,
  observacion,
  onObservacionChange,
  totalVenta,
  disabled = false,
}) {
  const [empleados, setEmpleados] = useState([]);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [nomina, setNomina] = useState([]);
  const [loadingNomina, setLoadingNomina] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        setLoadingEmpleados(true);
        const resp = await getEmpleados({ incluirInactivos: false });
        if (cancelado) return;
        const data = Array.isArray(resp?.data) ? resp.data : [];
        setEmpleados(data.filter((e) => e.activo));
      } catch (err) {
        if (cancelado) return;
        setLoadError(
          err.response?.data?.error || "No se pudieron cargar los empleados"
        );
      } finally {
        if (!cancelado) setLoadingEmpleados(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        setLoadingNomina(true);
        const resp = await getNominaProxima();
        if (cancelado) return;
        setNomina(Array.isArray(resp?.data) ? resp.data : []);
      } catch (err) {
        if (cancelado) return;
        // no bloquea: el panel funciona sin nómina (queda con 0s)
        console.error("Error cargando nomina-proxima", err);
      } finally {
        if (!cancelado) setLoadingNomina(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const empleadoSeleccionado = useMemo(
    () => empleados.find((e) => e.id_empleado === Number(empleadoId)) || null,
    [empleados, empleadoId]
  );

  const datosNomina = useMemo(
    () =>
      nomina.find((n) => n.id_empleado === Number(empleadoId)) || null,
    [nomina, empleadoId]
  );

  const fechaCobro = useMemo(
    () => calcularFechaCobro(empleadoSeleccionado),
    [empleadoSeleccionado]
  );

  const sueldo = Number(empleadoSeleccionado?.sueldo ?? datosNomina?.sueldo ?? 0);
  const creditosPrevios = Number(datosNomina?.total_creditos_pendientes ?? 0);
  const numCreditosPrevios = Number(datosNomina?.num_creditos_pendientes ?? 0);
  const esteCredito = Number(totalVenta || 0);
  const netoEstimado = sueldo - creditosPrevios - esteCredito;
  const netoRojo = netoEstimado < 0;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <BadgeOutlinedIcon color="warning" />
        <Typography variant="subtitle1" fontWeight={700}>
          Crédito a empleado
        </Typography>
      </Stack>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <Autocomplete
        options={empleados}
        loading={loadingEmpleados}
        disabled={disabled || loadingEmpleados}
        value={empleadoSeleccionado}
        onChange={(_e, value) =>
          onEmpleadoChange(value ? value.id_empleado : null)
        }
        getOptionLabel={(opt) =>
          opt ? `${opt.nombre} (${opt.cargo})` : ""
        }
        isOptionEqualToValue={(opt, val) =>
          opt?.id_empleado === val?.id_empleado
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Empleado"
            placeholder="Selecciona empleado..."
            required
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingEmpleados ? (
                    <CircularProgress size={18} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        sx={{ mb: 2 }}
      />

      {empleadoSeleccionado && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: netoRojo ? "error.light" : "divider",
            borderRadius: 2,
            p: 2,
            backgroundColor: netoRojo
              ? "rgba(239,68,68,0.04)"
              : "action.hover",
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
            <Chip
              size="small"
              label={empleadoSeleccionado.cargo}
              color={
                empleadoSeleccionado.cargo === "CARWASH" ? "info" : "secondary"
              }
            />
            <Chip
              size="small"
              label={empleadoSeleccionado.tipo_pago}
              variant="outlined"
            />
            <Chip
              size="small"
              label={etiquetaDiaPago(empleadoSeleccionado)}
              variant="outlined"
              icon={<AccessTimeIcon fontSize="small" />}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Row label="Sueldo" value={formatQ(sueldo)} />
            <Row
              label={`Créditos previos${
                numCreditosPrevios > 0 ? ` (${numCreditosPrevios})` : ""
              }`}
              value={
                loadingNomina ? "Calculando..." : `- ${formatQ(creditosPrevios)}`
              }
              muted={creditosPrevios === 0}
            />
            <Row label="Este crédito" value={`- ${formatQ(esteCredito)}`} />
            <Divider sx={{ my: 1 }} />
            <Row
              label="Neto estimado a pagar"
              value={formatQ(netoEstimado)}
              bold
              color={netoRojo ? "error.main" : "success.main"}
            />
            <Row
              label="Próximo pago"
              value={formatFechaCobro(fechaCobro)}
              icon={<PaidOutlinedIcon fontSize="small" />}
            />
          </Stack>

          {netoRojo && (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon />}
              sx={{ mt: 1.5 }}
            >
              El empleado quedaría con saldo negativo. Esta venta se registra
              igual, pero considerá condonar créditos previos o usar otro
              método de pago.
            </Alert>
          )}

          {sueldo === 0 && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              El sueldo del empleado está en Q 0.00. Editá al empleado desde
              el módulo de Empleados para definirlo.
            </Alert>
          )}
        </Box>
      )}

      <TextField
        fullWidth
        multiline
        minRows={2}
        label="Observación (opcional)"
        placeholder="Motivo del crédito, concepto, etc."
        value={observacion || ""}
        onChange={(e) => onObservacionChange(e.target.value.slice(0, 250))}
        disabled={disabled}
        sx={{ mt: 2 }}
        helperText={`${(observacion || "").length} / 250 caracteres`}
      />

      <Alert severity="info" sx={{ mt: 2 }}>
        Esta venta NO se cobra hoy. Queda registrada como crédito y se
        descontará del próximo pago del empleado.
      </Alert>
    </Box>
  );
}

function Row({ label, value, bold, muted, color, icon }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={0.5} alignItems="center">
        {icon}
        <Typography
          variant="body2"
          color={muted ? "text.disabled" : "text.secondary"}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        fontWeight={bold ? 800 : 600}
        sx={{ color: color || "inherit" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default EmpleadoCreditoPanel;
