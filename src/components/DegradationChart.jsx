import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function loadChartData() {
  try {
    const savedData = localStorage.getItem("batteryData");
    const batteryData = savedData ? JSON.parse(savedData) : null;
    const rawData = Array.isArray(batteryData?.rawData)
      ? batteryData.rawData
      : [];
    const step = Math.max(1, Math.floor(rawData.length / 20));

    return rawData
      .filter((_, index) => index % step === 0)
      .map((row) => {
        const cycleValue = row["Cycle Index"];
        const socValue = row["State of Charge (%)"];
        return {
          cycle: cycleValue === "" || cycleValue == null
            ? null
            : Number(cycleValue),
          soc: socValue === "" || socValue == null
            ? null
            : Number(socValue),
        };
      })
      .filter((point) =>
        Number.isFinite(point.cycle) &&
        Number.isFinite(point.soc),
      );
  } catch (error) {
    console.error("Error loading battery usage chart:", error);
    return [];
  }
}

function DegradationChart() {
  const [chartData] = useState(loadChartData);

  return (
    <div className="degradation-chart glass-panel">

      <h2>
        Battery Usage Trend
      </h2>

      <p className="chart-subtitle">
        State of charge across battery cycles
      </p>

      {chartData.length > 0 ? (

        <ResponsiveContainer
          width="100%"
          height={280}
        >

          <LineChart data={chartData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="cycle"
              label={{
                value: "Cycle",
                position: "insideBottom",
                offset: -5,
              }}
            />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) =>
                `${value}%`
              }
            />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toFixed(2)}%`,
                "SOC",
              ]}
              labelFormatter={(cycle) =>
                `Cycle ${cycle}`
              }
            />

            <Line
              type="monotone"
              dataKey="soc"
              strokeWidth={3}
              dot={false}
            />

          </LineChart>

        </ResponsiveContainer>

      ) : (

        <div className="chart-placeholder">

          <p>
            No valid cycle and SOC history is available. Upload battery data
            to view the usage trend.
          </p>

        </div>

      )}

    </div>
  );
}

export default DegradationChart;