import "./App.css";
import { useState, useEffect } from "react";

import StatCard from "./components/StatCard";
import SafetyRisk from "./components/SafetyRisk";
import DegradationChart from "./components/DegradationChart";
import PassportPreview from "./components/PassportPreview";
import DegradationFactors from "./components/DegradationFactors";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import DigitalPassport from "./pages/DigitalPassport";
import AnalyzeBattery from "./pages/AnalyzeBattery";
import MyBatteries from "./pages/MyBatteries";
function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [batteryData, setBatteryData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem("batteryData");

    if (savedData) {
      setBatteryData(JSON.parse(savedData));
    }
  }, []);

  // Default values before a battery is analyzed
  const data = batteryData || {
    vehicleName: "Tata Nexon EV",
    batteryId: "BX-2026-001",

    currentSOH: 87,
    averageTemperature: 32,
    maximumTemperature: 41,

    lifetimeCycles: 742,

    averageCellVoltageDelta: 26.4,
    maximumCellVoltageDelta: 51.2,

    averageSOC: 68.2,

    verificationStatus: "Verified",
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <h2 className="logo">
          ⚡ BatteryX
        </h2>

        <nav>

          <button
            className={`nav-item ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={() => navigate("/")}
          >
            Dashboard
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/batteries" ? "active" : ""
            }`}
            onClick={() => navigate("/batteries")}
          >
            My Batteries
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/analyze" ? "active" : ""
            }`}
            onClick={() => navigate("/analyze")}
          >
            Analysis
          </button>

          <button
            className={`nav-item ${
              location.pathname === "/passport" ? "active" : ""
            }`}
            onClick={() => navigate("/passport")}
          >
            Digital Passport
          </button>

        </nav>

      </aside>


      {/* Main content */}
      <main className="main-content">

        {/* Header */}
        <header className="header">

          <div>
            <h1>Battery Dashboard</h1>

            <p>
              {batteryData
                ? `Monitoring ${data.vehicleName}`
                : "Monitor your EV battery health and safety"}
            </p>
          </div>

          <button
            className="analyze-btn"
            onClick={() => navigate("/analyze")}
          >
            🔋 Analyze Battery
          </button>

        </header>


        {/* Statistics */}
        <section className="stats">

          <StatCard
            title="Battery Health"
            value={data.currentSOH}
            unit="%"
            status="Good"
          />

          <StatCard
            title="Safety Risk"
            value={
              data.maximumTemperature > 40 ||
              data.maximumCellVoltageDelta > 50
                ? "Medium"
                : "Low"
            }
            status={
              data.maximumTemperature > 40 ||
              data.maximumCellVoltageDelta > 50
                ? "Monitor"
                : "Safe"
            }
          />

          <StatCard
            title="Charging Cycles"
            value={data.lifetimeCycles}
            unit="Cycles"
          />

          <StatCard
            title="Average SOC"
            value={data.averageSOC}
            unit="%"
          />

        </section>


        {/* Battery Overview */}
        <section className="overview">

          <div className="panel">

            <h2>
              Battery Overview
            </h2>

            <div className="battery-circle">

              <span>
                {data.currentSOH}%
              </span>

              <small>
                Health
              </small>

            </div>

            <p>
              Battery health is currently{" "}
              <strong>
                {data.currentSOH >= 80 ? "Good" : "Needs Attention"}
              </strong>.
            </p>

          </div>


          {/* Quick Actions */}
          <div className="panel">

            <h2>
              Quick Actions
            </h2>

            <button
              className="action-btn"
              onClick={() => navigate("/analyze")}
            >
              🔋 Analyze Battery
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/analyze")}
            >
              📊 View Analysis
            </button>

            <button
              className="action-btn"
              onClick={() => navigate("/passport")}
            >
              🪪 View Passport
            </button>

          </div>

        </section>


        {/* Safety Risk + Degradation Analysis */}
        <div className="analysis-row">

          <SafetyRisk />

          <div>
            <DegradationChart />

            <DegradationFactors />
          </div>

        </div>


        {/* Second-Life Passport */}
        <PassportPreview />


        {/* Disclaimer */}
        <footer>

          <p>
            ⚠️ Battery health and safety results are estimates
            and do not replace certified battery testing.
          </p>

        </footer>

      </main>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Digital Passport */}
        <Route
          path="/passport"
          element={<DigitalPassport />}
        />
        <Route
          path="/analyze"
          element={<AnalyzeBattery />}
        />
        <Route
          path="/batteries"
          element={<MyBatteries />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;