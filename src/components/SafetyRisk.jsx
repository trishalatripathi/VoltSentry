import { useEffect, useState } from "react";

function SafetyRisk() {
  const [batteryData, setBatteryData] = useState(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("batteryData");

      if (savedData) {
        setBatteryData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading safety data:", error);
    }
  }, []);

  const data = batteryData || {
    thermalRisk: "Low",
    electricalRisk: "Low",
    chargingRisk: "Low",
    cellImbalanceRisk: "Low",
  };

  function getRiskClass(risk) {
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
          {data.thermalRisk}
        </span>
      </div>


      <div className="risk-item">
        <span>⚡ Electrical Risk</span>

        <span className={getRiskClass(data.electricalRisk)}>
          {data.electricalRisk}
        </span>
      </div>


      <div className="risk-item">
        <span>🔌 Charging Risk</span>

        <span className={getRiskClass(data.chargingRisk)}>
          {data.chargingRisk}
        </span>
      </div>


      <div className="risk-item">
        <span>⚖️ Cell Imbalance</span>

        <span className={getRiskClass(data.cellImbalanceRisk)}>
          {data.cellImbalanceRisk}
        </span>
      </div>

    </div>
  );
}

export default SafetyRisk;