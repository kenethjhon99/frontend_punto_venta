const EMPTY_LABEL = "-";

const CATALOGO_LABELS = {
  GENERAL: "General",
  PRINCIPAL: "General",
  TIENDA: "Tienda / Productos Taller",
  TIENDA_TALLER: "Tienda / Productos Taller",
  PRODUCTOS_TALLER: "Tienda / Productos Taller",
  SERVICIOS: "Tienda / Productos Taller",
  TALLER: "Tienda / Productos Taller",
};

const asText = (value) => {
  const text = String(value ?? "").trim();
  return text || "";
};

const normalizeCatalogKey = (value) => {
  const key = String(value ?? "").trim().toUpperCase();
  if (!key) return "";
  if (key === "SERVICIOS") return "PRODUCTOS_TALLER";
  if (key === "TALLER") return "PRODUCTOS_TALLER";
  return key;
};

const getCatalogLabel = (value) => {
  const normalized = normalizeCatalogKey(value);
  return CATALOGO_LABELS[normalized] || "";
};

const resolveCatalogLabelFromObject = (entity) => {
  if (!entity || typeof entity !== "object") return "";

  return (
    getCatalogLabel(entity.catalogo) ||
    getCatalogLabel(entity.catalogo_origen) ||
    getCatalogLabel(entity.catalogo_destino) ||
    getCatalogLabel(entity.bucket_key) ||
    getCatalogLabel(entity.modulo_origen) ||
    getCatalogLabel(entity.modulo_destino) ||
    ""
  );
};

const resolveLegacyNameLabel = (value) => {
  const normalized = normalizeCatalogKey(value);
  return CATALOGO_LABELS[normalized] || "";
};

export const getBodegaLabel = (bodega) => {
  if (!bodega || typeof bodega !== "object") return EMPTY_LABEL;

  return (
    resolveCatalogLabelFromObject(bodega) ||
    resolveLegacyNameLabel(bodega.nombre_visible) ||
    resolveLegacyNameLabel(bodega.bodega_nombre_visible) ||
    resolveLegacyNameLabel(bodega.origen_nombre_visible) ||
    resolveLegacyNameLabel(bodega.destino_nombre_visible) ||
    resolveLegacyNameLabel(bodega.nombre) ||
    resolveLegacyNameLabel(bodega.bodega_nombre) ||
    resolveLegacyNameLabel(bodega.bodega_origen_nombre) ||
    resolveLegacyNameLabel(bodega.bodega_destino_nombre) ||
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
// o componente rezagado sigue usando nombres anteriores.
export const getBucketLabel = getBodegaLabel;
export const getCatalogoLabel = getBodegaLabel;

export const getTrasladoSideLabel = (traslado, side) => {
  if (!traslado || typeof traslado !== "object") return EMPTY_LABEL;

  if (side === "origen") {
    return (
      getCatalogLabel(traslado.catalogo_origen) ||
      getCatalogLabel(traslado.origen_bucket_key) ||
      getCatalogLabel(traslado.modulo_origen) ||
      asText(traslado.origen_nombre_visible) ||
      asText(traslado.bodega_origen_nombre_visible) ||
      asText(traslado.nombre_origen_visible) ||
      asText(traslado.bodega_origen_nombre) ||
      EMPTY_LABEL
    );
  }

  return (
    getCatalogLabel(traslado.catalogo_destino) ||
    getCatalogLabel(traslado.destino_bucket_key) ||
    getCatalogLabel(traslado.modulo_destino) ||
    asText(traslado.destino_nombre_visible) ||
    asText(traslado.bodega_destino_nombre_visible) ||
    asText(traslado.nombre_destino_visible) ||
    asText(traslado.bodega_destino_nombre) ||
    EMPTY_LABEL
  );
};
