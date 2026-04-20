import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  DIAS_MES,
  DIAS_SEMANA,
  etiquetaDiaPago,
} from "../../utils/fechaCobro";

const tipoPagoPorCargo = {
  CARWASH: "SEMANAL",
  VENDEDOR: "MENSUAL",
};

// Defaults coherentes con la migracion:
//   SEMANAL -> viernes (5)
//   MENSUAL -> ultimo dia del mes (0)
const diaPagoPorCargo = {
  CARWASH: 5,
  VENDEDOR: 0,
};

const initialState = {
  nombre: "",
  cargo: "CARWASH",
  sueldo: "",
  dia_pago: String(diaPagoPorCargo.CARWASH),
};

const buildFormState = (empleadoEditando) => {
  if (!empleadoEditando) {
    return initialState;
  }

  const cargo = empleadoEditando.cargo || "CARWASH";
  const diaPagoRaw =
    empleadoEditando.dia_pago != null
      ? empleadoEditando.dia_pago
      : diaPagoPorCargo[cargo] ?? 0;

  return {
    nombre: empleadoEditando.nombre || "",
    cargo,
    sueldo:
      empleadoEditando.sueldo != null
        ? String(empleadoEditando.sueldo)
        : "",
    dia_pago: String(diaPagoRaw),
  };
};

function EmpleadoFormModal({
  open,
  onClose,
  onSave,
  loading,
  empleadoEditando = null,
}) {
  const [form, setForm] = useState(() => buildFormState(empleadoEditando));

  // Re-sincronizar si cambia empleadoEditando al abrir el modal
  useEffect(() => {
    if (open) setForm(buildFormState(empleadoEditando));
  }, [open, empleadoEditando]);

  const tipoPago = useMemo(() => {
    return tipoPagoPorCargo[form.cargo] || "";
  }, [form.cargo]);

  const opcionesDiaPago = useMemo(() => {
    if (tipoPago === "SEMANAL") return DIAS_SEMANA;
    if (tipoPago === "MENSUAL") return DIAS_MES;
    return [];
  }, [tipoPago]);

  const previewDiaPago = useMemo(() => {
    if (form.dia_pago === "" || form.dia_pago == null) return "-";
    return etiquetaDiaPago({
      tipo_pago: tipoPago,
      dia_pago: Number(form.dia_pago),
    });
  }, [form.dia_pago, tipoPago]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "cargo") {
        // Al cambiar cargo reseteamos dia_pago al default del nuevo tipo
        const nextDefault = diaPagoPorCargo[value] ?? 0;
        return {
          ...prev,
          cargo: value,
          dia_pago: String(nextDefault),
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleClose = () => {
    if (loading) return;
    setForm(initialState);
    onClose();
  };

  const sueldoNumero = useMemo(() => {
    const n = Number(form.sueldo);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [form.sueldo]);

  const sueldoInvalido = useMemo(() => {
    if (form.sueldo === "") return false;
    const n = Number(form.sueldo);
    return !Number.isFinite(n) || n < 0;
  }, [form.sueldo]);

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      nombre: form.nombre.trim(),
      cargo: form.cargo,
      tipo_pago: tipoPago,
      sueldo: sueldoNumero,
      dia_pago: Number(form.dia_pago),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {empleadoEditando ? "Editar empleado" : "Nuevo empleado"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre del empleado"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              required
              label="Cargo"
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
            >
              <MenuItem value="CARWASH">CARWASH</MenuItem>
              <MenuItem value="VENDEDOR">VENDEDOR</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tipo de pago"
              value={tipoPago}
              InputProps={{ readOnly: true }}
              helperText={
                form.cargo === "CARWASH"
                  ? "Los empleados de carwash se pagan semanalmente."
                  : "Los vendedores se pagan mensualmente."
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              type="number"
              label="Sueldo"
              name="sueldo"
              value={form.sueldo}
              onChange={handleChange}
              inputProps={{ min: 0, step: "0.01" }}
              InputProps={{
                startAdornment: <InputAdornment position="start">Q</InputAdornment>,
              }}
              error={sueldoInvalido}
              helperText={
                sueldoInvalido
                  ? "El sueldo debe ser un numero mayor o igual a 0."
                  : tipoPago === "SEMANAL"
                    ? "Monto que se paga cada semana."
                    : "Monto que se paga cada mes."
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              required
              label={
                tipoPago === "SEMANAL"
                  ? "Dia de pago (semana)"
                  : "Dia de pago (mes)"
              }
              name="dia_pago"
              value={form.dia_pago}
              onChange={handleChange}
              helperText={
                tipoPago === "SEMANAL"
                  ? `Proximo cobro estimado: ${previewDiaPago}`
                  : `Proximo cobro estimado: ${previewDiaPago}`
              }
            >
              {opcionesDiaPago.map((opcion) => (
                <MenuItem key={opcion.valor} value={String(opcion.valor)}>
                  {opcion.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : empleadoEditando ? (
            "Actualizar empleado"
          ) : (
            "Guardar empleado"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmpleadoFormModal;
