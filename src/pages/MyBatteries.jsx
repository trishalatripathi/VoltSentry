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
        <div className="no-batteries">

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
            className="battery-card"
            key={battery.id}
          >

            {/* Card Header */}
            <div className="battery-card-header">

              <div>
                <h2>
                  {battery.vehicle}
                </h2>

                <span>
                  {battery.id}
                </span>
              </div>

              <span
                className={
                  battery.risk === "Low"
                    ? "risk-badge low"
                    : battery.risk === "Medium"
                    ? "risk-badge medium"
                    : "risk-badge high"
                }
              >
                {battery.risk} Risk
              </span>

            </div>


            {/* Battery Details */}
            <div className="battery-details">

              <div>
                <span>
                  Battery Health
                </span>

                <strong>
                  {battery.health !== "N/A"
                    ? `${battery.health}%`
                    : "N/A"}
                </strong>
              </div>


              <div>
                <span>
                  Charging Cycles
                </span>

                <strong>
                  {battery.cycles}
                </strong>
              </div>


              <div>
                <span>
                  Capacity
                </span>

                <strong>
                  {battery.capacity}
                </strong>
              </div>


              <div>
                <span>
                  Status
                </span>

                <strong>
                  {battery.status}
                </strong>
              </div>

            </div>


            {/* Actions */}
            <div className="battery-card-actions">

              <button
                className="secondary-btn"
                onClick={() =>
                  navigate("/passport")
                }
              >
                View Passport
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  navigate("/analyze")
                }
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