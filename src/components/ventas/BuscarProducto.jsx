import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import BarcodeCameraDialog from "../ui/BarcodeCameraDialog";

const normalizarResultados = (data) =>
  (Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [])
    .filter((producto) => Number.isInteger(Number(producto?.id_producto)))
    .map((producto) => ({
      ...producto,
      id_producto: Number(producto.id_producto),
      nombre: String(producto.nombre || "Producto sin nombre"),
      codigo_barras: producto.codigo_barras ? String(producto.codigo_barras) : "",
      descripcion: producto.descripcion ? String(producto.descripcion) : "",
      precio_venta: Number(producto.precio_venta || 0),
      precio_compra: Number(producto.precio_compra || 0),
      stock: Number(producto.stock ?? producto.existencia ?? 0),
    }));

function BuscarProducto({ onBuscar, onAgregar, disabled = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [codigo, setCodigo] = useState("");
  const [scanFeedback, setScanFeedback] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const texto = busqueda.trim();
    if (disabled || texto.length < 2) {
      setResultados([]);
      return undefined;
    }

    let cancelado = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await onBuscar({ q: texto });
        if (!cancelado) {
          setResultados(normalizarResultados(data));
        }
      } catch (error) {
        console.error(error);
        if (!cancelado) {
          setResultados([]);
          setScanFeedback({
            severity: "error",
            message: error.response?.data?.error || "No se pudo buscar productos.",
          });
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelado = true;
      window.clearTimeout(timeoutId);
    };
  }, [busqueda, disabled, onBuscar]);

  const handleScannedCode = async (rawValue) => {
    const codigoEscaneado = String(rawValue || "").trim();
    if (!codigoEscaneado) return false;

    setCodigo(codigoEscaneado);

    try {
      setLoading(true);
      const data = await onBuscar({ codigo: codigoEscaneado });
      const [encontrado] = normalizarResultados(data);

      if (encontrado && Number(encontrado.stock || 0) > 0) {
        setScanFeedback(null);
        onAgregar(encontrado);
        setCodigo("");
        return true;
      }

      if (encontrado) {
        setScanFeedback({
          severity: "warning",
          message: `El producto ${encontrado.nombre} esta sin stock.`,
        });
        return true;
      }

      setScanFeedback({
        severity: "warning",
        message: `No se encontro un producto con el codigo ${codigoEscaneado}.`,
      });
      return true;
    } catch (error) {
      console.error(error);
      setScanFeedback({
        severity: "error",
        message: error.response?.data?.error || "No se pudo buscar el codigo escaneado.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleEscanear = (event) => {
    if (event.key !== "Enter") return;
    handleScannedCode(codigo);
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Escanear codigo"
          placeholder="Escanea o escribe el codigo de barras"
          value={codigo}
          onChange={(event) => {
            setCodigo(event.target.value);
            if (scanFeedback) {
              setScanFeedback(null);
            }
          }}
          onKeyDown={disabled ? undefined : handleEscanear}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <QrCodeScannerIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setScanFeedback(null);
                    setScannerOpen(true);
                  }}
                  disabled={disabled}
                  edge="end"
                  color="primary"
                >
                  <CameraAltIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="Presiona Enter con el lector manual o usa la camara del dispositivo."
        />

        <TextField
          fullWidth
          label="Buscar producto"
          placeholder="Buscar por nombre, codigo o descripcion"
          value={busqueda}
          onChange={(event) => {
            setBusqueda(event.target.value);
            if (scanFeedback) {
              setScanFeedback(null);
            }
          }}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {scanFeedback?.message ? (
          <Alert severity={scanFeedback.severity || "info"}>
            {scanFeedback.message}
          </Alert>
        ) : null}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {busqueda.trim().length < 2
            ? "Escanea un codigo o escribe al menos 2 caracteres para buscar."
            : loading
              ? "Buscando productos..."
              : `${resultados.length} producto(s) encontrados`}
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            maxHeight: 520,
            overflowY: "auto",
          }}
        >
          {busqueda.trim().length < 2 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                No hay productos para mostrar todavia.
              </Typography>
            </Box>
          ) : resultados.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                {loading ? "Buscando..." : "No se encontraron productos."}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {resultados.map((producto, index) => {
                const stock = Number(producto.stock ?? 0);
                const sinStock = stock <= 0;

                return (
                  <Box key={producto.id_producto}>
                    <ListItemButton
                      onClick={() => !disabled && !sinStock && onAgregar(producto)}
                      disabled={disabled || sinStock}
                      sx={{
                        py: 1.8,
                        px: 2,
                        alignItems: "flex-start",
                        opacity: sinStock ? 0.65 : 1,
                        cursor: disabled || sinStock ? "default" : "pointer",
                        transition: "transform 180ms ease, background-color 180ms ease",
                        "&:hover":
                          disabled || sinStock
                            ? undefined
                            : {
                                transform: "translateY(-1px)",
                                backgroundColor: "action.hover",
                              },
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
                            <Typography fontWeight={700} sx={{ fontSize: "1rem" }}>
                              {producto.nombre}
                            </Typography>
                          </Stack>

                          <ListItemText
                            primary={null}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Codigo: {producto.codigo_barras || "Sin codigo"}
                                </Typography>
                                {producto.descripcion ? (
                                  <>
                                    <br />
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Descripcion: {producto.descripcion}
                                    </Typography>
                                  </>
                                ) : null}
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Q {Number(producto.precio_venta || 0).toFixed(2)}
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
                            {sinStock ? "No disponible" : "Toca para agregar"}
                          </Typography>
                        </Stack>
                      </Box>
                    </ListItemButton>

                    {index < resultados.length - 1 ? <Divider /> : null}
                  </Box>
                );
              })}
            </List>
          )}
        </Paper>
      </Box>

      <BarcodeCameraDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleScannedCode}
        title="Escanear con camara"
        description="Apunta la camara al codigo de barras del producto. El sistema agregara el producto automaticamente cuando lo detecte."
      />
    </Box>
  );
}

export default BuscarProducto;
