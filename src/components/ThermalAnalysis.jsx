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

function ThermalAnalysis({ batteryData: propData }) {
    const [chartData, setChartData] = useState([]);
    const [metrics, setMetrics] = useState({
        maxBatteryTemp: 0,
        avgBatteryTemp: 0,
        ambientTemp: 0,
    });
    const [status, setStatus] = useState({
        condition: "0",
        stability: "No Data",
        risk: "0",
        badgeClass: "badge-none",
    });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem("batteryData");
            const batteryData = propData || (savedData ? JSON.parse(savedData) : null);

            if (!batteryData || !batteryData.rawData) {
                setMetrics({
                    maxBatteryTemp: 0,
                    avgBatteryTemp: 0,
                    ambientTemp: 0,
                });
                setStatus({
                    condition: "0",
                    stability: "No Data",
                    risk: "0",
                    badgeClass: "badge-none",
                });
                setChartData([]);
                return;
            }

            // Setup metrics from actual CSV data
            let maxBatt = Number(batteryData.maximumTemperature) || 0;
            let avgBatt = Number(batteryData.averageTemperature) || 0;
            let ambTemp = 26.1;

            setMetrics({
                maxBatteryTemp: maxBatt,
                avgBatteryTemp: avgBatt,
                ambientTemp: ambTemp,
            });

            // Setup status logic from actual CSV
            let cond = "Normal";
            let stab = "Good";
            let rsk = batteryData.thermalRisk || "Low";
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

            setStatus({
                condition: cond,
                stability: stab,
                risk: rsk,
                badgeClass: bClass,
            });

            // Raw data to chart points
            const raw = batteryData.rawData;
            const step = Math.max(1, Math.floor(raw.length / 15));
            const points = raw
                .filter((_, idx) => idx % step === 0)
                .map((row, idx) => ({
                    time: `T+${idx * 5}m`,
                    battery: Number(row["Battery Temperature (C)"]) || avgBatt,
                    ambient: 26.1,
                }));

            setChartData(points);
        } catch (e) {
            console.error("Error setting thermal analysis data:", e);
        }
    }, [propData]);

    return (
        <div className="thermal-analysis-section">
            <div className="glass-panel" style={{ marginTop: '24px' }}>
                <h2 style={{ color: 'var(--text-white)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginTop: 0, marginBottom: '20px' }}>Thermal Analysis</h2>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                    {/* Chart Area */}
                    <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
                        <p className="chart-subtitle">Battery vs Ambient Temperature Over Time</p>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        fontSize={12}
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                        tickFormatter={(val) => `${val}°C`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--glass-border)', color: 'var(--text-white)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-white)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="battery"
                                        name="Battery Temp"
                                        stroke="var(--primary-neon)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--primary-neon)', r: 3 }}
                                        activeDot={{ r: 6, fill: 'var(--bg-dark)', stroke: 'var(--primary-neon)', strokeWidth: 2 }}
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
                        ) : (
                            <div className="chart-placeholder">
                                <p>No thermal data available.</p>
                            </div>
                        )}
                    </div>

                    {/* Metrics Area */}
                    <div style={{ flex: '1 1 30%', minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                            <div className="metric-card" style={{ padding: '16px' }}>
                                <span className="metric-label">Max Battery Temperature</span>
                                <strong className="metric-value">{metrics.maxBatteryTemp.toFixed(1)} °C</strong>
                            </div>

                            <div className="metric-card" style={{ padding: '16px' }}>
                                <span className="metric-label">Average Battery Temperature</span>
                                <strong className="metric-value">{metrics.avgBatteryTemp.toFixed(1)} °C</strong>
                            </div>

                            <div className="metric-card" style={{ padding: '16px' }}>
                                <span className="metric-label">Ambient Temperature</span>
                                <strong className="metric-value" style={{ color: 'var(--secondary-teal)' }}>{metrics.ambientTemp.toFixed(1)} °C</strong>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: 'var(--text-white)' }}>Thermal Status</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Condition</span>
                                <strong className={status.badgeClass}>{status.condition}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Stability</span>
                                <strong className={status.badgeClass}>{status.stability}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Overheating Risk</span>
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
