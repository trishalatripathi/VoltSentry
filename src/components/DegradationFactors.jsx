import { useState } from "react";

function loadBatteryData() {
  try {
    const savedData = localStorage.getItem("batteryData");
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error loading battery condition data:", error);
    return null;
  }
}

function DegradationFactors() {
  const [batteryData] = useState(loadBatteryData);

  function displayValue(value, unit = "") {
    return value === null || value === undefined || !Number.isFinite(Number(value))
      ? "Unavailable"
      : `${value}${unit}`;
  }

  const conditions = [
    ["Maximum temperature", displayValue(batteryData?.maximumTemperature, " °C")],
    ["Maximum absolute pack current", displayValue(batteryData?.maximumCurrent, " A")],
    ["Maximum cell-voltage delta", displayValue(batteryData?.maximumCellVoltageDelta, " mV")],
    ["Latest cycle index", displayValue(batteryData?.latestCycle ?? batteryData?.lifetimeCycles)],
  ];

  return (
    <div className="degradation-factors glass-panel">
      <h3>Recorded Battery Conditions</h3>
      {conditions.map(([label, value]) => (
        <div className="factor" key={label}>
          <div>
            <span>{label}</span>
            <small>{value}</small>
          </div>
        </div>
      ))}
      <p className="unavailable-metric-note">
        These recorded measurements are not degradation percentages or a
        state-of-health estimate.
      </p>
    </div>
  );
}

export default DegradationFactors;
