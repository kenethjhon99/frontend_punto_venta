import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getProductos } from "../services/productoService";
import { getCajaSesionActiva } from "../services/cajaService";
import {
  crearVenta,
  getCatalogoComprobantesVenta,
  getVentaCompleta,
} from "../services/ventaService";
import { getClientes } from "../services/clienteService";
import {
  buildVentaTicketHtml,
  openPrintDocument,
} from "../utils/printDocuments";
import { printTicketWithDrawer } from "../utils/thermalPrinter";
import {
  readPrintPreference,
  writePrintPreference,
} from "../utils/printPreferences";
import { useAuth } from "../hooks/useAuth";
import { isReadOnlyUser, userHasRole } from "../utils/roles";
import NoCobroAuthorizationFields from "../components/ui/NoCobroAuthorizationFields";
import EmpleadoCreditoPanel from "../components/ventas/EmpleadoCreditoPanel";
import BarcodeCameraDialog from "../components/ui/BarcodeCameraDialog";
import {
  calculateDiscountSummary,
  normalizeDiscountPercentage,
} from "../utils/discountUtils";
import {
  getSectionPanelSx,
  getSummaryCardSx,
  getSummaryIconWrapSx,
  getSummaryValueSx,
} from "../utils/summaryCardStyles";

const normalizarComprobantes = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizarClientes = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const EMPTY_NO_COBRO_FORM = {
  enabled: false,
  motivo: "",
};

function ServiciosTienda() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [codigo, setCodigo] = useState("");
  const [scanFeedback, setScanFeedback] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [comprobantes, setComprobantes] = useState([]);
  const [tipoComprobante, setTipoComprobante] = useState("TICKET");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState("0");
  const [noCobroForm, setNoCobroForm] = useState(EMPTY_NO_COBRO_FORM);
  const [modoVenta, setModoVenta] = useState("NORMAL");
  const [empleadoCreditoId, setEmpleadoCreditoId] = useState(null);
  const [observacionCredito, setObservacionCredito] = useState("");
  const [autoPrint, setAutoPrint] = useState(() =>
    readPrintPreference(user, "tienda.autoPrint", true)
  );
  const [cajaActiva, setCajaActiva] = useState(null);
  const [loadingLista, setLoadingLista] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingCaja, setLoadingCaja] = useState(true);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManageProductos = useMemo(
    () => userHasRole(user, "SUPER_ADMIN", "ADMIN"),
    [user]
  );
  const canOperarTienda = useMemo(
    () => userHasRole(user, "SUPER_ADMIN", "ADMIN", "MECANICO", "ENCARGADO_SERVICIOS"),
    [user]
  );
  const isReadOnly = useMemo(() => isReadOnlyUser(user), [user]);

  useEffect(() => {
    writePrintPreference(user, "tienda.autoPrint", autoPrint);
  }, [autoPrint, user]);

  const cargarProductos = useCallback(async () => {
    try {
      setLoadingLista(true);
      setError("");
      const data = await getProductos({ scope: "TIENDA" });
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProductos([]);
      setError(err.response?.data?.error || "No se pudo cargar la tienda.");
    } finally {
      setLoadingLista(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const data = await getClientes();
      setClientes(normalizarClientes(data));
    } catch (err) {
      console.error(err);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  const cargarCajaActiva = useCallback(async () => {
    try {
      setLoadingCaja(true);
      const data = await getCajaSesionActiva();
      setCajaActiva(data?.sesion || data || null);
    } catch (err) {
      console.error(err);
      setCajaActiva(null);
    } finally {
      setLoadingCaja(false);
    }
  }, []);

  const cargarComprobantes = useCallback(async () => {
    try {
      const data = await getCatalogoComprobantesVenta();
      const catalogo = normalizarComprobantes(data);
      setComprobantes(catalogo);

      if (catalogo.length > 0) {
        setTipoComprobante((prev) =>
          catalogo.some(
            (item) => String(item.tipo_comprobante || "").toUpperCase() === prev
          )
            ? prev
            : String(catalogo[0].tipo_comprobante || "TICKET").toUpperCase()
        );
      }
    } catch (err) {
      console.error(err);
      setComprobantes([]);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
    cargarClientes();
    cargarCajaActiva();
    cargarComprobantes();
  }, [cargarProductos, cargarClientes, cargarCajaActiva, cargarComprobantes]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return productos.filter((producto) => {
      return (
        !texto ||
        String(producto.nombre || "").toLowerCase().includes(texto) ||
        String(producto.descripcion || "").toLowerCase().includes(texto) ||
        String(producto.codigo_barras || "").toLowerCase().includes(texto)
      );
    });
  }, [productos, busqueda]);

  const handleScannedCode = (rawValue) => {
    const codigoEscaneado = String(rawValue || "").trim();
    if (!codigoEscaneado) return false;

    setCodigo(codigoEscaneado);

    const encontrado = productos.find(
      (producto) => String(producto.codigo_barras || "").trim() === codigoEscaneado
    );

    if (encontrado) {
      setScanFeedback(null);
      agregarProducto(encontrado);
      setCodigo("");
      return true;
    }

    setScanFeedback({
      severity: "warning",
      message: `No se encontro un producto de tienda con el codigo ${codigoEscaneado}.`,
    });
    return true;
  };

  const total = useMemo(() => {
    return items.reduce(
      (acumulado, item) => acumulado + Number(item.precio_venta) * Number(item.cantidad),
      0
    );
  }, [items]);

  const clienteSeleccionado = useMemo(() => {
    return clientes.find((cliente) => cliente.id_cliente === Number(clienteId)) || null;
  }, [clienteId, clientes]);

  const descuentoPorcentajeNormalizado = useMemo(
    () => normalizeDiscountPercentage(descuentoPorcentaje),
    [descuentoPorcentaje]
  );

  const clientePermiteDescuento = useMemo(() => {
    if (!clienteSeleccionado) return false;
    return ["NORMAL", "MAYORISTA"].includes(
      String(clienteSeleccionado.tipo_cliente || "NORMAL").toUpperCase()
    );
  }, [clienteSeleccionado]);

  const resumenDescuento = useMemo(
    () =>
      calculateDiscountSummary(
        items,
        descuentoPorcentajeNormalizado
      ),
    [descuentoPorcentajeNormalizado, items]
  );

  const totalConDescuento = useMemo(
    () => resumenDescuento.totalFinal,
    [resumenDescuento.totalFinal]
  );

  const montoRecibidoNumero = Number(montoRecibido || 0);
  const vuelto =
    metodoPago === "EFECTIVO" ? Math.max(montoRecibidoNumero - totalConDescuento, 0) : 0;
  const pendiente =
    metodoPago === "EFECTIVO" ? Math.max(totalConDescuento - montoRecibidoNumero, 0) : 0;

  const agregarProducto = (producto) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id_producto === producto.id_producto);

      if (existing) {
        return prev.map((item) =>
          item.id_producto === producto.id_producto
            ? {
                ...item,
                cantidad: Math.min(Number(item.cantidad) + 1, Number(producto.stock ?? 0)),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          precio_venta: Number(producto.precio_venta),
          precio_compra: Number(producto.precio_compra || 0),
          stock: Number(producto.stock ?? 0),
          cantidad: 1,
        },
      ];
    });
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id_producto !== idProducto) return item;

          const siguienteCantidad = Math.max(
            1,
            Math.min(Number(cantidad || 1), Number(item.stock || 0))
          );

          return {
            ...item,
            cantidad: siguienteCantidad,
          };
        })
        .filter(Boolean)
    );
  };

  const quitarProducto = (idProducto) => {
    setItems((prev) => prev.filter((item) => item.id_producto !== idProducto));
  };

  const imprimirVenta = async (idVenta, printWindow = null, options = {}) => {
    const data = await getVentaCompleta(idVenta);
    const html = buildVentaTicketHtml(data);

    if (options.directThermal) {
      await printTicketWithDrawer({
        title: `Venta tienda #${idVenta}`,
        html,
        width: 420,
        height: 900,
        openDrawer: Boolean(options.openDrawer),
      });
      return;
    }

    openPrintDocument({
      title: `Venta tienda #${idVenta}`,
      html,
      width: 420,
      height: 900,
      printWindow,
    });
  };

  const finalizarVenta = async () => {
    if (!items.length) return;
    const esCreditoEmpleado = modoVenta === "CREDITO_EMPLEADO";

    const cajaActual = await getCajaSesionActiva().catch(() => null);
    const sesionCaja = cajaActual?.sesion || cajaActual || null;
    setCajaActiva(sesionCaja);

    if (!sesionCaja?.id_caja_sesion) {
      setError("Debes abrir caja antes de registrar una venta de tienda.");
      return;
    }

    if (esCreditoEmpleado && !empleadoCreditoId) {
      setError("Selecciona el empleado al que se le otorgara el credito.");
      return;
    }

    if (noCobroForm.enabled && !String(noCobroForm.motivo || "").trim()) {
      setError("Debes indicar el motivo del no cobro.");
      return;
    }

    if (!esCreditoEmpleado && descuentoPorcentajeNormalizado > 0) {
      if (!clienteSeleccionado) {
        setError("Selecciona un cliente para aplicar descuento en tienda.");
        return;
      }

      if (!clientePermiteDescuento) {
        setError("El descuento solo aplica a clientes normales o mayoristas.");
        return;
      }
    }

    if (
      !esCreditoEmpleado &&
      !noCobroForm.enabled &&
      metodoPago === "EFECTIVO" &&
      montoRecibidoNumero < totalConDescuento
    ) {
      setError("El monto recibido no cubre el total de la venta.");
      return;
    }

    let reservedPrintWindow = null;

    try {
      setLoadingVenta(true);
      setError("");
      setSuccess("");

      const payload = esCreditoEmpleado
        ? {
            tipo_venta: "CREDITO",
            tipo_comprobante: tipoComprobante,
            metodo_pago: "CREDITO_EMPLEADO",
            monto_recibido: null,
            id_sucursal: 1,
            id_cliente: null,
            id_empleado_credito: Number(empleadoCreditoId),
            observacion_credito: String(observacionCredito || "").trim() || null,
            stock_scope: "TIENDA",
            descuento_porcentaje: 0,
            no_cobrar: false,
            no_cobrado_motivo: null,
            items: items.map((item) => ({
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_venta: item.precio_venta,
            })),
          }
        : {
            tipo_venta: "CONTADO",
            tipo_comprobante: tipoComprobante,
            metodo_pago: metodoPago,
            monto_recibido:
              !noCobroForm.enabled && metodoPago === "EFECTIVO"
                ? montoRecibidoNumero
                : null,
            id_sucursal: 1,
            id_cliente: clienteId ? Number(clienteId) : null,
            stock_scope: "TIENDA",
            descuento_porcentaje:
              clientePermiteDescuento ? descuentoPorcentajeNormalizado : 0,
            no_cobrar: noCobroForm.enabled,
            no_cobrado_motivo: noCobroForm.enabled ? noCobroForm.motivo : null,
            items: items.map((item) => ({
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              precio_venta: item.precio_venta,
            })),
          };

      const response = await crearVenta(payload);

      setItems([]);
      setMontoRecibido("");
      setClienteId("");
      setDescuentoPorcentaje("0");
      setNoCobroForm(EMPTY_NO_COBRO_FORM);
      setModoVenta("NORMAL");
      setEmpleadoCreditoId(null);
      setObservacionCredito("");
      setSuccess(
        esCreditoEmpleado
          ? response?.venta?.id_venta
            ? `Credito a empleado #${response.venta.id_venta} registrado correctamente. Se cobrara en el proximo pago.`
            : "Credito a empleado registrado correctamente."
          : noCobroForm.enabled
          ? "Venta de tienda registrada sin cobro. Quedara pendiente de validacion administrativa al cierre de caja."
          : response?.venta?.numero_comprobante
          ? `Venta de tienda registrada. Comprobante ${response.venta.numero_comprobante}.`
          : "Venta de tienda registrada correctamente."
      );

      await Promise.all([cargarProductos(), cargarCajaActiva(), cargarComprobantes()]);

      if (autoPrint && response?.venta?.id_venta) {
        await imprimirVenta(response.venta.id_venta, reservedPrintWindow, {
          directThermal: true,
          openDrawer: !esCreditoEmpleado && !noCobroForm.enabled,
        });
        reservedPrintWindow = null;
      }
    } catch (err) {
      console.error(err);
      if (reservedPrintWindow && !reservedPrintWindow.closed) {
        reservedPrintWindow.close();
      }
      setError(err.response?.data?.error || "No se pudo registrar la venta de tienda.");
    } finally {
      setLoadingVenta(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={(currentTheme) => ({
            ...getSummaryCardSx(currentTheme, "success", { minHeight: 0 }),
            mb: 3,
          })}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={getSummaryIconWrapSx(theme, "success")}>
                <StorefrontIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="overline" color="success.main" sx={{ fontWeight: 800, letterSpacing: "0.16em" }}>
                  Venta rapida de servicios
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  Tienda
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body1" color="text.secondary">
              Vende todos los productos disponibles en la bodega Tienda / Productos Taller, incluyendo productos trasladados desde General y productos de uso de taller.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Chip
                color={cajaActiva?.id_caja_sesion ? "success" : "default"}
                label={cajaActiva?.id_caja_sesion ? "Caja abierta" : "Caja cerrada"}
                sx={{ fontWeight: 700 }}
              />
              {cajaActiva?.id_caja_sesion && (
                <Chip
                  variant="outlined"
                  color="primary"
                  label={`Sesion #${cajaActiva.id_caja_sesion}`}
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={2} mb={3}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Aqui aparecen todos los productos que tengan existencia en la bodega Tienda / Productos Taller. Si un producto se traslada desde General a esta bodega, tambien quedara disponible para venderse aqui.
          </Alert>

          {canManageProductos && (
            <Button
              variant="outlined"
              onClick={() => navigate("/productos")}
              sx={{ alignSelf: "flex-start" }}
            >
              Ir a Productos
            </Button>
          )}

          {isReadOnly && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Estas en modo solo lectura. Puedes consultar el inventario de Tienda / Productos Taller, pero no registrar ventas.
            </Alert>
          )}

          {!cajaActiva?.id_caja_sesion && !loadingCaja && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Debes abrir caja para vender desde tienda.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              {success}
            </Alert>
          )}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
            alignItems: "start",
          }}
        >
          <Paper sx={(currentTheme) => getSectionPanelSx(currentTheme, { p: 3, radius: 4, accent: "success" })}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={getSummaryIconWrapSx(theme, "success")}>
                  <StorefrontIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={getSummaryValueSx(theme, "success")}>
                    Productos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock disponible en la bodega Tienda / Productos Taller.
                  </Typography>
                </Box>
              </Stack>

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
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleScannedCode(codigo);
                  }
                }}
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
                placeholder="Buscar por nombre, descripcion o codigo"
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

              {scanFeedback?.message ? (
                <Alert severity={scanFeedback.severity || "info"} sx={{ borderRadius: 2 }}>
                  {scanFeedback.message}
                </Alert>
              ) : null}

              {loadingLista ? (
                <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {productosFiltrados.length ? (
                    productosFiltrados.map((producto) => {
                      const stock = Number(producto.stock ?? 0);
                      return (
                        <Paper
                          key={producto.id_producto}
                          variant="outlined"
                          sx={(currentTheme) => ({
                            ...getSummaryCardSx(currentTheme, stock > 0 ? "success" : "neutral", {
                              compact: true,
                              interactive: stock > 0 && canOperarTienda,
                              minHeight: 138,
                            }),
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                            alignItems: "center",
                            cursor: stock > 0 && canOperarTienda ? "pointer" : "default",
                          })}
                          onClick={() => {
                            if (stock > 0 && canOperarTienda) {
                              agregarProducto(producto);
                            }
                          }}
                        >
                          <Box>
                            <Typography fontWeight="bold">{producto.nombre}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Codigo: {producto.codigo_barras || "-"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {producto.descripcion || "Sin descripcion"}
                            </Typography>
                          </Box>

                          <Stack spacing={1} alignItems="flex-end">
                            <Chip
                              size="small"
                              color={stock > 0 ? "primary" : "default"}
                              label={`Stock ${stock}`}
                            />
                            <Typography fontWeight="bold" color="primary.main">
                              Q {Number(producto.precio_venta).toFixed(2)}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<AddShoppingCartIcon />}
                              onClick={(event) => {
                                event.stopPropagation();
                                agregarProducto(producto);
                              }}
                              disabled={stock <= 0 || !canOperarTienda}
                            >
                              Agregar
                            </Button>
                          </Stack>
                        </Paper>
                      );
                    })
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      No hay productos disponibles en Tienda / Productos Taller.
                    </Alert>
                  )}
                </Stack>
              )}
            </Stack>
          </Paper>

          <Stack spacing={3}>
            <Paper sx={(currentTheme) => getSectionPanelSx(currentTheme, { p: 3, radius: 4, accent: "primary" })}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={getSummaryIconWrapSx(theme, "primary")}>
                    <AddShoppingCartIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={getSummaryValueSx(theme, "primary")}>
                      Carrito de tienda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Arma la venta rapida con productos disponibles en Tienda / Productos Taller.
                    </Typography>
                  </Box>
                </Stack>

                {!items.length ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Agrega productos para registrar una venta desde Tienda / Productos Taller.
                  </Alert>
                ) : (
                  <Stack spacing={1.5}>
                    {items.map((item) => (
                      <Paper
                        key={item.id_producto}
                        variant="outlined"
                        sx={(currentTheme) => ({
                          ...getSummaryCardSx(currentTheme, "primary", {
                            compact: true,
                            minHeight: 118,
                          }),
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          alignItems: "center",
                        })}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight="bold">{item.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.codigo_barras || "Sin codigo"}
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight="bold">
                            Q {Number(item.precio_venta).toFixed(2)}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton
                            color="primary"
                            onClick={() => actualizarCantidad(item.id_producto, item.cantidad - 1)}
                            disabled={item.cantidad <= 1 || !canOperarTienda}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>

                          <TextField
                            size="small"
                            type="number"
                            value={item.cantidad}
                            onChange={(event) =>
                              actualizarCantidad(item.id_producto, event.target.value)
                            }
                            disabled={!canOperarTienda}
                            inputProps={{
                              min: 1,
                              max: item.stock,
                              style: { textAlign: "center", width: 54 },
                            }}
                          />

                          <IconButton
                            color="error"
                            onClick={() => quitarProducto(item.id_producto)}
                            disabled={!canOperarTienda}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Paper>

            {canOperarTienda ? (
              <Paper sx={(currentTheme) => getSectionPanelSx(currentTheme, { p: 3, radius: 4, accent: "success" })}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={getSummaryIconWrapSx(theme, "success")}>
                      <PointOfSaleIcon fontSize="small" />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={getSummaryValueSx(theme, "success")}>
                        Resumen de pago
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Cierra ventas de tienda con el mismo flujo visual del POS.
                      </Typography>
                    </Box>
                  </Stack>

                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    color="primary"
                    value={modoVenta}
                    onChange={(_event, value) => {
                      if (!value) return;
                      setModoVenta(value);
                      if (value === "CREDITO_EMPLEADO") {
                        setClienteId("");
                        setMetodoPago("EFECTIVO");
                        setMontoRecibido("");
                        setDescuentoPorcentaje("0");
                        setNoCobroForm(EMPTY_NO_COBRO_FORM);
                      } else {
                        setEmpleadoCreditoId(null);
                        setObservacionCredito("");
                      }
                    }}
                  >
                    <ToggleButton value="NORMAL" sx={{ gap: 1 }}>
                      <PointOfSaleIcon fontSize="small" />
                      Venta normal
                    </ToggleButton>
                    <ToggleButton value="CREDITO_EMPLEADO" sx={{ gap: 1 }}>
                      <BadgeOutlinedIcon fontSize="small" />
                      Credito a empleado
                    </ToggleButton>
                  </ToggleButtonGroup>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "success.main",
                    bgcolor: "rgba(34,197,94,0.08)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Total a pagar
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    Q {totalConDescuento.toFixed(2)}
                  </Typography>
                </Box>

                {modoVenta === "CREDITO_EMPLEADO" ? (
                  <EmpleadoCreditoPanel
                    empleadoId={empleadoCreditoId}
                    onEmpleadoChange={setEmpleadoCreditoId}
                    observacion={observacionCredito}
                    onObservacionChange={setObservacionCredito}
                    totalVenta={total}
                    disabled={loadingVenta}
                  />
                ) : (
                  <>
                <FormControl fullWidth disabled={loadingClientes}>
                  <InputLabel id="tienda-cliente-label">Cliente</InputLabel>
                  <Select
                    labelId="tienda-cliente-label"
                    label="Cliente"
                    value={clienteId}
                    onChange={(event) => setClienteId(event.target.value)}
                  >
                    <MenuItem value="">Consumidor final / Sin cliente</MenuItem>
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.id_cliente} value={String(cliente.id_cliente)}>
                        {cliente.codigo} - {cliente.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="body2" color="text.secondary">
                  {clienteSeleccionado
                    ? `Cliente seleccionado: ${clienteSeleccionado.nombre}${clienteSeleccionado.nit ? ` - NIT ${clienteSeleccionado.nit}` : ""} · Tipo ${String(clienteSeleccionado.tipo_cliente || "NORMAL").toUpperCase()}`
                    : "Selecciona un cliente si deseas aplicar descuento."}
                </Typography>

                <FormControl fullWidth>
                  <InputLabel id="tienda-comprobante-label">Comprobante</InputLabel>
                  <Select
                    labelId="tienda-comprobante-label"
                    label="Comprobante"
                    value={tipoComprobante}
                    onChange={(event) => setTipoComprobante(event.target.value)}
                  >
                    {comprobantes.map((item) => (
                      <MenuItem
                        key={item.tipo_comprobante || item.id_fel_documento}
                        value={String(item.tipo_comprobante || "TICKET").toUpperCase()}
                      >
                        {item.nombre || item.comprobante_nombre || item.tipo_comprobante}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel id="tienda-metodo-label">Metodo de pago</InputLabel>
                    <Select
                      labelId="tienda-metodo-label"
                      label="Metodo de pago"
                      value={metodoPago}
                      onChange={(event) => setMetodoPago(event.target.value)}
                    >
                      <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                      <MenuItem value="TARJETA">Tarjeta</MenuItem>
                      <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                    </Select>
                  </FormControl>

                  {metodoPago === "EFECTIVO" && !noCobroForm.enabled && (
                    <TextField
                      fullWidth
                      label="Monto recibido"
                      type="number"
                      value={montoRecibido}
                      onChange={(event) => setMontoRecibido(event.target.value)}
                      inputProps={{ min: 0, step: "0.01" }}
                    />
                  )}
                  </Stack>

                <TextField
                  fullWidth
                  type="number"
                  label="Descuento (%)"
                  value={descuentoPorcentaje}
                  onChange={(event) => setDescuentoPorcentaje(event.target.value)}
                  disabled={loadingVenta}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  helperText={
                    descuentoPorcentajeNormalizado > 0 && !clienteSeleccionado
                      ? "Selecciona un cliente para aplicar descuento."
                      : !clientePermiteDescuento
                        ? clienteSeleccionado
                          ? "Solo clientes NORMAL o MAYORISTA pueden recibir descuento."
                          : "El descuento se aplica solo sobre la ganancia, nunca debajo del costo."
                        : "El descuento se aplica solo sobre la ganancia, nunca debajo del costo."
                  }
                />

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor:
                      resumenDescuento.totalDescuento > 0 ? "success.main" : "divider",
                    backgroundColor: (currentTheme) =>
                      currentTheme.palette.mode === "dark"
                        ? "rgba(15, 23, 42, 0.6)"
                        : "rgba(255, 255, 255, 0.72)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total lista
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        Q {resumenDescuento.totalLista.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Descuento aplicado
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={
                          resumenDescuento.totalDescuento > 0
                            ? "success.main"
                            : "text.primary"
                        }
                      >
                        Q {resumenDescuento.totalDescuento.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total final
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Q {totalConDescuento.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <NoCobroAuthorizationFields
                  enabled={noCobroForm.enabled}
                  onToggle={(checked) =>
                    setNoCobroForm((prev) => ({ ...prev, enabled: checked }))
                  }
                  form={noCobroForm}
                  onChange={(field, value) =>
                    setNoCobroForm((prev) => ({ ...prev, [field]: value }))
                  }
                  title="Registrar como no cobrado"
                  helperText="La venta de tienda se guardara sin cobro y debera validarse por un admin antes del cierre de caja."
                />

                {metodoPago === "EFECTIVO" && !noCobroForm.enabled && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: pendiente > 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                    }}
                  >
                    <Typography fontWeight="bold">
                      {pendiente > 0
                        ? `Pendiente: Q ${pendiente.toFixed(2)}`
                        : `Vuelto: Q ${vuelto.toFixed(2)}`}
                    </Typography>
                  </Paper>
                )}
                  </>
                )}

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={autoPrint}
                      onChange={(event) => setAutoPrint(event.target.checked)}
                    />
                  }
                  label="Imprimir ticket al finalizar"
                />

                <Divider />

                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<PointOfSaleIcon />}
                    onClick={finalizarVenta}
                    disabled={
                      !items.length ||
                      loadingVenta ||
                      loadingCaja ||
                      !cajaActiva?.id_caja_sesion ||
                      (modoVenta === "CREDITO_EMPLEADO" && !empleadoCreditoId) ||
                      (noCobroForm.enabled && !String(noCobroForm.motivo || "").trim()) ||
                      (modoVenta !== "CREDITO_EMPLEADO" &&
                        !noCobroForm.enabled &&
                        metodoPago === "EFECTIVO" &&
                        montoRecibidoNumero < totalConDescuento)
                    }
                  >
                    {loadingVenta
                      ? "Registrando..."
                      : modoVenta === "CREDITO_EMPLEADO"
                        ? "Registrar credito a empleado"
                      : noCobroForm.enabled
                        ? "Registrar venta sin cobro"
                        : "Registrar venta de tienda"}
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Paper sx={(currentTheme) => getSectionPanelSx(currentTheme, { p: 3, radius: 4, accent: "info" })}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Resumen de pago
                </Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  El rol de solo lectura puede ver el catalogo de tienda, pero no registrar ventas ni cobros.
                </Alert>
              </Paper>
            )}
          </Stack>
        </Box>
      </Box>

      <BarcodeCameraDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleScannedCode}
        title="Escanear producto de tienda"
        description="Apunta la camara al codigo del producto. Si pertenece a tienda, se agregara al carrito automaticamente."
      />
    </Container>
  );
}

export default ServiciosTienda;
