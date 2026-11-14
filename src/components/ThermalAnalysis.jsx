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

function loadThermalAnalysis() {
    try {
        const savedData = localStorage.getItem("batteryData");
        if (!savedData) {
            return {
                chartData: [],
                metrics: {
                    latestBatteryTemp: null,
                    maxBatteryTemp: null,
                    avgBatteryTemp: null,
                },
                risk: null,
            };
        }

        const batteryData = JSON.parse(savedData);
        const rawData = Array.isArray(batteryData.rawData)
            ? batteryData.rawData
            : [];
        const chartData = rawData
            .map((row, index) => {
                const temperature = Number(row["Battery Temperature (C)"]);
                if (!Number.isFinite(temperature)) return null;
                return {
                    label: row.Timestamp
                        ? new Date(row.Timestamp).toLocaleString()
                        : `Record ${index + 1}`,
                    battery: temperature,
                };
            })
            .filter(Boolean);

        return {
            chartData,
            metrics: {
                latestBatteryTemp: batteryData.latestTemperature
                    ?? batteryData.currentTemperature
                    ?? null,
                maxBatteryTemp: batteryData.maximumTemperature ?? null,
                avgBatteryTemp: batteryData.averageTemperature ?? null,
            },
            risk: batteryData.thermalRisk ?? null,
        };
    } catch (error) {
        console.error("Error loading thermal analysis data:", error);
        return {
            chartData: [],
            metrics: {
                latestBatteryTemp: null,
                maxBatteryTemp: null,
                avgBatteryTemp: null,
            },
            risk: null,
        };
    }
}

function ThermalAnalysis() {
    const [{ chartData, metrics, risk }] = useState(loadThermalAnalysis);

    function displayTemperature(value) {
        return value === null || !Number.isFinite(value)
            ? "Unavailable"
            : `${Number(value).toFixed(1)} °C`;
    }

    const condition = risk === "High"
        ? "Critical"
        : risk === "Medium"
            ? "Warning"
            : risk === "Low"
                ? "Normal"
                : "Unavailable";

    return (
        <div className="thermal-analysis-section">
            <div className="glass-panel" style={{ marginTop: "24px" }}>
                <h2 style={{ color: "var(--text-white)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "15px", marginTop: 0, marginBottom: "20px" }}>
                    Thermal Analysis
                </h2>

                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
                        <p className="chart-subtitle">Battery Temperature History</p>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="label"
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        domain={["dataMin - 2", "dataMax + 2"]}
                                        tickFormatter={(value) => `${value}°C`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "var(--bg-dark)", borderColor: "var(--glass-border)", color: "var(--text-white)", borderRadius: "8px" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="battery"
                                        name="Battery Temperature"
                                        stroke="var(--primary-neon)"
                                        strokeWidth={3}
                                        dot={{ fill: "var(--primary-neon)", r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="chart-placeholder">
                                <p>Upload valid battery data to view temperature history.</p>
                            </div>
                        )}
                    </div>

                    <div style={{ flex: "1 1 30%", minWidth: "250px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                            <div className="metric-card" style={{ padding: "16px" }}>
                                <span className="metric-label">Latest Battery Temperature</span>
                                <strong className="metric-value">{displayTemperature(metrics.latestBatteryTemp)}</strong>
                            </div>
                            <div className="metric-card" style={{ padding: "16px" }}>
                                <span className="metric-label">Maximum Battery Temperature</span>
                                <strong className="metric-value">{displayTemperature(metrics.maxBatteryTemp)}</strong>
                            </div>
                            <div className="metric-card" style={{ padding: "16px" }}>
                                <span className="metric-label">Average Battery Temperature</span>
                                <strong className="metric-value">{displayTemperature(metrics.avgBatteryTemp)}</strong>
                            </div>
                        </div>

                        <div style={{ marginTop: "auto", padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px" }}>
                            <h3 style={{ margin: "0 0 15px 0", fontSize: "15px", color: "var(--text-white)" }}>Thermal Status</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Recorded risk</span>
                                <strong>{risk ?? "Unavailable"}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", alignItems: "center" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Condition</span>
                                <strong>{condition}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThermalAnalysis;
