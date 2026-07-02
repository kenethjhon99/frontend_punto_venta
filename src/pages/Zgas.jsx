import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { zgasService } from "../services/zgasService";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import {
  buildZgasPedidoTicketHtml,
  openPrintDocument,
} from "../utils/printDocuments";

const money = (value) => `Q ${Number(value || 0).toFixed(2)}`;
const GT_TIME_ZONE = "America/Guatemala";
const currentDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: GT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};
const formatZgasDateTime = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("es-GT", {
    timeZone: GT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const ZGAS_ZONAS_OCULTAS = new Set(["PUEBLO_CERCANO"]);

const emptyPedido = {
  id_cliente_zgas: "",
  nombre_cliente: "",
  telefono: "",
  direccion: "",
  referencia_direccion: "",
  zona_precio: "BODEGA",
  id_tipo_cilindro: "",
  cantidad: 1,
  descuento: 0,
  observaciones: "",
};

const emptyCliente = {
  nombre: "",
  telefono: "",
  direccion: "",
  referencia: "",
  zona_habitual: "BODEGA",
};

const emptyPrecio = {
  id_tipo_cilindro: "",
  zona: "BODEGA",
  precio_compra: 0,
  precio_venta: 0,
  precio_envase: 0,
  fecha_inicio: currentDate(),
};

const formatJson = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};

const FormRow = ({ children }) => (
  <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
    {children}
  </Grid>
);

const Field = ({ xs = 12, sm = 4, sx, InputLabelProps, SelectProps, ...props }) => (
  <Grid item xs={xs} sm={sm} sx={{ minWidth: { xs: "100%", sm: 190 } }}>
    <TextField
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      SelectProps={{ displayEmpty: true, ...SelectProps }}
      sx={{
        minWidth: { xs: "100%", sm: 190 },
        "& .MuiInputLabel-root": {
          maxWidth: "calc(100% - 24px)",
          overflow: "visible",
          bgcolor: "background.paper",
          px: 0.5,
        },
        "& .MuiSelect-select": {
          minHeight: "1.5em",
          display: "flex",
          alignItems: "center",
        },
        ...sx,
      }}
      {...props}
    />
  </Grid>
);

const Panel = ({ title, children, action }) => (
  <Paper
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      boxShadow: "0 18px 38px rgba(15, 23, 42, 0.08)",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={800}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Paper>
);

function Zgas() {
  const { user } = useAuth();
  const puedeCorregirStock = userHasRole(user, "SUPER_ADMIN", "ADMIN");
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catalogos, setCatalogos] = useState({ tipos: [], zonas: [], empleados: [], proveedores: [] });
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState([]);
  const [movimientosStock, setMovimientosStock] = useState([]);
  const [movimientoCorreccion, setMovimientoCorreccion] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [rellenos, setRellenos] = useState([]);
  const [rellenosResumen, setRellenosResumen] = useState(null);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [auditoriaResumen, setAuditoriaResumen] = useState(null);
  const [auditoriaDetalle, setAuditoriaDetalle] = useState(null);
  const [reportes, setReportes] = useState(null);
  const [pedidoForm, setPedidoForm] = useState(emptyPedido);
  const [pedidoEditandoId, setPedidoEditandoId] = useState(null);
  const [pedidoFiltro, setPedidoFiltro] = useState({ estado: "", id_repartidor: "", search: "", desde: "", hasta: "" });
  const [clienteForm, setClienteForm] = useState(emptyCliente);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteHistorial, setClienteHistorial] = useState(null);
  const [precioForm, setPrecioForm] = useState(emptyPrecio);
  const [zonaForm, setZonaForm] = useState({ nombre: "", descripcion: "" });
  const [precioFiltro, setPrecioFiltro] = useState({ id_tipo_cilindro: "", zona: "", solo_activos: "" });
  const [stockForm, setStockForm] = useState({ id_tipo_cilindro: "", estado: "LLENO", tipo: "ENTRADA", cantidad: 1, observaciones: "" });
  const [minimoForm, setMinimoForm] = useState({ id_tipo_cilindro: "", estado: "LLENO", stock_minimo: 0 });
  const [kardexFiltro, setKardexFiltro] = useState({ id_tipo_cilindro: "", estado: "", tipo: "", desde: "", hasta: "" });
  const [rellenoForm, setRellenoForm] = useState({ id_tipo_cilindro: "", id_proveedor: "", cantidad: 1, costo_unitario: 0, observaciones: "" });
  const [rellenoFiltro, setRellenoFiltro] = useState({ id_tipo_cilindro: "", id_proveedor: "", desde: "", hasta: "" });
  const [rutaForm, setRutaForm] = useState({ id_rutero: "", observaciones: "" });
  const [rutaCargas, setRutaCargas] = useState([{ id_tipo_cilindro: "", cantidad_cargada: 1 }]);
  const [rutaRegreso, setRutaRegreso] = useState({});
  const [rutaFiltro, setRutaFiltro] = useState({ estado: "", id_rutero: "", desde: "", hasta: "" });
  const [liquidacionFiltro, setLiquidacionFiltro] = useState({ origen_tipo: "", estado: "", desde: "", hasta: "" });
  const [liquidacionForm, setLiquidacionForm] = useState(null);
  const [auditoriaFiltro, setAuditoriaFiltro] = useState({ accion: "", entidad: "", id_usuario: "", search: "", desde: "", hasta: "" });
  const [reporteFiltro, setReporteFiltro] = useState({
    desde: "",
    hasta: "",
    id_tipo_cilindro: "",
    zona: "",
    id_empleado: "",
    estado: "",
  });

  const tipos = catalogos.tipos || [];
  const zonas = useMemo(() => {
    const base = Array.isArray(catalogos.zonas) ? catalogos.zonas : [];
    const extras = [
      precioForm.zona,
      precioFiltro.zona,
      pedidoForm.zona_precio,
      clienteForm.zona_habitual,
      reporteFiltro.zona,
    ];
    const seen = new Set();
    return [...base, ...extras]
      .map((zona) => String(zona || "").trim().toUpperCase())
      .filter(Boolean)
      .filter((zona) => !ZGAS_ZONAS_OCULTAS.has(zona))
      .filter((zona) => {
        if (seen.has(zona)) return false;
        seen.add(zona);
        return true;
      })
      .sort((a, b) => {
        if (a === "BODEGA") return -1;
        if (b === "BODEGA") return 1;
        return a.localeCompare(b);
      });
  }, [
    catalogos.zonas,
    clienteForm.zona_habitual,
    pedidoForm.zona_precio,
    precioFiltro.zona,
    precioForm.zona,
    reporteFiltro.zona,
  ]);
  const empleados = catalogos.empleados || [];
  const proveedores = catalogos.proveedores || [];

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        catalogosData,
        dashboardData,
        stockData,
        movimientosStockData,
        pedidosData,
        rutasData,
        clientesData,
        preciosData,
        rellenosData,
        rellenosResumenData,
        liquidacionesData,
        auditoriaData,
        reportesData,
      ] = await Promise.all([
        zgasService.catalogos(),
        zgasService.dashboard(),
        zgasService.stock(),
        zgasService.movimientosStock(kardexFiltro),
        zgasService.pedidos(pedidoFiltro),
        zgasService.rutas(rutaFiltro),
        zgasService.clientes({ search: clienteSearch, incluir_inactivos: true }),
        zgasService.precios(precioFiltro),
        zgasService.rellenos(rellenoFiltro),
        zgasService.resumenRellenos(rellenoFiltro),
        zgasService.liquidaciones(liquidacionFiltro),
        zgasService.auditoria(auditoriaFiltro),
        zgasService.reportes(reporteFiltro),
      ]);
      setCatalogos(catalogosData);
      setDashboard(dashboardData);
      setStock(stockData);
      setMovimientosStock(movimientosStockData);
      setPedidos(pedidosData);
      setRutas(rutasData);
      setClientes(clientesData);
      setPrecios(preciosData);
      setRellenos(rellenosData);
      setRellenosResumen(rellenosResumenData);
      setLiquidaciones(liquidacionesData);
      setAuditoria(auditoriaData.eventos || auditoriaData);
      setAuditoriaResumen(auditoriaData.eventos ? auditoriaData : null);
      setReportes(reportesData);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo cargar ZGAS");
    } finally {
      setLoading(false);
    }
  }, [kardexFiltro, precioFiltro, clienteSearch, pedidoFiltro, rutaFiltro, rellenoFiltro, liquidacionFiltro, auditoriaFiltro, reporteFiltro]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const stockAgrupado = useMemo(() => {
    const rows = {};
    for (const item of stock) {
      rows[item.codigo] = rows[item.codigo] || { codigo: item.codigo, nombre: item.nombre, alertas: [] };
      rows[item.codigo][item.estado] = item.cantidad;
      rows[item.codigo][`${item.estado}_MIN`] = item.stock_minimo;
      if (item.bajo_minimo) rows[item.codigo].alertas.push(item.estado);
    }
    return Object.values(rows);
  }, [stock]);

  const preciosActivos = useMemo(
    () =>
      precios.filter(
        (precio) =>
          precio.activo &&
          !ZGAS_ZONAS_OCULTAS.has(String(precio.zona || "").trim().toUpperCase())
      ),
    [precios]
  );

  const submit = async (callback) => {
    try {
      setError("");
      await callback();
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Operacion no completada");
    }
  };

  const imprimirPedido = (pedido) => {
    if (!pedido) return;
    const tipo = tipos.find(
      (item) => String(item.id_tipo_cilindro) === String(pedido.id_tipo_cilindro)
    );
    const pedidoParaImprimir = {
      ...pedido,
      tipo_codigo: pedido.tipo_codigo || tipo?.codigo,
      tipo_nombre: pedido.tipo_nombre || tipo?.nombre,
    };

    try {
      openPrintDocument({
        title: `Pedido ZGAS ${pedidoParaImprimir.folio || ""}`.trim(),
        html: buildZgasPedidoTicketHtml(pedidoParaImprimir),
        width: 420,
        height: 760,
      });
    } catch (err) {
      setError(err.message || "No se pudo abrir la ventana de impresion.");
    }
  };

  const crearPedido = () =>
    submit(async () => {
      if (pedidoEditandoId) {
        const pedidoActualizado = await zgasService.actualizarPedido(pedidoEditandoId, pedidoForm);
        imprimirPedido(pedidoActualizado);
      } else {
        const pedidoCreado = await zgasService.crearPedido(pedidoForm);
        imprimirPedido(pedidoCreado);
      }
      setPedidoForm(emptyPedido);
      setPedidoEditandoId(null);
    });

  const editarPedido = (pedido) => {
    setPedidoEditandoId(pedido.id_pedido);
    setPedidoForm({
      id_cliente_zgas: pedido.id_cliente_zgas || "",
      nombre_cliente: pedido.nombre_cliente || "",
      telefono: pedido.telefono || "",
      direccion: pedido.direccion || "",
      referencia_direccion: pedido.referencia_direccion || "",
      zona_precio: pedido.zona_precio || "BODEGA",
      id_tipo_cilindro: pedido.id_tipo_cilindro || "",
      cantidad: pedido.cantidad || 1,
      descuento: pedido.descuento || 0,
      observaciones: pedido.observaciones || "",
    });
  };

  const cancelarEdicionPedido = () => {
    setPedidoEditandoId(null);
    setPedidoForm(emptyPedido);
  };

  const filtrarPedidos = () =>
    submit(async () => {
      const data = await zgasService.pedidos(pedidoFiltro);
      setPedidos(data);
    });

  const crearCliente = () =>
    submit(async () => {
      if (clienteEditandoId) {
        await zgasService.actualizarCliente(clienteEditandoId, clienteForm);
      } else {
        await zgasService.crearCliente(clienteForm);
      }
      setClienteForm(emptyCliente);
      setClienteEditandoId(null);
    });

  const editarCliente = (cliente) => {
    setClienteEditandoId(cliente.id_cliente_zgas);
    setClienteForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      referencia: cliente.referencia || "",
      zona_habitual: cliente.zona_habitual || "BODEGA",
    });
  };

  const cancelarEdicionCliente = () => {
    setClienteEditandoId(null);
    setClienteForm(emptyCliente);
  };

  const toggleCliente = (cliente) =>
    submit(async () => {
      if (cliente.activo) {
        await zgasService.desactivarCliente(cliente.id_cliente_zgas);
      } else {
        await zgasService.activarCliente(cliente.id_cliente_zgas);
      }
    });

  const verHistorialCliente = (cliente) =>
    submit(async () => {
      const data = await zgasService.historialCliente(cliente.id_cliente_zgas);
      setClienteHistorial(data);
    });

  const aplicarClienteEnPedido = (clienteId) => {
    const cliente = clientes.find((item) => String(item.id_cliente_zgas) === String(clienteId));
    if (!cliente) {
      setPedidoForm({ ...pedidoForm, id_cliente_zgas: "" });
      return;
    }
    setPedidoForm({
      ...pedidoForm,
      id_cliente_zgas: cliente.id_cliente_zgas,
      nombre_cliente: cliente.nombre || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      referencia_direccion: cliente.referencia || "",
      zona_precio: cliente.zona_habitual || "BODEGA",
    });
  };

  const guardarPrecio = () =>
    submit(async () => {
      await zgasService.guardarPrecio(precioForm);
      setPrecioForm({ ...emptyPrecio, fecha_inicio: currentDate() });
    });

  const crearZona = () =>
    submit(async () => {
      const zonaCreada = await zgasService.crearZona(zonaForm);
      const nombre = String(zonaCreada?.nombre || zonaForm.nombre || "").trim().toUpperCase();
      if (nombre) {
        setCatalogos((current) => {
          const actuales = Array.isArray(current.zonas) ? current.zonas : [];
          const normalizadas = new Set(actuales.map((zona) => String(zona || "").trim().toUpperCase()));
          if (normalizadas.has(nombre)) return current;
          return {
            ...current,
            zonas: [...actuales, nombre],
            zonas_detalle: [
              ...(Array.isArray(current.zonas_detalle) ? current.zonas_detalle : []),
              zonaCreada,
            ].filter(Boolean),
          };
        });
      }
      setZonaForm({ nombre: "", descripcion: "" });
      setPrecioForm((current) => ({ ...current, zona: nombre || current.zona }));
      setPedidoForm((current) => ({ ...current, zona_precio: nombre || current.zona_precio }));
      setClienteForm((current) => ({ ...current, zona_habitual: nombre || current.zona_habitual }));
    });

  const filtrarPrecios = () =>
    submit(async () => {
      const data = await zgasService.precios(precioFiltro);
      setPrecios(data);
    });

  const ajustarStock = () =>
    submit(async () => {
      await zgasService.ajustarStock(stockForm);
    });

  const actualizarMinimo = () =>
    submit(async () => {
      await zgasService.actualizarMinimoStock(minimoForm);
    });

  const cargarKardex = () =>
    submit(async () => {
      const data = await zgasService.movimientosStock(kardexFiltro);
      setMovimientosStock(data);
    });

  const confirmarCorreccionEntrada = () =>
    submit(async () => {
      if (!movimientoCorreccion) return;
      await zgasService.revertirEntradaStock(movimientoCorreccion.id_movimiento, {
        cantidad: Number(movimientoCorreccion.cantidad_corregir || 0),
        motivo: movimientoCorreccion.motivo,
      });
      setMovimientoCorreccion(null);
    });

  const crearRelleno = () =>
    submit(async () => {
      await zgasService.crearRelleno(rellenoForm);
      setRellenoForm({ id_tipo_cilindro: "", id_proveedor: "", cantidad: 1, costo_unitario: 0, observaciones: "" });
    });

  const filtrarRellenos = () =>
    submit(async () => {
      const [lista, resumen] = await Promise.all([
        zgasService.rellenos(rellenoFiltro),
        zgasService.resumenRellenos(rellenoFiltro),
      ]);
      setRellenos(lista);
      setRellenosResumen(resumen);
    });

  const crearRutaConSalida = () =>
    submit(async () => {
      const cargas = rutaCargas
        .filter((carga) => carga.id_tipo_cilindro && Number(carga.cantidad_cargada) > 0)
        .map((carga) => ({
          id_tipo_cilindro: carga.id_tipo_cilindro,
          cantidad_cargada: Number(carga.cantidad_cargada || 1),
        }));
      const ruta = await zgasService.crearRuta({
        id_rutero: rutaForm.id_rutero,
        observaciones: rutaForm.observaciones,
      });
      await zgasService.salidaRuta(ruta.id_ruta, {
        cargas,
      });
      setRutaForm({ id_rutero: "", observaciones: "" });
      setRutaCargas([{ id_tipo_cilindro: "", cantidad_cargada: 1 }]);
    });

  const agregarCargaRuta = () => {
    setRutaCargas([...rutaCargas, { id_tipo_cilindro: "", cantidad_cargada: 1 }]);
  };

  const actualizarCargaRuta = (index, field, value) => {
    setRutaCargas((prev) =>
      prev.map((carga, idx) => (idx === index ? { ...carga, [field]: value } : carga))
    );
  };

  const quitarCargaRuta = (index) => {
    setRutaCargas((prev) => prev.filter((_, idx) => idx !== index));
  };

  const prepararRegresoRuta = (ruta) => {
    const next = {};
    for (const carga of ruta.cargas || []) {
      next[carga.id_tipo_cilindro] = {
        id_tipo_cilindro: carga.id_tipo_cilindro,
        cantidad_cargada: Number(carga.cantidad_cargada || 0),
        cantidad_vendida: carga.cantidad_vendida || 0,
        cantidad_vacia_devuelta: carga.cantidad_vacia_devuelta || 0,
        cantidad_llena_devuelta: carga.cantidad_llena_devuelta || 0,
        cantidad_envase_vendida: carga.cantidad_envase_vendida || 0,
        precio_venta_usado: carga.precio_venta_usado || 0,
        precio_envase_unitario: carga.precio_envase_unitario || 0,
      };
    }
    setRutaRegreso({ ...rutaRegreso, [ruta.id_ruta]: next });
  };

  const actualizarRegresoRuta = (idRuta, idTipo, field, value) => {
    setRutaRegreso((prev) => ({
      ...prev,
      [idRuta]: {
        ...(prev[idRuta] || {}),
        [idTipo]: {
          ...((prev[idRuta] || {})[idTipo] || { id_tipo_cilindro: idTipo }),
          [field]: Number(value || 0),
          ...(["cantidad_vacia_devuelta", "cantidad_llena_devuelta"].includes(field)
            ? (() => {
                const current = (prev[idRuta] || {})[idTipo] || {};
                const vacios =
                  field === "cantidad_vacia_devuelta"
                    ? Number(value || 0)
                    : Number(current.cantidad_vacia_devuelta || 0);
                const llenos =
                  field === "cantidad_llena_devuelta"
                    ? Number(value || 0)
                    : Number(current.cantidad_llena_devuelta || 0);
                const carga = Number(current.cantidad_cargada || 0);
                return {
                  cantidad_vendida: vacios,
                  cantidad_envase_vendida: Math.max(carga - vacios - llenos, 0),
                };
              })()
            : {}),
        },
      },
    }));
  };

  const guardarRegresoRuta = (ruta) =>
    submit(async () => {
      const cargas = Object.values(rutaRegreso[ruta.id_ruta] || {});
      await zgasService.regresoRuta(ruta.id_ruta, { cargas });
    });

  const filtrarRutas = () =>
    submit(async () => {
      const data = await zgasService.rutas(rutaFiltro);
      setRutas(data);
    });

  const abrirLiquidacion = ({ origenTipo, origenId, folio, esperado }) => {
    setLiquidacionForm({
      origenTipo,
      origenId,
      folio,
      efectivo_esperado: Number(esperado || 0),
      efectivo_entregado: Number(esperado || 0),
      gastos_detalle: [{ descripcion: "", monto: 0 }],
      motivo_diferencia: "",
    });
    setTab(6);
  };

  const gastosLiquidacionTotal = (liquidacionForm?.gastos_detalle || []).reduce(
    (sum, gasto) => sum + Number(gasto.monto || 0),
    0
  );

  const diferenciaLiquidacion = liquidacionForm
    ? Number(liquidacionForm.efectivo_entregado || 0) +
      gastosLiquidacionTotal -
      Number(liquidacionForm.efectivo_esperado || 0)
    : 0;

  const agregarGastoLiquidacion = () => {
    setLiquidacionForm((current) => ({
      ...current,
      gastos_detalle: [...(current?.gastos_detalle || []), { descripcion: "", monto: 0 }],
    }));
  };

  const actualizarGastoLiquidacion = (index, field, value) => {
    setLiquidacionForm((current) => ({
      ...current,
      gastos_detalle: (current?.gastos_detalle || []).map((gasto, gastoIndex) =>
        gastoIndex === index
          ? { ...gasto, [field]: field === "monto" ? Number(value || 0) : value }
          : gasto
      ),
    }));
  };

  const quitarGastoLiquidacion = (index) => {
    setLiquidacionForm((current) => {
      const gastos = (current?.gastos_detalle || []).filter((_, gastoIndex) => gastoIndex !== index);
      return {
        ...current,
        gastos_detalle: gastos.length ? gastos : [{ descripcion: "", monto: 0 }],
      };
    });
  };

  const guardarLiquidacion = () =>
    submit(async () => {
      if (!liquidacionForm) return;
      const payload = {
        efectivo_entregado: Number(liquidacionForm.efectivo_entregado || 0),
        motivo_diferencia: liquidacionForm.motivo_diferencia,
      };
      if (liquidacionForm.origenTipo === "RUTA") {
        const gastosDetalle = (liquidacionForm.gastos_detalle || [])
          .map((gasto) => ({
            descripcion: String(gasto.descripcion || "").trim(),
            monto: Number(gasto.monto || 0),
          }))
          .filter((gasto) => gasto.descripcion || gasto.monto > 0);
        payload.gastos_total = gastosDetalle.reduce((sum, gasto) => sum + gasto.monto, 0);
        payload.gastos_detalle = gastosDetalle;
      }
      if (liquidacionForm.origenTipo === "PEDIDO") {
        await zgasService.liquidarPedido(liquidacionForm.origenId, payload);
      } else {
        await zgasService.liquidarRuta(liquidacionForm.origenId, payload);
      }
      setLiquidacionForm(null);
    });

  const filtrarLiquidaciones = () =>
    submit(async () => {
      const data = await zgasService.liquidaciones(liquidacionFiltro);
      setLiquidaciones(data);
    });

  const filtrarReportes = () =>
    submit(async () => {
      const data = await zgasService.reportes(reporteFiltro);
      setReportes(data);
    });

  const filtrarAuditoria = () =>
    submit(async () => {
      const data = await zgasService.auditoria(auditoriaFiltro);
      setAuditoria(data.eventos || data);
      setAuditoriaResumen(data.eventos ? data : null);
    });

  const renderSelectOptions = (items, valueKey, labelKey) =>
    items.map((item) => (
      <MenuItem key={item[valueKey]} value={item[valueKey]}>
        {item[labelKey]}
      </MenuItem>
    ));

  const renderZonaOptions = (includeAll = false) => (
    <>
      {includeAll && <MenuItem value="">Todas</MenuItem>}
      {zonas.map((zona) => (
        <MenuItem key={zona} value={zona}>
          {zona}
        </MenuItem>
      ))}
    </>
  );

  const renderZonaNativeOptions = (includeAll = false) => (
    <>
      {includeAll && <option value="">Todas</option>}
      {zonas.map((zona) => (
        <option key={zona} value={zona}>
          {zona}
        </option>
      ))}
    </>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#eef5ff", minHeight: "100vh" }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <LocalGasStationIcon color="primary" />
            <Typography variant="h4" fontWeight={900}>
              ZGAS
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Pedidos, rutas, cilindros, rellenos, liquidaciones y caja.
          </Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="contained" onClick={loadAll} disabled={loading}>
          Actualizar
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Pedidos activos", dashboard?.pedidos_activos],
          ["Rutas activas", dashboard?.rutas_activas],
          ["Repartidores disponibles", dashboard?.repartidores_disponibles],
          ["Pedidos liquidados hoy", money(dashboard?.venta_pedidos_hoy)],
          ["Rutas liquidadas hoy", money(dashboard?.venta_rutas_hoy)],
          ["Caja ZGAS hoy", money(dashboard?.liquidado_hoy)],
          ["Diferencia hoy", money(dashboard?.diferencia_hoy)],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={3} lg={12 / 7} key={label}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography color="text.secondary" fontWeight={700}>
                {label}
              </Typography>
              <Typography variant="h5" fontWeight={900}>
                {value ?? 0}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 52,
            "& .MuiTab-root": { minHeight: 52, textTransform: "none", fontWeight: 800 },
            "& .MuiTabs-indicator": { height: 3, borderRadius: 3 },
          }}
        >
          <Tab label="Pedidos" />
          <Tab label="Rutas" />
          <Tab label="Inventario" />
          <Tab label="Precios" />
          <Tab label="Clientes" />
          <Tab label="Rellenos" />
          <Tab label="Liquidaciones" />
          <Tab label="Reportes" />
          <Tab label="Auditoria" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Stack spacing={2}>
          <Panel title={pedidoEditandoId ? "Editar pedido por llamada" : "Nuevo pedido por llamada"}>
            <FormRow>
              <Field select label="Cliente frecuente" value={pedidoForm.id_cliente_zgas} onChange={(e) => aplicarClienteEnPedido(e.target.value)}>
                <MenuItem value="">Sin cliente frecuente</MenuItem>
                {clientes.filter((cliente) => cliente.activo).map((cliente) => (
                  <MenuItem key={cliente.id_cliente_zgas} value={cliente.id_cliente_zgas}>
                    {cliente.nombre} {cliente.telefono ? `- ${cliente.telefono}` : ""}
                  </MenuItem>
                ))}
              </Field>
              <Field label="Cliente" value={pedidoForm.nombre_cliente} onChange={(e) => setPedidoForm({ ...pedidoForm, nombre_cliente: e.target.value })} />
              <Field label="Telefono" value={pedidoForm.telefono} onChange={(e) => setPedidoForm({ ...pedidoForm, telefono: e.target.value })} />
              <Field label="Direccion" value={pedidoForm.direccion} onChange={(e) => setPedidoForm({ ...pedidoForm, direccion: e.target.value })} />
              <Field label="Referencia" value={pedidoForm.referencia_direccion} onChange={(e) => setPedidoForm({ ...pedidoForm, referencia_direccion: e.target.value })} />
              <Field select label="Zona" value={pedidoForm.zona_precio} SelectProps={{ native: true }} onChange={(e) => setPedidoForm({ ...pedidoForm, zona_precio: e.target.value })}>
                {renderZonaNativeOptions()}
              </Field>
              <Field select label="Cilindro" value={pedidoForm.id_tipo_cilindro} onChange={(e) => setPedidoForm({ ...pedidoForm, id_tipo_cilindro: e.target.value })}>
                {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
              </Field>
              <Field label="Cantidad" type="number" value={pedidoForm.cantidad} onChange={(e) => setPedidoForm({ ...pedidoForm, cantidad: e.target.value })} />
              <Field label="Descuento" type="number" value={pedidoForm.descuento} onChange={(e) => setPedidoForm({ ...pedidoForm, descuento: e.target.value })} />
              <Field label="Observaciones" value={pedidoForm.observaciones} onChange={(e) => setPedidoForm({ ...pedidoForm, observaciones: e.target.value })} />
              <Grid item xs={12}>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button variant="contained" onClick={crearPedido}>
                    {pedidoEditandoId ? "Actualizar pedido" : "Crear pedido"}
                  </Button>
                  {pedidoEditandoId && (
                    <Button variant="outlined" onClick={cancelarEdicionPedido}>
                      Cancelar edicion
                    </Button>
                  )}
                </Stack>
              </Grid>
            </FormRow>
          </Panel>
          <Panel title="Filtros de pedidos">
            <FormRow>
              <Field label="Buscar pedido" value={pedidoFiltro.search} onChange={(e) => setPedidoFiltro({ ...pedidoFiltro, search: e.target.value })} />
              <Field select label="Estado" value={pedidoFiltro.estado} onChange={(e) => setPedidoFiltro({ ...pedidoFiltro, estado: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="RECIBIDO">RECIBIDO</MenuItem>
                <MenuItem value="ASIGNADO">ASIGNADO</MenuItem>
                <MenuItem value="EN_REPARTO">EN_REPARTO</MenuItem>
                <MenuItem value="REGRESADO">REGRESADO</MenuItem>
                <MenuItem value="LIQUIDADO">LIQUIDADO</MenuItem>
                <MenuItem value="CANCELADO">CANCELADO</MenuItem>
              </Field>
              <Field select label="Repartidor" value={pedidoFiltro.id_repartidor} onChange={(e) => setPedidoFiltro({ ...pedidoFiltro, id_repartidor: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(empleados, "id_empleado", "nombre")}
              </Field>
              <Field label="Desde" type="date" value={pedidoFiltro.desde} onChange={(e) => setPedidoFiltro({ ...pedidoFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={pedidoFiltro.hasta} onChange={(e) => setPedidoFiltro({ ...pedidoFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarPedidos}>Filtrar pedidos</Button>
              </Grid>
            </FormRow>
          </Panel>
          <Panel title="Pedidos">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Folio</TableCell><TableCell>Cliente</TableCell><TableCell>Cilindro</TableCell><TableCell>Estado</TableCell><TableCell>Tiempo</TableCell><TableCell>Total</TableCell><TableCell>Repartidor</TableCell><TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id_pedido}>
                    <TableCell>{pedido.folio}</TableCell>
                    <TableCell>{pedido.nombre_cliente}</TableCell>
                    <TableCell>{pedido.cantidad} x {pedido.tipo_codigo}</TableCell>
                    <TableCell><Chip size="small" label={pedido.estado} /></TableCell>
                    <TableCell>
                      {pedido.estado === "EN_REPARTO"
                        ? `${Math.round(Number(pedido.minutos_en_reparto || 0))} min reparto`
                        : `${Math.round(Number(pedido.minutos_desde_llamada || 0))} min`}
                    </TableCell>
                    <TableCell>{money(pedido.venta_total)}</TableCell>
                    <TableCell>{pedido.repartidor_nombre || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {["RECIBIDO", "ASIGNADO"].includes(pedido.estado) && (
                          <Button size="small" variant="outlined" onClick={() => editarPedido(pedido)}>
                            Editar
                          </Button>
                        )}
                        <Button size="small" variant="outlined" onClick={() => imprimirPedido(pedido)}>
                          Imprimir
                        </Button>
                        {pedido.estado === "RECIBIDO" && (
                          <TextField select size="small" label="Asignar" sx={{ minWidth: 160 }} onChange={(e) => submit(() => zgasService.asignarPedido(pedido.id_pedido, { id_repartidor: e.target.value }))}>
                            {renderSelectOptions(empleados, "id_empleado", "nombre")}
                          </TextField>
                        )}
                        {pedido.estado === "ASIGNADO" && <Button size="small" onClick={() => submit(() => zgasService.salidaPedido(pedido.id_pedido))}>Salida</Button>}
                        {pedido.estado === "EN_REPARTO" && <Button size="small" onClick={() => submit(() => zgasService.regresoPedido(pedido.id_pedido, { entregado: true }))}>Entregado</Button>}
                        {pedido.estado === "EN_REPARTO" && <Button color="warning" size="small" onClick={() => submit(() => zgasService.regresoPedido(pedido.id_pedido, { entregado: false, motivo: "No entregado" }))}>No entregado</Button>}
                        {pedido.estado === "REGRESADO" && (
                          <Button
                            size="small"
                            onClick={() =>
                              abrirLiquidacion({
                                origenTipo: "PEDIDO",
                                origenId: pedido.id_pedido,
                                folio: pedido.folio,
                                esperado: pedido.venta_total,
                              })
                            }
                          >
                            Liquidar
                          </Button>
                        )}
                        {!["LIQUIDADO", "CANCELADO"].includes(pedido.estado) && <Button color="error" size="small" onClick={() => submit(() => zgasService.cancelarPedido(pedido.id_pedido, { motivo: "Cancelado desde panel" }))}>Cancelar</Button>}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Panel title="Salida de ruta">
            <Stack spacing={2}>
              <FormRow>
                <Field select label="Rutero" value={rutaForm.id_rutero} onChange={(e) => setRutaForm({ ...rutaForm, id_rutero: e.target.value })}>
                  {renderSelectOptions(empleados, "id_empleado", "nombre")}
                </Field>
                <Field label="Observaciones" value={rutaForm.observaciones} onChange={(e) => setRutaForm({ ...rutaForm, observaciones: e.target.value })} sm={8} />
              </FormRow>

              {rutaCargas.map((carga, index) => (
                <FormRow key={`ruta-carga-${index}`}>
                  <Field select label="Cilindro" value={carga.id_tipo_cilindro} onChange={(e) => actualizarCargaRuta(index, "id_tipo_cilindro", e.target.value)}>
                    {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
                  </Field>
                  <Field label="Carga" type="number" value={carga.cantidad_cargada} onChange={(e) => actualizarCargaRuta(index, "cantidad_cargada", e.target.value)} />
                  <Grid item xs={12} sm={4}>
                    <Button color="error" variant="outlined" onClick={() => quitarCargaRuta(index)} disabled={rutaCargas.length === 1}>
                      Quitar
                    </Button>
                  </Grid>
                </FormRow>
              ))}

              <Grid item xs={12}>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button variant="outlined" onClick={agregarCargaRuta}>Agregar cilindro</Button>
                  <Button variant="contained" onClick={crearRutaConSalida}>Crear ruta y dar salida</Button>
                </Stack>
              </Grid>
            </Stack>
          </Panel>

          <Panel title="Filtros de rutas">
            <FormRow>
              <Field select label="Estado" value={rutaFiltro.estado} onChange={(e) => setRutaFiltro({ ...rutaFiltro, estado: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="CREADA">CREADA</MenuItem>
                <MenuItem value="EN_RUTA">EN_RUTA</MenuItem>
                <MenuItem value="REGRESADA">REGRESADA</MenuItem>
                <MenuItem value="LIQUIDADA">LIQUIDADA</MenuItem>
                <MenuItem value="CANCELADA">CANCELADA</MenuItem>
              </Field>
              <Field select label="Rutero" value={rutaFiltro.id_rutero} onChange={(e) => setRutaFiltro({ ...rutaFiltro, id_rutero: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(empleados, "id_empleado", "nombre")}
              </Field>
              <Field label="Desde" type="date" value={rutaFiltro.desde} onChange={(e) => setRutaFiltro({ ...rutaFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={rutaFiltro.hasta} onChange={(e) => setRutaFiltro({ ...rutaFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarRutas}>Filtrar rutas</Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Rutas">
            <Table size="small">
              <TableHead><TableRow><TableCell>Folio</TableCell><TableCell>Rutero</TableCell><TableCell>Estado</TableCell><TableCell>Carga</TableCell><TableCell>Tiempo</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
              <TableBody>
                {rutas.map((ruta) => (
                  <TableRow key={ruta.id_ruta}>
                    <TableCell>{ruta.folio}</TableCell>
                    <TableCell>{ruta.rutero_nombre}</TableCell>
                    <TableCell><Chip size="small" label={ruta.estado} /></TableCell>
                    <TableCell>
                      {(ruta.cargas || [])
                        .map((c) => {
                          const envases = Number(c.cantidad_envase_vendida || 0);
                          return `${c.tipo_codigo}: carga ${c.cantidad_cargada}, vendido ${c.cantidad_vendida || 0}${
                            envases ? `, envase ${envases}` : ""
                          }`;
                        })
                        .join(", ")}
                    </TableCell>
                    <TableCell>{Math.round(Number(ruta.minutos_activa || 0))} min</TableCell>
                    <TableCell>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {ruta.estado === "EN_RUTA" && (
                          <Button size="small" variant="outlined" onClick={() => prepararRegresoRuta(ruta)}>
                            Preparar regreso
                          </Button>
                        )}
                        {ruta.estado === "REGRESADA" && (
                          <Button
                            size="small"
                            onClick={() =>
                              abrirLiquidacion({
                                origenTipo: "RUTA",
                                origenId: ruta.id_ruta,
                                folio: ruta.folio,
                                esperado: (ruta.cargas || []).reduce(
                                  (sum, c) => sum + Number(c.venta_total || 0),
                                  0
                                ),
                              })
                            }
                          >
                            Liquidar
                          </Button>
                        )}
                        {["CREADA", "EN_RUTA"].includes(ruta.estado) && (
                          <Button color="error" size="small" variant="outlined" onClick={() => submit(() => zgasService.cancelarRuta(ruta.id_ruta, { motivo: "Cancelada desde panel" }))}>
                            Cancelar
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>

          {rutas
            .filter((ruta) => rutaRegreso[ruta.id_ruta])
            .map((ruta) => (
              <Panel key={`regreso-${ruta.id_ruta}`} title={`Regreso de ${ruta.folio}`}>
                <Stack spacing={2}>
                  {(ruta.cargas || []).map((carga) => {
                    const value = rutaRegreso[ruta.id_ruta]?.[carga.id_tipo_cilindro] || {};
                    return (
                      <FormRow key={`${ruta.id_ruta}-${carga.id_tipo_cilindro}`}>
                        <Grid item xs={12} sm={3}>
                          <Typography fontWeight={800}>{carga.tipo_codigo}</Typography>
                          <Typography color="text.secondary">Carga: {carga.cantidad_cargada}</Typography>
                        </Grid>
                        <Field label="Vacios devueltos" type="number" value={value.cantidad_vacia_devuelta || 0} onChange={(e) => actualizarRegresoRuta(ruta.id_ruta, carga.id_tipo_cilindro, "cantidad_vacia_devuelta", e.target.value)} />
                        <Field label="Llenos devueltos" type="number" value={value.cantidad_llena_devuelta || 0} onChange={(e) => actualizarRegresoRuta(ruta.id_ruta, carga.id_tipo_cilindro, "cantidad_llena_devuelta", e.target.value)} />
                        <Grid item xs={12} sm={3}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">Ventas con cambio</Typography>
                            <Typography variant="h6" fontWeight={900}>{value.cantidad_vendida || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {money(value.precio_venta_usado)} c/u
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">Cilindros completos vendidos</Typography>
                            <Typography variant="h6" fontWeight={900}>{value.cantidad_envase_vendida || 0}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {money(value.precio_envase_unitario)} c/u
                            </Typography>
                          </Paper>
                        </Grid>
                      </FormRow>
                    );
                  })}
                  <Stack direction="row" gap={1}>
                    <Button variant="contained" onClick={() => guardarRegresoRuta(ruta)}>Guardar regreso</Button>
                    <Button variant="outlined" onClick={() => setRutaRegreso((prev) => {
                      const next = { ...prev };
                      delete next[ruta.id_ruta];
                      return next;
                    })}>Cerrar</Button>
                  </Stack>
                </Stack>
              </Panel>
            ))}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          {dashboard?.alertas_stock?.length > 0 && (
            <Alert severity="warning">
              Hay cilindros llenos bajo minimo:{" "}
              {dashboard.alertas_stock
                .map((item) => `${item.codigo} (${item.cantidad}/${item.stock_minimo})`)
                .join(", ")}
            </Alert>
          )}

          <Panel title="Ajuste de cilindros">
            <FormRow>
              <Field select label="Cilindro" value={stockForm.id_tipo_cilindro} onChange={(e) => setStockForm({ ...stockForm, id_tipo_cilindro: e.target.value })}>{renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}</Field>
              <Field select label="Estado" value={stockForm.estado} onChange={(e) => setStockForm({ ...stockForm, estado: e.target.value })}>{(catalogos.estados_stock || []).map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</Field>
              <Field select label="Tipo" value={stockForm.tipo} onChange={(e) => setStockForm({ ...stockForm, tipo: e.target.value })}><MenuItem value="ENTRADA">Entrada</MenuItem><MenuItem value="SALIDA">Salida</MenuItem></Field>
              <Field label="Cantidad" type="number" value={stockForm.cantidad} onChange={(e) => setStockForm({ ...stockForm, cantidad: e.target.value })} />
              <Field label="Observaciones" value={stockForm.observaciones} onChange={(e) => setStockForm({ ...stockForm, observaciones: e.target.value })} />
              <Grid item xs={12}><Button variant="contained" onClick={ajustarStock}>Guardar ajuste</Button></Grid>
            </FormRow>
          </Panel>

          <Panel title="Stock minimo">
            <FormRow>
              <Field select label="Cilindro" value={minimoForm.id_tipo_cilindro} onChange={(e) => setMinimoForm({ ...minimoForm, id_tipo_cilindro: e.target.value })}>{renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}</Field>
              <Field select label="Estado" value={minimoForm.estado} onChange={(e) => setMinimoForm({ ...minimoForm, estado: e.target.value })}>{(catalogos.estados_stock || []).map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}</Field>
              <Field label="Minimo" type="number" value={minimoForm.stock_minimo} onChange={(e) => setMinimoForm({ ...minimoForm, stock_minimo: e.target.value })} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={actualizarMinimo}>Actualizar minimo</Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Stock por cilindro">
            <Table size="small">
              <TableHead><TableRow><TableCell>Cilindro</TableCell><TableCell>Llenos</TableCell><TableCell>Vacios</TableCell><TableCell>En reparto</TableCell><TableCell>En ruta</TableCell><TableCell>Minimo llenos</TableCell><TableCell>Alerta</TableCell></TableRow></TableHead>
              <TableBody>{stockAgrupado.map((row) => <TableRow key={row.codigo}><TableCell>{row.codigo}</TableCell><TableCell>{row.LLENO || 0}</TableCell><TableCell>{row.VACIO || 0}</TableCell><TableCell>{row.EN_REPARTO || 0}</TableCell><TableCell>{row.EN_RUTA || 0}</TableCell><TableCell>{row.LLENO_MIN || 0}</TableCell><TableCell>{row.alertas?.length ? <Chip size="small" color="warning" label="Bajo minimo" /> : <Chip size="small" color="success" label="OK" />}</TableCell></TableRow>)}</TableBody>
            </Table>
          </Panel>

          <Panel title="Kardex ZGAS">
            <Stack spacing={2}>
              {movimientoCorreccion && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography fontWeight={900}>Corregir entrada duplicada</Typography>
                      <Typography color="text.secondary">
                        {movimientoCorreccion.tipo_codigo} · {movimientoCorreccion.estado_destino} ·{" "}
                        {movimientoCorreccion.cantidad} cilindro(s)
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Cantidad a corregir"
                      value={movimientoCorreccion.cantidad_corregir || ""}
                      inputProps={{
                        min: 1,
                        max:
                          Number(movimientoCorreccion.cantidad || 0) -
                          Number(movimientoCorreccion.cantidad_revertida || 0),
                        step: 1,
                      }}
                      onChange={(event) =>
                        setMovimientoCorreccion({
                          ...movimientoCorreccion,
                          cantidad_corregir: event.target.value,
                        })
                      }
                      helperText={`Pendiente por corregir: ${
                        Number(movimientoCorreccion.cantidad || 0) -
                        Number(movimientoCorreccion.cantidad_revertida || 0)
                      } cilindro(s).`}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Motivo de la correccion"
                      value={movimientoCorreccion.motivo || ""}
                      onChange={(event) =>
                        setMovimientoCorreccion({
                          ...movimientoCorreccion,
                          motivo: event.target.value,
                        })
                      }
                      helperText="Ejemplo: entrada registrada dos veces por error."
                    />
                    <Stack direction="row" gap={1}>
                      <Button
                        variant="contained"
                        color="error"
                        disabled={
                          !String(movimientoCorreccion.motivo || "").trim() ||
                          Number(movimientoCorreccion.cantidad_corregir || 0) <= 0
                        }
                        onClick={confirmarCorreccionEntrada}
                      >
                        Confirmar correccion
                      </Button>
                      <Button variant="outlined" onClick={() => setMovimientoCorreccion(null)}>
                        Cancelar
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <FormRow>
                <Field select label="Cilindro" value={kardexFiltro.id_tipo_cilindro} onChange={(e) => setKardexFiltro({ ...kardexFiltro, id_tipo_cilindro: e.target.value })}>
                  <MenuItem value="">Todos</MenuItem>
                  {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
                </Field>
                <Field select label="Estado" value={kardexFiltro.estado} onChange={(e) => setKardexFiltro({ ...kardexFiltro, estado: e.target.value })}>
                  <MenuItem value="">Todos</MenuItem>
                  {(catalogos.estados_stock || []).map((estado) => <MenuItem key={estado} value={estado}>{estado}</MenuItem>)}
                </Field>
                <Field select label="Tipo movimiento" value={kardexFiltro.tipo} onChange={(e) => setKardexFiltro({ ...kardexFiltro, tipo: e.target.value })}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="AJUSTE_ENTRADA">AJUSTE_ENTRADA</MenuItem>
                  <MenuItem value="AJUSTE_SALIDA">AJUSTE_SALIDA</MenuItem>
                  <MenuItem value="SALIDA_PEDIDO">SALIDA_PEDIDO</MenuItem>
                  <MenuItem value="REGRESO_PEDIDO">REGRESO_PEDIDO</MenuItem>
                  <MenuItem value="SALIDA_RUTA">SALIDA_RUTA</MenuItem>
                  <MenuItem value="VENTA_RUTA_ENVASE">VENTA_RUTA_ENVASE</MenuItem>
                  <MenuItem value="REGRESO_RUTA_VACIO">REGRESO_RUTA_VACIO</MenuItem>
                  <MenuItem value="REGRESO_RUTA_LLENO">REGRESO_RUTA_LLENO</MenuItem>
                  <MenuItem value="RELLENO">RELLENO</MenuItem>
                </Field>
                <Field label="Desde" type="date" value={kardexFiltro.desde} onChange={(e) => setKardexFiltro({ ...kardexFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
                <Field label="Hasta" type="date" value={kardexFiltro.hasta} onChange={(e) => setKardexFiltro({ ...kardexFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={cargarKardex}>Filtrar kardex</Button>
                </Grid>
              </FormRow>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Cilindro</TableCell>
                    <TableCell>Movimiento</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Referencia</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientosStock.map((mov) => (
                    <TableRow key={mov.id_movimiento}>
                      <TableCell>{formatZgasDateTime(mov.fecha)}</TableCell>
                      <TableCell>{mov.tipo_codigo}</TableCell>
                      <TableCell>
                        <Stack direction="row" gap={1} alignItems="center">
                          <Typography variant="body2">{mov.tipo}</Typography>
                          {mov.revertido && <Chip size="small" color="warning" label="Corregida" />}
                          {mov.reversion_de_movimiento && <Chip size="small" label="Reversion" />}
                        </Stack>
                      </TableCell>
                      <TableCell>{mov.estado_origen || "-"}</TableCell>
                      <TableCell>{mov.estado_destino || "-"}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{mov.cantidad}</Typography>
                        {mov.tipo === "AJUSTE_ENTRADA" && Number(mov.cantidad_revertida || 0) > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Corregidos: {mov.cantidad_revertida}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{mov.referencia_tipo || "-"} {mov.referencia_id || ""}</TableCell>
                      <TableCell>{mov.username || "-"}</TableCell>
                      <TableCell>
                        {puedeCorregirStock &&
                          mov.tipo === "AJUSTE_ENTRADA" &&
                          mov.referencia_tipo === "AJUSTE" &&
                          !mov.revertido && (
                            <Button
                              size="small"
                              color="warning"
                              variant="outlined"
                              startIcon={<EditOutlinedIcon />}
                              onClick={() =>
                                setMovimientoCorreccion({
                                  ...mov,
                                  cantidad_corregir:
                                    Number(mov.cantidad || 0) - Number(mov.cantidad_revertida || 0),
                                  motivo: "",
                                })
                              }
                            >
                              Corregir entrada
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!movimientosStock.length && (
                    <TableRow>
                      <TableCell colSpan={9}>No hay movimientos para mostrar.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Stack>
          </Panel>
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Panel title="Precios activos">
            <Grid container spacing={2}>
              {preciosActivos.map((precio) => (
                <Grid item xs={12} sm={6} md={3} key={`activo-${precio.id_precio}`}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={0.75}>
                      <Typography fontWeight={900}>{precio.tipo_codigo}</Typography>
                      <Chip size="small" label={precio.zona} sx={{ alignSelf: "flex-start" }} />
                      <Typography variant="h6" fontWeight={900}>{money(precio.precio_venta)}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Contenido/recarga
                      </Typography>
                      <Typography fontWeight={800} variant="body2">
                        Cilindro completo {money(precio.precio_envase)}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        Compra contenido {money(precio.precio_compra)}
                      </Typography>
                      <Typography color="text.secondary" variant="caption">
                        Desde {String(precio.fecha_inicio || "").slice(0, 10)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
              {!preciosActivos.length && (
                <Grid item xs={12}>
                  <Alert severity="info">No hay precios activos con los filtros actuales.</Alert>
                </Grid>
              )}
            </Grid>
          </Panel>

          <Panel title="Nuevo precio">
            <FormRow>
              <Field select label="Cilindro" value={precioForm.id_tipo_cilindro} onChange={(e) => setPrecioForm({ ...precioForm, id_tipo_cilindro: e.target.value })}>{renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}</Field>
              <Field select label="Zona" value={precioForm.zona} SelectProps={{ native: true }} onChange={(e) => setPrecioForm({ ...precioForm, zona: e.target.value })}>
                {renderZonaNativeOptions()}
              </Field>
              <Field label="Precio compra" type="number" value={precioForm.precio_compra} onChange={(e) => setPrecioForm({ ...precioForm, precio_compra: e.target.value })} />
              <Field label="Precio contenido/recarga" type="number" value={precioForm.precio_venta} onChange={(e) => setPrecioForm({ ...precioForm, precio_venta: e.target.value })} />
              <Field label="Precio cilindro completo" type="number" value={precioForm.precio_envase} onChange={(e) => setPrecioForm({ ...precioForm, precio_envase: e.target.value })} />
              <Field label="Vigente desde" type="date" value={precioForm.fecha_inicio} onChange={(e) => setPrecioForm({ ...precioForm, fecha_inicio: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}><Button variant="contained" onClick={guardarPrecio}>Guardar precio</Button></Grid>
            </FormRow>
          </Panel>

          <Panel title="Zonas de reparto">
            <FormRow>
              <Field label="Nueva zona" value={zonaForm.nombre} onChange={(e) => setZonaForm({ ...zonaForm, nombre: e.target.value })} />
              <Field label="Descripcion" value={zonaForm.descripcion} onChange={(e) => setZonaForm({ ...zonaForm, descripcion: e.target.value })} />
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" onClick={crearZona}>
                  Agregar zona
                </Button>
              </Grid>
            </FormRow>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {zonas.map((zona) => (
                <Chip key={zona} label={zona} />
              ))}
            </Stack>
          </Panel>

          <Panel title="Filtros de historial">
            <FormRow>
              <Field select label="Cilindro" value={precioFiltro.id_tipo_cilindro} onChange={(e) => setPrecioFiltro({ ...precioFiltro, id_tipo_cilindro: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
              </Field>
              <Field select label="Zona" value={precioFiltro.zona} SelectProps={{ native: true }} onChange={(e) => setPrecioFiltro({ ...precioFiltro, zona: e.target.value })}>
                {renderZonaNativeOptions(true)}
              </Field>
              <Field select label="Estado" value={precioFiltro.solo_activos} onChange={(e) => setPrecioFiltro({ ...precioFiltro, solo_activos: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="true">Activos</MenuItem>
                <MenuItem value="false">Historicos</MenuItem>
              </Field>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarPrecios}>Filtrar precios</Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Historial de precios">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cilindro</TableCell>
                  <TableCell>Zona</TableCell>
                  <TableCell>Compra</TableCell>
                  <TableCell>Contenido/recarga</TableCell>
                  <TableCell>Cilindro completo</TableCell>
                  <TableCell>Desde</TableCell>
                  <TableCell>Hasta</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {precios.map((p) => (
                  <TableRow key={p.id_precio}>
                    <TableCell>{p.tipo_codigo}</TableCell>
                    <TableCell>{p.zona}</TableCell>
                    <TableCell>{money(p.precio_compra)}</TableCell>
                    <TableCell>{money(p.precio_venta)}</TableCell>
                    <TableCell>{money(p.precio_envase)}</TableCell>
                    <TableCell>{String(p.fecha_inicio || "").slice(0, 10)}</TableCell>
                    <TableCell>{p.fecha_fin ? String(p.fecha_fin).slice(0, 10) : "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={p.activo ? "success" : "default"}
                        label={p.activo ? "Activo" : "Historico"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!precios.length && (
                  <TableRow>
                    <TableCell colSpan={8}>No hay precios para mostrar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>
        </Stack>
      )}

      {tab === 4 && (
        <Stack spacing={2}>
          <Panel title={clienteEditandoId ? "Editar cliente frecuente" : "Cliente frecuente"}>
            <FormRow>
              <Field label="Nombre" value={clienteForm.nombre} onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })} />
              <Field label="Telefono" value={clienteForm.telefono} onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })} />
              <Field select label="Zona habitual" value={clienteForm.zona_habitual} SelectProps={{ native: true }} onChange={(e) => setClienteForm({ ...clienteForm, zona_habitual: e.target.value })}>
                {renderZonaNativeOptions()}
              </Field>
              <Field label="Direccion" value={clienteForm.direccion} onChange={(e) => setClienteForm({ ...clienteForm, direccion: e.target.value })} />
              <Field label="Referencia" value={clienteForm.referencia} onChange={(e) => setClienteForm({ ...clienteForm, referencia: e.target.value })} />
              <Grid item xs={12}>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Button variant="contained" onClick={crearCliente}>
                    {clienteEditandoId ? "Actualizar cliente" : "Guardar cliente"}
                  </Button>
                  {clienteEditandoId && (
                    <Button variant="outlined" onClick={cancelarEdicionCliente}>
                      Cancelar edicion
                    </Button>
                  )}
                </Stack>
              </Grid>
            </FormRow>
          </Panel>
          <Panel title="Buscar clientes">
            <FormRow>
              <Field label="Buscar por nombre, telefono o direccion" value={clienteSearch} onChange={(e) => setClienteSearch(e.target.value)} sm={8} />
              <Grid item xs={12} sm={4}>
                <Button fullWidth variant="outlined" onClick={loadAll}>Buscar</Button>
              </Grid>
            </FormRow>
          </Panel>
          <Panel title="Clientes">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Telefono</TableCell>
                  <TableCell>Zona</TableCell>
                  <TableCell>Direccion</TableCell>
                  <TableCell>Pedidos</TableCell>
                  <TableCell>Total comprado</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id_cliente_zgas}>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.telefono || "-"}</TableCell>
                    <TableCell>{c.zona_habitual}</TableCell>
                    <TableCell>{c.direccion || "-"}</TableCell>
                    <TableCell>{c.total_pedidos || 0}</TableCell>
                    <TableCell>{money(c.total_comprado)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={c.activo ? "success" : "default"} label={c.activo ? "Activo" : "Inactivo"} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        <Button size="small" variant="outlined" onClick={() => editarCliente(c)}>Editar</Button>
                        <Button size="small" variant="outlined" onClick={() => verHistorialCliente(c)}>Historial</Button>
                        <Button size="small" color={c.activo ? "error" : "success"} variant="outlined" onClick={() => toggleCliente(c)}>
                          {c.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!clientes.length && (
                  <TableRow>
                    <TableCell colSpan={8}>No hay clientes para mostrar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>

          {clienteHistorial && (
            <Panel title={`Historial de ${clienteHistorial.cliente?.nombre || "cliente"}`}>
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography color="text.secondary">Pedidos</Typography>
                      <Typography variant="h5" fontWeight={900}>{clienteHistorial.resumen?.total_pedidos || 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography color="text.secondary">Total comprado</Typography>
                      <Typography variant="h5" fontWeight={900}>{money(clienteHistorial.resumen?.total_comprado)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography color="text.secondary">Ultima compra</Typography>
                      <Typography fontWeight={900}>
                        {formatZgasDateTime(clienteHistorial.resumen?.ultima_compra)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Folio</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Cilindro</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Repartidor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(clienteHistorial.pedidos || []).map((pedido) => (
                      <TableRow key={pedido.id_pedido}>
                        <TableCell>{pedido.folio}</TableCell>
                        <TableCell>{formatZgasDateTime(pedido.hora_llamada)}</TableCell>
                        <TableCell>{pedido.cantidad} x {pedido.tipo_codigo}</TableCell>
                        <TableCell>{pedido.estado}</TableCell>
                        <TableCell>{money(pedido.venta_total)}</TableCell>
                        <TableCell>{pedido.repartidor_nombre || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {!clienteHistorial.pedidos?.length && (
                      <TableRow>
                        <TableCell colSpan={6}>Este cliente aun no tiene pedidos.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Stack>
            </Panel>
          )}
        </Stack>
      )}

      {tab === 5 && (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {[
              ["Rellenos", rellenosResumen?.resumen?.total_rellenos],
              ["Cilindros rellenados", rellenosResumen?.resumen?.cilindros_rellenados],
              ["Costo total", money(rellenosResumen?.resumen?.costo_total)],
              ["Costo promedio", money(rellenosResumen?.resumen?.costo_promedio)],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h5" fontWeight={900}>{value ?? 0}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Panel title="Vacios disponibles">
            <Grid container spacing={2}>
              {(rellenosResumen?.vacios_disponibles || []).map((row) => (
                <Grid item xs={12} sm={4} key={row.id_tipo_cilindro}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography fontWeight={900}>{row.tipo_codigo}</Typography>
                    <Typography variant="h5" fontWeight={900}>{row.cantidad}</Typography>
                    <Typography color="text.secondary">cilindros vacios</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Panel>

          <Panel title="Relleno de cilindros">
            <FormRow>
              <Field select label="Cilindro" value={rellenoForm.id_tipo_cilindro} onChange={(e) => setRellenoForm({ ...rellenoForm, id_tipo_cilindro: e.target.value })}>{renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}</Field>
              <Field select label="Proveedor" value={rellenoForm.id_proveedor} onChange={(e) => setRellenoForm({ ...rellenoForm, id_proveedor: e.target.value })}>{renderSelectOptions(proveedores, "id_proveedor", "nombre")}</Field>
              <Field label="Cantidad" type="number" value={rellenoForm.cantidad} onChange={(e) => setRellenoForm({ ...rellenoForm, cantidad: e.target.value })} />
              <Field label="Costo unitario" type="number" value={rellenoForm.costo_unitario} onChange={(e) => setRellenoForm({ ...rellenoForm, costo_unitario: e.target.value })} />
              <Field label="Observaciones" value={rellenoForm.observaciones} onChange={(e) => setRellenoForm({ ...rellenoForm, observaciones: e.target.value })} />
              <Grid item xs={12}><Button variant="contained" onClick={crearRelleno}>Registrar relleno</Button></Grid>
            </FormRow>
          </Panel>

          <Panel title="Filtros de rellenos">
            <FormRow>
              <Field select label="Cilindro" value={rellenoFiltro.id_tipo_cilindro} onChange={(e) => setRellenoFiltro({ ...rellenoFiltro, id_tipo_cilindro: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
              </Field>
              <Field select label="Proveedor" value={rellenoFiltro.id_proveedor} onChange={(e) => setRellenoFiltro({ ...rellenoFiltro, id_proveedor: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(proveedores, "id_proveedor", "nombre")}
              </Field>
              <Field label="Desde" type="date" value={rellenoFiltro.desde} onChange={(e) => setRellenoFiltro({ ...rellenoFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={rellenoFiltro.hasta} onChange={(e) => setRellenoFiltro({ ...rellenoFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarRellenos}>Filtrar rellenos</Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Historial de rellenos">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cilindro</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo unitario</TableCell>
                  <TableCell>Costo total</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rellenos.map((r) => (
                  <TableRow key={r.id_relleno}>
                    <TableCell>{formatZgasDateTime(r.fecha)}</TableCell>
                    <TableCell>{r.tipo_codigo}</TableCell>
                    <TableCell>{r.cantidad}</TableCell>
                    <TableCell>{money(r.costo_unitario)}</TableCell>
                    <TableCell>{money(r.costo_total)}</TableCell>
                    <TableCell>{r.proveedor_nombre || "-"}</TableCell>
                    <TableCell>{r.observaciones || "-"}</TableCell>
                  </TableRow>
                ))}
                {!rellenos.length && (
                  <TableRow>
                    <TableCell colSpan={7}>No hay rellenos para mostrar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>
        </Stack>
      )}

      {tab === 6 && (
        <Stack spacing={2}>
          {liquidacionForm && (
            <Panel
              title={`Liquidar ${liquidacionForm.origenTipo} ${liquidacionForm.folio || ""}`}
              action={
                <Button variant="text" color="inherit" onClick={() => setLiquidacionForm(null)}>
                  Cancelar
                </Button>
              }
            >
              <FormRow>
                <Grid item xs={12} sm={3}>
                  <Typography color="text.secondary">Efectivo esperado</Typography>
                  <Typography variant="h5" fontWeight={900}>
                    {money(liquidacionForm.efectivo_esperado)}
                  </Typography>
                </Grid>
                <Field
                  label="Efectivo entregado"
                  type="number"
                  value={liquidacionForm.efectivo_entregado}
                  onChange={(e) =>
                    setLiquidacionForm({
                      ...liquidacionForm,
                      efectivo_entregado: e.target.value,
                    })
                  }
                />
                {liquidacionForm.origenTipo === "RUTA" && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "stretch", sm: "center" }}
                          gap={1}
                        >
                          <Box>
                            <Typography fontWeight={900}>Gastos de ruta</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Combustible, pinchazo, alimentación u otros gastos pagados con el efectivo.
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={agregarGastoLiquidacion}
                          >
                            Agregar gasto
                          </Button>
                        </Stack>

                        {(liquidacionForm.gastos_detalle || []).map((gasto, index) => (
                          <Grid container spacing={2} alignItems="center" key={`gasto-ruta-${index}`}>
                            <Grid item xs={12} sm={7}>
                              <TextField
                                fullWidth
                                size="small"
                                label={`Descripcion gasto ${index + 1}`}
                                value={gasto.descripcion}
                                onChange={(e) =>
                                  actualizarGastoLiquidacion(index, "descripcion", e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={10} sm={4}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Monto"
                                value={gasto.monto}
                                inputProps={{ min: 0, step: "0.01" }}
                                onChange={(e) =>
                                  actualizarGastoLiquidacion(index, "monto", e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={2} sm={1}>
                              <Button
                                color="error"
                                variant="text"
                                onClick={() => quitarGastoLiquidacion(index)}
                                title="Eliminar gasto"
                                sx={{ minWidth: 40 }}
                              >
                                <DeleteOutlineIcon />
                              </Button>
                            </Grid>
                          </Grid>
                        ))}

                        <Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
                          <Typography color="text.secondary">Total de gastos:</Typography>
                          <Typography variant="h6" fontWeight={900}>
                            {money(gastosLiquidacionTotal)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={3}>
                  <Typography color="text.secondary">Diferencia</Typography>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    color={Number(diferenciaLiquidacion) === 0 ? "success.main" : "warning.main"}
                  >
                    {money(diferenciaLiquidacion)}
                  </Typography>
                </Grid>
                <Field
                  sm={12}
                  label="Motivo de diferencia"
                  value={liquidacionForm.motivo_diferencia}
                  onChange={(e) =>
                    setLiquidacionForm({
                      ...liquidacionForm,
                      motivo_diferencia: e.target.value,
                    })
                  }
                  helperText="Obligatorio si efectivo entregado mas gastos no coincide con el esperado."
                />
                <Grid item xs={12}>
                  <Button variant="contained" onClick={guardarLiquidacion}>
                    Confirmar liquidacion
                  </Button>
                </Grid>
              </FormRow>
            </Panel>
          )}

          <Panel title="Filtros de liquidaciones">
            <FormRow>
              <Field
                select
                label="Origen"
                value={liquidacionFiltro.origen_tipo}
                onChange={(e) => setLiquidacionFiltro({ ...liquidacionFiltro, origen_tipo: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PEDIDO">PEDIDO</MenuItem>
                <MenuItem value="RUTA">RUTA</MenuItem>
              </Field>
              <Field
                select
                label="Estado"
                value={liquidacionFiltro.estado}
                onChange={(e) => setLiquidacionFiltro({ ...liquidacionFiltro, estado: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="LIQUIDADA">LIQUIDADA</MenuItem>
                <MenuItem value="CON_DIFERENCIA">CON_DIFERENCIA</MenuItem>
              </Field>
              <Field label="Desde" type="date" value={liquidacionFiltro.desde} onChange={(e) => setLiquidacionFiltro({ ...liquidacionFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={liquidacionFiltro.hasta} onChange={(e) => setLiquidacionFiltro({ ...liquidacionFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarLiquidaciones}>
                  Filtrar liquidaciones
                </Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Historial de liquidaciones">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Origen</TableCell>
                  <TableCell>Responsable</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Esperado</TableCell>
                  <TableCell>Entregado</TableCell>
                  <TableCell>Gastos</TableCell>
                  <TableCell>Diferencia</TableCell>
                  <TableCell>Caja</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {liquidaciones.map((l) => (
                  <TableRow key={l.id_liquidacion}>
                    <TableCell>{formatZgasDateTime(l.hora_liquidacion)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={800}>{l.origen_tipo} {l.folio || `#${l.origen_id}`}</Typography>
                      <Typography variant="body2" color="text.secondary">{l.referencia_nombre || "-"}</Typography>
                    </TableCell>
                    <TableCell>{l.empleado_nombre || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={l.estado === "CON_DIFERENCIA" ? "warning" : "success"}
                        label={l.estado}
                      />
                    </TableCell>
                    <TableCell>{money(l.efectivo_esperado)}</TableCell>
                    <TableCell>{money(l.efectivo_entregado)}</TableCell>
                    <TableCell>
                      <Typography>{money(l.gastos_total)}</Typography>
                      {Number(l.gastos_total || 0) > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          {Array.isArray(l.gastos_detalle)
                            ? l.gastos_detalle.map((g) => g.descripcion).filter(Boolean).join(", ")
                            : "-"}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{money(l.diferencia)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">Sesion #{l.id_caja_sesion}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mov. #{l.id_caja_movimiento || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>{l.motivo_diferencia || "-"}</TableCell>
                  </TableRow>
                ))}
                {!liquidaciones.length && (
                  <TableRow>
                    <TableCell colSpan={10}>No hay liquidaciones para mostrar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>
        </Stack>
      )}

      {tab === 7 && (
        <Stack spacing={2}>
          <Panel title="Filtros de reportes">
            <FormRow>
              <Field label="Desde" type="date" value={reporteFiltro.desde} onChange={(e) => setReporteFiltro({ ...reporteFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={reporteFiltro.hasta} onChange={(e) => setReporteFiltro({ ...reporteFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field select label="Cilindro" value={reporteFiltro.id_tipo_cilindro} onChange={(e) => setReporteFiltro({ ...reporteFiltro, id_tipo_cilindro: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(tipos, "id_tipo_cilindro", "codigo")}
              </Field>
              <Field select label="Zona" value={reporteFiltro.zona} SelectProps={{ native: true }} onChange={(e) => setReporteFiltro({ ...reporteFiltro, zona: e.target.value })}>
                {renderZonaNativeOptions(true)}
              </Field>
              <Field select label="Empleado" value={reporteFiltro.id_empleado} onChange={(e) => setReporteFiltro({ ...reporteFiltro, id_empleado: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {renderSelectOptions(empleados, "id_empleado", "nombre")}
              </Field>
              <Field select label="Estado" value={reporteFiltro.estado} onChange={(e) => setReporteFiltro({ ...reporteFiltro, estado: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="LIQUIDADO">LIQUIDADO</MenuItem>
                <MenuItem value="LIQUIDADA">LIQUIDADA</MenuItem>
                <MenuItem value="CON_DIFERENCIA">CON_DIFERENCIA</MenuItem>
                <MenuItem value="RECIBIDO">RECIBIDO</MenuItem>
                <MenuItem value="ASIGNADO">ASIGNADO</MenuItem>
                <MenuItem value="EN_REPARTO">EN_REPARTO</MenuItem>
                <MenuItem value="EN_RUTA">EN_RUTA</MenuItem>
                <MenuItem value="REGRESADO">REGRESADO</MenuItem>
                <MenuItem value="REGRESADA">REGRESADA</MenuItem>
                <MenuItem value="CANCELADO">CANCELADO</MenuItem>
                <MenuItem value="CANCELADA">CANCELADA</MenuItem>
              </Field>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarReportes}>
                  Generar reporte
                </Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Resumen financiero">
            <Grid container spacing={2}>
              {[
                ["Venta total", reportes?.resumen?.venta_total],
                ["Costo total", reportes?.resumen?.costo_total],
                ["Utilidad total", reportes?.resumen?.utilidad_total],
                ["Cilindros vendidos", reportes?.resumen?.cilindros_vendidos],
                ["Operaciones liquidadas", reportes?.resumen?.operaciones_liquidadas],
              ].map(([label, value], index) => (
                <Grid item xs={12} sm={6} md={2.4} key={label}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {index < 3 ? money(value) : Number(value || 0)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Panel>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Panel title="Ventas por origen">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Origen</TableCell><TableCell>Operaciones</TableCell><TableCell>Cilindros</TableCell><TableCell>Venta</TableCell><TableCell>Utilidad</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.por_origen || []).map((row) => <TableRow key={row.origen}><TableCell>{row.origen}</TableCell><TableCell>{row.operaciones}</TableCell><TableCell>{row.cilindros_vendidos}</TableCell><TableCell>{money(row.venta_total)}</TableCell><TableCell>{money(row.utilidad_total)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12} md={6}>
              <Panel title="Ventas por cilindro">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Cilindro</TableCell><TableCell>Cilindros</TableCell><TableCell>Venta</TableCell><TableCell>Utilidad</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.por_tipo || []).map((row) => <TableRow key={row.tipo_codigo}><TableCell>{row.tipo_codigo}</TableCell><TableCell>{row.cilindros_vendidos}</TableCell><TableCell>{money(row.venta_total)}</TableCell><TableCell>{money(row.utilidad_total)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12} md={6}>
              <Panel title="Desempeno por empleado">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Empleado</TableCell><TableCell>Operaciones</TableCell><TableCell>Cilindros</TableCell><TableCell>Venta</TableCell><TableCell>Utilidad</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.por_empleado || []).map((row) => <TableRow key={row.id_empleado || row.empleado_nombre}><TableCell>{row.empleado_nombre}</TableCell><TableCell>{row.operaciones}</TableCell><TableCell>{row.cilindros_vendidos}</TableCell><TableCell>{money(row.venta_total)}</TableCell><TableCell>{money(row.utilidad_total)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12} md={6}>
              <Panel title="Liquidaciones">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Estado</TableCell><TableCell>Total</TableCell><TableCell>Esperado</TableCell><TableCell>Entregado</TableCell><TableCell>Diferencia</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.liquidaciones || []).map((row) => <TableRow key={row.estado}><TableCell>{row.estado}</TableCell><TableCell>{row.total}</TableCell><TableCell>{money(row.efectivo_esperado)}</TableCell><TableCell>{money(row.efectivo_entregado)}</TableCell><TableCell>{money(row.diferencia)}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12} md={6}>
              <Panel title="Estados de pedidos">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Estado</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.pedidos_estado || []).map((row) => <TableRow key={row.estado}><TableCell>{row.estado}</TableCell><TableCell>{row.total}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12} md={6}>
              <Panel title="Estados de rutas">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Estado</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.rutas_estado || []).map((row) => <TableRow key={row.estado}><TableCell>{row.estado}</TableCell><TableCell>{row.total}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
            <Grid item xs={12}>
              <Panel title="Inventario ZGAS">
                <Table size="small">
                  <TableHead><TableRow><TableCell>Cilindro</TableCell><TableCell>Estado</TableCell><TableCell>Cantidad</TableCell><TableCell>Minimo</TableCell></TableRow></TableHead>
                  <TableBody>{(reportes?.inventario || []).map((row) => <TableRow key={`${row.tipo_codigo}-${row.estado}`}><TableCell>{row.tipo_codigo}</TableCell><TableCell>{row.estado}</TableCell><TableCell>{row.cantidad}</TableCell><TableCell>{row.stock_minimo}</TableCell></TableRow>)}</TableBody>
                </Table>
              </Panel>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tab === 8 && (
        <Stack spacing={2}>
          <Panel title="Filtros de auditoria">
            <FormRow>
              <Field label="Buscar" value={auditoriaFiltro.search} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, search: e.target.value })} />
              <Field select label="Accion" value={auditoriaFiltro.accion} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, accion: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                {(auditoriaResumen?.por_accion || []).map((row) => <MenuItem key={row.accion} value={row.accion}>{row.accion}</MenuItem>)}
              </Field>
              <Field select label="Entidad" value={auditoriaFiltro.entidad} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, entidad: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                {(auditoriaResumen?.por_entidad || []).map((row) => <MenuItem key={row.entidad} value={row.entidad}>{row.entidad}</MenuItem>)}
              </Field>
              <Field select label="Usuario" value={auditoriaFiltro.id_usuario} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, id_usuario: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {(auditoriaResumen?.usuarios || []).map((user) => (
                  <MenuItem key={user.id_usuario} value={user.id_usuario}>{user.nombre || user.username}</MenuItem>
                ))}
              </Field>
              <Field label="Desde" type="date" value={auditoriaFiltro.desde} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, desde: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Field label="Hasta" type="date" value={auditoriaFiltro.hasta} onChange={(e) => setAuditoriaFiltro({ ...auditoriaFiltro, hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Grid item xs={12}>
                <Button variant="outlined" onClick={filtrarAuditoria}>
                  Buscar eventos
                </Button>
              </Grid>
            </FormRow>
          </Panel>

          <Panel title="Resumen de auditoria">
            <Grid container spacing={2}>
              {[
                ["Eventos", auditoriaResumen?.resumen?.total_eventos],
                ["Usuarios", auditoriaResumen?.resumen?.usuarios_involucrados],
                ["Primer evento", formatZgasDateTime(auditoriaResumen?.resumen?.primer_evento)],
                ["Ultimo evento", formatZgasDateTime(auditoriaResumen?.resumen?.ultimo_evento)],
              ].map(([label, value]) => (
                <Grid item xs={12} sm={6} md={3} key={label}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography color="text.secondary">{label}</Typography>
                    <Typography fontWeight={900}>{value ?? 0}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Panel>

          {auditoriaDetalle && (
            <Panel
              title={`Detalle ${auditoriaDetalle.accion}`}
              action={<Button variant="text" color="inherit" onClick={() => setAuditoriaDetalle(null)}>Cerrar</Button>}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography color="text.secondary">Evento</Typography>
                  <Typography fontWeight={900}>{auditoriaDetalle.entidad} #{auditoriaDetalle.entidad_id || "-"}</Typography>
                  <Typography>{auditoriaDetalle.usuario_nombre || auditoriaDetalle.username || "-"}</Typography>
                  <Typography color="text.secondary">
                    {formatZgasDateTime(auditoriaDetalle.fecha)}
                  </Typography>
                </Grid>
                {[
                  ["Antes", auditoriaDetalle.antes],
                  ["Despues", auditoriaDetalle.despues],
                  ["Metadata", auditoriaDetalle.metadata],
                ].map(([label, value]) => (
                  <Grid item xs={12} md={4} key={label}>
                    <Typography fontWeight={800}>{label}</Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "#0f172a", color: "#e5e7eb", maxHeight: 320, overflow: "auto" }}>
                      <Typography component="pre" sx={{ m: 0, fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
                        {formatJson(value)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Panel>
          )}

          <Panel title="Eventos de auditoria">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Accion</TableCell>
                  <TableCell>Entidad</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditoria.map((a) => (
                  <TableRow key={a.id_evento}>
                    <TableCell>{formatZgasDateTime(a.fecha)}</TableCell>
                    <TableCell><Chip size="small" label={a.accion} /></TableCell>
                    <TableCell>{a.entidad} #{a.entidad_id || "-"}</TableCell>
                    <TableCell>{a.usuario_nombre || a.username || "-"}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" onClick={() => setAuditoriaDetalle(a)}>
                        Ver detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!auditoria.length && (
                  <TableRow>
                    <TableCell colSpan={5}>No hay eventos de auditoria para mostrar.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Panel>
        </Stack>
      )}
    </Box>
  );
}

export default Zgas;
