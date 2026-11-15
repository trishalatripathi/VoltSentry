import { useNavigate } from "react-router-dom";

function PassportPreview({ batteryData: propData }) {
  const navigate = useNavigate();

  const savedData = localStorage.getItem("batteryData");
  const batteryData = propData || (savedData ? JSON.parse(savedData) : null);

  const hasData = !!batteryData;

  const data = hasData
    ? batteryData
    : {
      vehicleName: "No Vehicle Connected",
      batteryId: "000",
      manufacturer: "Pending Upload",
      verificationStatus: "Unverified (0%)",
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
            {data.vehicleName}
          </strong>
        </div>


        <div>
          <span>Battery ID</span>

          <strong>
            {data.batteryId}
          </strong>
        </div>


        <div>
          <span>Manufacturer</span>

          <strong>
            {data.manufacturer || (hasData ? "Certified OEM" : "Pending Upload")}
          </strong>
        </div>


        <div>
          <span>Verification</span>
          <strong className={hasData ? "badge-success" : "badge-none"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {data.verificationStatus}
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