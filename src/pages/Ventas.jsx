import { useEffect, useMemo, useState } from "react";
import BuscarProducto from "../components/ventas/BuscarProducto";
import VentaTable from "../components/ventas/VentaTable";
import { getProductos } from "../services/productoService";
import { crearVenta } from "../services/ventaService";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  Divider,
  Stack,
  Alert,
  Container,
} from "@mui/material";

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [tipoVenta, setTipoVenta] = useState("CONTADO");
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    try {
      setLoadingProductos(true);
      setError("");
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const agregarProducto = (producto, cantidadAgregar = 1) => {
    const stock = Number(producto.stock || 0);
    const cantidad = Number(cantidadAgregar);

    if (stock <= 0) return;
    if (!Number.isInteger(cantidad) || cantidad < 1) return;
    if (cantidad > stock) return;

    setItems((prev) => {
      const existe = prev.find((i) => i.id_producto === producto.id_producto);

      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (nuevaCantidad > stock) return prev;

        return prev.map((i) =>
          i.id_producto === producto.id_producto
            ? { ...i, cantidad: nuevaCantidad }
            : i
        );
      }

      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          precio_venta: Number(producto.precio_venta),
          cantidad,
          stock,
        },
      ];
    });
  };

  const cambiarCantidad = (id, cantidad) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id_producto !== id) return item;
        if (cantidad < 1 || cantidad > item.stock) return item;
        return { ...item, cantidad };
      })
    );
  };

  const eliminarItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id));
  };

  const total = useMemo(() => {
    return items.reduce((acc, i) => acc + i.precio_venta * i.cantidad, 0);
  }, [items]);

  const finalizarVenta = async () => {
    if (!items.length) return;

    try {
      setLoadingVenta(true);

      await crearVenta({
        tipo_venta: tipoVenta,
        metodo_pago: metodoPago,
        id_sucursal: 1,
        items: items.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
        })),
      });

      setItems([]);
      await cargarProductos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo registrar la venta");
    } finally {
      setLoadingVenta(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Punto de venta
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Registra ventas rápidas y controla existencias desde una sola pantalla
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Buscar productos
              </Typography>

              <BuscarProducto
                productos={productos}
                onAgregar={agregarProducto}
                loading={loadingProductos}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Carrito de venta
                </Typography>

                <VentaTable
                  items={items}
                  onCambiarCantidad={cambiarCantidad}
                  onEliminar={eliminarItem}
                />
              </Paper>

              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Resumen de pago
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Tipo de venta
                    </Typography>
                    <Select
                      fullWidth
                      value={tipoVenta}
                      onChange={(e) => setTipoVenta(e.target.value)}
                    >
                      <MenuItem value="CONTADO">CONTADO</MenuItem>
                      <MenuItem value="CREDITO">CRÉDITO</MenuItem>
                    </Select>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Método de pago
                    </Typography>
                    <Select
                      fullWidth
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    >
                      <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                      <MenuItem value="TARJETA">TARJETA</MenuItem>
                      <MenuItem value="TRANSFERENCIA">TRANSFERENCIA</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { xs: "stretch", md: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total a pagar
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      Q {total.toFixed(2)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={finalizarVenta}
                    disabled={!items.length || loadingVenta}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: "bold",
                      minWidth: 220,
                    }}
                  >
                    {loadingVenta ? "Procesando..." : "Finalizar venta"}
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Ventas;