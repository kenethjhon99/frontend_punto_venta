/**
 * Helpers compartidos para la clasificacion por "catalogo" del producto.
 *
 * La columna canonica hoy es "Producto.catalogo" con tres valores:
 *   GENERAL           -> Sin clasificar (bandeja de entrada para admin).
 *   TIENDA            -> Visible en punto de venta (modulo Ventas/Tienda).
 *   PRODUCTOS_TALLER  -> Visible en Servicios y tambien en Tienda.
 *
 * Mientras termina la transicion, el backend tambien expone el campo
 * legacy "modulo_origen" ('GENERAL'/'SERVICIOS'). Estos helpers son
 * tolerantes: si llega catalogo, lo usan; si no, lo derivan.
 */

export const CATALOGO_VALORES = ["GENERAL", "TIENDA", "PRODUCTOS_TALLER"];

export const CATALOGO_OPTIONS = [
  {
    value: "GENERAL",
    label: "General",
    descripcion: "Sin clasificar aun. Solo admin lo ve.",
    chipColor: "default",
    chipVariant: "outlined",
  },
  {
    value: "TIENDA",
    label: "Tienda",
    descripcion: "Visible en Ventas (punto de venta).",
    chipColor: "primary",
    chipVariant: "filled",
  },
  {
    value: "PRODUCTOS_TALLER",
    label: "Productos de Taller",
    descripcion: "Visible en Servicios y tambien en Tienda.",
    chipColor: "success",
    chipVariant: "filled",
  },
];

export const CATALOGO_FILTER_OPTIONS = [
  { value: "TODOS", label: "Todos" },
  ...CATALOGO_OPTIONS.map(({ value, label }) => ({ value, label })),
];

/**
 * Normaliza un string crudo al enum de catalogo. Cualquier valor invalido
 * se mapea a GENERAL para ser conservador.
 */
export const normalizarCatalogo = (raw) => {
  const norm = String(raw || "").trim().toUpperCase();
  if (CATALOGO_VALORES.includes(norm)) return norm;
  // Legacy: el viejo "SERVICIOS" equivale a PRODUCTOS_TALLER.
  if (norm === "SERVICIOS") return "PRODUCTOS_TALLER";
  return "GENERAL";
};

/**
 * Devuelve el catalogo canonico de un registro de producto/stock.
 * Acepta las formas: { catalogo }, { producto_catalogo }, { modulo_origen }
 * y { producto_modulo_origen } para ser tolerante a la fuente (listas de
 * producto, listas de stock y movimientos).
 */
export const resolverCatalogo = (registro) => {
  const preferidos = [registro?.catalogo, registro?.producto_catalogo];
  for (const valor of preferidos) {
    if (valor) {
      const norm = String(valor).trim().toUpperCase();
      if (CATALOGO_VALORES.includes(norm)) return norm;
    }
  }

  const legacy = String(
    registro?.modulo_origen || registro?.producto_modulo_origen || ""
  )
    .trim()
    .toUpperCase();
  if (legacy === "SERVICIOS") return "PRODUCTOS_TALLER";
  return "GENERAL";
};

/**
 * Devuelve las props de Chip (color/variant/label) listas para usar.
 */
export const getCatalogoChipProps = (registro) => {
  const catalogo = resolverCatalogo(registro);
  const option = CATALOGO_OPTIONS.find((o) => o.value === catalogo);
  return option || CATALOGO_OPTIONS[0];
};

/**
 * Traduce el viejo valor modulo_origen en el valor equivalente de catalogo.
 * Util para props heredadas como forceModuloOrigen="SERVICIOS".
 */
export const catalogoDesdeModuloOrigen = (moduloOrigen) => {
  const norm = String(moduloOrigen || "").trim().toUpperCase();
  if (norm === "SERVICIOS") return "PRODUCTOS_TALLER";
  return "GENERAL";
};
