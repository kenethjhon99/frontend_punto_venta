import api from "./api";

export const getCreditosEmpleado = async (params = {}) => {
  const res = await api.get("/creditos-empleado", { params });
  return res.data;
};

export const getCreditoEmpleado = async (id) => {
  const res = await api.get(`/creditos-empleado/${id}`);
  return res.data;
};

export const getAlertasCreditoEmpleado = async () => {
  const res = await api.get("/creditos-empleado/alertas");
  return res.data;
};

export const getNominaProxima = async () => {
  const res = await api.get("/creditos-empleado/nomina-proxima");
  return res.data;
};

export const cobrarCreditoEmpleado = async (id, data = {}) => {
  const res = await api.patch(`/creditos-empleado/${id}/cobrar`, data);
  return res.data;
};

export const cobrarCreditosDeEmpleado = async (idEmpleado, data = {}) => {
  const res = await api.post(`/creditos-empleado/empleado/${idEmpleado}/cobrar`, data);
  return res.data;
};

export const condonarCreditoEmpleado = async (id, data) => {
  const res = await api.patch(`/creditos-empleado/${id}/condonar`, data);
  return res.data;
};
