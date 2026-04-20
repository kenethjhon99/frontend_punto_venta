import api from "./api";

export const getTraslados = async (params = {}) => {
  const res = await api.get("/traslados", { params });
  return res.data;
};

export const getTrasladoById = async (id) => {
  const res = await api.get(`/traslados/${id}`);
  return res.data;
};

export const crearTraslado = async (data) => {
  const res = await api.post("/traslados", data);
  return res.data;
};

export const anularTraslado = async (id, data) => {
  const res = await api.patch(`/traslados/${id}/anular`, data);
  return res.data;
};

export const getBodegas = async () => {
  const res = await api.get("/traslados/bodegas");
  return res.data;
};

export const getStockBodega = async (idBodega) => {
  const res = await api.get(`/traslados/bodegas/${idBodega}/stock`);
  return res.data;
};
