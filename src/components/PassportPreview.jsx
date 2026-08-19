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
    <div className="passport-preview">

      <div className="passport-header">

        <div>
          <h2>Second-Life Passport</h2>

          <p>
            Battery reuse & recycling information
          </p>
        </div>

        <button
          className="passport-arrow"
          onClick={() => navigate("/passport")}
          aria-label="Open Second-Life Passport"
        >
          →
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

          <strong className="verified">
            ✓ {batteryData.verificationStatus}
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