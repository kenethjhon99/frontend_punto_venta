import api from "./api";

export const getEmpleados = async (params = {}) => {
  const res = await api.get("/empleados", { params });
  return res.data;
};

export const crearEmpleado = async (data) => {
  const res = await api.post("/empleados", data);
  return res.data;
};

export const editarEmpleado = async (id, data) => {
  const res = await api.put(`/empleados/${id}`, data);
  return res.data;
};

export const desactivarEmpleado = async (id) => {
  const res = await api.patch(`/empleados/${id}/desactivar`);
  return res.data;
};

export const activarEmpleado = async (id) => {
  const res = await api.patch(`/empleados/${id}/activar`);
  return res.data;
};
