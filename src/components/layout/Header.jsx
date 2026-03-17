import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Sistema Punto de Venta</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-700 font-medium">
            {user?.nombre || user?.username || "Usuario"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.roles?.map((r) => r.nombre_rol).join(", ") || "Sin rol"}
          </p>
        </div>

        <button
          onClick={cerrarSesion}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Header;