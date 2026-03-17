import { useEffect, useState } from "react";

const initialState = {
  codigo_barras: "",
  nombre: "",
  descripcion: "",
  precio_compra: "",
  precio_venta: "",
  existencia_inicial: "",
  stock_minimo: "",
  ubicacion: "",
};

function ProductoFormModal({ open, onClose, onSave, productoEditando, loading }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (productoEditando) {
      setForm({
        codigo_barras: productoEditando.codigo_barras || "",
        nombre: productoEditando.nombre || "",
        descripcion: productoEditando.descripcion || "",
        precio_compra: productoEditando.precio_compra || "",
        precio_venta: productoEditando.precio_venta || "",
        existencia_inicial: productoEditando.stock ?? 0,
        stock_minimo: productoEditando.stock_minimo ?? 0,
        ubicacion: productoEditando.ubicacion || "",
      });
    } else {
      setForm(initialState);
    }
  }, [productoEditando, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      codigo_barras: form.codigo_barras,
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio_compra: Number(form.precio_compra),
      precio_venta: Number(form.precio_venta),
      existencia_inicial: Number(form.existencia_inicial || 0),
      stock_minimo: Number(form.stock_minimo || 0),
      ubicacion: form.ubicacion || null,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {productoEditando ? "Editar producto" : "Nuevo producto"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de barras
            </label>
            <input
              type="text"
              name="codigo_barras"
              value={form.codigo_barras}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. 7501234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del producto"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio compra
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_compra"
              value={form.precio_compra}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio venta
            </label>
            <input
              type="number"
              step="0.01"
              name="precio_venta"
              value={form.precio_venta}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {productoEditando ? "Stock" : "Stock inicial"}
            </label>
            <input
              type="number"
              min="0"
              name="existencia_inicial"
              value={form.existencia_inicial}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock mínimo
            </label>
            <input
              type="number"
              min="0"
              name="stock_minimo"
              value={form.stock_minimo}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Estante A-1"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Guardando..." : productoEditando ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductoFormModal;