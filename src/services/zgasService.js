import api from "./api";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

export const zgasService = {
  dashboard: () => api.get("/zgas/dashboard").then((res) => res.data),
  catalogos: () => api.get("/zgas/catalogos").then((res) => res.data),
  crearZona: (payload) => api.post("/zgas/zonas", payload).then((res) => res.data),
  stock: () => api.get("/zgas/stock").then((res) => res.data),
  ajustarStock: (payload) => api.post("/zgas/stock/ajuste", payload).then((res) => res.data),
  actualizarMinimoStock: (payload) => api.patch("/zgas/stock/minimo", payload).then((res) => res.data),
  movimientosStock: (params = {}) =>
    api.get("/zgas/stock/movimientos", { params: cleanParams(params) }).then((res) => res.data),
  revertirEntradaStock: (id, payload) =>
    api.patch(`/zgas/stock/movimientos/${id}/revertir`, payload).then((res) => res.data),

  clientes: (params = {}) =>
    api.get("/zgas/clientes", { params: cleanParams(params) }).then((res) => res.data),
  crearCliente: (payload) => api.post("/zgas/clientes", payload).then((res) => res.data),
  actualizarCliente: (id, payload) => api.put(`/zgas/clientes/${id}`, payload).then((res) => res.data),
  desactivarCliente: (id) => api.patch(`/zgas/clientes/${id}/desactivar`).then((res) => res.data),
  activarCliente: (id) => api.patch(`/zgas/clientes/${id}/activar`).then((res) => res.data),
  historialCliente: (id) => api.get(`/zgas/clientes/${id}/historial`).then((res) => res.data),

  precios: (params = {}) =>
    api.get("/zgas/precios", { params: cleanParams(params) }).then((res) => res.data),
  precioActivo: (params = {}) =>
    api.get("/zgas/precios/activo", { params: cleanParams(params) }).then((res) => res.data),
  guardarPrecio: (payload) => api.post("/zgas/precios", payload).then((res) => res.data),

  pedidos: (params = {}) =>
    api.get("/zgas/pedidos", { params: cleanParams(params) }).then((res) => res.data),
  crearPedido: (payload) => api.post("/zgas/pedidos", payload).then((res) => res.data),
  actualizarPedido: (id, payload) => api.put(`/zgas/pedidos/${id}`, payload).then((res) => res.data),
  asignarPedido: (id, payload) => api.patch(`/zgas/pedidos/${id}/asignar`, payload).then((res) => res.data),
  salidaPedido: (id) => api.patch(`/zgas/pedidos/${id}/salida`).then((res) => res.data),
  regresoPedido: (id, payload = {}) => api.patch(`/zgas/pedidos/${id}/regreso`, payload).then((res) => res.data),
  cancelarPedido: (id, payload) => api.patch(`/zgas/pedidos/${id}/cancelar`, payload).then((res) => res.data),
  liquidarPedido: (id, payload) => api.patch(`/zgas/pedidos/${id}/liquidar`, payload).then((res) => res.data),

  rutas: (params = {}) =>
    api.get("/zgas/rutas", { params: cleanParams(params) }).then((res) => res.data),
  crearRuta: (payload) => api.post("/zgas/rutas", payload).then((res) => res.data),
  salidaRuta: (id, payload) => api.patch(`/zgas/rutas/${id}/salida`, payload).then((res) => res.data),
  regresoRuta: (id, payload) => api.patch(`/zgas/rutas/${id}/regreso`, payload).then((res) => res.data),
  liquidarRuta: (id, payload) => api.patch(`/zgas/rutas/${id}/liquidar`, payload).then((res) => res.data),
  cancelarRuta: (id, payload) => api.patch(`/zgas/rutas/${id}/cancelar`, payload).then((res) => res.data),

  rellenos: (params = {}) =>
    api.get("/zgas/rellenos", { params: cleanParams(params) }).then((res) => res.data),
  resumenRellenos: (params = {}) =>
    api.get("/zgas/rellenos/resumen", { params: cleanParams(params) }).then((res) => res.data),
  crearRelleno: (payload) => api.post("/zgas/rellenos", payload).then((res) => res.data),

  liquidaciones: (params = {}) =>
    api.get("/zgas/liquidaciones", { params: cleanParams(params) }).then((res) => res.data),
  auditoria: (params = {}) =>
    api.get("/zgas/auditoria", { params: cleanParams(params) }).then((res) => res.data),
  reportes: (params = {}) =>
    api.get("/zgas/reportes", { params: cleanParams(params) }).then((res) => res.data),
};
