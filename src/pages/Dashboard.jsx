import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <p className="text-gray-700">
        Bienvenido, <strong>{user?.nombre || user?.username}</strong>
      </p>

      <p className="text-gray-500 mt-2">
        Usuario: {user?.username}
      </p>
    </div>
  );
}

export default Dashboard;