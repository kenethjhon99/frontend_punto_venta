import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Chip,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Inventory2Icon from "@mui/icons-material/Inventory2";

function BuscarProducto({ productos, onAgregar }) {
  const [busqueda, setBusqueda] = useState("");
  const [codigo, setCodigo] = useState("");

  const filtrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return productos;

    return productos.filter((p) => {
      return (
        String(p.nombre || "").toLowerCase().includes(texto) ||
        String(p.codigo_barras || "").toLowerCase().includes(texto) ||
        String(p.descripcion || "").toLowerCase().includes(texto)
      );
    });
  }, [productos, busqueda]);

  const handleEscanear = (e) => {
    if (e.key === "Enter") {
      const encontrado = productos.find(
        (p) => String(p.codigo_barras || "") === codigo.trim()
      );

      if (encontrado) {
        onAgregar(encontrado);
        setCodigo("");
      }
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Escanear código"
          placeholder="Escanea o escribe el código de barras"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={handleEscanear}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QrCodeScannerIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Buscar producto"
          placeholder="Buscar por nombre, código o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {filtrados.length} producto(s) encontrados
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            maxHeight: 520,
            overflowY: "auto",
          }}
        >
          {filtrados.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                No se encontraron productos.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {filtrados.map((p, index) => {
                const stock = Number(p.stock ?? 0);
                const sinStock = stock <= 0;

                return (
                  <Box key={p.id_producto}>
                    <ListItemButton
                      onClick={() => !sinStock && onAgregar(p)}
                      disabled={sinStock}
                      sx={{
                        py: 1.8,
                        px: 2,
                        alignItems: "flex-start",
                        opacity: sinStock ? 0.65 : 1,
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
                          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                            <Inventory2Icon fontSize="small" color="action" />
                            <Typography fontWeight={600}>{p.nombre}</Typography>
                          </Stack>

                          <ListItemText
                            primary={null}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Código: {p.codigo_barras || "Sin código"}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Q {Number(p.precio_venta || 0).toFixed(2)}
                                </Typography>
                              </>
                            }
                          />
                        </Box>

                        <Stack spacing={1} alignItems="flex-end">
                          <Chip
                            label={sinStock ? "Sin stock" : `Stock: ${stock}`}
                            color={sinStock ? "default" : stock <= 5 ? "warning" : "primary"}
                            size="small"
                          />

                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: sinStock ? "text.disabled" : "success.main",
                            }}
                          >
                            {sinStock ? "No disponible" : "Agregar"}
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

export default BuscarProducto;