import { useMemo, useState } from "react";

function BuscarProducto({ productos, onAgregar }) {
  const [busqueda, setBusqueda] = useState("");

  const resultados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    if (!texto) return productos.slice(0, 8);

    return productos
      .filter((p) => {
        return (
          String(p.nombre || "").toLowerCase().includes(texto) ||
          String(p.codigo_barras || "").toLowerCase().includes(texto) ||
          String(p.descripcion || "").toLowerCase().includes(texto)
        );
      })
      .slice(0, 10);
  }, [productos, busqueda]);

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Buscar producto</h2>
        <p className="text-sm text-gray-500">
          Busca por nombre, código o descripción
        </p>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Ej. Aceite 20W50"
        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {resultados.length === 0 ? (
          <p className="text-sm text-gray-500">No se encontraron productos.</p>
        ) : (
          resultados.map((producto) => {
            const stock = Number(producto.stock || 0);
            const sinStock = stock <= 0;

            return (
              <button
                key={producto.id_producto}
                type="button"
                onClick={() => {
                  if (!sinStock) onAgregar(producto);
                }}
                disabled={sinStock}
                className={`w-full text-left border rounded-xl p-3 transition ${
                  sinStock
                    ? "bg-gray-100 cursor-not-allowed opacity-70"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{producto.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {producto.codigo_barras || "Sin código"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      Q {Number(producto.precio_venta || 0).toFixed(2)}
                    </p>

                    <p
                      className={`text-sm font-medium ${
                        sinStock ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      Stock: {stock}
                    </p>

                    <p className="text-xs text-gray-500">
                      {sinStock ? "Sin existencia" : "Agregar"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BuscarProducto;