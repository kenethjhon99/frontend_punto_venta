import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SearchIcon from "@mui/icons-material/Search";

function BuscarProductoCompra({ productos, onAgregar, loading }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return productos;

    return productos.filter((producto) => {
      return (
        String(producto.nombre || "").toLowerCase().includes(texto) ||
        String(producto.codigo_barras || "").toLowerCase().includes(texto) ||
        String(producto.descripcion || "").toLowerCase().includes(texto)
      );
    });
  }, [productos, busqueda]);

  return (
    <Box>
      <TextField
        fullWidth
        label="Buscar producto"
        placeholder="Busca por nombre, codigo o descripcion"
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {loading
            ? "Cargando productos..."
            : `${filtrados.length} producto(s) disponibles`}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            maxHeight: 520,
            overflowY: "auto",
          }}
        >
          {!loading && filtrados.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                No se encontraron productos.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filtrados.map((producto, index) => {
                const stock = Number(producto.stock ?? 0);
                const costoBase = Number(
                  producto.precio_compra ??
                    producto.costo ??
                    producto.precio_venta ??
                    0
                );

                return (
                  <Box key={producto.id_producto}>
                    <ListItemButton
                      onClick={() => onAgregar(producto)}
                      sx={{
                        py: 1.8,
                        px: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mb={0.5}
                          >
                            <Inventory2Icon fontSize="small" color="action" />
                            <Typography fontWeight={600}>
                              {producto.nombre}
                            </Typography>
                          </Stack>

                          <ListItemText
                            primary={null}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Codigo: {producto.codigo_barras || "Sin codigo"}
                                </Typography>
                                <br />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Costo sugerido: Q {costoBase.toFixed(2)}
                                </Typography>
                              </>
                            }
                          />
                        </Box>

                        <Stack spacing={1} alignItems="flex-end">
                          <Chip
                            label={`Stock actual: ${stock}`}
                            color={stock <= 5 ? "warning" : "primary"}
                            size="small"
                            variant="outlined"
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: "success.main",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <AddShoppingCartIcon sx={{ fontSize: 16 }} />
                            Agregar
                          </Typography>
                        </Stack>
                      </Box>
                    </ListItemButton>

                    {index < filtrados.length - 1 && <Divider />}
                  </Box>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default BuscarProductoCompra;
