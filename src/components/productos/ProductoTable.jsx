function ProductoTable({ productos, onEdit, onDelete }) {
  if (!productos.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
        No hay productos para mostrar.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Descripción</th>
              <th className="text-left px-4 py-3">Compra</th>
              <th className="text-left px-4 py-3">Venta</th>
              <th className="text-left px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Acciones</th>

            </tr>
          </thead>

          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id_producto} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{producto.id_producto}</td>
                <td className="px-4 py-3">{producto.codigo_barras || "-"}</td>
                <td className="px-4 py-3 font-medium">{producto.nombre}</td>
                <td className="px-4 py-3">{producto.descripcion || "-"}</td>
                <td className="px-4 py-3">Q {Number(producto.precio_compra).toFixed(2)}</td>
                <td className="px-4 py-3">Q {Number(producto.precio_venta).toFixed(2)}</td>
                <td className="px-4 py-3">{producto.existencia_inicial}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(producto)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => onDelete(producto)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductoTable;