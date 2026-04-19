import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const initialState = {
  nombre: "",
  telefono: "",
  nit: "",
  correo: "",
  direccion: "",
};

const buildFormState = (proveedorEditando) => {
  if (!proveedorEditando) {
    return initialState;
  }

  return {
    nombre:
      proveedorEditando.nombre_empresa || proveedorEditando.nombre || "",
    telefono:
      proveedorEditando.telefono_empresa || proveedorEditando.telefono || "",
    nit: proveedorEditando.nit || "",
    correo: proveedorEditando.correo || "",
    direccion: proveedorEditando.direccion || "",
  };
};

function ProveedorFormModal({
  open,
  onClose,
  onSave,
  loading,
  proveedorEditando = null,
}) {
  const [form, setForm] = useState(() => buildFormState(proveedorEditando));

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      telefono: form.telefono.trim(),
      nit: form.nit.trim(),
      correo: form.correo.trim(),
      direccion: form.direccion.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {proveedorEditando ? "Editar proveedor" : "Nuevo proveedor"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Datos del proveedor
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Distribuidora Central"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="Ej. 2222-3333"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="NIT"
              name="nit"
              value={form.nit}
              onChange={handleChange}
              placeholder="CF o 1234567-8"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="proveedor@correo.com"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              placeholder="Zona, calle o referencia"
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
          ) : proveedorEditando ? (
            "Actualizar proveedor"
          ) : (
            "Guardar proveedor"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProveedorFormModal;
