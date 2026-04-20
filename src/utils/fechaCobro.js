/**
 * Espejo en frontend del util `calcularFechaCobro.js` del backend.
 * Permite al panel de venta a credito mostrar la fecha estimada en vivo
 * sin necesidad de round-trip.
 */

export const DIAS_SEMANA = [
  { valor: 1, label: "Lunes" },
  { valor: 2, label: "Martes" },
  { valor: 3, label: "Miercoles" },
  { valor: 4, label: "Jueves" },
  { valor: 5, label: "Viernes" },
  { valor: 6, label: "Sabado" },
  { valor: 7, label: "Domingo" },
];

export const DIAS_MES = (() => {
  const dias = [];
  for (let d = 1; d <= 28; d += 1) {
    dias.push({ valor: d, label: `Dia ${d}` });
  }
  dias.push({ valor: 0, label: "Ultimo dia del mes" });
  return dias;
})();

export const etiquetaDiaPago = (empleado) => {
  if (!empleado || empleado.dia_pago == null) return "-";
  const tipo = String(empleado.tipo_pago || "").toUpperCase();

  if (tipo === "SEMANAL") {
    return DIAS_SEMANA.find((d) => d.valor === Number(empleado.dia_pago))?.label || "-";
  }

  if (tipo === "MENSUAL") {
    if (Number(empleado.dia_pago) === 0) return "Ultimo dia del mes";
    return `Dia ${empleado.dia_pago} del mes`;
  }

  return "-";
};

export const calcularFechaCobro = (empleado, fechaBase = new Date()) => {
  if (!empleado || typeof empleado !== "object") return null;

  const tipo = String(empleado.tipo_pago || "").toUpperCase();
  const dia = Number(empleado.dia_pago);

  if (!Number.isInteger(dia)) return null;

  const base = new Date(fechaBase);
  base.setHours(0, 0, 0, 0);

  if (tipo === "SEMANAL") {
    if (dia < 1 || dia > 7) return null;
    const diaActualIso = base.getDay() === 0 ? 7 : base.getDay();
    const diff = (dia - diaActualIso + 7) % 7;
    const offset = diff === 0 ? 7 : diff;
    const r = new Date(base);
    r.setDate(base.getDate() + offset);
    return r;
  }

  if (tipo === "MENSUAL") {
    if (dia < 0 || dia > 28) return null;
    const anio = base.getFullYear();
    const mes = base.getMonth();
    const hoy = base.getDate();
    const ultimoDelMes = (y, m) => new Date(y, m + 1, 0).getDate();
    const diaObjetivoEsteMes = dia === 0 ? ultimoDelMes(anio, mes) : dia;
    if (hoy >= diaObjetivoEsteMes) {
      const diaObjetivoProxMes =
        dia === 0 ? ultimoDelMes(anio, mes + 1) : dia;
      return new Date(anio, mes + 1, diaObjetivoProxMes);
    }
    return new Date(anio, mes, diaObjetivoEsteMes);
  }

  return null;
};

export const formatFechaCobro = (date) => {
  if (!date) return "-";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-GT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
