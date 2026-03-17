import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Punto de Venta</h1>

      <nav className="flex flex-col gap-3">
        <Link to="/dashboard" className="hover:text-blue-300">
          Dashboard
        </Link>

        <Link to="/productos" className="hover:text-blue-300">
          Productos
        </Link>

        <Link to="/ventas" className="hover:text-blue-300">
          Ventas
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;