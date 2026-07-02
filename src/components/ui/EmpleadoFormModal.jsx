import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

const tipoPagoPorCargo = {
  CARWASH: "SEMANAL",
  VENDEDOR: "MENSUAL",
  REPARTIDOR: "SEMANAL",
  RUTERO: "SEMANAL",
  CAJERA: "MENSUAL",
  ADMINISTRATIVO: "MENSUAL",
};

const initialState = {
  nombre: "",
  cargo: "CARWASH",
  puede_repartir: false,
  estado_operativo: "DISPONIBLE",
};

const buildFormState = (empleadoEditando) => {
  if (!empleadoEditando) {
    return initialState;
  }

  const cargo = empleadoEditando.cargo || "CARWASH";

  return {
    nombre: empleadoEditando.nombre || "",
    cargo,
    puede_repartir: Boolean(empleadoEditando.puede_repartir),
    estado_operativo: empleadoEditando.estado_operativo || "DISPONIBLE",
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setForm(buildFormState(empleadoEditando));
  }, [open, empleadoEditando]);

  const tipoPago = useMemo(() => {
    return tipoPagoPorCargo[form.cargo] || "";
  }, [form.cargo]);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      const next = { ...prev, [name]: nextValue };

      if (name === "cargo" && (value === "REPARTIDOR" || value === "RUTERO")) {
        next.puede_repartir = true;
      }

      return next;
    });
  };

  const handleClose = () => {
    if (loading) return;
    setForm(initialState);
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      nombre: form.nombre.trim(),
      cargo: form.cargo,
      tipo_pago: tipoPago,
      puede_repartir: form.puede_repartir,
      estado_operativo: form.estado_operativo,
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
              <MenuItem value="REPARTIDOR">REPARTIDOR</MenuItem>
              <MenuItem value="RUTERO">RUTERO</MenuItem>
              <MenuItem value="CAJERA">CAJERA</MenuItem>
              <MenuItem value="ADMINISTRATIVO">ADMINISTRATIVO</MenuItem>
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
                  : tipoPago === "SEMANAL"
                    ? "Este cargo se paga semanalmente."
                    : "Este cargo se paga mensualmente."
              }
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              required
              label="Estado operativo"
              name="estado_operativo"
              value={form.estado_operativo}
              onChange={handleChange}
            >
              <MenuItem value="DISPONIBLE">DISPONIBLE</MenuItem>
              <MenuItem value="EN_REPARTO">EN_REPARTO</MenuItem>
              <MenuItem value="EN_RUTA">EN_RUTA</MenuItem>
              <MenuItem value="EN_CARWASH">EN_CARWASH</MenuItem>
              <MenuItem value="DESCANSO">DESCANSO</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  name="puede_repartir"
                  checked={form.puede_repartir}
                  onChange={handleChange}
                />
              }
              label="Puede repartir en ZGAS"
            />
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
