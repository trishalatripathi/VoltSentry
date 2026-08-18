import { useNavigate } from "react-router-dom";

function DigitalPassport() {
  const navigate = useNavigate();
  return (
    <div className="digital-passport">
        <button
            className="back-btn"
            onClick={() => navigate("/")}
        >
            ← Back to Dashboard
        </button>
      <div className="passport-page-header">
        <h1>Second-Life Passport</h1>
        <p>Complete battery history and verification details</p>
      </div>

      {/* Vehicle Information */}
      <section className="passport-section">
        <h2>Vehicle Information</h2>

        <div className="passport-grid">
          <div className="passport-field">
            <span>Vehicle Number</span>
            <strong>OD-02-AB-1234</strong>
          </div>

          <div className="passport-field">
            <span>Vehicle Name</span>
            <strong>Tata Nexon EV</strong>
          </div>
        </div>
      </section>

      {/* Battery Information */}
      <section className="passport-section">
        <h2>Battery Information</h2>

        <div className="passport-grid">
          <div className="passport-field">
            <span>Battery ID</span>
            <strong>BX-2026-001</strong>
          </div>

          <div className="passport-field">
            <span>Manufacturer</span>
            <strong>Example Motors</strong>
          </div>

          <div className="passport-field">
            <span>Manufacturing Date</span>
            <strong>March 2023</strong>
          </div>

          <div className="passport-field">
            <span>Lifetime Cycles</span>
            <strong>742 cycles</strong>
          </div>
        </div>
      </section>

      {/* Battery History */}
      <section className="passport-section">
        <h2>Battery History</h2>

        <div className="history-grid">

          {/* Temperature History */}
          <div className="history-card">
            <h3>Temperature History</h3>

            <div className="history-value">
              <strong>32°C</strong>
              <span>Average Temperature</span>
            </div>

            <div className="history-value">
              <strong>41°C</strong>
              <span>Maximum Recorded</span>
            </div>
            {/* Verification Status */}
            <section className="passport-section">
            <h2>Verification Status</h2>

            <div className="verification-card">
                <div className="verification-icon">✓</div>

                <div>
                <h3>Battery Verified</h3>
                <p>
                    Battery identity and recorded history have been verified.
                </p>
                </div>

                <span className="verification-status">Verified</span>
            </div>
            </section>
          </div>

          {/* Charging History */}
          <div className="history-card">
            <h3>Charging History</h3>

            <div className="history-value">
              <strong>742</strong>
              <span>Total Charging Cycles</span>
            </div>

            <div className="history-value">
              <strong>28%</strong>
              <span>Fast Charging Usage</span>
            </div>
          </div>

          {/* SOH History */}
          <div className="history-card">
            <h3>SOH History</h3>

            <div className="history-value">
              <strong>96%</strong>
              <span>Initial SOH</span>
            </div>

            <div className="history-value">
              <strong>87%</strong>
              <span>Current SOH</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default DigitalPassport