export const DIAS_SEMANA = [{ valor: "SEMANAL", label: "Fin de semana" }];

export const DIAS_MES = [{ valor: "MENSUAL", label: "Fin de mes" }];

export const etiquetaDiaPago = (empleado) => {
  const tipo = String(empleado?.tipo_pago || "").toUpperCase();
  if (tipo === "SEMANAL") return "Fin de semana";
  if (tipo === "MENSUAL") return "Fin de mes";
  return "-";
};

export const calcularFechaCobro = (empleado, fechaBase = new Date()) => {
  if (!empleado || typeof empleado !== "object") return null;

  const tipo = String(empleado.tipo_pago || "").toUpperCase();
  const base = new Date(fechaBase);
  base.setHours(0, 0, 0, 0);

  if (tipo === "SEMANAL") {
    const diaPagoIso = 5;
    const diaActualIso = base.getDay() === 0 ? 7 : base.getDay();
    const diff = (diaPagoIso - diaActualIso + 7) % 7;
    const offset = diff === 0 ? 7 : diff;
    const r = new Date(base);
    r.setDate(base.getDate() + offset);
    return r;
  }

  if (tipo === "MENSUAL") {
    const anio = base.getFullYear();
    const mes = base.getMonth();
    const hoy = base.getDate();
    const ultimoDelMes = (y, m) => new Date(y, m + 1, 0).getDate();
    const diaObjetivoEsteMes = ultimoDelMes(anio, mes);

    if (hoy >= diaObjetivoEsteMes) {
      return new Date(anio, mes + 1, ultimoDelMes(anio, mes + 1));
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
