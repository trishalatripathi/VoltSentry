import { useNavigate } from "react-router-dom";
import { useState } from "react";

function DigitalPassport() {
  const navigate = useNavigate();

  const [batteryData] = useState(() => {
    const savedData = localStorage.getItem("batteryData");

    return savedData
      ? JSON.parse(savedData)
      : {
          vehicleNumber: "OD-02-AB-1234",
          vehicleName: "Tata Nexon EV",
          batteryId: "BX-2026-001",

          manufacturer: "Example Motors",
          manufacturingDate: "March 2023",

          lifetimeCycles: 742,

          averageTemperature: 32,
          maximumTemperature: 41,

          averageCellVoltageDelta: 26.4,
          maximumCellVoltageDelta: 51.2,

          averageSOC: 68.2,

          fastChargingUsage: 28,

          initialSOH: 96,
          currentSOH: 87,

          verificationStatus: "Verified",
        };
  });

  return (
    <div className="digital-passport">

      {/* Back button */}
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
          ✓ {batteryData.verificationStatus}
        </div>

      </div>


      {/* Vehicle Information */}
      <section className="passport-section">

        <h2>Vehicle Information</h2>

        <div className="passport-grid">

          <div className="passport-field">
            <span>Vehicle Number</span>

            <strong>
              {batteryData.vehicleNumber}
            </strong>
          </div>


          <div className="passport-field">
            <span>Vehicle Name</span>

            <strong>
              {batteryData.vehicleName}
            </strong>
          </div>

        </div>

      </section>


      {/* Battery Information */}
      <section className="passport-section">

        <h2>Battery Information</h2>

        <div className="passport-grid">

          <div className="passport-field">
            <span>Battery ID</span>

            <strong>
              {batteryData.batteryId}
            </strong>
          </div>


          <div className="passport-field">
            <span>Manufacturer</span>

            <strong>
              {batteryData.manufacturer}
            </strong>
          </div>


          <div className="passport-field">
            <span>Manufacturing Date</span>

            <strong>
              {batteryData.manufacturingDate}
            </strong>
          </div>


          <div className="passport-field">
            <span>Lifetime Cycles</span>

            <strong>
              {batteryData.lifetimeCycles} cycles
            </strong>
          </div>

        </div>

      </section>


      {/* Battery History */}
      <section className="passport-section">

        <h2>Battery History</h2>

        <div className="history-grid">


          {/* Temperature History */}
          <div className="history-card">

            <h3>
              🌡️ Temperature History
            </h3>


            <div className="history-value">

              <strong>
                {batteryData.averageTemperature}°C
              </strong>

              <span>
                Average Temperature
              </span>

            </div>


            <div className="history-value">

              <strong>
                {batteryData.maximumTemperature}°C
              </strong>

              <span>
                Maximum Recorded
              </span>

            </div>

          </div>


          {/* Charging History */}
          <div className="history-card">

            <h3>
              🔋 Charging History
            </h3>


            <div className="history-value">

              <strong>
                {batteryData.lifetimeCycles}
              </strong>

              <span>
                Total Charging Cycles
              </span>

            </div>


            <div className="history-value">

              <strong>
                {batteryData.fastChargingUsage}%
              </strong>

              <span>
                Fast Charging Usage
              </span>

            </div>

          </div>


          {/* SOH History */}
          <div className="history-card">

            <h3>
              📊 State of Health History
            </h3>


            <div className="history-value">

              <strong>
                {batteryData.initialSOH}%
              </strong>

              <span>
                Initial SOH
              </span>

            </div>


            <div className="history-value">

              <strong>
                {batteryData.currentSOH}%
              </strong>

              <span>
                Current SOH
              </span>

            </div>

          </div>


          {/* Cell Imbalance */}
          <div className="history-card">

            <h3>
              ⚡ Cell Diagnostics
            </h3>


            <div className="history-value">

              <strong>
                {batteryData.averageCellVoltageDelta} mV
              </strong>

              <span>
                Average Cell Voltage Delta
              </span>

            </div>


            <div className="history-value">

              <strong>
                {batteryData.maximumCellVoltageDelta} mV
              </strong>

              <span>
                Maximum Cell Voltage Delta
              </span>

            </div>

          </div>


          {/* Usage */}
          <div className="history-card">

            <h3>
              🔄 Usage History
            </h3>


            <div className="history-value">

              <strong>
                {batteryData.averageSOC}%
              </strong>

              <span>
                Average State of Charge
              </span>

            </div>


            <div className="history-value">

              <strong>
                {batteryData.csvRows || "—"}
              </strong>

              <span>
                Recorded Data Points
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* Verification Status */}
      <section className="passport-section">

        <h2>
          Verification Status
        </h2>


        <div className="verification-card">

          <div className="verification-icon">
            ✓
          </div>


          <div className="verification-content">

            <h3>
              Battery Verified
            </h3>

            <p>
              Battery identity and recorded history have been verified.
            </p>

          </div>


          <span className="verification-status">
            {batteryData.verificationStatus}
          </span>

        </div>

      </section>


      {/* Second-Life Suitability */}
      <section className="passport-section">

        <h2>
          Second-Life Information
        </h2>


        <div className="second-life-card">

          <div>

            <span>
              Current SOH
            </span>

            <strong>
              {batteryData.currentSOH}%
            </strong>

          </div>


          <div>

            <span>
              Battery Condition
            </span>

            <strong>
              {batteryData.currentSOH >= 80
                ? "Good"
                : "Needs Assessment"}
            </strong>

          </div>


          <div>

            <span>
              Estimated Suitability
            </span>

            <strong>
              {batteryData.currentSOH >= 80
                ? "Potentially Reusable"
                : "Further Testing Required"}
            </strong>

          </div>

        </div>


        <p className="passport-note">

          Second-life suitability is an estimate based on available battery
          health and history data and should be confirmed through certified
          testing.

        </p>

      </section>


      {/* Disclaimer */}
      <footer className="passport-disclaimer">

        ⚠️ Battery health, safety and second-life suitability results are
        estimates and do not replace certified battery testing.

      </footer>

    </div>
  );
}

export default DigitalPassport;