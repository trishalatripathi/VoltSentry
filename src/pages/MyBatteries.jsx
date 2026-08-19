import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBatteries() {
  const navigate = useNavigate();

  const [batteries, setBatteries] = useState([]);

  useEffect(() => {
    const savedData = localStorage.getItem("batteryData");

    if (savedData) {
      try {
        const data = JSON.parse(savedData);

        const battery = {
          id: data.batteryId || "Unknown",
          vehicle: data.vehicleName || "Unknown Vehicle",

          health:
            data.currentSOH !== undefined
              ? data.currentSOH
              : "N/A",

          risk:
            data.thermalRisk === "High" ||
              data.electricalRisk === "High" ||
              data.chargingRisk === "High"
              ? "High"
              : data.thermalRisk === "Medium" ||
                data.electricalRisk === "Medium" ||
                data.chargingRisk === "Medium"
                ? "Medium"
                : "Low",

          cycles:
            data.lifetimeCycles ?? "N/A",

          capacity:
            data.currentCapacity
              ? `${data.currentCapacity} kWh`
              : "N/A",

          status:
            data.currentSOH >= 80
              ? "Good"
              : data.currentSOH >= 60
                ? "Monitor"
                : "Needs Attention",
        };

        setBatteries([battery]);

      } catch (error) {
        console.error(
          "Error loading battery data:",
          error
        );
      }
    }
  }, []);

  return (
    <div className="my-batteries-page">

      {/* Header */}
      <div className="my-batteries-header">

        <div>
          <h1>My Batteries</h1>

          <p>
            View and manage your analyzed EV batteries.
          </p>
        </div>

        <button
          className="analyze-btn"
          onClick={() => navigate("/analyze")}
        >
          + Analyze Battery
        </button>

      </div>


      {/* No batteries */}
      {batteries.length === 0 && (
        <div className="no-batteries glass-panel" style={{ textAlign: 'center', marginBottom: '24px' }}>

          <h2>
            No batteries analyzed yet
          </h2>

          <p>
            Upload battery data to see your battery
            here.
          </p>

          <button
            className="analyze-submit-btn"
            onClick={() => navigate("/analyze")}
          >
            Analyze Your First Battery
          </button>

        </div>
      )}


      {/* Battery Cards */}
      <div className="battery-list">

        {batteries.map((battery) => (

          <div
            className="battery-card glass-panel"
            key={battery.id}
          >

            {/* Card Header */}
            <div className="battery-card-header">
              <div>
                <h2>{battery.vehicle}</h2>
                <span>{battery.id}</span>
              </div>
              <span className={
                battery.risk === "Low" ? "badge-success" :
                  battery.risk === "Medium" ? "badge-warning" : "badge-danger"
              }>
                {battery.risk}
              </span>
            </div>

            {/* Battery Details */}
            <div className="summary-card-inner">

              <div className="battery-ring-container">
                <h3>{battery.health !== "N/A" ? `${battery.health}%` : "N/A"}</h3>
                <span>Health</span>
              </div>

              <div className="summary-stats-grid">
                <div>
                  <span className="metric-label">Charging Cycles</span>
                  <strong className="metric-value">{battery.cycles}</strong>
                </div>
                <div>
                  <span className="metric-label">Capacity</span>
                  <strong className="metric-value">{battery.capacity}</strong>
                </div>
                <div>
                  <span className="metric-label">Status</span>
                  <strong className={`metric-value ${battery.status === 'Good' ? 'good' : ''}`}>
                    {battery.status}
                  </strong>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="summary-actions-row">
              <button
                className="btn-outline-neon"
                onClick={() => navigate("/passport")}
              >
                View Passport
              </button>
              <button
                className="btn-solid-neon"
                onClick={() => navigate("/analyze")}
              >
                Analyze
              </button>
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default MyBatteries;