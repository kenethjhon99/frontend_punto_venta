import axios from "axios";
import { clearStoredSession, isTokenValid } from "../utils/authSession";

const envApiUrl = String(import.meta.env.VITE_API_URL || "").trim();

const API_BASE_URL = envApiUrl
  || (import.meta.env.DEV ? "http://localhost:3000/api" : "/api");

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Cualquier endpoint que sea parte del flujo de auth (login, register)
// no debe disparar el manejo de "sesion expirada" cuando devuelve 401:
// ahi un 401 significa "credenciales malas", no "token vencido".
const isAuthEndpoint = (config) => {
  const url = String(config?.url || "");
  return url.includes("/auth/login") || url.includes("/auth/register");
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isAuthEndpoint(error.config)) {
      clearStoredSession();
      window.dispatchEvent(new Event("auth:changed"));

      // Redirect a /login si no estamos ya alli. Sin esto, las paginas
      // protegidas se quedan montadas sin token y muestran pantalla en
      // blanco hasta que el usuario navega manualmente.
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        // replace para que el back del browser no regrese a la pagina
        // protegida que acaba de fallar.
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
