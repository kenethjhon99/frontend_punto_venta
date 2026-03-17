import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";

const initialState = {
  codigo_barras: "",
  nombre: "",
  descripcion: "",
  precio_compra: "",
  precio_venta: "",
  existencia_inicial: "",
  stock_minimo: "",
  ubicacion: "",
};

function ProductoFormModal({
  open,
  onClose,
  onSave,
  productoEditando,
  loading,
}) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (productoEditando) {
      setForm({
        codigo_barras: productoEditando.codigo_barras || "",
        nombre: productoEditando.nombre || "",
        descripcion: productoEditando.descripcion || "",
        precio_compra: productoEditando.precio_compra || "",
        precio_venta: productoEditando.precio_venta || "",
        existencia_inicial: productoEditando.stock ?? 0,
        stock_minimo: productoEditando.stock_minimo ?? 0,
        ubicacion: productoEditando.ubicacion || "",
      });
    } else {
      setForm(initialState);
    }
  }, [productoEditando, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      codigo_barras: form.codigo_barras,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      existencia_inicial: Number(form.existencia_inicial || 0),
      stock_minimo: Number(form.stock_minimo || 0),
      ubicacion: form.ubicacion || null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {productoEditando ? "Editar producto" : "Nuevo producto"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Código de barras"
              name="codigo_barras"
              value={form.codigo_barras}
              onChange={handleChange}
              fullWidth
              placeholder="Ej. 7501234567890"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Precio compra"
              name="precio_compra"
              type="number"
              value={form.precio_compra}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: "0.01" }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Precio venta"
              name="precio_venta"
              type="number"
              value={form.precio_venta}
              onChange={handleChange}
              fullWidth
              inputProps={{ step: "0.01" }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={productoEditando ? "Stock" : "Stock inicial"}
              name="existencia_inicial"
              type="number"
              value={form.existencia_inicial}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Stock mínimo"
              name="stock_minimo"
              type="number"
              value={form.stock_minimo}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ubicación"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              fullWidth
              placeholder="Ej. Estante A-1"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : productoEditando ? (
            "Actualizar"
          ) : (
            "Guardar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductoFormModal;