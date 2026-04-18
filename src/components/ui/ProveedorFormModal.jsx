import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

const initialState = {
  nombre_empresa: "",
  telefono_empresa: "",
  nombre_viajero: "",
  telefono_viajero: "",
  nit: "",
  correo: "",
  direccion: "",
};

const buildFormState = (proveedorEditando) => {
  if (!proveedorEditando) {
    return initialState;
  }

  return {
    nombre_empresa:
      proveedorEditando.nombre_empresa || proveedorEditando.nombre || "",
    telefono_empresa:
      proveedorEditando.telefono_empresa || proveedorEditando.telefono || "",
    nombre_viajero: proveedorEditando.nombre_viajero || "",
    telefono_viajero: proveedorEditando.telefono_viajero || "",
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
      nombre_empresa: form.nombre_empresa.trim(),
      telefono_empresa: form.telefono_empresa.trim(),
      nombre_viajero: form.nombre_viajero.trim(),
      telefono_viajero: form.telefono_viajero.trim(),
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
          Datos de la empresa
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              required
              label="Nombre de la empresa"
              name="nombre_empresa"
              value={form.nombre_empresa}
              onChange={handleChange}
              placeholder="Ej. Distribuidora Central, S.A."
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Telefono empresa"
              name="telefono_empresa"
              value={form.telefono_empresa}
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

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
          Datos del viajero (contacto comercial)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Nombre del viajero"
              name="nombre_viajero"
              value={form.nombre_viajero}
              onChange={handleChange}
              placeholder="Ej. Juan Perez"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Telefono viajero"
              name="telefono_viajero"
              value={form.telefono_viajero}
              onChange={handleChange}
              placeholder="Ej. 5555-5555"
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
