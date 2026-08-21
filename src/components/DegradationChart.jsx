import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DegradationChart() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("batteryData");

      if (!savedData) {
        return;
      }

      const batteryData = JSON.parse(savedData);

      if (!batteryData.rawData) {
        return;
      }

      /*
       * We don't have actual SOH in the CSV.
       *
       * So for now we display State of Charge (SOC)
       * against Cycle Index.
       *
       * This is NOT an SOH/degradation calculation.
       */

      const rawData = batteryData.rawData;

      // Take a smaller number of points so the chart
      // remains readable.
      const step = Math.max(
        1,
        Math.floor(rawData.length / 20)
      );

      const chartPoints = rawData
        .filter((_, index) => index % step === 0)
        .map((row) => ({
          cycle: Number(row["Cycle Index"]),
          soc: Number(row["State of Charge (%)"]),
        }))
        .filter(
          (point) =>
            !isNaN(point.cycle) &&
            !isNaN(point.soc)
        );

      setChartData(chartPoints);

    } catch (error) {
      console.error(
        "Error loading degradation chart:",
        error
      );
    }
  }, []);

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
            Upload and analyze a battery CSV
            to view the battery usage trend.
          </p>

        </div>

      )}

    </div>
  );
}

export default DegradationChart;