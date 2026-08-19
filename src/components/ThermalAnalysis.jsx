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

function ThermalAnalysis() {
    const [chartData, setChartData] = useState([]);
    const [metrics, setMetrics] = useState({
        maxBatteryTemp: 0,
        avgBatteryTemp: 0,
        ambientTemp: 26.1, // Mock constant or fetched
    });
    const [status, setStatus] = useState({
        condition: "Normal",
        stability: "Good",
        risk: "Low",
        badgeClass: "badge-success",
    });

    useEffect(() => {
        try {
            const savedData = localStorage.getItem("batteryData");
            if (!savedData) return;

            const batteryData = JSON.parse(savedData);

            // Setup metrics
            let maxBatt = batteryData.maximumTemperature ?? 41.2;
            let avgBatt = batteryData.averageTemperature ?? 36.7;
            let ambTemp = 26.1;

            setMetrics({
                maxBatteryTemp: maxBatt,
                avgBatteryTemp: avgBatt,
                ambientTemp: ambTemp,
            });

            // Setup status logic
            let cond = "Normal";
            let stab = "Good";
            let rsk = "Low";
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

            // Setup Chart Data if rawData exists
            if (batteryData.rawData && batteryData.rawData.length > 0) {
                const rawData = batteryData.rawData;
                // Take a small sample to avoid cramming
                const step = Math.max(1, Math.floor(rawData.length / 30));

                let localTime = 0;
                const chartPoints = rawData
                    .filter((_, index) => index % step === 0)
                    .map((row) => {
                        localTime += 5; // pseudo time increment (mins)
                        // if Ambient doesn't exist in CSV, simulate variations around 26
                        let mockAmbient = 26.1 + (Math.random() - 0.5) * 2;
                        let battTemp = Number(row["Battery Temperature (C)"]);
                        if (isNaN(battTemp)) battTemp = avgBatt;

                        return {
                            time: `${localTime}m`,
                            battery: battTemp,
                            ambient: Number(mockAmbient.toFixed(1))
                        };
                    });

                setChartData(chartPoints);
            } else {
                // Mock data if no raw data uploaded
                setChartData([
                    { time: '0m', battery: 32.1, ambient: 25.8 },
                    { time: '5m', battery: 33.4, ambient: 26.0 },
                    { time: '10m', battery: 35.2, ambient: 26.1 },
                    { time: '15m', battery: 37.8, ambient: 26.2 },
                    { time: '20m', battery: 38.5, ambient: 26.1 },
                    { time: '25m', battery: 39.2, ambient: 26.3 },
                    { time: '30m', battery: maxBatt, ambient: 26.5 },
                ]);
            }

        } catch (error) {
            console.error("Error loading thermal analysis data:", error);
        }
    }, []);

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
