import api from "./api";

/**
 * A partir de Fase 4b.2 los traslados entre bodegas estan retirados:
 * el inventario vive en una sola bodega PRINCIPAL. Se conservan los
 * endpoints de lectura (listado + detalle) para consulta historica.
 */

export const getTraslados = async (params = {}) => {
  const res = await api.get("/traslados", { params });
  return res.data;
};

export const getTrasladoById = async (id) => {
  const res = await api.get(`/traslados/${id}`);
  return res.data;
};
