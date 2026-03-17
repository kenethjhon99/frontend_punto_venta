import { useEffect, useMemo, useState } from "react";
import BuscarProducto from "../components/ventas/BuscarProducto";
import VentaTable from "../components/ventas/VentaTable";
import { getProductos } from "../services/productoService";
import { crearVenta } from "../services/ventaService";

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [tipoVenta, setTipoVenta] = useState("CONTADO");
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [loadingVenta, setLoadingVenta] = useState(false);
  const [error, setError] = useState("");

  const cargarProductos = async () => {
    try {
      setLoadingProductos(true);
      setError("");
      const data = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "No se pudieron cargar los productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const agregarProducto = (producto) => {
    const stockDisponible = Number(producto.stock || 0);

    if (stockDisponible <= 0) {
      alert(`El producto "${producto.nombre}" no tiene stock disponible.`);
      return;
    }

    setItems((prev) => {
      const existe = prev.find((item) => item.id_producto === producto.id_producto);

      if (existe) {
        if (existe.cantidad >= stockDisponible) {
          alert(`Solo tienes ${stockDisponible} unidades disponibles de "${producto.nombre}".`);
          return prev;
        }

        return prev.map((item) =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          codigo_barras: producto.codigo_barras,
          precio_venta: Number(producto.precio_venta),
          cantidad: 1,
          stock: stockDisponible,
        },
      ];
    });
  };

  const cambiarCantidad = (id_producto, cantidad) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id_producto !== id_producto) return item;

        if (cantidad < 1) return item;

        if (cantidad > Number(item.stock || 0)) {
          alert(`No puedes vender más de ${item.stock} unidades de "${item.nombre}".`);
          return item;
        }

        return { ...item, cantidad };
      })
    );
  };

  const eliminarItem = (id_producto) => {
    setItems((prev) => prev.filter((item) => item.id_producto !== id_producto));
  };

  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      return acc + Number(item.precio_venta) * Number(item.cantidad);
    }, 0);
  }, [items]);

  const finalizarVenta = async () => {
    if (!items.length) {
      alert("Debes agregar al menos un producto");
      return;
    }

    try {
      setLoadingVenta(true);

      const payload = {
        tipo_venta: tipoVenta,
        metodo_pago: metodoPago,
        id_sucursal: 1,
        items: items.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_venta: item.precio_venta,
        })),
      };

      await crearVenta(payload);

      alert("Venta registrada correctamente");
      setItems([]);
      setMetodoPago("EFECTIVO");
      setTipoVenta("CONTADO");
      await cargarProductos();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo registrar la venta");
    } finally {
      setLoadingVenta(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        {loadingProductos ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
            Cargando productos...
          </div>
        ) : (
          <BuscarProducto productos={productos} onAgregar={agregarProducto} />
        )}
      </div>

      <div className="xl:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
          <p className="text-gray-500">
            Registra ventas rápidas desde el punto de venta
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <VentaTable
          items={items}
          onCambiarCantidad={cambiarCantidad}
          onEliminar={eliminarItem}
        />

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de venta
              </label>
              <select
                value={tipoVenta}
                onChange={(e) => setTipoVenta(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="CONTADO">CONTADO</option>
                <option value="CREDITO">CRÉDITO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de pago
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="TARJETA">TARJETA</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-500">Total a pagar</p>
              <h2 className="text-3xl font-bold text-gray-800">
                Q {total.toFixed(2)}
              </h2>
            </div>

            <button
              onClick={finalizarVenta}
              disabled={loadingVenta || !items.length}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-semibold disabled:opacity-50"
            >
              {loadingVenta ? "Procesando..." : "Finalizar venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ventas;