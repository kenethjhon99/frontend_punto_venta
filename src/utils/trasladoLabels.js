const EMPTY_LABEL = "-";

const asText = (value) => {
  const text = String(value ?? "").trim();
  return text || "";
};

export const getBodegaLabel = (bodega) => {
  if (!bodega || typeof bodega !== "object") return EMPTY_LABEL;

  return (
    asText(bodega.nombre_visible) ||
    asText(bodega.bodega_nombre_visible) ||
    asText(bodega.origen_nombre_visible) ||
    asText(bodega.destino_nombre_visible) ||
    asText(bodega.nombre) ||
    asText(bodega.bodega_nombre) ||
    asText(bodega.bodega_origen_nombre) ||
    asText(bodega.bodega_destino_nombre) ||
    EMPTY_LABEL
  );
};

// Alias de compatibilidad para evitar caidas si algun bundle viejo
// o componente rezagado sigue usando el nombre anterior.
export const getBucketLabel = getBodegaLabel;

export const getTrasladoSideLabel = (traslado, side) => {
  if (!traslado || typeof traslado !== "object") return EMPTY_LABEL;

  if (side === "origen") {
    return (
      asText(traslado.origen_nombre_visible) ||
      asText(traslado.bodega_origen_nombre_visible) ||
      asText(traslado.nombre_origen_visible) ||
      asText(traslado.bodega_origen_nombre) ||
      EMPTY_LABEL
    );
  }

  return (
    asText(traslado.destino_nombre_visible) ||
    asText(traslado.bodega_destino_nombre_visible) ||
    asText(traslado.nombre_destino_visible) ||
    asText(traslado.bodega_destino_nombre) ||
    EMPTY_LABEL
  );
};
