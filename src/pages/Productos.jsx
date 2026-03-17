import { useEffect, useMemo, useState } from "react";
import ProductoFormModal from "../components/productos/ProductoFormModal";
import ProductoTable from "../components/productos/ProductoTable";

import {
  getProductos,
  crearProducto,
  editarProducto,
  desactivarProducto,
} from "../services/productoService";

import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import Inventory2Icon from "@mui/icons-material/Inventory2";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(true);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    try {
      setLoadingLista(true);
      setError("");
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los productos");
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return productos.filter((p) => {
      return (
        String(p.nombre || "").toLowerCase().includes(texto) ||
        String(p.descripcion || "").toLowerCase().includes(texto) ||
        String(p.codigo_barras || "").toLowerCase().includes(texto)
      );
    });
  }, [productos, busqueda]);

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setProductoEditando(null);
  };

  const guardarProducto = async (formData) => {
    try {
      setLoading(true);

      if (productoEditando) {
        await editarProducto(productoEditando.id_producto, formData);
      } else {
        await crearProducto(formData);
      }

      await cargarProductos();
      cerrarModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (producto) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id_producto);
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo desactivar el producto");
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
            <Inventory2Icon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Productos
            </Typography>
          </Stack>

          <Typography variant="body1" color="text.secondary">
            Administra el catálogo de productos de tu punto de venta
          </Typography>
        </Box>

        <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={abrirNuevo}
  sx={{
    borderRadius: 2,
    px: 3,
    py: 1.5,
    fontWeight: 600,
    boxShadow: 3,
    width: { xs: "100%", sm: "auto" },
  }}
>
  Nuevo producto
</Button>
      </Stack>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <TextField
          fullWidth
          label="Buscar producto"
          placeholder="Buscar por nombre, descripción o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loadingLista ? (
        <Paper
          elevation={2}
          sx={{
            p: 5,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Cargando productos...
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <ProductoTable
            productos={productosFiltrados}
            onEdit={abrirEditar}
            onDelete={eliminarProducto}
          />
        </Paper>
      )}

      <ProductoFormModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarProducto}
        productoEditando={productoEditando}
        loading={loading}
      />
    </Box>
  );
}

export default Productos;