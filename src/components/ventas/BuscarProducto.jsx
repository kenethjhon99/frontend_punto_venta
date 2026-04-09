import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const BARCODE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "itf",
  "qr_code",
];

function BuscarProducto({ productos, onAgregar, disabled = false }) {
  const [busqueda, setBusqueda] = useState("");
  const [codigo, setCodigo] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const frameRef = useRef(null);
  const scanLockRef = useRef(false);

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

  const stopScanner = useCallback(() => {
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }

    scanLockRef.current = false;
  }, []);

  useEffect(() => {
    const supportsScanner =
      typeof window !== "undefined" &&
      "BarcodeDetector" in window &&
      Boolean(navigator?.mediaDevices?.getUserMedia);

    setScannerSupported(supportsScanner);
  }, []);

  useEffect(() => {
    if (!scannerOpen) {
      stopScanner();
      return undefined;
    }

    if (!scannerSupported) {
      setScannerError(
        "Tu navegador no soporta escaneo por camara en este dispositivo. Puedes seguir usando el lector manual."
      );
      return undefined;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setScannerLoading(true);
        setScannerError("");

        if (!detectorRef.current) {
          const BarcodeDetectorClass = window.BarcodeDetector;
          const supportedFormats =
            typeof BarcodeDetectorClass.getSupportedFormats === "function"
              ? await BarcodeDetectorClass.getSupportedFormats()
              : [];

          const formats = Array.isArray(supportedFormats)
            ? BARCODE_FORMATS.filter((format) => supportedFormats.includes(format))
            : [];

          detectorRef.current =
            formats.length > 0
              ? new BarcodeDetectorClass({ formats })
              : new BarcodeDetectorClass();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const scanFrame = async () => {
          if (!isMounted || !videoRef.current || !detectorRef.current || scanLockRef.current) {
            return;
          }

          try {
            if (videoRef.current.readyState >= 2) {
              const barcodes = await detectorRef.current.detect(videoRef.current);
              const rawValue = String(barcodes?.[0]?.rawValue || "").trim();

              if (rawValue) {
                scanLockRef.current = true;
                setCodigo(rawValue);

                const encontrado = productos.find(
                  (producto) => String(producto.codigo_barras || "").trim() === rawValue
                );

                if (encontrado) {
                  onAgregar(encontrado);
                  setCodigo("");
                  setScannerOpen(false);
                  return;
                }

                setScannerError(
                  `No se encontro un producto con el codigo ${rawValue}. Puedes corregirlo manualmente.`
                );
                setScannerOpen(false);
                return;
              }
            }
          } catch (error) {
            console.error(error);
            setScannerError("No se pudo leer el codigo con la camara.");
            setScannerOpen(false);
            return;
          }

          frameRef.current = window.requestAnimationFrame(scanFrame);
        };

        frameRef.current = window.requestAnimationFrame(scanFrame);
      } catch (error) {
        console.error(error);
        setScannerError(
          error?.name === "NotAllowedError"
            ? "Debes permitir el acceso a la camara para escanear codigos."
            : "No se pudo iniciar la camara del dispositivo."
        );
      } finally {
        if (isMounted) {
          setScannerLoading(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [onAgregar, productos, scannerOpen, scannerSupported, stopScanner]);

  return (
    <Box>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Escanear código"
          placeholder="Escanea o escribe el código de barras"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
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
                    setScannerError("");
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
          placeholder="Buscar por nombre, código o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          disabled={disabled}
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
                      onClick={() => !disabled && !sinStock && onAgregar(p)}
                      disabled={disabled || sinStock}
                      sx={{
                        py: 1.8,
                        px: 2,
                        alignItems: "flex-start",
                        opacity: sinStock ? 0.65 : 1,
                        cursor: disabled || sinStock ? "default" : "pointer",
                        transition: "transform 180ms ease, background-color 180ms ease",
                        "&:hover": disabled || sinStock
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
                            {sinStock ? "No disponible" : "Toca para agregar"}
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

      <Dialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pr: 7 }}>
          Escanear con camara
          <IconButton
            onClick={() => setScannerOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Apunta la camara al codigo de barras del producto. El sistema agregara el producto automaticamente cuando lo detecte.
            </Typography>

            {scannerError && <Alert severity="warning">{scannerError}</Alert>}

            <Box
              sx={{
                position: "relative",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "common.black",
                minHeight: 280,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {scannerLoading && (
                <Stack
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    backgroundColor: "rgba(15,23,42,0.55)",
                  }}
                >
                  <CircularProgress color="inherit" />
                  <Typography variant="body2" color="common.white">
                    Iniciando camara...
                  </Typography>
                </Stack>
              )}

              <Box
                component="video"
                ref={videoRef}
                muted
                playsInline
                autoPlay
                sx={{
                  width: "100%",
                  minHeight: 280,
                  display: "block",
                  objectFit: "cover",
                  backgroundColor: "common.black",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 340,
                    height: 150,
                    borderRadius: 3,
                    border: "2px solid rgba(255,255,255,0.92)",
                    boxShadow: "0 0 0 999px rgba(0,0,0,0.20)",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: 18,
                      right: 18,
                      top: "50%",
                      height: 2,
                      transform: "translateY(-50%)",
                      background:
                        "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,1) 50%, rgba(59,130,246,0) 100%)",
                    },
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setScannerOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BuscarProducto;
