import api from "./api";

export const crearVenta = async (data) => {
  const res = await api.post("/ventas", data);
  return res.data;
};