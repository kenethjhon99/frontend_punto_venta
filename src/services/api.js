import axios from "axios";
import { clearStoredSession, isTokenValid } from "../utils/authSession";

const api = axios.create({
  baseURL: "http://localhost:3000/api" || "https://github.com/kenethjhon99/sistema-cobros",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    if (!isTokenValid(token)) {
      clearStoredSession();
      window.dispatchEvent(new Event("auth:changed"));
      return Promise.reject(new axios.CanceledError("Sesion expirada"));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredSession();
      window.dispatchEvent(new Event("auth:changed"));
    }

    return Promise.reject(error);
  }
);

export default api;
