import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Lun", ventas: 400 },
  { name: "Mar", ventas: 700 },
  { name: "Mié", ventas: 300 },
  { name: "Jue", ventas: 900 },
  { name: "Vie", ventas: 1200 },
];

function Dashboard() {
  return (
    <div>
      <h2>Ventas de la semana</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="ventas" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;