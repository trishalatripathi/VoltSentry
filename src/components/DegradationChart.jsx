import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", soh: 96 },
  { month: "Feb", soh: 95 },
  { month: "Mar", soh: 94 },
  { month: "Apr", soh: 92 },
  { month: "May", soh: 91 },
  { month: "Jun", soh: 89 },
  { month: "Jul", soh: 88 },
  { month: "Aug", soh: 87 },
]

function DegradationChart() {
  return (
    <div className="degradation-chart">
      <h2>Degradation Analysis</h2>

      <p className="chart-subtitle">
        Battery health trend over the last 8 months
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis
            domain={[80, 100]}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip
            formatter={(value) => [`${value}%`, "SOH"]}
          />

          <Line
            type="monotone"
            dataKey="soh"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DegradationChart