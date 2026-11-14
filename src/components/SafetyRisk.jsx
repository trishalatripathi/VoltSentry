import { useState } from "react";

function loadBatteryData() {
  try {
    const savedData = localStorage.getItem("batteryData");
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error loading safety data:", error);
    return null;
  }
}

function SafetyRisk() {
  const [batteryData] = useState(loadBatteryData);

  const data = batteryData || {};

  function getRiskClass(risk) {
    if (!risk) {
      return "risk-unavailable";
    }

    if (risk === "High") {
      return "risk-high";
    }

    if (risk === "Medium") {
      return "risk-medium";
    }

    return "risk-low";
  }

  return (
    <div className="safety-risk glass-panel">

      <h2>Safety Risk</h2>

      <div className="risk-item">
        <span>🔥 Thermal Risk</span>

        <span className={getRiskClass(data.thermalRisk)}>
          {data.thermalRisk || "Unavailable"}
        </span>
      </div>


      <div className="risk-item">
        <span>⚡ Electrical Risk</span>

        <span className={getRiskClass(data.electricalRisk)}>
          {data.electricalRisk || "Unavailable"}
        </span>
      </div>


      <div className="risk-item">
        <span>🔌 Charging Risk</span>

        <span className={getRiskClass(data.chargingRisk)}>
          {data.chargingRisk || "Unavailable"}
        </span>
      </div>


      <div className="risk-item">
        <span>⚖️ Cell Imbalance</span>

        <span className={getRiskClass(data.cellImbalanceRisk)}>
          {data.cellImbalanceRisk || "Unavailable"}
        </span>
      </div>

    </div>
  );
}

export default SafetyRisk;