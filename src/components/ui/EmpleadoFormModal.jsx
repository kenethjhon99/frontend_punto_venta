import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

const tipoPagoPorCargo = {
  CARWASH: "SEMANAL",
  VENDEDOR: "MENSUAL",
};

const initialState = {
  nombre: "",
  cargo: "CARWASH",
};

const buildFormState = (empleadoEditando) => {
  if (!empleadoEditando) {
    return initialState;
  }

  const cargo = empleadoEditando.cargo || "CARWASH";

  return {
    nombre: empleadoEditando.nombre || "",
    cargo,
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({ ...prev, [name]: value }));
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
