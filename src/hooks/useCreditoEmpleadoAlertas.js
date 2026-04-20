import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { userHasRole } from "../utils/roles";
import { getAlertasCreditoEmpleado } from "../services/creditoEmpleadoService";

const EMPTY_ALERTAS = {
  resumen: {
    vencidos: 0,
    por_vencer: 0,
    vigentes: 0,
    saldo_total_pendiente: 0,
  },
  top: [],
};

const DEFAULT_INTERVAL_MS = 60_000; // 60s

/**
 * Hook de polling para las alertas de creditos a empleados.
 * Consulta `/api/creditos-empleado/alertas` cada `intervalMs` ms mientras
 * la pestania esta visible. Solo dispara el fetch si el usuario tiene rol
 * ADMIN/SUPER_ADMIN/LECTURA (quienes pueden ver la pagina). Para otros
 * roles devuelve el estado "vacio" sin hacer requests.
 */
export function useCreditoEmpleadoAlertas({
  intervalMs = DEFAULT_INTERVAL_MS,
} = {}) {
  const { user } = useAuth();
  const puedeVer = userHasRole(user, "SUPER_ADMIN", "ADMIN", "LECTURA");

  const [data, setData] = useState(EMPTY_ALERTAS);
  const [loading, setLoading] = useState(puedeVer);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchAlertas = useCallback(async () => {
    if (!puedeVer) {
      setData(EMPTY_ALERTAS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resp = await getAlertasCreditoEmpleado();
      // el controller responde { resumen, top }
      const payload = resp?.data || resp || {};
      setData({
        resumen: {
          ...EMPTY_ALERTAS.resumen,
          ...(payload.resumen || {}),
        },
        top: Array.isArray(payload.top) ? payload.top : [],
      });
      setError("");
    } catch (err) {
      // no-op: no bloqueamos UI, solo logueamos
      console.error("[alertas-credito-empleado]", err);
      setError(
        err?.response?.data?.error ||
          "No se pudieron cargar las alertas de credito"
      );
    } finally {
      setLoading(false);
    }
  }, [puedeVer]);

  useEffect(() => {
    if (!puedeVer) {
      setData(EMPTY_ALERTAS);
      setLoading(false);
      return undefined;
    }

    let cancelado = false;
    let timerId = null;

    const tick = async () => {
      if (cancelado) return;
      await fetchAlertas();
    };

    const start = () => {
      tick();
      timerId = window.setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timerId != null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        if (timerId == null) {
          timerId = window.setInterval(tick, intervalMs);
        }
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelado = true;
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [puedeVer, intervalMs, fetchAlertas]);

  return {
    resumen: data.resumen,
    top: data.top,
    loading,
    error,
    refetch: fetchAlertas,
    puedeVer,
  };
}

export default useCreditoEmpleadoAlertas;
