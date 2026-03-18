import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import BuscarProducto from "../components/ventas/BuscarProducto";
import VentaTable from "../components/ventas/VentaTable";
import VentasRecientesTable from "../components/ventas/VentasRecientesTable";
import ClienteFormModal from "../components/ui/ClienteFormModal";
import VentaAnulacionModal from "../components/ui/VentaAnulacionModal";
import VentaDetalleAnulacionModal from "../components/ui/VentaDetalleAnulacionModal";
import VentaDetalleModal from "../components/ui/VentaDetalleModal";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";
import { getProductos } from "../services/productoService";
import {
  anularDetalleVenta,
  anularVenta,
  crearVenta,
  getVentaCompleta,
  getVentas,
} from "../services/ventaService";
import { crearCliente, getClientes } from "../services/clienteService";
import { getCajaSesionActiva } from "../services/cajaService";

const normalizarClientes = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizarVentas = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const obtenerUltimoCodigoCliente = (clientes = []) => {
  return clientes.reduce((ultimoCodigo, cliente) => {
    const codigo = String(cliente?.codigo || "").trim();
    const match = codigo.match(/^CL-(\d+)$/i);

    if (!match) return ultimoCodigo;

    const correlativo = Number(match[1]);
    if (!Number.isInteger(correlativo)) return ultimoCodigo;

    if (!ultimoCodigo || correlativo > ultimoCodigo.correlativo) {
      return { codigo, correlativo };
    }

    return ultimoCodigo;
  }, null);
};

function Ventas() {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [items, setItems] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [tipoVenta, setTipoVenta] = useState("CONTADO");
  const [fechaDesdeVentas, setFechaDesdeVentas] = useState("");
  const [fechaHastaVentas, setFechaHastaVentas] = useState("");
  const [estadoFiltroVentas, setEstadoFiltroVentas] = useState("TODOS");
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingVentasRecientes, setLoadingVentasRecientes] = useState(true);
  const [loadingCaja, setLoadingCaja] = useState(true);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [loadingGuardarCliente, setLoadingGuardarCliente] = useState(false);
  const [loadingAnulacion, setLoadingAnulacion] = useState(false);
  const [loadingAnulacionDetalle, setLoadingAnulacionDetalle] = useState(false);
  const [loadingDetalleVenta, setLoadingDetalleVenta] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [ventaAnulacionOpen, setVentaAnulacionOpen] = useState(false);
  const [detalleAnulacionOpen, setDetalleAnulacionOpen] = useState(false);
  const [ventaDetalleOpen, setVentaDetalleOpen] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVentaSeleccionado, setDetalleVentaSeleccionado] = useState(null);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [cajaActiva, setCajaActiva] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cargarProductos = useCallback(async () => {
    try {
      setLoadingProductos(true);
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los productos");
    } finally {
      setLoadingProductos(false);
    }
  }, []);

  const cargarClientes = useCallback(async () => {
    try {
      setLoadingClientes(true);
      const data = await getClientes();
      setClientes(normalizarClientes(data));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los clientes");
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  const cargarVentasRecientes = useCallback(async () => {
    try {
      setLoadingVentasRecientes(true);
      const data = await getVentas({
        page: 1,
        limit: 8,
        desde: fechaDesdeVentas || undefined,
        hasta: fechaHastaVentas || undefined,
        estado: estadoFiltroVentas !== "TODOS" ? estadoFiltroVentas : undefined,
        sortBy: "fecha",
        sortDir: "desc",
      });
      setVentasRecientes(normalizarVentas(data));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar las ventas recientes");
    } finally {
      setLoadingVentasRecientes(false);
    }
  }, [estadoFiltroVentas, fechaDesdeVentas, fechaHastaVentas]);

  const cargarCajaActiva = useCallback(async () => {
    try {
      setLoadingCaja(true);
      const data = await getCajaSesionActiva();
      setCajaActiva(data?.sesion || null);
    } catch (err) {
      console.error(err);
      setCajaActiva(null);
      setError(err.response?.data?.error || "No se pudo validar la sesion de caja");
    } finally {
      setLoadingCaja(false);
    }
  }, []);

  useEffect(() => {
    setError("");
    cargarProductos();
    cargarClientes();
    cargarVentasRecientes();
    cargarCajaActiva();
  }, [cargarCajaActiva, cargarClientes, cargarProductos, cargarVentasRecientes]);

  const limpiarFiltrosVentas = () => {
    setFechaDesdeVentas("");
    setFechaHastaVentas("");
    setEstadoFiltroVentas("TODOS");
  };

  const agregarProducto = (producto, cantidadAgregar = 1) => {
    const stock = Number(producto.stock || 0);
    const cantidad = Number(cantidadAgregar);

    if (stock <= 0) return;
    if (!Number.isInteger(cantidad) || cantidad < 1) return;
    if (cantidad > stock) return;

    setItems((prev) => {
      const existe = prev.find((item) => item.id_producto === producto.id_producto);

      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidad;
        if (nuevaCantidad > stock) return prev;

        return prev.map((item) =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: nuevaCantidad }
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
    setItems((prev) => prev.filter((item) => item.id_producto !== id));
  };

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio_venta * item.cantidad, 0);
  }, [items]);

  const clienteSeleccionado = useMemo(() => {
    return clientes.find((cliente) => cliente.id_cliente === Number(clienteId)) || null;
  }, [clientes, clienteId]);

  const ultimoCodigoGenerado = useMemo(() => {
    return obtenerUltimoCodigoCliente(clientes);
  }, [clientes]);

  const canAnularVentas = useMemo(() => {
    return userHasRole(user, "ADMIN");
  }, [user]);

  const canCreateClientes = useMemo(() => {
    return userHasRole(user, "ADMIN", "CAJERO");
  }, [user]);

  const abrirNuevoCliente = () => {
    setSuccess("");
    setClienteModalOpen(true);
  };

  const cerrarNuevoCliente = () => {
    if (loadingGuardarCliente) return;
    setClienteModalOpen(false);
  };

  const guardarCliente = async (formData) => {
    try {
      setLoadingGuardarCliente(true);
      setError("");
      setSuccess("");

      const response = await crearCliente(formData);
      const clienteCreado = response?.cliente;

      await cargarClientes();

      if (clienteCreado?.id_cliente) {
        setClienteId(String(clienteCreado.id_cliente));
      }

      setSuccess(
        clienteCreado?.codigo
          ? `Cliente creado y seleccionado correctamente. Codigo asignado: ${clienteCreado.codigo}.`
          : "Cliente creado y seleccionado correctamente."
      );
      setClienteModalOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo guardar el cliente");
    } finally {
      setLoadingGuardarCliente(false);
    }
  };

  const abrirAnulacionVenta = (venta) => {
    if (!canAnularVentas) return;
    setVentaSeleccionada(venta);
    setVentaAnulacionOpen(true);
  };

  const cargarDetalleVenta = useCallback(async (id_venta) => {
    const data = await getVentaCompleta(id_venta);
    setVentaDetalle(data);
    return data;
  }, []);

  const abrirDetalleVenta = async (venta) => {
    try {
      setLoadingDetalleVenta(true);
      setError("");
      setVentaDetalleOpen(true);
      await cargarDetalleVenta(venta.id_venta);
    } catch (err) {
      console.error(err);
      setVentaDetalleOpen(false);
      setError(err.response?.data?.error || "No se pudo cargar el detalle de la venta");
    } finally {
      setLoadingDetalleVenta(false);
    }
  };

  const cerrarDetalleVenta = () => {
    if (loadingDetalleVenta) return;
    setDetalleAnulacionOpen(false);
    setDetalleVentaSeleccionado(null);
    setVentaDetalleOpen(false);
    setVentaDetalle(null);
  };

  const abrirAnulacionDetalleVenta = (detalle) => {
    if (!canAnularVentas) return;
    setDetalleVentaSeleccionado(detalle);
    setDetalleAnulacionOpen(true);
  };

  const cerrarAnulacionDetalleVenta = () => {
    if (loadingAnulacionDetalle) return;
    setDetalleAnulacionOpen(false);
    setDetalleVentaSeleccionado(null);
  };

  const cerrarAnulacionVenta = () => {
    if (loadingAnulacion) return;
    setVentaAnulacionOpen(false);
    setVentaSeleccionada(null);
  };

  const confirmarAnulacionVenta = async (motivo, resetForm) => {
    if (!ventaSeleccionada) return;

    try {
      setLoadingAnulacion(true);
      setError("");
      setSuccess("");

      await anularVenta(ventaSeleccionada.id_venta, { motivo });
      await Promise.all([cargarProductos(), cargarVentasRecientes()]);

      setSuccess(`Venta #${ventaSeleccionada.id_venta} anulada correctamente.`);
      resetForm();
      setVentaAnulacionOpen(false);
      setVentaSeleccionada(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo anular la venta");
    } finally {
      setLoadingAnulacion(false);
    }
  };

  const confirmarAnulacionDetalleVenta = async ({ cantidad, motivo }) => {
    const ventaId = ventaDetalle?.venta?.id_venta;
    const detalleId = detalleVentaSeleccionado?.id_detalle;

    if (!ventaId || !detalleId) return;

    try {
      setLoadingAnulacionDetalle(true);
      setError("");
      setSuccess("");

      await anularDetalleVenta(ventaId, detalleId, {
        cantidad,
        motivo,
      });

      await Promise.all([
        cargarProductos(),
        cargarVentasRecientes(),
        cargarDetalleVenta(ventaId),
      ]);

      setSuccess(
        `Detalle de la venta #${ventaId} anulado correctamente por ${cantidad} unidad(es).`
      );
      setDetalleAnulacionOpen(false);
      setDetalleVentaSeleccionado(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudo anular el detalle de la venta");
    } finally {
      setLoadingAnulacionDetalle(false);
    }
  };

  const finalizarVenta = async () => {
    if (!items.length) return;

    if (tipoVenta === "CREDITO" && !clienteId) {
      setError("Selecciona un cliente para registrar una venta a credito.");
      return;
    }

    try {
      setLoadingVenta(true);
      setError("");
      setSuccess("");

      await crearVenta({
        tipo_venta: tipoVenta,
        metodo_pago: metodoPago,
        id_sucursal: 1,
        id_cliente: clienteId ? Number(clienteId) : null,
        items: items.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
        })),
      });

      setItems([]);
      setClienteId("");
      setTipoVenta("CONTADO");
      setMetodoPago("EFECTIVO");
      setSuccess("Venta registrada correctamente.");
      await Promise.all([cargarProductos(), cargarVentasRecientes(), cargarCajaActiva()]);
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
            Registra ventas rapidas, controla existencias y anula ventas con motivo.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {!loadingCaja && !cajaActiva && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={(
              <Button component={RouterLink} to="/caja" color="inherit" size="small">
                Abrir caja
              </Button>
            )}
          >
            Debes abrir una caja antes de registrar ventas desde este punto de venta.
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gap: 3,
            alignItems: "start",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(320px, 5fr) minmax(460px, 7fr)",
            },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
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
          </Box>

          <Box
            sx={{
              minWidth: 0,
              position: { xs: "static", lg: "sticky" },
              top: { lg: 24 },
              alignSelf: "start",
            }}
          >
            <Stack spacing={3} sx={{ minWidth: 0 }}>
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
                  <Grid item xs={12}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      alignItems={{ xs: "stretch", md: "flex-end" }}
                    >
                      <FormControl fullWidth disabled={loadingClientes}>
                        <InputLabel id="cliente-select-label">Cliente</InputLabel>
                        <Select
                          labelId="cliente-select-label"
                          value={clienteId}
                          label="Cliente"
                          onChange={(event) => setClienteId(event.target.value)}
                        >
                          <MenuItem value="">Consumidor final / Sin cliente</MenuItem>
                          {clientes.map((cliente) => (
                            <MenuItem
                              key={cliente.id_cliente}
                              value={String(cliente.id_cliente)}
                            >
                              {cliente.codigo} - {cliente.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {canCreateClientes && (
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={abrirNuevoCliente}
                          disabled={loadingClientes || loadingVenta}
                          sx={{ minWidth: { xs: "100%", md: 190 } }}
                        >
                          Nuevo cliente
                        </Button>
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, minHeight: { xs: "auto", md: 44 } }}
                    >
                      {clienteSeleccionado
                        ? `Cliente seleccionado: ${clienteSeleccionado.nombre}${clienteSeleccionado.nit ? ` - NIT ${clienteSeleccionado.nit}` : ""}`
                        : !canCreateClientes
                          ? "Puedes asignar un cliente existente a la venta."
                          : ultimoCodigoGenerado?.codigo
                          ? `Puedes registrar la venta sin cliente, asignarla a uno del catalogo o crear un cliente nuevo. Ultimo codigo generado: ${ultimoCodigoGenerado.codigo}.`
                          : "Puedes registrar la venta sin cliente, asignarla a uno del catalogo o crear un cliente nuevo."}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Tipo de venta
                    </Typography>
                    <Select
                      fullWidth
                      value={tipoVenta}
                      onChange={(event) => setTipoVenta(event.target.value)}
                    >
                      <MenuItem value="CONTADO">CONTADO</MenuItem>
                      <MenuItem value="CREDITO">CREDITO</MenuItem>
                    </Select>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Metodo de pago
                    </Typography>
                    <Select
                      fullWidth
                      value={metodoPago}
                      onChange={(event) => setMetodoPago(event.target.value)}
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
                    disabled={!items.length || loadingVenta || loadingCaja || !cajaActiva}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: "bold",
                      minWidth: 220,
                    }}
                  >
                    {loadingVenta
                      ? "Procesando..."
                      : loadingCaja
                        ? "Validando caja..."
                        : !cajaActiva
                          ? "Abre caja para vender"
                          : "Finalizar venta"}
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ mt: 3, p: 3, borderRadius: 4 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Ventas recientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {canAnularVentas
                  ? "Puedes anular una venta completa indicando el motivo."
                  : "Puedes consultar el historial y el detalle de ventas. Solo un administrador puede anular."}
              </Typography>
            </Box>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                label="Desde"
                type="date"
                value={fechaDesdeVentas}
                onChange={(event) => setFechaDesdeVentas(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
              />

              <TextField
                label="Hasta"
                type="date"
                value={fechaHastaVentas}
                onChange={(event) => setFechaHastaVentas(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: { xs: "100%", md: 180 } }}
              />

              <FormControl sx={{ minWidth: { xs: "100%", md: 180 } }}>
                <InputLabel id="estado-ventas-label">Estado</InputLabel>
                <Select
                  labelId="estado-ventas-label"
                  value={estadoFiltroVentas}
                  label="Estado"
                  onChange={(event) => setEstadoFiltroVentas(event.target.value)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="COMPLETADA">Completadas</MenuItem>
                  <MenuItem value="ANULADA">Anuladas</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="text"
                onClick={limpiarFiltrosVentas}
                sx={{ alignSelf: { xs: "stretch", md: "center" } }}
              >
                Limpiar filtros
              </Button>
            </Stack>
          </Paper>

          <VentasRecientesTable
            ventas={ventasRecientes}
            loading={loadingVentasRecientes}
            onViewDetail={abrirDetalleVenta}
            onAnular={abrirAnulacionVenta}
            canAnular={canAnularVentas}
          />
        </Paper>
      </Box>

      {canCreateClientes && (
        <ClienteFormModal
          key={`venta-cliente-${clienteModalOpen ? "open" : "closed"}`}
          open={clienteModalOpen}
          onClose={cerrarNuevoCliente}
          onSave={guardarCliente}
          loading={loadingGuardarCliente}
        />
      )}

      <VentaAnulacionModal
        open={ventaAnulacionOpen}
        onClose={cerrarAnulacionVenta}
        onConfirm={confirmarAnulacionVenta}
        loading={loadingAnulacion}
        venta={ventaSeleccionada}
      />

      <VentaDetalleModal
        open={ventaDetalleOpen}
        onClose={cerrarDetalleVenta}
        ventaData={ventaDetalle}
        loading={loadingDetalleVenta}
        onAnularDetalle={abrirAnulacionDetalleVenta}
        loadingAnulacionDetalle={loadingAnulacionDetalle}
        detalleAnulandoId={detalleVentaSeleccionado?.id_detalle ?? null}
        canAnular={canAnularVentas}
      />

      <VentaDetalleAnulacionModal
        key={`venta-detalle-anulacion-${detalleVentaSeleccionado?.id_detalle ?? "none"}-${detalleAnulacionOpen ? "open" : "closed"}`}
        open={detalleAnulacionOpen}
        onClose={cerrarAnulacionDetalleVenta}
        onConfirm={confirmarAnulacionDetalleVenta}
        loading={loadingAnulacionDetalle}
        venta={ventaDetalle?.venta}
        detalle={detalleVentaSeleccionado}
      />
    </Container>
  );
}

export default Ventas;
