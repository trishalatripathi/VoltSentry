import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULT_THERMAL_POINTS = [
  { time: "0m", battery: 32.1, ambient: 25.8 },
  { time: "5m", battery: 33.4, ambient: 26.0 },
  { time: "10m", battery: 35.2, ambient: 26.1 },
  { time: "15m", battery: 37.8, ambient: 26.2 },
  { time: "20m", battery: 38.5, ambient: 26.1 },
  { time: "25m", battery: 39.2, ambient: 26.3 },
  { time: "30m", battery: 41.2, ambient: 26.5 },
];

function resolveBatteryData(propData) {
  if (propData !== undefined && propData !== null) {
    return propData;
  }
  try {
    const savedData =
      localStorage.getItem("batteryData") ||
      sessionStorage.getItem("batteryData");
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch {
    // Fallback
  }
  return null;
}

function parseThermalData(batteryData) {
  const hasData = !!batteryData;

  let maxBatt = hasData && batteryData.maximumTemperature !== null && batteryData.maximumTemperature !== undefined
    ? Number(batteryData.maximumTemperature)
    : 41.2;

  let avgBatt = hasData && batteryData.averageTemperature !== null && batteryData.averageTemperature !== undefined
    ? Number(batteryData.averageTemperature)
    : 36.7;

  let ambTemp = hasData && batteryData.ambientTemperature !== null && batteryData.ambientTemperature !== undefined
    ? Number(batteryData.ambientTemperature)
    : 26.1;

  if (isNaN(maxBatt) || maxBatt <= 0) maxBatt = 41.2;
  if (isNaN(avgBatt) || avgBatt <= 0) avgBatt = 36.7;
  if (isNaN(ambTemp) || ambTemp <= 0) ambTemp = 26.1;

  // Determine status and badges
  let cond = "Normal";
  let stab = "Good";
  let rsk = batteryData?.thermalRisk || "Low";
  let bClass = "badge-success";

  if (maxBatt >= 48) {
    cond = "Critical";
    stab = "Unstable";
    rsk = "High";
    bClass = "badge-danger";
  } else if (maxBatt >= 43) {
    cond = "Warning";
    stab = "Moderate";
    rsk = "Medium";
    bClass = "badge-warning";
  }

  // Parse chart data points
  let chartPoints = [];
  const rawData = Array.isArray(batteryData?.rawData) ? batteryData.rawData : [];

  if (rawData.length > 0) {
    const step = Math.max(1, Math.floor(rawData.length / 25));
    let localTime = 0;

    chartPoints = rawData
      .filter((_, idx) => idx % step === 0)
      .map((row) => {
        let label = `${localTime}m`;
        if (row.Timestamp) {
          try {
            const d = new Date(row.Timestamp);
            if (!isNaN(d.getTime())) {
              label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
          } catch {
            label = `${localTime}m`;
          }
        }
        localTime += 5;

        let bTemp = Number(
          row["Battery Temperature (C)"] ??
          row["battery_temperature"] ??
          row["Temperature (C)"] ??
          row["temperature"] ??
          row["Temperature"]
        );
        if (isNaN(bTemp) || !Number.isFinite(bTemp)) {
          bTemp = avgBatt;
        }

        const aTemp = row["Ambient Temperature (C)"]
          ? Number(row["Ambient Temperature (C)"])
          : Number((ambTemp + Math.sin(localTime / 10) * 0.4).toFixed(1));

        return {
          time: label,
          battery: Number(bTemp.toFixed(1)),
          ambient: Number(aTemp.toFixed(1)),
        };
      })
      .filter((p) => Number.isFinite(p.battery));
  }

  if (chartPoints.length === 0) {
    chartPoints = DEFAULT_THERMAL_POINTS.map((p) => ({
      ...p,
      battery: hasData ? Number((p.battery * (maxBatt / 41.2)).toFixed(1)) : p.battery,
      ambient: ambTemp,
    }));
  }

  return {
    chartData: chartPoints,
    metrics: {
      maxBatteryTemp: maxBatt,
      avgBatteryTemp: avgBatt,
      ambientTemp: ambTemp,
    },
    status: {
      condition: cond,
      stability: stab,
      risk: rsk,
      badgeClass: bClass,
    },
  };
}

function ThermalAnalysis({ batteryData: propData }) {
  const activeData = resolveBatteryData(propData);
  const data = parseThermalData(activeData);
  const { chartData, metrics, status } = data;

  return (
    <div className="thermal-analysis-section">
      <div className="glass-panel" style={{ marginTop: "24px" }}>
        <h2
          style={{
            color: "var(--text-white)",
            borderBottom: "1px solid var(--glass-border)",
            paddingBottom: "15px",
            marginTop: 0,
            marginBottom: "20px",
          }}
        >
          Thermal Analysis
        </h2>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Chart Area */}
          <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
            <p className="chart-subtitle">Battery vs Ambient Temperature Over Time</p>
            <div style={{ width: "100%", height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={12}
                    domain={["dataMin - 2", "dataMax + 2"]}
                    tickFormatter={(val) => `${val}°C`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-dark)",
                      borderColor: "var(--glass-border)",
                      color: "var(--text-white)",
                      borderRadius: "8px",
                    }}
                    formatter={(val, name) => [`${val} °C`, name]}
                  />
                  <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 13, paddingTop: 6 }} />
                  <Line
                    type="monotone"
                    dataKey="battery"
                    name="Battery Temp"
                    stroke="var(--primary-neon)"
                    strokeWidth={3}
                    dot={{ fill: "var(--primary-neon)", r: 3 }}
                    activeDot={{
                      r: 6,
                      fill: "var(--bg-dark)",
                      stroke: "var(--primary-neon)",
                      strokeWidth: 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ambient"
                    name="Ambient Temp"
                    stroke="var(--secondary-teal)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metrics Area */}
          <div
            style={{
              flex: "1 1 30%",
              minWidth: "250px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "15px",
              }}
            >
              <div className="metric-card" style={{ padding: "16px" }}>
                <span className="metric-label">Max Battery Temperature</span>
                <strong className="metric-value">
                  {metrics.maxBatteryTemp.toFixed(1)} °C
                </strong>
              </div>
              <div className="metric-card" style={{ padding: "16px" }}>
                <span className="metric-label">Average Battery Temperature</span>
                <strong className="metric-value">
                  {metrics.avgBatteryTemp.toFixed(1)} °C
                </strong>
              </div>
              <div className="metric-card" style={{ padding: "16px" }}>
                <span className="metric-label">Ambient Temperature</span>
                <strong
                  className="metric-value"
                  style={{ color: "var(--secondary-teal)" }}
                >
                  {metrics.ambientTemp.toFixed(1)} °C
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop: "auto",
                padding: "20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "15px",
                  color: "var(--text-white)",
                }}
              >
                Thermal Status
              </h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Condition
                </span>
                <strong className={status.badgeClass}>{status.condition}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Stability
                </span>
                <strong className={status.badgeClass}>{status.stability}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Overheating Risk
                </span>
                <strong className={status.badgeClass}>{status.risk}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThermalAnalysis;
