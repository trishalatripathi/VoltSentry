import { useNavigate } from "react-router-dom";

function MyBatteries() {
  const navigate = useNavigate();

  const batteries = [
    {
      id: "BX-2026-001",
      vehicle: "Tata Nexon EV",
      health: 87,
      risk: "Low",
      cycles: 742,
      capacity: "52.2 kWh",
      status: "Good",
    },
    {
      id: "BX-2026-002",
      vehicle: "MG ZS EV",
      health: 79,
      risk: "Medium",
      cycles: 921,
      capacity: "44.5 kWh",
      status: "Monitor",
    },
  ];

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

      {/* Battery Cards */}
      <div className="battery-list">

        {batteries.map((battery) => (
          <div
            className="battery-card"
            key={battery.id}
          >

            <div className="battery-card-header">
              <div>
                <h2>{battery.vehicle}</h2>
                <span>{battery.id}</span>
              </div>

              <span
                className={
                  battery.risk === "Low"
                    ? "risk-badge low"
                    : "risk-badge medium"
                }
              >
                {battery.risk} Risk
              </span>
            </div>

            <div className="battery-details">

              <div>
                <span>Battery Health</span>
                <strong>{battery.health}%</strong>
              </div>

              <div>
                <span>Charging Cycles</span>
                <strong>{battery.cycles}</strong>
              </div>

              <div>
                <span>Capacity</span>
                <strong>{battery.capacity}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{battery.status}</strong>
              </div>

            </div>

            <div className="battery-card-actions">

              <button
                className="secondary-btn"
                onClick={() => navigate("/passport")}
              >
                View Passport
              </button>

              <button
                className="secondary-btn"
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