import api from "./api";

export const getTraslados = async (params = {}) => {
  const res = await api.get("/traslados", { params });
  return res.data;
};

export const getTrasladoById = async (id) => {
  const res = await api.get(`/traslados/${id}`);
  return res.data;
};

export const getTrasladoBodegas = async () => {
  const res = await api.get("/traslados/bodegas");
  return res.data;
};

export const getStockTrasladoOrigen = async (idBodega, params = {}) => {
  const res = await api.get(`/traslados/bodegas/${idBodega}/stock`, { params });
  return res.data;
};

export const crearTraslado = async (payload) => {
  const res = await api.post("/traslados", payload);
  return res.data;
};
