import { useNavigate } from "react-router-dom";

function PassportPreview() {
  const navigate = useNavigate();

  const savedData = localStorage.getItem("batteryData");

  const batteryData = savedData
    ? JSON.parse(savedData)
    : {
      vehicleName: "Tata Nexon EV",
      batteryId: "BX-2026-001",
      manufacturer: "Example Motors",
      verificationStatus: "Verified",
    };

  return (
    <div className="passport-preview glass-panel">

      <div className="passport-header">

        <div>
          <h2>Second-Life Passport</h2>

          <p>
            Battery reuse & recycling information
          </p>
        </div>

        <button
          className="icon-btn"
          onClick={() => navigate("/passport")}
          aria-label="Open Second-Life Passport"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

      </div>


      <div className="passport-info">

        <div>
          <span>Vehicle</span>

          <strong>
            {batteryData.vehicleName}
          </strong>
        </div>


        <div>
          <span>Battery ID</span>

          <strong>
            {batteryData.batteryId}
          </strong>
        </div>


        <div>
          <span>Manufacturer</span>

          <strong>
            {batteryData.manufacturer}
          </strong>
        </div>


        <div>
          <span>Verification</span>
          <strong className="badge-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {batteryData.verificationStatus}
          </strong>
        </div>

      </div>


      <p className="passport-description">
        View complete battery history, health information and
        second-life suitability.
      </p>

    </div>
  );
}

export default PassportPreview;