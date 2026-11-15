import { useMemo } from "react";

function loadBatteryData() {
  try {
    const savedData = localStorage.getItem("batteryData");
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Error loading safety data:", error);
    return null;
  }
}

function SafetyRisk({ batteryData: propData }) {
  const batteryData = useMemo(() => {
    if (propData !== undefined) return propData;
    return loadBatteryData();
  }, [propData]);

  const data = batteryData || {};

  function getRiskClass(risk) {
    if (!risk || risk === "0" || risk === "Unavailable") {
      return "risk-unavailable";
    }

    if (risk === "High") {
      return "risk-high";
    }

    if (risk === "Medium") {
      return "risk-medium";
    }

    if (risk === "Low") {
      return "risk-low";
    }

    return "risk-unavailable";
  }

  function displayRisk(risk) {
    if (!risk || risk === "0") {
      return "Unavailable";
    }
    return risk;
  }

  return (
    <div className="safety-risk glass-panel">
      <h2>Safety Risk Analysis</h2>

      <div className="risk-item">
        <span>🔥 Thermal Risk</span>
        <span className={getRiskClass(data.thermalRisk)}>
          {displayRisk(data.thermalRisk)}
        </span>
      </div>

      <div className="risk-item">
        <span>⚡ Electrical Risk</span>
        <span className={getRiskClass(data.electricalRisk)}>
          {displayRisk(data.electricalRisk)}
        </span>
      </div>

      <div className="risk-item">
        <span>🔌 Charging Risk</span>
        <span className={getRiskClass(data.chargingRisk)}>
          {displayRisk(data.chargingRisk)}
        </span>
      </div>

      <div className="risk-item">
        <span>⚖️ Cell Imbalance</span>
        <span className={getRiskClass(data.cellImbalanceRisk)}>
          {displayRisk(data.cellImbalanceRisk)}
        </span>
      </div>

      <p className="risk-note">
        Risk levels are computed from cell voltage imbalance, thermal behavior,
        and charging telemetry.
      </p>
    </div>
  );
}

export default SafetyRisk;
