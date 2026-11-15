import { useEffect, useState } from "react";

function SafetyRisk({ batteryData: propData }) {
  const [batteryData, setBatteryData] = useState(propData || null);

  useEffect(() => {
    if (propData !== undefined) {
      setBatteryData(propData);
      return;
    }
    try {
      const savedData = localStorage.getItem("batteryData");
      if (savedData) {
        setBatteryData(JSON.parse(savedData));
      } else {
        setBatteryData(null);
      }
    } catch (error) {
      console.error("Error loading safety data:", error);
    }
  }, [propData]);

  const hasData = !!batteryData;

  const data = hasData ? batteryData : {
    thermalRisk: "0",
    electricalRisk: "0",
    chargingRisk: "0",
    cellImbalanceRisk: "0",
  };

  function getRiskClass(risk) {
    if (risk === "High") {
      return "risk-high";
    }

    if (risk === "Medium") {
      return "risk-medium";
    }

    if (risk === "Low") {
      return "risk-low";
    }

    return "risk-none";
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