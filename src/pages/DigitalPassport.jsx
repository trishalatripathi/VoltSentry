import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function DigitalPassport() {
  const navigate = useNavigate();

  const [batteryData, setBatteryData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem("batteryData");

    if (savedData) {
      try {
        setBatteryData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error reading battery data:", error);
      }
    }
  }, []);

  const data = batteryData || {};

  // Values that are actually available
  const vehicleNumber =
    data.vehicleNumber || "Not available";

  const vehicleName =
    data.vehicleName || "Not available";

  const batteryId =
    data.batteryId || "Not available";

  const lifetimeCycles =
    data.lifetimeCycles ?? "Not available";

  const maximumTemperature =
    data.maximumTemperature ?? "Not available";

  const maximumCellVoltageDelta =
    data.maximumCellVoltageDelta ?? "Not available";

  const maximumCurrent =
    data.maximumCurrent ?? "Not available";

  const currentSOC =
    data.currentSOC ?? "Not available";

  const recordCount =
    data.recordCount ?? "Not available";

  /*
   * SOH is not currently coming from the uploaded CSV analysis.
   * Do NOT display a fake percentage.
   */
  const currentSOH =
    data.currentSOH ?? null;

  const initialSOH =
    data.initialSOH ?? null;

  /*
   * These are not currently supplied by the analysis.
   */
  const manufacturer =
    data.manufacturer || "Not available";

  const manufacturingDate =
    data.manufacturingDate || "Not available";

  const fastChargingUsage =
    data.fastChargingUsage ?? null;

  /*
   * Calculate battery condition based on information
   * that we actually have.
   */
  let batteryCondition = "Needs Assessment";
  let suitability = "Further Testing Required";

  if (currentSOH !== null) {
    if (currentSOH >= 80) {
      batteryCondition = "Good";
      suitability = "Potentially Reusable";
    } else if (currentSOH >= 60) {
      batteryCondition = "Moderate";
      suitability = "Further Assessment Required";
    } else {
      batteryCondition = "Poor";
      suitability = "Recycling Recommended";
    }
  }

  return (
    <div className="digital-passport">

      {/* Back */}
      <button
        className="back-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Dashboard
      </button>


      {/* Header */}
      <div className="passport-page-header">

        <div>
          <h1>Second-Life Passport</h1>

          <p>
            Complete battery history and verification details
          </p>
        </div>

        <div className="passport-status">
          ✓ {data.verificationStatus || "Analysis Complete"}
        </div>

      </div>


      {/* Vehicle Information */}
      <section className="passport-section glass-panel">

        <h2>Vehicle Information</h2>

        <div className="passport-grid">

          <div className="passport-field">
            <span>Vehicle Number</span>
            <strong>{vehicleNumber}</strong>
          </div>

          <div className="passport-field">
            <span>Vehicle Name</span>
            <strong>{vehicleName}</strong>
          </div>

        </div>

      </section>


      {/* Battery Information */}
      <section className="passport-section glass-panel">

        <h2>Battery Information</h2>

        <div className="passport-grid">

          <div className="passport-field">
            <span>Battery ID</span>
            <strong>{batteryId}</strong>
          </div>

          <div className="passport-field">
            <span>Manufacturer</span>
            <strong>{manufacturer}</strong>
          </div>

          <div className="passport-field">
            <span>Manufacturing Date</span>
            <strong>{manufacturingDate}</strong>
          </div>

          <div className="passport-field">
            <span>Lifetime Cycles</span>
            <strong>
              {lifetimeCycles !== "Not available"
                ? `${lifetimeCycles} cycles`
                : "Not available"}
            </strong>
          </div>

        </div>

      </section>


      {/* Battery History */}
      <section className="passport-section glass-panel">

        <h2>Battery History</h2>

        <div className="history-grid">


          {/* Temperature */}
          <div className="history-card">

            <h3>🌡️ Temperature History</h3>

            <div className="history-value">

              <strong>
                {maximumTemperature !== "Not available"
                  ? `${maximumTemperature}°C`
                  : "Not available"}
              </strong>

              <span>
                Maximum Recorded
              </span>

            </div>

            <div className="history-value">

              <strong>
                Not available
              </strong>

              <span>
                Average Temperature
              </span>

            </div>

          </div>


          {/* Charging */}
          <div className="history-card">

            <h3>🔋 Charging History</h3>

            <div className="history-value">

              <strong>
                {lifetimeCycles !== "Not available"
                  ? lifetimeCycles
                  : "Not available"}
              </strong>

              <span>
                Total Charging Cycles
              </span>

            </div>

            <div className="history-value">

              <strong>
                {fastChargingUsage !== null
                  ? `${fastChargingUsage}%`
                  : "Not available"}
              </strong>

              <span>
                Fast Charging Usage
              </span>

            </div>

          </div>


          {/* SOH */}
          <div className="history-card">

            <h3>📊 State of Health History</h3>

            <div className="history-value">

              <strong>
                {initialSOH !== null
                  ? `${initialSOH}%`
                  : "Not available"}
              </strong>

              <span>
                Initial SOH
              </span>

            </div>

            <div className="history-value">

              <strong>
                {currentSOH !== null
                  ? `${currentSOH}%`
                  : "Not available"}
              </strong>

              <span>
                Current SOH
              </span>

            </div>

          </div>


          {/* Cell Diagnostics */}
          <div className="history-card">

            <h3>⚡ Cell Diagnostics</h3>

            <div className="history-value">

              <strong>
                Not available
              </strong>

              <span>
                Average Cell Voltage Delta
              </span>

            </div>

            <div className="history-value">

              <strong>
                {maximumCellVoltageDelta !== "Not available"
                  ? `${maximumCellVoltageDelta} mV`
                  : "Not available"}
              </strong>

              <span>
                Maximum Cell Voltage Delta
              </span>

            </div>

          </div>


          {/* Usage */}
          <div className="history-card">

            <h3>🔄 Usage History</h3>

            <div className="history-value">

              <strong>
                {currentSOC !== "Not available"
                  ? `${currentSOC}%`
                  : "Not available"}
              </strong>

              <span>
                Current State of Charge
              </span>

            </div>

            <div className="history-value">

              <strong>
                {recordCount}
              </strong>

              <span>
                Recorded Data Points
              </span>

            </div>

          </div>


        </div>

      </section>


      {/* Verification */}
      <section className="passport-section glass-panel">

        <h2>Verification Status</h2>

        <div className="verification-card">

          <div className="verification-icon">
            ✓
          </div>

          <div className="verification-content">

            <h3>
              Battery Data Processed
            </h3>

            <p>
              Battery identity and uploaded telemetry
              data have been successfully processed.
            </p>

          </div>

          <span className="verification-status">
            {data.verificationStatus || "Processed"}
          </span>

        </div>

      </section>


      {/* Second Life */}
      <section className="passport-section glass-panel">

        <h2>Second-Life Information</h2>

        <div className="passport-detail-grid">
          <div className="metric-card">
            <span className="metric-label">Current SOH</span>
            <strong className="metric-value">
              {currentSOH !== null ? `${currentSOH}%` : "Not available"}
            </strong>
          </div>

          <div className="metric-card">
            <span className="metric-label">Battery Condition</span>
            <strong className={`metric-value ${batteryCondition === 'Good' ? 'good' : ''}`}>
              {batteryCondition}
            </strong>
          </div>

          <div className="metric-card">
            <span className="metric-label">Estimated Suitability</span>
            <strong className="metric-value good">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'bottom', marginRight: '6px' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {suitability}
            </strong>
          </div>
        </div>

        <p className="passport-note" style={{ marginTop: '25px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '4px solid var(--secondary-teal)' }}>
          Second-life suitability is an estimate based on available battery health and history data and should be confirmed through certified testing.
        </p>

      </section>


      {/* Disclaimer */}
      <footer className="passport-disclaimer">

        ⚠️ Battery health, safety and second-life suitability
        results are estimates and do not replace certified
        battery testing.

      </footer>

    </div>
  );
}

export default DigitalPassport;