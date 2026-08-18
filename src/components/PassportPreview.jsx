import { useNavigate } from "react-router-dom";

function PassportPreview() {
  const navigate = useNavigate();

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
          <strong>Tata Nexon EV</strong>
        </div>

        <div>
          <span>Battery ID</span>
          <strong>BX-2026-001</strong>
        </div>

        <div>
          <span>Manufacturer</span>
          <strong>Example Motors</strong>
        </div>

        <div>
          <span>Verification</span>
          <strong className="verified">
            ✓ Verified
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