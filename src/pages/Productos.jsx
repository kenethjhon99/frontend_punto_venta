import { useEffect, useMemo, useState } from "react";
import ProductoFormModal from "../components/productos/ProductoFormModal";
import ProductoTable from "../components/productos/ProductoTable";

import {
  getProductos,
  crearProducto,
  editarProducto,
  desactivarProducto,
} from "../services/productoService";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(true);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    try {
      setLoadingLista(true);
      setError("");
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los productos");
    } finally {
      setLoadingLista(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase();

    return productos.filter((p) => {
      return (
        String(p.nombre || "").toLowerCase().includes(texto) ||
        String(p.descripcion || "").toLowerCase().includes(texto) ||
        String(p.codigo_barras || "").toLowerCase().includes(texto)
      );
    });
  }, [productos, busqueda]);

  const abrirNuevo = () => {
    setProductoEditando(null);
    setModalOpen(true);
  };

  const abrirEditar = (producto) => {
    setProductoEditando(producto);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setProductoEditando(null);
  };

  const guardarProducto = async (formData) => {
    try {
      setLoading(true);

      if (productoEditando) {
        await editarProducto(productoEditando.id_producto, formData);
      } else {
        await crearProducto(formData);
      }

      await cargarProductos();
      cerrarModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (producto) => {
    const confirmar = window.confirm(
      `¿Deseas desactivar el producto "${producto.nombre}"?`
    );

    if (!confirmar) return;

    try {
      await desactivarProducto(producto.id_producto);
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo desactivar el producto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-500">
            Administra el catálogo de productos de tu punto de venta
          </p>
        </div>

        <button
          onClick={abrirNuevo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <input
          type="text"
          placeholder="Buscar por nombre, descripción o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {loadingLista ? (
        <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
          Cargando productos...
        </div>
      ) : (
        <ProductoTable
          productos={productosFiltrados}
          onEdit={abrirEditar}
          onDelete={eliminarProducto}
        />
      )}

      <ProductoFormModal
        open={modalOpen}
        onClose={cerrarModal}
        onSave={guardarProducto}
        productoEditando={productoEditando}
        loading={loading}
      />
    </div>
  );
}

export default Productos;