function VentaTable({ items, onCambiarCantidad, onEliminar }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
        No hay productos agregados a la venta.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">Precio</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-left px-4 py-3">Cantidad</th>
              <th className="text-left px-4 py-3">Subtotal</th>
              <th className="text-center px-4 py-3">Acción</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id_producto} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{item.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {item.codigo_barras || "Sin código"}
                  </p>
                </td>

                <td className="px-4 py-3">
                  Q {Number(item.precio_venta).toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  <span className="font-medium text-blue-700">{item.stock}</span>
                </td>

                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.cantidad}
                    onChange={(e) =>
                      onCambiarCantidad(item.id_producto, Number(e.target.value))
                    }
                    className="w-24 border rounded-lg px-3 py-2"
                  />
                </td>

                <td className="px-4 py-3 font-semibold">
                  Q {(Number(item.precio_venta) * Number(item.cantidad)).toFixed(2)}
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onEliminar(item.id_producto)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VentaTable;